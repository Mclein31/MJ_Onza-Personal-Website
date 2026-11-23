/**
 * gl.js: helpers for the site's single WebGL piece. Renderer-agnostic (works with OGL, three.js or raw WebGL):
 * it decides IF WebGL should run, caps the DPR, drives a render loop that sleeps when nobody can see it, and
 * reports a fallback so the static poster can take over. Standalone (no GSAP, no OGL import).
 *
 * Never throws. A render callback that throws is caught: the loop stops and a fallback is reported.
 *
 * TYPICAL USE
 *   const support = glSupport();
 *   if (!support.ok) { reportFallback(host, support.reason); return; }          // poster stays
 *   const renderer = new Renderer({ dpr: clampDpr(), alpha: true });             // OGL
 *   host.append(renderer.gl.canvas);
 *   const loop = createGLLoop({
 *     canvas: renderer.gl.canvas, root: host,
 *     resize: (w, h, dpr) => renderer.setSize(w, h),                              // CSS px; call-site applies dpr
 *     render: (t, dt) => { program.uniforms.uTime.value = t; renderer.render({ scene: mesh }); },
 *     onRestore: () => { rebuild GPU resources },                                 // after webglcontextrestored
 *   });
 *   loop.start();
 *
 * HOOKS
 *   `root` option (default: canvas.parentElement) receives the state classes and events below. Hook-free otherwise:
 *   the poster element and the canvas are styled by the design from those classes.
 *
 * STATE CLASSES (on root)
 *   is-gl-ready      the first frame has been rendered; hide the poster under this class
 *   is-gl-fallback   WebGL is not running (reason in data-gl-fallback); show the poster
 *   is-gl-paused     loop is sleeping (offscreen or tab hidden); the last frame stays on the canvas
 *
 * EVENTS (bubbling CustomEvents dispatched on root)
 *   gl:ready      detail { }
 *   gl:fallback   detail { reason }  'no-webgl' | 'save-data' | 'low-memory' | 'reduced-motion' | 'small-touch' |
 *                                    'context-lost' | 'render-error'
 *   gl:recovered  detail { }         context restored after a loss, loop resumes
 *   gl:pause      detail { reason }  'offscreen' | 'hidden'
 *   gl:resume     detail { }
 *
 * API
 *   glSupport(opts?)  -> { ok, reason }        opts: { minMemory = 4, allowSoftware = false, force = false }
 *                       checks, in order: reduced motion, saveData / slow network, deviceMemory < minMemory,
 *                       no fine pointer on a phone-sized screen (short side < 700 css px), then a real context test
 *                       (failIfMajorPerformanceCaveat unless allowSoftware). Result is cached per option set.
 *   canUseWebGL(opts?)-> boolean               glSupport(opts).ok
 *   clampDpr(max = 1.5, phoneMax = 1) -> number   min(devicePixelRatio, max); phoneMax on coarse-pointer screens
 *   reportFallback(root, reason) / clearFallback(root)
 *   createGLLoop({ canvas, render, resize, root, target, margin = '0px', maxFps = 0, onFallback, onRestore })
 *     -> { start(), stop(), destroy(), renderOnce(), state() }
 *     state() -> { started, running, visible, tabVisible, contextLost, fallback: string|null, frames }
 *     The loop runs only while started && visible (IntersectionObserver on `target`, default canvas) &&
 *     tab visible && no context loss && motion not reduced. It never uses a timer when asleep.
 *     render(timeSeconds, deltaSeconds) is clamped to dt <= 0.1; resize(w, h, dpr) fires from a ResizeObserver on
 *     `target` (and once on start).
 */

const mq = (q) => { try { return matchMedia(q); } catch { return null; } };
const matches = (q) => !!mq(q)?.matches;
const reduced = () => matches('(prefers-reduced-motion: reduce)');
const coarse = () => !matches('(pointer: fine)');

/* ---------- capability ---------- */

const cache = new Map();

function contextTest(allowSoftware) {
  let canvas;
  try {
    canvas = document.createElement('canvas');
    const attrs = { failIfMajorPerformanceCaveat: !allowSoftware, powerPreference: 'low-power', antialias: false };
    const gl = canvas.getContext('webgl2', attrs) || canvas.getContext('webgl', attrs);
    if (!gl) return false;
    try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch {}   // free the probe context at once
    return true;
  } catch { return false; } finally { canvas = null; }
}

export function glSupport({ minMemory = 4, allowSoftware = false, force = false } = {}) {
  const key = `${minMemory}|${allowSoftware}`;
  try {
    if (!force && cache.has(key)) {
      // reduced motion is live, everything else is stable for the page's life
      const hit = cache.get(key);
      return hit.ok && reduced() ? { ok: false, reason: 'reduced-motion' } : hit;
    }
    let res;
    const conn = navigator.connection;
    if (reduced()) res = { ok: false, reason: 'reduced-motion' };
    else if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) res = { ok: false, reason: 'save-data' };
    else if (Number.isFinite(navigator.deviceMemory) && navigator.deviceMemory < minMemory) res = { ok: false, reason: 'low-memory' };
    else if (coarse() && Math.min(innerWidth, innerHeight) < 700) res = { ok: false, reason: 'small-touch' };
    else if (!contextTest(allowSoftware)) res = { ok: false, reason: 'no-webgl' };
    else res = { ok: true, reason: null };
    if (res.reason !== 'reduced-motion') cache.set(key, res);
    return res;
  } catch { return { ok: false, reason: 'no-webgl' }; }
}

export const canUseWebGL = (opts) => glSupport(opts).ok;

export function clampDpr(max = 1.5, phoneMax = 1) {
  try {
    const dpr = window.devicePixelRatio || 1;
    return Math.max(1, Math.min(dpr, coarse() ? Math.min(max, phoneMax) : max));
  } catch { return 1; }
}

/* ---------- fallback reporting ---------- */

const emit = (root, name, detail = {}) => { try { root?.dispatchEvent(new CustomEvent(name, { bubbles: true, detail })); } catch {} };

export function reportFallback(root, reason) {
  try {
    if (!root) return;
    root.classList.add('is-gl-fallback');
    root.classList.remove('is-gl-ready', 'is-gl-paused');
    root.setAttribute('data-gl-fallback', reason);
    emit(root, 'gl:fallback', { reason });
  } catch {}
}

export function clearFallback(root) {
  try {
    if (!root) return;
    root.classList.remove('is-gl-fallback');
    root.removeAttribute('data-gl-fallback');
  } catch {}
}

/* ---------- render loop ---------- */

export function createGLLoop({ canvas, render, resize, root, target, margin = '0px', maxFps = 0, onFallback, onRestore } = {}) {
  const host = root || canvas?.parentElement || null;
  const watch = target || canvas;
  const s = { started: false, visible: false, tabVisible: document.visibilityState !== 'hidden', contextLost: false, destroyed: false, fallback: null, frames: 0, ready: false };
  let raf = 0, last = 0, t0 = 0, acc = 0, running = false;
  let io = null, ro = null, resizeRaf = 0;
  const minDelta = maxFps > 0 ? 1000 / maxFps : 0;
  const noop = { start() {}, stop() {}, destroy() {}, renderOnce() {}, state: () => ({ ...s, running: false }) };
  if (!canvas || typeof render !== 'function') return noop;

  const setFallback = (reason) => {
    if (s.fallback === reason) return;
    s.fallback = reason;
    if (reason) { reportFallback(host, reason); try { onFallback?.(reason); } catch {} }
    else { clearFallback(host); try { onFallback?.(null); } catch {} }
  };

  const shouldRun = () => s.started && s.visible && s.tabVisible && !s.contextLost && !s.destroyed && !s.fallback;

  const frame = (now) => {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (minDelta && now - last < minDelta - 1) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += dt;
    drawOnce(acc, dt);
  };

  function drawOnce(t, dt) {
    try {
      render(t, dt);
      s.frames += 1;
      if (!s.ready) {
        s.ready = true;
        host?.classList.add('is-gl-ready');
        emit(host, 'gl:ready');
      }
    } catch {
      stopLoop();
      setFallback('render-error');
    }
  }

  function sleepReason() { return !s.tabVisible ? 'hidden' : 'offscreen'; }

  function sync() {
    const want = shouldRun();
    if (want && !running) {
      running = true;
      last = performance.now();
      host?.classList.remove('is-gl-paused');
      if (s.ready) emit(host, 'gl:resume');
      raf = requestAnimationFrame(frame);
    } else if (!want && running) {
      stopLoop();
      if (!s.fallback && !s.contextLost) { host?.classList.add('is-gl-paused'); emit(host, 'gl:pause', { reason: sleepReason() }); }
    }
  }

  function stopLoop() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  /* observers and listeners */
  try {
    io = new IntersectionObserver((entries) => {
      const e = entries[entries.length - 1];
      s.visible = !!e?.isIntersecting;
      sync();
    }, { rootMargin: margin, threshold: 0 });
    io.observe(watch);
  } catch { s.visible = true; }   // no IO: keep running (tab-hidden pause still applies)

  const onVis = () => { s.tabVisible = document.visibilityState !== 'hidden'; sync(); };
  document.addEventListener('visibilitychange', onVis);

  const onLost = (e) => {
    try { e.preventDefault(); } catch {}      // required, otherwise the browser never restores the context
    s.contextLost = true;
    stopLoop();
    setFallback('context-lost');
  };
  const onRestored = () => {
    s.contextLost = false;
    try { onRestore?.(); } catch { setFallback('render-error'); return; }
    s.ready = false;
    setFallback(null);
    emit(host, 'gl:recovered');
    sync();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  const reduceMQ = mq('(prefers-reduced-motion: reduce)');
  const onReduce = () => {
    if (reduceMQ?.matches) { stopLoop(); setFallback('reduced-motion'); }
    else if (s.fallback === 'reduced-motion') { setFallback(null); sync(); }
  };
  try { reduceMQ?.addEventListener('change', onReduce); } catch {}

  const callResize = () => {
    resizeRaf = 0;
    if (typeof resize !== 'function') return;
    try {
      const r = watch.getBoundingClientRect();
      resize(Math.round(r.width), Math.round(r.height), clampDpr());
    } catch {}
  };
  try {
    ro = new ResizeObserver(() => { if (!resizeRaf) resizeRaf = requestAnimationFrame(callResize); });
    ro.observe(watch);
  } catch {}

  return {
    start() {
      if (s.destroyed) return;
      if (reduced()) { setFallback('reduced-motion'); return; }
      s.started = true;
      callResize();
      sync();
    },
    stop() { s.started = false; sync(); },
    renderOnce() { if (!s.destroyed && !s.contextLost) drawOnce(acc, 0); },
    destroy() {
      s.destroyed = true;
      stopLoop();
      try { io?.disconnect(); ro?.disconnect(); } catch {}
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      try { reduceMQ?.removeEventListener('change', onReduce); } catch {}
    },
    state: () => ({ started: s.started, running, visible: s.visible, tabVisible: s.tabVisible, contextLost: s.contextLost, fallback: s.fallback, frames: s.frames }),
  };
}
