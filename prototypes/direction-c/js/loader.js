// Intro loader: the hero name itself scrambles into place (glyph and weight) while a percentage counts.
// Once per session, ~2.2s, skippable with any key or click, hard cap 2.05s before the wipe starts.
// The CSS failsafe in base.css hides the loader at 2.6s even if this never runs.

const GLYPHS = 'ABCDEFGHJKLMNOPRSTUVWXYZacemnorsuvwxz0123456789#%&';
const EASE = 'cubic-bezier(0.77, 0, 0.175, 1)';

export function runLoader({ chars, onExit }) {
  const root = document.documentElement;
  const el = document.querySelector('[data-loader]');
  if (!root.classList.contains('is-loading') || !el) return Promise.resolve(false);

  return new Promise((resolve) => {
    window.scrollTo(0, 0);
    root.style.overflow = 'hidden';
    const countEl = el.querySelector('[data-count]');
    const bar = el.querySelector('[data-bar]');
    const finals = chars.map((c) => c.textContent);
    const resolved = chars.map(() => false);
    const t0 = performance.now();
    let fontsAt = 0;
    let lastSwap = 0;
    let lastResolve = 0;
    let done = false;
    let raf = 0;

    // Hide the letters until Geist is in, so the scramble never flashes a fallback face
    chars.forEach((c) => { c.style.opacity = '0'; });
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 700))]).then(() => {
      // lock each letter's width so the scramble never makes the line jitter
      chars.forEach((c) => { c.style.width = `${c.getBoundingClientRect().width}px`; c.style.textAlign = 'center'; c.style.opacity = ''; });
      fontsAt = performance.now();
    });

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', finish);
      window.removeEventListener('pointerdown', finish);
      chars.forEach((c, i) => {
        c.textContent = finals[i];
        c.style.opacity = '';
        c.style.width = '';
        c.style.textAlign = '';
        c.style.fontWeight = '';
      });
      countEl.textContent = '100';
      bar.style.transform = 'scaleX(1)';
      onExit && onExit();
      const cleanup = () => {
        root.classList.remove('is-loading');
        root.style.overflow = '';
        el.remove();
        try { sessionStorage.setItem('dc-intro', '1'); } catch (e) { /* private mode */ }
        resolve(true);
      };
      const anim = el.animate(
        [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }],
        { duration: 760, easing: EASE, fill: 'forwards' }
      );
      anim.finished.then(cleanup, cleanup);
    };
    window.addEventListener('keydown', finish);
    window.addEventListener('pointerdown', finish);

    const tick = (now) => {
      const t = now - t0;
      let p = Math.min(1, t / 1500);
      p = 1 - Math.pow(1 - p, 3);
      if (!fontsAt) p = Math.min(p, 0.9);

      if (fontsAt) {
        const since = now - fontsAt;
        chars.forEach((c, i) => {
          if (!resolved[i] && since > 140 + i * 62) {
            resolved[i] = true;
            lastResolve = now;
            c.textContent = finals[i];
            c.style.fontWeight = '';
            c.animate([{ fontWeight: 700 }, { fontWeight: 500 }], { duration: 520, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
          }
        });
        if (now - lastSwap > 48) {
          lastSwap = now;
          chars.forEach((c, i) => {
            if (resolved[i]) return;
            c.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
            c.style.fontWeight = String(400 + ((Math.random() * 4) | 0) * 100);
          });
        }
      }
      countEl.textContent = String(Math.round(p * 100)).padStart(3, '0');
      bar.style.transform = `scaleX(${p.toFixed(4)})`;

      const all = resolved.every(Boolean);
      if ((p >= 1 && all && now - lastResolve > 160) || t > 2050) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });
}
