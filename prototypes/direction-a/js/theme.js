// Light / dark: follows the OS until the visitor chooses. The change wipes in top-down (View Transitions) when motion is allowed.
export function initTheme({ reduce, onChange }) {
  const root = document.documentElement;
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const group = document.querySelector('.theme');
  const buttons = [...document.querySelectorAll('[data-theme-set]')];
  const resolved = () => root.getAttribute('data-theme') || (mq.matches ? 'dark' : 'light');

  function sync() {
    const r = resolved();
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === r)));
    group?.setAttribute('data-active', r);
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute('content', r === 'dark' ? '#0F1012' : '#E9EAEC');
    });
    onChange?.(r);
  }

  function apply(next) {
    const commit = () => {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('v5a-theme', next); } catch (e) { /* private mode */ }
      sync();
    };
    if (!reduce && document.startViewTransition) {
      root.classList.add('vt-theme');
      const vt = document.startViewTransition(commit);
      vt.finished.finally(() => root.classList.remove('vt-theme'));
    } else commit();
  }

  buttons.forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.themeSet !== resolved()) apply(b.dataset.themeSet);
  }));
  mq.addEventListener('change', () => { if (!root.getAttribute('data-theme')) sync(); });
  sync();
  return { resolved };
}

export function initMenu() {
  const btn = document.querySelector('[data-menu-toggle]');
  const menu = document.getElementById('menu');
  if (!btn || !menu) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };
  btn.addEventListener('click', () => set(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); }
  });
}
