// Reveals, number ticks, the nav readout, and the About transition (an ink field rising under a scan line).
import { docTop, clamp } from './scroll.js';
import { countTo } from './boot.js';

const root = document.documentElement;

export function initReveal() {
  root.classList.add('reveal-armed');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-reveal], [data-draw], [data-shot], [data-next-shot]').forEach((el) => io.observe(el));
}

export function initTicks({ reduce }) {
  const els = [...document.querySelectorAll('[data-tick]')];
  if (reduce) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const to = Number(e.target.dataset.tick);
      countTo(e.target, 0, to, 900);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -15% 0px' });
  els.forEach((el) => { el.textContent = '0'; io.observe(el); });
}

export function initReadout(loop) {
  const nameEl = document.querySelector('[data-readout-name]');
  const pctEl = document.querySelector('[data-readout-pct]');
  const links = [...document.querySelectorAll('.nav__links a')];
  const marks = [
    { name: 'Index', el: document.getElementById('top'), href: null },
    { name: 'Work', el: document.getElementById('work'), href: '#work' },
    { name: 'About', el: document.getElementById('about'), href: '#about' },
  ];
  let tops = [], docH = 1, lastName = '', lastPct = -1;
  const measure = () => {
    tops = marks.map((m) => docTop(m.el));
    docH = document.documentElement.scrollHeight;
  };
  new ResizeObserver(measure).observe(document.body);
  measure();

  loop.on((s) => {
    const pct = Math.round(clamp(s.y / Math.max(1, docH - s.vh)) * 100);
    let idx = 0;
    tops.forEach((t, i) => { if (s.y + s.vh * 0.45 >= t) idx = i; });
    const name = marks[idx].name;
    if (pct !== lastPct && pctEl) { pctEl.textContent = String(pct).padStart(3, '0'); lastPct = pct; }
    if (name !== lastName) {
      if (nameEl) nameEl.textContent = name;
      links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === marks[idx].href)));
      lastName = name;
    }
  });
}

export function initAbout(loop, { reduce }) {
  const sec = document.querySelector('[data-about]');
  const field = document.querySelector('[data-about-field]');
  if (!sec || !field || reduce) return;
  root.classList.add('about-armed');
  let top = 0, shown = false, last = -1;
  const measure = () => { top = docTop(sec); };
  new ResizeObserver(measure).observe(document.body);
  measure();

  loop.on((s) => {
    // p: 0 when the section's top meets the bottom of the screen, 1 when it reaches the top.
    // The field trails by up to half its height, so its edge rises 1.5x faster than the page.
    const p = clamp(1 - (top - s.y) / s.vh);
    const e = Math.round(p * 1000) / 1000;
    if (e !== last) {
      field.style.transform = `translate3d(0, ${(1 - e) * 50}%, 0)`;
      last = e;
    }
    if (!shown && p > 0.62) { sec.classList.add('is-in'); shown = true; }
  });
}
