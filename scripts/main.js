/**
 * main.js: the single entry module of the site. `<script type="module" src="/scripts/main.js">`.
 *
 * It only wires the behaviour modules in scripts/core/ together. It draws nothing and exports nothing: the design
 * layer talks to the page through hooks, state classes and events (each module's header comment lists them).
 *
 * INIT ORDER (every step is isolated in try/catch: one failure is logged and never stops the next step)
 *    1 theme       initTheme()       flash-free bootstrap is inline in <head>; this syncs toggles + theme-color
 *    2 intro       initIntro()       decides whether the loader plays; owns is-intro / is-ready and the failsafe
 *    3 motion      initMotion()      GSAP + ScrollTrigger + Lenis (dynamic import: a missing vendor file cannot
 *                                    take the other modules down with it)
 *    4 nav         initNav()         scroll-spy, header hide/show, phone menu, anchor routing (needs motion)
 *    5 toast       initToast()       live region; showToast() works for every later module
 *    6 page        initPage()        [data-year], [data-copy]
 *    7 galleries   initGalleries()   screenshot carousels (step, dots, count)
 *    8 viewer      initViewer()      screenshot / certificate lightbox
 *    9 video       initVideo()       promo video window
 *   10 contact     initContact()     message dialog + FormSubmit
 *   11 stats       initStats()       visits and likes
 *   12 activity    initActivity()    GitHub calendar (+ mini grid)
 *
 * After the steps, motion.refresh() runs once fonts, window load and the first batch of images have settled (and
 * again after the GitHub calendar renders and the intro ends, the two things that change page height or reveal
 * content late). motion.js also refreshes by itself on every late <img> / <video> load.
 *
 * THE ONE EVENT THE DESIGN MAY RELY ON
 *   "site:ready"  on document, once, after all 12 steps ran (not after the network settled).
 *                 detail { ok: string[], failed: string[], ms: number }  (names are the step names above)
 *                 Also sets html[data-site-ready="true"] so late listeners can check synchronously.
 *   Module events (intro:done, theme:change, nav:change, gallery:change, viewer:*, video:*, activity:ready,
 *   message:*, stats:update, motion:refresh, scroll:lock/unlock ...) are documented in their own files.
 *
 * NOTE FOR A DESIGN LOADER: intro:start is dispatched synchronously inside step 2. Register the listener at import
 * time of a module this file imports (static imports run before this body), or check introState() === 'playing'.
 * To add design code, import it below the core imports and call it from `designSteps`.
 */

import { initTheme } from './core/theme.js';
import { initIntro } from './core/intro.js';
import { initToast } from './core/toast.js';
import { initPage } from './core/page.js';
import { initGalleries } from './core/gallery.js';
import { initViewer } from './core/viewer.js';
import { initVideo } from './core/video.js';
import { initContact } from './core/contact.js';
import { initStats } from './core/stats.js';
import { initActivity } from './core/activity.js';

const t0 = performance.now();
const ok = [];
const failed = [];
let motion = null; // the motion.js module, once loaded

/** Runs one init step; never throws. Each core init already guards itself, this also covers import failures. */
async function step(name, fn) {
  try {
    await fn();
    ok.push(name);
  } catch (err) {
    failed.push(name);
    console.warn(`[site] ${name} failed to start:`, err);
  }
}

/** Design-layer steps, appended after the core steps (empty in the skeleton). */
import { designSteps } from './design/index.js';

async function boot() {
  // Start fetching the GSAP/Lenis bundle now, in parallel with steps 1-2.
  const motionImport = import('./core/motion.js').catch((err) => { console.warn('[site] motion.js not available:', err); return null; });

  await step('theme', () => initTheme());
  await step('intro', () => initIntro());
  await step('motion', async () => {
    motion = await motionImport;
    if (!motion) throw new Error('motion.js did not load');
    motion.initMotion();
  });
  await step('nav', async () => {
    if (!motion) throw new Error('needs motion.js');
    const { initNav } = await import('./core/nav.js');
    initNav();
  });
  await step('toast', () => initToast());
  await step('page', () => initPage());
  await step('galleries', () => initGalleries());
  await step('viewer', () => initViewer());
  await step('video', () => initVideo());
  await step('contact', () => initContact());
  await step('stats', () => initStats());
  await step('activity', () => initActivity());
  for (const [name, fn] of designSteps) await step(name, fn);

  settle();

  const root = document.documentElement;
  root.setAttribute('data-site-ready', 'true');
  try {
    document.dispatchEvent(new CustomEvent('site:ready', { detail: { ok, failed, ms: Math.round(performance.now() - t0) } }));
  } catch {}
}

/** motion.refresh() once fonts + load + first images are done, and after late layout changes. */
function settle() {
  const refresh = () => { try { motion && motion.refresh(); } catch {} };
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => addEventListener('load', r, { once: true }));
  const fonts = (document.fonts && document.fonts.ready) || Promise.resolve();
  const images = Promise.all([...document.images].filter((img) => !img.complete && img.loading !== 'lazy').map((img) => new Promise((r) => {
    img.addEventListener('load', r, { once: true });
    img.addEventListener('error', r, { once: true });
  })));
  Promise.all([loaded, fonts, images]).then(refresh, refresh);
  document.addEventListener('activity:ready', refresh);
  document.addEventListener('intro:done', refresh);
}

boot();
