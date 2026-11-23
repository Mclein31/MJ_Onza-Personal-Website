/*
 * footer.js: footer signature moment, the LOAD end of the hero's Extract -> Transform -> Load pipeline
 * (Instrument redesign v5). Owner: CF2 contact+footer.
 *
 * The wordmark is a dot matrix of the hero's grey points with a sparse scatter of orange ones, drawn on a 2D canvas
 * (the hero field stays the site's only WebGL piece).
 *
 * HOOKS (markup in index.html, footer)
 *   [data-wordmark]               box whose width the letters fill (CSS sizes it; .wordmark__text inside is the
 *                                 crisp no-canvas version and tells which text shows: full name or "Onza")
 *   [data-wordmark-canvas]        the canvas (bleeds past the box so pushed points are not clipped)
 *   [data-wordmark-status]        "Load complete" label; [data-wordmark-status-text] gets the text
 * WRITES   .is-live on [data-wordmark] once the canvas draws; .is-loading on the status while points stream in.
 *
 * MODES
 *   full    hover + fine pointer and motion allowed: the points stream in from the left once (~1.2s, ease-out) when
 *           the wordmark comes into view; points near the cursor are pushed away and ease back (lerp, no overshoot).
 *   static  touch or reduced motion: the settled dots are drawn once, crisp at the (capped) device pixel ratio.
 *   none    no JS / no 2D canvas: the CSS text with a dotted fill stays.
 * Frames run only while something moves, never while the wordmark is offscreen or the tab is hidden.
 * Must never throw.
 */
import { reducedMotion } from '../core/motion.js';

const DPR_CAP = 2;
const FAMILY = "Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const TRACK = -0.04;          // em, matches the CSS
const GREY = 0;
const FAINT = 1;
const ORANGE = 2;
const ALPHA = [1, 0.48, 1];
const R = 92;                 // cursor push radius (css px)
const PUSH = 24;              // furthest a point is pushed (css px)
const LERP = 0.16;            // per-frame approach to the pushed / home offset
const TAU = Math.PI * 2;

function rng(seed) {
  return function next() {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mq = (q) => { try { return matchMedia(q).matches; } catch { return false; } };

function waitForFont() {
  try {
    if (!document.fonts || typeof document.fonts.load !== 'function') return Promise.resolve();
    return Promise.race([
      document.fonts.load(`600 100px ${FAMILY}`).catch(() => {}),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch { return Promise.resolve(); }
}

function setTracking(ctx, px) {
  try { if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`; } catch {}
}

export function init() {
  try {
    const wrap = document.querySelector('[data-wordmark]');
    const canvas = wrap && wrap.querySelector('[data-wordmark-canvas]');
    if (!wrap || !canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const status = document.querySelector('[data-wordmark-status]');
    const statusText = status && status.querySelector('[data-wordmark-status-text]');
    const fullEl = wrap.querySelector('.wordmark__full');
    const shortEl = wrap.querySelector('.wordmark__short');

    const full = mq('(hover: hover) and (pointer: fine)') && !reducedMotion();

    // point data (typed arrays, rebuilt on resize)
    let n = 0;
    let tx, ty, sx, sy, d0, du, px, py;
    let lists = [[], [], []];
    let cw = 0, ch = 0, dpr = 1, rG = 1, rO = 1.15;
    let colors = ['#7E838A', '#7E838A', '#FF4F00'];

    let phase = full ? 'idle' : 'settled';   // idle -> stream -> settled
    let elapsed = 0;
    let total = 1;
    let visible = false;
    let raf = 0;
    let last = 0;
    let built = false;

    let ptrX = 0, ptrY = 0, ptrIn = false, ptrSeen = false;

    const setStatus = (loading) => {
      if (!status) return;
      status.classList.toggle('is-loading', loading);
      if (statusText) statusText.textContent = loading ? 'Loading' : 'Load complete';
    };

    const readColors = () => {
      const cs = getComputedStyle(wrap);
      const field = cs.getPropertyValue('--field').trim() || '#7E838A';
      const orange = cs.getPropertyValue('--orange').trim() || '#FF4F00';
      colors = [field, field, orange];
    };

    const currentText = () => {
      const fullShown = fullEl && getComputedStyle(fullEl).display !== 'none';
      const el = fullShown ? fullEl : shortEl;
      return (el && el.textContent.trim()) || 'Onza';
    };

    function build() {
      const wr = wrap.getBoundingClientRect();
      const cr = canvas.getBoundingClientRect();
      if (wr.width < 40 || wr.height < 10 || cr.width < 40) return false;
      cw = cr.width;
      ch = cr.height;
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.max(1, Math.round(cw * dpr));
      canvas.height = Math.max(1, Math.round(ch * dpr));

      const text = currentText();

      // Measure the ink at 100px, then scale it to fill the box width exactly.
      const probe = document.createElement('canvas');
      const pctx = probe.getContext('2d');
      if (!pctx) return false;
      pctx.font = `600 100px ${FAMILY}`;
      setTracking(pctx, TRACK * 100);
      const m = pctx.measureText(text);
      const inkW100 = (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || m.width);
      const asc100 = m.actualBoundingBoxAscent || 72.6;
      const desc100 = m.actualBoundingBoxDescent || 1.6;
      if (!inkW100) return false;
      const s = wr.width / inkW100;
      const fs = 100 * s;
      const ox = wr.left - cr.left;
      const inkH = (asc100 + desc100) * s;
      const inkTop = (wr.top - cr.top) + (wr.height - inkH) / 2;

      // Rasterise the letters once at 1 css px per pixel and read the coverage.
      const W = Math.ceil(cw);
      const H = Math.ceil(ch);
      probe.width = W;
      probe.height = H;
      pctx.font = `600 ${fs}px ${FAMILY}`;
      setTracking(pctx, TRACK * fs);
      pctx.textBaseline = 'alphabetic';
      pctx.fillStyle = '#000';
      pctx.fillText(text, ox + (m.actualBoundingBoxLeft || 0) * s, inkTop + asc100 * s);
      const data = pctx.getImageData(0, 0, W, H).data;

      const pitch = Math.min(8, Math.max(3.4, fs * 0.032));
      rG = Math.max(0.95, pitch * (pitch < 5 ? 0.28 : 0.24));
      rO = rG * 1.15;
      const cols = Math.floor(wr.width / pitch);
      const rows = Math.floor(inkH / pitch);
      const gx0 = ox + (wr.width - cols * pitch) / 2 + pitch / 2;
      const gy0 = inkTop + (inkH - rows * pitch) / 2 + pitch / 2;

      const xs = [], ys = [], ks = [];
      const rand = rng(0x10ad);
      for (let r = 0; r < rows; r++) {
        const gy = gy0 + r * pitch;
        const iy = Math.round(gy);
        if (iy < 0 || iy >= H) continue;
        for (let c = 0; c < cols; c++) {
          const gx = gx0 + c * pitch;
          const ix = Math.round(gx);
          if (ix < 0 || ix >= W) continue;
          if (data[(iy * W + ix) * 4 + 3] < 128) continue;
          const k = rand();
          xs.push(Math.round(gx * dpr) / dpr);
          ys.push(Math.round(gy * dpr) / dpr);
          ks.push(k < 0.035 ? ORANGE : k < 0.19 ? FAINT : GREY);
        }
      }

      n = xs.length;
      tx = Float32Array.from(xs);
      ty = Float32Array.from(ys);
      sx = new Float32Array(n);
      sy = new Float32Array(n);
      d0 = new Float32Array(n);
      du = new Float32Array(n);
      px = new Float32Array(n);
      py = new Float32Array(n);
      lists = [[], [], []];

      // Stream: every point enters from the left edge inside a narrow band (the pipe), travels at about the same
      // speed, and fans out to its letter at the end. Longest path + longest delay is ~1.2s.
      const midY = inkTop + inkH / 2;
      total = 1;
      for (let i = 0; i < n; i++) {
        lists[ks[i]].push(i);
        sx[i] = -(4 + rand() * 0.16 * cw);
        sy[i] = midY + (ty[i] - midY) * 0.16 + (rand() - 0.5) * inkH * 0.08;
        du[i] = 300 + ((tx[i] - sx[i]) / cw) * 560;
        d0[i] = rand() * 260;
        total = Math.max(total, d0[i] + du[i]);
      }
      lists = lists.map((l) => Uint32Array.from(l));
      built = true;
      return true;
    }

    function draw() {
      if (!built) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      const streaming = phase === 'stream';
      const idle = phase === 'idle';
      if (idle) return;
      for (let k = 0; k < 3; k++) {
        const list = lists[k];
        const r = k === ORANGE ? rO : rG;
        ctx.beginPath();
        for (let j = 0; j < list.length; j++) {
          const i = list[j];
          let x = tx[i];
          let y = ty[i];
          if (streaming) {
            const lt = (elapsed - d0[i]) / du[i];
            if (lt <= 0) continue;
            if (lt < 1) {
              const ex = 1 - (1 - lt) ** 3;
              const ly = clamp01((lt - 0.35) / 0.65);
              const ey = 1 - (1 - ly) ** 3;
              x = sx[i] + (x - sx[i]) * ex;
              y = sy[i] + (y - sy[i]) * ey;
            }
          }
          x += px[i];
          y += py[i];
          if (x < -r) continue;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, TAU);
        }
        ctx.globalAlpha = ALPHA[k];
        ctx.fillStyle = colors[k];
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Cursor field: returns true while any point is still easing.
    function updatePush() {
      let on = false;
      let mx = 0, my = 0;
      if (ptrIn && ptrSeen) {
        const cr = canvas.getBoundingClientRect();
        mx = ptrX - cr.left;
        my = ptrY - cr.top;
        on = mx > -R && my > -R && mx < cw + R && my < ch + R;
      }
      const R2 = R * R;
      let moving = false;
      for (let i = 0; i < n; i++) {
        let gx = 0, gy = 0;
        if (on) {
          const dx = tx[i] - mx;
          const dy = ty[i] - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) + 0.001;
            const f = 1 - d / R;
            const k = (f * f * PUSH) / d;
            gx = dx * k;
            gy = dy * k;
          }
        }
        const ox = px[i], oy = py[i];
        if (ox === gx && oy === gy) continue;
        let nx = ox + (gx - ox) * LERP;
        let ny = oy + (gy - oy) * LERP;
        if (Math.abs(gx - nx) < 0.02 && Math.abs(gy - ny) < 0.02) { nx = gx; ny = gy; } else moving = true;
        px[i] = nx;
        py[i] = ny;
      }
      return moving;
    }

    function frame(now) {
      raf = 0;
      try {
        if (!visible || document.hidden || !built) { last = 0; return; }
        const dt = last ? Math.min(now - last, 64) : 16;
        last = now;
        let busy = false;
        if (phase === 'stream') {
          elapsed += dt;
          if (elapsed >= total) { phase = 'settled'; setStatus(false); } else busy = true;
        }
        if (full && phase !== 'idle' && updatePush()) busy = true;
        draw();
        if (busy) raf = requestAnimationFrame(frame);
        else last = 0;
      } catch { last = 0; }
    }

    const kick = () => {
      if (!raf && visible && !document.hidden && built) raf = requestAnimationFrame(frame);
    };

    const startStream = () => {
      if (phase !== 'idle') return;
      if (reducedMotion()) { phase = 'settled'; setStatus(false); draw(); return; }
      phase = 'stream';
      elapsed = 0;
      kick();
    };

    let ratio = 0;
    const onVisible = () => {
      if (phase === 'idle' && visible && ratio >= 0.25) startStream();
      else kick();
    };

    const rebuild = () => {
      try {
        if (!build()) return;
        if (phase === 'stream') { phase = 'settled'; setStatus(false); }
        readColors();
        draw();
      } catch {}
    };

    const start = async () => {
      await waitForFont();
      if (!build()) return;
      readColors();
      wrap.classList.add('is-live');
      if (phase === 'idle') setStatus(true);
      draw();

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          for (const e of entries) {
            visible = e.isIntersecting;
            ratio = e.intersectionRatio;
          }
          onVisible();
        }, { threshold: [0, 0.25, 0.5] });
        io.observe(wrap);
      } else {
        visible = true;
        if (phase === 'idle') { phase = 'settled'; setStatus(false); }
        draw();
      }

      let rt = 0;
      let lastW = wrap.getBoundingClientRect().width;
      if ('ResizeObserver' in window) {
        new ResizeObserver(() => {
          const w = wrap.getBoundingClientRect().width;
          if (Math.abs(w - lastW) < 0.5) return;
          lastW = w;
          clearTimeout(rt);
          rt = setTimeout(rebuild, 120);
        }).observe(wrap);
      } else {
        window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(rebuild, 160); }, { passive: true });
      }

      const recolor = () => { try { readColors(); draw(); } catch {} };
      document.addEventListener('theme:change', () => requestAnimationFrame(recolor));
      try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => requestAnimationFrame(recolor)); } catch {}

      document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

      if (full) {
        window.addEventListener('pointermove', (e) => {
          if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
          ptrX = e.clientX;
          ptrY = e.clientY;
          ptrIn = true;
          ptrSeen = true;
          if (visible) kick();
        }, { passive: true });
        document.documentElement.addEventListener('pointerleave', () => { ptrIn = false; kick(); }, { passive: true });
        window.addEventListener('blur', () => { ptrIn = false; kick(); });
        window.addEventListener('scroll', () => { if (ptrIn && visible) kick(); }, { passive: true });
      }
    };

    start().catch(() => {});
  } catch {}
}
