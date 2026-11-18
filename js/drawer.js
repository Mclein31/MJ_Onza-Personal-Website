import { $$ } from './util.js';
import { openViewer } from './lightbox.js';

const TRAINING_PHOTOS = [
  { src: 'dti-yep-pitch-medcore.webp', title: 'Pitching MedCore', desc: 'Pitching MedCore, an AI-powered healthcare optimization concept.' },
  { src: 'dti-yep-awards-banner.webp', title: 'Pitch Perfect & Silent Billionaire', desc: 'Pitch Perfect and Silent Billionaire awardees.' },
  { src: 'dti-yep-officials.webp', title: 'With DTI-SMEDD Officials', desc: 'The presentation team with DTI-SMEDD officials.' },
  { src: 'dti-yep-outdoor-team.webp', title: 'Balay Na Magu, Solana', desc: 'Team celebration at Balay Na Magu, Solana.' },
  { src: 'dti-yep-opening-banner.webp', title: 'Opening Day', desc: 'Opening day of Be Your Own Boss!' },
  { src: 'dti-yep-pitch-team.webp', title: 'Pitch Team & Mentor', desc: 'The MedCore pitch team with our program mentor.' },
  { src: 'dti-yep-workshop-session.webp', title: 'Ideation & Pitch Workshop', desc: 'Business ideation and pitch preparation workshop.' },
  { src: 'dti-yep-certificates.webp', title: 'Program Certificates', desc: 'Certificates from the program.' },
].map((p) => ({ ...p, src: 'assets/images/trainings/' + p.src }));

// Matches the 64rem switch in css/drawer.css: two columns with a sticky panel from here up, an accordion below
const wide = matchMedia('(min-width: 64rem)');

// Editorial index: rows are buttons, panels hold the photo and text.
// Wide: hover, focus or click on a row features it. Narrow: tap opens that row and closes the other.
function setupIndex(root) {
  const rows = $$('[data-idx-row]', root);
  const panels = $$('[data-idx-panel]', root);
  if (!rows.length || rows.length !== panels.length) return;

  let active = Math.max(0, rows.findIndex((r) => r.getAttribute('aria-current') === 'true'));

  const sync = () => {
    rows.forEach((row, i) => {
      const on = i === active;
      if (on) row.setAttribute('aria-current', 'true');
      else row.removeAttribute('aria-current');
      row.setAttribute('aria-expanded', String(on));
    });
    panels.forEach((panel, i) => panel.classList.toggle('is-active', i === active));
  };

  const show = (i) => {
    if (i === active) return;
    active = i;
    root.classList.add('is-touched');
    sync();
  };

  // Accordion: keep the tapped row where the finger is while the row above it collapses
  const toggleAccordion = (i) => {
    const before = rows[i].getBoundingClientRect().top;
    root.classList.add('is-touched');
    active = i === active ? -1 : i;
    sync();
    const drift = rows[i].getBoundingClientRect().top - before;
    if (drift) window.scrollBy(0, drift);
  };

  rows.forEach((row, i) => {
    row.addEventListener('click', () => (wide.matches ? show(i) : toggleAccordion(i)));

    // Real movement only: rows scrolling under a resting cursor must not swap the featured panel
    row.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse' && wide.matches && (e.movementX || e.movementY)) show(i);
    });

    row.addEventListener('focus', () => {
      if (wide.matches) show(i);
    });

    row.addEventListener('keydown', (e) => {
      const last = rows.length - 1;
      const next = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: last }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      rows[Math.min(last, Math.max(0, next))].focus();
    });
  });

  // Growing past the breakpoint with everything collapsed: feature the first row again
  wide.addEventListener('change', () => {
    if (wide.matches && active < 0) {
      active = 0;
      sync();
    }
  });

  sync();
}

export function initDrawer() {
  $$('[data-index]').forEach(setupIndex);

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-training-lb]');
    if (btn) openViewer(TRAINING_PHOTOS, Number(btn.dataset.trainingLb), btn);
  });
}
