/* ==========================================================================
   Contact — message dialog
   ========================================================================== */
import { $, $$ } from './util.js';

let dialog;
export function openMessage() {
  if (!dialog) return;
  dialog.showModal();
  document.body.classList.add('is-locked');
  setTimeout(() => $('#fName')?.focus(), 50);
}

export function initContact() {
  dialog = $('[data-message]');
  if (!dialog) return;
  const form = $('[data-message-form]', dialog);
  const submit = $('[data-message-submit]', dialog);
  const status = $('[data-message-status]', dialog);

  $$('[data-message-open]').forEach((b) => b.addEventListener('click', openMessage));
  $('[data-message-close]', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => document.body.classList.remove('is-locked'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const label = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.className = 'msg__status';
    status.textContent = '';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      status.classList.add('ok');
      status.textContent = 'Sent. I\'ll reply to you by email soon.';
      form.reset();
      setTimeout(() => { dialog.close(); status.textContent = ''; }, 2400);
    } catch {
      status.classList.add('err');
      status.textContent = 'That didn\'t go through. Email me directly at mcleinonza0531@gmail.com.';
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  });
}
