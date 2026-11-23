/*
 * contributions.js: loads the last year of GitHub contributions for the activity grid and the contact card.
 * No DOM hooks, no events.
 *
 * SOURCES, tried in order (each with an 8 s timeout, a non-OK status or an empty list moves on to the next):
 *   1. /api/contributions                                          (Vercel function, edge cached)
 *   2. https://github-contributions-api.jogruber.de/v4/Mclein31?y=last   (public fallback)
 * Both answer { contributions: [{ date: 'YYYY-MM-DD', count, level }] }.
 *
 * EXPORTS
 *   loadContributions()   Promise<days[]>; the promise is cached while it is pending or fulfilled, so every caller
 *                         shares one request. When both sources fail it rejects and the cache is cleared, so the
 *                         next call (a Retry button) tries again from the first source.
 *   resetContributions()  forgets the cache (for tests / forced refresh)
 */

const SOURCES = ['/api/contributions', 'https://github-contributions-api.jogruber.de/v4/Mclein31?y=last'];
let pending = null;

const timeout = (ms) => (typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined);

async function load() {
  for (const url of SOURCES) {
    try {
      const response = await fetch(url, { signal: timeout(8000) });
      if (!response.ok) continue;
      const data = await response.json();
      if (data && Array.isArray(data.contributions) && data.contributions.length) return data.contributions;
    } catch {}
  }
  throw new Error('No contribution source reachable');
}

export function loadContributions() {
  if (!pending) pending = load().catch((error) => { pending = null; throw error; });
  return pending;
}

export function resetContributions() { pending = null; }
