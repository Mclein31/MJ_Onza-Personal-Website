/*
 * activity.js: design-layer motion for the activity area (Instrument redesign v5). Owner: W5 activity+stack.
 * Called once from scripts/design/index.js after the core modules are up. Must never throw; no-op if hooks are absent.
 * Respect reduced motion (import { reducedMotion } from '../core/motion.js' or check matchMedia yourself).
 */
import { reducedMotion, onMotionPreferenceChange } from '../core/motion.js';

const TOTAL_SWEEP_MS = 520;
const COL_DURATION_MS = 240;
const TICK_DURATION_MS = 680;

export function init() {
  try {
    const root = document.querySelector('[data-activity]');
    if (!root) return;

    const scroller = root.querySelector('.activity__scroll');
    let runId = 0;
    let activeAnimations = [];
    let pendingObserver = null;
    const finalTexts = new Map();

    const syncScrollState = () => {
      if (!scroller || !scroller.isConnected) return;
      const overflows = root.dataset.state === 'ready'
        && scroller.clientWidth > 0
        && scroller.scrollWidth > scroller.clientWidth + 1;
      root.classList.toggle('is-scrollable', overflows);
      root.classList.toggle('is-can-scroll-left', overflows && scroller.scrollLeft > 4);
    };

    const scrollToLatest = () => {
      if (!scroller) return;
      requestAnimationFrame(() => {
        if (!scroller.isConnected || root.dataset.state !== 'ready') return;
        const overflows = scroller.clientWidth > 0 && scroller.scrollWidth > scroller.clientWidth + 1;
        root.classList.toggle('is-scrollable', overflows);
        if (overflows) {
          scroller.scrollLeft = scroller.scrollWidth;
        }
        root.classList.toggle('is-can-scroll-left', overflows && scroller.scrollLeft > 4);
      });
    };

    const restoreFinalNumbers = () => {
      for (const [el, text] of finalTexts) {
        if (el.isConnected) el.textContent = text;
      }
    };

    const cancelAnimations = () => {
      runId += 1;
      if (pendingObserver) {
        pendingObserver.disconnect();
        pendingObserver = null;
      }
      for (const anim of activeAnimations) {
        try { anim.cancel(); } catch {}
      }
      activeAnimations = [];
      restoreFinalNumbers();
    };

    const animateReady = () => {
      cancelAnimations();
      finalTexts.clear();

      const nums = [...root.querySelectorAll('[data-act][data-tick]')];
      const targets = nums.map((el) => {
        const val = Number(el.dataset.value);
        const text = Number.isFinite(val) ? val.toLocaleString('en-US') : el.textContent;
        finalTexts.set(el, text);
        // Prevent reveal.js's global [data-tick] observer from double-counting on later scroll
        if (Number.isFinite(val)) el.setAttribute('data-tick-from', String(val));
        return { el, target: Number.isFinite(val) ? val : NaN, finalText: text };
      });

      if (reducedMotion()) {
        scrollToLatest();
        restoreFinalNumbers();
        return;
      }

      scrollToLatest();

      const weeks = [...root.querySelectorAll('[data-activity-calendar] [data-week]')];
      if (!weeks.length && !targets.length) return;

      const play = () => {
        if (reducedMotion()) {
          restoreFinalNumbers();
          return;
        }
        const myRun = ++runId;
        const count = weeks.length;

        weeks.forEach((col, i) => {
          if (typeof col.animate !== 'function') return;
          const delay = count > 1 ? Math.round((i / (count - 1)) * TOTAL_SWEEP_MS) : 0;
          try {
            const anim = col.animate(
              [
                { opacity: 0, transform: 'translateY(4px) scale(0.94)' },
                { opacity: 1, transform: 'none' },
              ],
              {
                duration: COL_DURATION_MS,
                delay,
                easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
                fill: 'backwards',
              },
            );
            activeAnimations.push(anim);
          } catch {}
        });

        const t0 = performance.now();
        const animatables = targets.filter((item) => Number.isFinite(item.target) && item.target > 0);
        if (!animatables.length) return;

        for (const item of animatables) {
          item.el.textContent = '0';
        }

        const step = (now) => {
          if (myRun !== runId || reducedMotion()) {
            restoreFinalNumbers();
            return;
          }
          const p = Math.min(1, Math.max(0, (now - t0) / TICK_DURATION_MS));
          const eased = 1 - (1 - p) ** 3;
          for (const item of animatables) {
            item.el.textContent = p >= 1
              ? item.finalText
              : Math.round(item.target * eased).toLocaleString('en-US');
          }
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };

      const rect = root.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView || typeof IntersectionObserver === 'undefined') {
        play();
      } else {
        pendingObserver = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            pendingObserver.disconnect();
            pendingObserver = null;
            play();
          },
          { threshold: 0.08 },
        );
        pendingObserver.observe(root);
      }
    };

    scroller?.addEventListener('scroll', syncScrollState, { passive: true });
    window.addEventListener('resize', syncScrollState, { passive: true });

    root.addEventListener('activity:ready', animateReady);
    root.addEventListener('activity:state', (e) => {
      if (e.detail?.state !== 'ready') {
        root.classList.remove('is-scrollable', 'is-can-scroll-left');
        cancelAnimations();
        finalTexts.clear();
        root.querySelectorAll('[data-act][data-tick][data-tick-from]').forEach((el) => {
          el.removeAttribute('data-tick-from');
        });
      }
    });
    onMotionPreferenceChange((isReduced) => {
      if (isReduced) cancelAnimations();
    });

    if (root.dataset.state === 'ready') animateReady();
  } catch {}
}
