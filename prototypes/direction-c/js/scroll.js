// Scroll choreography: Lenis smoothing (desktop), scroll velocity, the hero exit, masked line reveals,
// the Work title shrinking into the nav, the velocity marquee, stacked cards, and the About word scrub.

const navH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;

export function initScroll({ reduce, field, name }) {
  const { gsap, ScrollTrigger, SplitText } = window;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- Smooth scroll (desktop pointers only; touch keeps native scrolling) ----------
  let lenis = null;
  if (!reduce && fine && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Anchor links land below the fixed nav
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2 || id === '#main') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = id === '#top' ? 0 : -navH();
    const y = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });

  // ---------- Marquee of project names ----------
  const marquee = document.querySelector('[data-marquee]');
  const mTrack = marquee && marquee.querySelector('[data-marquee-track]');
  let mVisible = false, mX = 0, mDir = 1, mSkew = 0, mSetW = 0;
  if (mTrack) {
    const set = mTrack.firstElementChild;
    for (let i = 0; i < 2; i++) mTrack.appendChild(set.cloneNode(true));
    const measure = () => { mSetW = set.getBoundingClientRect().width; };
    measure();
    window.addEventListener('resize', measure);
    document.fonts && document.fonts.ready.then(measure);
    new IntersectionObserver((en) => { mVisible = en[0].isIntersecting; }).observe(marquee);
  }

  // ---------- Velocity: one reading per frame feeds the light field and the marquee ----------
  let lastY = window.scrollY, lastT = performance.now(), vel = 0;
  gsap.ticker.add(() => {
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    const y = window.scrollY;
    const v = ((y - lastY) / dt) * 1000;
    lastY = y; lastT = now;
    vel += (v - vel) * 0.25;
    if (field) field.setVelocity(vel);

    if (mTrack && mVisible && !reduce && mSetW) {
      if (Math.abs(vel) > 20) mDir = vel > 0 ? 1 : -1;
      const speed = 42 + Math.min(Math.abs(vel), 4000) * 0.28;
      mX -= mDir * speed * (dt / 1000);
      if (mX <= -mSetW) mX += mSetW;
      if (mX > 0) mX -= mSetW;
      const skewT = Math.max(-9, Math.min(9, -vel * 0.0045));
      mSkew += (skewT - mSkew) * 0.12;
      mTrack.style.transform = `translate3d(${mX.toFixed(2)}px, 0, 0) skewX(${mSkew.toFixed(2)}deg)`;
    }
  });

  // ---------- Nav state ----------
  const links = document.querySelectorAll('[data-nav-link]');
  const setCurrent = (key) => links.forEach((l) => (l.dataset.navLink === key ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
  ['work', 'about'].forEach((key) => {
    ScrollTrigger.create({
      trigger: `#${key}`, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) setCurrent(key); else if (key === 'work' && self.direction < 0) setCurrent(''); },
    });
  });

  if (reduce) {
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
    return { lenis };
  }

  // ---------- Scenes ----------
  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 900px)', phone: '(max-width: 899px)' }, (ctx) => {
    const { desk } = ctx.conditions;

    // Hero exit: the three lines of the name drift apart, the plane sinks and dims, the light field fades
    const heroST = { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.name__line--a', { xPercent: desk ? -9 : -6, ease: 'none', scrollTrigger: heroST });
    gsap.to('.name__line--b', { xPercent: desk ? 4 : 3, ease: 'none', scrollTrigger: heroST });
    gsap.to('.name__line--c', { xPercent: desk ? 9 : 6, ease: 'none', scrollTrigger: heroST });
    gsap.to('[data-plane]', { yPercent: 10, scale: 0.97, ease: 'none', scrollTrigger: heroST });
    ScrollTrigger.create({
      trigger: '[data-hero]', start: 'top top', end: 'bottom top',
      onUpdate: (s) => field && field.setDim(s.progress),
      onToggle: (s) => name && name.setPaused(!s.isActive && s.progress >= 1),
    });

    // Masked line reveals
    gsap.utils.toArray('[data-lines]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'ln',
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 110, duration: 1.05, ease: 'expo.out', stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        }),
      });
    });

    // About heading: masked lines rise once, then every word scrubs from grey to ink with the scroll
    gsap.utils.toArray('[data-scrub]').forEach((el) => {
      let rise = null;
      SplitText.create(el, {
        type: 'lines,words', mask: 'lines', autoSplit: true, linesClass: 'ln',
        onSplit: (self) => {
          if (rise) { rise.scrollTrigger && rise.scrollTrigger.kill(); rise.kill(); }
          rise = gsap.from(self.lines, {
            yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
          return gsap.fromTo(self.words, { opacity: 0.16 }, {
            opacity: 1, ease: 'none', stagger: 0.12,
            scrollTrigger: { trigger: el, start: 'top 86%', end: 'bottom 58%', scrub: 0.4 },
          });
        },
      });
    });

    // Marquee enters with a short rise
    gsap.from('[data-marquee]', { yPercent: 30, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '[data-marquee]', start: 'top 92%', once: true } });

    // Card parts: picture opens from an inset, then the text parts rise in order
    gsap.utils.toArray('[data-card]').forEach((card) => {
      const media = card.querySelector('.gallery__viewport, .teaser__media');
      const img = media && media.querySelector('img');
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 78%', once: true } });
      if (media) {
        tl.from(media, { clipPath: 'inset(10% 8% 10% 8%)', duration: 1.2, ease: 'expo.out' }, 0);
        if (img) tl.from(img, { scale: 1.12, duration: 1.4, ease: 'expo.out' }, 0);
      }
      const parts = card.querySelectorAll('.card__meta, .card__title, .card__desc, .card__video, .card__stack, .gallery__bar');
      tl.from(parts, { y: 26, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 }, 0.12);
    });

    if (!desk) return;

    // Work title shrinks from display size into a label beside the wordmark in the nav
    const title = document.querySelector('[data-shrink-title]');
    const spacer = document.querySelector('[data-title-spacer]');
    const brand = document.querySelector('[data-brand]');
    const sep = document.querySelector('[data-nav-sep]');
    const geo = () => {
      const fs = parseFloat(getComputedStyle(title).fontSize);
      const s = 15.5 / fs;
      const gutter = title.offsetLeft;
      const sepR = sep.getBoundingClientRect();
      const labelH = title.offsetHeight * s;
      return { s, x: sepR.right + 14 - gutter, y: navH() / 2 - labelH / 2 - (navH() + title.offsetTop) };
    };
    const shrink = gsap.timeline({
      scrollTrigger: {
        trigger: spacer, start: () => `top ${navH()}px`, end: () => `+=${spacer.offsetHeight * 0.85}`,
        scrub: 0.35, invalidateOnRefresh: true,
      },
    });
    shrink
      .to(title, { scale: () => geo().s, x: () => geo().x, y: () => geo().y, ease: 'power1.inOut', duration: 1 }, 0)
      .to(sep, { opacity: 1, duration: 0.25, ease: 'none' }, 0.75);
    // The label leaves with the section; the slash goes with it
    ScrollTrigger.create({
      trigger: '#work', start: 'bottom top', end: 'bottom top',
      onEnter: () => gsap.to(sep, { opacity: 0, duration: 0.2, overwrite: 'auto' }),
      onLeaveBack: () => gsap.to(sep, { opacity: 1, duration: 0.2, overwrite: 'auto' }),
    });
    void brand;

    // Stacked cards: each card pins; as the next one rides over it, the previous one steps back
    const cards = gsap.utils.toArray('[data-card]');
    cards.forEach((card, i) => {
      if (!i) return;
      const prev = cards[i - 1];
      gsap.timeline({
        scrollTrigger: { trigger: card, start: 'top bottom', end: () => `top ${navH() + 34}px`, scrub: true, invalidateOnRefresh: true },
      })
        .to(prev, { scale: 0.93, ease: 'none' }, 0)
        .to(prev.querySelector('.card__shade'), { opacity: 0.42, ease: 'none' }, 0);
    });
  });

  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
  return { lenis };
}
