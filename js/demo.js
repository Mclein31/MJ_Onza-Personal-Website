import { $, $$ } from './util.js';

// "Click me" buttons open a project inside a desktop-style window (iframe loads on first open)
export function initDemo() {
  const dlg = $('[data-demo]');
  if (!dlg) return;
  const frame = $('[data-demo-frame]', dlg);
  const title = $('[data-demo-title-el]', dlg);
  const loading = $('[data-demo-loading]', dlg);
  let opener = null;

  frame.addEventListener('load', () => { if (frame.src) loading.hidden = true; });

  $$('[data-demo-open]').forEach((btn) => btn.addEventListener('click', () => {
    opener = btn;
    const src = new URL(btn.dataset.demoOpen, location.href).href;
    title.textContent = btn.dataset.demoTitle || 'Live demo';
    frame.title = `${title.textContent} live demo`;
    if (frame.src !== src) { loading.hidden = false; frame.src = src; }
    dlg.showModal();
    document.body.classList.add('is-locked');
  }));

  $('[data-demo-close]', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    opener?.focus();
  });
}
