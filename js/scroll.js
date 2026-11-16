import { $, $$, clamp } from './util.js';

const SCROLL_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']);
let userScroll = false, intentTimer;
const markIntent = () => {
  userScroll = true;
  clearTimeout(intentTimer);
  intentTimer = setTimeout(() => { userScroll = false; }, 250);
};

export function initScroll() {
  const links = $$('.nav__links a');
  const pill = $('.nav__pill');
  // The pill slides under the active link; with none active (the hero) it fades out
  const placePill = () => {
    if (!pill) return;
    const a = links.find((l) => l.classList.contains('is-active'));
    pill.style.setProperty('--po', a ? 1 : 0);
    if (!a) return;
    pill.style.setProperty('--px', `${a.offsetLeft}px`);
    pill.style.setProperty('--pw', `${a.offsetWidth}px`);
  };
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
      placePill();
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));
  document.fonts?.ready.then(placePill);
  addEventListener('resize', placePill);

  const nav = $('.nav');
  // The bar steps aside once the footer's edge reaches it, so the vista shows in full
  const footer = $('footer');
  const clearFooter = () => nav?.classList.toggle('is-away', !!footer && footer.getBoundingClientRect().top <= nav.offsetHeight);
  addEventListener('scroll', clearFooter, { passive: true });
  addEventListener('resize', clearFooter);
  const mark = $('[data-footer-mark]');
  let lastY = scrollY, upY = scrollY, ticking = false;

  const update = () => {
    ticking = false;
    const y = scrollY;

    if (nav) {
      nav.classList.toggle('is-scrolled', y > 24);
      const menuOpen = document.body.classList.contains('is-locked');
      if (userScroll) markIntent();
      if (y < lastY || !userScroll || menuOpen) upY = y;
      nav.classList.toggle('is-hidden', y - upY > 48 && y > 400);
    }
    lastY = y;

    if (mark) {
      const r = mark.getBoundingClientRect();
      const max = document.documentElement.scrollHeight - innerHeight;
      const remaining = Math.max(0, max - y);
      const fill = clamp((innerHeight - r.top) / Math.max(1, innerHeight - r.top + remaining), 0, 1);
      mark.style.setProperty('--fill', fill * 100 + '%');
    }
  };

  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('a[href^="#"]')) return;
    userScroll = false;
    clearTimeout(intentTimer);
  });
  addEventListener('wheel', markIntent, { passive: true });
  addEventListener('touchmove', markIntent, { passive: true });
  addEventListener('keydown', (e) => { if (SCROLL_KEYS.has(e.key)) markIntent(); });
  const fitMark = () => {
    if (!mark) return;
    const range = document.createRange();
    range.selectNodeContents(mark);
    let size = 100;
    for (let i = 0; i < 4; i++) {
      mark.style.fontSize = `${size}px`;
      const textW = range.getBoundingClientRect().width;
      if (!textW || Math.abs(textW - mark.clientWidth) < 1) break;
      size *= mark.clientWidth / textW;
    }
  };
  fitMark();
  document.fonts?.ready.then(() => { fitMark(); update(); });

  addEventListener('resize', () => { fitMark(); update(); });
  update();
}
