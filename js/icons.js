/* ==========================================================================
   Hero icons — draggable floating tech icons
   ========================================================================== */
import { $, $$, clamp, reducedMotion } from './util.js';

const ICONS = [
  ['python-icon.png', 'Python', 51, 17, 76],
  ['postgres-icon.png', 'PostgreSQL', 80, 21, 80],
  ['claude-ai-icon.svg', 'Claude AI', 64, 29, 60],
  ['typescript-icon.png', 'TypeScript', 33, 57, 56],
  ['neon.svg', 'Neon', 6, 50, 62],
  ['javascript-icon.png', 'JavaScript', 93, 24, 60],
  ['git-icon.png', 'Git', 68, 19, 52],
  ['github-icon.png', 'GitHub', 44, 46, 56],
  ['vscode-icon.png', 'VS Code', 18, 60, 54],
  ['antigravity-icon.png', 'Antigravity', 53, 56, 54],
  ['cloudflare.svg', 'Cloudflare', 71, 64, 64],
  ['figma-icon.png', 'Figma', 83, 36, 50],
  ['java.png', 'Java', 39, 17, 50],
  ['html-icon.png', 'HTML5', 57, 71, 46],
  ['css-icon.png', 'CSS3', 54, 37, 46],
  ['obsidian-icon.png', 'Obsidian', 13, 18, 48],
  ['iterm2-icon.png', 'iTerm2', 20, 44, 48],
  ['react.svg', 'React', 73, 81, 62],
  ['nodejs.svg', 'Node.js', 85, 68, 62],
  ['hono.svg', 'Hono', 27, 13, 52],
];



export function initIcons() {
  const field = $('[data-icon-field]');
  if (!field) return;
  const hero = field.parentElement;
  // The data and backend story only; when space runs out, the last ones are left out
  const ORDER = ['Python', 'PostgreSQL', 'Neon', 'Cloudflare', 'Git', 'GitHub', 'TypeScript', 'Claude AI'];
  const list = ORDER.map((label) => ICONS.find((ic) => ic[1] === label)).filter(Boolean);

  const bodies = list.map(([file, label], i) => {
    const el = document.createElement('div');
    el.className = 'float-icon';
    el.style.setProperty('--fi', i);
    el.innerHTML = `<img src="assets/icons/${file}" alt="" draggable="false" decoding="async" /><span class="tip">${label}</span>`;
    field.append(el);
    return { el, x: 0, y: 0, w: 0, held: false, tilt: 0, phase: Math.random() * Math.PI * 2 };
  });

  // The icons get their own zone: right of the name, the grid's right edge on the container's,
  // centred on the name; where that is too narrow (phones), one row between the top rule and the name
  const measure = () => {
    const box = hero.getBoundingClientRect();
    const rel = (r) => ({ l: r.left - box.left, t: r.top - box.top, r: r.right - box.left, b: r.bottom - box.top });
    const meta = rel($('.hero__meta', hero).getBoundingClientRect());
    const lines = $$('.hero__name .line', hero).map((line) => { const rg = document.createRange(); rg.selectNodeContents(line); return rel(rg.getBoundingClientRect()); });
    const cta = rel($('.hero__cta', hero).getBoundingClientRect());
    return { meta, cta, nameRight: Math.max(...lines.map((r) => r.r)), nameTop: Math.min(...lines.map((r) => r.t)), nameBottom: Math.max(...lines.map((r) => r.b)) };
  };

  let W = 0, H = 0;
  const layout = () => {
    W = hero.clientWidth; H = hero.clientHeight;
    const m = measure();
    const n = bodies.length;
    // An even split only: 4 by 2, else a smaller 2 by 4 that ends level with the name, else one row above the name
    const tries = innerWidth < 860 ? [] : [[64, 4, m.cta.b - m.meta.b], [52, 4, m.cta.b - m.meta.b], [52, 2, m.nameBottom - m.nameTop]];
    let size = 44, fit = 0;
    for (const [s, c, h] of tries) {
      const g = s * 0.6, sp = (k) => k * s + (k - 1) * g;
      if (sp(c) <= m.meta.r - (m.nameRight + s) && sp(Math.ceil(n / c)) <= h) { size = s; fit = c; break; }
    }
    const gap = size * 0.6, step = size + gap;
    const span = (k) => k * size + (k - 1) * gap;
    field.style.setProperty('--size', size + 'px');
    let cols, rows, ox, oy;
    if (fit) {
      cols = fit; rows = Math.ceil(n / cols);
      ox = m.meta.r - span(cols);
      oy = clamp((m.nameTop + m.nameBottom) / 2 - span(rows) / 2, m.meta.b + gap, m.cta.b - span(rows));
    } else {
      cols = Math.min(n, Math.floor((m.meta.r - m.meta.l + gap) / step)); rows = 1;
      const bandH = m.nameTop - m.meta.b;
      if (bandH < size + gap) cols = 0;
      ox = m.meta.l; oy = m.meta.b + (bandH - size) / 2;
    }
    bodies.forEach((b, i) => {
      b.w = size;
      b.el.hidden = i >= cols * rows;
      if (b.el.hidden) return;
      b.x = ox + (i % cols) * step;
      b.y = oy + Math.floor(i / cols) * step;
    });
  };
  layout();
  addEventListener('resize', layout);
  // Re-place when the name or the hero changes size (the web font swapping in, a resize)
  let lastKey = '';
  const ro = new ResizeObserver(() => {
    const key = `${hero.clientWidth}x${hero.clientHeight}:${$('.hero__name', hero)?.offsetWidth}:${$('.hero__intro', hero)?.offsetTop}`;
    if (key !== lastKey) { lastKey = key; layout(); }
  });
  [hero, $('.hero__name', hero), $('.hero__intro', hero)].forEach((el) => el && ro.observe(el));
  addEventListener('load', layout);

  const still = reducedMotion.matches;
  const bobAt = (b, t) => (still ? 0 : Math.sin(t / 1400 + b.phase) * 3);

  let topZ = 1;
  bodies.forEach((b) => {
    let ox = 0, oy = 0, lastX = 0;
    b.el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      document.documentElement.classList.add('is-dragging-icon');
      b.y += bobAt(b, performance.now());
      b.el.style.zIndex = String(++topZ);
      b.held = true; b.el.classList.add('is-grabbed'); b.el.setPointerCapture(e.pointerId);
      ox = e.clientX - b.x; oy = e.clientY - b.y; lastX = e.clientX;
    });
    b.el.addEventListener('pointermove', (e) => {
      if (!b.held) return;
      b.tilt = clamp(b.tilt + (e.clientX - lastX) * 0.6, -8, 8);
      lastX = e.clientX;
      b.x = clamp(e.clientX - ox, 0, W - b.w); b.y = clamp(e.clientY - oy, 0, H - b.w);
    });
    const release = () => {
      if (!b.held) return;
      b.held = false; b.el.classList.remove('is-grabbed');
      document.documentElement.classList.remove('is-dragging-icon');
      b.phase = -performance.now() / 1400;
    };
    b.el.addEventListener('pointerup', release);
    b.el.addEventListener('pointercancel', release);
  });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);

  const step = (t) => {
    if (visible) {
      bodies.forEach((b) => {
        const bob = b.held ? 0 : bobAt(b, t);
        b.tilt *= 0.85;
        b.el.style.transform = `translate3d(${b.x}px, ${b.y + bob}px, 0) rotate(${b.tilt.toFixed(2)}deg)`;
      });
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
