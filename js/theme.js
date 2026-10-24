import { $$, store } from './util.js';

const KEY = 'portfolio-theme';
const root = document.documentElement;

export function setTheme(next, persist = true) {
  if (next === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'light' ? '#f2f3ef' : '#0b0c0d');
  if (persist) store.set(KEY, next);
}

export const currentTheme = () => (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
export const toggleTheme = () => setTheme(currentTheme() === 'light' ? 'dark' : 'light');

export function initTheme() {
  $$('[data-theme-toggle]').forEach((btn) => btn.addEventListener('click', toggleTheme));

  // Follow the OS until the visitor makes an explicit choice
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!store.get(KEY)) setTheme(e.matches ? 'light' : 'dark', false);
  });
}
