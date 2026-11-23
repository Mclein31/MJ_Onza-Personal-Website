// One rAF loop for the whole page: Lenis (when motion is allowed), scroll velocity, and frame subscribers.
import Lenis from '../vendor/lenis/lenis.js';

export function createLoop({ reduce }) {
  const subs = new Set();
  let lenis = null;

  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true, autoRaf: false });
    if (document.documentElement.classList.contains('has-loader')) lenis.stop();
  }

  let lastY = window.scrollY;
  let last = performance.now();
  let vy = 0;
  const state = { t: 0, dt: 16, y: lastY, vy: 0, vw: innerWidth, vh: innerHeight };

  function frame(t) {
    if (lenis) lenis.raf(t);
    const y = window.scrollY;
    const dt = Math.min(64, Math.max(1, t - last));
    last = t;
    const inst = (y - lastY) / dt;
    lastY = y;
    vy += (inst - vy) * 0.18;
    state.t = t; state.dt = dt; state.y = y; state.vy = vy;
    state.vw = innerWidth; state.vh = innerHeight;
    for (const fn of subs) fn(state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    state,
    lenis,
    on(fn) { subs.add(fn); return () => subs.delete(fn); },
    scrollTo(target, opts = {}) {
      if (lenis) lenis.scrollTo(target, { duration: 1.2, ...opts });
      else {
        const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + (opts.offset || 0);
        window.scrollTo({ top: y, behavior: 'auto' });
        opts.onComplete?.();
      }
    },
    start() { lenis?.start(); },
  };
}

// Absolute document top of an element, measured once per layout change.
export function docTop(el) {
  return el.getBoundingClientRect().top + window.scrollY;
}

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
