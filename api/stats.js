// Vercel Serverless Function: Unified Visits & Likes Counter
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
  
  // Public resilient cloud storage endpoint
  const KV_BASE = `https://api.counterapi.dev/v1/mclein-onza-unified/${key}`;

  try {
    const endpoint = type === 'increment' ? `${KV_BASE}/up` : KV_BASE;
    const response = await fetch(endpoint, {
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({ metric, count: data.count || 0 });
    } else if (response.status === 404) {
      if (type === 'increment') {
        const initRes = await fetch(`${KV_BASE}/up`);
        if (initRes.ok) {
          const initData = await initRes.json();
          return res.status(200).json({ metric, count: initData.count || 1 });
        }
      }
      return res.status(200).json({ metric, count: 0 });
    } else {
      return res.status(200).json({ metric, count: 0 });
    }
  } catch (err) {
    return res.status(200).json({ metric, count: 0, error: err.message });
  }
}
