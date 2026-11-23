// Direction C: Kinetic. Entry point.
import { initTheme } from './theme.js';
import { runLoader } from './loader.js';
import { initName } from './name.js';
import { initField } from './field.js';
import { initScroll } from './scroll.js';
import { initGallery } from './gallery.js';

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);

function release() {
  root.classList.remove('is-pending');
  root.classList.remove('is-loading');
  root.style.overflow = '';
}

function initMenu() {
  const btn = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (!btn || !menu) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.setAttribute('data-open', '')));
    } else {
      menu.removeAttribute('data-open');
      setTimeout(() => { if (!menu.hasAttribute('data-open')) menu.hidden = true; }, 340);
    }
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
}

function heroEntrance({ gsap, withChars, name }) {
  const h1 = $('[data-name]');
  const chars = name.chars;
  const parts = document.querySelectorAll('[data-hero] [data-enter]');
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if (withChars) {
    h1.classList.add('is-masked');
    gsap.set(chars, { yPercent: 118, fontWeight: 700 });
    tl.to(chars, { yPercent: 0, duration: 1.15, stagger: 0.035 }, 0.05)
      .to(chars, { fontWeight: 500, duration: 1.1, ease: 'power2.out', stagger: 0.035 }, 0.35);
  }
  gsap.set('[data-plane]', { opacity: 0, scale: 1.035 });
  gsap.set('[data-nav]', { opacity: 0, y: -12 });
  gsap.set(parts, { opacity: 0, y: 22 });
  root.classList.remove('is-pending');
  tl.to('[data-plane]', { opacity: 1, scale: 1, duration: 1.5 }, withChars ? 0.15 : 0.1)
    .to('[data-nav]', { opacity: 1, y: 0, duration: 0.9 }, withChars ? 0.5 : 0.35)
    .to(parts, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, withChars ? 0.55 : 0.3)
    .add(() => {
      h1.classList.remove('is-masked');
      gsap.set(chars, { clearProps: 'fontWeight' });
      gsap.set(['[data-plane]', '[data-nav]', ...parts], { clearProps: 'opacity,transform' });
      name.enable();
    });
  return tl;
}

function boot() {
  initMenu();
  document.querySelectorAll('[data-gallery]').forEach((g) => initGallery(g, { reduce }));

  const field = initField($('[data-plane]'), { reduce });
  initTheme({ onChange: () => field.refreshColors() });
  const name = initName($('[data-name]'), { reduce });

  const { gsap } = window;
  if (!gsap || !window.ScrollTrigger || !window.SplitText) {
    // Libraries missing: everything stays visible and usable without the choreography
    release();
    name.enable();
    return;
  }

  initScroll({ reduce, field, name });

  if (reduce) { release(); return; }

  if (root.classList.contains('is-loading')) {
    runLoader({
      chars: name.chars,
      onExit: () => heroEntrance({ gsap, withChars: false, name }),
    }).then(() => window.ScrollTrigger.refresh());
  } else if (root.classList.contains('is-pending')) {
    heroEntrance({ gsap, withChars: true, name });
  } else {
    name.enable();
  }
}

try {
  boot();
} catch (err) {
  release();
  throw err;
}
