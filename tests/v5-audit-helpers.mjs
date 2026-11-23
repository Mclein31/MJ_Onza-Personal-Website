// Helpers for tests/v5-audit.spec.mjs (Redesign v5 layout audit).
// The two page-side functions (scanViewport, checkReducedMotion) are serialised by Playwright, so they must stay
// self-contained: no imports, no references to anything outside their own body.

/**
 * Runs inside the page. Looks at what is in the viewport right now and returns raw findings.
 * @param {{touch: boolean}} opts
 */
export function scanViewport(opts) {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'META', 'LINK', 'HEAD', 'TITLE', 'BR', 'WBR', 'DEFS', 'CLIPPATH', 'MASK', 'SYMBOL', 'LINEARGRADIENT', 'RADIALGRADIENT', 'FILTER', 'PATTERN']);
  const csCache = new WeakMap();
  const cs = (el) => {
    let c = csCache.get(el);
    if (!c) { c = getComputedStyle(el); csCache.set(el, c); }
    return c;
  };

  const selOf = (el) => {
    const parts = [];
    let n = el;
    for (let i = 0; n && n.nodeType === 1 && n !== document.body && i < 4; i++, n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (n.id) { parts.unshift(`${s}#${n.id}`); break; }
      const c = [...n.classList].slice(0, 2).join('.');
      if (c) s += `.${c}`;
      parts.unshift(s);
    }
    return parts.join(' > ');
  };
  const ownText = (el) => {
    let t = '';
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
    return t.replace(/\s+/g, ' ').trim();
  };
  const snippet = (el) => {
    const t = ownText(el) || (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('alt') || el.getAttribute('src') || el.getAttribute('href'))) || '';
    return String(t).slice(0, 48);
  };

  // Effective opacity (product up the tree) and "decorative / not for users" flag, memoised.
  const stateCache = new WeakMap();
  const stateOf = (el) => {
    if (!el || el.nodeType !== 1) return { opacity: 1, hiddenA11y: false, none: false };
    let s = stateCache.get(el);
    if (s) return s;
    const p = stateOf(el.parentElement);
    const c = cs(el);
    s = {
      opacity: p.opacity * (parseFloat(c.opacity) || 0),
      hiddenA11y: p.hiddenA11y || el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('inert') || el.hasAttribute('hidden'),
      none: p.none || c.display === 'none' || (c.visibility !== 'visible' && c.visibility !== '')
        // content of a closed <details> (everything but its <summary>) is hidden by the UA's ::details-content slot
        || (el.parentElement?.tagName === 'DETAILS' && !el.parentElement.open && el.tagName !== 'SUMMARY'),
    };
    stateCache.set(el, s);
    return s;
  };

  const clips = (c) => /^(hidden|clip|scroll|auto)$/.test(c.overflowX) || /^(hidden|clip|scroll|auto)$/.test(c.overflowY)
    || /(paint|strict|content)/.test(c.contain || '');
  const clipsX = (c) => /^(hidden|clip|scroll|auto)$/.test(c.overflowX) || /(paint|strict|content)/.test(c.contain || '');
  const isPositioned = (c) => c.position !== 'static' || (c.transform && c.transform !== 'none') || (c.willChange || '').includes('transform');

  /** Clipping ancestors that really clip `el` (respects absolute/fixed containing blocks). html/body are skipped. */
  const clippers = (el) => {
    const out = [];
    let pos = cs(el).position;
    let a = el.parentElement;
    let reached = pos !== 'absolute' && pos !== 'fixed';
    while (a && a !== document.body && a !== document.documentElement) {
      const c = cs(a);
      if (pos === 'fixed') break;
      if (!reached && isPositioned(c)) reached = true;
      if (reached && clips(c)) out.push(a);
      // an ancestor that is itself fixed/absolute re-anchors the chain
      if (reached && (c.position === 'fixed')) break;
      a = a.parentElement;
    }
    return out;
  };

  const insideClipX = (el) => clippers(el).some((a) => clipsX(cs(a)));

  const intersect = (r, a) => {
    const l = Math.max(r.left, a.left), t = Math.max(r.top, a.top), rr = Math.min(r.right, a.right), b = Math.min(r.bottom, a.bottom);
    return rr > l && b > t ? { left: l, top: t, right: rr, bottom: b, width: rr - l, height: b - t } : null;
  };

  const rectOf = (el) => el.getBoundingClientRect();
  const inView = (r) => r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
  // visually-hidden helpers (.sr-only etc.): 1px box, clipped; their text spills outside the box but is never painted
  const isSrOnly = (el, r, c) => (r.width <= 2 && r.height <= 2 && /^(hidden|clip)$/.test(c.overflow)) || /^rect\(\s*0(px)?[ ,]+0(px)?[ ,]+0(px)?[ ,]+0(px)?\s*\)$/.test(c.clip) || /^inset\(\s*(50%|100%)/.test(c.clipPath);
  const R = (r) => ({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });

  const textRects = (el) => {
    const rects = [];
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.nodeValue.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (r.width >= 1 && r.height >= 1) rects.push(r);
    }
    return rects;
  };

  const paints = (el, c) => {
    if (/^(IMG|SVG|VIDEO|CANVAS|INPUT|TEXTAREA|SELECT|BUTTON|IFRAME|PICTURE)$/i.test(el.tagName)) return true;
    const bg = c.backgroundColor;
    if (bg && !/rgba?\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)/.test(bg) && bg !== 'transparent') return true;
    if (c.backgroundImage && c.backgroundImage !== 'none') return true;
    if (['Top', 'Right', 'Bottom', 'Left'].some((s) => parseFloat(c[`border${s}Width`]) > 0 && c[`border${s}Style`] !== 'none' && c[`border${s}Style`] !== 'hidden')) return true;
    return false;
  };

  const all = [...document.body.querySelectorAll('*')].filter((el) => !SKIP_TAGS.has(el.tagName.toUpperCase()) && !(el.closest('svg') && el.tagName.toLowerCase() !== 'svg'));

  // ------------------------------------------------------------------ 1. past the viewport edges
  const offenders = new Map();
  for (const el of all) {
    const st = stateOf(el);
    if (st.none || st.hiddenA11y || st.opacity < 0.05) continue;
    const c = cs(el);
    const r = rectOf(el);
    if (r.width < 1 || r.height < 1 || !inView(r)) continue;
    if (insideClipX(el) || isSrOnly(el, r, c)) continue;
    const boxes = [];
    if (paints(el, c)) boxes.push(['box', r]);
    const tr = ownText(el) ? textRects(el) : [];
    for (let t of tr) {
      if (clips(c)) t = intersect(t, r); // own overflow clip: text beyond the box is never painted
      if (t) boxes.push(['text', t]);
    }
    for (const [kind, b] of boxes) {
      const L = b.left, Rr = b.right;
      if ((L < -1 || Rr > vw + 1) && Rr > 0 && L < vw) {
        const prev = offenders.get(el);
        const amount = Math.round(Math.max(-L, Rr - vw));
        if (!prev || amount > prev.amount) offenders.set(el, { el, kind, amount, side: L < -1 ? 'left' : 'right', rect: R(b) });
      }
    }
  }
  const overflow = [];
  for (const [el, o] of offenders) {
    let a = el.parentElement, nested = false;
    while (a) { if (offenders.has(a)) { nested = true; break; } a = a.parentElement; }
    if (nested) continue;
    let kids = 0;
    for (const [other] of offenders) if (other !== el && el.contains(other)) kids++;
    overflow.push({ sel: selOf(el), text: snippet(el), detail: `${o.kind} extends ${o.amount}px past the ${o.side} edge (x=${o.rect.x}, w=${o.rect.w})${kids ? `, +${kids} descendants` : ''}` });
  }

  // ------------------------------------------------------------------ 2. overlapping text
  const items = [];
  const blockOf = (el) => {
    let n = el;
    while (n && n.parentElement) {
      const d = cs(n).display;
      if (d !== 'inline' && d !== 'contents') return n;
      n = n.parentElement;
    }
    return el;
  };
  const fixedAncestorOpaque = (el) => {
    let n = el;
    while (n && n !== document.body) {
      const c = cs(n);
      if (c.position === 'fixed' || c.position === 'sticky') {
        const m = /rgba?\(\s*\d+,\s*\d+,\s*\d+(?:,\s*([\d.]+))?\s*\)/.exec(c.backgroundColor || '');
        if (m && (m[1] === undefined || parseFloat(m[1]) > 0.85)) return true;
      }
      n = n.parentElement;
    }
    return false;
  };
  const inFixed = (el) => {
    let n = el;
    while (n && n !== document.body) { if (cs(n).position === 'fixed') return true; n = n.parentElement; }
    return false;
  };
  const outOfFlow = (el, anc) => {
    for (let n = el; n && n !== anc; n = n.parentElement) { const p = cs(n).position; if (p === 'absolute' || p === 'fixed') return true; }
    return false;
  };
  const atTop = window.scrollY <= 8;
  for (const el of all) {
    if (!ownText(el)) continue;
    const st = stateOf(el);
    if (st.none || st.hiddenA11y || st.opacity < 0.05) continue;
    const c = cs(el);
    if (c.visibility !== 'visible') continue;
    if (/^(OPTION|TEXTAREA|SELECT|INPUT)$/.test(el.tagName)) continue;
    if (isSrOnly(el, rectOf(el), c)) continue;
    const rects = [];
    // an element that clips its own overflow (line-clamp, ellipsis) hides the text beyond its box too
    const cl = (clips(c) ? [el] : []).concat(clippers(el));
    for (let r of textRects(el)) {
      for (const a of cl) { if (!r) break; r = intersect(r, rectOf(a)); }
      if (!r || r.width < 1 || r.height < 1 || !inView(r)) continue;
      // A text rect is the font's content box (ascent+descent), taller than the glyphs. Shrink it to roughly the
      // glyph body so tight display leading (line-height < 1) is not reported as overlap.
      const h = r.height;
      rects.push({ left: r.left, right: r.right, top: r.top + h * 0.2, bottom: r.bottom - h * 0.15, width: r.width, height: h * 0.65 });
    }
    if (rects.length) items.push({ el, rects, block: blockOf(el), fixedOpaque: fixedAncestorOpaque(el), fixed: inFixed(el) });
  }
  const overlaps = [];
  const seen = new Set();
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const A = items[i], B = items[j];
      if (A.block === B.block) continue;
      // inline-level child of the other (same text flow, tight leading), unless it is positioned out of the flow
      if (A.el.contains(B.el) && !outOfFlow(B.el, A.el)) continue;
      if (B.el.contains(A.el) && !outOfFlow(A.el, B.el)) continue;
      if ((A.fixedOpaque && !B.fixed) || (B.fixedOpaque && !A.fixed)) continue;
      // fixed chrome (nav, pills) passes over scrolling content by design: only judge it in the page-top composition
      if (!atTop && A.fixed !== B.fixed) continue;
      let hit = null;
      for (const ra of A.rects) {
        for (const rb of B.rects) {
          const x = intersect(ra, rb);
          if (!x) continue;
          const minH = Math.min(ra.height, rb.height);
          if (x.width > 3 && x.height > Math.max(3, minH * 0.25)) { hit = x; break; }
        }
        if (hit) break;
      }
      if (!hit) continue;
      const key = `${selOf(A.el)}|${selOf(B.el)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      overlaps.push({ sel: `${selOf(A.el)}  ×  ${selOf(B.el)}`, text: `"${snippet(A.el)}" × "${snippet(B.el)}"`, detail: `text boxes overlap by ${Math.round(hit.width)}×${Math.round(hit.height)}px at x=${Math.round(hit.left)}, y=${Math.round(hit.top)}` });
    }
  }

  // ------------------------------------------------------------------ 3. small touch targets
  const small = [];
  if (opts.touch) {
    const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=tab], [role=checkbox], [role=switch], [role=menuitem], [tabindex]:not([tabindex="-1"])';
    for (const el of document.body.querySelectorAll(sel)) {
      if (el.disabled || el.closest('svg')) continue;
      const st = stateOf(el);
      if (st.none || st.hiddenA11y || st.opacity < 0.05) continue;
      const c = cs(el);
      const r = rectOf(el);
      if (r.width < 1 || r.height < 1 || !inView(r)) continue;
      if (r.width <= 2 && r.height <= 2) continue; // visually-hidden helpers
      // WCAG 2.5.8 inline exception: a link that is a run of words inside a sentence
      if (c.display === 'inline' && el.tagName === 'A' && el.parentElement && ownText(el.parentElement).length > 0) continue;
      // clipped away by an ancestor? then it is not tappable
      let vis = r;
      for (const a of clippers(el)) { if (!vis) break; vis = intersect(vis, rectOf(a)); }
      if (!vis) continue;
      if (r.width < 24 || r.height < 24) small.push({ sel: selOf(el), text: snippet(el), detail: `${Math.round(r.width)}×${Math.round(r.height)}px target` });
    }
  }

  return {
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    clientWidth: vw,
    scrollY: Math.round(window.scrollY),
    docHeight: document.documentElement.scrollHeight,
    overflow, overlaps, small,
  };
}

/** Runs inside the page, with prefers-reduced-motion: reduce. Returns headings/paragraphs that are not readable. */
export function checkReducedMotion() {
  const csCache = new WeakMap();
  const cs = (el) => { let c = csCache.get(el); if (!c) { c = getComputedStyle(el); csCache.set(el, c); } return c; };
  const selOf = (el) => {
    const parts = [];
    let n = el;
    for (let i = 0; n && n.nodeType === 1 && n !== document.body && i < 4; i++, n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (n.id) { parts.unshift(`${s}#${n.id}`); break; }
      const c = [...n.classList].slice(0, 2).join('.');
      if (c) s += `.${c}`;
      parts.unshift(s);
    }
    return parts.join(' > ');
  };
  const clipsAny = (c) => /^(hidden|clip)$/.test(c.overflowX) || /^(hidden|clip)$/.test(c.overflowY) || /(paint|strict|content)/.test(c.contain || '');
  const isPositioned = (c) => c.position !== 'static' || (c.transform && c.transform !== 'none');
  const zeroClipPath = (cp) => {
    if (!cp || cp === 'none') return false;
    if (/circle\(\s*0(px|%)?\s*(at|\))/.test(cp)) return true;
    const m = /inset\(([^)]*)\)/.exec(cp);
    if (!m) return false;
    const v = m[1].split('round')[0].trim().split(/\s+/).map((s) => parseFloat(s));
    const [t, r = t, b = t, l = r] = v;
    const pct = /%/.test(m[1]);
    return pct ? (t + b >= 100 || l + r >= 100) : false;
  };

  const out = [];
  for (const el of document.body.querySelectorAll('h1,h2,h3,h4,h5,h6,p')) {
    if (!(el.textContent || '').trim()) continue;
    // not for users at all: skip
    let skip = false, opacity = 1, clipPathHidden = false;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const c = cs(n);
      if (c.display === 'none' || (c.visibility !== 'visible' && c.visibility !== '')) { skip = true; break; }
      if (n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('inert') || n.hasAttribute('hidden')) { skip = true; break; }
      if (n.tagName === 'DETAILS' && !n.open && n !== el) { skip = true; break; }
      if (n.tagName === 'NOSCRIPT' || n.tagName === 'TEMPLATE') { skip = true; break; }
      opacity *= parseFloat(c.opacity);
      if (zeroClipPath(c.clipPath)) clipPathHidden = true;
    }
    if (skip) continue;
    const r = el.getBoundingClientRect();
    const reasons = [];
    if (opacity < 0.05) reasons.push(`opacity ${opacity.toFixed(2)}`);
    if (clipPathHidden) reasons.push('clip-path hides it');
    if (r.width < 1 || r.height < 1) {
      const pr = el.parentElement && el.parentElement.getBoundingClientRect();
      if (pr && pr.width >= 1 && pr.height >= 1) reasons.push(`collapsed to ${Math.round(r.width)}×${Math.round(r.height)}px`);
    } else {
      // clipped away vertically by an overflow:hidden wrapper (mask reveal that never ran)
      let pos = cs(el).position, reached = pos !== 'absolute' && pos !== 'fixed';
      for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
        const c = cs(a);
        if (pos === 'fixed') break;
        if (!reached && isPositioned(c)) reached = true;
        if (!reached || !clipsAny(c)) continue;
        const ar = a.getBoundingClientRect();
        if (ar.height <= 2 || ar.width <= 2) continue; // collapsed accordion panels etc.
        const xo = Math.min(r.right, ar.right) - Math.max(r.left, ar.left);
        const yo = Math.min(r.bottom, ar.bottom) - Math.max(r.top, ar.top);
        if (xo > r.width * 0.5 && yo < r.height * 0.15) { reasons.push(`clipped away by ${selOf(a)} (only ${Math.max(0, Math.round(yo))}px of ${Math.round(r.height)}px inside)`); break; }
      }
    }
    if (reasons.length) out.push({ sel: selOf(el), text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48), detail: reasons.join('; ') });
  }
  return out;
}

/** Collects every image that is actually visible (rendered, not transparent, not clipped away) but has not loaded. Runs inside the page. */
export function checkImages() {
  const bad = [];
  const clipsAny = (c) => /^(hidden|clip|scroll|auto)$/.test(c.overflowX) || /^(hidden|clip|scroll|auto)$/.test(c.overflowY) || /(paint|strict|content)/.test(c.contain || '');
  for (const img of document.querySelectorAll('img')) {
    const c = getComputedStyle(img);
    if (c.display === 'none' || c.visibility === 'hidden') continue;
    let opacity = parseFloat(c.opacity), hidden = false;
    for (let n = img.parentElement; n && !hidden; n = n.parentElement) {
      const pc = getComputedStyle(n);
      if (pc.display === 'none' || pc.visibility === 'hidden' || n.hasAttribute('hidden') || n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('inert')) hidden = true;
      opacity *= parseFloat(pc.opacity);
    }
    if (hidden || opacity < 0.05) continue;
    const r = img.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    // fully clipped away by an overflow wrapper (e.g. a slide outside a carousel)? then nobody sees it
    let vis = r;
    const pos = c.position;
    for (let a = img.parentElement; a && a !== document.body && a !== document.documentElement && vis; a = a.parentElement) {
      if (pos === 'fixed') break;
      const ac = getComputedStyle(a);
      if (!clipsAny(ac)) continue;
      const ar = a.getBoundingClientRect();
      const l = Math.max(vis.left, ar.left), t = Math.max(vis.top, ar.top), rr = Math.min(vis.right, ar.right), b = Math.min(vis.bottom, ar.bottom);
      vis = rr - l > 1 && b - t > 1 ? { left: l, top: t, right: rr, bottom: b } : null;
    }
    if (!vis) continue;
    const src = img.currentSrc || img.getAttribute('src') || '';
    if (!src) { bad.push({ sel: img.outerHTML.slice(0, 80), text: '', detail: 'img without src' }); continue; }
    if (img.complete && img.naturalWidth > 0) continue;
    const svg = /\.svg(\?|#|$)/i.test(src) || src.startsWith('data:image/svg');
    bad.push({ sel: `img[src="${src.slice(-70)}"]`, text: img.getAttribute('alt') || '', detail: img.complete ? `broken: naturalWidth 0${svg ? ' (SVG without intrinsic size? check by eye)' : ''}` : `still loading${img.loading === 'lazy' ? ' (loading=lazy)' : ''}` });
  }
  return bad;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Turns the audited path into a folder name: "/" -> "root", "/prototypes/direction-a/" -> "prototypes-direction-a". */
export function slugOfPath(p) {
  const s = String(p).replace(/^https?:\/\/[^/]+/, '').replace(/[?#].*$/, '').replace(/index\.html$/, '').replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s || 'root';
}

/**
 * Scrolls the page top to bottom in small steps (so scroll-triggered reveals and pins fire), calls `onStep` after
 * each settle, then returns to the top. Returns the number of steps taken.
 */
export async function scrollThrough(page, onStep, { settleMs = 260 } = {}) {
  const vh = page.viewportSize().height;
  const step = Math.max(200, Math.round(vh * 0.6));
  let y = 0;
  let steps = 0;
  for (; steps < 500; steps++) {
    await page.evaluate((top) => window.scrollTo({ top, left: 0, behavior: 'instant' }), y);
    await page.waitForTimeout(settleMs);
    if (onStep) await onStep(steps);
    const { max, cur } = await page.evaluate(() => ({ max: document.documentElement.scrollHeight - window.innerHeight, cur: window.scrollY }));
    if (cur >= max - 2 || y >= max) break;
    y = Math.min(y + step, max);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  await page.waitForTimeout(700);
  return steps + 1;
}

/** Merges per-step scan findings into a map keyed by kind + selector, remembering where they were first seen. */
export function mergeFindings(store, kind, list, scrollY) {
  for (const f of list) {
    const key = `${kind}|${f.sel}|${f.text}`;
    if (!store.has(key)) store.set(key, { kind, ...f, scrollY, seen: 1 });
    else store.get(key).seen++;
  }
}

const take = (arr, n) => (arr.length > n ? [...arr.slice(0, n), `… and ${arr.length - n} more (see the .json file)`] : arr);

/** Builds the readable summary text for one viewport. `sections` is [{title, items:[{sel,text,detail,scrollY}], note}] */
export function formatSummary(header, sections) {
  const lines = [header, ''];
  let total = 0;
  for (const s of sections) {
    total += s.items.length;
    lines.push(`${s.items.length ? '✗' : '✓'} ${s.title}: ${s.items.length}${s.note ? `  (${s.note})` : ''}`);
    const rows = s.items.map((i) => `    - ${i.sel}${i.text ? `  "${i.text}"` : ''}\n        ${i.detail}${i.scrollY !== undefined ? ` [first seen at scrollY=${i.scrollY}]` : ''}`);
    lines.push(...take(rows, 25));
  }
  lines.push('', total ? `TOTAL: ${total} finding(s)` : 'TOTAL: clean');
  return lines.join('\n');
}
