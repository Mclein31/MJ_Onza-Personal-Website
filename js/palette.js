import { $, toast, copyText } from './util.js';
import { toggleTheme } from './theme.js';
import { openMessage } from './contact.js';

const go = (hash) => () => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
const link = (url) => () => window.open(url, '_blank', 'noopener');

const COMMANDS = [
  { group: 'Sections', label: 'Top', hint: 'home', run: go('#top') },
  { group: 'Sections', label: 'About', hint: 'bio', run: go('#about') },
  { group: 'Sections', label: 'Work', hint: 'projects', run: go('#work') },
  { group: 'Sections', label: 'Activity', hint: 'github contributions', run: go('#activity') },
  { group: 'Sections', label: 'Stack', hint: 'skills journey', run: go('#stack') },
  { group: 'Sections', label: 'Recognition', hint: 'awards', run: go('#recognition') },
  { group: 'Sections', label: 'Training', hint: 'dti yep seminar', run: go('#training') },
  { group: 'Sections', label: 'Contact', hint: 'email', run: go('#contact') },
  { group: 'Actions', label: 'Toggle light / dark theme', hint: 'theme mode', run: toggleTheme },
  { group: 'Actions', label: 'Copy email address', hint: 'mail', run: async () => { await copyText('mcleinonza0531@gmail.com'); toast('Email copied to clipboard'); } },
  { group: 'Actions', label: 'Send a message', hint: 'contact form hire', run: () => openMessage() },
  { group: 'Actions', label: 'Like this site', hint: 'heart', run: () => $('[data-like]')?.click() },
  { group: 'Links', label: 'GitHub', hint: 'code repos', run: link('https://github.com/Mclein31') },
  { group: 'Links', label: 'LinkedIn', hint: 'profile', run: link('https://www.linkedin.com/in/mclein-jei-onza-9b0769322/') },
  { group: 'Links', label: 'AdvanCare (live)', hint: 'project healthcare hackathon', run: link('https://advancare.vercel.app/') },
  { group: 'Links', label: 'MedCore demo (live)', hint: 'project hospital billing', run: link('https://med-core1.vercel.app/') },
  { group: 'Links', label: 'Mulat Media (live)', hint: 'project cms', run: link('https://mulat-media.vercel.app/') },
];

export function initPalette() {
  const dlg = $('[data-palette]');
  if (!dlg) return;
  const input = $('[data-palette-input]', dlg);
  const list = $('[data-palette-list]', dlg);
  let results = COMMANDS, active = 0;

  const render = () => {
    const q = input.value.trim().toLowerCase();
    results = COMMANDS.filter((c) => !q || `${c.label} ${c.hint} ${c.group}`.toLowerCase().includes(q));
    active = Math.min(active, Math.max(0, results.length - 1));
    if (!results.length) { list.innerHTML = '<div class="palette__empty">No matches. Try "work" or "theme".</div>'; return; }
    let html = '', group = '';
    results.forEach((c, i) => {
      if (c.group !== group) { group = c.group; html += `<div class="palette__group">${group}</div>`; }
      html += `<button class="palette__item" type="button" role="option" data-i="${i}" aria-selected="${i === active}">${c.label}<span class="hint">${c.group === 'Links' ? '↗' : '↵'}</span></button>`;
    });
    list.innerHTML = html;
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  };

  const open = () => {
    if (dlg.open) return;
    input.value = ''; active = 0; render();
    dlg.showModal();
    input.focus();
  };
  const run = (i) => { const c = results[i]; if (!c) return; dlg.close(); setTimeout(c.run, 60); };

  input.addEventListener('input', () => { active = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(1, results.length); render(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + results.length) % Math.max(1, results.length); render(); }
    if (e.key === 'Enter') { e.preventDefault(); run(active); }
  });
  list.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) run(Number(b.dataset.i)); });
  list.addEventListener('pointermove', (e) => {
    const b = e.target.closest('[data-i]');
    if (b && Number(b.dataset.i) !== active) { active = Number(b.dataset.i); render(); }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  document.querySelectorAll('[data-palette-open]').forEach((b) => b.addEventListener('click', open));
  addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : open(); }
    else if (e.key === '/' && !typing && !document.querySelector('dialog[open]')) { e.preventDefault(); open(); }
  });
}
