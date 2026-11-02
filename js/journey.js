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
  const shortLandscape = matchMedia('(max-width: 960px) and (max-height: 600px) and (orientation: landscape)');
  const measureFrame = () => {
    if (!list) return;
    wrap.classList.toggle('is-pinned', !shortLandscape.matches);
    items.forEach((item, index) => { item.inert = !shortLandscape.matches && index !== Math.max(0, current); });
    if (shortLandscape.matches) { list.style.removeProperty('--year-content'); return; }
    const portraitTablet = matchMedia('(max-width: 1100px) and (orientation: portrait)').matches;
    if (innerWidth > 960 && !portraitTablet) { list.style.removeProperty('--year-content'); return; }
    // Fit the active slide; shorter captions should not reserve the tallest slide’s space.
    const item = items[Math.max(0, current)];
    const height = Math.max(...[...item.children].map(child => child.offsetTop + child.offsetHeight));
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
    measureFrame();
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    if (shortLandscape.matches) return;
    const r = wrap.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 0.9999);
    show(Math.floor(p * items.length));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', () => { measureFrame(); update(); });
  // Safari can update orientation media queries after its resize event.
  shortLandscape.addEventListener('change', () => { measureFrame(); update(); });
  addEventListener('load', measureFrame);
  document.fonts?.ready.then(measureFrame);
  measureFrame();
  update();
}
