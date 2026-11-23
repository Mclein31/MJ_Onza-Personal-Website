/*
 * recognition.js: design-layer motion and interaction for #recognition and #training (Instrument redesign v5).
 * Owner: W6 recognition+training.
 * Called once from scripts/design/index.js after the core modules are up. Never throws; no-op if hooks are absent.
 *
 * Behaviour:
 *   1. Whole-row activation on click (delegates to the row's data-lightbox-target button so core viewer.js opens).
 *   2. Desktop (fine pointer, >=1024px, motion enabled): hovering or keyboard-focusing a row reveals its certificate
 *      in a lerped .plate (.rec-preview) positioned strictly inside the open cols 9-10 corridor so it never covers
 *      row text or buttons (or hides cleanly if the corridor is narrower than the plate).
 *   3. Touch, phones, iPhone Duo and reduced-motion keep inline thumbnail plates instead of the floating follower.
 */
import { reducedMotion, onMotionPreferenceChange } from '../core/motion.js';

let initialized = false;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export function init() {
  if (initialized) return;
  try {
    const rows = [...document.querySelectorAll('#recognition [data-rec-row], #training [data-rec-row]')];
    if (!rows.length) return;
    initialized = true;

    const fineMQ = matchMedia('(hover: hover) and (pointer: fine)');
    const desktopMQ = matchMedia('(min-width: 1024px)');
    const canPreview = () => fineMQ.matches && desktopMQ.matches && !reducedMotion();

    /* ---------- 1. Whole-row click opens viewer (every device) ---------- */
    for (const row of rows) {
      row.addEventListener('click', (e) => {
        if (e.defaultPrevented) return;
        if (e.target instanceof Element && e.target.closest('button, a')) return;
        const sel = window.getSelection?.()?.toString().trim();
        if (sel) return;
        const trigger = row.querySelector('[data-lightbox-target], [data-lightbox]');
        if (trigger instanceof HTMLElement) trigger.click();
      });
    }

    /* ---------- 2. Desktop floating .plate preview ---------- */
    let previewEl = null;
    let previewImg = null;
    let activeRow = null;
    let pointerActive = false;
    let rafId = 0;
    let lastTime = 0;
    let currX = 0;
    let currY = 0;
    let targetX = 0;
    let targetY = 0;
    let hasCoords = false;
    let currentSrc = '';

    function ensurePreview() {
      if (previewEl) return;
      previewEl = document.createElement('figure');
      previewEl.className = 'plate rec-preview';
      previewEl.setAttribute('data-rec-preview', '');
      previewEl.setAttribute('aria-hidden', 'true');

      const media = document.createElement('div');
      media.className = 'rec-preview__media';

      previewImg = document.createElement('img');
      previewImg.className = 'rec-preview__img';
      previewImg.alt = '';
      previewImg.decoding = 'async';

      media.append(previewImg);
      previewEl.append(media);
      document.body.append(previewEl);
    }

    function stopRaf() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      lastTime = 0;
    }

    function applyTransform() {
      if (!previewEl) return;
      previewEl.style.transform = `translate3d(${currX.toFixed(1)}px, ${currY.toFixed(1)}px, 0)`;
    }

    function tick(now) {
      rafId = 0;
      if (!previewEl || !activeRow) return;
      const dt = lastTime ? (now - lastTime) / 1000 : 1 / 60;
      lastTime = now;
      const alpha = 1 - Math.exp(-12 * Math.min(dt, 0.05));
      currX += (targetX - currX) * alpha;
      currY += (targetY - currY) * alpha;
      applyTransform();
      if (Math.abs(targetX - currX) > 0.3 || Math.abs(targetY - currY) > 0.3) {
        rafId = requestAnimationFrame(tick);
      } else {
        currX = targetX;
        currY = targetY;
        applyTransform();
        lastTime = 0;
      }
    }

    function startRaf() {
      if (!rafId) {
        lastTime = 0;
        rafId = requestAnimationFrame(tick);
      }
    }

    function hidePreview() {
      activeRow = null;
      pointerActive = false;
      hasCoords = false;
      stopRaf();
      if (previewEl) previewEl.classList.remove('is-visible');
    }

    function computeTarget(row, clientX, clientY, fromFocus = false) {
      if (!previewEl) return false;
      const leftEl = row.querySelector('[data-rec-corridor-left]');
      const rightEl = row.querySelector('[data-rec-corridor-right]');
      if (!leftEl || !rightEl) return false;

      const plateW = previewEl.offsetWidth || 200;
      const plateH = previewEl.offsetHeight || 150;
      const leftRect = leftEl.getBoundingClientRect();
      const rightRect = rightEl.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();

      const minGap = 18;
      const corridorLeft = leftRect.right + minGap;
      const corridorRight = rightRect.left - minGap;
      const corridorW = corridorRight - corridorLeft;

      // Never cover row text or action button; hide cleanly if the open corridor is too tight.
      if (corridorW < plateW + 6) return false;

      const baseX = corridorLeft + (corridorW - plateW) / 2;
      const slack = Math.min(28, corridorW - plateW);
      const offsetX = fromFocus || !Number.isFinite(clientX)
        ? 0
        : (((clientX - rowRect.left) / Math.max(1, rowRect.width)) - 0.5) * slack;
      const nextX = clamp(baseX + offsetX, corridorLeft, corridorRight - plateW);

      const navEl = document.querySelector('[data-header]');
      const navBottom = navEl ? Math.max(0, navEl.getBoundingClientRect().bottom) : 56;
      const minY = navBottom + 16;
      const maxY = Math.max(minY, window.innerHeight - plateH - 16);
      const anchorY = fromFocus || !Number.isFinite(clientY)
        ? rowRect.top + rowRect.height / 2 - plateH / 2
        : clientY - plateH / 2;
      const nextY = clamp(anchorY, minY, maxY);

      targetX = nextX;
      targetY = nextY;
      return true;
    }

    function showRow(row, clientX, clientY, { fromFocus = false } = {}) {
      if (!canPreview()) {
        hidePreview();
        return;
      }
      const src = row.getAttribute('data-preview-src');
      if (!src) return;

      ensurePreview();
      if (currentSrc !== src && previewImg) {
        currentSrc = src;
        previewImg.style.objectPosition = row.getAttribute('data-preview-pos') || 'center';
        previewImg.src = src;
      }

      const fits = computeTarget(row, clientX, clientY, fromFocus);
      if (!fits) {
        hidePreview();
        return;
      }

      const fresh = activeRow === null || !hasCoords || fromFocus;
      activeRow = row;
      if (fresh) {
        currX = targetX;
        currY = targetY;
        hasCoords = true;
        applyTransform();
      } else {
        startRaf();
      }
      previewEl.classList.add('is-visible');
    }

    /* Warm preview images once Recognition enters the vicinity on desktop fine pointer */
    let preloaded = false;
    function preloadPreviews() {
      if (preloaded || !canPreview()) return;
      preloaded = true;
      for (const row of rows) {
        const src = row.getAttribute('data-preview-src');
        if (!src) continue;
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
      }
    }

    const recSection = document.getElementById('recognition');
    if (recSection && 'IntersectionObserver' in window) {
      const warmIo = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        preloadPreviews();
        warmIo.disconnect();
      }, { rootMargin: '320px 0px' });
      warmIo.observe(recSection);
    }

    for (const row of rows) {
      row.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse' || !canPreview()) return;
        pointerActive = true;
        showRow(row, e.clientX, e.clientY, { fromFocus: false });
      });

      row.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse' || !canPreview()) return;
        pointerActive = true;
        showRow(row, e.clientX, e.clientY, { fromFocus: false });
      });

      row.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        const nextRow = e.relatedTarget instanceof Element ? e.relatedTarget.closest('[data-rec-row]') : null;
        if (nextRow && rows.includes(nextRow)) return;
        pointerActive = false;
        hidePreview();
      });

      row.addEventListener('focusin', (e) => {
        if (!canPreview() || pointerActive) return;
        const target = e.target;
        if (!(target instanceof Element)) return;
        const visibleFocus = target.matches(':focus-visible');
        if (!visibleFocus) return;
        showRow(row, NaN, NaN, { fromFocus: true });
      });

      row.addEventListener('focusout', (e) => {
        const next = e.relatedTarget instanceof Element ? e.relatedTarget.closest('[data-rec-row]') : null;
        if (next && rows.includes(next)) return;
        if (!pointerActive) hidePreview();
      });
    }

    /* Dismiss cleanly on scroll, Escape, lightbox open, or capability changes */
    window.addEventListener('scroll', () => {
      if (activeRow) hidePreview();
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && activeRow) hidePreview();
    });

    document.addEventListener('viewer:open', hidePreview);

    const onEnvChange = () => {
      if (!canPreview()) hidePreview();
    };
    try { fineMQ.addEventListener('change', onEnvChange); } catch {}
    try { desktopMQ.addEventListener('change', onEnvChange); } catch {}
    onMotionPreferenceChange(onEnvChange);
  } catch {}
}
