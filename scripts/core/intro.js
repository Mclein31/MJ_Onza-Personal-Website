/**
 * intro.js: the once-per-session intro GATE. It decides whether the intro plays, owns the html state classes,
 * the Skip control, the hard failsafe and the `intro:done` event. It does NOT draw the intro: the design's
 * loader animation listens for `intro:start`, plays, and calls completeIntro() (or sets data-intro-duration).
 * Standalone on purpose (no GSAP import), so a broken vendor file can never keep the page hidden.
 *
 * Never throws; with no [data-intro] element on the page it resolves immediately and writes nothing to storage.
 *
 * HOOKS READ
 *   [data-intro]            the loader / overlay. Optional data-intro-duration="1600" (ms): auto-complete after
 *                           that long, for loaders with a fixed timeline that do not call completeIntro().
 *   [data-intro-skip]       any control(s) inside or outside the loader; click = skip. Escape also skips.
 *   sessionStorage "v5-intro"   "1" once the intro has finished (any reason except repeat/reduced/noop).
 *                           Storage access is wrapped; when blocked an in-memory flag is used instead.
 *
 * STATE CLASSES (on <html>)
 *   is-intro    the intro is playing: hide/offset hero content under this class
 *   is-ready    the intro is over (or never played): content is revealed. Set exactly when is-intro is removed.
 *
 * EVENTS (dispatched on document)
 *   intro:start   detail { }                       the intro decided to play (not fired for repeat/reduced)
 *   intro:done    detail { reason, duration }      reason: 'complete' | 'skip' | 'failsafe' | 'repeat' |
 *                                                  'reduced' | 'noop'; duration in ms since init. Fired once.
 *                 A running animation should jump to its end (or kill itself) when reason !== 'complete'.
 *
 * FAILSAFE (content is never hidden longer than 2.5s)
 *   JS:  a timer ends the intro at 2500ms after navigation start (performance.now()), never earlier than
 *        400ms after init, even if the loader animation never calls completeIntro().
 *   CSS: if JS fails before this module runs (or mid-way), a timed CSS animation must reveal everything at
 *        2.6s, and no-JS must never hide anything. Put this in the page <head> (critical CSS):
 *
 *     <script>               (sets is-intro before first paint, same decision as initIntro())
 *       (function(){var d=document.documentElement,p=true;
 *       try{p=sessionStorage.getItem('v5-intro')!=='1'}catch(e){}
 *       try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)p=false}catch(e){}
 *       d.classList.add(p?'is-intro':'is-ready')})();
 *     </script>
 *     <style>
 *       html.is-intro [data-intro]      { animation: intro-leave   1ms linear 2.6s forwards }
 *       html.is-intro [data-intro-hold] { animation: intro-release 1ms linear 2.6s forwards }
 *       @keyframes intro-leave   { 1%, 100% { opacity: 0; visibility: hidden; pointer-events: none } }
 *       @keyframes intro-release { 1%, 100% { opacity: 1; transform: none; visibility: visible } }
 *     </style>
 *
 *   (The 1%, 100% stops are deliberate: a 1ms animation ending on `to` can stall at progress 0.99999 and leave
 *   `visibility` un-flipped.) Mark every element the intro hides with data-intro-hold (or use the same keyframes on it). The class
 *   `is-intro` is only ever added by script, so with JS disabled nothing is hidden. Because both rules are
 *   scoped to `html.is-intro`, removing the class (is-ready) hands control back to normal styles and inline
 *   GSAP styles at once; no stale forwards-filled animation remains.
 *
 * API
 *   initIntro(options?)    -> Promise<{ reason }> resolved with intro:done.  options: { maxMs = 2500, minPlayMs = 400 }
 *   completeIntro()        the loader animation calls this when its timeline ends (reason 'complete')
 *   skipIntro()            same as pressing Skip (reason 'skip')
 *   whenIntroDone()        -> Promise<{ reason }>, safe to call before or after init
 *   introState()           -> 'idle' | 'playing' | 'done'
 */

const KEY = 'v5-intro';
const root = document.documentElement;

let state = 'idle';
let result = null;
let startedAt = 0;
let timers = [];
let memorySeen = false;
let resolveDone;
const donePromise = new Promise((r) => { resolveDone = r; });
let initPromise = null;

const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const seen = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return memorySeen; } };
const markSeen = () => { memorySeen = true; try { sessionStorage.setItem(KEY, '1'); } catch {} };

export const introState = () => state;
export const whenIntroDone = () => donePromise;

function finish(reason, remember) {
  if (state === 'done') return;
  state = 'done';
  timers.forEach(clearTimeout);
  timers = [];
  document.removeEventListener('click', onClick, true);
  document.removeEventListener('keydown', onKey, true);
  try { if (remember) markSeen(); } catch {}
  root.classList.remove('is-intro');
  root.classList.add('is-ready');
  result = { reason, duration: Math.round(performance.now() - startedAt) };
  try { document.dispatchEvent(new CustomEvent('intro:done', { detail: result })); } catch {}
  resolveDone({ reason });
}

function onClick(e) {
  const el = e.target instanceof Element ? e.target.closest('[data-intro-skip]') : null;
  if (el) { e.preventDefault(); skipIntro(); }
}
function onKey(e) { if (e.key === 'Escape') skipIntro(); }

export function completeIntro() { if (state === 'playing') finish('complete', true); }
export function skipIntro() { if (state === 'playing') finish('skip', true); }

export function initIntro({ maxMs = 2500, minPlayMs = 400 } = {}) {
  if (initPromise) return initPromise;
  initPromise = donePromise;
  try {
    startedAt = performance.now();
    const el = document.querySelector('[data-intro]');

    if (!el) { finish('noop', false); return initPromise; }
    if (reduced()) { finish('reduced', false); return initPromise; }
    if (seen()) { finish('repeat', false); return initPromise; }

    state = 'playing';
    root.classList.remove('is-ready');
    root.classList.add('is-intro');

    // Hard failsafe, measured from navigation start so a late module cannot extend the wait.
    const wait = Math.max(minPlayMs, maxMs - startedAt);
    timers.push(setTimeout(() => finish('failsafe', true), wait));

    const dur = Number(el.getAttribute('data-intro-duration'));
    if (Number.isFinite(dur) && dur > 0) timers.push(setTimeout(() => finish('complete', true), Math.min(dur, wait)));

    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    document.dispatchEvent(new CustomEvent('intro:start'));
  } catch {
    finish('failsafe', false);
  }
  return initPromise;
}
