import { $, store, reducedMotion } from './util.js';

// Counts 0 → 100 once per session, then wipes away. Resolves at 100 so the hero rises under the wipe.
export function initPreloader() {
  const el = $('.preloader');
  const root = document.documentElement;
  if (!el || root.classList.contains('no-preload') || reducedMotion.matches) {
    root.classList.add('no-preload');
    return Promise.resolve();
  }

  const countEl = $('[data-count]', el);
  const bar = $('.preloader__bar i', el);
  const duration = 750;
  const start = performance.now();

  const paint = (p) => {
    const eased = 1 - Math.pow(1 - p, 3);
    countEl.textContent = String(Math.round(eased * 100)).padStart(3, '0');
    bar.style.setProperty('--p', eased);
  };

  return new Promise((resolve) => {
    let finished = false;
    // Timed by the clock, not by frames: a busy or background tab can starve rAF, and the
    // loader should still take exactly `duration`. rAF only paints the counter.
    setTimeout(() => {
      finished = true;
      paint(1);
      store.set('pf-loaded', '1', sessionStorage);
      resolve();
      setTimeout(() => {
        el.classList.add('is-done');
        setTimeout(() => el.remove(), 900);
      }, 120);
    }, duration);

    const tick = () => {
      if (finished) return;
      paint(Math.min(1, (performance.now() - start) / duration));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
