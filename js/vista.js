/* ==========================================================================
   Vista — Cape Engaño lighthouse at night, under the footer wordmark (static)
   ========================================================================== */
import { $, clamp } from './util.js';

const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const noise = (x, seed) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i + seed * 57) * (1 - u) + hash(i + 1 + seed * 57) * u; };
const noise2 = (x, y) => {
  const xi = Math.floor(x), yi = Math.floor(y), u = (x - xi) ** 2 * (3 - 2 * (x - xi)), v = (y - yi) ** 2 * (3 - 2 * (y - yi));
  const h = (a, b) => hash(a * 157 + b * 311);
  return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v;
};
const LAYERS = ['ink', 'mute', 'accent', 'g1', 'g2', 'g3', 'red', 'white', 'sun', 'cloud'];   // g1–g3: greens, dark to light

function scene(cols, rows, day) {
  const ch = Array.from({ length: rows }, () => Array(cols).fill(' '));
  const ly = Array.from({ length: rows }, () => Array(cols).fill(''));
  const put = (y, x, c, l) => { y = Math.round(y); x = Math.round(x); if (y >= 0 && y < rows && x >= 0 && x < cols) { ch[y][x] = c; ly[y][x] = l; } };
  const free = (y, x) => ch[y]?.[x] === ' ';
  const H = Math.round(rows * 0.68);
  const V = Math.min(rows, cols * 0.55);                     // height unit: keeps land from turning to spikes on tall, narrow grids

  // Island on the right: rises to a headland where the lighthouse stands
  const lx = Math.round(cols * 0.76);
  const pad = 5 + 2 * Math.max(1, Math.round(cols / 110));    // flat ground under the lighthouse
  const isleF = (x0) => {
    const x = x0 - lx < 0 ? Math.min(lx, x0 + pad) : Math.max(lx, x0 - pad);
    const u = (x0 - cols * 0.52) / (cols * 0.48);
    if (u < 0) return H;
    const head = Math.exp(-(((x - lx) / Math.max(cols * 0.06, V * 0.3)) ** 2)) * V * 0.12;
    const body = Math.sqrt(Math.max(0, u)) * V * 0.1 + noise((x / cols) * 22, 4) * V * 0.05;
    const e = Math.min(1, u / 0.3), shore = e * e * (3 - 2 * e);        // the shore rises gently out of the water
    return H - 1 - Math.min(H * 0.7, (head + body) * shore);
  };
  const isle = (x) => Math.round(isleF(x));
  for (let x = 0; x < cols; x++) {
    const f = isleF(x), t = Math.round(f), l = isle(x - 1), r = isle(x + 1);
    if (t >= H) continue;
    // Half-row precision on flat runs: '-' sits mid-cell, '_' at its foot
    put(t, x, l > t && r > t ? '^' : l > t ? '/' : r > t ? '\\' : f < t ? '-' : '_', 'g3');
    for (let y = t + 1; y < H; y++) { const n = noise2(x * 0.07, y * 0.22) + hash(x * 13 + y * 7) * 0.2; put(y, x, n > 0.88 ? '%' : hash(x * 13 + y * 7) < (day ? 0.7 : 0.4) ? ':' : '.', n < 0.5 ? 'g1' : n < 0.8 ? 'g2' : 'g3'); }
  }
  return { ch, ly, H, V, lx, put, free, isle };
}

const stamp = (put, y, x, lines, layerOf) => lines.forEach((s, i) => [...s].forEach((c, j) => { if (c !== ' ') put(y + i, x + j, c, layerOf(c)); }));

function paint(cols, rows, t = 0, day = false) {   // day: light theme — sun, clouds, lamp off
  const S = scene(cols, rows, day), { ch, ly, H, V, lx, put, free, isle } = S;
  const s = Math.max(1, Math.round(cols / 110));            // object scale: more cells on wide grids
  // Lighthouse: tapered, striped tower
  const y0 = isle(lx), wb0 = 2 + 2 * s, th = Math.max(5, Math.min(Math.round(V * 0.22), Math.round(wb0 * 3.3), y0 - 5 - 3 * s));
  const wb = 2 + 2 * s, wt = 1 + s;
  for (let k = 0; k < th; k++) {
    const y = y0 - 1 - k, w = Math.round(wb - ((wb - wt) * k) / th), red = Math.floor(k / (2 * s + 1)) % 2 === 0;
    put(y, lx - w, '/', 'ink'); put(y, lx + w, '\\', 'ink');
    for (let x = lx - w + 1; x < lx + w; x++) put(y, x, k < 2 * s && Math.abs(x - lx) < s ? '|' : '#', k < 2 * s && Math.abs(x - lx) < s ? 'ink' : red ? 'red' : 'white');
  }
  // Stone foundation on the flat ground
  for (let k = 0; k <= Math.floor(s / 2); k++) {
    for (let x = lx - wb - 2 - k; x <= lx + wb + 2 + k; x++) put(y0 + k, x, x === lx - wb - 2 - k ? '[' : x === lx + wb + 2 + k ? ']' : k ? '#' : '=', 'ink');
  }
  // Gallery, lantern, roof
  let y = y0 - 1 - th;
  for (let x = lx - wt - 1; x <= lx + wt + 1; x++) put(y, x, x === lx - wt - 1 ? '[' : x === lx + wt + 1 ? ']' : '=', 'ink');
  for (let k = 0; k <= s; k++) {
    y--; put(y, lx - wt, '|', 'ink'); put(y, lx + wt, '|', 'ink');
    for (let x = lx - wt + 1; x < lx + wt; x++) put(y, x, day ? ':' : '@', day ? 'mute' : 'accent');
  }
  const ly0 = y;
  for (let k = 0; k <= wt; k++) {
    y--; put(y, lx - wt + k, k === wt ? '^' : '/', 'red');
    if (k < wt) put(y, lx + wt - k, '\\', 'red');
    for (let x = lx - wt + k + 1; x < lx + wt - k; x++) put(y, x, '_', 'red');
  }
  // Trees on the island, clear of the tower
  for (let x = 0; x < cols; x++) {
    const top = isle(x);
    if (top >= H - 1 || Math.abs(x - lx) < wb + 3 || hash(x * 4.3) > 0.4) continue;
    const h = 1 + Math.floor(hash(x * 2.9) * (s + 1));
    for (let k = 1; k <= h; k++) put(top - k, x, k === h ? '^' : 'A', k === h ? 'g2' : 'g1');
  }
  // Footpath from the dock up the hill to the lighthouse door
  const dockEnd = Math.round(cols * 0.545);
  {
    const [x0, y0p, x1, y1p, x2, y2p] = [dockEnd, H - 1, lx - cols * 0.05, H - 2, lx - wb - 1, y0 - 1];
    let px = -1, py = -1;
    for (let i = 0; i <= cols * 4; i++) {
      const q = i / (cols * 4), a = (1 - q) * (1 - q), b = 2 * q * (1 - q), c = q * q;
      const x = Math.round(a * x0 + b * x1 + c * x2), y = Math.max(isle(x) + 1, Math.round(a * y0p + b * y1p + c * y2p));
      if (x === px && y === py) continue;
      put(y, x, py >= 0 && y < py ? '/' : py >= 0 && y > py ? '\\' : '_', 'ink');
      px = x; py = y;
    }
  }
  // Beam: always full length; it sweeps slowly up and down, so its light slides along the water
  // At the left edge its centre swings from the sky (k < 0) to well out on the sea (k > 0)
  const k = 0.15 + 0.45 * Math.sin(t * 0.35), m = (H + k * (rows - H) - ly0) / lx, hw = (rows * 0.09) / lx, lamp = (s + 1) / 2;
  for (let dx = wt + 2; !day && dx < lx; dx++) {
    const x = lx - dx, a = ly0 - lamp + dx * (m - hw), b = ly0 + lamp + dx * (m + hw), c = (a + b) / 2, fade = 1 - (0.55 * dx) / lx;
    for (let y = Math.ceil(a); y <= b; y++) {
      if (y < H && !free(y, x)) continue;
      const v = fade * (1 - Math.abs(y - c) / ((b - a) / 2 + 1)) + hash(x * 3 + y * 17 + (y >= H ? Math.floor(t * 6) : 0)) * 0.25;
      if (y >= H) { if (v > 0.45 && y > H) put(y, x, v > 0.7 ? '=' : '-', 'accent'); }      // glints where it lands on the sea
      else if (v > 0.3) put(y, x, v > 0.75 ? '=' : v > 0.55 ? '-' : '.', 'accent');
    }
  }
  // Full moon: a lit sphere with maria, rimmed craters and a faint halo
  const r = Math.max(4, Math.min(rows * 0.17, cols * 0.05)), mx = Math.max(cols * 0.12, r * 1.83 + 3), my = rows * 0.18;
  const RAMP = '.:-=+*#%@', CRATERS = [[-0.38, -0.22, 0.2], [0.32, 0.38, 0.15], [0.08, -0.5, 0.11], [0.5, -0.12, 0.1], [-0.18, 0.45, 0.13], [-0.55, 0.25, 0.08]];
  if (!day) for (let y = Math.floor(my - r * 1.3); y <= my + r * 1.3; y++) for (let x = Math.floor(mx - r * 2.4); x <= mx + r * 2.4; x++) {
    const px = (x - mx) / (r * 1.83), py = (y - my) / r, d = Math.hypot(px, py);
    if (d > 1.28) continue;
    if (d > 1) { if (hash(x * 5.7 + y * 13) < 0.35 * (1.28 - d) / 0.28) put(y, x, '.', 'mute'); continue; }
    const pz = Math.sqrt(1 - d * d);
    let b = 0.25 + 0.75 * Math.max(0, -0.45 * px - 0.35 * py + 0.82 * pz);
    if (noise2(px * 2.6 + 3, py * 2.6 + 1) > 0.58) b *= 0.62;                       // maria
    for (const [cx, cy, cr] of CRATERS) {
      const q = Math.hypot(px - cx, py - cy) / cr;
      if (q < 0.8) b *= 0.7; else if (q < 1.15) b *= 1.18;                            // floor, rim
    }
    b = Math.min(1, b);
    put(y, x, d > 0.96 ? (b > 0.5 ? ':' : '.') : RAMP[Math.round(b * (RAMP.length - 1))], b > 0.42 ? 'ink' : 'mute');
  }
  // Day: a sun with slowly turning rays where the moon was, and clouds drifting across
  if (day) {
    for (let y = Math.floor(my - r * 1.8); y <= my + r * 1.8; y++) for (let x = Math.floor(mx - r * 3.4); x <= mx + r * 3.4; x++) {
      const px = (x - mx) / (r * 1.83), py = (y - my) / r, d = Math.hypot(px, py);
      if (d < 0.75) { put(y, x, d < 0.4 ? '@' : d < 0.6 ? '#' : '*', 'sun'); continue; }
      const a = Math.atan2(py, px), ray = ((a / (Math.PI * 2)) * 12 + t * 0.05 + 12) % 1;
      if (d > 0.95 && d < 1.35 + 0.12 * Math.sin(t * 1.5 + Math.round(a * 2)) && Math.abs(ray - 0.5) < 0.09) {
        const cx = Math.abs(Math.cos(a)), sy = Math.abs(Math.sin(a));
        put(y, x, cx > 0.9 ? '-' : sy > 0.9 ? '|' : Math.cos(a) * Math.sin(a) > 0 ? '\\' : '/', 'sun');
      }
    }
    const PUFFS = [[-0.36, 0.15, 0.24], [-0.14, -0.05, 0.3], [0.1, -0.12, 0.32], [0.33, 0.05, 0.25], [0, 0.18, 0.34]];   // x, y, radius (share of width)
    [[0.32, 0.14, 0.13], [0.6, 0.34, 0.1], [0.05, 0.5, 0.09], [0.86, 0.1, 0.08]].forEach(([fx, fy, fw], i) => {
      const w = Math.max(10, cols * fw), span = cols + w * 2;
      const cx = (((fx * cols + t * (0.5 + i * 0.2) * Math.max(1, cols / 200)) % span) + span) % span - w / 2, cy = Math.max(fy * H, w * 0.16 + 1), base = cy + w * 0.1;   // never above the sky's top
      const inside = (x, y) => y <= base && PUFFS.some(([ox, oy, pr]) => ((x - cx - ox * w) / (pr * w)) ** 2 + ((y - cy - oy * w * 0.2) / ((pr * w) / 2.6)) ** 2 < 1);   // flatter than round
      for (let y = Math.floor(cy - w * 0.25); y <= base; y++) for (let x = Math.floor(cx - w); x <= cx + w; x++) {
        if (!inside(x, y)) continue;
        put(y, x, !inside(x, y + 1) ? '_' : !inside(x - 1, y) ? '(' : !inside(x + 1, y) ? ')' : !inside(x, y - 1) ? '-' : ' ', 'cloud');
      }
    });
  }
  // Stars where the sky is empty
  for (let y = 0; y < H - 2; y++) for (let x = 0; x < cols; x++) {
    const h = hash(y * 977 + x);
    if (!day && free(y, x) && h < 0.02 * (1 - y / H)) { const v = Math.sin(t * 1.5 + h * 900); put(y, x, v > 0.7 ? '*' : v > -0.3 ? '+' : '.', v > 0.7 ? 'ink' : 'mute'); }
  }
  // Sea: waves widen toward the viewer; the lantern's light on the water under the tower
  for (let y = H; y < rows; y++) {
    const d = y - H, depth = d / Math.max(1, rows - H);
    for (let x = 0; x < cols; x++) {
      if (d === 0) { put(y, x, '_', 'mute'); continue; }
      if (day && Math.abs(x - mx) < r * 1.83 * (0.3 + depth * 0.8) && hash(x * 5 + y * 23 + Math.floor(t * 4)) < 0.42 - depth * 0.2) { put(y, x, hash(x + y) < 0.5 ? '-' : '=', 'sun'); continue; }
      if (!day && Math.abs(x - lx) < 1 + d * 0.5 && hash(x * 7 + y * 31 + Math.floor(t * 6)) < 0.55 - depth * 0.3) { put(y, x, hash(x + y) < 0.5 ? '=' : '-', 'accent'); continue; }
      const h = hash(Math.floor((x + t * (1 + depth * 3) * (d % 2 ? 1 : -1)) / (1 + depth * 2)) * 5 + y * 91);
      if (h < 0.1 + depth * 0.3) put(y, x, '~', depth > 0.5 && h < 0.12 ? 'ink' : 'mute');
    }
  }
  // A small sailboat
  // Dock: a plank deck on pilings off the island's west shore, a lamp at its end
  const dockStart = Math.round(dockEnd - cols * 0.07);
  for (let x = dockStart; x <= dockEnd; x++) {
    put(H - 1, x, x === dockStart ? '[' : '=', 'ink');
    if ((x - dockStart) % (3 + s) === 0) for (let k = 0; k <= s; k++) put(H + k, x, '|', 'ink');
  }
  for (let k = 2; k <= 2 + 2 * s; k++) put(H - k, dockStart + 1, '|', 'ink');
  put(H - 3 - 2 * s, dockStart + 1, 'o', day ? 'mute' : 'accent');
  // A sailboat crossing slowly
  const bh = 2 + 2 * s, bx = Math.round(((cols * 0.28 + t * 0.8 * s) % (cols + 12 * s)) - 8 * s), by = H + Math.max(1, Math.round((rows - H) * 0.25));
  for (let k = 0; k < bh; k++) {
    put(by + k, bx, '|', 'ink'); put(by + k, bx + 1 + k, '\\', 'ink');
    for (let x = bx + 1; x < bx + 1 + k; x++) put(by + k, x, k === bh - 1 ? '_' : ' ', 'ink');
  }
  const hy = by + bh;
  put(hy, bx - 2 - s, '\\', 'ink'); put(hy, bx + bh + s, '/', 'ink');
  for (let x = bx - 1 - s; x < bx + bh + s; x++) put(hy, x, '_', 'ink');
  return S;
}

// The scene sits under the wordmark (from row off); stars fill the sky above it, behind the footer text
function compose(cols, rows, off, t, day) {
  const { ch, ly } = paint(cols, rows - off, t, day);
  for (let y = off - 1; y >= 0; y--) {
    const c = Array(cols).fill(' '), l = Array(cols).fill('');
    for (let x = 0; x < cols; x++) {
      const h = hash((y - off) * 977 + x);
      if (!day && h < 0.016) { const v = Math.sin(t * 1.5 + h * 900); c[x] = v > 0.7 ? '*' : v > -0.3 ? '+' : '.'; l[x] = v > 0.7 ? 'ink' : 'mute'; }
    }
    ch.unshift(c); ly.unshift(l);
  }
  return { ch, ly };
}

// Split the grid into one string per colour layer
function layers({ ch, ly }) {
  const out = Object.fromEntries(LAYERS.map((k) => [k, []]));
  ch.forEach((row, y) => {
    const line = Object.fromEntries(LAYERS.map((k) => [k, '']));
    row.forEach((c, x) => { for (const k of LAYERS) line[k] += ly[y][x] === k ? c : ' '; });
    for (const k of LAYERS) out[k].push(line[k]);
  });
  for (const k of LAYERS) out[k] = out[k].join('\n');
  return out;
}

export function initVista() {
  const el = $('[data-vista]');
  if (!el) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const pres = LAYERS.map((k) => el.appendChild(Object.assign(document.createElement('pre'), { className: `vista__layer vista__layer--${k}` })));
  const footer = el.parentElement;
  let ratio = 0.6, cols = 0, rows = 0, off = 0, t = 8, visible = false, looping = false, last = 0;

  const draw = () => {
    if (!cols) return;
    const f = layers(compose(cols, rows, off, t, document.documentElement.dataset.theme === 'light'));
    pres.forEach((p, i) => { p.textContent = f[LAYERS[i]]; });
  };
  // The grid covers the whole footer; columns from its width, rows from its height
  const layout = () => {
    const w = footer.clientWidth, h = footer.clientHeight;
    if (!w || !h || !el.clientHeight) return;
    cols = clamp(Math.round(w / 4), 90, 420);
    const fs = w / (cols * ratio);
    rows = clamp(Math.ceil(h / (fs * 1.1)), 20, 240);
    off = clamp(Math.round(el.offsetTop / (fs * 1.1)), 0, rows - 20);
    el.style.setProperty('--fs', `${fs}px`);
    draw();
  };
  // Runs on its own clock (~12fps); pauses only while off screen or hidden
  const tick = (now) => {
    if (!visible || still.matches) { looping = false; return; }
    requestAnimationFrame(tick);
    if (now - last < 80) return;
    t += last ? Math.min(0.2, (now - last) / 1000) : 0;
    last = now;
    draw();
  };
  const start = () => { if (!looping && visible && !still.matches) { looping = true; last = 0; requestAnimationFrame(tick); } };

  const fonts = document.fonts ? document.fonts.load('16px "Geist Mono"') : Promise.resolve();
  fonts.catch(() => {}).then(() => {
    const probe = pres[0].appendChild(Object.assign(document.createElement('span'), { textContent: 'M'.repeat(40) }));
    ratio = probe.getBoundingClientRect().width / 40 / parseFloat(getComputedStyle(pres[0]).fontSize) || 0.6;
    probe.remove();
    new ResizeObserver(layout).observe(footer);
    layout();
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(el);
    still.addEventListener('change', start);
    // Day or night follows the theme toggle at once
    new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  });
}
