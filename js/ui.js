import { $, $$, clamp, toast, copyText, arrowKeys } from './util.js';

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

// What I do: one row open at a time; the open row's button closes it
function does() {
  const rows = $$('[data-does] .does__row');
  const set = (row, open) => {
    row.classList.toggle('is-open', open);
    $('.does__btn', row).setAttribute('aria-expanded', String(open));
  };
  rows.forEach((row) => $('.does__btn', row).addEventListener('click', () => {
    const open = !row.classList.contains('is-open');
    rows.forEach((r) => set(r, r === row && open));
  }));
}

function copyButtons() {
  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
    await copyText(btn.dataset.copy);
    toast('Email copied to clipboard');
  }));
}

export function initUI() {
  menu();
  does();
  schema();
  film();
  copyButtons();
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}
