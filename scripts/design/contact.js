/*
 * contact.js: design-layer motion for Contact, Footer, and Dialogs (Instrument redesign v5).
 * Owner: W7 contact+footer+dialogs; CF2 added the typed query readout (initQuery).
 * Called once from scripts/design/index.js after the core modules are up. Must never throw.
 * Respects prefers-reduced-motion via reducedMotion() from ../core/motion.js.
 */
import { reducedMotion } from '../core/motion.js';
import { setViewerTransition } from '../core/viewer.js';
import { setVideoTransition } from '../core/video.js';

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const activeDialogAnims = new WeakMap();
let activeImageAnim = null;
let wired = false;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function cancelAnim(el) {
  const prev = activeDialogAnims.get(el);
  if (prev) {
    try { prev.cancel(); } catch {}
    activeDialogAnims.delete(el);
  }
}

function originFromTrigger(dialog, fromEl) {
  if (!fromEl || typeof fromEl.getBoundingClientRect !== 'function') {
    return { origin: '50% 50%', dx: 0, dy: 8 };
  }
  const dr = dialog.getBoundingClientRect();
  const fr = fromEl.getBoundingClientRect();
  if (!dr.width || !dr.height || (!fr.width && !fr.height)) {
    return { origin: '50% 50%', dx: 0, dy: 8 };
  }
  const fx = fr.left + fr.width / 2;
  const fy = fr.top + fr.height / 2;
  const dcx = dr.left + dr.width / 2;
  const dcy = dr.top + dr.height / 2;
  const ox = clamp(((fx - dr.left) / dr.width) * 100, 15, 85);
  const oy = clamp(((fy - dr.top) / dr.height) * 100, 15, 85);
  return {
    origin: `${ox.toFixed(1)}% ${oy.toFixed(1)}%`,
    dx: Math.round(clamp((fx - dcx) * 0.08, -28, 28)),
    dy: Math.round(clamp((fy - dcy) * 0.08, -28, 28)),
  };
}

/**
 * Fast (<250ms) scale+fade dialog transition anchored toward the triggering control.
 * Awaited on close by viewer.js and video.js via closeWithHook().
 */
async function animateDialog(dialog, fromEl, phase) {
  if (!dialog) return;
  cancelAnim(dialog);
  if (reducedMotion() || typeof dialog.animate !== 'function') {
    dialog.style.transformOrigin = '';
    return;
  }

  const { origin, dx, dy } = originFromTrigger(dialog, fromEl);
  dialog.style.transformOrigin = origin;

  if (phase === 'open') {
    const anim = dialog.animate(
      [
        { opacity: 0, transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.95)` },
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
      ],
      { duration: 210, easing: EASE_OUT },
    );
    activeDialogAnims.set(dialog, anim);
    anim.finished.catch(() => {}).finally(() => {
      if (activeDialogAnims.get(dialog) === anim) activeDialogAnims.delete(dialog);
    });
    return;
  }

  if (phase === 'close') {
    const anim = dialog.animate(
      [
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
        { opacity: 0, transform: `translate3d(${Math.round(dx * 0.6)}px, ${Math.round(dy * 0.6)}px, 0) scale(0.96)` },
      ],
      { duration: 150, easing: EASE_OUT, fill: 'forwards' },
    );
    activeDialogAnims.set(dialog, anim);
    dialog.addEventListener('close', () => {
      try { anim.cancel(); } catch {}
      if (activeDialogAnims.get(dialog) === anim) activeDialogAnims.delete(dialog);
    }, { once: true });
    try { await anim.finished; } catch {}
  }
}

function inlineErrorMessage(field) {
  const v = field.validity;
  if (!v) return field.validationMessage || '';
  if (field.name === 'name' && v.valueMissing) return 'Please enter your name.';
  if (field.name === 'email') {
    if (v.valueMissing) return 'Please enter your email address.';
    if (v.typeMismatch) return 'Enter a valid email address.';
  }
  if (field.name === 'message' && v.valueMissing) return 'Please write a short message.';
  return field.validationMessage || 'Please check this field.';
}

/**
 * Contact query readout (CF2): the two-line query types itself once when it comes into view, a thin orange caret
 * riding the last character, then the one-row result fades up. Characters are pre-laid out (hidden, keeping their
 * space), so nothing reflows. Static when motion is reduced, when the query is already on screen or above it at load,
 * and without JS. Screen readers get the plain sentence once (the split copy is aria-hidden).
 */
function initQuery() {
  const box = document.querySelector('[data-query]');
  const text = box && box.querySelector('[data-query-text]');
  if (!box || !text || reducedMotion() || !('IntersectionObserver' in window)) return;
  const r0 = text.getBoundingClientRect();
  if (r0.top < window.innerHeight) return;

  const lineEls = [...text.querySelectorAll('.contact__sql-line')];
  const plain = (lineEls.length ? lineEls.map((l) => l.textContent).join(' ') : text.textContent).replace(/\s+/g, ' ').trim();
  const sr = document.createElement('p');
  sr.className = 'sr-only';
  sr.textContent = plain;

  // Split every text node into one span per character, keeping the keyword / string spans around them.
  const nodes = [];
  const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const chars = [];
  for (const node of nodes) {
    if (!node.data.trim() && node.parentElement === text) continue;
    const frag = document.createDocumentFragment();
    for (const ch of node.data) {
      const s = document.createElement('span');
      s.className = 'q-ch';
      s.textContent = ch;
      frag.append(s);
      chars.push(s);
    }
    node.replaceWith(frag);
  }
  if (!chars.length) return;

  const caret = document.createElement('span');
  caret.className = 'contact__caret';
  caret.setAttribute('aria-hidden', 'true');
  text.setAttribute('aria-hidden', 'true');
  text.after(sr);
  text.append(caret);
  box.classList.add('is-pending');

  // Per-character times: quick, slightly uneven, a short beat at the line break. ~1.1s in all.
  const firstOfLine2 = lineEls[1] ? lineEls[1].querySelector('.q-ch') : null;
  const times = [];
  let t = 0;
  let seed = 7;
  for (const ch of chars) {
    if (ch === firstOfLine2) t += 110;
    seed = (seed * 9301 + 49297) % 233280;
    t += 11 + (seed / 233280) * 13;
    times.push(t);
  }

  let started = false;
  let done = false;
  let raf = 0;
  let shown = 0;

  const placeCaret = (ch) => {
    const x = ch.offsetLeft + ch.offsetWidth;
    const y = ch.offsetTop + (ch.offsetHeight - caret.offsetHeight) / 2;
    caret.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    for (const ch of chars) ch.style.visibility = '';
    box.classList.remove('is-pending');
    caret.classList.add('is-done');
    setTimeout(() => caret.remove(), 260);
    window.removeEventListener('scroll', onScroll);
  };

  const run = () => {
    if (started) return;
    started = true;
    const t0 = performance.now() + 160;
    caret.style.transform = `translate3d(${chars[0].offsetLeft}px, ${chars[0].offsetTop + (chars[0].offsetHeight - caret.offsetHeight) / 2}px, 0)`;
    const step = (now) => {
      raf = 0;
      if (done) return;
      const el = now - t0;
      while (shown < chars.length && times[shown] <= el) {
        chars[shown].style.visibility = 'visible';
        shown += 1;
      }
      if (shown > 0) placeCaret(chars[shown - 1]);
      if (shown >= chars.length) {
        setTimeout(finish, 220);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  // Jumped past it (anchor, fast scroll): show it whole at once.
  function onScroll() {
    if (started || done) return;
    const r = text.getBoundingClientRect();
    if (r.bottom < 0) finish();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.disconnect();
      run();
    }
  }, { rootMargin: '0px 0px -18% 0px', threshold: 0 });
  io.observe(text);
}

export function init() {
  try {
    if (wired) return;
    wired = true;

    try { initQuery(); } catch {}

    // Dialog open/close origin transitions (viewer, video, message)
    setViewerTransition((ctx) => animateDialog(ctx.dialog, ctx.from, ctx.phase));
    setVideoTransition((ctx) => animateDialog(ctx.dialog, ctx.from, ctx.phase));

    let lastMessageTrigger = null;
    document.addEventListener('click', (e) => {
      const trigger = e.target instanceof Element ? e.target.closest('[data-message-open]') : null;
      if (trigger) lastMessageTrigger = trigger;
    }, true);

    document.addEventListener('message:open', (e) => {
      const dlg = e.detail?.dialog;
      if (dlg) animateDialog(dlg, lastMessageTrigger, 'open');
    });

    // Subtle directional nudge on lightbox slide step
    document.addEventListener('viewer:change', (e) => {
      if (reducedMotion()) return;
      const dir = e.detail?.direction;
      if (dir !== 'next' && dir !== 'prev') return;
      const img = document.querySelector('[data-lightbox-image]');
      if (!img || typeof img.animate !== 'function') return;
      if (activeImageAnim) { try { activeImageAnim.cancel(); } catch {} }
      const shift = dir === 'next' ? 12 : -12;
      activeImageAnim = img.animate(
        [
          { opacity: 0.78, transform: `translate3d(${shift}px, 0, 0)` },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ],
        { duration: 150, easing: EASE_OUT },
      );
      activeImageAnim.finished.catch(() => {}).finally(() => { activeImageAnim = null; });
    });

    // Copy button label sync
    let copyTimer = 0;
    document.addEventListener('copy:done', (e) => {
      if (!e.detail?.ok) return;
      const label = document.querySelector('[data-copy] [data-copy-text]');
      if (!label) return;
      label.textContent = 'Copied';
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => { label.textContent = 'Copy'; }, 1600);
    });

    // Message form inline validation & submit button text
    const form = document.querySelector('[data-message-form]');
    const submitLabel = document.querySelector('[data-submit-label]');
    const clearErrors = () => {
      if (!form) return;
      form.querySelectorAll('[data-field-error]').forEach((el) => { el.textContent = ''; });
    };
    const resetSubmitLabel = () => {
      if (submitLabel) submitLabel.textContent = 'Send';
    };

    if (form) {
      form.addEventListener('invalid', (e) => {
        const field = e.target;
        if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
        const errEl = form.querySelector(`[data-field-error="${field.name}"]`);
        if (errEl) errEl.textContent = inlineErrorMessage(field);
      }, true);

      form.addEventListener('input', (e) => {
        const field = e.target;
        if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
        const errEl = form.querySelector(`[data-field-error="${field.name}"]`);
        if (errEl) errEl.textContent = '';
      });

      form.addEventListener('reset', clearErrors);
    }

    document.addEventListener('message:open', () => { clearErrors(); resetSubmitLabel(); });
    document.addEventListener('message:sending', () => { if (submitLabel) submitLabel.textContent = 'Sending…'; });
    document.addEventListener('message:sent', () => { clearErrors(); resetSubmitLabel(); });
    document.addEventListener('message:error', resetSubmitLabel);
  } catch {}
}
