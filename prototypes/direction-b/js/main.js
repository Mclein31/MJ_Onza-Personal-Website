import Lenis from '../vendor/lenis/lenis.js';
import { canUseGL, createExhibitGL } from './gl.js';

window.__exhibition = true;
const root = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
const motion = !reduceMQ.matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outQuart = (t) => 1 - Math.pow(1 - t, 4);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Words that rise out of a mask ---------- */
function splitWords(el) {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text.replace(/ /g, ' '));
  el.innerHTML = text.split(/ +/).map((w, i) =>
    `<span class="w" aria-hidden="true"><span style="--i:${i}">${w.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span></span>`
  ).join(' ');
  el.classList.add('is-split');
}
if (motion) $$('[data-words]').forEach(splitWords);

/* ---------- Theme: follows the OS until the visitor chooses ---------- */
const themeBtn = $('[data-theme-toggle]');
const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.getAttribute('data-theme') || (darkMQ.matches ? 'dark' : 'light');
let gl = null;
function syncThemeUI() {
  const dark = currentTheme() === 'dark';
  themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  $$('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#111214' : '#E9EAEC'));
  if (gl) gl.refreshTheme();
}
themeBtn.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  const apply = () => {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mjo-theme', next); } catch (e) { /* private mode */ }
    syncThemeUI();
  };
  if (document.startViewTransition && motion) document.startViewTransition(apply);
  else apply();
});
darkMQ.addEventListener('change', () => { if (!root.hasAttribute('data-theme')) syncThemeUI(); });
syncThemeUI();

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (motion) {
  lenis = new Lenis({ lerp: 0.11, anchors: { offset: 0 }, wheelMultiplier: 0.95 });
}

/* ---------- WebGL exhibits ---------- */
const heroExhibit = $('[data-hero-exhibit]');
const workRoom = $('#work');
const aboutRoom = $('#about');
let glReady = Promise.resolve();
if (motion && canUseGL()) {
  let resolveReady;
  glReady = new Promise((r) => { resolveReady = r; });
  gl = createExhibitGL($('[data-gl]'), { onReady: () => resolveReady() });
  if (gl) {
    gl.add(heroExhibit, { cover: workRoom, revealOnEnter: false });
    if (root.classList.contains('is-loading')) gl.hold(heroExhibit, true);
    setTimeout(() => resolveReady && resolveReady(), 1500);
    // the hero print first, the rest of the hang once it is up
    glReady.then(() => $$('.room--work [data-exhibit]').forEach((el) => {
      gl.add(el, { cover: aboutRoom });
      if (el.classList.contains('is-in')) gl.reveal(el);
    }));
  } else {
    glReady = Promise.resolve();
  }
}

/* ---------- Reveals ---------- */
const revealIO = new IntersectionObserver((entries) => {
  const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target);
  entering.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  entering.forEach((el, i) => {
    revealIO.unobserve(el);
    el.style.setProperty('--d', `${i * 80}ms`);
    const show = () => {
      el.classList.add('is-in');
      if (gl && el.hasAttribute('data-exhibit')) gl.reveal(el);
    };
    // a print is only unveiled once its picture is in hand (or after a short grace period)
    const img = el.hasAttribute('data-exhibit') && !el.classList.contains('is-gl') ? $('img', el) : null;
    if (img && !img.complete) {
      img.loading = 'eager';
      Promise.race([img.decode().catch(() => {}), wait(1200)]).then(show);
    } else show();
  });
}, { rootMargin: '0px 0px -10% 0px' });

function startReveals() {
  const hero = $('.hero');
  $('[data-words]', hero)?.classList.add('is-in');
  $$('[data-in]', hero).forEach((el, i) => {
    el.style.setProperty('--d', `${260 + i * 90}ms`);
    el.classList.add('is-in');
  });
  // the About heading is cued by the curtain (updateCovers), not by entering the viewport
  $$('[data-words], [data-in], [data-exhibit]')
    .filter((el) => !hero.contains(el) && !el.hasAttribute('data-curtain-words'))
    .forEach((el) => revealIO.observe(el));
}

/* ---------- Intro loader: flip through the work, then hang the last print in the hero ---------- */
async function runLoader() {
  const loader = $('[data-loader]');
  const exhibit = $('[data-loader-exhibit]');
  const slides = $$('[data-loader-slides] img');
  const nameEl = $('[data-loader-name]');
  const cap = $('.loader__cap');
  const t0 = performance.now();
  const BUDGET = 2450;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  lenis?.stop();

  await Promise.race([document.fonts.ready, wait(450)]);
  const STEP = 118;
  for (let i = 0; i < slides.length; i++) {
    const img = slides[i];
    const last = i === slides.length - 1;
    if (performance.now() - t0 > BUDGET - 1000 && !last) continue;
    if (!img.complete) await Promise.race([img.decode().catch(() => {}), wait(STEP)]);
    if (!img.naturalWidth && !last) continue;
    img.classList.add('is-flipping');
    img.getBoundingClientRect();
    img.classList.add('is-shown');
    // the caption changes when the new picture is half-way in, not before it starts to wipe
    setTimeout(() => { nameEl.textContent = img.dataset.name; }, 60);
    await wait(last ? 220 : STEP);
  }
  // the hero's own picture replaces the thumbnail so the print is sharp when it lands
  const heroImg = $('img', heroExhibit);
  const lastSlide = slides[slides.length - 1];
  const sharp = new Image();
  sharp.src = heroImg.currentSrc || heroImg.src;
  await Promise.race([sharp.decode().then(() => { lastSlide.src = sharp.src; }).catch(() => {}), wait(250)]);
  await Promise.race([glReady, wait(Math.max(0, BUDGET - 900 - (performance.now() - t0)))]);

  const from = exhibit.getBoundingClientRect();
  const to = heroExhibit.getBoundingClientRect();
  const s = to.width / from.width;
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const DUR = 860;
  cap.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(6px)' }], { duration: 160, easing: 'ease-out', fill: 'forwards' });
  const flip = exhibit.animate(
    [{ transform: 'translate3d(0,0,0) scale(1)' }, { transform: `translate3d(${dx}px, ${dy}px, 0) scale(${s})` }],
    { duration: DUR, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' }
  );
  // the wall behind is the same grey: the loader ground dissolves while the name rises
  const ground = loader.animate([{ backgroundColor: getComputedStyle(loader).backgroundColor }, { backgroundColor: 'transparent' }],
    { duration: 380, delay: DUR * 0.42, easing: 'ease-out', fill: 'forwards' });
  setTimeout(ready, DUR * 0.4);
  await Promise.race([flip.finished, wait(DUR + 200)]);
  await Promise.race([ground.finished, wait(300)]);
  root.classList.remove('is-loading');
  gl?.hold(heroExhibit, false);
  loader.remove();
  try { sessionStorage.setItem('mjo-exhibition', '1'); } catch (e) { /* ignore */ }
  lenis?.start();
}

let isReady = false;
function ready() {
  if (isReady) return;
  isReady = true;
  root.classList.add('is-ready');
  startReveals();
  lastY = -1; // re-run the scroll updaters once, so a page reloaded below the fold cues its curtain too
}

if (root.classList.contains('is-loading')) {
  runLoader().catch(() => { root.classList.remove('is-loading'); $('[data-loader]')?.remove(); lenis?.start(); ready(); });
} else {
  $('[data-loader]')?.remove();
  requestAnimationFrame(() => requestAnimationFrame(ready));
}
// never leave content waiting
setTimeout(() => {
  if (root.classList.contains('is-loading')) { root.classList.remove('is-loading'); $('[data-loader]')?.remove(); lenis?.start(); }
  gl?.hold(heroExhibit, false);
  ready();
}, 3000);

/* ---------- Rooms that slide over the previous one ---------- */
const stickRooms = motion ? [$('.hero'), workRoom] : [];
const coverOf = new Map([[$('.hero'), workRoom], [workRoom, aboutRoom]]);
function layoutSticky() {
  const vh = window.innerHeight;
  stickRooms.forEach((el) => {
    el.removeAttribute('data-stick');
    el.style.setProperty('--stick', `${Math.min(0, vh - el.offsetHeight)}px`);
  });
  updateSticky();
}
// A room only stays pinned while the next one is sliding over it. Once fully covered it is released to its
// place in the flow, which is above the screen by then, so the swap is never seen and nothing covered
// stays pinned (or keeps the WebGL loop awake) for the rest of the page.
function updateSticky() {
  stickRooms.forEach((el) => el.toggleAttribute('data-stick', coverOf.get(el).getBoundingClientRect().top > 0));
}

/* ---------- The zoom: framed print grows to near full bleed, then settles beside its label ---------- */
const zoom = $('[data-zoom]');
const piece = $('[data-zoom-piece]');
const pieceImg = $('img', piece);
const zcap = $('[data-zoom-cap]');
const zlabel = $('[data-zoom-label]');
const zItems = $$('[data-zl]');
let Z = null;
const scrubbable = () => motion && window.innerWidth >= 900 && window.innerHeight >= 560;

function layoutZoom() {
  zoom.classList.toggle('is-scrub', scrubbable());
  piece.style.transform = '';
  pieceImg.style.transform = '';
  zItems.forEach((el) => { el.style.opacity = ''; el.style.transform = ''; });
  if (!zoom.classList.contains('is-scrub')) { Z = null; return; }
  const W = document.documentElement.clientWidth;
  const H = window.innerHeight;
  const m = clamp(W * 0.024, 16, 44);
  const g = clamp(W * 0.016, 12, 28);
  piece.style.setProperty('--zw', '1000px');
  const A = piece.offsetHeight / piece.offsetWidth;
  const fw = Math.min(W - 2 * m, (H - 2 * m - 24) / A);
  piece.style.setProperty('--zw', `${fw}px`);
  const fh = fw * A;
  const w0 = clamp(W * 0.3, 300, 560);
  const s0 = w0 / fw;
  const y0 = -H * 0.03;
  const col = (W - 2 * m - 11 * g) / 12;
  const w2 = 7 * col + 6 * g;
  const s2 = w2 / fw;
  const x2 = W - m - w2 / 2 - W / 2;
  zcap.style.setProperty('--cap-top', `${H / 2 + y0 + (fh * s0) / 2 + 14}px`);
  Z = { W, H, fw, fh, s0, y0, s2, x2 };
}

function updateZoom() {
  if (!Z) return;
  const r = zoom.getBoundingClientRect();
  const p = clamp(-r.top / (r.height - Z.H), 0, 1);
  const a = inOut(seg(p, 0.02, 0.4));
  const b = inOut(seg(p, 0.52, 0.8));
  let s = lerp(Z.s0, 1, a);
  let x = 0;
  let y = lerp(Z.y0, 0, a);
  s = lerp(s, Z.s2, b);
  x = lerp(x, Z.x2, b);
  piece.style.transform = `translate3d(${(x - Z.fw / 2).toFixed(2)}px, ${(y - Z.fh / 2).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
  pieceImg.style.transform = `scale(${(1 + 0.07 * (1 - a)).toFixed(4)})`;
  zcap.style.opacity = (1 - seg(p, 0.02, 0.1)).toFixed(3);
  zItems.forEach((el, i) => {
    const t = outQuart(seg(p, 0.64 + i * 0.03, 0.8 + i * 0.03));
    el.style.opacity = t.toFixed(3);
    el.style.transform = t < 1 ? `translate3d(0, ${((1 - t) * 26).toFixed(1)}px, 0)` : '';
  });
  zlabel.style.pointerEvents = p > 0.7 ? '' : 'none';
}
// a keyboard visitor landing on a hidden link is carried to the point where the label is shown
zlabel.addEventListener('focusin', () => {
  if (!Z) return;
  const r = zoom.getBoundingClientRect();
  const top = window.scrollY + r.top;
  const target = top + 0.96 * (r.height - Z.H);
  if (Math.abs(window.scrollY - target) > 40) {
    if (lenis) lenis.scrollTo(target, { immediate: true }); else window.scrollTo(0, target);
  }
});

/* phones: lighter, unpinned. The print grows a little as it comes into view. */
function updatePhonePiece() {
  if (Z || !motion) return;
  const r = piece.getBoundingClientRect();
  const H = window.innerHeight;
  const t = outQuart(seg(H - r.top, 0, H * 0.7));
  piece.style.transform = `scale(${(0.86 + 0.14 * t).toFixed(4)})`;
  pieceImg.style.transform = `scale(${(1.08 - 0.08 * t).toFixed(4)})`;
}

/* ---------- Covers: the room underneath dims as the next one arrives ---------- */
const heroInner = $('.hero__inner');
const shades = [
  { shade: $('.hero [data-cover-shade]'), cover: workRoom, scaleEl: heroInner },
  { shade: $('.room--work [data-cover-shade]'), cover: aboutRoom, scaleEl: null },
];
/* the curtain: About's edge rises at scroll speed, its words hang back (0.38x), so the edge wipes over them */
const curtainHold = $('[data-curtain-hold]');
const curtainWords = $('[data-curtain-words]');
const HOLD = 0.62;
// touch screens scroll natively on the compositor, ahead of any script: a held heading would trail and shake there
const holdCurtain = !window.matchMedia('(pointer: coarse)').matches;
function updateCovers() {
  if (!motion) return;
  const H = window.innerHeight;
  shades.forEach(({ shade, cover, scaleEl }) => {
    const top = cover.getBoundingClientRect().top;
    const t = clamp(1 - top / H, 0, 1);
    shade.style.opacity = (t * 0.22).toFixed(3);
    if (scaleEl) scaleEl.style.transform = t > 0 ? `scale(${(1 - 0.05 * t).toFixed(4)})` : '';
  });
  const top = aboutRoom.getBoundingClientRect().top;
  if (holdCurtain) curtainHold.style.transform = top > 0 && top < H ? `translate3d(0, ${(-top * HOLD).toFixed(1)}px, 0)` : '';
  if (isReady && top < H * 0.6) curtainWords.classList.add('is-in');
}

/* ---------- Nav: hides on the way down, returns on the way up, takes the colour of the room under it ---------- */
const nav = $('[data-nav]');
const toned = [$('.hero'), workRoom, aboutRoom, $('.end')];
let lastNavY = window.scrollY;
function updateNav() {
  const y = window.scrollY;
  const dy = y - lastNavY;
  if (Math.abs(dy) > 4) {
    if (dy > 0 && y > 240) nav.setAttribute('data-hidden', ''); else nav.removeAttribute('data-hidden');
    lastNavY = y;
  }
  if (y > 8) nav.setAttribute('data-solid', ''); else nav.removeAttribute('data-solid');
  let tone = 'wall';
  toned.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top <= 32 && r.bottom > 32) tone = el.dataset.tone || 'wall';
  });
  if (nav.dataset.tone !== tone) nav.dataset.tone = tone;
}
nav.addEventListener('focusin', () => nav.removeAttribute('data-hidden'));

/* ---------- One loop ---------- */
let lastY = -1;
function frame(t) {
  if (lenis) lenis.raf(t);
  const y = window.scrollY;
  if (y !== lastY) {
    lastY = y;
    updateZoom();
    updatePhonePiece();
    updateCovers();
    updateSticky();
    updateNav();
  }
  requestAnimationFrame(frame);
}

function layout() {
  layoutZoom();
  layoutSticky();
  lastY = -1;
}
layout();
requestAnimationFrame(frame);
let resizeT = 0;
window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(layout, 120); });
document.fonts?.ready.then(layout);
window.addEventListener('load', layout);

/* ---------- Lightbox ---------- */
const dialog = $('[data-lightbox-dialog]');
const lbImg = document.createElement('img');
lbImg.width = 2400;
lbImg.height = 1350;
$('[data-lightbox-figure]').prepend(lbImg);
$$('[data-lightbox]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const img = $('img', btn);
    const fig = btn.closest('figure');
    lbImg.src = (img.currentSrc || img.src).replace('-1600.webp', '-2400.webp');
    lbImg.alt = img.alt;
    $('[data-lightbox-title]').textContent = $('.label__title', fig).textContent;
    $('[data-lightbox-line]').textContent = $('.label__line', fig)?.textContent || '';
    dialog.showModal();
    lenis?.stop();
  });
});
$('[data-lightbox-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => lenis?.start());

/* ---------- The film ---------- */
const film = $('[data-film]');
$('[data-film-play]').addEventListener('click', () => {
  film.controls = true;
  film.closest('.plate').classList.add('is-playing');
  film.play().catch(() => {});
  film.focus({ preventScroll: true });
});
