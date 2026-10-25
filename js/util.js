// Shared helpers
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
export const finePointer = matchMedia('(pointer: fine)');

// Storage that never throws (private mode, blocked site data)
export const store = {
  get(key, area = localStorage) { try { return area.getItem(key); } catch { return null; } },
  set(key, val, area = localStorage) { try { area.setItem(key, val); } catch { /* ignore */ } },
};

// Progress (0 → 1) of an element moving through the viewport
export function viewProgress(el, start = 1, end = 0) {
  const r = el.getBoundingClientRect();
  const vh = innerHeight;
  const from = vh * start;
  const to = vh * end - r.height;
  return clamp((from - r.top) / (from - to), 0, 1);
}

let toastTimer;
export function toast(text) {
  const el = $('[data-toast]');
  if (!el) return;
  $('[data-toast-text]', el).textContent = text;
  el.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-show'), 2200);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

export function arrowKeys(track, current, go) {
  track.tabIndex = 0;
  track.addEventListener('keydown', (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (!step) return;
    e.preventDefault();
    go(current() + step);
  });
}
