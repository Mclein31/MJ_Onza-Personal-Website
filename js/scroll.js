import { $, $$, clamp, viewProgress } from './util.js';

function splitWords(p) {
  const out = [];
  const walk = (node, hl) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return out.push(document.createTextNode(part));
          const s = document.createElement('span');
          s.className = 'w' + (hl ? ' hl' : '');
          s.textContent = part;
          out.push(s);
        });
      } else walk(n, hl || n.classList?.contains('hl'));
    });
  };
  walk(p, false);
  p.textContent = '';
  p.append(...out);
  return out.filter((n) => n.nodeType === 1);
}

function countUp(el) {
  const to = Number(el.dataset.countup);
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / 1200);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function initScroll() {
  // One-shot reveals
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      $$('[data-countup]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  $$('[data-reveal], .milestone').forEach((el) => io.observe(el));

  // Scroll spy
  const links = $$('.nav__links a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));

  const nav = $('.nav');
  const progress = $('.progress');
  const words = $('[data-words]') ? splitWords($('[data-words]')) : [];
  const manifesto = $('.manifesto');
  const timeline = $('[data-timeline]');
  const cards = $$('[data-award]');
  const mark = $('[data-footer-mark]');
  let lastY = scrollY, ticking = false;

  const update = () => {
    ticking = false;
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress?.style.setProperty('--progress', max > 0 ? y / max : 0);

    if (nav) {
      nav.classList.toggle('is-scrolled', y > 24);
      const menuOpen = document.body.classList.contains('is-locked');
      nav.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 400);
    }
    lastY = y;

    if (manifesto && words.length) {
      const p = viewProgress(manifesto, 0.85, 0.35);
      const lit = Math.floor(p * words.length * 1.05);
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    }

    if (timeline) timeline.style.setProperty('--tp', viewProgress(timeline, 0.7, 0.5));

    // Each award card shrinks a little as the next one slides over it
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      const a = card.getBoundingClientRect(), b = next.getBoundingClientRect();
      const overlap = clamp(1 - (b.top - a.top) / a.height, 0, 1);
      card.style.setProperty('--s', 1 - overlap * 0.05);
    });

    // Footer wordmark fills from the moment it enters until the very bottom of the page
    if (mark) {
      const r = mark.getBoundingClientRect();
      const remaining = Math.max(0, max - y);
      const fill = clamp((innerHeight - r.top) / Math.max(1, innerHeight - r.top + remaining), 0, 1);
      mark.style.setProperty('--fill', fill * 100 + '%');
    }
  };

  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  // Size the footer wordmark so it spans the container exactly
  const fitMark = () => {
    if (!mark) return;
    const range = document.createRange();
    range.selectNodeContents(mark);
    // Text width isn't perfectly linear in font size (hinting), so refine a few times
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
