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
  // Pin only where a card, its text and the progress row fit one screen; portrait screens
  // (tablets) stack the cards full width instead of leaving the frame half empty
  const wide = matchMedia('(min-width: 861px) and (min-height: 600px) and (orientation: landscape)');
  let distance = 0, ticking = false, lastProgress = -1, current = -1;
  let centers = [];

  const setCount = (i) => {
    if (i === current) return;
    current = i;
    if (countEl) countEl.textContent = `${String(i + 1).padStart(2, '0')} / ${total}`;
  };

  const measure = () => {
    const pinned = wide.matches && !reducedMotion.matches;
    section.classList.toggle('is-pinned', pinned);
    if (!pinned) {
      pin.style.height = '';
      track.style.removeProperty('transform');
      lastProgress = -1;
      track.style.removeProperty('--gallery-max-height');
      return;
    }
    // Reserve the tallest description before sizing the shared gallery frame.
    // A fixed viewport allowance misses text wrapping on shorter laptop screens.
    const trackStyle = getComputedStyle(track);
    const cardStyle = getComputedStyle(projects[0]);
    const mediaStyle = getComputedStyle($('.project__media', projects[0]));
    const infoHeight = Math.max(...projects.map(card => $('.project__info', card).getBoundingClientRect().height));
    const galleryHeight = track.clientHeight
      - parseFloat(trackStyle.paddingTop) - parseFloat(trackStyle.paddingBottom)
      - infoHeight - parseFloat(cardStyle.rowGap)
      - parseFloat(mediaStyle.paddingTop) - parseFloat(mediaStyle.paddingBottom);
    track.style.setProperty('--gallery-max-height', `${Math.max(0, galleryHeight)}px`);
    const last = track.lastElementChild;
    const end = last.offsetLeft + last.offsetWidth + parseFloat(getComputedStyle(track).paddingRight);
    distance = Math.max(0, end - track.clientWidth);
    pin.style.height = `${innerHeight + distance}px`;
    centers = projects.map(card => card.offsetLeft + card.offsetWidth / 2);
    lastProgress = -1;
    update();
  };

  const update = () => {
    ticking = false;
    if (!section.classList.contains('is-pinned')) return;
    const p = clamp(-pin.getBoundingClientRect().top / Math.max(1, distance), 0, 1);
    if (p === lastProgress) return;
    lastProgress = p;
    track.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
    bar?.style.setProperty('--wp', p);

    let nearest = 0, best = Infinity;
    centers.forEach((center, i) => {
      const off = Math.abs(center - p * distance - innerWidth / 2);
      if (off < best) { best = off; nearest = i; }
    });
    setCount(nearest);
  };

  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', measure);
  wide.addEventListener('change', measure);
  addEventListener('load', measure);
  document.fonts.ready.then(measure);
  measure();
}
