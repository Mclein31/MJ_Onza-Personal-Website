import { $, store, reducedMotion } from './util.js';

// Counts 0 → 100 once per session, then wipes away. Resolves when the hero may animate in.
export function initPreloader() {
  const el = $('.preloader');
  const root = document.documentElement;
  if (!el || root.classList.contains('no-preload') || reducedMotion.matches) {
    root.classList.add('no-preload');
    return Promise.resolve();
  }

  const countEl = $('[data-count]', el);
  const bar = $('.preloader__bar i', el);
  const duration = 1300;
  let start;

  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      store.set('pf-loaded', '1', sessionStorage);
      setTimeout(() => {
        el.classList.add('is-done');
        resolve();
        setTimeout(() => el.remove(), 900);
      }, 180);
    };
    // Failsafe: rAF pauses in background tabs, so never let the loader hold the page hostage
    setTimeout(finish, duration + 1300);

    const tick = (t) => {
      if (finished) return;
      start ??= t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      countEl.textContent = String(Math.round(eased * 100)).padStart(3, '0');
      bar.style.setProperty('--p', eased);
      if (p < 1) requestAnimationFrame(tick);
      else finish();
    };
    requestAnimationFrame(tick);
  });
}
