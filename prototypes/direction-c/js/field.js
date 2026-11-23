// The one WebGL piece: a slow orange and cobalt light field seen through the frosted hero plane.
// Raw WebGL1, one triangle, one fragment shader. Intensifies with scroll velocity, dims as the hero leaves,
// follows the pointer as a third soft light. Paused offscreen and in hidden tabs; DPR capped; static poster fallback.

const VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uEnergy;
uniform float uDim;
uniform vec2 uPtr;
uniform float uPtrOn;
uniform float uStrength;
uniform vec3 uBase;
uniform vec3 uOrange;
uniform vec3 uCobalt;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  float t = uTime;

  // domain warp: the light never sits still, it drifts like heat behind glass
  vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t * 0.07)), fbm(p * 1.3 + vec2(5.2, -t * 0.06)));
  vec2 w = p + (q - 0.5) * (0.6 + 0.45 * uEnergy);

  vec2 oC = vec2(asp * (0.16 + 0.2 * sin(t * 0.11)), 0.16 + 0.2 * cos(t * 0.09));
  vec2 cC = vec2(asp * (-0.26 + 0.12 * cos(t * 0.08)), -0.24 + 0.16 * sin(t * 0.10));

  float o = exp(-dot(w - oC, w - oC) * (2.8 - 1.1 * uEnergy));
  float c = exp(-dot(w - cC, w - cC) * (2.4 - 0.7 * uEnergy));
  float body = fbm(w * 2.6 + t * 0.05);
  o *= 0.7 + 0.6 * body;
  c *= 0.78 + 0.44 * body;

  vec2 pp = (uPtr - 0.5) * vec2(asp, 1.0);
  float ptr = exp(-dot(w - pp, w - pp) * 7.0) * uPtrOn;

  float s = uStrength * (0.86 + 0.3 * uEnergy) * (1.0 - 0.82 * uDim);
  vec3 col = uBase;
  col = mix(col, uCobalt, clamp(c * 0.95 * s, 0.0, 0.74));
  col = mix(col, uOrange, clamp((o * 1.05 + ptr * 0.55) * s, 0.0, 0.94));
  col = mix(col, uBase, 0.06);                // frost: everything seen through a milky pane
  col += (uv.y - 0.45) * 0.04 * uStrength;    // a faint top-lit sheen
  gl_FragColor = vec4(col, 1.0);
}`;

function hexToRgb(hex) {
  const h = hex.trim().replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function initField(plane, { reduce }) {
  const canvas = plane.querySelector('[data-field]');
  const api = { setVelocity() {}, setDim() {}, refreshColors() {}, isStatic: true };

  const conn = navigator.connection;
  const weak = (conn && conn.saveData) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  let gl = null;
  if (!reduce && !weak && canvas) {
    try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false }); } catch (e) { gl = null; }
  }
  const fallback = () => { plane.classList.add('is-static'); api.isStatic = true; };
  if (!gl) { fallback(); return api; }

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  } catch (e) {
    fallback();
    return api;
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['uRes', 'uTime', 'uEnergy', 'uDim', 'uPtr', 'uPtrOn', 'uStrength', 'uBase', 'uOrange', 'uCobalt'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

  api.isStatic = false;
  plane.classList.remove('is-static');

  const refreshColors = () => {
    const cs = getComputedStyle(document.documentElement);
    gl.uniform3fv(U.uBase, hexToRgb(cs.getPropertyValue('--field-base')));
    gl.uniform3fv(U.uOrange, hexToRgb(cs.getPropertyValue('--orange')));
    gl.uniform3fv(U.uCobalt, hexToRgb(cs.getPropertyValue('--cobalt')));
    gl.uniform1f(U.uStrength, parseFloat(cs.getPropertyValue('--field-strength')) || 1);
    if (!running) draw();
  };

  // Soft field: render below device resolution, the grain overlay keeps it crisp to the eye
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.uRes, w, h);
    }
  };

  let time = 7.0;
  let energy = 0; let energyTarget = 0;
  let dim = 0;
  let ptrX = 0.6, ptrY = 0.5, ptrTX = 0.6, ptrTY = 0.5, ptrOn = 0, ptrOnT = 0;
  let visible = true; let running = false; let last = 0; let raf = 0;

  function draw() {
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uEnergy, energy);
    gl.uniform1f(U.uDim, dim);
    gl.uniform2f(U.uPtr, ptrX, ptrY);
    gl.uniform1f(U.uPtrOn, ptrOn);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    // energy rises fast with a flick of the wheel and settles slowly
    energy += (energyTarget - energy) * (energyTarget > energy ? 0.14 : 0.03);
    energyTarget *= 0.92;
    time += dt * (0.55 + energy * 2.4);
    ptrX += (ptrTX - ptrX) * 0.06; ptrY += (ptrTY - ptrY) * 0.06;
    ptrOn += (ptrOnT - ptrOn) * 0.05;
    draw();
    raf = requestAnimationFrame(frame);
  }
  const start = () => {
    if (running || !visible || document.hidden) return;
    running = true; last = performance.now(); raf = requestAnimationFrame(frame);
  };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    visible ? start() : stop();
  }).observe(plane);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  new ResizeObserver(() => { resize(); if (!running) draw(); }).observe(canvas);

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) {
    window.addEventListener('pointermove', (e) => {
      const r = plane.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      const inside = x > -0.1 && x < 1.1 && y > -0.1 && y < 1.1;
      ptrOnT = inside ? 1 : 0;
      if (inside) { ptrTX = x; ptrTY = y; }
    }, { passive: true });
  }

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); fallback(); });

  resize();
  refreshColors();
  draw();
  start();

  api.setVelocity = (v) => { energyTarget = Math.max(energyTarget, Math.min(1, Math.abs(v) / 2200)); };
  api.setDim = (p) => { dim = Math.min(1, Math.max(0, p)); };
  api.refreshColors = refreshColors;
  return api;
}
