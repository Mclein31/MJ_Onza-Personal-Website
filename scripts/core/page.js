/**
 * page.js: the two small page behaviours that belong to no other module.
 *
 * HOOKS READ
 *   [data-year]          text becomes the current year
 *   [data-copy="<text>"] button (delegated click): copies the text to the clipboard and announces it through the
 *                        toast. Optional data-copy-label="Email address" sets the toast wording
 *                        ("<label> copied."). One copy action per thing: the markup carries one button per value.
 *
 * WRITES
 *   [data-copy]  data-state="copied" for ~1.6s after a successful copy (style it if you like), then removed
 *
 * EVENTS (document)
 *   copy:done  detail { text, ok }   after every attempt
 *
 * API: initPage()
 */

import { showToast } from './toast.js';

let wired = false;

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  } catch {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch { return false; }
}

export function initPage() {
  try {
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
    if (wired) return;
    wired = true;
    document.addEventListener('click', async (e) => {
      const btn = e.target instanceof Element ? e.target.closest('[data-copy]') : null;
      if (!btn) return;
      const text = btn.getAttribute('data-copy') || '';
      if (!text) return;
      const ok = await copyText(text);
      const label = btn.getAttribute('data-copy-label') || 'Copied';
      showToast(ok ? (btn.hasAttribute('data-copy-label') ? `${label} copied.` : 'Copied to clipboard.') : `Could not copy. ${text}`, { tone: ok ? 'success' : 'error' });
      if (ok) {
        btn.setAttribute('data-state', 'copied');
        setTimeout(() => btn.removeAttribute('data-state'), 1600);
      }
      try { document.dispatchEvent(new CustomEvent('copy:done', { detail: { text, ok }, bubbles: true })); } catch {}
    });
  } catch {}
}
