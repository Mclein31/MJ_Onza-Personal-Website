import { $, $$, clamp, finePointer, reducedMotion, toast, copyText, arrowKeys } from './util.js';

function menu() {
  const btn = $('[data-menu-toggle]');
  const panel = $('#menu');
  if (!btn || !panel) return;
  const set = (open) => {
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', open);
  };
  btn.addEventListener('click', () => set(!panel.classList.contains('is-open')));
  $$('a', panel).forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

// Click the top card: it flies off and rejoins at the back of the deck
function deck() {
  const el = $('[data-deck]');
  if (!el) return;
  const order = () => $$('.deck__card', el).forEach((c, i) => {
    c.style.setProperty('--d', Math.min(i, 4));
    c.inert = i > 0;
  });
  order();
  let busy = false;
  el.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    const top = el.firstElementChild;
    const hadFocus = document.activeElement === top;
    top.classList.add('is-leaving');
    setTimeout(() => {
      top.classList.remove('is-leaving');
      el.append(top);
      order();
      if (hadFocus) el.firstElementChild.focus({ preventScroll: true });
      busy = false;
    }, reducedMotion.matches ? 0 : 240);
  });
}

// Hovering (or tapping) a row "joins" it against rows sharing any tag
function schema() {
  const el = $('[data-schema]');
  if (!el) return;
  const rows = $$('.row', el);
  let source = null;
  const join = (row) => {
    source = row;
    const tags = row ? row.dataset.join.split(' ') : [];
    el.classList.toggle('is-joining', !!row);
    rows.forEach((r) => {
      r.classList.toggle('is-source', r === row);
      r.classList.toggle('is-joined', !!row && r !== row && r.dataset.join.split(' ').some((t) => tags.includes(t)));
    });
  };
  rows.forEach((row) => {
    row.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') join(row); });
    row.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') join(null); });
    row.addEventListener('click', (e) => { if (e.pointerType !== 'mouse') join(source === row ? null : row); });
  });
}

function tilt() {
  if (!finePointer.matches || reducedMotion.matches) return;
  $$('[data-tilt]').forEach((el) => {
    const frame = el.firstElementChild;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      frame.style.setProperty('--rx', `${(x - 0.5) * 10}deg`);
      frame.style.setProperty('--ry', `${(0.5 - y) * 10}deg`);
      frame.style.setProperty('--gx', `${x * 100}%`);
      frame.style.setProperty('--gy', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => ['--rx', '--ry'].forEach((p) => frame.style.removeProperty(p)));
  });
}

function film() {
  const track = $('[data-film-track]');
  if (!track) return;
  const frames = $$('.film__frame', track);
  const idxEl = $('[data-film-i]');
  const go = (i) => track.scrollTo({ left: clamp(i, 0, frames.length - 1) * track.clientWidth, behavior: 'smooth' });
  const current = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
  $('[data-film-prev]')?.addEventListener('click', () => go(current() - 1));
  $('[data-film-next]')?.addEventListener('click', () => go(current() + 1 >= frames.length ? 0 : current() + 1));
  track.addEventListener('scroll', () => { if (idxEl) idxEl.textContent = String(current() + 1).padStart(2, '0'); }, { passive: true });
  arrowKeys(track, current, go);

  // Mouse drag to scrub (touch already scrolls natively)
  let down = false, sx = 0, sl = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-dragging');
  });
  addEventListener('pointermove', (e) => { if (down) track.scrollLeft = sl - (e.clientX - sx); });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false; track.classList.remove('is-dragging'); go(current());
  });
}

function copyButtons() {
  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
    await copyText(btn.dataset.copy);
    toast('Email copied to clipboard');
  }));
}

export function initUI() {
  menu();
  deck();
  schema();
  tilt();
  film();
  copyButtons();
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}
