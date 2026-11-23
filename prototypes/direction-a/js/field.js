// The one WebGL piece: a point field that streams like data through a pipeline.
// Extract (scattered records) -> Transform (a narrow pipe) -> Load (ordered rows).
// Positions are a pure function of time in the vertex shader, so there is no simulation state to keep.
// Scroll settles every point onto the page's column hairlines; the cursor parts the stream gently.

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
  float s1 = smoothstep(0.12, 0.47, x);
  float s2 = smoothstep(0.53, 0.86, x);
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
  gl_PointSize = mix(2.0, 2.7, aMeta.y) * uDpr;
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
  float a = 1.0 - smoothstep(0.3, 0.5, length(c));
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

function hexToRgb(str) {
  const s = str.trim().replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function shader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

/**
 * @param {{ canvas: HTMLCanvasElement, plot: HTMLElement, linesEl: HTMLElement, phone: boolean }} o
 * @returns field controller, or null when WebGL is unavailable
 */
export function createField({ canvas, plot, linesEl, phone }) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power', depth: false, stencil: false });
  if (!gl) return null;

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) {
    return null;
  }
  gl.useProgram(prog);

  const N = phone ? 2048 : 4096;
  const L = phone ? 8 : 12;
  const orangeLane = Math.round((L - 1) * 0.64);
  const nOrange = Math.round(N * 0.05);
  const nGrey = N - nOrange;

  const R = new Float32Array(N * 4);
  const M = new Float32Array(N * 2);
  const rand = rng(20281);
  for (let i = 0; i < N; i++) {
    const orange = i >= nGrey;
    R[i * 4] = rand(); R[i * 4 + 1] = rand(); R[i * 4 + 2] = rand(); R[i * 4 + 3] = rand();
    let lane = orangeLane;
    if (!orange) { lane = Math.floor(rand() * (L - 1)); if (lane >= orangeLane) lane += 1; }
    M[i * 2] = lane / (L - 1);
    M[i * 2 + 1] = orange ? 1 : 0;
  }
  const T = new Float32Array(N * 2);

  function attrib(name, data, size, usage = gl.STATIC_DRAW) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    const loc = gl.getAttribLocation(prog, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    return buf;
  }
  attrib('aR', R, 4);
  attrib('aMeta', M, 2);
  const tBuf = attrib('aTarget', T, 2, gl.DYNAMIC_DRAW);

  const u = {};
  ['uT', 'uRes', 'uMouse', 'uMouseOn', 'uSettle', 'uDpr', 'uFront', 'uGrey', 'uOrange', 'uGreyA'].forEach((n) => { u[n] = gl.getUniformLocation(prog, n); });

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let w = 1, h = 1, dpr = 1, lost = false;
  let flowT = 12, speed = 1, mouseOn = 0;
  const mouse = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, inside: false };

  // Settle targets: every point lands on a column hairline (gutter centres), orange on one line.
  function computeTargets() {
    const cr = canvas.getBoundingClientRect();
    const cols = [...linesEl.children];
    if (!cols.length || cr.width === 0) return;
    const g = parseFloat(getComputedStyle(linesEl).columnGap) || 0;
    const xs = cols.map((c) => c.getBoundingClientRect().left - g / 2);
    xs.push(cols[cols.length - 1].getBoundingClientRect().right + g / 2);
    const lines = xs.map((x) => (x - cr.left) / cr.width);
    const oLine = Math.round((lines.length - 1) * 0.55);
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
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    computeTargets();
  }

  function setColors() {
    const cs = getComputedStyle(document.documentElement);
    const dark = cs.colorScheme.includes('dark');
    gl.uniform3fv(u.uGrey, hexToRgb(cs.getPropertyValue('--field')));
    gl.uniform3fv(u.uOrange, hexToRgb(cs.getPropertyValue('--orange')));
    gl.uniform1f(u.uGreyA, dark ? 0.62 : 0.5);
  }

  if (!phone) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mouse.tx = e.clientX; mouse.ty = e.clientY; mouse.inside = true;
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { mouse.inside = false; });
  }

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; plot.classList.remove('is-live'); });

  const ro = new ResizeObserver(() => resize());
  ro.observe(plot);
  resize();
  setColors();

  let first = true;
  /**
   * @param {{dt:number, vy:number}} s frame state
   * @param {number} settle 0..1
   * @param {number} front 0..1.2 boot sweep
   */
  function render(s, settle, front) {
    if (lost) return;
    // Scroll velocity speeds the stream; it eases back to 1x.
    const target = 1 + Math.min(Math.abs(s.vy) * 1.4, 4.5);
    speed += (target - speed) * (target > speed ? 0.12 : 0.04);
    flowT += (s.dt / 1000) * speed * (1 - settle * 0.85);

    const r = canvas.getBoundingClientRect();
    if (mouse.inside) {
      const mx = mouse.tx - r.left, my = mouse.ty - r.top;
      const inBox = mx > -60 && my > -60 && mx < r.width + 60 && my < r.height + 60;
      if (mouse.x < -1000) { mouse.x = mx; mouse.y = my; }
      mouse.x += (mx - mouse.x) * 0.12; mouse.y += (my - mouse.y) * 0.12;
      mouseOn += ((inBox ? 1 : 0) - mouseOn) * 0.06;
    } else mouseOn += (0 - mouseOn) * 0.06;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(u.uT, flowT);
    gl.uniform2f(u.uRes, w, h);
    gl.uniform2f(u.uMouse, mouse.x, mouse.y);
    gl.uniform1f(u.uMouseOn, mouseOn);
    gl.uniform1f(u.uSettle, settle);
    gl.uniform1f(u.uDpr, dpr);
    gl.uniform1f(u.uFront, front);
    gl.drawArrays(gl.POINTS, 0, N);
    if (first) { first = false; plot.classList.add('is-live'); }
  }

  return { count: N, render, setColors, resize, get speed() { return speed; }, get lost() { return lost; } };
}
