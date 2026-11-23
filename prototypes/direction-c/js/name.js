// The kinetic name: every letter reacts to the cursor. Geist is variable, so letters near the pointer
// gain weight (up to 700) and lift slightly away from it; the rest relax toward 420. Desktop pointers only.
// Reads all positions first, then writes, once per frame; the loop stops when the letters settle.

const REST = 500;

export function initName(h1, { reduce }) {
  const chars = [...h1.querySelectorAll('.ch')];
  const api = { chars, enable() {}, setPaused() {} };
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce || !fine) return api;

  const hero = h1.closest('[data-hero]');
  const st = chars.map(() => ({ w: REST, x: 0, y: 0 }));
  let px = -1e4, py = -1e4, inside = false, enabled = false, paused = false, running = false, raf = 0;
  let fs = 0;
  const measure = () => { fs = parseFloat(getComputedStyle(h1).fontSize) || 200; };

  function loop() {
    const hr = h1.getBoundingClientRect();
    const R = fs * 1.15;
    const pos = chars.map((c) => [hr.left + c.offsetLeft + c.offsetWidth / 2, hr.top + c.offsetTop + c.offsetHeight / 2]);
    let moving = false;
    for (let i = 0; i < chars.length; i++) {
      const s = st[i];
      let tw = REST, tx = 0, ty = 0;
      if (inside) {
        const dx = pos[i][0] - px, dy = pos[i][1] - py;
        const d = Math.hypot(dx, dy) || 1;
        let f = Math.max(0, 1 - d / R);
        f = f * f * (3 - 2 * f);
        tw = 420 + 280 * f;
        tx = (dx / d) * f * fs * 0.035;
        ty = -f * fs * 0.045;
      }
      s.w += (tw - s.w) * 0.14;
      s.x += (tx - s.x) * 0.14;
      s.y += (ty - s.y) * 0.14;
      if (Math.abs(tw - s.w) > 0.6 || Math.abs(tx - s.x) > 0.06 || Math.abs(ty - s.y) > 0.06) moving = true;
    }
    for (let i = 0; i < chars.length; i++) {
      const s = st[i];
      chars[i].style.fontWeight = String(Math.round(s.w));
      chars[i].style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
    }
    if (moving || inside) raf = requestAnimationFrame(loop);
    else running = false;
  }
  const kick = () => {
    if (!enabled || paused || running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };

  window.addEventListener('pointermove', (e) => {
    px = e.clientX; py = e.clientY;
    const r = hero.getBoundingClientRect();
    inside = py > r.top && py < r.bottom && r.bottom > 0;
    kick();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { inside = false; kick(); });
  window.addEventListener('resize', measure);

  api.enable = () => { measure(); enabled = true; kick(); };
  api.setPaused = (p) => {
    paused = p;
    if (p) { cancelAnimationFrame(raf); running = false; } else kick();
  };
  return api;
}
