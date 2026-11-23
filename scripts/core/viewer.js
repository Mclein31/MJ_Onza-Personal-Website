/*
 * viewer.js: one <dialog> for project screenshots and certificate/award photos.
 *
 * HOOKS READ
 *   dialog[data-lightbox-dialog]   the viewer (also accepts dialog[data-lightbox]); parts inside it:
 *     [data-lightbox-image]   <img> that shows the current item (required)
 *     [data-lightbox-title] [data-lightbox-desc] [data-lightbox-count]   caption, note ("3 / 7"), optional
 *     [data-lightbox-prev] [data-lightbox-next] [data-lightbox-close]    optional buttons
 *     [data-lightbox-stage]   optional: swipe area; a click on it (not on a child) closes. Defaults to the image's parent.
 *   [data-lightbox="<group>"]   trigger (button/img). A group is every trigger with the same value, in DOM order.
 *                               Data comes from the trigger or its <img>: data-title, data-desc, data-full (optional hi-res
 *                               URL), else the best srcset candidate, else src. alt is the fallback title.
 *   [data-lightbox-target="<group>:<n>"]   trigger that opens item n (0-based) of that group.
 *
 * ATTRIBUTES / CLASSES WRITTEN (no styling)
 *   dialog   .is-open (after showModal) .is-closing (while the close transition runs) .is-loading (+ aria-busy) .is-error
 *            data-direction="next|prev|none" (travel direction of the last change), data-count="<n>", data-single="true" when 1 item
 *   body     .is-locked via lock.js (key 'viewer'; see modal.js)
 *   prev/next/count get `hidden` for a single item; desc gets `hidden` when empty.
 *   stage    touch-action:pan-y (functional: lets horizontal swipes reach this module)
 *
 * EVENTS (CustomEvent on the dialog, bubbles to document)
 *   viewer:open    { items, index, from }
 *   viewer:change  { items, index, item, direction, from }   every time the shown item changes, including the first
 *   viewer:close   { items, index, from }                     after the dialog closed and focus was returned
 *
 * EXPORTS
 *   initViewer()                      wires everything; returns the controller or null (never throws)
 *   openViewer(items, index, fromEl)  items = [{ src, title, desc, alt?, el? }]; returns false if the viewer is not mounted
 *   closeViewer()
 *   itemFromElement(el)               builds one item from a trigger element (used by gallery.js)
 *   setViewerTransition(fn)           design hook for a Flip / View Transition from the clicked image. fn(ctx) runs
 *                                     on 'open' (after showModal, not awaited) and on 'close' (awaited up to 1.2 s before
 *                                     the dialog really closes). ctx = { phase: 'open'|'close', from, image, dialog,
 *                                     item, index, reduced, loaded: Promise<boolean> }.
 *
 * KEYS / GESTURES: ArrowLeft/ArrowRight page (wrapping), Escape closes, touch/pen swipe pages, click on backdrop closes.
 * Focus returns to the opener on close. Neighbours are preloaded.
 */

import { $, $$, emit, lockScroll, unlockScroll, reducedMotion, closeWithHook, returnFocus } from './modal.js';

let ctl = null;
let transition = null;

export const setViewerTransition = (fn) => { transition = typeof fn === 'function' ? fn : null; };
export const openViewer = (items, index = 0, from = null) => (ctl ? ctl.open(items, index, from) : false);
export const closeViewer = () => ctl?.close();

function bestSource(img) {
  const set = (img.getAttribute('srcset') || '').split(',')
    .map((s) => s.trim().split(/\s+/))
    .filter((p) => p[0] && /^\d+w$/.test(p[1] || ''))
    .map(([u, w]) => ({ u, w: parseInt(w, 10) }))
    .sort((a, b) => a.w - b.w);
  if (!set.length) return img.currentSrc || img.src;
  const need = Math.min(innerWidth * Math.min(devicePixelRatio || 1, 2), 2400);
  const pick = set.find((c) => c.w >= need) || set[set.length - 1];
  return new URL(pick.u, location.href).href;
}

export function itemFromElement(el) {
  const img = el.matches?.('img') ? el : el.querySelector?.('img');
  const d = el.dataset || {};
  const id = img?.dataset || {};
  const title = d.title || id.title || img?.alt || '';
  const src = d.full || id.full || (img ? bestSource(img) : d.src || '');
  return { src, title, desc: d.desc || id.desc || '', alt: img?.alt || title, el };
}

function groupItems(name, trigger) {
  const list = name ? $$(`[data-lightbox="${CSS.escape(name)}"]`).filter((e) => e.tagName !== 'DIALOG') : [trigger];
  return list.map(itemFromElement);
}

export function initViewer() {
  if (ctl) return ctl;
  try {
    const dlg = $('[data-lightbox-dialog]') || $('dialog[data-lightbox]');
    const img = dlg && $('[data-lightbox-image]', dlg);
    if (!dlg || !img || typeof dlg.showModal !== 'function') return null;

    const titleEl = $('[data-lightbox-title]', dlg);
    const descEl = $('[data-lightbox-desc]', dlg);
    const countEl = $('[data-lightbox-count]', dlg);
    const prevBtn = $('[data-lightbox-prev]', dlg);
    const nextBtn = $('[data-lightbox-next]', dlg);
    const closeBtn = $('[data-lightbox-close]', dlg);
    const stage = $('[data-lightbox-stage]', dlg) || img.parentElement;

    let items = [], index = 0, opener = null, token = 0, locked = false, closing = false, loaded = Promise.resolve(true);
    const warm = new Set();

    const ctx = (phase) => ({ phase, from: opener, image: img, dialog: dlg, item: items[index], index, reduced: reducedMotion(), loaded });
    const detail = (extra) => ({ items, index, from: opener, ...extra });

    const preload = (i) => {
      const it = items[(i + items.length) % items.length];
      if (!it || warm.has(it.src)) return;
      warm.add(it.src);
      const pre = new Image();
      pre.decoding = 'async';
      pre.src = it.src;
    };

    function show(i, direction = 'none') {
      const n = items.length;
      index = ((i % n) + n) % n;
      const item = items[index];
      const mine = ++token;
      dlg.dataset.direction = direction;
      dlg.classList.add('is-loading');
      dlg.classList.remove('is-error');
      dlg.setAttribute('aria-busy', 'true');
      const settle = (ok) => {
        if (mine !== token) return;
        dlg.classList.remove('is-loading');
        dlg.classList.toggle('is-error', !ok);
        dlg.removeAttribute('aria-busy');
      };
      loaded = new Promise((resolve) => {
        img.onload = () => { settle(true); resolve(true); };
        img.onerror = () => { settle(false); resolve(false); };
      });
      img.alt = item.alt || item.title || '';
      if (img.getAttribute('src') === item.src && img.complete && img.naturalWidth) {
        settle(true);
        loaded = Promise.resolve(true);
      } else {
        img.src = item.src;
      }
      if (titleEl) titleEl.textContent = item.title || '';
      if (descEl) { descEl.textContent = item.desc || ''; descEl.hidden = !item.desc; }
      if (countEl) countEl.textContent = `${index + 1} / ${n}`;
      preload(index + 1);
      preload(index - 1);
      emit(dlg, 'viewer:change', detail({ item, direction }));
    }

    function open(list, i = 0, from = null) {
      if (!Array.isArray(list) || !list.length) return false;
      items = list;
      if (!dlg.open) opener = from || document.activeElement;
      const single = items.length < 2;
      [prevBtn, nextBtn, countEl].forEach((b) => { if (b) b.hidden = single; });
      dlg.dataset.count = String(items.length);
      dlg.toggleAttribute('data-single', single);
      closing = false;
      dlg.classList.remove('is-closing');
      const wasOpen = dlg.open;
      if (!wasOpen) {
        try { dlg.showModal(); } catch { return false; }
        if (!locked) { lockScroll('viewer'); locked = true; }
        dlg.classList.add('is-open');
      }
      show(Math.min(Math.max(0, i | 0), items.length - 1));
      if (!wasOpen) {
        emit(dlg, 'viewer:open', detail());
        if (transition) { try { Promise.resolve(transition(ctx('open'))).catch(() => {}); } catch {} }
      }
      return true;
    }

    function close() {
      if (!dlg.open || closing) return;
      closing = true;
      closeWithHook(dlg, transition, ctx('close'));
    }

    dlg.addEventListener('close', () => {
      const snapshot = detail();
      closing = false;
      token++;
      dlg.classList.remove('is-open', 'is-closing', 'is-loading');
      dlg.removeAttribute('aria-busy');
      if (locked) { unlockScroll('viewer'); locked = false; }
      returnFocus(opener);
      emit(dlg, 'viewer:close', snapshot);
    });
    // Escape: run the close transition instead of vanishing instantly
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });

    prevBtn?.addEventListener('click', () => show(index - 1, 'prev'));
    nextBtn?.addEventListener('click', () => show(index + 1, 'next'));
    closeBtn?.addEventListener('click', close);
    dlg.addEventListener('click', (e) => { if (e.target === dlg || (stage && e.target === stage && stage.hasAttribute('data-lightbox-stage'))) close(); });
    dlg.addEventListener('keydown', (e) => {
      if (e.defaultPrevented || items.length < 2) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1, 'prev'); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1, 'next'); }
    });

    // Swipe (touch and pen only; mouse users have the arrows)
    if (stage) {
      stage.style.touchAction = 'pan-y';
      let sx = 0, sy = 0, sid = null;
      stage.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;
        sid = e.pointerId; sx = e.clientX; sy = e.clientY;
      });
      const end = (e) => {
        if (e.pointerId !== sid) return;
        sid = null;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (items.length > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 'next' : 'prev');
      };
      stage.addEventListener('pointerup', end);
      stage.addEventListener('pointercancel', () => { sid = null; });
    }

    // Triggers (delegated, so markup added later works too)
    document.addEventListener('click', (e) => {
      const t = e.target instanceof Element ? e.target.closest('[data-lightbox]:not(dialog), [data-lightbox-target]') : null;
      if (!t || dlg.contains(t) || e.defaultPrevented) return;
      if (t.hasAttribute('data-lightbox-target')) {
        const spec = t.getAttribute('data-lightbox-target') || '';
        const cut = spec.lastIndexOf(':');
        const list = groupItems(cut < 0 ? spec : spec.slice(0, cut), t);
        const n = cut < 0 ? 0 : parseInt(spec.slice(cut + 1), 10);
        open(list, Number.isFinite(n) ? n : 0, t);
        return;
      }
      const list = groupItems(t.getAttribute('data-lightbox'), t);
      const at = list.findIndex((it) => it.el === t || it.el.contains(t));
      open(list, Math.max(0, at), t);
    });

    ctl = { open, close, dialog: dlg };
    return ctl;
  } catch {
    return null;
  }
}
