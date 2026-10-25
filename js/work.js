/* ==========================================================================
   Work — pinned horizontal scroll
   ========================================================================== */
import { $, $$, clamp, reducedMotion } from './util.js';

export function initWork() {
  const section = $('#work');
  const pin = $('[data-work-pin]');
  const track = $('[data-work-track]');
  if (!section || !pin || !track) return;

  const projects = $$('.project:not(.project--more)', track);
  const countEl = $('[data-work-count]');
  const bar = $('.work__bar');
  const total = String(projects.length).padStart(2, '0');
  const wide = matchMedia('(min-width: 861px)');
  let distance = 0, ticking = false;

  const setCount = (i) => {
    if (countEl) countEl.textContent = `${String(i + 1).padStart(2, '0')} / ${total}`;
  };

  const measure = () => {
    const pinned = wide.matches && !reducedMotion.matches;
    section.classList.toggle('is-pinned', pinned);
    if (!pinned) {
      pin.style.height = '';
      track.style.removeProperty('--x');
      return;
    }
    const last = track.lastElementChild;
    const end = last.offsetLeft + last.offsetWidth + parseFloat(getComputedStyle(track).paddingRight);
    distance = Math.max(0, end - track.clientWidth);
    pin.style.height = `${innerHeight + distance}px`;
    update();
  };

  const update = () => {
    ticking = false;
    if (!section.classList.contains('is-pinned')) return;
    const p = clamp(-pin.getBoundingClientRect().top / Math.max(1, distance), 0, 1);
    track.style.setProperty('--x', `${-p * distance}px`);
    bar?.style.setProperty('--wp', p);

    let nearest = 0, best = Infinity;
    projects.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const off = Math.abs(r.left + r.width / 2 - innerWidth / 2);
      if (off < best) { best = off; nearest = i; }
    });
    setCount(nearest);
  };

  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', measure);
  wide.addEventListener('change', measure);
  addEventListener('load', measure);
  measure();
}
