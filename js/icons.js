import { $, clamp, reducedMotion } from './util.js';

// [file, label, x%, y%, size px] — placed in the gaps around the name so it stays readable.
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
  ['figma-icon.png', 'Figma', 91, 69, 50],
  ['java.png', 'Java', 46, 26, 50],
  ['html-icon.png', 'HTML5', 48, 60, 46],
  ['css-icon.png', 'CSS3', 54, 38, 46],
  ['obsidian-icon.png', 'Obsidian', 64, 72, 48],
  ['iterm2-icon.png', 'iTerm2', 20, 45, 48],
  ['react.svg', 'React', 78, 80, 62],
  ['nodejs.svg', 'Node.js', 88, 81, 62],
  ['hono.svg', 'Hono', 30, 18, 52],
];

// Phones stack the name on the left, so they get their own spots: [label, x%, y%]
const MOBILE = [
  ['Python', 60, 19], ['PostgreSQL', 82, 27], ['Neon', 10, 24], ['Claude AI', 36, 27],
  ['Git', 66, 36], ['TypeScript', 86, 44], ['React', 60, 52], ['Cloudflare', 10, 57],
  ['VS Code', 34, 60], ['Node.js', 58, 61],
];

const SCALE = 1.4; // desktop size multiplier for the sizes above

export function initIcons() {
  const field = $('[data-icon-field]');
  if (!field) return;
  const hero = field.parentElement;
  const small = innerWidth < 860;
  const list = small
    ? MOBILE.map(([label, x, y]) => { const icon = ICONS.find((ic) => ic[1] === label); return [icon[0], label, x, y, icon[4]]; })
    : ICONS;

  const bodies = list.map(([file, label, px, py, size], i) => {
    const el = document.createElement('div');
    el.className = 'float-icon';
    el.style.setProperty('--fi', i);
    if (!small) el.style.setProperty('--size', Math.round(size * SCALE) + 'px');
    el.innerHTML = `<img src="assets/icons/${file}" alt="" draggable="false" decoding="async" /><span class="tip">${label}</span>`;
    field.append(el);
    return { el, px, py, x: 0, y: 0, w: 0, held: false, tilt: 0, phase: Math.random() * Math.PI * 2 };
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

  const still = reducedMotion.matches;
  const bobAt = (b, t) => (still ? 0 : Math.sin(t / 1400 + b.phase) * 6);

  // Dragging: the icon follows the pointer 1:1 and stays exactly where it's dropped (no throw).
  // The last icon grabbed stays on top, so you can always pick it up again.
  let topZ = 1;
  bodies.forEach((b) => {
    let ox = 0, oy = 0, lastX = 0;
    b.el.addEventListener('pointerdown', (e) => {
      e.preventDefault(); // no text selection or native image drag while grabbing
      document.documentElement.classList.add('is-dragging-icon');
      b.y += bobAt(b, performance.now()); // keep the icon exactly where it is when grabbed
      b.el.style.zIndex = String(++topZ);
      b.held = true; b.el.classList.add('is-grabbed'); b.el.setPointerCapture(e.pointerId);
      ox = e.clientX - b.x; oy = e.clientY - b.y; lastX = e.clientX;
    });
    b.el.addEventListener('pointermove', (e) => {
      if (!b.held) return;
      b.tilt = clamp(b.tilt + (e.clientX - lastX) * 0.6, -8, 8); // small lean in the drag direction
      lastX = e.clientX;
      b.x = clamp(e.clientX - ox, 0, W - b.w); b.y = clamp(e.clientY - oy, 0, H - b.w);
    });
    const release = () => {
      if (!b.held) return;
      b.held = false; b.el.classList.remove('is-grabbed');
      document.documentElement.classList.remove('is-dragging-icon');
      b.phase = -performance.now() / 1400; // resume floating from zero offset, so no jump on drop
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
        b.tilt *= 0.85; // lean eases back to upright
        b.el.style.transform = `translate3d(${b.x}px, ${b.y + bob}px, 0) rotate(${b.tilt.toFixed(2)}deg)`;
      });
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
