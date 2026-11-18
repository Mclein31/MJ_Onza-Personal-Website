// Copier: any [data-copy] control prints a paper slip with the address and lights the COPIED LED.
// ui.js does the actual clipboard write and toast; this module only draws the machine's reaction.
import { reducedMotion } from './util.js';

const PRINT_MS = 900;      // matches --print in copier.css
const LED_MS = 2600;       // how long COPIED stays lit
const SLIP_MS = 7000;      // how long the slip stays out before it is pulled back in

export function initCopier() {
  const machine = document.querySelector('[data-copier]');
  if (!machine) return;
  const addr = machine.querySelector('[data-copier-addr]');
  const tag = machine.querySelector('[data-copier-no]');
  const live = machine.querySelector('[data-copier-live]');
  let count = 0;
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  const print = (text) => {
    timers.forEach(clearTimeout);
    timers = [];
    count++;
    addr.textContent = text;
    tag.textContent = `COPY ${String(count).padStart(3, '0')} / EMAIL`;
    machine.dataset.led = 'on';
    // Restart the print even when the slip is already out: drop to idle, force a style flush, then print
    machine.dataset.state = 'idle';
    if (reducedMotion.matches) {
      machine.dataset.state = 'done';
    } else {
      void machine.offsetWidth;
      machine.dataset.state = 'printing';
      later(() => { machine.dataset.state = 'done'; }, PRINT_MS);
    }
    // Clear first so a repeat copy is announced again
    live.textContent = '';
    later(() => { live.textContent = `Email address copied. A slip printed: ${text}`; }, 50);
    later(() => { machine.dataset.led = 'off'; }, LED_MS);
    later(() => {
      if (reducedMotion.matches) { machine.dataset.state = 'idle'; return; }
      machine.dataset.state = 'retract';
      later(() => { machine.dataset.state = 'idle'; }, 460);
    }, SLIP_MS);
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-copy]');
    if (trigger) print(trigger.dataset.copy);
  });
}
