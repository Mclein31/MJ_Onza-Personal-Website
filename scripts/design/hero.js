/*
 * hero.js: design-layer motion for the hero and the nav readout (Instrument redesign v5). Owner: W1 foundation.
 *
 * 1. The data field: the site's one WebGL piece (raw WebGL, ported from prototypes/direction-a/js/field.js).
 *    Points stream left to right through Extract -> Transform -> Load. The three stage ticks sit on column lines
 *    2, 6 and 10 of the 12-column grid (1, 2, 3 of 4 on phones); their x is read from the .hero__axis labels, so the
 *    stream's scatter / pinch / lanes always match the ticks and the hairlines (H2). Positions are a pure function of time in the
 *    vertex shader (no simulation). Scrolling the first half-screen settles every point onto the column hairlines;
 *    the cursor parts the stream (fine pointers only). scripts/core/gl.js decides support, runs the loop only while
 *    the hero is on screen and the tab is visible, and reports a fallback; the static SVG poster stays otherwise.
 * 2. The nav readout: current section name + scroll progress (000-100%) in the header.
 *
 * HOOKS (markup owned by W1): [data-plot] [data-field] [data-hero-cols] (readout hooks optional, removed in H3)
 *                             [data-readout-name] [data-readout-pct]
 * Listens to: theme:change (recolour), nav:change (readout name), intro:done (boot sweep).
 * Must never throw; under reduced motion the poster stays and nothing animates.
 */
import { glSupport, createGLLoop, reportFallback } from '../core/gl.js';
import { whenIntroDone } from '../core/intro.js';
import { observe } from './reveal.js';

const root = document.documentElement;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mq = (q) => { try { return matchMedia(q).matches; } catch { return false; } };
const reduced = () => mq('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------------------ shaders */
const VERT = `
precision highp float;
attribute vec4 aR;
attribute vec2 aMeta;    // x: lane 0..1, y: kind (0 grey, 1 orange)
attribute vec2 aTarget;  // settle target in 0..1 plot space
uniform float uT;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform float uSettle;
uniform float uDpr;
uniform float uFront;
uniform vec3 uStage;     // plot-space x of the Extract, Transform and Load ticks (column lines 2, 6, 10)
varying float vKind;
varying float vAlpha;

void main() {
  float speed = 0.026 + 0.024 * aR.y;
  float p = fract(aR.x + uT * speed);
  float x = p * 1.1 - 0.05;
  float ph = aR.w * 6.2831853;
  float wob = sin(uT * 0.55 + ph + x * 5.0);
  float wob2 = sin(uT * 0.31 + ph * 1.7 + x * 9.0);
  float yS = 0.1 + 0.8 * aR.z + 0.05 * wob + 0.02 * wob2;
  float yP = 0.5 + (aMeta.x - 0.5) * 0.13 + 0.004 * wob;
  float yL = 0.14 + 0.72 * aMeta.x;
  // scatter until the Extract tick, converge onto the Transform tick, fan out to the lanes by the Load tick
  float s1 = smoothstep(uStage.x, uStage.y - 0.02, x);
  float s2 = smoothstep(uStage.y + 0.02, uStage.z, x);
  float y = mix(mix(yS, yP, s1), yL, s2);
  vec2 px = vec2(x, y) * uRes;

  vec2 d = px - uMouse;
  float dist = length(d) + 0.001;
  float f = uMouseOn * (1.0 - smoothstep(0.0, 120.0, dist));
  px += (d / dist) * f * f * 26.0;

  float st = smoothstep(aR.w * 0.4, aR.w * 0.4 + 0.6, uSettle);
  px = mix(px, aTarget * uRes, st);

  vec2 c = px / uRes * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);

  float edge = smoothstep(-0.05, 0.04, x) * (1.0 - smoothstep(0.97, 1.05, x));
  float boot = 1.0 - smoothstep(uFront - 0.1, uFront, x);
  vKind = aMeta.y;
  vAlpha = mix(edge, 1.0, st) * boot;
  gl_PointSize = mix(3.0, 4.1, aMeta.y) * uDpr;
}`;

const FRAG = `
precision mediump float;
uniform vec3 uGrey;
uniform vec3 uOrange;
uniform float uGreyA;
varying float vKind;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = 1.0 - smoothstep(0.38, 0.5, length(c));
  float alpha = a * vAlpha * mix(uGreyA, 1.0, vKind);
  vec3 col = mix(uGrey, uOrange, vKind);
  gl_FragColor = vec4(col * alpha, alpha);
}`;

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rgb(str, fallback) {
  const s = String(str || '').trim().replace('#', '');
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(s)) return fallback;
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
  return sh;
}

/* ------------------------------------------------------------------ the field */
function createField({ canvas, plot, linesEl, phone }) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power', depth: false, stencil: false });
  if (!gl) return null;

  const N = phone ? 1400 : 3000;
  const L = phone ? 8 : 12;
  const orangeLane = Math.round((L - 1) * 0.64);
  const nOrange = Math.round(N * 0.07);
  const nGrey = N - nOrange;

  const R = new Float32Array(N * 4);
  const M = new Float32Array(N * 2);
  const T = new Float32Array(N * 2);
  const rand = rng(20281);
  for (let i = 0; i < N; i++) {
    const orange = i >= nGrey;
    R[i * 4] = rand(); R[i * 4 + 1] = rand(); R[i * 4 + 2] = rand(); R[i * 4 + 3] = rand();
    let lane = orangeLane;
    if (!orange) { lane = Math.floor(rand() * (L - 1)); if (lane >= orangeLane) lane += 1; }
    M[i * 2] = lane / (L - 1);
    M[i * 2 + 1] = orange ? 1 : 0;
  }

  let prog, tBuf, u;
  function build() {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
    gl.useProgram(prog);
    const attrib = (name, data, size, usage = gl.STATIC_DRAW) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return buf;
    };
    attrib('aR', R, 4);
    attrib('aMeta', M, 2);
    tBuf = attrib('aTarget', T, 2, gl.DYNAMIC_DRAW);
    u = {};
    ['uT', 'uRes', 'uMouse', 'uMouseOn', 'uSettle', 'uDpr', 'uFront', 'uStage', 'uGrey', 'uOrange', 'uGreyA'].forEach((n) => { u[n] = gl.getUniformLocation(prog, n); });
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  }
  try { build(); } catch { return null; }

  let w = 1, h = 1, dpr = 1;

  let stage = [0.1787, 0.5, 0.8213];

  // Column lines in plot space (0..1). The plot and the hairline grid share one box, so line k is at
  // padding-left + sum(tracks before k) + k * gutter - gutter / 2, measured from the grid's left edge.
  function columnLines(cr) {
    const cs = getComputedStyle(linesEl);
    const tracks = cs.gridTemplateColumns.split(' ').map(parseFloat).filter((n) => n > 0);
    const g = parseFloat(cs.columnGap) || 0;
    const pad = parseFloat(cs.paddingLeft) || 0;
    const lr = linesEl.getBoundingClientRect();
    const lines = [];
    let acc = 0;
    for (let k = 0; k <= tracks.length; k++) {
      lines.push((lr.left + pad + acc + k * g - g / 2 - cr.left) / cr.width);
      acc += tracks[k] || 0;
    }
    return lines;
  }

  // Stage ticks: read the centres of the axis labels so the shader and the labels cannot drift apart.
  function stageFractions(cr, lines) {
    const ticks = [...plot.querySelectorAll('.hero__axis li')].map((li) => {
      const r = li.getBoundingClientRect();
      return (r.left + r.width / 2 - cr.left) / cr.width;
    });
    if (ticks.length === 3 && ticks.every((x) => x > 0 && x < 1)) return ticks;
    const n = lines.length - 1;
    return [lines[Math.round(n / 6)], lines[Math.round(n / 2)], lines[Math.round((n * 5) / 6)]];
  }

  // Settle targets: every point lands on a column hairline; the orange ones on the centre line (Transform).
  function computeTargets() {
    try {
      const cr = canvas.getBoundingClientRect();
      if (cr.width === 0) return;
      const lines = columnLines(cr);
      if (lines.length < 3) return;
      stage = stageFractions(cr, lines);
      const oLine = Math.round((lines.length - 1) / 2);
      const greyLines = lines.filter((_, i) => i !== oLine);
      const slots = Math.max(8, Math.floor((cr.height * 0.84) / 5));
      let gi = 0, oi = 0;
      for (let i = 0; i < N; i++) {
        let lx, k;
        if (i < nGrey) { lx = greyLines[gi % greyLines.length]; k = Math.floor(gi / greyLines.length) % slots; gi++; }
        else { lx = lines[oLine]; k = oi % slots; oi++; }
        T[i * 2] = lx;
        T[i * 2 + 1] = 0.08 + 0.84 * ((k + 0.5) / slots);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, tBuf);
      gl.bufferData(gl.ARRAY_BUFFER, T, gl.DYNAMIC_DRAW);
    } catch {}
  }

  function resize(cw, ch) {
    w = Math.max(1, cw); h = Math.max(1, ch);
    dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    computeTargets();
  }

  function setColors() {
    try {
      const cs = getComputedStyle(root);
      const dark = root.getAttribute('data-theme') === 'dark';
      gl.useProgram(prog);
      gl.uniform3fv(u.uGrey, rgb(cs.getPropertyValue('--field'), [0.49, 0.51, 0.54]));
      gl.uniform3fv(u.uOrange, rgb(cs.getPropertyValue('--orange'), [1, 0.31, 0]));
      gl.uniform1f(u.uGreyA, dark ? 0.68 : 0.62);
    } catch {}
  }

  function draw({ flowT, mouse, mouseOn, settle, front }) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(u.uT, flowT);
    gl.uniform2f(u.uRes, w, h);
    gl.uniform2f(u.uMouse, mouse.x, mouse.y);
    gl.uniform1f(u.uMouseOn, mouseOn);
    gl.uniform1f(u.uSettle, settle);
    gl.uniform1f(u.uDpr, dpr);
    gl.uniform1f(u.uFront, front);
    gl.uniform3f(u.uStage, stage[0], stage[1], stage[2]);
    gl.drawArrays(gl.POINTS, 0, N);
  }

  function restore() { build(); setColors(); resize(w, h); }

  return { count: N, resize, setColors, draw, restore };
}

/* ------------------------------------------------------------------ hero wiring */
function initField() {
  const plot = document.querySelector('[data-plot]');
  const canvas = plot && plot.querySelector('[data-field]');
  const linesEl = document.querySelector('[data-hero-cols]');
  const hero = document.querySelector('[data-hero]');
  const countEl = plot && plot.querySelector('[data-field-count]');
  const flowEl = plot && plot.querySelector('[data-field-flow]');
  if (!plot || !canvas || !linesEl || !hero) return;

  const fine = mq('(hover: hover) and (pointer: fine)');
  const phone = !fine || mq('(max-width: 720px)');

  // gl.js rules out small touch screens by default; the approved design runs a lighter field there (2,048 points,
  // DPR <= 1.5), so that one reason is overridden. Reduced motion, save-data, low memory and no WebGL still win.
  const support = glSupport();
  if (!support.ok && support.reason !== 'small-touch') {
    reportFallback(plot, support.reason);
    if (countEl) countEl.textContent = '0';
    return;
  }

  let field = null;
  try { field = createField({ canvas, plot, linesEl, phone }); } catch { field = null; }
  if (!field) { reportFallback(plot, 'no-webgl'); return; }
  field.setColors();

  /* state shared with the frame */
  const mouse = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, inside: false };
  let mouseOn = 0, flowT = 12, speed = 1, vy = 0, lastY = window.scrollY;
  let settleS = 0, lastFlow = '', flowAt = 0;
  let front = -0.1;   // the stream switches on left to right once the hero shows
  let booting = true, released = false;
  let heroH = hero.offsetHeight;
  let rect = canvas.getBoundingClientRect();

  whenIntroDone().then(() => { released = true; });

  if (fine) {
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mouse.tx = e.clientX; mouse.ty = e.clientY; mouse.inside = true;
    }, { passive: true });
    root.addEventListener('pointerleave', () => { mouse.inside = false; });
  }

  // Scroll distance over which the points settle: the pinned stretch when the hero is pinned, else most of the hero.
  const holdEl = hero.querySelector('.hero__hold');
  const stageEl = hero.querySelector('.hero__stage');
  const measureHold = () => {
    const pinned = holdEl && stageEl ? holdEl.offsetHeight - stageEl.offsetHeight : 0;
    return pinned > 40 ? pinned : heroH * 0.55;
  };
  let holdPx = measureHold();
  try { new ResizeObserver(() => { heroH = hero.offsetHeight; holdPx = measureHold(); }).observe(hero); } catch {}

  const loop = createGLLoop({
    canvas,
    root: plot,
    target: plot,
    resize: (cw, ch) => { field.resize(cw, ch); rect = canvas.getBoundingClientRect(); },
    onRestore: () => field.restore(),
    render: (t, dt) => {
      const ms = dt * 1000 || 16;
      // scroll velocity speeds the stream; it eases back to 1x
      const y = window.scrollY;
      const inst = (y - lastY) / Math.max(1, ms);
      lastY = y;
      vy += (inst - vy) * 0.18;
      const target = 1 + Math.min(Math.abs(vy) * 1.4, 4.5);
      speed += (target - speed) * (target > speed ? 0.12 : 0.04);

      // settle: the hero holds for half a screen on every device tall enough to pin it
      const settle = clamp(y / Math.max(1, holdPx));
      settleS += (settle - settleS) * 0.1;
      if (Math.abs(settle - settleS) < 0.0005) settleS = settle;
      const eased = settleS * settleS * (3 - 2 * settleS);
      flowT += dt * speed * (1 - eased * 0.85);

      if (booting && released) {
        front = Math.min(1.2, front + ms / 900);
        if (front >= 1.2) booting = false;
      }

      rect = canvas.getBoundingClientRect();
      if (mouse.inside) {
        const mx = mouse.tx - rect.left, my = mouse.ty - rect.top;
        const inBox = mx > -60 && my > -60 && mx < rect.width + 60 && my < rect.height + 60;
        if (mouse.x < -1000) { mouse.x = mx; mouse.y = my; }
        mouse.x += (mx - mouse.x) * 0.12; mouse.y += (my - mouse.y) * 0.12;
        mouseOn += ((inBox ? 1 : 0) - mouseOn) * 0.06;
      } else mouseOn += (0 - mouseOn) * 0.06;

      field.draw({ flowT, mouse, mouseOn, settle: eased, front });

      if (flowEl && performance.now() - flowAt > 120) {
        const f = (speed * (1 - eased * 0.85)).toFixed(2);
        if (f !== lastFlow) { flowEl.textContent = f; lastFlow = f; }
        flowAt = performance.now();
      }
    },
  });

  document.addEventListener('theme:change', () => field.setColors());

  if (countEl) {
    countEl.textContent = field.count.toLocaleString('en-US');
    countEl.setAttribute('data-tick', '');
    observe(countEl.parentElement);
  }
  loop.start();
}

/* ------------------------------------------------------------------ nav readout */
function initReadout() {
  const nameEl = document.querySelector('[data-readout-name]');
  const pctEl = document.querySelector('[data-readout-pct]');
  if (!nameEl && !pctEl) return;

  const names = new Map();
  document.querySelectorAll('[data-header] [data-nav]').forEach((a) => {
    const id = (a.getAttribute('href') || '').replace('#', '');
    const text = [...a.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    if (id) names.set(id, text || id);
  });
  document.addEventListener('nav:change', (e) => {
    const id = e.detail && e.detail.id;
    if (nameEl) nameEl.textContent = id ? (names.get(id) || id) : 'Index';
  });

  let last = -1, queued = false;
  const update = () => {
    queued = false;
    const max = Math.max(1, root.scrollHeight - innerHeight);
    const pct = Math.round(clamp(window.scrollY / max) * 100);
    if (pct !== last && pctEl) { pctEl.textContent = String(pct).padStart(3, '0'); last = pct; }
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}

export function init() {
  try { initReadout(); } catch {}
  try { if (!reduced()) initField(); else reportFallback(document.querySelector('[data-plot]'), 'reduced-motion'); } catch {}
}
