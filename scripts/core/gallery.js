/*
 * gallery.js: per-project screenshot gallery on a native scroll-snap track (the CSS owns layout and snapping;
 * this module only moves scrollLeft and reports state).
 *
 * HOOKS READ
 *   [data-gallery]                 root of one gallery
 *     [data-gallery-track]         the scrolling list; its direct children are the slides (required)
 *     [data-gallery-prev] [data-gallery-next]   buttons (wrap around at the ends)
 *     [data-gallery-dots]          optional: gets one <button data-gallery-dot> per slide
 *     [data-gallery-count]         optional: text "3 / 7"; inner [data-gallery-current] / [data-gallery-total] are filled too
 *     [data-gallery-zoom]          optional button: opens the current slide in the viewer / video window
 *   Slides:  data-title / data-desc (on the slide or its <img>) are the viewer caption for bare slides.
 *   Tapping a slide that already carries [data-lightbox] or [data-video-open] is handled by viewer.js / video.js.
 *   Tapping a bare slide (an <img>, no such trigger) opens the viewer on this gallery's image slides, at that slide.
 *   Keyboard: ArrowLeft / ArrowRight / Home / End anywhere inside the gallery; Enter on the focused track zooms.
 *   Mouse: click-and-drag on desktop (a drag never counts as a click); touch uses native scrolling.
 *
 * ATTRIBUTES / CLASSES WRITTEN (no styling)
 *   slide    .is-current + aria-current="true" on the current one; role="group" aria-roledescription="slide"
 *            aria-label="n of N" if the markup did not set them
 *   dots     aria-current="true" on the current one, aria-label "Screenshot n of N" ("Video n of N" for a video slide)
 *   track    tabindex=0 (keyboard reachable); .is-dragging while the mouse drags
 *   root     data-index (0-based current), data-count, .is-single when there is only one slide
 *   prev/next/dots/count get `hidden` when there is only one slide
 *   A <video> slide pauses when it leaves the current slide or the screen.
 *
 * EVENTS (CustomEvent on the [data-gallery] root, bubbles to document)
 *   gallery:change  { index, count, slide, previous, direction: 'next'|'prev', reason: 'button'|'dot'|'key'|'drag'|'scroll'|'viewer' }
 *
 * Reduced motion: every programmatic scroll jumps instead of animating.
 *
 * EXPORTS
 *   initGalleries()   wires every [data-gallery]; returns an array of controllers ({ root, go, index }); never throws
 */

import { $, $$, emit, reducedMotion } from './modal.js';
import { openViewer, itemFromElement } from './viewer.js';

const wired = new WeakSet();

function setup(root) {
  const track = $('[data-gallery-track]', root);
  if (!track) return null;
  const slides = [...track.children];
  if (!slides.length) return null;
  const n = slides.length;
  const prevBtn = $('[data-gallery-prev]', root);
  const nextBtn = $('[data-gallery-next]', root);
  const dotsEl = $('[data-gallery-dots]', root);
  const countEl = $('[data-gallery-count]', root);
  const zoomBtn = $('[data-gallery-zoom]', root);
  const single = n < 2;

  let active = 0, reason = null, goTarget = null, settleTimer = 0, raf = 0, dragged = false;
  root.dataset.count = String(n);
  root.classList.toggle('is-single', single);
  [prevBtn, nextBtn, dotsEl, countEl].forEach((el) => { if (el) el.hidden = single; });
  if (!track.hasAttribute('tabindex')) track.tabIndex = 0;

  slides.forEach((s, i) => {
    if (!s.hasAttribute('role')) s.setAttribute('role', 'group');
    if (!s.hasAttribute('aria-roledescription')) s.setAttribute('aria-roledescription', 'slide');
    if (!s.hasAttribute('aria-label')) s.setAttribute('aria-label', `${i + 1} of ${n}`);
  });

  const isVideo = (s) => !!s.querySelector('video, [data-video-open]');

  const dots = dotsEl && !single ? slides.map((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('data-gallery-dot', '');
    b.setAttribute('aria-label', `${isVideo(s) ? 'Video' : 'Screenshot'} ${i + 1} of ${n}`);
    b.addEventListener('click', () => go(i, 'dot'));
    return b;
  }) : [];
  if (dotsEl) dotsEl.replaceChildren(...dots);

  const alignOf = (slide) => {
    const v = (getComputedStyle(slide).scrollSnapAlign || '').trim().split(/\s+/).pop();
    return v === 'center' ? 0.5 : v === 'end' ? 1 : 0;
  };

  function indexFromScroll() {
    const max = track.scrollWidth - track.clientWidth;
    if (max <= 1 || track.scrollLeft <= 1) return 0;
    if (track.scrollLeft >= max - 1) return n - 1;
    const tr = track.getBoundingClientRect();
    const mid = tr.left + tr.width / 2;
    let best = 0, dist = Infinity;
    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < dist) { dist = d; best = i; }
    });
    return best;
  }

  function paint() {
    slides.forEach((s, i) => {
      const on = i === active;
      s.classList.toggle('is-current', on);
      if (on) s.setAttribute('aria-current', 'true'); else s.removeAttribute('aria-current');
      // A video that is not on the current slide stops
      if (!on) $$('video', s).forEach((v) => v.pause());
    });
    dots.forEach((d, i) => { if (i === active) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    root.dataset.index = String(active);
    if (countEl) {
      const cur = $('[data-gallery-current]', countEl), tot = $('[data-gallery-total]', countEl);
      if (cur || tot) { if (cur) cur.textContent = String(active + 1); if (tot) tot.textContent = String(n); } else countEl.textContent = `${active + 1} / ${n}`;
    }
  }

  function sync() {
    raf = 0;
    const i = indexFromScroll();
    // On the way to a slide chosen by button/dot/key, only the destination counts
    if (goTarget !== null && i !== goTarget) return;
    if (i === goTarget) goTarget = null;
    if (i === active) { if (goTarget === null) reason = null; return; }
    const previous = active;
    active = i;
    paint();
    const why = reason || 'scroll';
    reason = null;
    emit(root, 'gallery:change', { index: active, count: n, slide: slides[active], previous, direction: active > previous ? 'next' : 'prev', reason: why });
  }

  function go(i, why = 'button', instant = false) {
    const target = Math.min(Math.max(0, i), n - 1);
    const s = slides[target];
    const tr = track.getBoundingClientRect(), r = s.getBoundingClientRect();
    const left = track.scrollLeft + (r.left - tr.left) - (tr.width - r.width) * alignOf(s);
    reason = why;
    goTarget = target;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { goTarget = null; reason = null; sync(); }, 800); // safety: the scroll never started
    track.scrollTo({ left, behavior: instant || reducedMotion() ? 'auto' : 'smooth' });
    // Already there (no scroll event will follow): settle the state now
    if (!raf) raf = requestAnimationFrame(sync);
  }

  const step = (d, why) => go((active + d + n) % n, why);
  prevBtn?.addEventListener('click', () => step(-1, 'button'));
  nextBtn?.addEventListener('click', () => step(1, 'button'));

  // When scrolling stops (also when a go() could not move, e.g. clamped), stop waiting for its destination
  track.addEventListener('scroll', () => {
    if (!raf) raf = requestAnimationFrame(sync);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { goTarget = null; reason = null; sync(); }, 160);
  }, { passive: true });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { if (!raf) raf = requestAnimationFrame(sync); }).observe(track);

  root.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || n < 2 || e.target.closest?.('video, input, textarea, select')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1, 'key'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1, 'key'); }
    else if (e.key === 'Home') { e.preventDefault(); go(0, 'key'); }
    else if (e.key === 'End') { e.preventDefault(); go(n - 1, 'key'); }
  });

  // Zoom: let viewer.js / video.js handle slides that carry their own trigger; open the viewer for bare ones
  const zoom = (slide, from) => {
    const trigger = slide.querySelector('[data-lightbox], [data-video-open]');
    if (trigger) { trigger.click(); return; }
    const pics = slides.filter((s) => s.querySelector('img') && !isVideo(s));
    const at = pics.indexOf(slide);
    if (at >= 0) openViewer(pics.map((s) => itemFromElement(s)), at, from);
  };
  track.addEventListener('click', (e) => {
    if (dragged) return;
    const slide = slides.find((s) => s.contains(e.target));
    if (!slide || e.target.closest('a, button, video, [data-lightbox], [data-video-open]')) return;
    zoom(slide, slide);
  });
  track.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target === track) { e.preventDefault(); zoom(slides[active], track); } });
  zoomBtn?.addEventListener('click', () => zoom(slides[active], zoomBtn));

  // A drag must not also click what it ends on (capture phase: runs before the delegated viewer/video handlers)
  track.addEventListener('click', (e) => { if (dragged) { e.preventDefault(); e.stopPropagation(); } }, true);
  track.addEventListener('dragstart', (e) => e.preventDefault());

  // Desktop mouse drag
  let down = false, sx = 0, sl = 0, from = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || n < 2 || e.target.closest('video, input, textarea, select')) return;
    down = true; dragged = false; sx = e.clientX; sl = track.scrollLeft; from = active;
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (!dragged && Math.abs(dx) > 6) {
      dragged = true;
      track.classList.add('is-dragging');
      track.style.scrollSnapType = 'none'; // functional: snapping would fight the pointer while dragging
    }
    if (dragged) track.scrollLeft = sl - dx;
  });
  const release = (e) => {
    if (!down) return;
    down = false;
    if (dragged) {
      const dx = e.clientX - sx;
      track.classList.remove('is-dragging');
      track.style.scrollSnapType = '';
      go(Math.abs(dx) > 40 ? Math.min(Math.max(from + (dx < 0 ? 1 : -1), 0), n - 1) : from, 'drag');
      setTimeout(() => { dragged = false; }); // the click that ends the drag lands before this
    }
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);

  // Leaving the screen stops a playing slide video
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (!en.isIntersecting) en.target.pause(); }));
    $$('video', track).forEach((v) => io.observe(v));
  }

  // When the viewer closes on one of this gallery's slides, bring the track to the slide that was last seen
  document.addEventListener('viewer:close', (e) => {
    const { items, index } = e.detail || {};
    const el = items?.[index]?.el;
    const at = el ? slides.findIndex((s) => s === el || s.contains(el)) : -1;
    if (at >= 0 && at !== active) go(at, 'viewer', true);
  });

  paint();
  return { root, go: (i) => go(i, 'button'), get index() { return active; } };
}

export function initGalleries() {
  const out = [];
  try {
    $$('[data-gallery]').forEach((root) => {
      if (wired.has(root)) return;
      wired.add(root);
      try { const c = setup(root); if (c) out.push(c); } catch {}
    });
  } catch {}
  return out;
}
