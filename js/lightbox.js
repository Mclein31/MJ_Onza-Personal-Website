/* ==========================================================================
   Lightbox — award photos
   ========================================================================== */
import { $, $$ } from './util.js';

export const PHOTOS = [
  { src: 'award-bnhs-journalism-team.jpg', title: 'Student Leadership & Campus Journalism Team', desc: 'Campus journalist, radio broadcaster and student leader at Ballesteros National High School.' },
  { src: 'cert-pitch-and-silent-billionaire.jpg', title: 'Pitch Perfect & Silent Billionaire Awards', desc: 'Certificates of Recognition from DTI Region 02 (YEP) for the MedCore pitch presentation and exceptional impact.' },
  { src: 'cert-high-honors.jpg', title: 'With High Honors', desc: 'Certificate of Recognition for consistent academic excellence and high scholastic distinction.' },
  { src: 'award-dti-yep-team.jpg', title: 'DTI Youth Entrepreneurship Program — Pitch Team', desc: 'The MedCore pitch team with regional mentors, youth innovators and DTI-SMEDD organizers.' },
  { src: 'award-community-leadership.jpg', title: 'Student Leadership & Community Outreach', desc: 'Youth leadership representation, community volunteer work and collaborative outreach programs.' },
  { src: 'award-deped-tree-project.jpg', title: 'DepEd 235K Christmas Trees Project', desc: 'Student leadership in the nationwide DepEd tree planting initiative.' },
  { src: 'award-symposium-arena.jpg', title: 'Regional Academic & Pitch Symposium', desc: 'Presenting in the regional symposium arena before academic panels and enterprise evaluators.' },
  { src: 'cih-2026-check.jpg', title: 'Cagayan Innovation Hack 2026 — 2nd Place', desc: 'Final Pitch, October 19, 2026. AdvanCare took second place and a ₱10,000 prize at the iHub Innovation Hub event.' },
  { src: 'cih-2026-stage.jpg', title: 'AdvanCare on stage — Cagayan Innovation Hack 2026', desc: 'With the AdvanCare platform on screen after the Final Pitch. Theme: “From Local Challenges to Innovative Solutions.”' },
].map((p) => ({ ...p, src: 'assets/images/awards/' + p.src }));

export function initLightbox() {
  const dlg = $('[data-lightbox]');
  if (!dlg) return;
  const img = $('[data-lb-img]', dlg);
  const stage = $('[data-lb-stage]', dlg);
  const title = $('[data-lb-title]', dlg);
  const desc = $('[data-lb-desc]', dlg);
  const count = $('[data-lb-count]', dlg);
  let index = 0, opener = null;

  const show = (i) => {
    index = (i + PHOTOS.length) % PHOTOS.length;
    const p = PHOTOS[index];
    img.style.opacity = 0;
    img.onload = () => { img.style.opacity = 1; };
    img.src = p.src;
    img.alt = p.title;
    title.textContent = p.title;
    desc.textContent = p.desc;
    count.textContent = `${index + 1} / ${PHOTOS.length}`;
  };
  const open = (i, from) => {
    opener = from;
    show(i);
    dlg.showModal();
    document.body.classList.add('is-locked');
  };
  dlg.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    opener?.focus();
  });

  $('[data-lb-prev]', dlg).addEventListener('click', () => show(index - 1));
  $('[data-lb-next]', dlg).addEventListener('click', () => show(index + 1));
  $('[data-lb-close]', dlg).addEventListener('click', () => dlg.close());
  stage.addEventListener('click', (e) => { if (e.target === stage) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  let sx = null;
  stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    sx = null;
  });

  const strip = $('[data-strip]');
  if (strip) {
    const items = PHOTOS.map((p, i) => `<button class="strip__item" type="button" data-lb="${i}" data-cursor="View" aria-label="View photo: ${p.title}"><img src="${p.src}" alt="" loading="lazy" decoding="async" /></button>`).join('');
    strip.innerHTML = items + items.replace(/<button /g, '<button tabindex="-1" aria-hidden="true" ');
    const band = strip.parentElement;
    new IntersectionObserver(([e]) => band.classList.toggle('is-offscreen', !e.isIntersecting)).observe(band);
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-lb]');
    if (t) open(Number(t.dataset.lb), t);
  });
}
