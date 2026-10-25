/* ==========================================================================
   Hero — split name, clock, typed queries
   ========================================================================== */
import { $, $$, clamp, finePointer, reducedMotion } from './util.js';

function splitName() {
  let ci = 0;
  $$('[data-split]').forEach((line) => {
    const nodes = [...line.childNodes];
    line.textContent = '';
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        [...node.textContent].forEach((ch) => {
          const s = document.createElement('span');
          s.className = 'char';
          s.textContent = ch;
          s.style.setProperty('--ci', ci++);
          s.setAttribute('aria-hidden', 'true');
          line.append(s);
        });
      } else {
        node.classList.add('char');
        node.style.setProperty('--ci', ci++);
        line.append(node);
      }
    });
  });
}

function weightField(hero) {
  if (!finePointer.matches || reducedMotion.matches) return;
  const chars = $$('.hero__name .char', hero);
  let raf = 0, px = -9999, py = -9999;
  const update = () => {
    raf = 0;
    chars.forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
      const t = clamp(1 - d / 380, 0, 1);
      c.style.setProperty('--w', Math.round(300 + t * 500));
    });
  };
  hero.addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; raf ||= requestAnimationFrame(update); });
  hero.addEventListener('pointerleave', () => chars.forEach((c) => c.style.removeProperty('--w')));
}

function clock() {
  const el = $('[data-clock]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 15000);
}

export function initHero() {
  const hero = $('.hero');
  if (!hero) return;
  splitName();
  weightField(hero);
  clock();
}
