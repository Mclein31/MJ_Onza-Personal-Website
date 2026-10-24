import { $, clamp, reducedMotion } from './util.js';

// [file, label, x%, y%, size px, invert in dark mode?] — placed in the gaps around the name so it stays readable.
const ICONS = [
  ['python-icon.png', 'Python', 52, 15, 76],
  ['postgres-icon.png', 'PostgreSQL', 80, 22, 80],
  ['claude-ai-icon.svg', 'Claude AI', 64, 30, 60],
  ['typescript-icon.png', 'TypeScript', 44, 46, 56],
  ['neon.svg', 'Neon', 6, 50, 62],
  ['javascript-icon.png', 'JavaScript', 93, 24, 60],
  ['git-icon.png', 'Git', 68, 18, 52],
  ['github-icon.png', 'GitHub', 26, 56, 56],
  ['vscode-icon.png', 'VS Code', 13, 62, 54],
  ['antigravity-icon.png', 'Antigravity', 56, 52, 54],
  ['cloudflare.svg', 'Cloudflare', 38, 63, 64],
  ['figma-icon.png', 'Figma', 86, 64, 50],
  ['java.png', 'Java', 46, 26, 50],
  ['html-icon.png', 'HTML5', 48, 60, 46],
  ['css-icon.png', 'CSS3', 54, 38, 46],
  ['obsidian-icon.png', 'Obsidian', 66, 60, 48],
  ['iterm2-icon.png', 'iTerm2', 20, 45, 48],
  ['react.svg', 'React', 72, 76, 62],
  ['nodejs.svg', 'Node.js', 88, 80, 62],
  ['expo.svg', 'Expo', 62, 88, 48, true],
  ['vercel.svg', 'Vercel', 80, 90, 44, true],
  ['hono.svg', 'Hono', 30, 18, 52],
  ['googlegemini.svg', 'Gemini', 96, 72, 52],
  ['cursor.png', 'Cursor', 58, 72, 50],
];

// Phones stack the name on the left, so they get their own spots: [label, x%, y%]
const MOBILE = [
  ['Python', 60, 19], ['PostgreSQL', 82, 27], ['Neon', 10, 24], ['Claude AI', 36, 27],
  ['Git', 66, 36], ['TypeScript', 86, 44], ['React', 60, 52], ['Cloudflare', 10, 57],
  ['VS Code', 34, 60], ['Node.js', 58, 61], ['Gemini', 84, 58],
];

const SCALE = 1.4; // desktop size multiplier for the sizes above

export function initIcons() {
  const field = $('[data-icon-field]');
  if (!field) return;
  const hero = field.parentElement;
  const small = innerWidth < 860;
  const list = small
    ? MOBILE.map(([label, x, y]) => { const icon = ICONS.find((ic) => ic[1] === label); return [icon[0], label, x, y, icon[4], icon[5]]; })
    : ICONS;

  const bodies = list.map(([file, label, px, py, size, invert], i) => {
    const el = document.createElement('div');
    el.className = 'float-icon' + (invert ? ' invert-dark' : '');
    el.style.setProperty('--fi', i);
    if (!small) el.style.setProperty('--size', Math.round(size * SCALE) + 'px');
    el.innerHTML = `<img src="assets/icons/${file}" alt="" draggable="false" decoding="async" /><span class="tip">${label}</span>`;
    field.append(el);
    return { el, px, py, x: 0, y: 0, vx: 0, vy: 0, w: 0, held: false, phase: Math.random() * Math.PI * 2 };
  });

  let W = 0, H = 0;
  const layout = () => {
    W = hero.clientWidth; H = hero.clientHeight;
    bodies.forEach((b) => {
      b.w = b.el.offsetWidth;
      b.x = clamp((b.px / 100) * W, 0, W - b.w);
      b.y = clamp((b.py / 100) * H, 0, H - b.w);
    });
  };
  layout();
  addEventListener('resize', layout);

  // Dragging: track pointer velocity so a release "throws" the icon
  bodies.forEach((b) => {
    let ox = 0, oy = 0, lx = 0, ly = 0, lt = 0;
    b.el.addEventListener('pointerdown', (e) => {
      e.preventDefault(); // no text selection or native image drag while grabbing
      document.documentElement.classList.add('is-dragging-icon');
      b.held = true; b.el.classList.add('is-grabbed'); b.el.setPointerCapture(e.pointerId);
      ox = e.clientX - b.x; oy = e.clientY - b.y; lx = e.clientX; ly = e.clientY; lt = performance.now();
    });
    b.el.addEventListener('pointermove', (e) => {
      if (!b.held) return;
      const now = performance.now(), dt = Math.max(1, now - lt);
      b.vx = ((e.clientX - lx) / dt) * 16; b.vy = ((e.clientY - ly) / dt) * 16;
      lx = e.clientX; ly = e.clientY; lt = now;
      b.x = clamp(e.clientX - ox, 0, W - b.w); b.y = clamp(e.clientY - oy, 0, H - b.w);
    });
    const release = () => {
      b.held = false; b.el.classList.remove('is-grabbed');
      document.documentElement.classList.remove('is-dragging-icon');
    };
    b.el.addEventListener('pointerup', release);
    b.el.addEventListener('pointercancel', release);
  });

  const still = reducedMotion.matches;
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);

  const step = (t) => {
    if (visible) {
      bodies.forEach((b) => {
        if (!b.held) {
          b.x += b.vx; b.y += b.vy; b.vx *= 0.93; b.vy *= 0.93;
          if (b.x < 0 || b.x > W - b.w) { b.vx *= -0.7; b.x = clamp(b.x, 0, W - b.w); }
          if (b.y < 0 || b.y > H - b.w) { b.vy *= -0.7; b.y = clamp(b.y, 0, H - b.w); }
        }
        const bob = still || b.held ? 0 : Math.sin(t / 1400 + b.phase) * 6;
        const tilt = clamp(b.vx * 2, -18, 18);
        b.el.style.transform = `translate3d(${b.x}px, ${b.y + bob}px, 0) rotate(${tilt}deg)`;
      });
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
