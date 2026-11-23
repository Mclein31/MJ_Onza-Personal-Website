/*
 * video.js: promo video in a <dialog>. Opens from a click (so the browser allows sound), plays with sound,
 * and on close pauses, unloads the file (stops buffering) and returns focus.
 *
 * HOOKS READ
 *   [data-video-open]      trigger (button). Clip data, first match wins:
 *                          data-video-src | data-src | the attribute value itself (data-video-open="url"), data-video-poster | data-poster, data-video-title | data-title
 *   dialog[data-video]     the player window (also accepts [data-video-dialog]); parts inside it:
 *     [data-video-player]    the <video> (required)
 *     [data-video-title-el]  gets the clip title as text (optional)
 *     [data-video-close]     close button (optional)
 *   Inline <video> elements elsewhere on the page are paused when the window opens.
 *
 * ATTRIBUTES / CLASSES WRITTEN (no styling)
 *   dialog   .is-open (after showModal) .is-closing (while the close transition runs) .is-loading (until the video plays)
 *            .is-error (file could not load)
 *   player   src / poster / aria-label set on open, removed on close (preload goes none -> auto -> none)
 *   body     .is-locked via lock.js (key 'video'; see modal.js)
 *
 * EVENTS (CustomEvent on the dialog, bubbles to document)
 *   video:open   { clip: { src, poster, title }, from }
 *   video:close  { clip, from, time }   time = seconds watched when it closed; fired after cleanup and focus return
 *
 * EXPORTS
 *   initVideo()                     wires everything; returns the controller or null (never throws)
 *   openVideo(clip, fromEl, at)     clip = { src, poster, title }; `at` = start second; false if the window is not mounted
 *   closeVideo()
 *   setVideoTransition(fn)          design hook, same contract as setViewerTransition (viewer.js):
 *                                   fn({ phase: 'open'|'close', from, dialog, player, clip, reduced })
 *
 * KEYS: Escape closes (through the transition hook), clicking the backdrop closes.
 */

import { $, $$, emit, lockScroll, unlockScroll, reducedMotion, closeWithHook, returnFocus } from './modal.js';

let ctl = null;
let transition = null;

export const setVideoTransition = (fn) => { transition = typeof fn === 'function' ? fn : null; };
export const openVideo = (clip, from = null, at = 0) => (ctl ? ctl.open(clip, from, at) : false);
export const closeVideo = () => ctl?.close();

export function initVideo() {
  if (ctl) return ctl;
  try {
    const dlg = $('dialog[data-video]') || $('[data-video-dialog]');
    const player = dlg && $('[data-video-player]', dlg);
    if (!dlg || !player || typeof dlg.showModal !== 'function') return null;
    const titleEl = $('[data-video-title-el]', dlg);
    const closeBtn = $('[data-video-close]', dlg);

    let clip = null, opener = null, locked = false, closing = false;

    const ctx = (phase) => ({ phase, from: opener, dialog: dlg, player, clip, reduced: reducedMotion() });
    const ready = () => dlg.classList.remove('is-loading');

    function open(next, from = null, at = 0) {
      const src = next && next.src;
      if (!src) return false;
      clip = { src: new URL(src, location.href).href, poster: next.poster || '', title: next.title || 'Video' };
      if (!dlg.open) opener = from || document.activeElement;
      closing = false;
      dlg.classList.remove('is-closing', 'is-error');
      dlg.classList.add('is-loading');
      $$('video').forEach((v) => { if (v !== player) v.pause(); });

      if (titleEl) titleEl.textContent = clip.title;
      player.setAttribute('aria-label', `${clip.title} promo video`);
      player.pause();
      player.poster = clip.poster;
      player.preload = 'auto';
      player.src = clip.src;
      if (at > 0) player.addEventListener('loadedmetadata', () => { try { player.currentTime = at; } catch {} }, { once: true });

      const wasOpen = dlg.open;
      if (!wasOpen) {
        try { dlg.showModal(); } catch { return false; }
        if (!locked) { lockScroll('video'); locked = true; }
        dlg.classList.add('is-open');
        emit(dlg, 'video:open', { clip, from: opener });
        if (transition) { try { Promise.resolve(transition(ctx('open'))).catch(() => {}); } catch {} }
      }
      // Still inside the click that opened the window, so the browser lets it start with sound.
      // If a browser refuses anyway, the native controls stay available and nothing is muted behind the visitor's back.
      const started = player.play();
      if (started && started.catch) started.catch(() => ready());
      return true;
    }

    function close() {
      if (!dlg.open || closing) return;
      closing = true;
      closeWithHook(dlg, transition, ctx('close'));
    }

    player.addEventListener('playing', ready);
    player.addEventListener('canplay', ready);
    player.addEventListener('waiting', () => { if (player.getAttribute('src')) dlg.classList.add('is-loading'); });
    player.addEventListener('error', () => {
      if (!player.getAttribute('src')) return; // unloading on close also lands here in some browsers
      ready();
      dlg.classList.add('is-error');
    });

    dlg.addEventListener('close', () => {
      const time = player.currentTime || 0;
      const done = { clip, from: opener, time };
      closing = false;
      player.pause();
      player.removeAttribute('src');
      player.removeAttribute('poster');
      player.preload = 'none';
      try { player.load(); } catch {} // drops the connection and buffered data
      dlg.classList.remove('is-open', 'is-closing', 'is-loading', 'is-error');
      if (locked) { unlockScroll('video'); locked = false; }
      returnFocus(opener);
      emit(dlg, 'video:close', done);
    });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    closeBtn?.addEventListener('click', close);

    document.addEventListener('click', (e) => {
      const t = e.target instanceof Element ? e.target.closest('[data-video-open]') : null;
      if (!t || dlg.contains(t) || e.defaultPrevented) return;
      const d = t.dataset;
      open({ src: d.videoSrc || d.src || d.videoOpen, poster: d.videoPoster || d.poster, title: d.videoTitle || d.title }, t);
    });

    ctl = { open, close, dialog: dlg };
    return ctl;
  } catch {
    return null;
  }
}
