const SOURCES = ['/api/contributions', 'https://github-contributions-api.jogruber.de/v4/Mclein31?y=last'];
let pending;

export function loadContributions() {
  if (!pending) pending = load().catch(error => { pending = null; throw error; });
  return pending;
}

async function load() {
  for (const url of SOURCES) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) continue;
      const data = await response.json();
      if (Array.isArray(data.contributions) && data.contributions.length) return data.contributions;
    } catch {}
  }
  throw new Error('No contribution source reachable');
}
