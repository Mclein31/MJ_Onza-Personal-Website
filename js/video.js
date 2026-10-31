/* ==========================================================================
   Video window — project promo videos
   ========================================================================== */
import { $, $$ } from './util.js';

// Opens { src, poster, title } in the window; a gallery's video slide (SERVIO, MedRec) uses it to play larger
let openSet = null;
export const openVideo = (clip, from, at) => openSet?.(clip, from, at);

export function initVideo() {
  const dlg = $('[data-video]');
  if (!dlg) return;
  const player = $('[data-video-player]', dlg);
  const title = $('[data-video-title-el]', dlg);
  let opener = null;

  // The click that opens the window lets the video start with sound
  const open = ({ src, poster, title: name }, from, at) => {
    opener = from;
    src = new URL(src, location.href).href;
    title.textContent = name || 'Video';
    player.setAttribute('aria-label', `${title.textContent} promo video`);
    if (player.src !== src) { player.poster = poster || ''; player.src = src; }
    if (at) player.currentTime = at;
    dlg.showModal();
    document.body.classList.add('is-locked');
    player.play().catch(() => {});
  };
  openSet = open;

  $$('[data-video-open]').forEach((btn) => btn.addEventListener('click', () => open({
    src: btn.dataset.videoOpen, poster: btn.dataset.videoPoster, title: btn.dataset.videoTitle,
  }, btn)));

  $('[data-video-close]', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => {
    player.pause();
    document.body.classList.remove('is-locked');
    opener?.focus();
  });
}
