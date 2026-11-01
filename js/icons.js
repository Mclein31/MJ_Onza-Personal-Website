import { $, reducedMotion } from './util.js';

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
  if (!field) return;

  const track = document.createElement('div');
  track.className = 'icon-track';
  const group = document.createElement('ul');
  group.className = 'icon-group';
  for (const [file, label, mono] of ICONS) {
    const item = document.createElement('li');
    item.className = 'tech-icon' + (mono ? ' tech-icon--mono' : '');
    const img = document.createElement('img');
    img.src = `assets/icons/${file}`;
    img.alt = label;
    img.draggable = false;
    item.title = label;
    item.append(img);
    group.append(item);
  }
  track.append(group);
  field.append(track);

  let drag = null;
  const restore = () => {
    if (!drag) return;
    drag.item.classList.remove('is-lifted');
    drag.ghost.remove();
    drag = null;
  };
  const grab = e => {
    if (!e.isPrimary || e.button !== 0) return;
    const item = e.target.closest('.tech-icon');
    if (!item) return;
    e.preventDefault();
    if (!drag || item !== drag.ghost) {
      restore();
      const ghost = document.createElement('div');
      ghost.className = item.className + ' tech-icon--drag';
      ghost.setAttribute('aria-hidden', 'true');
      ghost.append(item.querySelector('img').cloneNode());
      const rect = item.getBoundingClientRect();
      Object.assign(ghost.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
      document.body.append(ghost);
      item.classList.add('is-lifted');
      drag = { item, ghost, x: 0, y: 0, vx: 0, vy: 0 };
      ghost.addEventListener('pointerdown', grab);
      ghost.addEventListener('pointermove', move);
      ghost.addEventListener('pointerup', drop);
      ghost.addEventListener('pointercancel', drop);
      ghost.addEventListener('lostpointercapture', drop);
    }
    Object.assign(drag, { held: true, id: e.pointerId, px: e.clientX, py: e.clientY, time: e.timeStamp, vx: 0, vy: 0 });
    drag.ghost.style.cursor = 'grabbing';
    drag.ghost.setPointerCapture(e.pointerId);
  };
  const move = e => {
    if (!drag?.held || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.px, dy = e.clientY - drag.py;
    const dt = Math.max(8, e.timeStamp - drag.time) / 1000;
    drag.x += dx; drag.y += dy;
    drag.vx = Math.max(-1500, Math.min(1500, dx / dt));
    drag.vy = Math.max(-1500, Math.min(1500, dy / dt));
    drag.px = e.clientX; drag.py = e.clientY; drag.time = e.timeStamp;
    drag.ghost.style.transform = `translate3d(${drag.x}px, ${drag.y}px, 0)`;
  };
  const drop = e => {
    if (!drag?.held || e.pointerId !== drag.id) return;
    drag.held = false;
    drag.ghost.style.cursor = 'grab';
    if (e.timeStamp - drag.time > 80 || e.type !== 'pointerup') drag.vx = drag.vy = 0;
    if (reducedMotion.matches) restore();
  };
  field.addEventListener('pointerdown', grab);

  let clone;
  const syncMotion = () => {
    restore();
    clone?.remove();
    clone = null;
    if (!reducedMotion.matches) {
      clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.append(clone);
    }
  };
  syncMotion();
  reducedMotion.addEventListener('change', syncMotion);

  let hovering = false, focused = false, touching = false;
  let resumeAt = 0, visible = false, previous = 0;
  field.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hovering = true; });
  field.addEventListener('pointerleave', () => { hovering = false; });
  field.addEventListener('focusin', () => { focused = true; });
  field.addEventListener('focusout', () => { focused = false; });
  field.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    field.scrollBy({ left: e.key === 'ArrowRight' ? 84 : -84, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
  field.addEventListener('pointerdown', () => { touching = true; });
  const release = () => {
    if (!touching) return;
    touching = false;
    resumeAt = performance.now() + 3000;
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(field);

  // Carry fractional pixels separately: scrollLeft rounds them in some browsers.
  let position = field.scrollLeft;
  const frame = now => {
    const dt = previous ? Math.min(now - previous, 50) : 0;
    previous = now;
    if (drag) {
      // Keep the home anchored to its carousel slot even if the page scrolls.
      const home = drag.item.getBoundingClientRect();
      drag.ghost.style.left = `${home.left}px`;
      drag.ghost.style.top = `${home.top}px`;
      if (!drag.held) {
        const steps = Math.max(1, Math.ceil(dt / 8));
        const step = dt / steps / 1000;
        for (let i = 0; i < steps; i++) {
          drag.vx += (-240 * drag.x - 22 * drag.vx) * step;
          drag.vy += (-240 * drag.y - 22 * drag.vy) * step;
          drag.x += drag.vx * step; drag.y += drag.vy * step;
        }
        drag.ghost.style.transform = `translate3d(${drag.x}px, ${drag.y}px, 0)`;
        if (Math.hypot(drag.x, drag.y) < 0.1 && Math.hypot(drag.vx, drag.vy) < 1) {
          restore();
          resumeAt = now + 1000;
        }
      }
    }
    if (!drag && visible && !document.hidden && !reducedMotion.matches && !hovering && !focused && !touching && now >= resumeAt) {
      const length = group.getBoundingClientRect().width;
      if (length > 0) {
        position += dt * 0.024;
        position %= length;
        field.scrollLeft = position;
      }
    } else {
      position = field.scrollLeft;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
