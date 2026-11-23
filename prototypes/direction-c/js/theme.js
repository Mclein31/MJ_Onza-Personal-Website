// Light/dark toggle. Light is the default and the page follows the OS until the visitor picks.
// The switch is a View Transition: the new theme opens as a circle from the toggle.

const KEY = 'dc-theme';

export function initTheme({ onChange } = {}) {
  const root = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const current = () => root.dataset.theme || (mq.matches ? 'dark' : 'light');

  const sync = () => {
    const dark = current() === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#0F1012' : '#E9EAEC'));
    onChange && onChange();
  };

  mq.addEventListener('change', () => { if (!root.dataset.theme) sync(); });

  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.dataset.theme = next;
      try { localStorage.setItem(KEY, next); } catch (e) { /* storage blocked */ }
      sync();
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) { apply(); return; }
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 620, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  });

  sync();
}
