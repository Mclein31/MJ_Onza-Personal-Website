/**
 * toast.js: announce short messages through a polite live region.
 *
 * Behaviour only. No visual styling: the designers style `.is-visible` / `[data-tone]` on the region.
 *
 * HOOKS READ
 *   [data-toast]           the live region (give it role="status" aria-live="polite"; first match is used)
 *   [data-toast-text]      optional child that receives the text; if absent the region itself does
 *   data-duration="2600"   optional default auto-hide time in ms on the region
 *
 * WRITES (on the region)
 *   class  is-visible      while the message is showing
 *   attr   data-tone       "info" (default) | "success" | "error"
 *   attr   data-state      "visible" | "hidden"
 *   text   the message (cleared a moment after hiding so screen readers do not re-read it)
 *
 * EVENTS
 *   listens  document "toast:show"   detail: { message: string, tone?: string, duration?: number }
 *   emits    document "toast:shown"  detail: { message, tone }   (after the text is placed)
 *   emits    document "toast:hidden" detail: { message, tone }
 *
 * API
 *   initToast()                      attach the "toast:show" listener (no-op without a region)
 *   showToast(message, { tone, duration })   usable by any module, with or without initToast()
 *   hideToast()
 *
 * Reduced motion: nothing here animates. Timing is unchanged; the CSS decides how the region appears.
 */

const DEFAULT_DURATION = 2600;
const ERROR_DURATION = 5200;
const CLEAR_DELAY = 400; // keep the text while the hide transition plays

let hideTimer = 0;
let clearTimer = 0;
let raf = 0;
let current = null;

const region = () => {
  try { return document.querySelector('[data-toast]'); } catch { return null; }
};
const textNode = (el) => el.querySelector('[data-toast-text]') || el;

export function hideToast() {
  try {
    clearTimeout(hideTimer);
    const el = region();
    if (!el || !current) return;
    const detail = current;
    current = null;
    el.classList.remove('is-visible');
    el.setAttribute('data-state', 'hidden');
    clearTimeout(clearTimer);
    clearTimer = setTimeout(() => { if (!current) textNode(el).textContent = ''; }, CLEAR_DELAY);
    document.dispatchEvent(new CustomEvent('toast:hidden', { detail }));
  } catch {}
}

export function showToast(message, options = {}) {
  try {
    const el = region();
    const text = String(message ?? '').trim();
    if (!el || !text) return false;
    const tone = options.tone || 'info';
    const fromAttr = Number(el.getAttribute('data-duration'));
    const duration = Number(options.duration) > 0
      ? Number(options.duration)
      : tone === 'error' ? ERROR_DURATION : (fromAttr > 0 ? fromAttr : DEFAULT_DURATION);

    clearTimeout(hideTimer);
    clearTimeout(clearTimer);
    cancelAnimationFrame(raf);

    const node = textNode(el);
    // Empty first, fill on the next frame: a live region only announces a *change*, so an
    // identical repeated message is still read out.
    node.textContent = '';
    el.setAttribute('data-tone', tone);
    current = { message: text, tone };
    raf = requestAnimationFrame(() => {
      node.textContent = text;
      el.classList.add('is-visible');
      el.setAttribute('data-state', 'visible');
      document.dispatchEvent(new CustomEvent('toast:shown', { detail: current }));
    });
    hideTimer = setTimeout(hideToast, duration);
    return true;
  } catch {
    return false;
  }
}

export function initToast() {
  try {
    const el = region();
    if (!el) return;
    if (!el.hasAttribute('data-state')) el.setAttribute('data-state', 'hidden');
    document.addEventListener('toast:show', (e) => {
      const d = (e && e.detail) || {};
      showToast(d.message, d);
    });
  } catch {}
}
