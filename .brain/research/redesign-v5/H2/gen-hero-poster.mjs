// Regenerates the static SVG poster fallback for the hero field (assets/images/hero-field-*.svg) from the same
// vertex-shader maths as scripts/design/hero.js, so the still frame matches the live field and the column grid.
// Usage: node gen-hero-poster.mjs   (run from the project root)
import { writeFileSync } from 'node:fs';
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// stage = plot-space x of column lines 2, 6, 10 of 12 (desktop) or 1, 2, 3 of 4 (phone), with the page margins
// and gutters at their large-screen values (--m 2.6vw, --g 1.6vw) and the phone ones (16px, 12px at 390px).
function stageFor(W, m, g, n, lines) { const Wc = W - 2 * m; return lines.map((k) => (m - g / 2 + (k * (Wc + g)) / n) / W); }
const variants = [
  { name: 'desktop', suffix: '', W: 1440, H: 480, N: 4096, L: 12, keep: 2700, stage: stageFor(1440, 37.44, 23.04, 12, [2, 6, 10]) },
  { name: 'phone', suffix: '-phone', W: 390, H: 420, N: 2048, L: 8, keep: 1100, stage: stageFor(390, 16, 12, 4, [1, 2, 3]) },
];
for (const v of variants) {
  const { W, H, N, L } = v; const [A, B, C] = v.stage;
  const orangeLane = Math.round((L - 1) * 0.64), nOrange = Math.round(N * 0.05), nGrey = N - nOrange;
  const rand = rng(20281), T = 14.3, grey = [], orange = [];
  for (let i = 0; i < N; i++) {
    const orng = i >= nGrey; const r = [rand(), rand(), rand(), rand()];
    let lane = orangeLane; if (!orng) { lane = Math.floor(rand() * (L - 1)); if (lane >= orangeLane) lane += 1; }
    const laneT = lane / (L - 1), speed = 0.026 + 0.024 * r[1], p = (r[0] + T * speed) % 1, x = p * 1.1 - 0.05, ph = r[3] * 6.2831853;
    const wob = Math.sin(T * 0.55 + ph + x * 5), wob2 = Math.sin(T * 0.31 + ph * 1.7 + x * 9);
    const yS = 0.1 + 0.8 * r[2] + 0.05 * wob + 0.02 * wob2, yP = 0.5 + (laneT - 0.5) * 0.13 + 0.004 * wob, yL = 0.14 + 0.72 * laneT;
    const s1 = smooth(A, B - 0.02, x), s2 = smooth(B + 0.02, C, x);
    const y = (yS + (yP - yS) * s1) * (1 - s2) + yL * s2;
    const edge = smooth(-0.05, 0.04, x) * (1 - smooth(0.97, 1.05, x));
    if (edge < 0.05) continue;
    (orng ? orange : grey).push([x * W, y * H, edge]);
  }
  const f = (n) => n.toFixed(1);
  const g = grey.slice(0, v.keep).map(([x, y, e]) => `<circle cx="${f(x)}" cy="${f(y)}" r="1.05"${e < 0.99 ? ` fill-opacity="${e.toFixed(2)}"` : ''}/>`).join('');
  const o = orange.map(([x, y, e]) => `<circle cx="${f(x)}" cy="${f(y)}" r="1.35"${e < 0.99 ? ` fill-opacity="${e.toFixed(2)}"` : ''}/>`).join('');
  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><g fill="#000"`;
  writeFileSync(`assets/images/hero-field-grey${v.suffix}.svg`, `${head} fill-opacity="0.5">${g}</g></svg>`);
  writeFileSync(`assets/images/hero-field-orange${v.suffix}.svg`, `${head}>${o}</g></svg>`);
  console.log(v.name, 'stage', v.stage.map((x) => x.toFixed(4)).join(' '), 'grey', Math.min(grey.length, v.keep), 'orange', orange.length);
}
