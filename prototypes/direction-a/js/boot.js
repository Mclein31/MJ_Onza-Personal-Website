// Intro loader (once per session): 000 -> 100 counter, an orange scan bar that draws the column grid,
// then the hero boots (nav drops, rules draw, type rises line by line). Never blocks longer than ~2.2s.

const root = document.documentElement;
const pad3 = (n) => String(n).padStart(3, '0');
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function setStatus(key, text) {
  const li = document.querySelector(`[data-status="${key}"]`);
  if (!li) return;
  li.querySelector('b').textContent = text;
  li.classList.add('ok');
}

/**
 * @param {Promise<string>} fieldReady resolves 'live' or 'static'
 * @returns {Promise<void>} resolves when the hero starts entering
 */
export function boot(fieldReady) {
  return new Promise((resolve) => {
    if (root.getAttribute('data-stage') !== 'boot') { resolve(); return; }

    const enter = () => {
      root.setAttribute('data-stage', 'enter');
      root.classList.remove('has-loader');
      try { sessionStorage.setItem('v5a-booted', '1'); } catch (e) { /* private mode */ }
      setTimeout(() => root.setAttribute('data-stage', 'done'), 1600);
      resolve();
    };

    const loader = document.getElementById('loader');
    if (!root.classList.contains('has-loader') || !loader) {
      requestAnimationFrame(() => requestAnimationFrame(enter));
      return;
    }

    const cols = [...loader.querySelectorAll('[data-loader-cols] i')];
    const grid = loader.querySelector('[data-loader-cols]');
    const scan = loader.querySelector('[data-loader-scan]');
    const count = loader.querySelector('[data-loader-count]');
    const g = parseFloat(getComputedStyle(grid).columnGap) || 0;
    const xs = cols.map((c) => c.getBoundingClientRect().left - g / 2);
    const vw = innerWidth;

    let fontsOk = false;
    document.fonts.ready.then(() => { fontsOk = true; setStatus('type', 'ok'); });
    fieldReady.then((kind) => setStatus('field', kind === 'live' ? 'ok' : 'static'));

    // Budget is measured from navigation start, so a slow module load shortens the scan instead of adding to it.
    const t0 = performance.now();
    const D = Math.max(700, Math.min(1400, 1700 - t0));   // scan duration
    const HARD = D + 400;                                   // never wait on fonts beyond this
    let lit = 0, lastN = -1;

    function frame(now) {
      const el = now - t0;
      let raw = Math.min(1, el / D);
      if (!fontsOk && el < HARD) raw = Math.min(raw, 0.94);
      const p = easeInOut(raw);
      const n = Math.round(p * 100);
      if (n !== lastN) { count.textContent = pad3(n); lastN = n; }
      const x = p * vw;
      scan.style.transform = `translate3d(${x}px,0,0)`;
      while (lit < xs.length && xs[lit] <= x) { cols[lit].classList.add('on'); lit++; }

      if (raw >= 1 && (fontsOk || el >= HARD)) {
        cols.forEach((c) => c.classList.add('on'));
        grid.classList.add('done');
        setStatus('grid', 'ok');
        setTimeout(() => {
          loader.classList.add('is-out');
          setTimeout(enter, 380);
        }, 100);
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

// Count a number up (used by the spec row and the field readout).
export function countTo(el, from, to, dur, fmt = (v) => String(v)) {
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(Math.round(from + (to - from) * e));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
