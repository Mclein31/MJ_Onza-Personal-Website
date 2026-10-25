import { $, $$, reducedMotion } from './util.js';

// Our own edge-cached function first; the public API keeps it working locally (no /api there)
const SOURCES = ['/api/contributions', 'https://github-contributions-api.jogruber.de/v4/Mclein31?y=last'];
const day = (iso, opts) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', opts);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

async function load() {
  for (const url of SOURCES) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const data = await r.json();
      if (data.contributions?.length) return data.contributions;
    } catch { /* try the next source */ }
  }
  throw new Error('No contribution source reachable');
}

function summarize(days) {
  let run = 0, streak = { len: 0, start: 0 }, best = 0, total = 0, active = 0;
  days.forEach((d, i) => {
    total += d.count;
    if (d.count) { active++; run++; if (run > streak.len) streak = { len: run, start: i - run + 1 }; } else run = 0;
    if (d.count > days[best].count) best = i;
  });
  return { total, active, streak, best };
}

function render(cal, days) {
  const pad = new Date(days[0].date + 'T00:00:00').getDay(); // weeks start on Sunday, like GitHub
  const weeks = Math.ceil((pad + days.length) / 7);
  const months = [];
  let last = -1;
  for (let w = 0; w < weeks; w++) {
    const i = Math.max(0, w * 7 - pad);
    const m = new Date(days[i].date + 'T00:00:00').getMonth();
    if (m !== last) months.push([w, day(days[i].date, { month: 'short' })]);
    last = m;
  }
  if (months.length > 1 && months[1][0] - months[0][0] < 3) months.shift(); // a partial first month would crowd the next label
  cal.style.setProperty('--weeks', weeks);
  cal.innerHTML =
    `<div class="activity__months">${months.map(([w, m]) => `<span style="grid-column:${w + 1}">${m}</span>`).join('')}</div>` +
    '<div class="activity__days"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div>' +
    '<div class="activity__grid">' +
    '<i class="cell pad"></i>'.repeat(pad) +
    days.map((d, i) => `<i class="cell" data-i="${i}" data-l="${d.level}" style="--w:${Math.floor((pad + i) / 7)}"></i>`).join('') +
    '</div>';
}

function countUp(el, to) {
  if (reducedMotion.matches) { el.textContent = to.toLocaleString(); return; }
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / 1200);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function initActivity() {
  const root = $('[data-activity]');
  if (!root) return;
  const section = root.closest('section');
  const cal = $('[data-act-cal]', root);
  const tip = $('[data-act-tip]', root);
  const stats = $('[data-act-stats]');
  const field = (k) => $(`[data-act="${k}"]`, stats);
  const scroller = $('[data-act-scroll]', root);
  let days = [], sum = null, visible = false, drawn = false;

  // The calendar scrolls sideways on narrow screens: give it a tab stop only then
  const keyboardReach = new ResizeObserver(() => {
    if (scroller.scrollWidth > scroller.clientWidth) scroller.tabIndex = 0;
    else scroller.removeAttribute('tabindex');
  });
  keyboardReach.observe(scroller);
  keyboardReach.observe(cal);

  const go = () => {
    if (!drawn || !visible || root.classList.contains('is-live')) return;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-live')));
    countUp(field('total'), sum.total);
    countUp(field('days'), sum.active);
    countUp(field('streak'), sum.streak.len);
    countUp(field('best'), days[sum.best].count);
  };

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; go(); }, { threshold: 0.25 }).observe(root);

  // Only fetch once the section is close
  const near = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    near.disconnect();
    try {
      days = await load();
    } catch {
      cal.classList.remove('is-loading');
      cal.innerHTML = '<p class="activity__error">Couldn’t reach GitHub right now. <a href="https://github.com/Mclein31" target="_blank" rel="noopener noreferrer">See the graph on GitHub ↗</a></p>';
      return;
    }
    sum = summarize(days);
    render(cal, days);
    cal.classList.remove('is-loading');
    cal.setAttribute('aria-label', `GitHub contribution calendar: ${sum.total} contributions in the last year`);
    scroller.scrollLeft = scroller.scrollWidth; // most recent weeks first on small screens
    const span = { month: 'short', day: 'numeric' };
    $('[data-act-range]', root).textContent = `${day(days[0].date, { month: 'short', year: 'numeric' })} – ${day(days.at(-1).date, { month: 'short', year: 'numeric' })}`;
    field('daysNote').textContent = `of ${days.length} days had a push`;
    const s = sum.streak;
    field('streakNote').textContent = s.len ? `${s.len === 1 ? 'day' : 'days'} in a row · ${day(days[s.start].date, span)}–${day(days[s.start + s.len - 1].date, span)}` : 'days in a row';
    field('bestNote').textContent = `${days[sum.best].count === 1 ? 'contribution' : 'contributions'} on ${day(days[sum.best].date, { ...span, year: 'numeric' })}`;
    drawn = true;
    go();
  }, { rootMargin: '600px 0px' });
  near.observe(section);

  // Tooltip follows the hovered day
  cal.addEventListener('pointerover', (e) => {
    const c = e.target.closest('.cell:not(.pad)');
    if (!c) return;
    const d = days[c.dataset.i], r = c.getBoundingClientRect(), box = root.getBoundingClientRect();
    tip.innerHTML = `<b>${d.count ? plural(d.count, 'contribution') : 'No contributions'}</b> · ${day(d.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`;
    const half = tip.offsetWidth / 2 + 8; // keep the tip inside the card at either edge
    const x = Math.min(Math.max(r.left + r.width / 2 - box.left, half), box.width - half);
    tip.style.transform = `translate(${x}px, ${r.top - box.top}px)`;
    tip.classList.add('is-on');
  });
  cal.addEventListener('pointerleave', () => tip.classList.remove('is-on'));

  // Hovering (or tapping) a stat highlights the days behind it
  const highlight = (kind) => {
    if (!sum) return;
    const pick = kind === 'best' ? (i) => i === sum.best
      : kind === 'streak' ? (i) => i >= sum.streak.start && i < sum.streak.start + sum.streak.len
      : (i) => days[i].count > 0;
    $$('.cell[data-i]', cal).forEach((c) => c.classList.toggle('is-hl', pick(Number(c.dataset.i))));
    root.dataset.hl = kind;
  };
  const clear = () => { delete root.dataset.hl; };
  $$('.stat[data-hl]', stats).forEach((el) => {
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') highlight(el.dataset.hl); });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') clear(); });
    el.addEventListener('click', () => (root.dataset.hl === el.dataset.hl ? clear() : highlight(el.dataset.hl)));
  });
}
