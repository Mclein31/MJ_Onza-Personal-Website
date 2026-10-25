import { $, $$, clamp, arrowKeys } from './util.js';

// Screenshot galleries inside project cards: native swipe/trackpad, plus buttons, dots, arrow keys and mouse drag
export function initGalleries() {
  $$('[data-gallery]').forEach((gallery) => {
    const track = $('[data-gallery-track]', gallery);
    const slides = $$('.gallery__slide', track);
    const dotsEl = $('[data-gallery-dots]', gallery);
    if (slides.length < 2 || !dotsEl) return;

    const current = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    const go = (i) => track.scrollTo({ left: clamp(i, 0, slides.length - 1) * track.clientWidth, behavior: 'smooth' });

    const dots = slides.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', `Screenshot ${i + 1} of ${slides.length}`);
      d.addEventListener('click', () => go(i));
      dotsEl.append(d);
      return d;
    });
    const sync = () => dots.forEach((d, i) => d.setAttribute('aria-current', String(i === current())));
    sync();
    track.addEventListener('scroll', sync, { passive: true });

    $('[data-gallery-prev]', gallery).addEventListener('click', () => go(current() === 0 ? slides.length - 1 : current() - 1));
    $('[data-gallery-next]', gallery).addEventListener('click', () => go(current() === slides.length - 1 ? 0 : current() + 1));
    arrowKeys(track, current, go);

    // Mouse drag (touch scrolls natively)
    let down = false, sx = 0, sl = 0;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-dragging');
    });
    addEventListener('pointermove', (e) => { if (down) track.scrollLeft = sl - (e.clientX - sx); });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false; track.classList.remove('is-dragging'); go(current());
    });
  });
}
