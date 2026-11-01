import { $, $$, clamp, reducedMotion } from './util.js';
import { play } from './sfx.js';

export function initJourney() {
  const wrap = $('[data-years]');
  if (!wrap || reducedMotion.matches) return;
  const items = $$('.yr', wrap);
  const dots = $$('.years__dots i', wrap);
  const count = $('[data-yr-i]', wrap);
  wrap.classList.add('is-pinned');
  const list = $('.years__list', wrap);
  const measureFrame = () => {
    if (!list) return;
    if (innerWidth > 960) { list.style.removeProperty('--year-content'); return; }
    // Measure every slide's natural content without changing the scroll animation.
    list.style.setProperty('--year-content', '0px');
    const height = Math.max(...items.map(item => item.scrollHeight));
    list.style.setProperty('--year-content', `${Math.ceil(height)}px`);
  };
  let current = -1;

  const show = (k) => {
    if (k === current) return;
    if (current !== -1) play('step');
    current = k;
    items.forEach((it, i) => { it.classList.toggle('is-on', i === k); it.inert = i !== k; });
    dots.forEach((d, i) => d.classList.toggle('is-on', i === k));
    if (count) count.textContent = String(k + 1).padStart(2, '0');
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const r = wrap.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 0.9999);
    show(Math.floor(p * items.length));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', () => { measureFrame(); update(); });
  addEventListener('load', measureFrame);
  document.fonts?.ready.then(measureFrame);
  measureFrame();
  update();
}
