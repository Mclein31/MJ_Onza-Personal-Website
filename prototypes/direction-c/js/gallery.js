// Project gallery: buttons, arrow keys, swipe or drag, caption swap, video slide, simple lightbox.

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

export function initGallery(root, { reduce }) {
  const track = root.querySelector('[data-gallery-track]');
  const viewport = track.parentElement;
  const slides = [...track.children];
  const count = root.querySelector('[data-gallery-count]');
  const capTitle = root.querySelector('[data-cap-title]');
  const capDesc = root.querySelector('[data-cap-desc]');
  const zoomBtn = root.querySelector('[data-gallery-zoom]');
  const card = root.closest('[data-card]');
  const playBtn = card && card.querySelector('[data-play-video]');
  const lightbox = document.querySelector('[data-lightbox]');
  let lbImg = null;
  let index = 0;

  const eager = (i) => {
    const img = slides[(i + slides.length) % slides.length].querySelector('img');
    if (img && img.loading === 'lazy') img.loading = 'eager';
  };

  function go(n, { announce = true } = {}) {
    const prev = index;
    index = (n + slides.length) % slides.length;
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    count.textContent = `${index + 1} / ${slides.length}`;
    slides.forEach((s, k) => {
      const on = k === index;
      s.setAttribute('aria-hidden', String(!on));
      s.inert = !on;
      const v = s.querySelector('video');
      if (v && !on && !v.paused) v.pause();
    });
    eager(index + 1); eager(index - 1);
    const isVideo = slides[index].classList.contains('gallery__slide--video');
    if (zoomBtn) zoomBtn.disabled = isVideo;
    if (prev !== index && announce) {
      capTitle.textContent = slides[index].dataset.title || '';
      capDesc.textContent = slides[index].dataset.desc || '';
      if (!reduce) {
        const kf = [{ opacity: 0, transform: 'translateY(6px)', filter: 'blur(2px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }];
        capTitle.animate(kf, { duration: 260, easing: EASE_OUT });
        capDesc.animate(kf, { duration: 320, delay: 30, easing: EASE_OUT, fill: 'backwards' });
      }
    }
  }

  root.querySelector('[data-gallery-prev]').addEventListener('click', () => go(index - 1));
  root.querySelector('[data-gallery-next]').addEventListener('click', () => go(index + 1));
  root.addEventListener('keydown', (e) => {
    if (e.target.closest('video')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  });

  // Swipe / drag: follows the finger, a quick flick is enough (velocity), otherwise 18% of the width
  let startX = 0, startY = 0, dx = 0, t0 = 0, dragging = false, decided = false, horizontal = false;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('video')) return;
    startX = e.clientX; startY = e.clientY; dx = 0; t0 = performance.now();
    dragging = true; decided = false; horizontal = false;
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const mx = e.clientX - startX, my = e.clientY - startY;
    if (!decided && Math.hypot(mx, my) > 6) {
      decided = true; horizontal = Math.abs(mx) > Math.abs(my);
      if (horizontal) { viewport.setPointerCapture(e.pointerId); track.classList.add('is-dragging'); }
    }
    if (!horizontal) return;
    dx = mx;
    track.style.transform = `translate3d(calc(${-index * 100}% + ${dx}px), 0, 0)`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    if (!horizontal) return;
    const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
    const w = viewport.clientWidth;
    if (Math.abs(dx) > w * 0.18 || v > 0.5) go(index + (dx < 0 ? 1 : -1));
    else go(index, { announce: false });
  };
  viewport.addEventListener('pointerup', end);
  viewport.addEventListener('pointercancel', end);
  viewport.addEventListener('click', (e) => { if (Math.abs(dx) > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

  // One play action: jump to the video slide and start it
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const vi = slides.findIndex((s) => s.querySelector('video'));
      if (vi < 0) return;
      go(vi);
      const v = slides[vi].querySelector('video');
      v.preload = 'auto';
      v.play().catch(() => {});
      v.focus({ preventScroll: true });
    });
  }

  // Lightbox: the current screenshot at full size
  if (zoomBtn && lightbox) {
    zoomBtn.addEventListener('click', () => {
      const img = slides[index].querySelector('img');
      if (!img) return;
      if (!lbImg) { lbImg = document.createElement('img'); lbImg.decoding = 'async'; lightbox.prepend(lbImg); }
      const big = (img.getAttribute('srcset') || '').split(',').map((s) => s.trim().split(' ')[0]).pop() || img.src;
      lbImg.src = big;
      lbImg.alt = img.alt;
      lightbox.showModal();
    });
    lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('close', () => zoomBtn.focus({ preventScroll: true }));
  }

  go(0, { announce: false });
  return { go };
}
