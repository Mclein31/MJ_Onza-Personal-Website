// The signal line: one red brush stroke from the hero's full stop down to the contact form,
// painted as the visitor scrolls.
//
// Geometry (built on resize / load / font load only, never per frame):
// 1. Measure every text line, image, control and card in <main> (layout positions, with reveal
//    and pin transforms taken out). Big display type (h1, section headings, numerals, the ticker)
//    is not an obstacle: the line may pass behind it.
// 2. Route the line through the free space with a top-to-bottom shortest path on a coarse grid
//    (cost rises near content, side hints on [data-signal-anchor] pull it across the page), then
//    simplify it to a few points and fit long Catmull-Rom curves through them.
// 3. Give it a brush profile: width swells through curves, tapers to a point at both ends,
//    edges wobble a little, a few dry-brush streaks show the paper through. The width never
//    exceeds the clearance to the nearest content, so tight gaps squeeze the stroke instead of
//    letting it cover anything. Outlines are filled polygons cut into static pieces.
// 4. Pinned stages (Work deck, Journey years) get a loop in their background, drawn and turned
//    by the stage's own scroll progress; it joins where the line enters the stage to where it
//    leaves, so the stroke is never cut.
//
// Per frame: binary searches, a few display toggles and one rebuilt outline for the drawn tip
// (plus one for a pinned stage that is on screen). No layout reads.
//
// Layering: each section in <main> (and each pinned stage) gets its own <svg class="signal"> at
// z-index -1 inside an isolated stacking context: above the background, under the content.
import { $, $$, clamp, reducedMotion } from './util.js';

const NS = 'http://www.w3.org/2000/svg';
const HEAD = 0.62;          // the drawn tip rides this far down the viewport
const STEP = 3;             // outline sample spacing along the curve (px)
const CHUNK = 420;          // static outline pieces (px of curve)
const DISPLAY = 40;         // text this large is display type: the line may pass behind it
const TURN = Math.PI * 1.6; // how far a stage loop turns over its pin
const INK_LIFE = 1100;      // ms for a cursor stroke to dry out
const BLOCK = 400;          // routing cost of a cell inside content
const hoverFine = matchMedia('(hover: hover) and (pointer: fine)');

const f = (n) => Math.round(n * 10) / 10;
const smooth = (t) => t * t * (3 - 2 * t);

// Deterministic smooth 1D value noise in [-1, 1]
function noise(seed) {
  let s = seed;
  const t = new Float32Array(256);
  for (let i = 0; i < 256; i++) { s = (s * 1664525 + 1013904223) >>> 0; t[i] = s / 2147483648 - 1; }
  return (x) => { const i = Math.floor(x), u = x - i, a = t[i & 255], b = t[(i + 1) & 255]; return a + (b - a) * u * u * (3 - 2 * u); };
}
const nWide = noise(7), nFine = noise(73), nLeft = noise(19), nRight = noise(41);
function random(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

// '#ff2d1f' or 'rgb(255, 45, 31)' → [255, 45, 31]
function toRGB(str) {
  const s = str.trim();
  if (/^#[\da-f]{6}$/i.test(s)) return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const m = s.match(/[\d.]+/g);
  return m && m.length >= 3 ? m.slice(0, 3).map(Number) : null;
}
function alpha(c) {
  if (!c || c === 'transparent') return 0;
  const slash = c.lastIndexOf('/');
  if (slash > 0) return parseFloat(c.slice(slash + 1)) * (c.includes('%', slash) ? 0.01 : 1);
  if (c.startsWith('rgba')) return parseFloat(c.split(',')[3]);
  return 1;
}
function translation(t) {
  if (!t || t === 'none') return null;
  const m = t.slice(t.indexOf('(') + 1).split(',').map(parseFloat);
  return t.startsWith('matrix3d') ? [m[12], m[13]] : [m[4], m[5]];
}
const meet = (a, b) => {
  if (!a) return b;
  const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
  return { x, y, w: Math.max(0, Math.min(a.x + a.w, b.x + b.w) - x), h: Math.max(0, Math.min(a.y + a.h, b.y + b.h) - y) };
};

// ---------- measuring ----------
// Every box the line must not cover, in untransformed viewport space, tagged with the pinned
// stage it belongs to (-1 for the normal flow) and whether it rides the Work track.
function measure(main, stageEls, track) {
  const styles = new Map(), shifts = new Map(), clips = new Map();
  const cs = (el) => { let s = styles.get(el); if (!s) styles.set(el, (s = getComputedStyle(el))); return s; };
  const shift = (el) => {
    if (!el || el === main) return [0, 0];
    let v = shifts.get(el);
    if (!v) {
      const base = shift(el.parentElement), own = translation(cs(el).transform);
      v = own ? [base[0] + own[0], base[1] + own[1]] : base;
      shifts.set(el, v);
    }
    return v;
  };
  const box = (el) => { const r = el.getBoundingClientRect(), [dx, dy] = shift(el); return { x: r.left - dx, y: r.top - dy, w: r.width, h: r.height }; };
  const clipOf = (el) => {
    const p = el.parentElement;
    if (!p || p === main || stageEls.includes(p)) return null;
    if (clips.has(el)) return clips.get(el);
    let c = clipOf(p);
    const s = cs(p);
    if (s.overflowX !== 'visible' || s.overflowY !== 'visible') c = meet(c, box(p));
    clips.set(el, c);
    return c;
  };
  const out = [];
  const push = (r, el, clip) => {
    const c = clip ? meet(r, clip) : r;
    if (c.w < 2 || c.h < 2) return;
    const stage = stageEls.findIndex((s) => s.contains(el));
    out.push({ x: c.x, y: c.y, w: c.w, h: c.h, stage, moving: !!track && stage >= 0 && track.contains(el) });
  };

  const media = new Set(['img', 'video', 'canvas', 'iframe', 'svg', 'input', 'textarea', 'select', 'button', 'picture']);
  for (const el of main.querySelectorAll('*')) {
    if (el instanceof SVGElement && el.localName !== 'svg') continue;
    if (el.classList.contains('signal') || el.hasAttribute('data-hero-ink') || el.parentElement === main || stageEls.includes(el)) continue;
    const s = cs(el);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    let hit = media.has(el.localName);
    if (!hit && parseFloat(s.fontSize) < DISPLAY) {
      const sides = ['Top', 'Right', 'Bottom', 'Left'].filter((k) => parseFloat(s[`border${k}Width`]) > 0 && alpha(s[`border${k}Color`]) > 0.04).length;
      hit = s.backgroundImage !== 'none' || alpha(s.backgroundColor) > 0.04 || sides >= 3 || s.boxShadow !== 'none';
    }
    if (!hit) continue;
    const r = box(el);
    if (r.w >= innerWidth - 4) continue; // full-bleed backgrounds are the page, not content
    push(r, el, clipOf(el));
  }

  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!/\S/.test(n.data)) continue;
    const p = n.parentElement;
    if (!p || p.closest('svg')) continue;
    const s = cs(p);
    if (s.visibility === 'hidden' || parseFloat(s.fontSize) >= DISPLAY) continue;
    const [dx, dy] = shift(p);
    let clip = clipOf(p);
    if (s.overflowX !== 'visible' || s.overflowY !== 'visible') clip = meet(clip, box(p));
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) push({ x: r.left - dx, y: r.top - dy, w: r.width, h: r.height }, p, clip);
  }
  return { rects: out, box };
}

// ---------- clearance ----------
// Rects bucketed by y so "how far is the nearest content" stays cheap
function rectSet(rects, vw) {
  const BIN = 256, bins = new Map();
  for (const r of rects) {
    for (let b = Math.floor(r.y / BIN), e = Math.floor((r.y + r.h) / BIN); b <= e; b++) {
      let list = bins.get(b);
      if (!list) bins.set(b, (list = []));
      list.push(r);
    }
  }
  return (x, y, max) => {
    let d = Math.min(max, x, vw - x);
    for (let b = Math.floor((y - d) / BIN), e = Math.floor((y + d) / BIN); b <= e; b++) {
      const list = bins.get(b);
      if (!list) continue;
      for (const r of list) {
        const dx = Math.max(r.x - x, 0, x - r.x - r.w), dy = Math.max(r.y - y, 0, y - r.y - r.h);
        if (dx < d && dy < d) d = Math.min(d, Math.hypot(dx, dy));
      }
    }
    return Math.max(0, d);
  };
}

// ---------- curves ----------
// Douglas-Peucker over raw route points
function simplify(pts, eps) {
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const A = pts[a], B = pts[b], dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
    let worst = 0, at = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((pts[i].x - A.x) * dy - (pts[i].y - A.y) * dx) / L;
      if (d > worst) { worst = d; at = i; }
    }
    if (worst > eps) { keep[at] = 1; stack.push([a, at], [at, b]); }
  }
  // Long spans make Catmull-Rom tangents overshoot: keep the kept points at most ~260px apart
  let lastKept = 0;
  for (let i = 1; i < pts.length; i++) {
    if (!keep[i] && !pts[i].pin) continue;
    const span = Math.hypot(pts[i].x - pts[lastKept].x, pts[i].y - pts[lastKept].y), parts = Math.ceil(span / 260);
    for (let k = 1; k < parts; k++) keep[lastKept + Math.round(((i - lastKept) * k) / parts)] = 1;
    lastKept = i;
  }
  return pts.filter((_, i) => keep[i] || pts[i].pin);
}

// Corner cutting (Chaikin): rounds every corner as far as its two edges allow, so long spans give
// long, easy curves. Fixed points (ends, junction stubs, corners that must stay tight) are kept.
function chaikin(P, rounds = 5) {
  for (let k = 0; k < rounds; k++) {
    const out = [P[0]];
    for (let i = 1; i < P.length - 1; i++) {
      const u = P[i - 1], v = P[i], w = P[i + 1];
      if (v.fix) { out.push(v); continue; }
      out.push({ x: v.x + (u.x - v.x) * 0.25, y: v.y + (u.y - v.y) * 0.25, src: v.src }, { x: v.x + (w.x - v.x) * 0.25, y: v.y + (w.y - v.y) * 0.25, src: v.src });
    }
    out.push(P[P.length - 1]);
    P = out;
  }
  return resample(P.flatMap((p) => [p.x, p.y]));
}

// Centripetal Catmull-Rom through P (P[0] and P[last] are phantoms), resampled every STEP px
function spline(P) {
  const dense = [P[1].x, P[1].y];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const t01 = Math.max(1e-3, Math.hypot(p1.x - p0.x, p1.y - p0.y) ** 0.5);
    const t12 = Math.max(1e-3, Math.hypot(p2.x - p1.x, p2.y - p1.y) ** 0.5);
    const t23 = Math.max(1e-3, Math.hypot(p3.x - p2.x, p3.y - p2.y) ** 0.5);
    const m1x = p2.x - p1.x + t12 * ((p1.x - p0.x) / t01 - (p2.x - p0.x) / (t01 + t12));
    const m1y = p2.y - p1.y + t12 * ((p1.y - p0.y) / t01 - (p2.y - p0.y) / (t01 + t12));
    const m2x = p2.x - p1.x + t12 * ((p3.x - p2.x) / t23 - (p3.x - p1.x) / (t12 + t23));
    const m2y = p2.y - p1.y + t12 * ((p3.y - p2.y) / t23 - (p3.y - p1.y) / (t12 + t23));
    const n = Math.max(2, Math.ceil(t12 * t12 / 1.5));
    for (let j = 1; j <= n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
      dense.push(h00 * p1.x + h10 * m1x + h01 * p2.x + h11 * m2x, h00 * p1.y + h10 * m1y + h01 * p2.y + h11 * m2y);
    }
  }
  return resample(dense);
}
function resample(dense) {
  const xs = [dense[0]], ys = [dense[1]];
  let carry = 0;
  for (let i = 2; i < dense.length; i += 2) {
    const ax = dense[i - 2], ay = dense[i - 1], bx = dense[i], by = dense[i + 1];
    const L = Math.hypot(bx - ax, by - ay);
    let s = STEP - carry;
    while (s <= L) { const t = s / L; xs.push(ax + (bx - ax) * t); ys.push(ay + (by - ay) * t); s += STEP; }
    carry = L - (s - STEP);
  }
  const lx = dense[dense.length - 2], ly = dense[dense.length - 1];
  if (Math.hypot(lx - xs[xs.length - 1], ly - ys[ys.length - 1]) > 0.2) { xs.push(lx); ys.push(ly); }
  return { xs: Float32Array.from(xs), ys: Float32Array.from(ys) };
}

// Brush half-width along a sampled curve: swell in curves, wobble, taper, junction blends, caps
function profile(xs, ys, caps, hwBase, s0, ends) {
  const n = xs.length, hw = new Float32Array(n), k = new Float32Array(n);
  for (let i = 1; i < n - 1; i++) {
    const a1 = Math.atan2(ys[i] - ys[i - 1], xs[i] - xs[i - 1]), a2 = Math.atan2(ys[i + 1] - ys[i], xs[i + 1] - xs[i]);
    let d = a2 - a1;
    d -= Math.round(d / (2 * Math.PI)) * 2 * Math.PI;
    k[i] = Math.abs(d) / STEP;
  }
  const r = Math.max(2, Math.round(hwBase * 3 / STEP)), tmp = new Float32Array(n);
  for (let pass = 0; pass < 2; pass++) {
    let acc = 0;
    for (let i = 0; i < n + r; i++) {
      if (i < n) acc += k[i];
      if (i - 2 * r - 1 >= 0) acc -= k[i - 2 * r - 1];
      const c = i - r;
      if (c >= 0 && c < n) tmp[c] = acc / (Math.min(n - 1, c + r) - Math.max(0, c - r) + 1);
    }
    k.set(tmp);
  }
  const L = (n - 1) * STEP, tIn = hwBase * 11, tOut = hwBase * 15, blend = hwBase * 5;
  for (let i = 0; i < n; i++) {
    const s = i * STEP, g = s0 + s;
    let w = hwBase * (0.8 + 0.5 * smooth(clamp(k[i] * hwBase * 9, 0, 1))) * (1 + 0.1 * nWide(g / 170) + 0.04 * nFine(g / 47));
    if (ends.taperIn && s < tIn) w *= Math.sin((s / tIn) * Math.PI / 2) ** 0.85;
    if (ends.taperOut && L - s < tOut) w *= Math.sin(((L - s) / tOut) * Math.PI / 2) ** 0.7;
    if (ends.joinIn != null && s < blend) w = ends.joinIn + (w - ends.joinIn) * smooth(s / blend);
    if (ends.joinOut != null && L - s < blend) w = ends.joinOut + (w - ends.joinOut) * smooth((L - s) / blend);
    hw[i] = Math.max(0.5, Math.min(w, caps ? caps[i] : w));
  }
  return hw;
}

// Dry-brush streaks: thin gaps that let the paper through, denser toward the tail
function streaks(len, hwBase, seed, tail) {
  const out = [], rnd = random(seed);
  if (hwBase < 6) return out;
  const add = (s0, s1, o, t) => {
    if (s1 - s0 < 12 || Math.floor(s0 / CHUNK) !== Math.floor((s1 - 1e-3) / CHUNK)) return;
    out.push({ s0, s1, o, t });
  };
  for (let s = hwBase * 16 + rnd() * 200; s < len - hwBase * 20; s += 140 + rnd() * 320) {
    add(s, s + 30 + rnd() * 120, (rnd() * 2 - 1) * 0.55, 0.6 + rnd() * 0.9);
  }
  if (tail) {
    const t0 = Math.max(0, len - hwBase * 22);
    for (let i = 0; i < 5; i++) add(t0 + rnd() * hwBase * 10, len - hwBase * (1 + rnd() * 3), (i / 4 - 0.5) * 1.2 + (rnd() - 0.5) * 0.15, 0.8 + rnd());
  }
  return out;
}

// Filled outline of a sampled curve between arc lengths a and b ("M…Z" polygons, nonzero fill).
// tip: round the end off like a brush still moving.
function outline(P, a, b, tip) {
  const { xs, ys, hw } = P, n = xs.length, tipLen = P.tip;
  a = Math.max(0, a); b = Math.min((n - 1) * STEP, b);
  if (b - a < 0.5) return '';
  const i0 = Math.floor(a / STEP), i1 = Math.min(n - 1, Math.ceil(b / STEP));
  const Lp = [], Rp = [];
  let ex = 0, ey = 0, etx = 0, ety = 0, ew = 0;
  for (let i = i0; i <= i1; i++) {
    let s = i * STEP, x = xs[i], y = ys[i], w = hw[i];
    if (i === i1 && s > b) {
      const t = (b - (i - 1) * STEP) / STEP;
      x = xs[i - 1] + (x - xs[i - 1]) * t; y = ys[i - 1] + (y - ys[i - 1]) * t; w = hw[i - 1] + (w - hw[i - 1]) * t; s = b;
    }
    const j = Math.min(n - 1, i + 1), h = Math.max(0, i - 1);
    let tx = xs[j] - xs[h], ty = ys[j] - ys[h];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    if (tip && b - s < tipLen) w *= 0.42 + 0.58 * Math.sqrt(Math.max(0, b - s) / tipLen);
    const g = P.s0 + s, jit = Math.min(1, w / 6);
    const wl = w * (1 + 0.05 * nLeft(g / 16)) + 0.4 * jit * nLeft(g / 7 + 50);
    const wr = w * (1 + 0.05 * nRight(g / 16)) + 0.4 * jit * nRight(g / 7 + 50);
    Lp.push(f(x - ty * wl), f(y + tx * wl));
    Rp.push(f(x + ty * wr), f(y - tx * wr));
    ex = x; ey = y; etx = tx; ety = ty; ew = w;
  }
  let d = `M${Lp[0]} ${Lp[1]}`;
  for (let i = 2; i < Lp.length; i += 2) d += `L${Lp[i]} ${Lp[i + 1]}`;
  if (tip) {
    for (let k = 1; k < 6; k++) {
      const t = (k / 6) * Math.PI, c = Math.cos(t), s = Math.sin(t);
      d += `L${f(ex - ety * ew * c + etx * ew * s)} ${f(ey + etx * ew * c + ety * ew * s)}`;
    }
  }
  for (let i = Rp.length - 2; i >= 0; i -= 2) d += `L${Rp[i]} ${Rp[i + 1]}`;
  d += 'Z';
  // Streaks wind the other way, so they cut holes through this fill only
  const lim = tip ? b - tipLen * 1.5 : b;
  for (const st of P.streaks || []) {
    if (st.s0 < a || st.s1 > lim) continue;
    const A = [], B = [];
    for (let s = st.s0; s <= st.s1; s += STEP) {
      const i = Math.min(n - 2, Math.floor(s / STEP)), x = xs[i], y = ys[i];
      let tx = xs[i + 1] - x, ty = ys[i + 1] - y;
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const u = (s - st.s0) / (st.s1 - st.s0), off = st.o * hw[i], th = st.t * Math.sin(Math.PI * u) ** 0.6 * Math.min(1, hw[i] / 8);
      A.push(f(x - ty * (off + th)), f(y + tx * (off + th)));
      B.push(f(x - ty * (off - th)), f(y + tx * (off - th)));
    }
    if (A.length < 4) continue;
    d += `M${B[0]} ${B[1]}`;
    for (let i = 2; i < B.length; i += 2) d += `L${B[i]} ${B[i + 1]}`;
    for (let i = A.length - 2; i >= 0; i -= 2) d += `L${A[i]} ${A[i + 1]}`;
    d += 'Z';
  }
  return d;
}

// Drawn length when the tip is at y (prefix max keeps it monotonic where the curve climbs)
function lengthAtY(P, y) {
  const { my } = P, n = my.length;
  if (y <= my[0]) return 0;
  if (y >= my[n - 1]) return (n - 1) * STEP;
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (my[m] <= y) lo = m; else hi = m; }
  const span = my[hi] - my[lo];
  return (lo + (span > 0 ? (y - my[lo]) / span : 0)) * STEP;
}
function finish(P) {
  const n = P.xs.length, my = new Float32Array(n);
  for (let i = 0; i < n; i++) my[i] = i ? Math.max(my[i - 1], P.ys[i]) : P.ys[i];
  P.my = my;
  P.len = (n - 1) * STEP;
  return P;
}

export function initSignal() {
  const main = $('main');
  if (!main) return;
  const hero = $('.hero');
  const canvas = $('[data-hero-ink]');
  const ctx = canvas?.getContext('2d');

  let runs = [], stages = [], hosts = [], vh = innerHeight, still = reducedMotion.matches;
  let head = null, startY = 0, last = 0, raf = 0, readyAt = hero ? Infinity : 0, sy = scrollY;

  // ---------- geometry (resize only) ----------
  function build() {
    still = reducedMotion.matches;
    const vw = document.documentElement.clientWidth;
    vh = innerHeight;
    const narrow = vw < 861;
    const hwBase = narrow ? clamp(vw * 0.011, 3.2, 6.5) : clamp(vw * 0.0115, 7, 17);
    const pad = narrow ? 2.5 : 6, hwMin = narrow ? 2 : 3.5;
    const csx = narrow ? 4 : vw < 1100 ? 8 : 12, csy = narrow ? 8 : 12;

    // ----- reads -----
    const ys0 = scrollY;
    const work = $('.work.is-pinned [data-work-pin]'), years = $('[data-years].is-pinned');
    const stageDefs = [];
    if (work) stageDefs.push({ wrap: work, el: $('.work__sticky', work), track: $('[data-work-track]', work) });
    if (years) stageDefs.push({ wrap: years, el: $('.years__sticky', years) });
    const stageEls = stageDefs.map((s) => s.el);
    const { rects, box } = measure(main, stageEls, stageDefs[0]?.track);
    const navRects = [...($('.nav')?.children || []), $('.stats')].filter(Boolean).map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0).map((r) => ({ x: r.left, y: r.top, w: r.width, h: r.height }));
    for (const st of stageDefs) {
      const r = box(st.el);
      st.x = r.x; st.y = r.y;
      st.top = st.wrap.getBoundingClientRect().top + ys0;
      st.wrapH = st.wrap.offsetHeight;
      st.H = st.el.offsetHeight;
      st.dH = 0;
      const list = $('.years__list', st.el);
      if (list?.style.getPropertyValue('--year-content')) {
        // Phones size the year frame to the slide on show: the stage ends at the last slide's height
        const lastSlide = $$('.yr', list).pop();
        const h = Math.ceil(Math.max(...[...lastSlide.children].map((c) => c.offsetTop + c.offsetHeight)));
        st.dH = h - list.offsetHeight;
        st.list = box(list);
      }
      st.travel = st.track ? st.wrapH - vh : 0;
    }
    const anchorBox = (a) => { const r = box(a); return { x: r.x + r.w / 2, y: r.y + r.h / 2 + ys0 }; };
    const allAnchors = $$('[data-signal-anchor]').filter((a) => a.offsetParent);
    const startEl = $('.hero__period [data-signal-anchor]') || allAnchors[0];
    const endEl = allAnchors[allAnchors.length - 1];
    const heroBox = hero && canvas ? { x: 0, y: hero.getBoundingClientRect().top + ys0, cw: hero.offsetWidth, ch: hero.offsetHeight } : null;
    const rootStyle = getComputedStyle(document.documentElement);
    const gutter = parseFloat(rootStyle.getPropertyValue('--gutter')) || 16;
    const column = Math.min(vw - 2 * gutter, parseFloat(rootStyle.getPropertyValue('--wrap')) || 1200);
    const margin = (vw - column) / 2;
    const soft = narrow ? [] : allAnchors.filter((a) => a.dataset.signalSide && a !== endEl).map((a) => {
      const p = anchorBox(a);
      return { y: p.y, x: a.dataset.signalSide === 'left' ? margin / 2 : vw - margin / 2 };
    });
    const start = startEl ? anchorBox(startEl) : null, end = endEl ? anchorBox(endEl) : null;

    runs = []; stages = [];
    if (start && end && end.y > start.y + 100) plan();

    // ----- route and shape -----
    function plan() {
      // Virtual space: each pinned stage counts only its own height (its pin travel is cut out)
      stageDefs.sort((a, b) => a.top - b.top);
      let cut = 0;
      for (const st of stageDefs) {
        st.vTop = st.top - cut;
        st.Hf = st.H + st.dH;
        st.D = st.wrapH - st.Hf;
        cut += st.D;
      }
      const toV = (y) => { let c = 0; for (const st of stageDefs) if (y >= st.top + st.wrapH - 1) c += st.D; return y - c; };
      const docV = [], stageU = stageDefs.map(() => []), stageO = stageDefs.map(() => []);
      for (const r of rects) {
        if (r.stage < 0) { docV.push({ x: r.x, y: toV(r.y + ys0), w: r.w, h: r.h }); continue; }
        const st = stageDefs[r.stage], x = r.x - st.x, y = r.y - st.y + st.vTop;
        if (r.moving) {
          // The deck slides left by its travel: everything it sweeps is taken while pinned
          stageU[r.stage].push({ x: x - st.travel, y, w: r.w + st.travel, h: r.h });
          stageO[r.stage].push({ x: x - st.travel, y, w: r.w, h: r.h });
        } else {
          stageU[r.stage].push({ x, y, w: r.w, h: r.h });
          stageO[r.stage].push({ x, y, w: r.w, h: r.h });
          // The year frame grows to the last slide on phones: the foot moves with it
          if (st.dH && st.list && r.y >= st.list.y + st.list.h - 1) stageO[r.stage].push({ x, y: y + st.dH, w: r.w, h: r.h });
        }
      }
      stageDefs.forEach((st, i) => {
        for (const n of navRects) { const o = { x: n.x, y: n.y + st.vTop, w: n.w, h: n.h }; stageU[i].push(o); stageO[i].push(o); }
      });

      // Grid over virtual space from the start to the end anchor
      const y0 = start.y, vEnd = toV(end.y);
      const cols = Math.ceil(vw / csx), rows = Math.max(2, Math.round((vEnd - y0) / csy) + 1);
      const rowY = (r) => y0 + r * csy, colX = (c) => (c + 0.5) * csx;
      const rowOf = (y) => clamp(Math.round((y - y0) / csy), 0, rows - 1);
      const occ = new Uint8Array(rows * cols);
      const mark = (list, rLo = 0, rHi = rows - 1) => {
        for (const r of list) {
          const a = Math.max(rLo, Math.ceil((r.y - pad - y0) / csy - 0.5)), b = Math.min(rHi, Math.floor((r.y + r.h + pad - y0) / csy + 0.5));
          const c0 = Math.max(0, Math.floor((r.x - pad) / csx)), c1 = Math.min(cols - 1, Math.floor((r.x + r.w + pad) / csx));
          for (let row = a; row <= b; row++) occ.fill(1, row * cols + c0, row * cols + c1 + 1);
        }
      };
      const dist = new Float32Array(rows * cols);
      const edt = () => {
        const dg = Math.hypot(csx, csy);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          dist[i] = occ[i] ? 0 : Math.min(colX(c), vw - colX(c));
        }
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          let d = dist[i];
          if (c > 0) d = Math.min(d, dist[i - 1] + csx);
          if (r > 0) {
            d = Math.min(d, dist[i - cols] + csy);
            if (c > 0) d = Math.min(d, dist[i - cols - 1] + dg);
            if (c < cols - 1) d = Math.min(d, dist[i - cols + 1] + dg);
          }
          dist[i] = d;
        }
        for (let r = rows - 1; r >= 0; r--) for (let c = cols - 1; c >= 0; c--) {
          const i = r * cols + c;
          let d = dist[i];
          if (c < cols - 1) d = Math.min(d, dist[i + 1] + csx);
          if (r < rows - 1) {
            d = Math.min(d, dist[i + cols] + csy);
            if (c > 0) d = Math.min(d, dist[i + cols - 1] + dg);
            if (c < cols - 1) d = Math.min(d, dist[i + cols + 1] + dg);
          }
          dist[i] = d;
        }
      };
      mark(docV);
      stageDefs.forEach((st, i) => mark(stageU[i], rowOf(st.vTop), rowOf(st.vTop + st.Hf)));
      edt();

      // A loop in each stage: the roomiest spot the stage never covers, below the nav. The EDT
      // certifies a disc; free cells along the same row stretch it into a flat ellipse.
      const forced = new Map(), locked = new Set();
      const navBottom = Math.max(0, ...navRects.filter((n) => n.y < vh / 2).map((n) => n.y + n.h));
      const reach = (r, c, need, dir) => { let k = c; while (k + dir >= 0 && k + dir < cols && dist[r * cols + k + dir] >= need) k += dir; return Math.abs(k - c) * csx; };
      for (const st of stageDefs) {
        const rTop = rowOf(st.vTop), rBot = rowOf(st.vTop + st.Hf);
        let best = -Infinity, bc = cols >> 1, br = (rTop + rBot) >> 1, bry = 0, brx = 0;
        for (let r = rTop + 2; r < rBot - 2; r++) {
          const yl = rowY(r) - st.vTop;
          for (let c = 1; c < cols - 1; c++) {
            const ry = Math.min(dist[r * cols + c], yl - navBottom - 4, st.Hf - yl - 8);
            if (ry < hwBase * 1.5) continue;
            const rx = Math.min(ry * 3, ry * 0.75 + Math.min(reach(r, c, ry * 0.75, -1), reach(r, c, ry * 0.75, 1)));
            const score = Math.sqrt(rx * ry) - Math.abs(colX(c) / vw - 0.5) * 8;
            if (score > best) { best = score; bc = c; br = r; bry = ry; brx = rx; }
          }
        }
        const hwL = clamp(bry * 0.14, hwMin, hwBase * 0.85);
        const rho = Math.max(csy, Math.floor((bry - hwL - pad) / csy) * csy);
        const ry = Math.max(0, (bry - hwL - pad) * 0.74), rx = Math.max(ry, (brx - hwL - pad) * 0.74);
        st.loop = { cx: colX(bc), cy: rowY(br) - st.vTop, rho, rx, ry, hw: hwL, ok: ry >= hwL * 1.8 };
        st.rIn = br - rho / csy; st.rOut = br + rho / csy; st.col = bc;
        for (let r = st.rIn; r <= st.rOut; r++) forced.set(r, bc);
        for (const r of [rTop - 1, rTop, rTop + 1, rBot - 1, rBot, rBot + 1, st.rIn - 1, st.rIn, st.rOut + 1, st.rOut + 2]) locked.add(r);
        // Below the loop the deck has stopped: route around its final layout only
        occ.fill(0, (br + 1) * cols, (rBot + 1) * cols);
        mark(stageO[stageDefs.indexOf(st)], br + 1, rBot);
        mark(docV, br + 1, rBot);
      }
      if (stageDefs.length) edt();

      // Cell costs
      // Full width fits from `comf` on; more room still helps a little (keeps it centred in a lane)
      const comf = hwBase + pad, want = hwBase * 2.6 + pad;
      const cost = new Float32Array(rows * cols);
      for (let i = 0; i < cost.length; i++) {
        const d = dist[i];
        cost[i] = occ[i] || d < hwMin ? BLOCK
          : d < comf ? 3 + 30 * ((comf - d) / comf) ** 1.5
          : d < want ? 1 + 0.6 * (want - d) / (want - comf) : 1;
      }
      const pull = new Map();
      for (const a of soft) {
        const ra = rowOf(toV(a.y));
        for (let r = ra - 8; r <= ra + 8; r++) pull.set(r, a.x);
      }

      // Top-to-bottom shortest path; K caps the sideways reach per row
      const K = narrow ? 24 : Math.ceil(480 / csx);
      const stepLen = Float32Array.from({ length: K + 1 }, (_, d) => Math.hypot(d * csx, csy) / csy + d * csx * 0.004);
      const par = new Int16Array(rows * cols);
      let prev = new Float64Array(cols).fill(Infinity), cur = new Float64Array(cols);
      prev[clamp(Math.floor(start.x / csx), 0, cols - 1)] = 0;
      for (let r = 1; r < rows; r++) {
        const base = r * cols, k = locked.has(r) ? 0 : K, fc = forced.get(r), px = pull.get(r);
        for (let c = 0; c < cols; c++) {
          if (fc !== undefined && c !== fc) { cur[c] = Infinity; continue; }
          let best = Infinity, bp = c, m = cost[base + c];
          for (let d = 0; d <= k && c - d >= 0; d++) {
            const cc = c - d, v = prev[cc];
            if (cost[base + cc] > m) m = cost[base + cc];
            if (v === Infinity) continue;
            const cand = v + m * stepLen[d];
            if (cand < best) { best = cand; bp = cc; }
          }
          m = cost[base + c];
          for (let d = 1; d <= k && c + d < cols; d++) {
            const cc = c + d, v = prev[cc];
            if (cost[base + cc] > m) m = cost[base + cc];
            if (v === Infinity) continue;
            const cand = v + m * stepLen[d];
            if (cand < best) { best = cand; bp = cc; }
          }
          cur[c] = best + (px === undefined ? 0 : 14 * Math.min(1, Math.abs(colX(c) - px) / (vw * 0.4)));
          par[base + c] = bp;
        }
        [prev, cur] = [cur, prev];
      }
      let ec = 0, eb = Infinity;
      for (let c = 0; c < cols; c++) {
        const v = prev[c] + 2 * Math.abs(colX(c) - end.x) / csx;
        if (v < eb) { eb = v; ec = c; }
      }
      const path = new Int16Array(rows);
      path[rows - 1] = ec;
      for (let r = rows - 1; r > 0; r--) path[r - 1] = par[r * cols + path[r]];
      const raw = Array.from(path, (c, r) => ({ x: colX(c), y: rowY(r) }));
      raw[0] = { x: start.x, y: start.y };

      // Cut the route into pieces at stage edges and loops, smooth each one
      const clearDoc = rectSet([...docV, ...stageU.flat()], vw);
      const clearOut = stageDefs.map((_, i) => rectSet([...docV, ...stageO[i], ...stageU.filter((__, j) => j !== i).flat()], vw));
      const pieces = [];
      let from = 0, fromPt = raw[0], fromKind = 'start';
      const cutAt = (r, y, kind, clear) => {
        const x = raw[r].x, pts = [fromPt, ...raw.slice(from + 1, r).filter((p) => p.y > fromPt.y + 1 && p.y < y - 1), { x, y }];
        pieces.push({ pts, a: fromKind, b: kind, clear });
        from = r; fromPt = { x, y }; fromKind = kind;
      };
      stageDefs.forEach((st, i) => {
        cutAt(rowOf(st.vTop), st.vTop, 'edge', clearDoc);
        cutAt(st.rIn, rowY(st.rIn), 'loop', clearDoc);
        from = st.rOut; fromPt = { x: raw[st.rOut].x, y: rowY(st.rOut) }; fromKind = 'loop';
        cutAt(rowOf(st.vTop + st.Hf), st.vTop + st.Hf, 'edge', clearOut[i]);
      });
      cutAt(rows - 1, raw[rows - 1].y, 'end', clearDoc);

      const need = hwMin + pad * 0.5;
      for (const pc of pieces) {
        const { pts } = pc;
        if (pc.a !== 'start') pts.splice(1, 0, { x: pts[0].x, y: pts[0].y + Math.min(24, (pts[pts.length - 1].y - pts[0].y) / 3), pin: true });
        if (pc.b !== 'end') pts.splice(pts.length - 1, 0, { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y - Math.min(24, (pts[pts.length - 1].y - pts[0].y) / 3), pin: true });
        // Simplify, round the corners, and pin down any corner whose rounding would touch content
        const k = simplify(pts, narrow ? 6 : 16).map((p, i, all) => ({ ...p, fix: p.pin || i === 0 || i === all.length - 1, src: i }));
        let P;
        for (let tries = 0; tries < 8; tries++) {
          P = chaikin(k);
          const bad = new Set();
          for (let i = 0; i < P.xs.length; i += 2) {
            if (pc.clear(P.xs[i], P.ys[i], need + 1) >= need) continue;
            // Fix the simplified corner nearest to the clash
            let bj = -1, bd = Infinity;
            for (let j = 1; j < k.length - 1; j++) {
              if (k[j].fix) continue;
              const d = Math.hypot(k[j].x - P.xs[i], k[j].y - P.ys[i]);
              if (d < bd) { bd = d; bj = j; }
            }
            if (bj > 0) bad.add(bj);
          }
          if (!bad.size) break;
          for (const j of bad) k[j].fix = true;
        }
        const caps = new Float32Array(P.xs.length);
        for (let i = 0; i < caps.length; i++) caps[i] = pc.clear(P.xs[i], P.ys[i], hwBase * 2 + pad) - pad;
        Object.assign(pc, P, { caps });
      }

      // Junction widths so neighbouring pieces meet edge to edge
      const joinW = (a, b) => Math.max(0.8, Math.min(hwBase * 0.85, a.caps[a.caps.length - 1], b.caps[0]));
      let s0 = 0;
      pieces.forEach((pc, i) => {
        const nx = pieces[i + 1], pv = pieces[i - 1];
        const ends = {
          taperIn: pc.a === 'start', taperOut: pc.b === 'end',
          joinIn: pc.a === 'edge' ? joinW(pv, pc) : pc.a === 'loop' ? stageFor(i).loop.hw : null,
          joinOut: pc.b === 'edge' ? joinW(pc, nx) : pc.b === 'loop' ? stageFor(i).loop.hw : null,
        };
        pc.hw = profile(pc.xs, pc.ys, pc.caps, hwBase, s0, ends);
        pc.s0 = s0;
        pc.tip = hwBase * 2.4;
        s0 += (pc.xs.length - 1) * STEP + 400;
      });
      function stageFor(i) { return stageDefs[Math.floor((i - 1) / 3)]; }

      // Hand pieces out: runs in document space, stage leads in stage space
      const unV = (P, dy) => { for (let i = 0; i < P.ys.length; i++) P.ys[i] += dy; };
      let shiftY = 0;
      pieces.forEach((pc, i) => {
        const kind = i % 3; // 0 run, 1 into a loop, 2 out of a loop
        if (kind === 0) {
          unV(pc, shiftY);
          pc.streaks = streaks((pc.xs.length - 1) * STEP, hwBase, 11 + i, pc.b === 'end');
          runs.push(finish(pc));
        } else {
          const st = stageFor(i);
          unV(pc, -st.vTop);
          finish(pc);
          if (kind === 1) st.lin = pc;
          else { st.lout = pc; shiftY += st.D; }
        }
      });
      stages = stageDefs.map((st) => ({ ...st, hwBase, visible: false, key: '' }));
      startY = runs[0]?.ys[0] ?? 0;
    }

    // ----- writes -----
    hosts.forEach((h) => io.unobserve(h.el));
    $$('svg.signal').forEach((s) => s.remove());
    $$('[data-signal-host]').forEach((el) => el.removeAttribute('data-signal-host'));
    hosts = [];
    const svgIn = (el) => {
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'signal');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      el.append(svg);
      el.setAttribute('data-signal-host', '');
      return svg;
    };
    const pathEl = (d, cls = 'signal__ink') => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('class', cls);
      if (d) p.setAttribute('d', d);
      return p;
    };
    if (runs.length) {
      for (const run of runs) {
        run.chunks = [];
        for (let a = 0; a < run.len; a += CHUNK) {
          const b = Math.min(run.len, a + CHUNK), i0 = Math.floor(a / STEP), i1 = Math.min(run.xs.length - 1, Math.ceil(b / STEP));
          let top = Infinity, bottom = -Infinity;
          for (let i = i0; i <= i1; i++) { top = Math.min(top, run.ys[i]); bottom = Math.max(bottom, run.ys[i]); }
          run.chunks.push({ a, b, top: top - 40, bottom: bottom + 40, d: outline(run, a - STEP, b + STEP, false) });
        }
        run.drawn = -1; run.headD = ''; run.headTop = 0; run.headBottom = 0;
      }
      const ys = scrollY;
      for (const el of main.children) {
        if (/^(DIALOG|SCRIPT|TEMPLATE|STYLE)$/.test(el.tagName) || !el.offsetHeight) continue;
        const r = el.getBoundingClientRect(), top = r.top + ys, h = el.offsetHeight;
        const items = [], heads = [];
        for (const run of runs) {
          if (run.chunks.every((c) => c.bottom < top || c.top > top + h)) continue;
          for (const c of run.chunks) if (c.bottom >= top && c.top <= top + h) items.push({ c, run, el: pathEl(c.d), on: true });
          if (!still) heads.push({ run, el: pathEl('', 'signal__ink signal__tip'), d: '' });
        }
        if (!items.length) continue;
        const svg = svgIn(el);
        svg.setAttribute('viewBox', `0 ${f(top)} ${vw} ${f(h)}`);
        svg.style.cssText = `left:${-r.left}px;width:${vw}px;height:${h}px`;
        svg.append(...items.map((it) => it.el), ...heads.map((hd) => hd.el));
        if (!still) for (const it of items) { it.el.style.display = 'none'; it.on = false; }
        hosts.push({ el, svg, top, bottom: top + h, items, heads, visible: false });
      }
      for (const st of stages) {
        const svg = svgIn(st.el);
        svg.setAttribute('viewBox', `0 0 ${vw} ${f(st.Hf)}`);
        svg.style.cssText = `left:${-st.x}px;width:${vw}px;height:${f(st.Hf)}px`;
        st.svg = svg;
        st.path = pathEl('');
        svg.append(st.path);
        hosts.push({ el: st.el, stage: st, visible: false });
        if (still) { const C = stageCurve(st, -Math.PI / 2); st.path.setAttribute('d', outline(C, 0, (C.xs.length - 1) * STEP, false)); }
      }
      hosts.forEach((h) => io.observe(h.el));
    }

    if (heroBox) {
      ink.x = heroBox.x; ink.y = heroBox.y;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const cw = Math.round(heroBox.cw * dpr), ch = Math.round(heroBox.ch * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ink.dpr = dpr;
      ink.base = hwBase;
      ink.on = hoverFine.matches && !still;
      if (!ink.on) { ink.pts.length = 0; ctx.clearRect(0, 0, cw, ch); }
    }
    kick();
  }

  // ---------- pinned stage loop ----------
  // The lead-in, then a connector into a slightly spiralling loop that turns with the pin,
  // a connector out, then the lead-out. Rebuilt only while the stage is on screen.
  const dyn = [];
  function stageCurve(st, phi) {
    const { lin, lout, loop } = st;
    dyn.length = 0;
    const n0 = lin.xs.length, ax = lin.xs[n0 - 1], ay = lin.ys[n0 - 1];
    const bx = lout.xs[0], by = lout.ys[0];
    const bez = (p0x, p0y, c1x, c1y, c2x, c2y, p3x, p3y) => {
      const n = Math.max(4, Math.ceil((Math.hypot(c1x - p0x, c1y - p0y) + Math.hypot(c2x - c1x, c2y - c1y) + Math.hypot(p3x - c2x, p3y - c2y)) / 2));
      for (let j = 1; j <= n; j++) {
        const t = j / n, u = 1 - t;
        dyn.push(u * u * u * p0x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * p3x, u * u * u * p0y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * p3y);
      }
    };
    dyn.push(ax, ay);
    if (!loop.ok) bez(ax, ay, ax, ay + 10, bx, by - 10, bx, by);
    else {
      const { cx, cy, rx, ry } = loop, sweep = Math.PI * 2 + 0.5, R = Math.sqrt(rx * ry);
      const at = (t) => { const a = phi + sweep * t, k = 1 - 0.18 * t; return [cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)]; };
      const tan = (t) => { const p = at(t), q = at(t + 0.01), l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1; return [(q[0] - p[0]) / l, (q[1] - p[1]) / l]; };
      const S = at(0), TS = tan(0), F = at(1), TF = tan(0.99);
      const h1 = Math.max(Math.hypot(S[0] - ax, S[1] - ay) * 0.5, R * 0.6), h2 = Math.max(Math.hypot(bx - F[0], by - F[1]) * 0.5, R * 0.6);
      bez(ax, ay, ax, ay + h1, S[0] - TS[0] * h1, S[1] - TS[1] * h1, S[0], S[1]);
      const n = Math.ceil(sweep * Math.max(rx, ry) / 2);
      for (let j = 1; j <= n; j++) dyn.push(...at(j / n));
      bez(F[0], F[1], F[0] + TF[0] * h2, F[1] + TF[1] * h2, bx, by - h2, bx, by);
    }
    const mid = resample(dyn);
    const m = mid.xs.length;
    const xs = new Float32Array(n0 + m - 2 + lout.xs.length), ys = new Float32Array(xs.length), caps = new Float32Array(xs.length);
    xs.set(lin.xs); ys.set(lin.ys);
    xs.set(mid.xs.subarray(1, m - 1), n0); ys.set(mid.ys.subarray(1, m - 1), n0);
    xs.set(lout.xs, n0 + m - 2); ys.set(lout.ys, n0 + m - 2);
    caps.fill(loop.hw);
    const hwMid = profile(mid.xs, mid.ys, null, loop.hw / 0.95, lin.s0 + lin.len, { joinIn: loop.hw, joinOut: loop.hw });
    const hw = new Float32Array(xs.length);
    hw.set(lin.hw); hw.set(hwMid.subarray(1, m - 1), n0); hw.set(lout.hw, n0 + m - 2);
    return { xs, ys, hw, s0: lin.s0, tip: st.hwBase * 1.6, inLen: lin.len, midLen: (m - 1) * STEP };
  }

  // ---------- visibility ----------
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) for (const h of hosts) if (h.el === e.target) h.visible = e.isIntersecting;
    kick();
  }, { rootMargin: '15% 0px' });

  // ---------- hero cursor ink ----------
  const ink = { on: false, pts: [], x: 0, y: 0, dpr: 1, base: 12, fg: [255, 45, 31] };
  if (hero && ctx) {
    hero.addEventListener('pointermove', (e) => {
      if (!ink.on || e.pointerType === 'touch') return;
      const now = performance.now();
      const x = e.pageX - ink.x, y = e.pageY - ink.y;
      const prev = ink.pts[ink.pts.length - 1];
      const fresh = !prev || now - prev.t > 120;
      // A new stroke reads the colour once (the theme may have changed since the last one)
      if (fresh) ink.fg = toRGB(getComputedStyle(hero).getPropertyValue('--color-signal')) || ink.fg;
      if (!fresh && Math.hypot(x - prev.x, y - prev.y) < 2) return;
      const v = fresh ? 0 : Math.hypot(x - prev.x, y - prev.y) / Math.max(1, now - prev.t);
      const goal = clamp(ink.base * (0.55 + v * 0.45), ink.base * 0.5, ink.base * 1.5);
      ink.pts.push({ x, y, t: now, w: fresh ? goal * 0.6 : prev.w + (goal - prev.w) * 0.25, start: fresh });
      kick();
    });
  }

  // Each stroke is one filled shape: it swells with speed, its tail dries to a point
  function drawInk(now) {
    const pts = ink.pts;
    while (pts.length && now - pts[0].t > INK_LIFE) pts.shift();
    if (pts[0]) pts[0].start = true;
    ctx.setTransform(ink.dpr, 0, 0, ink.dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgb(${ink.fg})`;
    let i = 0;
    while (i < pts.length) {
      let j = i + 1;
      while (j < pts.length && !pts[j].start) j++;
      const s = pts.slice(i, j);
      i = j;
      if (s.length < 2) continue;
      const L = [], R = [];
      for (let k = 0; k < s.length; k++) {
        const a = s[Math.max(0, k - 1)], b = s[Math.min(s.length - 1, k + 1)], p = s[k];
        let tx = b.x - a.x, ty = b.y - a.y;
        const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        const age = (now - p.t) / INK_LIFE;
        const w = p.w * Math.max(0, 1 - age) ** 0.8 * Math.min(1, 0.45 + (s.length - 1 - k) * 0.2) * (1 + 0.08 * nLeft(p.x * 0.05 + p.y * 0.03));
        L.push(p.x - ty * w, p.y + tx * w);
        R.push(p.x + ty * w, p.y - tx * w);
      }
      ctx.beginPath();
      ctx.moveTo(L[0], L[1]);
      for (let k = 2; k < L.length; k += 2) ctx.lineTo((L[k - 2] + L[k]) / 2, (L[k - 1] + L[k + 1]) / 2);
      const e = s[s.length - 1], hw = Math.hypot(L[L.length - 2] - R[R.length - 2], L[L.length - 1] - R[R.length - 1]) / 2;
      ctx.lineTo(L[L.length - 2], L[L.length - 1]);
      ctx.arc(e.x, e.y, hw, Math.atan2(L[L.length - 1] - e.y, L[L.length - 2] - e.x), Math.atan2(R[R.length - 1] - e.y, R[R.length - 2] - e.x), true);
      for (let k = R.length - 2; k >= 2; k -= 2) ctx.lineTo((R[k] + R[k - 2]) / 2, (R[k + 1] + R[k - 1]) / 2);
      ctx.lineTo(R[0], R[1]);
      ctx.closePath();
      ctx.fill();
    }
    return pts.length > 0;
  }

  // ---------- the loop ----------
  function frame(now) {
    raf = 0;
    const dt = last ? Math.min(now - last, 64) : 16;
    last = now;
    sy = scrollY;
    let busy = false;

    if (!still && runs.length) {
      // Once the hero has landed, a first stretch flows out of the full stop before any scroll
      const target = now < readyAt ? startY : Math.max(sy + vh * HEAD, startY + Math.min(vh * 0.3, 280));
      head ??= startY;
      head += (target - head) * (1 - Math.exp(-dt / 120));
      if (Math.abs(target - head) < 0.5) head = target; else busy = true;
      if (now < readyAt && readyAt !== Infinity) busy = true;

      for (const run of runs) {
        const drawn = lengthAtY(run, head);
        if (Math.abs(drawn - run.drawn) < 0.25) continue;
        run.drawn = drawn;
        run.full = drawn >= run.len - 0.5 ? run.len : Math.max(0, Math.floor((drawn - run.tip) / CHUNK) * CHUNK);
        if (run.full < run.len && drawn > 0.5) {
          run.headD = outline(run, run.full - STEP, drawn, true);
          const i0 = Math.floor(run.full / STEP), i1 = Math.min(run.xs.length - 1, Math.ceil(drawn / STEP));
          let t = Infinity, b = -Infinity;
          for (let i = i0; i <= i1; i++) { t = Math.min(t, run.ys[i]); b = Math.max(b, run.ys[i]); }
          run.headTop = t - 40; run.headBottom = b + 40;
        } else run.headD = '';
      }

      for (const host of hosts) {
        if (!host.visible) continue;
        if (host.stage) { drawStage(host.stage); continue; }
        for (const it of host.items) {
          const on = it.c.b <= it.run.full + 0.5;
          if (on !== it.on) { it.on = on; it.el.style.display = on ? '' : 'none'; }
        }
        for (const hd of host.heads) {
          const r = hd.run, d = r.headD && r.headBottom >= host.top && r.headTop <= host.bottom ? r.headD : '';
          if (d !== hd.d) { hd.d = d; hd.el.setAttribute('d', d); }
        }
      }
    }

    if (ink.pts.length && drawInk(now)) busy = true;
    else if (ink.dirty) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); }
    ink.dirty = ink.pts.length > 0;

    if (busy && !document.hidden) kick();
    else last = 0;
  }

  // Lead-in by the tip's height, the loop over the pin, the lead-out as the stage scrolls away
  function drawStage(st) {
    const v = head - vh * HEAD, p = clamp((sy - st.top) / Math.max(1, st.D), 0, 1);
    const phi = -Math.PI / 2 - 0.9 + p * TURN;
    const vB = st.top + st.D, vA = Math.min(vB - 1, st.top + st.lin.ys[st.lin.ys.length - 1] - vh * HEAD);
    const vC = Math.max(vB + 1, st.top + st.D + st.Hf - vh * HEAD);
    const inDrawn = lengthAtY(st.lin, head - st.top);
    const key = `${f(inDrawn)}|${f(v)}|${f(phi * 100)}`;
    if (key === st.key) return;
    st.key = key;
    const C = stageCurve(st, phi);
    let drawn;
    if (inDrawn < C.inLen - 0.5 || v <= vA) drawn = Math.min(inDrawn, C.inLen);
    else if (v < vB) drawn = C.inLen + C.midLen * clamp((v - vA) / (vB - vA), 0, 1);
    else drawn = C.inLen + C.midLen + lengthAtY(st.lout, st.lout.ys[0] + (st.Hf - st.lout.ys[0]) * clamp((v - vB) / (vC - vB), 0, 1));
    const total = (C.xs.length - 1) * STEP;
    st.path.setAttribute('d', drawn < 0.5 ? '' : outline(C, 0, drawn, drawn < total - 0.5));
  }

  function kick() { raf ||= requestAnimationFrame(frame); }

  // ---------- wiring ----------
  // The line starts drawing once the hero's name has landed
  if (hero) {
    const ready = () => { if (hero.classList.contains('is-in') && readyAt === Infinity) { readyAt = performance.now() + 650; kick(); } };
    new MutationObserver(ready).observe(hero, { attributes: true, attributeFilter: ['class'] });
    ready();
  }

  let timer = 0;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(build, 140); };
  new ResizeObserver(schedule).observe(main);
  addEventListener('resize', () => { vh = innerHeight; schedule(); });
  addEventListener('scroll', kick, { passive: true });
  addEventListener('load', schedule);
  document.fonts?.ready.then(schedule);
  document.addEventListener('visibilitychange', kick);
  reducedMotion.addEventListener('change', build);
  hoverFine.addEventListener('change', build);
  build();
}
