/*
 * activity.js: renders the last year of GitHub contributions as an accessible grid, plus totals and streaks.
 * Data comes from contributions.js (cached, with fallback). No styling: the design styles the output.
 *
 * HOOKS READ (all optional; nothing happens without [data-activity] or [data-activity-mini])
 *   [data-activity]                 root. Data loads when it is within ~1000px of the viewport (or on Retry).
 *     [data-activity-calendar]      target for the grid
 *     [data-activity-loading]       shown (hidden removed) while loading
 *     [data-activity-error]         shown on failure; contains [data-activity-retry] (button)
 *     [data-act-tip]                tooltip text (live region); positioned via --tip-x / --tip-y (px, relative to the root)
 *     [data-hl="active|streak|best"]  buttons (usually in the stats list): hover/focus-free preview for a mouse, click to lock;
 *                                     they get aria-pressed and .is-active
 *   Stat values, looked up inside the root's <section> (or the root). Each accepts either hook name:
 *     data-act="total"          | data-activity-total            contributions in the year
 *     data-act="days"           | data-activity-days             days with at least one contribution
 *     data-act="streak"         | data-activity-streak           longest streak, in days
 *     data-act="currentStreak"  | data-activity-current-streak   streak running now (today may still be empty)
 *     data-act="best"           | data-activity-best             most contributions in one day
 *     notes: data-act="daysNote" | "streakNote" | "currentStreakNote" | "bestNote"  (or data-activity-days-note, ...)
 *   Value elements also get data-value="<number>" so a motion layer can count up from 0 (text is already final).
 *   [data-activity-mini]            optional small grid (last 16 weeks, no weeks structure) in the contact card
 *   [data-activity-mini-total]      optional text for that card: "1,234 contributions this year"
 *
 * OUTPUT INSIDE [data-activity-calendar]
 *   <p data-activity-summary>     visually hidden sentence (inline clip styles) with the totals; read by screen readers
 *   <div data-week [data-month="Jan"]>   one column per week (Sunday first); data-month on the first week of each month
 *     <span data-day data-date="2026-03-04" data-count="3" data-level="0-4" data-weekday="0-6" data-index="n" aria-hidden="true">
 *     <span data-day data-pad aria-hidden="true">   padding before the first day so weekdays line up
 *   The calendar gets role="group" + an aria-label, data-weeks="<n>" and --weeks.
 *
 * STATE
 *   root.dataset.state = loading | ready | error, plus .is-loading / .is-ready / .is-error, aria-busy while loading.
 *   Highlight: root.dataset.highlight = active|streak|best while a stat is previewed/locked; matching days get .is-hl.
 *   On Retry the root takes focus (tabindex=-1) so keyboard focus is not lost when the button hides.
 *
 * EVENTS (CustomEvent on the root, bubbles to document)
 *   activity:state  { state }
 *   activity:ready  { days, summary }   summary = { total, active, longest:{len,start,end}, current:{len,start,end}, best:{count,date,index} }
 *
 * EXPORTS
 *   initActivity()   returns { reload() } or null; never throws
 *   summarize(days)  pure helper (also useful for tests)
 */

import { $, $$, emit } from './modal.js';
import { loadContributions } from './contributions.js';

const HIDE = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0';
const MINI_WEEKS = 16;

const toDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const fmt = (iso, opts) => toDate(iso).toLocaleDateString('en-US', opts);
const num = (n) => n.toLocaleString('en-US');
const plural = (n, word) => `${num(n)} ${word}${n === 1 ? '' : 's'}`;
const SHORT = { month: 'short', day: 'numeric' };

function clean(raw) {
  return raw
    .filter((d) => d && /^\d{4}-\d{2}-\d{2}$/.test(d.date))
    .map((d) => ({ date: d.date, count: Math.max(0, Number(d.count) || 0), level: Math.min(4, Math.max(0, Number(d.level) || 0)) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function summarize(days) {
  let total = 0, active = 0, run = 0, longest = { len: 0, start: -1 }, bestIndex = 0;
  days.forEach((d, i) => {
    total += d.count;
    if (d.count > 0) {
      active++; run++;
      if (run > longest.len) longest = { len: run, start: i - run + 1 };
    } else run = 0;
    if (d.count > days[bestIndex].count) bestIndex = i;
  });
  // The streak running now: today may still be empty without breaking it
  let end = days.length - 1;
  if (end >= 0 && days[end].count === 0) end--;
  let cur = 0;
  while (end - cur >= 0 && days[end - cur].count > 0) cur++;
  const span = (len, start) => (len ? { len, start: days[start].date, end: days[start + len - 1].date } : { len: 0, start: null, end: null });
  return {
    total, active,
    longest: span(longest.len, longest.start),
    current: span(cur, end - cur + 1),
    best: { count: days[bestIndex].count, date: days[bestIndex].date, index: bestIndex },
    _longest: longest,
  };
}

function monthMarks(days, pad, weeks) {
  const marks = [];
  let last = -1;
  for (let w = 0; w < weeks; w++) {
    const i = Math.max(0, w * 7 - pad);
    const m = toDate(days[i].date).getMonth();
    if (m !== last) marks.push([w, fmt(days[i].date, { month: 'short' })]);
    last = m;
  }
  if (marks.length > 1 && marks[1][0] - marks[0][0] < 3) marks.shift();
  return new Map(marks);
}

function gridHtml(days, sum) {
  const pad = toDate(days[0].date).getDay();
  const weeks = Math.ceil((pad + days.length) / 7);
  const months = monthMarks(days, pad, weeks);
  let html = `<p data-activity-summary style="${HIDE}">${summaryText(days, sum)}</p>`;
  for (let w = 0; w < weeks; w++) {
    html += `<div data-week${months.has(w) ? ` data-month="${months.get(w)}"` : ''}>`;
    for (let r = 0; r < 7; r++) {
      const i = w * 7 + r - pad;
      if (i < 0 || i >= days.length) { if (i < 0) html += '<span data-day data-pad aria-hidden="true"></span>'; continue; }
      const d = days[i];
      html += `<span data-day data-date="${d.date}" data-count="${d.count}" data-level="${d.level}" data-weekday="${r}" data-index="${i}" aria-hidden="true"></span>`;
    }
    html += '</div>';
  }
  return { html, weeks };
}

function summaryText(days, sum) {
  const s = sum.longest;
  return `GitHub contributions from ${fmt(days[0].date, { ...SHORT, year: 'numeric' })} to ${fmt(days[days.length - 1].date, { ...SHORT, year: 'numeric' })}: `
    + `${plural(sum.total, 'contribution')} on ${plural(sum.active, 'day')}. `
    + (s.len ? `Longest streak ${plural(s.len, 'day')}, ${fmt(s.start, SHORT)} to ${fmt(s.end, SHORT)}. ` : '')
    + (sum.current.len ? `Current streak ${plural(sum.current.len, 'day')}. ` : '')
    + (sum.best.count ? `Best day ${plural(sum.best.count, 'contribution')} on ${fmt(sum.best.date, { ...SHORT, year: 'numeric' })}.` : '');
}

const KEBAB = { currentStreak: 'current-streak', daysNote: 'days-note', streakNote: 'streak-note', currentStreakNote: 'current-streak-note', bestNote: 'best-note' };
const fieldSel = (k) => `[data-act="${k}"], [data-activity-${KEBAB[k] || k}]`;

function initMini(el) {
  const totalEl = $('[data-activity-mini-total]');
  el.dataset.state = 'loading';
  let started = false;
  const run = async () => {
    if (started) return;
    started = true;
    try {
      const days = clean(await loadContributions());
      if (!days.length) throw new Error('empty');
      el.replaceChildren(...days.slice(-MINI_WEEKS * 7).map((d) => {
        const c = document.createElement('span');
        c.setAttribute('data-day', '');
        c.dataset.level = String(d.level);
        c.dataset.count = String(d.count);
        return c;
      }));
      el.dataset.state = 'ready';
      if (totalEl) totalEl.textContent = `${num(days.reduce((s, d) => s + d.count, 0))} contributions this year`;
    } catch {
      el.dataset.state = 'error';
      if (totalEl) totalEl.textContent = 'Contributions unavailable · view on GitHub';
    }
  };
  if (typeof IntersectionObserver === 'undefined') run();
  else {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { rootMargin: '800px 0px' });
    io.observe(el);
  }
}

function initMain(root) {
  const scope = root.closest('section') || root;
  const cal = $('[data-activity-calendar]', root);
  const loadingEl = $('[data-activity-loading]', root);
  const errorEl = $('[data-activity-error]', root);
  const retry = $('[data-activity-retry]', root);
  const tip = $('[data-act-tip]', root);
  const stats = $$('[data-hl]', scope);
  let days = [], sum = null, busy = false, locked = null;

  const setState = (state) => {
    root.dataset.state = state;
    ['loading', 'ready', 'error'].forEach((s) => root.classList.toggle(`is-${s}`, s === state));
    if (state === 'loading') root.setAttribute('aria-busy', 'true'); else root.removeAttribute('aria-busy');
    if (loadingEl) loadingEl.hidden = state !== 'loading';
    if (errorEl) errorEl.hidden = state !== 'error';
    if (cal) cal.hidden = state === 'error';
    emit(root, 'activity:state', { state });
  };

  const setField = (key, text, value) => {
    $$(fieldSel(key), scope).forEach((el) => {
      el.textContent = text;
      if (value !== undefined) el.dataset.value = String(value);
    });
  };

  function fill() {
    const long = sum.longest, cur = sum.current;
    setField('total', num(sum.total), sum.total);
    setField('days', num(sum.active), sum.active);
    setField('daysNote', `of ${days.length} days had a push`);
    setField('streak', num(long.len), long.len);
    setField('streakNote', long.len ? `${long.len === 1 ? 'day' : 'days'} in a row · ${fmt(long.start, SHORT)}–${fmt(long.end, SHORT)}` : 'days in a row');
    setField('currentStreak', num(cur.len), cur.len);
    setField('currentStreakNote', cur.len ? `${cur.len === 1 ? 'day' : 'days'} in a row, still going` : 'days in a row');
    setField('best', num(sum.best.count), sum.best.count);
    setField('bestNote', sum.best.count ? `${sum.best.count === 1 ? 'contribution' : 'contributions'} on ${fmt(sum.best.date, { ...SHORT, year: 'numeric' })}` : 'contributions');
  }

  async function load(fromRetry = false) {
    if (busy) return;
    busy = true;
    const hadFocus = fromRetry && retry && document.activeElement === retry;
    setState('loading');
    if (hadFocus) { root.tabIndex = -1; root.focus({ preventScroll: true }); }
    try {
      days = clean(await loadContributions());
      if (!days.length) throw new Error('empty');
    } catch {
      busy = false;
      if (cal) cal.replaceChildren();
      setState('error');
      if (hadFocus && retry && !errorEl?.hidden) retry.focus({ preventScroll: true });
      return;
    }
    sum = summarize(days);
    if (cal) {
      const { html, weeks } = gridHtml(days, sum);
      cal.innerHTML = html;
      cal.setAttribute('role', 'group');
      cal.setAttribute('aria-label', `GitHub contribution calendar: ${plural(sum.total, 'contribution')} in the last year`);
      cal.dataset.weeks = String(weeks);
      cal.style.setProperty('--weeks', String(weeks));
    }
    fill();
    busy = false;
    setState('ready');
    emit(root, 'activity:ready', { days, summary: sum });
  }

  retry?.addEventListener('click', () => load(true));

  // Tooltip: pointer only (the cells are decoration; the hidden summary and the stats carry the information)
  if (cal && tip) {
    cal.addEventListener('pointerover', (e) => {
      const c = e.target instanceof Element ? e.target.closest('[data-day][data-date]') : null;
      if (!c) return;
      const count = Number(c.dataset.count);
      tip.textContent = `${count ? plural(count, 'contribution') : 'No contributions'} · ${fmt(c.dataset.date, { weekday: 'short', ...SHORT, year: 'numeric' })}`;
      const r = c.getBoundingClientRect(), box = root.getBoundingClientRect();
      tip.style.setProperty('--tip-x', `${Math.round(r.left + r.width / 2 - box.left)}px`);
      tip.style.setProperty('--tip-y', `${Math.round(r.top - box.top)}px`);
      tip.classList.add('is-on');
    });
    cal.addEventListener('pointerleave', () => tip.classList.remove('is-on'));
  }

  // Stat highlight: a mouse previews on hover, a click (or tap) locks it, a second click releases
  const mark = (kind) => {
    if (!sum || !cal) return;
    const { longest: l, best } = sum;
    const li = sum._longest.start;
    const pick = kind === 'best' ? (i) => i === best.index
      : kind === 'streak' ? (i) => l.len > 0 && i >= li && i < li + l.len
      : (i) => days[i].count > 0;
    $$('[data-day][data-index]', cal).forEach((c) => c.classList.toggle('is-hl', pick(Number(c.dataset.index))));
    root.dataset.highlight = kind;
  };
  const unmark = () => {
    if (cal) $$('.is-hl', cal).forEach((c) => c.classList.remove('is-hl'));
    delete root.dataset.highlight;
  };
  const press = () => stats.forEach((s) => {
    s.classList.toggle('is-active', s === locked);
    if (s.hasAttribute('aria-pressed')) s.setAttribute('aria-pressed', String(s === locked));
  });
  stats.forEach((el) => {
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !locked) { mark(el.dataset.hl); el.classList.add('is-active'); } });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !locked) { unmark(); el.classList.remove('is-active'); } });
    el.addEventListener('click', () => {
      if (!sum) return;
      if (locked === el) { locked = null; unmark(); } else { locked = el; mark(el.dataset.hl); }
      press();
    });
  });

  // Load when near the viewport
  if (typeof IntersectionObserver === 'undefined') load();
  else {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '1000px 0px' });
    io.observe(scope);
  }

  setState('loading');
  return { reload: () => load(true) };
}

export function initActivity() {
  let out = null;
  try {
    const mini = $('[data-activity-mini]');
    if (mini) initMini(mini);
    const root = $('[data-activity]');
    if (root) out = initMain(root);
  } catch {}
  return out;
}
