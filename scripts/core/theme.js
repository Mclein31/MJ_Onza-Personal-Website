/**
 * theme.js: light / dark theme. Light is the default; the OS preference is followed until the visitor
 * chooses; the choice is persisted.
 *
 * Behaviour only. The page CSS keys off `html[data-theme="light" | "dark"]`.
 *
 * FLASH-FREE BOOTSTRAP: paste this inline, un-deferred <script> in <head>, before the stylesheets:
 *
 *   <script>
 *   (function () {
 *     var t; try { t = localStorage.getItem('portfolio-theme'); } catch (e) {}
 *     if (t !== 'light' && t !== 'dark') {
 *       t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
 *     }
 *     document.documentElement.setAttribute('data-theme', t);
 *   })();
 *   </script>
 *
 * (It sets the same attribute initTheme() would; the module then only syncs theme-color and the toggles.)
 * CSS should declare `color-scheme: only light` under [data-theme="light"] (opts out of Android Chrome
 * auto-darkening) and `color-scheme: dark` under [data-theme="dark"].
 *
 * HOOKS READ
 *   [data-theme-toggle]            any number of buttons; click toggles. aria-pressed="true" means dark.
 *   :root custom properties        --theme-color-light, --theme-color-dark   (meta theme-color values;
 *                                  fallbacks #EDEEF0 / #0D0E10). Define both on :root.
 *   meta[name="theme-color"]       every one found gets the active colour (a new one is created if none).
 *
 * WRITES
 *   html[data-theme]               "light" | "dark" (always set, never removed)
 *   html[data-theme-transition]    present while a view transition runs (CSS can scope ::view-transition-*)
 *   html style vars (only during a toggle that starts from a click or key press):
 *       --theme-x, --theme-y       click point in px (element centre for keyboard activation)
 *       --theme-r                  radius in px that reaches the farthest viewport corner
 *     e.g. ::view-transition-new(root){ clip-path: circle(0 at var(--theme-x) var(--theme-y)); } animated to
 *     circle(var(--theme-r) at ...). They are removed when the transition finishes.
 *   [data-theme-toggle][aria-pressed], [data-theme-toggle][data-theme-current]
 *   localStorage 'portfolio-theme'  "light" | "dark" (only after the visitor chooses)
 *
 * EVENTS
 *   emits document "theme:change"  detail: { theme, previous, source: 'init' | 'user' | 'system' | 'storage' | 'api',
 *                                  x, y }    fired inside the DOM update, so listeners see the new theme.
 *
 * Toggling runs inside document.startViewTransition() when available and motion is allowed; with
 * prefers-reduced-motion: reduce (or no support) the swap is instant, still announced via aria-pressed.
 *
 * API: initTheme(), getTheme(), setTheme(theme, { persist, source, x, y }), toggleTheme({ x, y })
 */

const KEY = 'portfolio-theme';
const FALLBACK = { light: '#EDEEF0', dark: '#0D0E10' };
const root = document.documentElement;
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const osTheme = () => { try { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; } };
const read = () => { try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch { return null; } };
const write = (v) => { try { localStorage.setItem(KEY, v); } catch {} };

let latest = 0;

export const getTheme = () => (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

function metaColor(theme) {
  try {
    const v = getComputedStyle(root).getPropertyValue(`--theme-color-${theme}`).trim();
    if (v) return v;
  } catch {}
  return FALLBACK[theme];
}

function syncMeta(theme) {
  try {
    const color = metaColor(theme);
    let metas = [...document.querySelectorAll('meta[name="theme-color"]')];
    if (!metas.length && document.head) {
      const m = document.createElement('meta');
      m.name = 'theme-color';
      document.head.append(m);
      metas = [m];
    }
    // The page ships one tag per OS scheme (for the first paint); a chosen theme must win over both.
    metas.forEach((m) => m.setAttribute('content', color));
  } catch {}
}

function syncToggles(theme) {
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(theme === 'dark'));
    b.setAttribute('data-theme-current', theme);
  });
}

function apply(theme, source, point) {
  const previous = getTheme();
  root.setAttribute('data-theme', theme);
  syncMeta(theme);
  syncToggles(theme);
  if (theme !== previous || source !== 'init') {
    document.dispatchEvent(new CustomEvent('theme:change', {
      detail: { theme, previous, source, x: point?.x ?? null, y: point?.y ?? null },
    }));
  }
}

export function setTheme(theme, options = {}) {
  try {
    if (theme !== 'light' && theme !== 'dark') return;
    const { persist = true, source = 'api', x, y } = options;
    if (persist) write(theme);
    const point = Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
    const run = () => apply(theme, source, point);

    if (theme === getTheme() || typeof document.startViewTransition !== 'function' || reduced() || !point) {
      run();
      return;
    }

    const id = ++latest;
    const w = innerWidth, h = innerHeight;
    root.style.setProperty('--theme-x', `${x}px`);
    root.style.setProperty('--theme-y', `${y}px`);
    root.style.setProperty('--theme-r', `${Math.ceil(Math.hypot(Math.max(x, w - x), Math.max(y, h - y)))}px`);
    root.setAttribute('data-theme-transition', '');
    const finish = () => {
      if (id !== latest) return; // a newer toggle owns the variables now
      root.removeAttribute('data-theme-transition');
      root.style.removeProperty('--theme-x');
      root.style.removeProperty('--theme-y');
      root.style.removeProperty('--theme-r');
    };
    try {
      const vt = document.startViewTransition(run);
      vt.ready.catch(() => {});
      vt.finished.then(finish, finish);
    } catch {
      run();
      finish();
    }
  } catch {}
}

export function toggleTheme(options = {}) {
  setTheme(getTheme() === 'light' ? 'dark' : 'light', { source: 'user', ...options });
}

function pointFrom(event, button) {
  const keyboard = !event || event.detail === 0 || (event.clientX === 0 && event.clientY === 0);
  if (!keyboard) return { x: event.clientX, y: event.clientY };
  const r = button.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function initTheme() {
  try {
    // Same result as the head bootstrap; harmless if it already ran.
    apply(read() || osTheme(), 'init');

    document.addEventListener('click', (e) => {
      const btn = e.target instanceof Element ? e.target.closest('[data-theme-toggle]') : null;
      if (!btn) return;
      const { x, y } = pointFrom(e, btn);
      toggleTheme({ x, y });
    });

    // Follow the OS until the visitor has chosen.
    try {
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!read()) setTheme(e.matches ? 'dark' : 'light', { persist: false, source: 'system' });
      });
    } catch {}

    // Another tab changed the choice.
    addEventListener('storage', (e) => {
      if (e.key !== KEY) return;
      setTheme(read() || osTheme(), { persist: false, source: 'storage' });
    });
  } catch {}
}
