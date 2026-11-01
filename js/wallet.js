/* ==========================================================================
   Wallet — brings a pass to the front, types the email, fills the GitHub weeks
   ========================================================================== */
import { $, $$, reducedMotion } from './util.js';
import { play } from './sfx.js';

function clock12() {
  const el = $('[data-clock-12]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 15000);
}

// The email's first line types itself once the pass is in front and on screen
function typer(span) {
  const text = span.textContent;
  let timer = 0;
  return () => {
    clearInterval(timer);
    if (reducedMotion.matches) { span.textContent = text; return; }
    let i = 0;
    span.textContent = '';
    timer = setInterval(() => {
      span.textContent = text.slice(0, ++i);
      if (text[i - 1] !== ' ') play('type');
      if (i >= text.length) clearInterval(timer);
    }, 38);
  };
}

// Eighteen weeks from the activity calendar, once activity.js has drawn it
function fillGrid(grid, totalEl) {
  const cells = $$('.activity__grid .cell:not(.pad)');
  if (!grid || !cells.length || grid.childElementCount) return;
  cells.slice(-126).forEach((c) => {
    const i = document.createElement('i');
    i.dataset.l = c.dataset.l || '0';
    grid.append(i);
  });
  const total = $('[data-act="total"]')?.textContent.trim();
  if (totalEl && total) totalEl.textContent = `${total} contributions this year`;
}

export function initWallet() {
  clock12();
  const wallet = $('[data-wallet]');
  if (!wallet) return;
  wallet.classList.add('is-live');
  const passes = $$('.pass', wallet);
  const order = passes.slice(); // back to front
  const typing = $('[data-typing]', wallet);
  const type = typing ? typer(typing) : () => {};
  const grid = $('[data-pass-grid]', wallet);
  const total = $('[data-pass-total]', wallet);
  let seen = false;

  const render = () => order.forEach((p, pos) => {
    const front = pos === order.length - 1;
    p.style.setProperty('--pos', pos);
    p.classList.toggle('is-front', front);
    $('.pass__head', p).setAttribute('aria-expanded', String(front));
    $('.pass__body', p).inert = !front;
  });

  const bring = (p) => {
    if (order[order.length - 1] === p) return;
    order.splice(order.indexOf(p), 1);
    order.push(p);
    render();
    if (p.classList.contains('pass--mail')) type();
    if (p.classList.contains('pass--gh')) fillGrid(grid, total);
  };
  passes.forEach((p) => $('.pass__head', p).addEventListener('click', () => bring(p)));
  render();

  new IntersectionObserver((entries, io) => entries.forEach((e) => {
    if (!e.isIntersecting || seen) return;
    seen = true;
    type();
    io.disconnect();
  }), { threshold: 0.4 }).observe(wallet);
}
