/* ==========================================================================
   Hero icons — the tools and stack, floating in the right-hand zone; drag them anywhere in the hero
   ========================================================================== */
import { $, $$, clamp, reducedMotion } from './util.js';
import { play } from './sfx.js';

// [file, label, mono] — mono marks are black and turn white on the night page
const ICONS = [
  ['python-icon.png', 'Python'], ['postgres-icon.png', 'PostgreSQL'], ['sqlite.svg', 'SQLite'],
  ['neon.svg', 'Neon'], ['supabase.svg', 'Supabase'], ['drizzle.svg', 'Drizzle'],
  ['typescript-icon.png', 'TypeScript'], ['javascript-icon.png', 'JavaScript'], ['react.svg', 'React'],
  ['angular.svg', 'Angular'], ['ionic.svg', 'Ionic'], ['capacitor.svg', 'Capacitor'],
  ['expo.svg', 'Expo', true], ['nodejs.svg', 'Node.js'], ['hono.svg', 'Hono'],
  ['cloudflare.svg', 'Cloudflare'], ['vercel.svg', 'Vercel', true], ['git-icon.png', 'Git'],
  ['github-icon.png', 'GitHub'], ['vscode-icon.png', 'VS Code'], ['cursor.png', 'Cursor'],
  ['claude-ai-icon.svg', 'Claude'], ['gemini.svg', 'Gemini'], ['ollama.webp', 'Ollama'],
];

export function initIcons() {
  const field = $('[data-icon-field]');
  const zone = $('.hero__zone');
  if (!field || !zone) return;
  const box = field.parentElement;

  const bodies = ICONS.map(([file, label, mono], i) => {
    const el = document.createElement('div');
    el.className = 'float-icon' + (mono ? ' float-icon--mono' : '');
    el.style.setProperty('--fi', i);
    el.innerHTML = `<img src="assets/icons/${file}" alt="" draggable="false" decoding="async" /><span class="tip">${label}</span>`;
    field.append(el);
    return { el, x: 0, y: 0, w: 0, held: false, moved: false, tilt: 0, phase: Math.random() * Math.PI * 2 };
  });

  // An even grid in the zone, as large as fits; icons that were dragged stay where they were left
  let W = 0, H = 0;
  const layout = () => {
    W = box.clientWidth; H = box.clientHeight;
    const b = box.getBoundingClientRect(), z = zone.getBoundingClientRect();
    const zx = z.left - b.left, zy = z.top - b.top, zw = z.width, zh = z.height;
    const n = bodies.length;
    let best = null;
    // Five columns or more, capped size: a loose cloud beside the name, not a tall wall
    for (let cols = 5; cols <= 8; cols++) {
      const rows = Math.ceil(n / cols);
      const s = Math.min(58, zw / (cols + (cols - 1) * 0.55), zh / (rows + (rows - 1) * 0.55));
      if (!best || s > best.s) best = { cols, rows, s };
    }
    const { cols, rows, s } = best;
    const gap = s * 0.55, step = s + gap;
    field.style.setProperty('--size', `${s}px`);
    const ox = zx + zw - (cols * step - gap), oy = zy + (zh - (rows * step - gap)) / 2;
    bodies.forEach((bd, i) => {
      bd.w = s;
      if (bd.moved) { bd.x = clamp(bd.x, 0, W - s); bd.y = clamp(bd.y, 0, H - s); return; }
      // Odd rows shift half a step, so the grid reads as scattered rather than a table
      const row = Math.floor(i / cols);
      bd.x = ox + (i % cols) * step - (row % 2 ? step / 2 : 0) + step / 4;
      bd.y = oy + row * step;
    });
  };
  layout();
  new ResizeObserver(layout).observe(box);
  addEventListener('load', layout);
  document.fonts?.ready.then(layout);

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
      b.held = true; b.moved = true;
      b.el.classList.add('is-grabbed'); b.el.setPointerCapture(e.pointerId);
      ox = e.clientX - b.x; oy = e.clientY - b.y; lastX = e.clientX;
      play('tap');
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
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(box);
  const frame = (t) => {
    if (visible) bodies.forEach((b) => {
      const bob = b.held ? 0 : bobAt(b, t);
      b.tilt *= 0.85;
      b.el.style.transform = `translate3d(${b.x}px, ${b.y + bob}px, 0) rotate(${b.tilt.toFixed(2)}deg)`;
    });
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  $$('.float-icon img', field).forEach((img) => img.addEventListener('error', () => img.closest('.float-icon').remove(), { once: true }));
}
