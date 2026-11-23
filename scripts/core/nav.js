/**
 * nav.js: header behaviour. Scroll-spy, hide-on-scroll-down / show-on-scroll-up, the phone menu and in-page
 * anchor routing. Behaviour only: the design styles everything from the state classes below.
 * Never throws; every feature switches itself off when its hooks are absent.
 *
 * HOOKS READ
 *   [data-header]         the fixed header (receives is-hidden / is-scrolled). If :root --header-h is not defined
 *                         in CSS, this module measures the header and sets it (and keeps it updated); a CSS
 *                         definition always wins.
 *   [data-hero]           the hero block. The header only hides once the scroll position is past its bottom edge
 *                         (fallback threshold: 200px).
 *   [data-nav]            nav links (href="#section-id"), in the header and/or the menu. Section ids are taken
 *                         from them; each link gets aria-current="location" + is-current while its section is active.
 *   [data-menu-toggle]    button(s) that open/close the menu (aria-expanded, aria-controls kept in sync)
 *   [data-menu]           the menu panel (a link list, or a full-screen sheet). Closed menus must be hidden from
 *                         focus by the design (visibility:hidden / display:none under the phone breakpoint).
 *   [data-menu-close]     optional extra close buttons inside the menu
 *   [data-menu-inert]     optional, any number: made `inert` while the menu is open (main, footer, ...)
 *   a[href="#id"]         EVERY in-page anchor (also skip links, brand, buttons) is routed through
 *                         motion.scrollTo (header offset, Lenis or native smooth, instant if reduced), updates
 *                         the URL hash and moves focus to the target. Same-page absolute URLs count too.
 *                         Modified clicks (cmd/ctrl/shift/alt, middle button) and target=_blank are left alone.
 *
 * STATE CLASSES
 *   header[data-header]   is-hidden (scrolled down past the hero), is-scrolled (not at the very top)
 *   [data-nav]            is-current   (+ aria-current="location")
 *   html                  is-menu-open
 *   [data-menu] and [data-menu-toggle]   is-open
 *
 * EVENTS (dispatched on document)
 *   nav:change    detail { id, previous, link }   the active section changed (id null above the first section)
 *   menu:change   detail { open }
 *
 * BEHAVIOUR NOTES
 *   - Scroll-spy: an IntersectionObserver watches a thin band ~35% down the viewport (below the header); the last
 *     section in document order crossing the band is current. At the very bottom of the page the last section is
 *     current even if it is too short to reach the band. Rebuilt on resize and on `motion:refresh`.
 *   - The header always shows near the top, while the menu is open, and while focus is inside it.
 *   - Menu: opening locks scroll (motion.lockScroll), moves focus to the first menu link, traps Tab / Shift+Tab
 *     inside {toggle(s) + menu}, Escape closes and returns focus to the opener, a click on any link in the menu
 *     closes it (scroll is unlocked first so the anchor scroll runs), a pointer press outside closes it, and it
 *     closes by itself when the toggle stops being visible (resized to desktop).
 *
 * API
 *   initNav(options?)  -> controller   options: { initialHash = true }   (idempotent: returns the same controller)
 *   controller: { openMenu(), closeMenu(), toggleMenu(), isMenuOpen(), current(), refresh(), destroy() }
 *   Also exported directly: openMenu, closeMenu, toggleMenu, isMenuOpen
 */

import { scrollTo, lockScroll, unlockScroll, isScrollLocked, headerHeight } from './motion.js';

const root = document.documentElement;
const FOCUSABLE = 'a[href],button,input,select,textarea,summary,[tabindex]';
let instance = null;

const emit = (name, detail) => { try { document.dispatchEvent(new CustomEvent(name, { detail })); } catch {} };
const visible = (el) => {
  try { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'; } catch { return false; }
};
const focusables = (scope) => [...scope.querySelectorAll(FOCUSABLE)].filter((el) => !el.disabled && el.tabIndex >= 0 && visible(el));

/** Same-page hash target of a link: string id ('' = top), or null when the link goes elsewhere. */
function hashOf(a) {
  try {
    const raw = a.getAttribute('href');
    if (raw === null) return null;
    if (raw === '#') return '';
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname !== location.pathname || u.search !== location.search || !u.hash) return null;
    return decodeURIComponent(u.hash.slice(1));
  } catch { return null; }
}

export function initNav({ initialHash = true } = {}) {
  if (instance) return instance;
  const noop = { openMenu() {}, closeMenu() {}, toggleMenu() {}, isMenuOpen: () => false, current: () => null, refresh() {}, destroy() {} };
  try {
    const header = document.querySelector('[data-header]');
    const hero = document.querySelector('[data-hero]');
    const links = [...document.querySelectorAll('[data-nav]')];
    const toggles = [...document.querySelectorAll('[data-menu-toggle]')];
    const menu = document.querySelector('[data-menu]');
    const cleanups = [];
    const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); cleanups.push(() => target.removeEventListener(type, fn, opts)); };

    /* ---------- --header-h ---------- */
    if (header) {
      let owns = false;
      try { owns = !getComputedStyle(root).getPropertyValue('--header-h').trim(); } catch {}
      if (owns) {
        const set = () => root.style.setProperty('--header-h', `${header.offsetHeight}px`);
        set();
        try { const ro = new ResizeObserver(set); ro.observe(header); cleanups.push(() => ro.disconnect()); } catch {}
        cleanups.push(() => root.style.removeProperty('--header-h'));
      }
    }

    /* ---------- scroll-spy ---------- */
    let currentId = null;
    let io = null;
    let targets = [];
    let band = 0;
    let firstTop = 0;
    let heroEnd = 200;
    const inBand = new Set();

    const idOf = (a) => { const h = hashOf(a); return h ? h : null; };

    function setCurrent(id) {
      if (id === currentId) return;
      const previous = currentId;
      currentId = id;
      let active = null;
      links.forEach((a) => {
        const is = id !== null && idOf(a) === id;
        a.classList.toggle('is-current', is);
        if (is) { a.setAttribute('aria-current', 'location'); active = active || a; } else a.removeAttribute('aria-current');
      });
      emit('nav:change', { id, previous, link: active });
    }

    function evaluate() {
      const y = window.scrollY;
      if (targets.length && y + innerHeight >= root.scrollHeight - 2 && y > 0) { setCurrent(targets[targets.length - 1].id); return; }
      let pick = null;
      for (const el of targets) if (inBand.has(el)) pick = el;
      if (pick) setCurrent(pick.id);
      else if (!targets.length || y + band < firstTop) setCurrent(null);
    }

    function buildSpy() {
      try { io?.disconnect(); } catch {}
      inBand.clear();
      const ids = [...new Set(links.map(idOf).filter(Boolean))];
      targets = ids.map((id) => document.getElementById(id)).filter(Boolean)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      if (hero) heroEnd = hero.getBoundingClientRect().bottom + window.scrollY - headerHeight();
      if (!targets.length) return;
      const vh = innerHeight;
      band = Math.round(Math.max(headerHeight() + 16, vh * 0.35));
      firstTop = targets[0].getBoundingClientRect().top + window.scrollY;
      try {
        io = new IntersectionObserver((entries) => {
          entries.forEach((e) => (e.isIntersecting ? inBand.add(e.target) : inBand.delete(e.target)));
          evaluate();
        }, { rootMargin: `-${band}px 0px -${Math.max(0, vh - band - 8)}px 0px`, threshold: 0 });
        targets.forEach((t) => io.observe(t));
      } catch {}
    }

    /* ---------- hide / show header ---------- */
    let lastY = window.scrollY, ref = lastY, dir = 0, hidden = false, ticking = false;
    let jumping = false;   // a goTo()/land() scroll is running: the header stays shown (a hidden one leaves a blank band)

    function setHidden(h) {
      if (!header || h === hidden) return;
      hidden = h;
      header.classList.toggle('is-hidden', h);
    }

    function onScrollFrame() {
      ticking = false;
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 8);
      if (header) {
        if (menuOpen || jumping || y <= heroEnd || header.matches(':focus-within')) { setHidden(false); dir = 0; }
        else if (y > lastY) { if (dir !== 1) { dir = 1; ref = lastY; } if (y - ref > 8) setHidden(true); }
        else if (y < lastY) { if (dir !== -1) { dir = -1; ref = lastY; } if (ref - y > 8) setHidden(false); }
      }
      lastY = y;
      if (targets.length) evaluate();
    }
    on(window, 'scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); } }, { passive: true });
    if (header) on(header, 'focusin', () => setHidden(false));

    /* ---------- menu ---------- */
    let menuOpen = false;
    let opener = null;

    const trapSet = () => {
      const set = [...toggles.filter(visible), ...(menu ? focusables(menu) : [])];
      return set.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    };
    const inertEls = () => [...document.querySelectorAll('[data-menu-inert]')];

    function syncToggles() {
      toggles.forEach((t) => {
        t.setAttribute('aria-expanded', String(menuOpen));
        t.classList.toggle('is-open', menuOpen);
        if (menu && menu.id && !t.hasAttribute('aria-controls')) t.setAttribute('aria-controls', menu.id);
      });
    }

    function openMenu() {
      if (!menu || menuOpen || !toggles.some(visible)) return;
      menuOpen = true;
      opener = toggles.find((t) => t === document.activeElement) || toggles.find(visible) || null;
      menu.classList.add('is-open');
      root.classList.add('is-menu-open');
      syncToggles();
      inertEls().forEach((el) => { try { el.inert = true; } catch {} });
      lockScroll('menu');
      setHidden(false);
      const focusFirst = () => {
        if (menu.contains(document.activeElement)) return;
        const first = focusables(menu)[0];
        if (first) first.focus({ preventScroll: true });
      };
      focusFirst();
      if (!menu.contains(document.activeElement)) setTimeout(focusFirst, 60);   // design still flipping visibility
      emit('menu:change', { open: true });
    }

    function closeMenu(restoreFocus = true) {
      if (!menu || !menuOpen) return;
      menuOpen = false;
      menu.classList.remove('is-open');
      root.classList.remove('is-menu-open');
      syncToggles();
      inertEls().forEach((el) => { try { el.inert = false; } catch {} });
      unlockScroll('menu');
      if (restoreFocus && opener && visible(opener)) opener.focus({ preventScroll: true });
      opener = null;
      emit('menu:change', { open: false });
    }

    const toggleMenu = () => (menuOpen ? closeMenu() : openMenu());

    if (menu) {
      syncToggles();
      toggles.forEach((t) => on(t, 'click', (e) => { e.preventDefault(); toggleMenu(); }));
      on(menu, 'click', (e) => { if (e.target instanceof Element && e.target.closest('[data-menu-close]')) closeMenu(); });

      on(document, 'keydown', (e) => {
        if (!menuOpen) return;
        if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
        if (e.key !== 'Tab') return;
        const set = trapSet();
        if (!set.length) { e.preventDefault(); return; }
        const first = set[0], last = set[set.length - 1];
        const i = set.indexOf(document.activeElement);
        if (i === -1) { e.preventDefault(); first.focus({ preventScroll: true }); }
        else if (e.shiftKey && i === 0) { e.preventDefault(); last.focus({ preventScroll: true }); }
        else if (!e.shiftKey && i === set.length - 1) { e.preventDefault(); first.focus({ preventScroll: true }); }
      });
      on(document, 'focusin', (e) => {
        if (!menuOpen || !(e.target instanceof Node)) return;
        if (!trapSet().some((el) => el === e.target || el.contains(e.target))) {
          const first = trapSet()[0];
          if (first) first.focus({ preventScroll: true });
        }
      });
      on(document, 'pointerdown', (e) => {
        if (!menuOpen || !(e.target instanceof Node)) return;
        if (menu.contains(e.target) || toggles.some((t) => t.contains(e.target))) return;
        closeMenu(false);
      });
    }

    /* ---------- anchor routing ---------- */
    /* A jump can end short: lazy images load while it runs, motion.js refreshes ScrollTrigger and that cancels a
       native smooth scroll (or the layout above the target grows under it). Once the scroll has been still for a
       moment, aim again, up to 4 times, unless the visitor took over the scroll themselves. */
    let landToken = 0;
    function land(el) {
      const token = ++landToken;
      jumping = true;                                   // keeps the header on screen for the whole jump
      setHidden(false);
      let mine = true;
      const stop = () => { mine = false; };
      const evs = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
      evs.forEach((t) => window.addEventListener(t, stop, { once: true, passive: true }));
      const finish = () => {
        evs.forEach((t) => window.removeEventListener(t, stop));
        if (token === landToken) { jumping = false; ref = window.scrollY; dir = 0; }   // the jump itself must not count as a scroll-down
      };
      let tries = 0, lastY = -1, still = 0;
      const t0 = performance.now();
      const step = () => {
        if (token !== landToken || !mine || performance.now() - t0 > 6000) { finish(); return; }
        const y = window.scrollY;
        if (el && Math.abs(el.getBoundingClientRect().top - headerHeight()) <= 6) { finish(); return; }   // arrived
        still = Math.abs(y - lastY) < 1 ? still + 1 : 0;
        lastY = y;
        if (still >= 3 && !isScrollLocked()) {
          const off = el ? el.getBoundingClientRect().top - headerHeight() : -y;
          const max = Math.max(0, root.scrollHeight - innerHeight);
          if (Math.abs(off) > 6 && !(y >= max - 2 && off > 0) && !(!el && y <= 1)) {
            if (++tries > 4) { finish(); return; }
            scrollTo(el || 0, { immediate: tries > 1 });
            still = 0;
          } else { finish(); return; }
        }
        setTimeout(step, 120);
      };
      setTimeout(step, 200);
    }

    function goTo(id, { immediate = false, focus = true, push = true } = {}) {
      const el = id ? document.getElementById(id) : null;
      if (id && !el) return false;
      const ok = scrollTo(el || 0, { immediate });
      if (!ok) return false;
      if (push) { try { const hash = id ? `#${encodeURIComponent(id)}` : location.pathname + location.search; if (id ? location.hash !== hash : location.hash) history.pushState(null, '', hash); } catch {} }
      land(el);
      if (focus && el) {
        try {
          if (el.tabIndex < 0 && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
          el.focus({ preventScroll: true });
        } catch {}
      }
      return true;
    }

    on(document, 'click', (e) => {
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a) return;
      const inMenu = !!(menu && menu.contains(a));
      const modified = e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      const away = a.target === '_blank' || a.hasAttribute('download');
      if (inMenu && !modified && !away) closeMenu(false);
      if (modified || away) return;
      const id = hashOf(a);
      if (id === null) return;
      if (id && !document.getElementById(id)) return;   // unknown hash: let the browser handle it
      e.preventDefault();
      // From the menu: the scroll lock was just released (overflow:hidden on <html> without Lenis). WebKit drops a
      // smooth scroll that starts in the same task, so wait a frame first.
      if (inMenu) requestAnimationFrame(() => requestAnimationFrame(() => goTo(id)));
      else goTo(id);
    });

    on(window, 'popstate', () => {
      const id = decodeURIComponent(location.hash.slice(1));
      goTo(id, { push: false, focus: false });
    });

    /* ---------- lifecycle ---------- */
    let resizeTimer = 0;
    const rebuild = () => { buildSpy(); evaluate(); onScrollFrame(); };
    on(window, 'resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (menuOpen && !toggles.some(visible)) closeMenu(false);
        rebuild();
      }, 150);
    });
    on(document, 'motion:refresh', rebuild);

    buildSpy();
    onScrollFrame();

    if (initialHash && location.hash.length > 1) {
      const go = () => goTo(decodeURIComponent(location.hash.slice(1)), { immediate: true, focus: false, push: false });
      if (document.readyState === 'complete') go(); else on(window, 'load', go, { once: true });
    }

    instance = {
      openMenu, closeMenu: () => closeMenu(), toggleMenu, isMenuOpen: () => menuOpen, current: () => currentId, refresh: rebuild,
      destroy() {
        clearTimeout(resizeTimer);
        try { io?.disconnect(); } catch {}
        closeMenu(false);
        cleanups.forEach((fn) => { try { fn(); } catch {} });
        instance = null;
      },
    };
    return instance;
  } catch {
    return noop;
  }
}

export const openMenu = () => instance?.openMenu();
export const closeMenu = () => instance?.closeMenu();
export const toggleMenu = () => instance?.toggleMenu();
export const isMenuOpen = () => !!instance?.isMenuOpen();
