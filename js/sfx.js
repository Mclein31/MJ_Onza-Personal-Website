import { $ } from './util.js';

const KEY = 'portfolio-sfx';
let ctx = null, master = null, noise = null;
// Browsers only allow audio after the visitor has pressed something; until then stay silent
let unlocked = !!navigator.userActivation?.hasBeenActive;
let on = (() => { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } })();

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.32;
    master.connect(ctx.destination);
    // One second of white noise, reused for clicks and whooshes
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const env = (g, t, peak, attack, decay) => {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
};

function tone(freq, { type = 'sine', peak = 0.2, attack = 0.003, decay = 0.08, to = null, at = 0 } = {}) {
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + attack + decay);
  env(g, t, peak, attack, decay);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + attack + decay + 0.02);
}

function hiss({ freq = 3000, q = 1, peak = 0.2, attack = 0.002, decay = 0.03, sweep = null, at = 0 } = {}) {
  const t = ctx.currentTime + at;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noise;
  f.type = 'bandpass'; f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + attack + decay);
  env(g, t, peak, attack, decay);
  s.connect(f).connect(g).connect(master);
  s.start(t, Math.random() * 0.5);
  s.stop(t + attack + decay + 0.02);
}

const SOUNDS = {
  // A soft key press: a short noise tick over a quick low thump
  click: () => { hiss({ freq: 4200, q: 0.8, peak: 0.16, decay: 0.022 }); tone(170, { peak: 0.12, decay: 0.05, to: 90 }); },
  tap: () => hiss({ freq: 2600, q: 1.2, peak: 0.1, decay: 0.018 }),
  // Accordion: up when it opens, down when it closes
  open: () => { tone(520, { type: 'triangle', peak: 0.1, decay: 0.07 }); tone(780, { type: 'triangle', peak: 0.08, decay: 0.09, at: 0.05 }); },
  close: () => { tone(620, { type: 'triangle', peak: 0.09, decay: 0.06 }); tone(410, { type: 'triangle', peak: 0.08, decay: 0.08, at: 0.045 }); },
  // A card sliding in the wallet
  whoosh: () => { hiss({ freq: 600, q: 0.7, peak: 0.14, attack: 0.04, decay: 0.2, sweep: 2600 }); tone(140, { peak: 0.05, attack: 0.02, decay: 0.12, at: 0.12 }); },
  // A brief paper shuffle with a soft landing for the contact wallet.
  card: () => { hiss({ freq: 1600, q: 0.7, peak: 0.11, attack: 0.012, decay: 0.08, sweep: 3000 }); hiss({ freq: 2400, q: 0.8, peak: 0.06, decay: 0.05, at: 0.065 }); tone(180, { peak: 0.045, decay: 0.065, to: 95, at: 0.11 }); },
  // Theme switch: a light switch
  toggle: () => { hiss({ freq: 1800, q: 2, peak: 0.18, decay: 0.012 }); tone(1200, { type: 'square', peak: 0.03, decay: 0.03 }); },
  // Copied: two bright notes
  success: () => { tone(880, { peak: 0.12, decay: 0.12 }); tone(1320, { peak: 0.1, decay: 0.18, at: 0.08 }); },
  // Dialog in and out
  pop: () => tone(300, { peak: 0.16, decay: 0.09, to: 720 }),
  drop: () => tone(520, { peak: 0.1, decay: 0.08, to: 240 }),
  // One typed character, very quiet
  type: () => hiss({ freq: 5200 + Math.random() * 1600, q: 3, peak: 0.05, decay: 0.012 }),
  // Gallery and journey steps
  step: () => tone(980, { type: 'sine', peak: 0.06, decay: 0.04 }),
};

let lastType = 0;
export function play(name) {
  if (!on || !unlocked || !SOUNDS[name]) return;
  if (name === 'type') { const now = performance.now(); if (now - lastType < 45) return; lastType = now; }
  if (!audio()) return;
  try { SOUNDS[name](); } catch { /* audio is a nicety; never break the page */ }
}

export function initSfx() {
  const btn = $('[data-sfx-toggle]');
  const sync = () => {
    document.documentElement.classList.toggle('sfx-off', !on);
    btn?.setAttribute('aria-pressed', String(on));
    btn?.setAttribute('aria-label', on ? 'Mute interface sounds' : 'Turn interface sounds on');
  };
  sync();
  btn?.addEventListener('click', () => {
    on = !on;
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* private mode */ }
    sync();
    if (on) play('toggle');
  });

  // One delegated listener picks the sound from what was pressed
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a, button, [role="button"], summary');
    if (!el || el.matches('[data-sfx-toggle]')) return;
    // Capture phase: the accordion hasn't toggled yet, so an expanded row is about to close
    if (el.matches('.does__btn')) return play(el.getAttribute('aria-expanded') === 'true' ? 'close' : 'open');
    // The wallet itself plays the shuffle when its front card changes.
    if (el.matches('.pass__head')) {
      if (el.closest('.pass')?.classList.contains('is-front')) play('tap');
      return;
    }
    if (el.matches('[data-theme-toggle]')) return play('toggle');
    if (el.matches('[data-copy]')) return play('success');
    if (el.matches('[data-message-open], [data-video-open], [data-demo-open], [data-gallery-zoom]')) return play('pop');
    if (el.matches('[data-message-close], [data-video-close], [data-demo-close], [data-lb-close]')) return play('drop');
    if (el.matches('[data-gallery-prev], [data-gallery-next], [data-film-prev], [data-film-next], [data-lb-prev], [data-lb-next], .gallery__dots button')) return play('step');
    play('click');
  }, true);

  // Unlock audio on the first gesture so the first sound isn't lost
  const unlock = () => {
    unlocked = true;
    if (on) audio();
    removeEventListener('pointerdown', unlock, true);
    removeEventListener('keydown', unlock, true);
  };
  addEventListener('pointerdown', unlock, true);
  addEventListener('keydown', unlock, true);
}
