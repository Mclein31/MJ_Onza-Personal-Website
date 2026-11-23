/*
 * scrollbar.js: custom page scrollbar rail (Instrument redesign v5). Owner: S2 scrollbar.
 * Must never throw; no-op on touch / coarse pointers and when hooks are absent.
 */
import { getLenis, scrollTo, isScrollLocked } from '../core/motion.js';

const SECTIONS = [
  { id: 'top', label: 'Top' },
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'journey', label: 'Journey' },
  { id: 'activity', label: 'Activity' },
  { id: 'stack', label: 'Stack' },
  { id: 'recognition', label: 'Recognition' },
  { id: 'training', label: 'Training' },
  { id: 'contact', label: 'Contact' },
];

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

let initialized = false;

export function init() {
  if (initialized) return;
  try {
    const root = document.documentElement;
    if (!document.body || typeof matchMedia !== 'function') return;
    initialized = true;

    const fineMQ = matchMedia('(pointer: fine)');
    const darkMQ = matchMedia('(prefers-color-scheme: dark)');

    let mounted = false;
    let railEl = null;
    let trackEl = null;
    let thumbEl = null;
    let aboutEl = null;
    let ticks = [];
    let activeId = 'top';

    let docH = 0;
    let vh = 0;
    let maxScroll = 0;
    let trackTop = 0;
    let trackH = 0;
    let thumbH = 28;
    let maxThumbY = 0;
    let currentThumbY = 0;
    let aboutTop = 0;
    let aboutBottom = 0;
    let lastHeightPx = '';

    let dragging = false;
    let dragPointerId = null;
    let dragStartY = 0;
    let dragStartThumbY = 0;
    let justDragged = false;

    let measureRaf = 0;
    let scrollRaf = 0;
    let lenisUnsub = null;
    let ro = null;
    let cleanups = [];

    const isDark = () => {
      const theme = root.getAttribute('data-theme');
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
      return !!darkMQ.matches;
    };

    function updateActiveTick(id) {
      activeId = id || 'top';
      for (const item of ticks) {
        item.tickEl.classList.toggle('is-active', item.id === activeId);
      }
    }

    function render(scrollPos) {
      if (!mounted || !thumbEl || !railEl) return;
      if (scrollPos > maxScroll + 1 && !measureRaf) scheduleMeasure();

      const progress = maxScroll > 0 ? clamp(scrollPos / maxScroll, 0, 1) : 0;
      currentThumbY = progress * maxThumbY;
      thumbEl.style.transform = `translate3d(0, ${currentThumbY.toFixed(2)}px, 0)`;

      const dark = isDark();
      const thumbMidDocY = scrollPos + trackTop + currentThumbY + thumbH / 2;
      const onInk = !dark && aboutBottom > aboutTop && thumbMidDocY >= aboutTop && thumbMidDocY <= aboutBottom;
      thumbEl.classList.toggle('is-on-ink', onInk);
    }

    function measure() {
      measureRaf = 0;
      if (!mounted || !trackEl || !thumbEl || !railEl) return;

      vh = window.innerHeight || root.clientHeight || 0;
      docH = root.scrollHeight || 0;
      maxScroll = Math.max(0, docH - vh);

      const rect = trackEl.getBoundingClientRect();
      trackTop = rect.top;
      trackH = rect.height;

      if (maxScroll <= 1 || trackH <= 0) {
        railEl.classList.add('is-hidden');
        return;
      }
      railEl.classList.remove('is-hidden');

      thumbH = Math.min(trackH, Math.max(28, Math.round((vh / docH) * trackH)));
      maxThumbY = Math.max(0, trackH - thumbH);
      const heightPx = `${thumbH}px`;
      if (heightPx !== lastHeightPx) {
        thumbEl.style.height = heightPx;
        lastHeightPx = heightPx;
      }

      const sy = window.scrollY;
      for (const item of ticks) {
        const secTop = item.id === 'top' ? 0 : Math.max(0, item.el.getBoundingClientRect().top + sy);
        const tickY = docH > 0 ? clamp((secTop / docH) * trackH, 0, trackH) : 0;
        item.secTop = secTop;
        item.tickY = tickY;
        item.tickEl.style.transform = `translate3d(0, ${tickY.toFixed(1)}px, 0)`;
      }

      if (aboutEl) {
        const ar = aboutEl.getBoundingClientRect();
        aboutTop = ar.top + sy;
        aboutBottom = ar.bottom + sy;
      } else {
        aboutTop = 0;
        aboutBottom = 0;
      }

      render(sy);
    }

    function scheduleMeasure() {
      if (!mounted || measureRaf) return;
      measureRaf = requestAnimationFrame(measure);
    }

    function scheduleScrollRender() {
      if (!mounted || dragging || scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        if (!dragging) render(window.scrollY);
      });
    }

    function bindLenis() {
      if (typeof lenisUnsub === 'function') {
        try { lenisUnsub(); } catch {}
      }
      lenisUnsub = null;
      const lenis = getLenis();
      if (!lenis || typeof lenis.on !== 'function') return;
      const unsub = lenis.on('scroll', () => {
        if (!dragging) render(window.scrollY);
      });
      if (typeof unsub === 'function') lenisUnsub = unsub;
    }

    function onDragMove(e) {
      if (!dragging || e.pointerId !== dragPointerId) return;
      const deltaY = e.clientY - dragStartY;
      const nextThumbY = clamp(dragStartThumbY + deltaY, 0, maxThumbY);
      const targetScroll = maxThumbY > 0 ? (nextThumbY / maxThumbY) * maxScroll : 0;

      const lenis = getLenis();
      if (lenis) lenis.scrollTo(targetScroll, { immediate: true });
      else window.scrollTo(0, targetScroll);

      render(targetScroll);
    }

    function endDrag(e) {
      if (!dragging) return;
      if (e && typeof e.pointerId === 'number' && e.pointerId !== dragPointerId) return;
      dragging = false;
      const pid = dragPointerId;
      dragPointerId = null;

      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);

      if (thumbEl && pid !== null) {
        try {
          if (thumbEl.hasPointerCapture?.(pid)) thumbEl.releasePointerCapture(pid);
        } catch {}
      }
      railEl?.classList.remove('is-dragging');
      root.classList.remove('is-scrollbar-dragging');

      justDragged = true;
      setTimeout(() => { justDragged = false; }, 0);
      render(window.scrollY);
    }

    function mount() {
      if (mounted) return;
      const available = SECTIONS
        .map((s) => ({ ...s, el: document.getElementById(s.id) }))
        .filter((s) => s.el);
      if (!available.length) return;

      mounted = true;
      aboutEl = document.getElementById('about');

      railEl = document.createElement('div');
      railEl.className = 'sbar';
      railEl.setAttribute('data-scrollbar', '');
      railEl.setAttribute('aria-hidden', 'true');

      trackEl = document.createElement('div');
      trackEl.className = 'sbar__track';
      trackEl.setAttribute('data-scrollbar-track', '');

      const lineEl = document.createElement('span');
      lineEl.className = 'sbar__line';

      const ticksWrap = document.createElement('div');
      ticksWrap.className = 'sbar__ticks';
      ticksWrap.setAttribute('data-scrollbar-ticks', '');

      ticks = available.map((s) => {
        const tickEl = document.createElement('div');
        tickEl.className = 'sbar__tick';
        tickEl.setAttribute('data-scrollbar-tick', s.id);

        const markEl = document.createElement('span');
        markEl.className = 'sbar__tick-mark';

        const labelEl = document.createElement('span');
        labelEl.className = 'sbar__tick-label';
        labelEl.textContent = s.label;

        tickEl.append(markEl, labelEl);
        ticksWrap.append(tickEl);

        tickEl.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isScrollLocked()) return;
          scrollTo(s.id === 'top' ? 0 : `#${s.id}`);
        });

        return { id: s.id, label: s.label, el: s.el, tickEl, secTop: 0, tickY: 0 };
      });

      thumbEl = document.createElement('div');
      thumbEl.className = 'sbar__thumb';
      thumbEl.setAttribute('data-scrollbar-thumb', '');

      const thumbBarEl = document.createElement('span');
      thumbBarEl.className = 'sbar__thumb-bar';
      thumbEl.append(thumbBarEl);

      trackEl.append(lineEl, ticksWrap, thumbEl);
      railEl.append(trackEl);
      document.body.append(railEl);

      const add = (target, type, fn, opts) => {
        target.addEventListener(type, fn, opts);
        cleanups.push(() => target.removeEventListener(type, fn, opts));
      };

      add(thumbEl, 'pointerdown', (e) => {
        if (e.button !== 0 || isScrollLocked() || maxScroll <= 0) return;
        e.preventDefault();
        e.stopPropagation();
        measure();
        if (maxScroll <= 0 || maxThumbY <= 0) return;

        dragging = true;
        dragPointerId = e.pointerId;
        dragStartY = e.clientY;
        dragStartThumbY = currentThumbY;

        railEl.classList.add('is-dragging');
        root.classList.add('is-scrollbar-dragging');
        try { thumbEl.setPointerCapture(e.pointerId); } catch {}

        window.addEventListener('pointermove', onDragMove);
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);
      });

      add(thumbEl, 'lostpointercapture', endDrag);

      add(trackEl, 'click', (e) => {
        if (justDragged || isScrollLocked() || maxScroll <= 0) return;
        if (e.target instanceof Element && (e.target.closest('[data-scrollbar-thumb]') || e.target.closest('[data-scrollbar-tick]'))) {
          return;
        }
        measure();
        if (maxScroll <= 0 || maxThumbY <= 0) return;
        const desiredThumbY = clamp(e.clientY - trackTop - thumbH / 2, 0, maxThumbY);
        const targetScroll = Math.round((desiredThumbY / maxThumbY) * maxScroll);
        scrollTo(targetScroll, { duration: 0.45 });
      });

      add(window, 'scroll', scheduleScrollRender, { passive: true });
      add(window, 'resize', scheduleMeasure, { passive: true });
      add(window, 'load', scheduleMeasure, { once: true });

      add(document, 'motion:change', () => {
        bindLenis();
        scheduleMeasure();
      });
      add(document, 'motion:refresh', scheduleMeasure);
      add(document, 'activity:ready', scheduleMeasure);
      add(document, 'intro:done', scheduleMeasure);
      add(document, 'theme:change', () => render(window.scrollY));
      add(document, 'scroll:lock', () => endDrag());
      add(document, 'scroll:unlock', scheduleMeasure);
      add(document, 'nav:change', (e) => updateActiveTick(e.detail?.id || 'top'));

      try {
        document.fonts?.ready?.then(() => scheduleMeasure());
      } catch {}

      try {
        ro = new ResizeObserver(scheduleMeasure);
        ro.observe(document.body);
      } catch {}

      const currentLink = document.querySelector('[data-nav][aria-current="location"]');
      const currentHref = currentLink?.getAttribute('href') || '';
      updateActiveTick(currentHref.startsWith('#') ? currentHref.slice(1) : 'top');

      bindLenis();
      measure();
    }

    function unmount() {
      if (!mounted) return;
      endDrag();
      mounted = false;
      if (measureRaf) { cancelAnimationFrame(measureRaf); measureRaf = 0; }
      if (scrollRaf) { cancelAnimationFrame(scrollRaf); scrollRaf = 0; }
      if (typeof lenisUnsub === 'function') {
        try { lenisUnsub(); } catch {}
      }
      lenisUnsub = null;
      try { ro?.disconnect(); } catch {}
      ro = null;
      for (const fn of cleanups) { try { fn(); } catch {} }
      cleanups = [];
      railEl?.remove();
      railEl = null;
      trackEl = null;
      thumbEl = null;
      aboutEl = null;
      ticks = [];
      lastHeightPx = '';
    }

    const syncMount = () => {
      if (fineMQ.matches) mount();
      else unmount();
    };

    try { fineMQ.addEventListener('change', syncMount); } catch {}
    try { darkMQ.addEventListener('change', () => { if (mounted) render(window.scrollY); }); } catch {}

    syncMount();
  } catch {}
}
