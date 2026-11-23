/*
 * about.js: design-layer motion for the about area (Instrument redesign v5). Owner: AB2 / W3 about.
 * Called once from scripts/design/index.js after the core modules are up. Must never throw; no-op if hooks are absent.
 * Respects reduced motion and keeps content readable without JS or when motion is reduced.
 */
import {
  gsap,
  ScrollTrigger,
  SplitText,
  reducedMotion,
  onMotionPreferenceChange,
  refresh,
} from '../core/motion.js';

let initialized = false;

export function init() {
  if (initialized) return;
  try {
    const section = document.querySelector('#about[data-about], #about');
    if (!section) return;
    initialized = true;

    const title = section.querySelector('[data-about-title], #about-title');
    const accordions = [...section.querySelectorAll('details[name="does"]')];

    // Keep downstream ScrollTriggers synced when the accordion changes section height.
    accordions.forEach((details) => {
      details.addEventListener('toggle', () => {
        try { refresh(); } catch {}
      });
    });

    if (reducedMotion() || !title) return;

    const triggers = [];
    let split = null;
    let revealed = false;

    const teardown = () => {
      revealed = true;
      triggers.forEach((st) => { try { st.kill(); } catch {} });
      triggers.length = 0;
      try { split?.revert(); } catch {}
      split = null;
    };

    onMotionPreferenceChange((isReduced) => {
      if (isReduced) teardown();
    });

    // Heading rises line by line out of its masks once web fonts settle.
    const fontsReady = (document.fonts && document.fonts.ready)
      ? document.fonts.ready.catch(() => {})
      : Promise.resolve();

    fontsReady.then(() => {
      if (reducedMotion() || !document.body.contains(title)) return;

      const revealHeading = () => {
        if (revealed) return;
        revealed = true;
        const lines = split?.lines || [];
        if (!lines.length) return;
        gsap.to(lines, {
          yPercent: 0,
          duration: 0.78,
          stagger: 0.075,
          ease: 'power4.out',
          overwrite: true,
          clearProps: 'transform',
        });
      };

      try {
        split = SplitText.create(title, {
          type: 'lines',
          mask: 'lines',
          tag: 'span',
          linesClass: 'about__line',
          aria: 'none',
          autoSplit: true,
          onSplit(self) {
            if (!revealed) {
              gsap.set(self.lines, { yPercent: 108 });
            } else {
              gsap.set(self.lines, { yPercent: 0, clearProps: 'transform' });
            }
          },
        });
      } catch {
        split = null;
      }

      if (!split || !split.lines.length) {
        revealed = true;
        return;
      }

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top 76%',
        once: true,
        onEnter: revealHeading,
        onEnterBack: revealHeading,
      });
      triggers.push(st);

      // Failsafe if visitor loaded straight onto #about or already scrolled past the trigger line.
      if (section.getBoundingClientRect().top < window.innerHeight * 0.76) {
        revealHeading();
      }
    }).catch(() => {
      teardown();
    });
  } catch {
    // Graceful no-op; CSS default keeps all content visible.
  }
}
