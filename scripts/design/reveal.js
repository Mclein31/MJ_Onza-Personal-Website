/*
 * reveal.js: page-wide reveal helpers for every section (Instrument redesign v5). Owner: W1 foundation.
 *
 * ATTRIBUTES (add them to markup; CSS for the hidden/shown states lives in styles/base.css)
 *   data-reveal="rise"     a line or block rises 24px out of a mask once (~480ms ease-out)
 *   data-reveal="draw"     a hairline draws scaleX 0 -> 1 (pair with .rule)
 *   data-reveal="fade"     opacity only
 *   data-reveal-stagger    on a parent: its direct children reveal ~60ms apart when the parent enters. Children
 *                          without their own data-reveal get the parent's value (data-reveal-stagger="fade"),
 *                          or "rise" when it is empty.
 *   data-tick              on a number: odometer count-up to its own text value once it enters (Geist Mono
 *                          tabular). Optional data-tick-from="2000". Keeps prefix/suffix, commas, decimals,
 *                          leading zeros. Stops at once if another module rewrites the text.
 *   data-scan              on a .plate: the media inside wipes in top to bottom with a 2px orange line on the edge
 *   data-reveal-delay="60"   optional extra delay in ms on any of the above (capped at 60)
 *
 * GATE
 *   html.has-reveal is set by the inline <head> script (not under reduced motion), so nothing flashes; this module
 *   adds html.reveal-live when it takes over (a CSS failsafe shows everything at 4s if it never does). Without JS,
 *   or with prefers-reduced-motion: reduce, everything is visible and no number ticks.
 *   Elements that are already in view wait for the intro to finish (intro:done) so they play after the loader.
 *
 * TIMING (QA-C)
 *   Touch (coarse pointer): starts at the very edge of the screen (98%), and the rise is opacity + 14px only (no clip mask).
 *   A fast scroll shows anything in the upper half of the screen, or above it, at once with no transition.
 *   An element starts when ~12% of the viewport height of it is on screen and finishes within ~660ms (480ms motion plus at
 *   most 180ms of stagger and delay). Anything already ABOVE the viewport (anchor jump, reload at a hash, fast scroll) is shown instantly
 *   with no transition, so nothing stays hidden. While the page is being scrolled very fast, elements wait until it
 *   slows down instead of flashing past. data-scan plates wait (max 700ms) for their lazy image to decode first.
 *   Elements are watched by an IntersectionObserver AND a rect sweep (scroll, resize, 250ms interval while any wait),
 *   because the observer alone misses elements that are clipped to zero area or skipped by a jump.
 *
 * API: init(), and reveal(el) / observe(root) for markup added later (e.g. by a gallery).
 * Must never throw.
 */
import { whenIntroDone } from '../core/intro.js';

const root = document.documentElement;
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const STAGGER = 45;
const MAX_STAGGER = 5;           // last child waits 225ms at most
const MAX_DELAY = 60;            // data-reveal-delay is capped, so any reveal is over ~660ms after it starts
const LINE = 0.88;               // an element starts once its top is above 88% of the viewport (12% in)
const LINE_TOUCH = 0.90;         // touch: trigger 10% into the viewport so the reveal is visible as you scroll
const coarse = () => { try { return matchMedia('(pointer: coarse)').matches; } catch { return false; } };
const FAST = 2.5;                // viewport heights per second: faster than this, reveals wait for the scroll to settle

let io = null;
let warm = null;
let ready = false;          // intro over: entering elements may play
let timer = 0;
let raf = 0;
let vel = 0;
let lastY = 0;
let lastT = 0;
const waiting = new Set();  // observed, not yet revealed (elements and stagger parents)
const seen = new WeakSet();

/* ---------- number ticks ---------- */
const NUM = /-?\d[\d,]*(?:\.\d+)?/;

function tick(el) {
  try {
    const text = el.textContent;
    const m = text && text.match(NUM);
    if (!m) return;
    const raw = m[0];
    const target = Number(raw.replace(/,/g, ''));
    if (!Number.isFinite(target)) return;
    const from = Number(el.getAttribute('data-tick-from')) || 0;
    if (from === target) return;
    const decimals = (raw.split('.')[1] || '').length;
    const commas = raw.includes(',');
    const pad = /^-?0\d/.test(raw) ? raw.replace(/^-/, '').split('.')[0].length : 0;
    const before = text.slice(0, m.index);
    const after = text.slice(m.index + raw.length);
    const fmt = (v) => {
      let s = Math.abs(v).toFixed(decimals);
      if (pad) s = s.padStart(pad + (decimals ? decimals + 1 : 0), '0');
      if (commas) { const [i, d] = s.split('.'); s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? `.${d}` : ''); }
      return before + (v < 0 ? '-' : '') + s + after;
    };
    const dur = Math.min(900, 450 + Math.log10(Math.abs(target - from) + 1) * 130);
    const t0 = performance.now() + (Number(el.style.getPropertyValue('--d').replace('ms', '')) || 0);
    let last = fmt(from);
    el.textContent = last;
    const frame = (now) => {
      if (el.textContent !== last) return;                 // someone else wrote a new value: let it be
      const p = Math.min(1, Math.max(0, (now - t0) / dur));
      const e = 1 - Math.pow(1 - p, 3);
      last = p >= 1 ? text : fmt(from + (target - from) * e);
      if (decimals === 0 && p < 1) last = fmt(Math.round(from + (target - from) * e));
      el.textContent = last;
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  } catch {}
}

/* ---------- scan wipes ---------- */
function scan(el) {
  try {
    const media = el.querySelector('img, video, canvas');
    let line = el.querySelector(':scope > .scan-line');
    if (!line) {
      line = document.createElement('span');
      line.className = 'scan-line';
      line.setAttribute('aria-hidden', 'true');
      el.append(line);
    }
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const box = el.getBoundingClientRect();
    const r = media ? media.getBoundingClientRect() : box;
    line.style.left = `${r.left - box.left}px`;
    line.style.width = `${r.width}px`;
    line.style.top = `${r.top - box.top}px`;
    const delay = Number(el.style.getPropertyValue('--d').replace('ms', '')) || 0;
    if (line.animate) {
      line.animate(
        [
          { transform: 'translateY(0)', opacity: 1 },
          { transform: `translateY(${Math.max(0, r.height - 2)}px)`, opacity: 1, offset: 0.92 },
          { transform: `translateY(${Math.max(0, r.height - 2)}px)`, opacity: 0 },
        ],
        { duration: 480, delay, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' },
      );
    }
  } catch {}
}

/* ---------- reveal one element ---------- */
function delayOf(el) {
  const d = Number(el.getAttribute('data-reveal-delay'));
  return Number.isFinite(d) && d > 0 ? Math.min(d, MAX_DELAY) : 0;
}

function release(el) {
  waiting.delete(el);
  if (io) io.unobserve(el);
  if (!waiting.size && timer) { clearInterval(timer); timer = 0; }
}

/** Wait (max 700ms) for a plate's lazy image so the wipe never plays over an empty mount. */
function mediaReady(el) {
  const img = el.querySelector('img');
  if (!img || (img.complete && img.naturalWidth)) return Promise.resolve();
  try { img.loading = 'eager'; } catch {}
  const decode = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
  return Promise.race([decode, new Promise((r) => setTimeout(r, 700))]);
}

function show(el) {
  const go = () => {
    if (el.hasAttribute('data-scan')) scan(el);
    el.classList.add('is-in');
    if (el.hasAttribute('data-tick')) tick(el);
    if (el.getAttribute('data-reveal') === 'rise') {
      const d = Number(el.style.getPropertyValue('--d').replace('ms', '')) || 0;
      setTimeout(() => el.classList.add('is-done'), d + 520);
    }
  };
  if (el.hasAttribute('data-scan')) mediaReady(el).then(go); else go();
}

function play(el) {
  if (seen.has(el)) return;
  seen.add(el);
  release(el);
  try {
    const extra = delayOf(el);
    if (el.hasAttribute('data-reveal-stagger')) {
      const fallback = el.getAttribute('data-reveal-stagger') || 'rise';
      [...el.children].forEach((child, i) => {
        if (!child.hasAttribute('data-reveal') && !child.hasAttribute('data-tick') && !child.hasAttribute('data-scan')) {
          child.setAttribute('data-reveal', fallback);
        }
        child.style.setProperty('--d', `${extra + Math.min(i, MAX_STAGGER) * STAGGER}ms`);
        release(child);
        seen.add(child);
        show(child);
      });
      if (el.hasAttribute('data-reveal')) { el.style.setProperty('--d', `${extra}ms`); show(el); }
      return;
    }
    if (extra && !el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${extra}ms`);
    show(el);
  } catch {}
}

/** Show at once, no transition (the element is already above the viewport, or was skipped by a jump). */
function instant(el) {
  if (seen.has(el)) { release(el); return; }
  seen.add(el);
  release(el);
  try {
    const all = [el];
    if (el.hasAttribute('data-reveal-stagger')) {
      const fallback = el.getAttribute('data-reveal-stagger') || 'rise';
      for (const child of el.children) {
        if (!child.hasAttribute('data-reveal') && !child.hasAttribute('data-tick') && !child.hasAttribute('data-scan')) {
          child.setAttribute('data-reveal', fallback);
        }
        release(child);
        seen.add(child);
        all.push(child);
      }
    }
    for (const t of all) t.classList.add('is-instant', 'is-in', 'is-done');
    requestAnimationFrame(() => requestAnimationFrame(() => all.forEach((t) => t.classList.remove('is-instant'))));
  } catch {}
}

/* ---------- when does an element play? ---------- */
function sample() {
  const now = performance.now();
  const y = window.scrollY;
  const dt = now - lastT;
  if (dt > 0 && lastT) vel = 0.5 * vel + 0.5 * (Math.abs(y - lastY) / dt) * 1000;
  if (dt > 120) vel = 0;               // no scroll events for a while: at rest
  lastY = y;
  lastT = now;
}

function check() {
  raf = 0;
  if (!waiting.size) return;
  try {
    sample();
    const vh = window.innerHeight || 800;
    const vw = window.innerWidth || 1200;
    const fast = vel > vh * FAST;
    const line = coarse() ? LINE_TOUCH : LINE;
    for (const el of [...waiting]) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;                       // not rendered (hidden panel)
      if (r.right <= 0 || r.left >= vw) continue;                           // off to the side (carousel): the gallery reveals it
      if (r.bottom <= 0) { instant(el); continue; }                         // above the viewport: never leave it hidden
      const lift = el.getAttribute('data-reveal') === 'rise' ? Math.min(r.height, coarse() ? 18 : 24) : 0;   // rise starts a little low
      if (r.top - lift < vh * line) {
        if (!ready) continue;
        // A fast scroll never leaves content blank: what is in the upper half of the screen (or above it) shows at once,
        // with no transition. Only the lower half waits for the scroll to slow down, then plays normally.
        if (fast) { if (r.top < vh * 0.5) instant(el); }
        else play(el);
      }
    }
  } catch {}
}

function schedule() { if (!raf && waiting.size) raf = requestAnimationFrame(check); }

function onEnter(entries) {
  if (entries.some((e) => e.isIntersecting)) schedule();
}

const SELECTOR = '[data-reveal], [data-reveal-stagger], [data-tick], [data-scan]';

/** Observe every reveal element under `scope` (call again for markup added later). */
export function observe(scope = document) {
  try {
    const els = [...scope.querySelectorAll(SELECTOR)];
    if (scope instanceof Element && scope.matches(SELECTOR)) els.unshift(scope);
    for (const el of els) {
      if (seen.has(el)) continue;
      if (el.parentElement && el.parentElement.closest('[data-reveal-stagger]') && el.parentElement.hasAttribute('data-reveal-stagger')) continue;
      if (!io) { el.classList.add('is-in'); continue; }
      waiting.add(el);
      io.observe(el);
      if (warm && el.hasAttribute('data-scan')) { const img = el.querySelector('img'); if (img) warm.observe(img); }
    }
    // Every plate's image (Recognition and Training thumbnails too) starts loading ~150% of a screen before it arrives.
    if (warm) for (const img of scope.querySelectorAll('.plate img')) warm.observe(img);
    if (waiting.size && !timer) timer = setInterval(schedule, 250);
    schedule();
  } catch {}
}

/** Reveal an element right away (e.g. a slide made visible by a gallery). */
export function reveal(el) { try { if (el) play(el); } catch {} }

export function init() {
  try {
    if (reduced() || !('IntersectionObserver' in window)) {
      root.classList.remove('has-reveal');
      document.querySelectorAll(SELECTOR).forEach((el) => el.classList.add('is-in', 'is-done'));
      return;
    }
    root.classList.add('has-reveal');
    // The observer is only a wake-up call (cheap while idle); check() decides, from real rects.
    io = new IntersectionObserver(onEnter, { rootMargin: coarse() ? '0px' : '0px 0px -12% 0px', threshold: [0, 0.01] });
    // Start fetching a plate's lazy image well before it arrives, so the wipe never plays over an empty mount.
    warm = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        warm.unobserve(e.target);
        try { e.target.loading = 'eager'; if (e.target.decode) e.target.decode().catch(() => {}); } catch {}
      }
    }, { rootMargin: '0px 0px 150% 0px' });
    lastY = window.scrollY;
    lastT = performance.now();
    observe(document);
    root.classList.add('reveal-live');

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('hashchange', schedule);
    window.addEventListener('load', schedule);
    document.addEventListener('motion:refresh', schedule);

    whenIntroDone().then(() => {
      // Let the loader exit and the hero start before the first in-view reveals play.
      setTimeout(() => { ready = true; schedule(); }, root.classList.contains('intro-played') ? 260 : 0);
    });

    // A visitor who turns reduced motion on mid-visit gets everything at once.
    try {
      matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        if (!e.matches) return;
        document.querySelectorAll(SELECTOR).forEach((el) => el.classList.add('is-in', 'is-done'));
        waiting.clear();
      });
    } catch {}
  } catch {
    root.classList.remove('has-reveal');
  }
}
