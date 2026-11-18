import { $$, store } from './util.js';

const KEY = 'portfolio-theme';
const root = document.documentElement;

export function setTheme(next, persist = true) {
  if (next === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
  // The page ships one theme-color meta per colour scheme (for the first paint); a chosen theme sets them all
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', next === 'light' ? '#F2EFE9' : '#0B0B0B'));
  if (persist) store.set(KEY, next);
}

export const currentTheme = () => (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
export const toggleTheme = () => setTheme(currentTheme() === 'light' ? 'dark' : 'light');

export function initTheme() {
  $$('[data-theme-toggle]').forEach((btn) => btn.addEventListener('click', toggleTheme));

  matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!store.get(KEY)) setTheme(e.matches ? 'light' : 'dark', false);
  });
}
