/* ==========================================================================
   Custom cursor
   ========================================================================== */
import { $, $$, lerp, finePointer, reducedMotion } from './util.js';

export function initCursor() {
  if (!finePointer.matches || reducedMotion.matches) return;
  const cursor = $('.cursor');
  if (!cursor) return;
  document.documentElement.classList.add('has-cursor');

  const ring = $('.cursor__ring', cursor);
  const dot = $('.cursor__dot', cursor);
  const label = $('.cursor__label', cursor);
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

  addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    cursor.classList.remove('is-hidden');
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
  addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  addEventListener('pointerup', () => cursor.classList.remove('is-down'));

  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], a, button, .float-icon, .row');
    if (!t) return;
    const text = t.getAttribute('data-cursor');
    if (text) { label.textContent = text; cursor.classList.add('is-label'); }
    else cursor.classList.add('is-hover');
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest('[data-cursor], a, button, .float-icon, .row');
    if (t && !t.contains(e.relatedTarget)) cursor.classList.remove('is-hover', 'is-label');
  });

  const loop = () => {
    rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();

  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.4;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, 500);
    });
  });
}
