/*
 * modal.js: tiny shared helpers for the B2 behaviour modules (viewer, video, gallery, activity).
 * No DOM hooks of its own, no styling.
 *
 * SCROLL LOCK: lockScroll(key) / unlockScroll(key) are re-exported from lock.js (keyed, one registry shared with
 *   motion.js, nav.js and contact.js). body.is-locked, html.is-scroll-locked and the scroll:lock / scroll:unlock
 *   events are written there; motion.js stops/starts Lenis from the same lock.
 */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const reducedMotion = () => {
  try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
};

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Dispatches a bubbling CustomEvent; never throws. */
export function emit(target, name, detail) {
  try { (target || document).dispatchEvent(new CustomEvent(name, { detail, bubbles: true })); } catch {}
}

// Scroll locking is owned by lock.js (the one registry; motion.js adds the Lenis policy). Re-exported here so the
// B2 modules keep one import. Pass a distinct key per dialog ('viewer', 'video', ...).
export { lockScroll, unlockScroll } from './lock.js';

/**
 * Closes a dialog after an optional transition hook finishes (bounded by `max` ms so a hook that never
 * resolves cannot trap the visitor). The dialog's own 'close' listener does the cleanup.
 */
export async function closeWithHook(dialog, hook, ctx, max = 1200) {
  if (!dialog.open) return;
  dialog.classList.add('is-closing');
  if (hook) {
    try { await Promise.race([Promise.resolve(hook({ ...ctx, phase: 'close', reduced: reducedMotion() })), wait(max)]); } catch {}
  }
  try { dialog.close(); } catch {}
}

/** Returns focus to the element that opened a dialog, if it is still on the page. */
export function returnFocus(el) {
  try { if (el && el.isConnected && typeof el.focus === 'function') el.focus({ preventScroll: true }); } catch {}
}
