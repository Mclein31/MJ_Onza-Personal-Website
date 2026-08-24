// Vercel Serverless Function: Unified Visits & Likes Counter
// Migrated from CounterAPI v1 (deprecated Aug 2026) to Abacus (abacus.jasoncameron.dev)
// Solves cross-device syncing, CORS, and Safari iOS ITP tracking blocks

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { type = 'get', metric = 'visits' } = req.query;
  const key = metric === 'likes' ? 'portfolio_likes' : 'portfolio_visits';

  // Abacus: free, no-auth, namespace-isolated counter API
  // GET  → https://abacus.jasoncameron.dev/get/mcleinonza/<key>
  // HIT  → https://abacus.jasoncameron.dev/hit/mcleinonza/<key>
  const NAMESPACE = 'mcleinonza';
  const endpoint = type === 'increment'
    ? `https://abacus.jasoncameron.dev/hit/${NAMESPACE}/${key}`
    : `https://abacus.jasoncameron.dev/get/${NAMESPACE}/${key}`;

  try {
    const response = await fetch(endpoint, {
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (response.ok) {
      const data = await response.json();
      // Abacus returns { value: <number> }
      const count = typeof data.value === 'number' ? data.value : 0;
      return res.status(200).json({ metric, count });
    } else {
      return res.status(200).json({ metric, count: 0 });
    }
  } catch (err) {
    return res.status(200).json({ metric, count: 0, error: err.message });
  }
}
