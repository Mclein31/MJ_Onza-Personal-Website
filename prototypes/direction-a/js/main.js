// D-A "Instrument" entry.
import { createLoop, clamp } from './scroll.js';
import { initTheme, initMenu } from './theme.js';
import { createField } from './field.js';
import { boot, countTo } from './boot.js';
import { initWork } from './work.js';
import { initReveal, initTicks, initReadout, initAbout } from './sections.js';

window.__v5aAlive = true;
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = matchMedia('(max-width: 720px), (pointer: coarse)').matches;
const weak = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || navigator.connection?.saveData === true;

const loop = createLoop({ reduce });

// Stagger index for the hero column hairlines
document.querySelectorAll('[data-hero-cols] i').forEach((c, i) => c.style.setProperty('--k', i));

// ---------- The field ----------
const plot = document.querySelector('[data-plot]');
const canvas = document.querySelector('[data-field]');
const linesEl = document.querySelector('[data-hero-cols]');
const hero = document.getElementById('top');
const countEl = document.querySelector('[data-field-count]');
const flowEl = document.querySelector('[data-field-flow]');

let field = null;
if (!reduce && !weak) {
  try { field = createField({ canvas, plot, linesEl, phone }); } catch (e) { field = null; }
}
const fieldReady = Promise.resolve(field ? 'live' : 'static');

initTheme({ reduce, onChange: () => field?.setColors() });
initMenu();

if (field) {
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);
  let front = root.getAttribute('data-stage') === 'boot' ? -0.1 : 1.2;
  let booting = front < 1.2;
  let settleS = 0, lastFlow = '', flowAt = 0;
  let heroH = hero.offsetHeight;
  new ResizeObserver(() => { heroH = hero.offsetHeight; }).observe(hero);

  loop.on((s) => {
    if (!visible || document.hidden || field.lost) return;
    // Boot sweep: the stream switches on left to right, like the loader's scan.
    if (booting && root.getAttribute('data-stage') !== 'boot') {
      front = Math.min(1.2, front + s.dt / 900);
      if (front >= 1.2) booting = false;
    }
    // Settle: desktop holds the hero for half a screen; phones settle as the hero scrolls away.
    const hold = phone ? heroH * 0.55 : s.vh * 0.5;
    const settle = clamp(s.y / hold);
    settleS += (settle - settleS) * 0.1;
    if (Math.abs(settle - settleS) < 0.0005) settleS = settle;
    const eased = settleS * settleS * (3 - 2 * settleS);
    field.render(s, eased, front);

    if (s.t - flowAt > 120) {
      const f = (field.speed * (1 - eased * 0.85)).toFixed(2);
      if (f !== lastFlow) { flowEl.textContent = f; lastFlow = f; }
      flowAt = s.t;
    }
  });
}

// ---------- Boot ----------
const tickYear = document.querySelector('[data-boot-tick]');
boot(fieldReady).then(() => {
  loop.start();
  if (reduce) return;
  if (tickYear) countTo(tickYear, Number(tickYear.dataset.from), Number(tickYear.dataset.bootTick), 1100);
  if (field && countEl) countTo(countEl, 0, field.count, 1200, (v) => v.toLocaleString('en-US'));
});
if (field && countEl && reduce === false) countEl.textContent = '0';

// ---------- Sections ----------
if (!reduce) initReveal();
initTicks({ reduce });
initReadout(loop);
initWork(loop, { reduce });
initAbout(loop, { reduce });
