import { $, clamp, reducedMotion } from './util.js';

function clock() {
  const el = $('[data-clock]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 15000);
}

// The black word band under the hero. A composited WAAPI loop; scrolling nudges its
// playback rate (down speeds it up, up runs it backwards) and the nudge decays back to 1.
function ticker() {
  const band = $('[data-ticker]');
  const track = band && $('.ticker__track', band);
  const group = track && $('.ticker__group', track);
  if (!group) return;
  track.append(group.cloneNode(true));

  let anim = null, visible = false, boost = 0, decay = 0, lastY = scrollY, lastT = 0, width = 0;
  const setup = (force) => {
    const w = group.offsetWidth;
    // Phones fire resize when the address bar slides; only rebuild when the words changed size
    if (force !== true && anim && w === width) return;
    width = w;
    anim?.cancel();
    anim = null;
    if (reducedMotion.matches) return;
    // ~110px a second whatever the word size
    const duration = Math.max(12000, (w / 110) * 1000);
    anim = track.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(-50%,0,0)' }], { duration, iterations: Infinity });
    if (!visible) anim.pause();
  };
  const settle = () => {
    boost *= 0.9;
    if (Math.abs(boost) < 0.02) boost = 0;
    if (anim) anim.playbackRate = 1 + boost;
    decay = boost && visible ? requestAnimationFrame(settle) : 0;
  };
  addEventListener('scroll', (e) => {
    if (!anim || !visible) return;
    const y = scrollY, dt = Math.max(16, e.timeStamp - lastT);
    boost = clamp(boost * 0.6 + ((y - lastY) / dt) * 1.6, -4, 6);
    lastY = y; lastT = e.timeStamp;
    decay ||= requestAnimationFrame(settle);
  }, { passive: true });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    lastY = scrollY;
    if (!anim) return;
    if (visible) anim.play(); else anim.pause();
  }).observe(band);

  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(setup, 200); });
  document.fonts?.ready.then(setup);
  reducedMotion.addEventListener('change', () => setup(true));
  setup(true);
}

export function initHero() {
  if (!$('.hero')) return;
  clock();
  ticker();
}
