/**
 * motion.js: the one shared motion setup for the whole site (GSAP + ScrollTrigger + Lenis).
 *
 * Design-agnostic: it only reads data hooks and CSS custom properties, and only writes state classes.
 * Never throws; every public function is safe to call before init, twice, or with missing hooks.
 *
 * WHAT INIT DOES (initMotion(), idempotent)
 *   - registers ScrollTrigger, SplitText, Flip, CustomEase and ScrollToPlugin once (all re-exported below, so
 *     every module shares one gsap instance: `import { gsap, ScrollTrigger } from './motion.js'`)
 *   - starts Lenis ONLY when the primary pointer is fine (mouse / trackpad) and motion is not reduced.
 *     Touch devices and reduced-motion visitors keep native scroll (no Lenis object exists at all).
 *   - syncs Lenis with ScrollTrigger on the GSAP ticker (lenis.on('scroll', ScrollTrigger.update),
 *     gsap.ticker.add(raf), lagSmoothing(0)); lagSmoothing is restored when Lenis is torn down
 *   - follows live changes: reduced-motion toggled in the OS, pointer type changing (devtools device mode,
 *     2-in-1) => Lenis is created or destroyed on the spot
 *   - calls refresh() after fonts, window load, and every late <img>/<video> metadata load
 *
 * HOOKS READ
 *   :root --header-h          fixed header height (any length: px, rem, calc, clamp). scrollTo() subtracts it.
 *                             Also give targets `scroll-margin-top: var(--header-h)` for native hash jumps.
 *   [data-lenis-prevent]      on any scrollable region / dialog that must scroll natively under Lenis
 *                             (lightbox, message dialog, menu panel). Lenis also auto-detects nested scrollers.
 *   Stylesheet                link vendor/lenis/lenis.css in <head> (stopped/prevent rules).
 *
 * STATE CLASSES WRITTEN (on <html>)
 *   is-reduced-motion   prefers-reduced-motion: reduce is on
 *   is-smooth-scroll    Lenis is running
 *   is-scroll-locked    one or more lockScroll() keys are held (written by lock.js, as is body.is-locked; the
 *                       module blocks scrolling itself: lenis.stop() with Lenis, inline overflow:hidden without)
 *   (Lenis itself adds `lenis lenis-smooth lenis-stopped`.)
 *
 * EVENTS (dispatched on document)
 *   motion:change   detail { reduced: boolean, smooth: boolean }   after init and after every mode change
 *   motion:refresh  detail { }                                     after ScrollTrigger.refresh() ran
 *
 * API
 *   initMotion(options?)               -> { gsap, ScrollTrigger, lenis }   options: { lerp = 0.1 }
 *   reducedMotion()                    -> boolean (live)
 *   onMotionPreferenceChange(cb)       cb(reduced:boolean); returns an unsubscribe function
 *   isSmoothScroll(), getLenis()       -> boolean / Lenis | null
 *   scrollTo(target, opts?)            target: number (absolute px) | Element | selector | "#id".
 *                                      opts: { offset = 0, immediate = false, duration, onComplete }
 *                                      Element targets stop `--header-h` px short. Returns true if accepted.
 *                                      Uses Lenis when running, native smooth scroll otherwise, instant when
 *                                      motion is reduced. Does nothing (returns false) while scroll is locked.
 *   refresh(opts?)                     debounced (~100ms) lenis.resize() + ScrollTrigger.refresh(); { now: true }
 *                                      runs immediately. Call after anything that changes page height.
 *   lockScroll(key) / unlockScroll(key)  keyed (idempotent per key) lock, re-exported from lock.js, which owns the
 *                                      registry, body.is-locked, html.is-scroll-locked and scroll:lock/unlock.
 *                                      motion.js supplies the Lenis stop/start policy. Menus, dialogs, intro use it.
 *   isScrollLocked()                   true while any key is held
 *   headerHeight()                     resolved --header-h in px
 *   gsap, ScrollTrigger, SplitText, Flip, CustomEase, ScrollToPlugin   re-exports
 */

import { gsap } from '../../vendor/gsap/index.js';
import { ScrollTrigger } from '../../vendor/gsap/ScrollTrigger.js';
import { SplitText } from '../../vendor/gsap/SplitText.js';
import { Flip } from '../../vendor/gsap/Flip.js';
import { CustomEase } from '../../vendor/gsap/CustomEase.js';
import { ScrollToPlugin } from '../../vendor/gsap/ScrollToPlugin.js';
import Lenis from '../../vendor/lenis/lenis.js';
import { lockScroll, unlockScroll, isScrollLocked, applyScrollLock, setLockHandler } from './lock.js';

export { lockScroll, unlockScroll, isScrollLocked };
export { gsap, ScrollTrigger, SplitText, Flip, CustomEase, ScrollToPlugin };

const root = document.documentElement;
const mq = (q) => { try { return matchMedia(q); } catch { return null; } };

let initialised = false;
let lenis = null;
let tick = null;
let lerp = 0.1;
let probe = null;
let refreshTimer = 0;
const prefListeners = new Set();

/* ---------- preference ---------- */

export function reducedMotion() {
  const m = mq('(prefers-reduced-motion: reduce)');
  return !!(m && m.matches);
}

let prefWatching = false;
function watchPreference() {
  if (prefWatching) return;
  prefWatching = true;
  const reduce = mq('(prefers-reduced-motion: reduce)');
  const pointer = mq('(pointer: fine)');
  const onReduce = () => {
    const r = reducedMotion();
    syncMode();
    prefListeners.forEach((cb) => { try { cb(r); } catch {} });
  };
  try { reduce?.addEventListener('change', onReduce); } catch {}
  try { pointer?.addEventListener('change', () => syncMode()); } catch {}
}

export function onMotionPreferenceChange(cb) {
  if (typeof cb !== 'function') return () => {};
  prefListeners.add(cb);
  watchPreference();
  return () => prefListeners.delete(cb);
}

const wantSmooth = () => {
  const fine = mq('(pointer: fine)');
  return !reducedMotion() && !!(fine && fine.matches);
};

/* ---------- Lenis lifecycle ---------- */

let settleBound = false;

function startLenis() {
  if (lenis) return;
  try {
    lenis = new Lenis({ autoRaf: false, lerp, smoothWheel: true, syncTouch: false, allowNestedScroll: true, anchors: false });
    lenis.on('scroll', ScrollTrigger.update);
    // Lenis quirk: a native scroll event that arrives with zero velocity (a layout shift right after a jump) sets
    // isScrolling = 'native' but never arms the timer that clears it, so html.lenis-scrolling can stay for good.
    // Once the page has been quiet for 450ms, clear that state ourselves (a 'smooth' run is left alone).
    if (!settleBound) {
      settleBound = true;
      let quiet = 0;
      window.addEventListener('scroll', () => {
        clearTimeout(quiet);
        quiet = setTimeout(() => { try { if (lenis && lenis.isScrolling === 'native') lenis.isScrolling = false; } catch {} }, 450);
      }, { passive: true });
    }
    tick = (time) => { try { lenis && lenis.raf(time * 1000); } catch {} };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    if (isScrollLocked()) lenis.stop();
  } catch {
    lenis = null;
    tick = null;
  }
}

function stopLenis() {
  if (!lenis) return;
  try { if (tick) gsap.ticker.remove(tick); } catch {}
  try { lenis.destroy(); } catch {}
  try { gsap.ticker.lagSmoothing(500, 33); } catch {}
  lenis = null;
  tick = null;
}

function syncMode() {
  try {
    const reduced = reducedMotion();
    const before = !!lenis;
    if (wantSmooth()) startLenis(); else stopLenis();
    root.classList.toggle('is-reduced-motion', reduced);
    root.classList.toggle('is-smooth-scroll', !!lenis);
    applyScrollLock();
    if (before !== !!lenis) refresh();
    document.dispatchEvent(new CustomEvent('motion:change', { detail: { reduced, smooth: !!lenis } }));
  } catch {}
}

export const getLenis = () => lenis;
export const isSmoothScroll = () => !!lenis;

/* ---------- scroll lock ---------- */

// The keyed lock registry lives in lock.js (shared with dialogs on pages that never load GSAP). Here is the
// policy: while a key is held and Lenis runs, Lenis is stopped; otherwise lock.js falls back to overflow:hidden.
setLockHandler((on) => {
  if (!lenis) return false;
  try { if (on) lenis.stop(); else lenis.start(); } catch {}
  return true;
});

/* ---------- header offset + scrollTo ---------- */

export function headerHeight() {
  try {
    if (!probe) {
      if (!document.body) return 0;
      probe = document.createElement('div');
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'position:absolute;left:0;top:0;width:0;height:var(--header-h,0px);visibility:hidden;pointer-events:none;';
      document.body.append(probe);
    }
    return probe.offsetHeight || 0;
  } catch { return 0; }
}

function resolveTop(target) {
  if (typeof target === 'number') return Number.isFinite(target) ? target : null;
  let el = target;
  if (typeof target === 'string') {
    try { el = target.startsWith('#') ? document.getElementById(decodeURIComponent(target.slice(1))) : document.querySelector(target); } catch { el = null; }
  }
  if (!(el instanceof Element)) return null;
  return el.getBoundingClientRect().top + window.scrollY - headerHeight();
}

export function scrollTo(target, { offset = 0, immediate = false, duration, onComplete } = {}) {
  try {
    const raw = resolveTop(target);
    if (raw === null) return false;
    if (isScrollLocked()) return false;
    const max = Math.max(0, root.scrollHeight - window.innerHeight);
    const top = Math.round(Math.min(Math.max(0, raw + offset), max));
    const instant = immediate || reducedMotion();

    if (lenis) {
      lenis.scrollTo(top, { immediate: instant, duration, onComplete: () => { try { onComplete?.(); } catch {} } });
      return true;
    }
    window.scrollTo({ top, behavior: instant ? 'auto' : 'smooth' });
    if (typeof onComplete === 'function') {
      let done = false;
      const finish = () => { if (done) return; done = true; window.removeEventListener('scrollend', finish); try { onComplete(); } catch {} };
      window.addEventListener('scrollend', finish, { once: true });
      setTimeout(finish, instant ? 50 : 1200);
    }
    return true;
  } catch { return false; }
}

/* ---------- refresh ---------- */

function doRefresh() {
  refreshTimer = 0;
  try { lenis?.resize(); } catch {}
  try { ScrollTrigger.refresh(); } catch {}
  document.dispatchEvent(new CustomEvent('motion:refresh'));
}

export function refresh({ now = false } = {}) {
  try {
    clearTimeout(refreshTimer);
    if (now) doRefresh(); else refreshTimer = setTimeout(doRefresh, 100);
  } catch {}
}

/* ---------- init ---------- */

export function initMotion(options = {}) {
  try {
    if (!initialised) {
      initialised = true;
      if (Number.isFinite(options.lerp)) lerp = options.lerp;
      try { gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase, ScrollToPlugin); } catch {}
      try { ScrollTrigger.config({ ignoreMobileResize: true }); } catch {}
      watchPreference();
      syncMode();

      try { document.fonts?.ready?.then(() => refresh()); } catch {}
      if (document.readyState === 'complete') refresh(); else addEventListener('load', () => refresh(), { once: true });
      // load / loadedmetadata do not bubble: capture them to catch every late image and video.
      const late = (e) => { if (e.target instanceof HTMLImageElement || e.target instanceof HTMLVideoElement) refresh(); };
      document.addEventListener('load', late, true);
      document.addEventListener('loadedmetadata', late, true);
    }
  } catch {}
  return { gsap, ScrollTrigger, lenis };
}
