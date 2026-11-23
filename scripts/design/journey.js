/*
 * journey.js: design-layer motion for the journey area (Instrument redesign v5). Owner: W4 journey.
 * Called once from scripts/design/index.js after the core modules are up. Must never throw; no-op if hooks are absent.
 * Respect reduced motion (import { reducedMotion } from '../core/motion.js' or check matchMedia yourself).
 */
import { ScrollTrigger, reducedMotion, onMotionPreferenceChange } from '../core/motion.js';

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function init() {
  try {
    const section = document.getElementById('journey');
    if (!section) return;

    const log = section.querySelector('[data-journey-log]');
    const entries = [...section.querySelectorAll('[data-journey-entry]')];
    const marker = section.querySelector('[data-journey-marker]');
    const fill = section.querySelector('[data-journey-fill]');
    if (!log || !entries.length || !marker) return;

    const nodes = entries.map((entry) => entry.querySelector('[data-journey-node]'));
    let anchors = new Array(entries.length).fill(0);
    let activeIndex = 0;
    let triggers = [];
    let io = null;
    let rafMeasure = 0;

    function applyMarker(idx) {
      const y = anchors[idx] ?? 0;
      marker.style.transform = `translate3d(0, ${Math.round(y)}px, 0)`;
    }

    function setActive(idx) {
      const next = clamp(idx, 0, entries.length - 1);
      activeIndex = next;
      entries.forEach((entry, i) => {
        entry.classList.toggle('is-active', i === next);
      });
      applyMarker(next);
    }

    function measure() {
      const logRect = log.getBoundingClientRect();
      const markerHalf = (marker.offsetHeight || 7) / 2;
      entries.forEach((entry, i) => {
        const node = nodes[i];
        if (!node) {
          anchors[i] = 0;
          return;
        }
        if (entry.offsetParent === log && node.offsetParent === entry) {
          anchors[i] = entry.offsetTop + node.offsetTop + node.offsetHeight / 2 - markerHalf;
        } else {
          const nr = node.getBoundingClientRect();
          anchors[i] = nr.top - logRect.top + nr.height / 2 - markerHalf;
        }
      });
      applyMarker(activeIndex);
    }

    function syncFromViewport() {
      const targetY = window.innerHeight * 0.55;
      const logRect = log.getBoundingClientRect();
      if (fill && logRect.height > 0) {
        const progress = clamp((targetY - logRect.top) / logRect.height, 0, 1);
        fill.style.transform = `scaleY(${progress.toFixed(4)})`;
      }
      let picked = 0;
      for (let i = 0; i < entries.length; i++) {
        const rect = entries[i].getBoundingClientRect();
        if (rect.top <= targetY) picked = i;
      }
      setActive(picked);
    }

    function teardown() {
      triggers.forEach((t) => { try { t.kill(); } catch {} });
      triggers = [];
      if (io) {
        try { io.disconnect(); } catch {}
        io = null;
      }
    }

    function setupTriggers() {
      teardown();
      measure();

      if (reducedMotion()) {
        if (fill) fill.style.transform = 'scaleY(0)';
        setActive(0);
        return;
      }

      if (typeof ScrollTrigger?.create === 'function') {
        const spineTrigger = ScrollTrigger.create({
          trigger: log,
          start: 'top 55%',
          end: 'bottom 55%',
          scrub: true,
          onUpdate: (self) => {
            if (fill) fill.style.transform = `scaleY(${self.progress.toFixed(4)})`;
          },
          onLeaveBack: () => setActive(0),
          onLeave: () => setActive(entries.length - 1),
        });
        triggers.push(spineTrigger);

        entries.forEach((entry, i) => {
          const t = ScrollTrigger.create({
            trigger: entry,
            start: 'top 55%',
            end: 'bottom 55%',
            onEnter: () => setActive(i),
            onEnterBack: () => setActive(i),
          });
          triggers.push(t);
        });
      } else if ('IntersectionObserver' in window) {
        io = new IntersectionObserver((obsEntries) => {
          for (const e of obsEntries) {
            if (!e.isIntersecting) continue;
            const idx = entries.indexOf(e.target);
            if (idx >= 0) setActive(idx);
          }
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0.01 });
        entries.forEach((entry) => io.observe(entry));
      }

      syncFromViewport();
    }

    setupTriggers();

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => {
        if (rafMeasure) cancelAnimationFrame(rafMeasure);
        rafMeasure = requestAnimationFrame(() => {
          rafMeasure = 0;
          measure();
        });
      });
      ro.observe(log);
    }

    document.addEventListener('motion:refresh', measure);
    onMotionPreferenceChange(() => setupTriggers());
  } catch {}
}
