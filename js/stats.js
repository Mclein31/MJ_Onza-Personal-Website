import { $, clamp, store } from './util.js';

// Same storage keys + endpoints as v2.2 so existing visitors keep their "liked" state
const fmt = (n) => new Intl.NumberFormat('en-US').format(Math.max(0, n || 0));

async function request(type, metric) {
  try {
    const res = await fetch(`/api/stats?type=${type}&metric=${metric}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.count === 'number') return data.count;
    }
  } catch { /* not on Vercel — fall through */ }
  try {
    const key = metric === 'likes' ? 'portfolio_likes' : 'portfolio_visits';
    const res = await fetch(`https://abacus.jasoncameron.dev/${type === 'increment' ? 'hit' : 'get'}/mcleinonza/${key}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.value === 'number') return data.value;
    }
  } catch (e) { console.warn(`Stats offline for ${metric}`, e); }
  return null;
}

function draggable(el, onDragEnd) {
  let sx = 0, sy = 0, ox = 0, oy = 0, active = false, moved = false;
  el.addEventListener('pointerdown', (e) => {
    active = true; moved = false;
    const r = el.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
  });
  el.addEventListener('pointermove', (e) => {
    if (!active) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.hypot(dx, dy) < 5) return;
    // Capture only once it's a real drag, so a plain tap still clicks the like button
    if (!moved) el.setPointerCapture(e.pointerId);
    moved = true; el.classList.add('is-dragging');
    el.style.left = `${clamp(ox + dx, 8, innerWidth - el.offsetWidth - 8)}px`;
    el.style.top = `${clamp(oy + dy, 8, innerHeight - el.offsetHeight - 8)}px`;
    el.style.right = 'auto'; el.style.bottom = 'auto';
  });
  el.addEventListener('pointerup', () => { active = false; el.classList.remove('is-dragging'); onDragEnd(moved); });
}

export function initStats() {
  const widget = $('[data-stats]');
  const visitsEl = $('[data-visits]');
  const likesEl = $('[data-likes]');
  const likeBtn = $('[data-like]');
  if (!widget) return;

  let visits = parseInt(store.get('site_total_visits'), 10) || 0;
  let likes = parseInt(store.get('site_total_likes'), 10) || 0;
  visitsEl.textContent = fmt(visits);
  likesEl.textContent = fmt(likes);

  let suppressClick = false;
  draggable(widget, (moved) => { suppressClick = moved; });

  const burst = (text) => {
    const b = Object.assign(document.createElement('span'), { className: 'burst', textContent: text });
    likeBtn.append(b);
    setTimeout(() => b.remove(), 900);
  };
  const markLiked = () => {
    likeBtn.classList.add('is-liked');
    likeBtn.setAttribute('aria-pressed', 'true');
    likeBtn.setAttribute('aria-label', 'You liked this website');
  };
  if (store.get('site_user_has_liked') === 'true') markLiked();

  let busy = false;
  likeBtn.addEventListener('click', async () => {
    if (suppressClick) { suppressClick = false; return; }
    if (busy) return;
    if (store.get('site_user_has_liked') === 'true') {
      likeBtn.classList.remove('shake'); void likeBtn.offsetWidth; likeBtn.classList.add('shake');
      return burst('Already liked ♥');
    }
    busy = true;
    store.set('site_user_has_liked', 'true');
    markLiked();
    likeBtn.classList.remove('pop'); void likeBtn.offsetWidth; likeBtn.classList.add('pop');
    burst('+1 ♥');
    likes += 1; likesEl.textContent = fmt(likes); store.set('site_total_likes', likes);
    const cloud = await request('increment', 'likes');
    if (typeof cloud === 'number') { likes = cloud; likesEl.textContent = fmt(likes); store.set('site_total_likes', likes); }
    busy = false;
  });

  (async () => {
    const isNew = !store.get('site_session_active', sessionStorage);
    if (isNew) store.set('site_session_active', 'true', sessionStorage);
    const [v, l] = await Promise.all([request(isNew ? 'increment' : 'get', 'visits'), request('get', 'likes')]);
    if (typeof v === 'number') { visits = v; visitsEl.textContent = fmt(v); store.set('site_total_visits', v); }
    if (typeof l === 'number') { likes = l; likesEl.textContent = fmt(l); store.set('site_total_likes', l); }
  })();
}
