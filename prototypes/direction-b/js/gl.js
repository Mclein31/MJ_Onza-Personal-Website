// Exhibits as WebGL planes: each framed screenshot is one subdivided plane drawn over its DOM box.
// The plane arches with scroll velocity and swells under the pointer like glass over a print.
// Raw WebGL (2 when available for mipmaps), one fixed canvas, paused offscreen and in hidden tabs.

const VERT = `
attribute vec2 aPos;
uniform vec2 uView;
uniform vec4 uRect;
uniform float uBend;
uniform float uWave;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 uv = aPos;
  vec2 p = uRect.xy + uv * uRect.zw;
  float arch = sin(uv.x * 3.14159265);
  p.y += arch * uBend;
  p.y += sin(uv.x * 7.0 + uTime * 2.2) * uWave * arch;
  vec2 c = p / uView * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
  vUv = uv;
}`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uFrame;
uniform vec2 uMat;
uniform vec3 uFrameColor;
uniform vec2 uMouse;
uniform float uHover;
uniform float uAspect;
uniform float uReveal;
uniform float uDim;
uniform float uLoaded;
varying vec2 vUv;
void main() {
  if (vUv.y < 1.0 - uReveal) discard;
  vec2 uv = vUv;
  if (uv.x < uFrame.x || uv.x > 1.0 - uFrame.x || uv.y < uFrame.y || uv.y > 1.0 - uFrame.y) {
    gl_FragColor = vec4(uFrameColor, 1.0);
    return;
  }
  vec3 white = vec3(1.0);
  if (uv.x < uMat.x || uv.x > 1.0 - uMat.x || uv.y < uMat.y || uv.y > 1.0 - uMat.y) {
    gl_FragColor = vec4(white * uDim, 1.0);
    return;
  }
  vec2 iuv = (uv - uMat) / (1.0 - 2.0 * uMat);
  vec2 d = iuv - uMouse;
  vec2 da = vec2(d.x * uAspect, d.y);
  float r = length(da);
  float lens = (1.0 - smoothstep(0.0, 0.26, r)) * uHover;
  iuv -= d * lens * 0.22;
  // the screenshots are devices on a transparent ground: lay them on the white mat
  vec4 tx = texture2D(uTex, clamp(iuv, 0.0, 1.0));
  vec3 col = mix(white, tx.rgb, tx.a * uLoaded);
  gl_FragColor = vec4(col * uDim, 1.0);
}`;

const SEG_X = 32;
const SEG_Y = 12;

function hexToRgb(hex) {
  const h = hex.trim().replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function canUseGL() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.innerWidth < 900 || window.matchMedia('(pointer: coarse)').matches) return false;
  const mem = navigator.deviceMemory;
  if ((mem && mem < 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)) return false;
  if (navigator.connection && navigator.connection.saveData) return false;
  return true;
}

export function createExhibitGL(canvas, { onReady } = {}) {
  const opts = { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'default' };
  const gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts);
  if (!gl) return null;
  const isGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn('[exhibition] WebGL unavailable, keeping the DOM pictures.', err);
    return null;
  }
  gl.useProgram(prog);

  // grid geometry shared by every plane
  const verts = [];
  for (let y = 0; y <= SEG_Y; y++) for (let x = 0; x <= SEG_X; x++) verts.push(x / SEG_X, y / SEG_Y);
  const idx = [];
  for (let y = 0; y < SEG_Y; y++) {
    for (let x = 0; x < SEG_X; x++) {
      const a = y * (SEG_X + 1) + x;
      const b = a + 1;
      const c = a + SEG_X + 1;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['uView', 'uRect', 'uBend', 'uWave', 'uTime', 'uTex', 'uFrame', 'uMat', 'uFrameColor', 'uMouse', 'uHover', 'uAspect', 'uReveal', 'uDim', 'uLoaded']
    .forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
  gl.uniform1i(U.uTex, 0);

  const planes = [];
  let dpr = 1;
  let vw = 0;
  let vh = 0;
  let frameColor = [0.09, 0.09, 0.1];
  let dim = 1;
  let scrollVel = 0;
  let lastY = window.scrollY;
  let lastT = performance.now();
  let mouse = { x: -9999, y: -9999 };
  let running = false;
  let raf = 0;
  let readyFired = false;

  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    frameColor = hexToRgb(cs.getPropertyValue('--frame') || '#16171A');
    dim = parseFloat(cs.getPropertyValue('--img-dim')) || 1;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    vw = document.documentElement.clientWidth;
    vh = window.innerHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    planes.forEach(measure);
  }

  function measure(p) {
    const frame = p.el.querySelector('.exhibit__frame');
    const mat = p.el.querySelector('.exhibit__mat');
    const fs = getComputedStyle(frame);
    const ms = getComputedStyle(mat);
    p.framePx = parseFloat(fs.paddingLeft) || 0;
    p.matPx = p.framePx + (parseFloat(ms.paddingLeft) || 0);
  }

  function makeTexture(img) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (isGL2) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  // Visibility drives the loop: nothing on screen means no frames are drawn.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const p = planes.find((q) => q.el === e.target);
      if (!p) return;
      p.visible = e.isIntersecting;
    });
    if (planes.some((p) => p.visible)) start();
  }, { rootMargin: '25% 0px 25% 0px' });

  function add(el, { cover = null, revealOnEnter = true } = {}) {
    const img = el.querySelector('img');
    const p = {
      el, img, cover, tex: null, loaded: 0, visible: false, hover: 0, hoverTarget: 0,
      mx: 0.5, my: 0.5, revealOnEnter, revealStart: revealOnEnter ? 0 : -1, framePx: 0, matPx: 0,
    };
    measure(p);
    planes.push(p);
    io.observe(el);
    const src = img.dataset.glSrc || img.currentSrc || img.src;
    const tImg = new Image();
    tImg.decoding = 'async';
    tImg.src = src;
    tImg.decode().then(() => {
      p.tex = makeTexture(tImg);
      p.loaded = 1;
      el.classList.add('is-gl');
      if (!readyFired && el.hasAttribute('data-hero-exhibit')) { readyFired = true; onReady && onReady(); }
      start();
    }).catch(() => { /* keep the DOM picture */ });

    el.addEventListener('pointerenter', () => { p.hoverTarget = 1; start(); });
    el.addEventListener('pointerleave', () => { p.hoverTarget = 0; });
    return p;
  }

  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  function ease(t) { return 1 - Math.pow(1 - t, 4); }

  function render(now) {
    raf = 0;
    if (document.hidden) { running = false; return; }
    const dt = Math.max(1, now - lastT);
    lastT = now;
    const y = window.scrollY;
    const raw = ((y - lastY) / dt) * 16.67; // px per 60fps frame
    lastY = y;
    scrollVel += (raw - scrollVel) * 0.12;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.SCISSOR_TEST);
    gl.uniform2f(U.uView, vw, vh);
    gl.uniform3fv(U.uFrameColor, frameColor);
    gl.uniform1f(U.uTime, now / 1000);

    let busy = Math.abs(scrollVel) > 0.05;
    for (const p of planes) {
      p.hover += (p.hoverTarget - p.hover) * 0.09;
      if (Math.abs(p.hover - p.hoverTarget) > 0.002) busy = true;
      if (!p.visible || !p.tex || p.held) continue;
      const r = p.el.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40 || r.width < 2) continue;

      // a later room sliding over this one hides the plane below its top edge
      let clipTop = 0;
      let clipBottom = vh;
      let shade = 0;
      if (p.cover) {
        const ct = p.cover.getBoundingClientRect().top;
        clipBottom = Math.min(clipBottom, ct);
        shade = Math.min(1, Math.max(0, 1 - ct / vh));
      }
      if (clipBottom <= clipTop) continue;

      let reveal = 1;
      if (p.revealStart > 0) {
        const t = (now - p.revealStart) / 1100;
        reveal = t <= 0 ? 0 : t >= 1 ? 1 : ease(t);
        if (t < 1) busy = true;
      } else if (p.revealStart === 0) {
        reveal = 0;
      }
      if (reveal <= 0) continue;

      // pointer in image space
      if (p.hoverTarget > 0) {
        const inset = p.matPx;
        p.mx = (mouse.x - r.left - inset) / Math.max(1, r.width - inset * 2);
        p.my = (mouse.y - r.top - inset) / Math.max(1, r.height - inset * 2);
      }

      const sx = Math.floor(r.left * dpr) - 2;
      const sy = Math.floor((vh - clipBottom) * dpr);
      const sh = Math.ceil((clipBottom - clipTop) * dpr);
      gl.scissor(Math.max(0, sx - 40), Math.max(0, sy), Math.ceil(r.width * dpr) + 84, sh);

      const bend = Math.max(-1, Math.min(1, scrollVel / 70)) * r.height * 0.034;
      const wave = Math.min(1, Math.abs(scrollVel) / 40) * 3 + p.hover * 1.2;
      gl.uniform4f(U.uRect, r.left, r.top, r.width, r.height);
      gl.uniform1f(U.uBend, bend);
      gl.uniform1f(U.uWave, wave);
      gl.uniform2f(U.uFrame, p.framePx / r.width, p.framePx / r.height);
      gl.uniform2f(U.uMat, p.matPx / r.width, p.matPx / r.height);
      gl.uniform2f(U.uMouse, p.mx, p.my);
      gl.uniform1f(U.uHover, p.hover);
      gl.uniform1f(U.uAspect, (r.width - p.matPx * 2) / Math.max(1, r.height - p.matPx * 2));
      gl.uniform1f(U.uReveal, reveal);
      gl.uniform1f(U.uDim, dim * (1 - shade * 0.22));
      gl.uniform1f(U.uLoaded, p.loaded);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, p.tex);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    }

    const anyVisible = planes.some((p) => p.visible);
    if (anyVisible || busy) raf = requestAnimationFrame(render);
    else running = false;
  }

  // Scroll can move planes without any other change: the loop keeps going while something is on screen.
  function start() {
    if (running || document.hidden) return;
    running = true;
    lastT = performance.now();
    lastY = window.scrollY;
    raf = requestAnimationFrame(render);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; running = false; } else start();
  });
  window.addEventListener('resize', () => { resize(); start(); });
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    running = false;
    document.documentElement.classList.remove('gl-on');
    planes.forEach((p) => p.el.classList.remove('is-gl'));
  });

  readTheme();
  resize();
  document.documentElement.classList.add('gl-on');

  return {
    add,
    refreshTheme() { readTheme(); start(); },
    resize,
    hold(el, held) { const p = planes.find((q) => q.el === el); if (p) { p.held = held; start(); } },
    reveal(el) { const p = planes.find((q) => q.el === el); if (p && p.revealStart === 0) { p.revealStart = performance.now(); start(); } },
  };
}
