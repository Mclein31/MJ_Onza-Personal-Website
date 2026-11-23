/*
 * work.js: design-layer motion for the work area (Instrument redesign v5). Owner: W2 work.
 * Called once from scripts/design/index.js after the core modules are up. Must never throw; no-op if hooks are absent.
 *
 * Slide-change flourish: when a project gallery changes through prev / next / a tick / an arrow key, the track
 * jumps (instead of sliding) and the new screenshot wipes in with clip-path over the old one while a thin orange
 * scan line rides the wipe edge. ~400ms, interruptible (a new change finishes the running one), none under reduced
 * motion. Swipes and mouse drags keep the native scroll-snap movement (the hand already shows the motion).
 * Also marks the ticks before the current one (.is-past) so the tick row reads as progress.
 *
 * Core gallery.js is not edited: we listen to gallery:change, and for a button/key change we ask its scrollTo call
 * on this track to be instant by wrapping that one element's scrollTo (only while a button/key press is in flight).
 */
import { reducedMotion } from '../core/motion.js';

const DURATION = 380;
const EASE = 'cubic-bezier(0.33, 1, 0.68, 1)'; // ease-out: the change answers the press at once
const WIPE_REASONS = new Set(['button', 'dot', 'key']);

function setup(root) {
  const track = root.querySelector('[data-gallery-track]');
  const plate = root.querySelector('.project__plate');
  if (!track || !plate) return;
  const slides = [...track.children];
  if (slides.length < 2) return;

  // The outgoing screenshot stays under the wipe (a div with a background image: no empty <img> in the page)
  const ghost = document.createElement('span');
  ghost.className = 'project__ghost';
  ghost.setAttribute('aria-hidden', 'true');
  const scan = document.createElement('span');
  scan.className = 'project__scan';
  scan.setAttribute('aria-hidden', 'true');
  plate.append(ghost, scan);

  // A press on prev / next / a tick, or an arrow key, arms an instant jump for the scrollTo that follows
  // (intent: the direction the visitor asked for, so a wrap from the last slide to the first still wipes forward)
  let armed = false, intent = null;
  root.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target.closest('[data-gallery-prev], [data-gallery-next], [data-gallery-dot]') : null;
    if (!t) return;
    armed = true;
    intent = t.hasAttribute('data-gallery-prev') ? 'prev' : t.hasAttribute('data-gallery-next') ? 'next' : null;
  }, true);
  root.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    armed = true;
    intent = e.key === 'ArrowLeft' ? 'prev' : e.key === 'ArrowRight' ? 'next' : null;
  }, true);
  const nativeScrollTo = track.scrollTo.bind(track);
  track.scrollTo = (opts, y) => {
    if (armed && !reducedMotion() && opts && typeof opts === 'object') {
      armed = false;
      return nativeScrollTo({ ...opts, behavior: 'auto' });
    }
    armed = false;
    return typeof opts === 'object' ? nativeScrollTo(opts) : nativeScrollTo(opts, y);
  };

  let running = [];
  const stop = () => {
    running.forEach((a) => { try { a.cancel(); } catch {} });
    running = [];
    plate.classList.remove('is-wiping');
  };

  const markTicks = (index) => {
    root.querySelectorAll('[data-gallery-dot]').forEach((d, i) => d.classList.toggle('is-past', i < index));
  };

  function wipe(slide, previous, direction) {
    stop();
    const media = slide.querySelector('.project__zoom') || slide;
    const oldImg = previous?.querySelector('img');
    const caption = slide.querySelector('.project__caption');
    const pr = plate.getBoundingClientRect();
    const mr = media.getBoundingClientRect();
    if (!mr.width || !mr.height) return;
    const box = { left: `${mr.left - pr.left}px`, top: `${mr.top - pr.top}px`, width: `${mr.width}px`, height: `${mr.height}px` };
    Object.assign(ghost.style, box);
    Object.assign(scan.style, { left: box.left, top: box.top, height: box.height });
    const url = oldImg ? oldImg.currentSrc || oldImg.src : '';
    ghost.style.backgroundImage = url ? `url("${url.replace(/"/g, '%22')}")` : 'none';
    plate.classList.add('is-wiping');

    const fwd = direction !== 'prev';
    const from = fwd ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
    const x0 = fwd ? 0 : mr.width, x1 = fwd ? mr.width : 0;
    const opts = { duration: DURATION, easing: EASE };
    const clip = media.animate([{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }], opts);
    running.push(clip);
    running.push(scan.animate([
      { transform: `translateX(${x0}px)`, opacity: 1 },
      { transform: `translateX(${x1}px)`, opacity: 1, offset: 0.96 },
      { transform: `translateX(${x1}px)`, opacity: 0 },
    ], opts));
    if (caption) {
      running.push(caption.animate(
        [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
        { duration: 240, delay: 80, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' },
      ));
    }
    clip.onfinish = () => { if (running[0] === clip) stop(); };
  }

  root.addEventListener('gallery:change', (e) => {
    const { index, previous, direction, reason } = e.detail || {};
    markTicks(index);
    const dir = intent || direction;
    intent = null;
    if (reducedMotion() || !WIPE_REASONS.has(reason) || !slides[index]) { stop(); return; }
    wipe(slides[index], slides[previous], dir);
  });

  markTicks(Number(root.dataset.index) || 0);
}

export function init() {
  try {
    document.querySelectorAll('#work [data-gallery]').forEach((root) => {
      try { setup(root); } catch {}
    });
  } catch {}
}
