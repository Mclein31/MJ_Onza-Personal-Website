/**
 * lock.js: the single scroll-lock registry. Tiny, no GSAP, no Lenis, no DOM hooks, safe to import from any page.
 *
 * WHO OWNS WHAT
 *   lock.js    owns the keyed lock STATE and the lock CLASSES/EVENTS below (so a page that never loads GSAP,
 *              and the dialogs themselves, share one lock).
 *   motion.js  owns the POLICY: it registers a handler here that stops/starts Lenis, and re-exports
 *              lockScroll / unlockScroll / isScrollLocked so the rest of the site can keep importing them from
 *              './motion.js'. scrollTo() refuses to run while a key is held.
 *   Without a handler (no Lenis running, or motion.js never loaded) lock.js blocks scrolling itself with an
 *   inline `overflow: hidden` on <html>.
 *
 * KEYS
 *   Every holder uses its own key: 'menu' (nav.js), 'viewer', 'video', 'message' (contact.js), 'intro' ...
 *   Keys are idempotent: locking a key twice is one lock; unlocking releases it. The page is locked while at
 *   least one key is held.
 *
 * WRITES
 *   body.is-locked        while locked (the long-standing hook name; any CSS may use it)
 *   html.is-scroll-locked while locked (same moment, same meaning, on <html>)
 *
 * EVENTS (document, CustomEvent, bubbles)
 *   scroll:lock     first key taken             detail { key }
 *   scroll:unlock   last key released           detail { key }
 *   (modal:open / modal:close are separate: they describe a dialog, not the lock. contact.js emits them.)
 *
 * API
 *   lockScroll(key = 'default'), unlockScroll(key = 'default'), isScrollLocked(), lockKeys()
 *   setLockHandler(fn)   fn(locked:boolean) -> true if it blocked/unblocked scrolling itself (Lenis); a falsy
 *                        return means "not handled", and lock.js applies the native overflow fallback.
 */

const root = document.documentElement;
const keys = new Set();
let handler = null;
let savedOverflow = null;
let wasLocked = false;

function emit(name, detail) {
  try { document.dispatchEvent(new CustomEvent(name, { detail, bubbles: true })); } catch {}
}

/** Re-applies the current lock state. Called on every change and by motion.js when Lenis starts or stops. */
export function applyScrollLock() {
  try {
    const on = keys.size > 0;
    let handled = false;
    if (handler) { try { handled = !!handler(on); } catch { handled = false; } }
    if (on && !handled) {
      if (savedOverflow === null) savedOverflow = root.style.overflow;
      root.style.overflow = 'hidden';
    } else if (savedOverflow !== null) {
      root.style.overflow = savedOverflow;
      savedOverflow = null;
    }
    root.classList.toggle('is-scroll-locked', on);
    if (document.body) document.body.classList.toggle('is-locked', on);
  } catch {}
}

export function setLockHandler(fn) {
  handler = typeof fn === 'function' ? fn : null;
  applyScrollLock();
}

export function lockScroll(key = 'default') {
  try {
    const before = keys.size;
    keys.add(key);
    applyScrollLock();
    if (before === 0 && !wasLocked) { wasLocked = true; emit('scroll:lock', { key }); }
  } catch {}
}

export function unlockScroll(key = 'default') {
  try {
    if (!keys.delete(key)) return;
    applyScrollLock();
    if (keys.size === 0 && wasLocked) { wasLocked = false; emit('scroll:unlock', { key }); }
  } catch {}
}

export const isScrollLocked = () => keys.size > 0;
export const lockKeys = () => [...keys];
