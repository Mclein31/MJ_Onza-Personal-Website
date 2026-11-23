/**
 * stats.js: visit and like counters (Abacus, always reached through the same-origin /api/stats proxy).
 *
 * Behaviour only: it writes numbers and state, never styles.
 *
 * HOOKS READ
 *   [data-stats-visits]     element(s) that receive the visit total (text)
 *   [data-stats-likes]      element(s) that receive the like total (text); may sit inside the like button
 *   [data-stats-like]       the like button (click = like once per browser)
 *   Nothing is done when none of these exist.
 *
 * WRITES
 *   on count elements   textContent = "1,234", attr data-count="1234", class is-loading until the first
 *                       value (cached or fetched) arrives, then is-ready. With no cache and no network the
 *                       existing text is left alone.
 *   on the like button  aria-pressed="true" + class is-liked once liked; class is-busy while the request is
 *                       in flight; class is-already for ~900ms when clicked again after liking;
 *                       class is-just-liked for ~900ms after a fresh like (CSS hook for a burst).
 *                       The two transient classes are skipped under prefers-reduced-motion.
 *   localStorage        site_total_visits, site_total_likes (cached totals), site_user_has_visited,
 *                       site_user_has_liked
 *
 * EVENTS (document, CustomEvent)
 *   "stats:update"  detail { metric: 'visits' | 'likes', value, previous, source: 'cache' | 'network' | 'optimistic' | 'rollback' }
 *   "stats:like"    detail { count }                       a like was accepted
 *   "stats:like-failed"  detail {}                         the proxy refused it; the like was rolled back
 *   Failures also announce through toast.js (live region).
 *
 * API CONTRACT (api/stats.js): GET /api/stats?type=get|increment&metric=visits|likes -> { count }.
 * The server sets an httpOnly cookie on the first visits increment and ignores repeat ones.
 *
 * RULES (ported from the old js/stats.js)
 *   - Visits: only a "real" browser counts (not navigator.webdriver, not localhost/127.0.0.1/0.0.0.0/[::1]).
 *     The first real visit sends type=increment once; success sets site_user_has_visited. Everyone else
 *     only reads. First visits are serialized across tabs with navigator.locks ('portfolio-first-visit').
 *   - A failed visit increment is NOT marked as counted and is retried on the next load. It never falls
 *     back to Abacus directly (that would bypass the server cookie). Likewise a failed like never hits
 *     Abacus /hit/ directly (the old code did; this one rolls the like back so the visitor can retry).
 *   - Reads (not increments) may fall back to a plain Abacus GET /get/ when the proxy is down.
 *   - Likes: once per browser. Optimistic +1, reconciled with the proxy's count.
 *   The old draggable pill is not ported (the v5 page has no floating pill).
 */

import { showToast } from './toast.js';

const NS = 'mcleinonza';
const KEYS = { visits: 'portfolio_views', likes: 'portfolio_likes' };
const LS = {
  visits: 'site_total_visits',
  likes: 'site_total_likes',
  visited: 'site_user_has_visited',
  liked: 'site_user_has_liked',
};

const fmt = (n) => new Intl.NumberFormat('en-US').format(Math.max(0, n || 0));
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k, v) => { try { localStorage.setItem(k, String(v)); } catch {} };
const all = (sel) => { try { return [...document.querySelectorAll(sel)]; } catch { return []; } };
const emit = (name, detail) => { try { document.dispatchEvent(new CustomEvent(name, { detail })); } catch {} };

async function request(type, metric) {
  try {
    const res = await fetch(`/api/stats?type=${type}&metric=${metric}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.count === 'number') return data.count;
    }
  } catch {}
  // Never increment through Abacus directly: it would bypass the server-side once-per-browser cookie.
  if (type === 'increment') return null;
  try {
    const res = await fetch(`https://abacus.jasoncameron.dev/get/${NS}/${KEYS[metric]}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.value === 'number') return data.value;
    }
  } catch {}
  return null;
}

const isRealBrowser = () => !navigator.webdriver && !/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname);

function pulse(el, cls) {
  if (reduced()) return;
  el.classList.remove(cls);
  void el.offsetWidth; // restart the CSS animation
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 900);
}

export function initStats() {
  try {
    const visitEls = all('[data-stats-visits]');
    const likeEls = all('[data-stats-likes]');
    const likeBtns = all('[data-stats-like]');
    if (!visitEls.length && !likeEls.length && !likeBtns.length) return;

    const els = { visits: visitEls, likes: likeEls };
    const totals = { visits: parseInt(get(LS.visits), 10) || 0, likes: parseInt(get(LS.likes), 10) || 0 };

    const render = (metric, value, source) => {
      const previous = totals[metric];
      totals[metric] = value;
      els[metric].forEach((el) => {
        el.textContent = fmt(value);
        el.setAttribute('data-count', String(value));
        el.classList.remove('is-loading');
        el.classList.add('is-ready');
      });
      emit('stats:update', { metric, value, previous, source });
    };

    // Cached totals first, so there is a number on screen before the network answers.
    ['visits', 'likes'].forEach((m) => {
      if (totals[m] > 0) render(m, totals[m], 'cache');
      else els[m].forEach((el) => el.classList.add('is-loading'));
    });
    const settle = () => ['visits', 'likes'].forEach((m) => els[m].forEach((el) => el.classList.remove('is-loading')));

    // ---- likes ----
    const markLiked = () => likeBtns.forEach((b) => {
      b.classList.add('is-liked');
      b.setAttribute('aria-pressed', 'true');
    });
    const unmarkLiked = () => likeBtns.forEach((b) => {
      b.classList.remove('is-liked', 'is-just-liked');
      b.setAttribute('aria-pressed', 'false');
    });
    if (get(LS.liked) === 'true') markLiked();
    else likeBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));

    let busy = false;
    likeBtns.forEach((btn) => btn.addEventListener('click', async () => {
      if (busy) return;
      if (get(LS.liked) === 'true') {
        pulse(btn, 'is-already');
        showToast('Already liked, thank you.');
        return;
      }
      busy = true;
      likeBtns.forEach((b) => { b.classList.add('is-busy'); b.setAttribute('aria-busy', 'true'); });
      set(LS.liked, 'true');
      markLiked();
      pulse(btn, 'is-just-liked');
      const before = totals.likes;
      render('likes', before + 1, 'optimistic');
      set(LS.likes, totals.likes);
      emit('stats:like', { count: totals.likes });

      const cloud = await request('increment', 'likes');
      if (typeof cloud === 'number') {
        render('likes', cloud, 'network');
        set(LS.likes, cloud);
      } else {
        try { localStorage.removeItem(LS.liked); } catch {}
        unmarkLiked();
        render('likes', before, 'rollback');
        set(LS.likes, before);
        emit('stats:like-failed', {});
        showToast('Could not save your like. Try again in a moment.', { tone: 'error' });
      }
      likeBtns.forEach((b) => { b.classList.remove('is-busy'); b.removeAttribute('aria-busy'); });
      busy = false;
    }));

    // ---- visits (and the like total) ----
    (async () => {
      const loadVisits = async () => {
        const first = isRealBrowser() && get(LS.visited) !== 'true';
        const count = await request(first ? 'increment' : 'get', 'visits');
        if (first && typeof count === 'number') set(LS.visited, 'true');
        return count;
      };
      const serialized = async () => {
        if (!navigator.locks) return loadVisits();
        try { return await navigator.locks.request('portfolio-first-visit', loadVisits); } catch { return loadVisits(); }
      };
      const [v, l] = await Promise.all([serialized(), request('get', 'likes')]);
      if (typeof v === 'number') { render('visits', v, 'network'); set(LS.visits, v); }
      // A like in flight owns the number until it settles.
      if (typeof l === 'number' && !busy) { render('likes', l, 'network'); set(LS.likes, l); }
      settle();
    })().catch(settle);
  } catch {}
}
