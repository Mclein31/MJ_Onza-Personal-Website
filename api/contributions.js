// Vercel Serverless Function: GitHub contribution calendar
// Reads the public calendar fragment (no token needed) and returns
// { total: { lastYear }, contributions: [{ date, count, level }] } — the same shape as
// github-contributions-api.jogruber.de, which the page falls back to if this fails.

const USER = 'Mclein31';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // GitHub only refreshes the graph every so often; cache at the edge for an hour
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    const response = await fetch(`https://github.com/users/${USER}/contributions`, {
      headers: { 'User-Agent': 'mclein-portfolio', Accept: 'text/html' },
    });
    if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
    const html = await response.text();

    // Each day is a <td data-date data-level id> with a <tool-tip for=id> holding the count
    const tips = new Map();
    for (const [, id, text] of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const n = text.match(/^(\d[\d,]*)/);
      tips.set(id, n ? Number(n[1].replace(/,/g, '')) : 0);
    }
    const contributions = [];
    for (const [td] of html.matchAll(/<td[^>]*class="ContributionCalendar-day"[^>]*>/g)) {
      const date = td.match(/data-date="([\d-]+)"/)?.[1];
      const id = td.match(/id="([^"]+)"/)?.[1];
      if (!date) continue;
      contributions.push({ date, count: tips.get(id) ?? 0, level: Number(td.match(/data-level="(\d)"/)?.[1] ?? 0) });
    }
    if (!contributions.length) throw new Error('No calendar days found');
    contributions.sort((a, b) => a.date.localeCompare(b.date));

    const lastYear = contributions.reduce((sum, d) => sum + d.count, 0);
    return res.status(200).json({ user: USER, total: { lastYear }, contributions });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: err.message });
  }
}
