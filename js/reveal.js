import { $$, clamp } from './util.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');

// Split a heading into word spans; a .hl run stays one box whose words light in turn
function splitWords(el) {
  const words = [];
  const wrap = (text, into) => text.split(/(\s+)/).forEach((part) => {
    if (!part) return;
    if (/^\s+$/.test(part)) return into.append(document.createTextNode(part));
    const w = document.createElement('span');
    w.className = 'sw';
    w.textContent = part;
    into.append(w);
    words.push(w);
  });
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      wrap(n.textContent, frag);
      n.replaceWith(frag);
    } else if (n.classList?.contains('hl')) {
      const text = n.textContent;
      n.textContent = '';
      const first = words.length;
      wrap(text, n);
      n._range = [first, words.length];
    }
  });
  return words;
}

function scrubHeadings() {
  const heads = $$('[data-scrub]').map((el) => ({ el, words: splitWords(el), boxes: $$('.hl', el) }));
  if (!heads.length) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    heads.forEach(({ el, words, boxes }) => {
      const r = el.getBoundingClientRect();
      // Starts as the heading clears the bottom tenth of the screen, done by the upper half
      const start = innerHeight * 0.92, end = innerHeight * 0.45;
      const p = clamp((start - r.top) / (start - end), 0, 1);
      const lit = p * words.length;
      words.forEach((w, i) => w.style.setProperty('--o', (0.14 + 0.86 * clamp(lit - i, 0, 1)).toFixed(3)));
      boxes.forEach((b) => {
        const [a, z] = b._range;
        const f = clamp((lit - a) / Math.max(1, z - a), 0, 1);
        b.style.setProperty('--wipe', `${(f * 100).toFixed(1)}%`);
        b.classList.toggle('is-dim', f < 0.98);
      });
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
}

// Blocks rise once as they enter; children of [data-rise="kids"] stagger
function rise() {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  $$('[data-rise]').forEach((el) => {
    if (el.dataset.rise === 'kids') [...el.children].forEach((c, i) => c.style.setProperty('--i', i));
    io.observe(el);
  });
}

export function initReveal() {
  if (reduced.matches) return;
  document.documentElement.classList.add('reveal-ready');
  scrubHeadings();
  rise();
}
