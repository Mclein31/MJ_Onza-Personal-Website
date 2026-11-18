// Overlap check for the signal line (js/signal.js), run inside the page with page.evaluate(signalOverlaps).
//
// It reads what is actually rendered: every visible <path> inside svg.signal, sampled along its
// outline (and filled-area tests on a 5px grid), against every visible rectangle the line must not
// cover in the current viewport:
//   - each line box of text under <main> (text of 40px or more is display type and may sit over the line),
//   - images, video, canvas (not the hero ink layer), inline SVG icons,
//   - buttons, inputs, and chips/cards (boxes with a background or a border on three or more sides).
// Rectangles are clipped by overflow ancestors and skipped when they or an ancestor are invisible
// (display none, visibility hidden, opacity 0, or inside an inert pinned slide).
// Returns { paths, rects, overlaps: [{ what, x, y, w, h, hits }] } in viewport pixels.
export function signalOverlaps({ display = 40, grid = 5 } = {}) {
  const main = document.querySelector('main');
  const vw = innerWidth, vh = innerHeight;
  const cs = (el) => getComputedStyle(el);
  const alpha = (c) => {
    if (!c || c === 'transparent') return 0;
    const slash = c.lastIndexOf('/');
    if (slash > 0) return parseFloat(c.slice(slash + 1));
    if (c.startsWith('rgba')) return parseFloat(c.split(',')[3]);
    return 1;
  };
  const shown = new Map();
  const visible = (el) => {
    if (!el || el === main) return true;
    if (shown.has(el)) return shown.get(el);
    const s = cs(el);
    const v = !el.inert && s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05 && visible(el.parentElement);
    shown.set(el, v);
    return v;
  };
  const clip = (el) => {
    let r = { x: 0, y: 0, w: vw, h: vh };
    for (let p = el.parentElement; p && p !== main; p = p.parentElement) {
      const s = cs(p);
      if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
      const b = p.getBoundingClientRect();
      const x = Math.max(r.x, b.left), y = Math.max(r.y, b.top);
      r = { x, y, w: Math.min(r.x + r.w, b.right) - x, h: Math.min(r.y + r.h, b.bottom) - y };
    }
    return r;
  };
  const rects = [];
  const add = (b, el, what) => {
    const c = clip(el);
    const x = Math.max(b.left, c.x), y = Math.max(b.top, c.y);
    const w = Math.min(b.right, c.x + c.w) - x, h = Math.min(b.bottom, c.y + c.h) - y;
    if (w > 2 && h > 2) rects.push({ x, y, w, h, what });
  };
  const name = (el) => el.localName + (el.id ? `#${el.id}` : '') + (typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).join('.')}` : '');

  const media = new Set(['img', 'video', 'canvas', 'iframe', 'svg', 'input', 'textarea', 'select', 'button', 'picture']);
  for (const el of main.querySelectorAll('*')) {
    if (el instanceof SVGElement && el.localName !== 'svg') continue;
    if (el.closest('svg.signal') || el.hasAttribute('data-hero-ink') || el.parentElement === main) continue;
    const b = el.getBoundingClientRect();
    if (b.bottom < 0 || b.top > vh || b.width < 3 || b.height < 3 || b.width >= vw - 4) continue;
    if (!visible(el)) continue;
    const s = cs(el);
    let hit = media.has(el.localName);
    if (!hit && parseFloat(s.fontSize) < display) {
      const sides = ['Top', 'Right', 'Bottom', 'Left'].filter((k) => parseFloat(s[`border${k}Width`]) > 0 && alpha(s[`border${k}Color`]) > 0.04).length;
      hit = s.backgroundImage !== 'none' || alpha(s.backgroundColor) > 0.04 || sides >= 3;
    }
    if (hit) add(b, el, name(el));
  }
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!/\S/.test(n.data)) continue;
    const p = n.parentElement;
    if (!p || p.closest('svg') || !visible(p) || parseFloat(cs(p).fontSize) >= display) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.bottom < 0 || r.top > vh) continue;
      add(r, p, `text "${n.data.trim().slice(0, 32)}" in ${name(p)}`);
    }
  }

  // Rendered stroke
  const paths = [...document.querySelectorAll('svg.signal path')].filter((p) => {
    const d = p.getAttribute('d');
    if (!d || p.style.display === 'none' || !visible(p.closest('svg').parentElement)) return false;
    const b = p.getBoundingClientRect();
    return b.bottom > 0 && b.top < vh && b.width > 0;
  });
  const overlaps = new Map();
  const hit = (r, x, y) => {
    const o = overlaps.get(r) || { what: r.what, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h), hits: 0 };
    o.hits++;
    overlaps.set(r, o);
  };
  for (const path of paths) {
    const box = path.getBoundingClientRect();
    const near = rects.filter((r) => r.x < box.right && r.x + r.w > box.left && r.y < box.bottom && r.y + r.h > box.top);
    if (!near.length) continue;
    const m = path.getScreenCTM(), inv = m.inverse();
    const len = path.getTotalLength();
    for (let s = 0; s < len; s += 2) {
      const q = path.getPointAtLength(s), x = m.a * q.x + m.c * q.y + m.e, y = m.b * q.x + m.d * q.y + m.f;
      for (const r of near) if (x > r.x + 0.5 && x < r.x + r.w - 0.5 && y > r.y + 0.5 && y < r.y + r.h - 0.5) hit(r, x, y);
    }
    const pt = new DOMPoint();
    for (const r of near) {
      for (let y = r.y + 1; y < r.y + r.h - 1; y += grid) for (let x = r.x + 1; x < r.x + r.w - 1; x += grid) {
        if (x < box.left || x > box.right || y < box.top || y > box.bottom) continue;
        pt.x = inv.a * x + inv.c * y + inv.e; pt.y = inv.b * x + inv.d * y + inv.f;
        if (path.isPointInFill(pt)) hit(r, x, y);
      }
    }
  }
  return { paths: paths.length, rects: rects.length, overlaps: [...overlaps.values()] };
}
