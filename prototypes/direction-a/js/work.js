// MedCore sticky split: scroll position picks the figure; the new figure wipes in with clip-path,
// an orange scan line rides the wipe edge, the spec readout and the step counter follow.
import { docTop, clamp } from './scroll.js';

const EASE = 'cubic-bezier(0.77, 0, 0.175, 1)';

function buildOdometer(host, max) {
  host.textContent = '';
  host.classList.add('odo');
  const col = document.createElement('span');
  col.className = 'odo__col';
  for (let i = 1; i <= max; i++) {
    const s = document.createElement('span');
    s.textContent = String(i);
    col.appendChild(s);
  }
  host.appendChild(col);
  return (n) => { col.style.transform = `translateY(${-(n - 1) * 1.15}em)`; };
}

export function initWork(loop, { reduce }) {
  const sec = document.querySelector('[data-mc]');
  if (!sec) return;
  const shots = [...sec.querySelectorAll('[data-shot]')];
  const n = shots.length;
  const frame = sec.querySelector('.mc__frame');
  const scan = sec.querySelector('[data-scan]');
  const stepsEl = sec.querySelector('[data-steps]');
  const textEl = sec.querySelector('[data-fig-text]');
  const titleEl = sec.querySelector('[data-fig-title]');
  const descEl = sec.querySelector('[data-fig-desc]');
  const video = sec.querySelector('[data-video]');
  const playBtn = sec.querySelector('[data-play]');
  const setOdo = buildOdometer(sec.querySelector('[data-fig-n]'), n);

  const mq = matchMedia('(min-width: 961px)');
  let pinned = false;
  let cur = 0;
  let wipe = [];
  let swap = null;
  let top = 0, height = 0;

  // Step buttons (keyboard and pointer can jump to a figure)
  const steps = shots.map((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mc__step';
    b.setAttribute('aria-label', `Figure ${i + 1} of ${n}: ${s.dataset.title}`);
    b.addEventListener('click', () => goTo(i));
    stepsEl.appendChild(b);
    return b;
  });

  function measure() {
    top = docTop(sec);
    height = sec.offsetHeight;
  }

  function markSteps(i) {
    steps.forEach((b, k) => {
      b.classList.toggle('is-past', k < i);
      if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  }

  function swapText(i) {
    const t = shots[i].dataset.title, d = shots[i].dataset.desc;
    if (swap) swap.cancel();
    if (reduce) { titleEl.textContent = t; descEl.textContent = d; return; }
    swap = textEl.animate([{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(3px)' }], { duration: 130, easing: 'ease-out', fill: 'forwards' });
    swap.onfinish = () => {
      titleEl.textContent = t; descEl.textContent = d;
      swap = textEl.animate(
        [{ opacity: 0, filter: 'blur(3px)', transform: 'translateY(6px)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }],
        { duration: 320, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' },
      );
    };
  }

  function show(i, dir) {
    if (i === cur) return;
    wipe.forEach((a) => a.finish());
    wipe = [];
    const prev = shots[cur];
    const next = shots[i];
    shots.forEach((s) => s.classList.remove('is-prev'));
    prev.classList.remove('is-active');
    prev.classList.add('is-prev');
    next.classList.add('is-active');
    if (prev.contains(video) && !video.paused) video.pause();

    const h = frame.clientHeight;
    const from = dir > 0 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)';
    const opts = { duration: 820, easing: EASE };
    wipe.push(next.animate([{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }], opts));
    wipe.push(next.querySelector('.shot__img').animate(
      [{ transform: `translateY(${dir * 7}%) scale(1.05)` }, { transform: 'none' }], opts,
    ));
    wipe.push(prev.querySelector('.shot__img').animate(
      [{ transform: 'none', opacity: 1 }, { transform: `translateY(${-dir * 4}%) scale(0.98)`, opacity: 0.6 }], opts,
    ));
    const y0 = dir > 0 ? h : 0, y1 = dir > 0 ? 0 : h;
    wipe.push(scan.animate([
      { transform: `translateY(${y0}px)`, opacity: 1, offset: 0 },
      { transform: `translateY(${y1}px)`, opacity: 1, offset: 0.985 },
      { transform: `translateY(${y1}px)`, opacity: 0, offset: 1 },
    ], opts));
    wipe[0].onfinish = () => prev.classList.remove('is-prev');

    swapText(i);
    setOdo(i + 1);
    markSteps(i);
    cur = i;
  }

  function stepY(i) {
    const range = height - innerHeight;
    return top + ((i + 0.5) / n) * range;
  }

  function goTo(i, then) {
    if (pinned) loop.scrollTo(stepY(i), { onComplete: then });
    else { loop.scrollTo(shots[i], { offset: -innerHeight * 0.2, onComplete: then }); }
  }

  function setMode() {
    pinned = !reduce && mq.matches;
    shots.forEach((s) => { s.classList.remove('is-prev'); s.getAnimations().forEach((a) => a.cancel()); });
    measure();
    if (pinned) {
      shots.forEach((s, k) => s.classList.toggle('is-active', k === cur));
      setOdo(cur + 1); markSteps(cur);
      titleEl.textContent = shots[cur].dataset.title; descEl.textContent = shots[cur].dataset.desc;
    }
  }

  playBtn.addEventListener('click', () => {
    const play = () => { video.play().catch(() => {}); };
    goTo(n - 1, play);
    // If scrolling is instant or already there, play now as well (the user gesture still counts).
    if (!pinned || cur === n - 1) play();
  });

  mq.addEventListener('change', setMode);
  new ResizeObserver(measure).observe(document.body);
  setMode();

  loop.on((s) => {
    if (!pinned) return;
    const range = height - s.vh;
    if (range <= 0) return;
    const p = clamp((s.y - top) / range, 0, 0.9999);
    const i = Math.floor(p * n);
    if (i !== cur) show(i, i > cur ? 1 : -1);
  });
}
