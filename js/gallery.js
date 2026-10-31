/* ==========================================================================
   Galleries — project screenshots
   ========================================================================== */
import { $, $$, clamp, arrowKeys } from './util.js';
import { openViewer } from './lightbox.js';

export function initGalleries() {
  $$('[data-gallery]').forEach((gallery) => {
    const track = $('[data-gallery-track]', gallery);
    const slides = $$('.gallery__slide', track);
    const dotsEl = $('[data-gallery-dots]', gallery);
    const current = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));

    // Tap a slide (or press Enter, or the expand button) to see the set larger, with a note per slide
    const shots = slides.map((f) => {
      const img = $('img', f);
      return { src: img.currentSrc || img.src, title: f.dataset.title || img.alt, desc: f.dataset.desc || '' };
    });
    const zoom = (from) => openViewer(shots, current(), from);
    let dragged = false;
    track.addEventListener('click', (e) => { if (!dragged && e.target.closest('.gallery__slide')) zoom(track); });
    track.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target === track) { e.preventDefault(); zoom(track); } });
    $('[data-gallery-zoom]', gallery)?.addEventListener('click', (e) => zoom(e.currentTarget));
    if (slides.length < 2 || !dotsEl) { track.tabIndex = 0; return; }

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

    let down = false, sx = 0, sl = 0;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; dragged = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-dragging');
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      if (Math.abs(e.clientX - sx) > 6) dragged = true;
      track.scrollLeft = sl - (e.clientX - sx);
    });
    // A drag must not also open the viewer: the click that ends it lands before this timeout
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false; track.classList.remove('is-dragging'); go(current());
      setTimeout(() => { dragged = false; });
    });
  });
}
