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

function setupDrawer(root) {
  const tabs = $$('[data-folder-tab]', root);
  const cards = $$('[data-folder-card]', root);
  if (!tabs.length || tabs.length !== cards.length) return;

  let pinned = tabs.findIndex((t) => t.getAttribute('aria-expanded') === 'true');
  let hovered = -1;
  let focused = -1;

  const currentShown = () => (hovered !== -1 ? hovered : focused !== -1 ? focused : pinned);

  const sync = (shown = currentShown()) => {
    tabs.forEach((tab, i) => {
      const isOpen = i === pinned;
      const isLifted = i === shown || isOpen;
      tab.setAttribute('aria-expanded', String(isOpen));
      tab.classList.toggle('is-open', isOpen);
      tab.classList.toggle('is-lifted', isLifted);
    });
    cards.forEach((card, i) => {
      const isShown = i === shown;
      card.classList.toggle('is-shown', isShown);
      card.setAttribute('aria-hidden', String(!isShown));
    });
    root.classList.toggle('is-resting', shown === -1);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      if (pinned === i) {
        pinned = -1;
        hovered = -1;
        focused = -1;
        sync(-1);
      } else {
        pinned = i;
        sync(i);
      }
    });

    tab.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      hovered = i;
      sync(i);
    });

    tab.addEventListener('focusin', () => {
      focused = i;
      sync(i);
    });

    tab.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = (i + step + tabs.length) % tabs.length;
      tabs[next].focus();
    });
  });

  cards.forEach((card, i) => {
    card.addEventListener('focusin', () => {
      focused = i;
      sync(i);
    });
  });

  root.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    hovered = -1;
    sync();
  });

  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) {
      focused = -1;
      sync();
    }
  });

  sync();
}

export function initDrawer() {
  $$('[data-drawer]').forEach(setupDrawer);

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-training-lb]');
    if (btn) openViewer(TRAINING_PHOTOS, Number(btn.dataset.trainingLb), btn);
  });
}
