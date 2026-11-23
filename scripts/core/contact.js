/**
 * contact.js: the "send a message" dialog (FormSubmit AJAX), with focus trap, focus return,
 * native validation, a honeypot and sending / success / error states.
 *
 * Behaviour only: no styling. The CSS styles the state classes and attributes below.
 *
 * HOOKS READ
 *   [data-message-open]      any element, anywhere (delegated): opens the dialog
 *   <dialog data-message>    the dialog (native showModal(); a plain element works with a basic fallback)
 *     [data-message-close]     closes it
 *     [data-message-form]      form with action="https://formsubmit.co/ajax/mcleinjeionza06@gmail.com",
 *                              the hidden _subject/_captcha/_template fields and the _honey honeypot
 *     [data-message-submit]    submit button
 *     [data-message-status]    role="status" aria-live="polite" text target (optional; toast is used too)
 *   Nothing is done if the dialog or its form is absent.
 *
 * WRITES
 *   dialog   class is-open while open; attr data-state="idle|sending|success|error" (also on the form)
 *   form     class is-loading while sending; aria-busy; data-state as above
 *   submit   disabled while sending (restored afterwards)
 *   fields   aria-invalid="true" on fields that fail native validation (cleared on input)
 *   status   text: "Sending…", success or error copy; class is-success / is-error
 *   scroll   lockScroll('message') / unlockScroll('message') from lock.js while open: body.is-locked, html.is-scroll-locked,
 *            scroll:lock / scroll:unlock, and Lenis is stopped by motion.js
 *   openers  aria-expanded is NOT touched (they open a dialog, not a disclosure)
 *
 * EVENTS (document, CustomEvent, bubbles)
 *   "message:open" / "message:close"   detail { dialog }
 *   "modal:open"   / "modal:close"     detail { name: 'message', dialog }  (generic: a scroll library can stop/start)
 *   "message:sending"                  detail {}
 *   "message:sent"                     detail {}
 *   "message:error"                    detail { reason }
 *
 * BEHAVIOUR
 *   - Opening focuses the first real field; Tab / Shift+Tab cycle inside; Escape (native cancel) or the close
 *     button or a click on the backdrop closes; focus returns to the element that opened it.
 *   - Native constraint validation (required, type=email). Invalid submit reports the first problem and focuses it.
 *   - Honeypot: if _honey has a value the form pretends to succeed and sends nothing.
 *   - POST: fetch(form action, { method:'POST', body:new FormData(form), headers:{ Accept:'application/json' } }).
 *     res.ok is success, except a JSON body with success === false / "false" (FormSubmit's answer for an address
 *     not yet activated) which counts as an error. 15s timeout.
 *   - Success: status + toast, form reset, dialog closes after 2.4s (cancelled if the visitor closes first).
 *     Error: dialog stays open, fields keep their text, status + toast show the direct email address.
 *   - prefers-reduced-motion: nothing animates here; the auto-close delay is unchanged.
 *
 * API: initContact(), openMessage(opener?), closeMessage()
 */

import { showToast } from './toast.js';
import { lockScroll, unlockScroll } from './lock.js';

const SENDING = 'Sending…';
const SUCCESS = "Sent. I'll reply to you by email soon.";
const FAILURE = "That didn't go through. Email me directly at mcleinjeionza06@gmail.com.";
const FALLBACK_ACTION = 'https://formsubmit.co/ajax/mcleinjeionza06@gmail.com';
const CLOSE_AFTER_SUCCESS = 2400;
const TIMEOUT = 15000;
const FOCUSABLE = 'a[href],button,input,select,textarea,summary,[tabindex]';

let dialog = null;
let form = null;
let submitBtn = null;
let statusEl = null;
let opener = null;
let closeTimer = 0;
let sending = false;

const emit = (name, detail) => { try { document.dispatchEvent(new CustomEvent(name, { detail, bubbles: true })); } catch {} };
const native = () => !!dialog && typeof dialog.showModal === 'function';
const isOpen = () => !!dialog && (dialog.open || dialog.hasAttribute('open'));

function setState(state) {
  dialog.setAttribute('data-state', state);
  form.setAttribute('data-state', state);
}

function setStatus(text, kind) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle('is-success', kind === 'success');
  statusEl.classList.toggle('is-error', kind === 'error');
}

function focusables() {
  return [...dialog.querySelectorAll(FOCUSABLE)].filter((el) => {
    if (el.disabled || el.getAttribute('tabindex') === '-1' || el.getAttribute('aria-hidden') === 'true') return false;
    if (el.type === 'hidden') return false;
    return el.getClientRects().length > 0;
  });
}

function firstField() {
  const fields = [...form.querySelectorAll('input,textarea,select')].filter((el) =>
    el.type !== 'hidden' && el.name !== '_honey' && el.getAttribute('tabindex') !== '-1' && el.getAttribute('aria-hidden') !== 'true' && !el.disabled);
  return fields[0] || focusables()[0] || dialog;
}

function resetState() {
  clearTimeout(closeTimer);
  setState('idle');
  setStatus('', null);
  form.classList.remove('is-loading');
  form.removeAttribute('aria-busy');
  form.querySelectorAll('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'));
}

export function openMessage(from) {
  try {
    if (!dialog || isOpen()) return;
    opener = from || (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    if (!sending) resetState();
    if (native()) dialog.showModal();
    else { dialog.setAttribute('open', ''); dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); }
    dialog.classList.add('is-open');
    lockScroll('message');
    firstField().focus({ preventScroll: true });
    emit('message:open', { dialog });
    emit('modal:open', { name: 'message', dialog });
  } catch {}
}

export function closeMessage() {
  try {
    if (!dialog || !isOpen()) return;
    if (native()) dialog.close();
    else onClosed();
  } catch {}
}

// Runs for every way of closing (button, Escape, backdrop, programmatic): one place for cleanup.
function onClosed() {
  clearTimeout(closeTimer);
  if (!native()) dialog.removeAttribute('open');
  dialog.classList.remove('is-open');
  unlockScroll('message');
  const back = opener;
  opener = null;
  if (back && back.isConnected && typeof back.focus === 'function') back.focus({ preventScroll: true });
  if (!sending) setState('idle');
  emit('message:close', { dialog });
  emit('modal:close', { name: 'message', dialog });
}

async function submit(e) {
  e.preventDefault();
  if (sending) return;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const honey = form.querySelector('[name="_honey"]');
  const action = form.getAttribute('action') || FALLBACK_ACTION;

  const finishOk = () => {
    setState('success');
    setStatus(SUCCESS, 'success');
    showToast(SUCCESS, { tone: 'success' });
    form.reset();
    emit('message:sent', {});
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { closeMessage(); setStatus('', null); setState('idle'); }, CLOSE_AFTER_SUCCESS);
  };

  if (honey && honey.value) { finishOk(); return; } // a bot: look successful, send nothing

  sending = true;
  clearTimeout(closeTimer);
  setState('sending');
  setStatus(SENDING, null);
  form.classList.add('is-loading');
  form.setAttribute('aria-busy', 'true');
  if (submitBtn) submitBtn.disabled = true;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  emit('message:sending', {});
  try {
    const res = await fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let body = null;
    try { body = await res.json(); } catch {}
    if (body && (body.success === false || body.success === 'false')) throw new Error('FormSubmit refused the message');
    finishOk();
  } catch (err) {
    setState('error');
    setStatus(FAILURE, 'error');
    showToast(FAILURE, { tone: 'error' });
    emit('message:error', { reason: String((err && err.message) || err) });
  } finally {
    clearTimeout(timer);
    sending = false;
    form.classList.remove('is-loading');
    form.removeAttribute('aria-busy');
    if (submitBtn) submitBtn.disabled = false;
  }
}

export function initContact() {
  try {
    dialog = document.querySelector('[data-message]');
    form = dialog && dialog.querySelector('[data-message-form]');
    if (!dialog || !form) { dialog = null; return; }
    submitBtn = dialog.querySelector('[data-message-submit]');
    statusEl = dialog.querySelector('[data-message-status]');
    setState('idle');

    document.addEventListener('click', (e) => {
      const btn = e.target instanceof Element ? e.target.closest('[data-message-open]') : null;
      if (btn) { e.preventDefault(); openMessage(btn); }
    });
    dialog.querySelectorAll('[data-message-close]').forEach((b) => b.addEventListener('click', closeMessage));

    // Backdrop click: only when the press started AND ended on the dialog itself (not a text selection drag).
    let downOnBackdrop = false;
    dialog.addEventListener('pointerdown', (e) => { downOnBackdrop = e.target === dialog; });
    dialog.addEventListener('click', (e) => { if (e.target === dialog && downOnBackdrop) closeMessage(); downOnBackdrop = false; });

    dialog.addEventListener('close', onClosed);
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !native()) { e.preventDefault(); closeMessage(); return; }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) { e.preventDefault(); return; }
      const first = list[0], last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialog.contains(active))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !dialog.contains(active))) { e.preventDefault(); first.focus(); }
    });

    form.addEventListener('invalid', (e) => { if (e.target instanceof Element) e.target.setAttribute('aria-invalid', 'true'); }, true);
    form.addEventListener('input', (e) => { if (e.target instanceof Element) e.target.removeAttribute('aria-invalid'); });
    form.addEventListener('submit', submit);
  } catch {}
}
