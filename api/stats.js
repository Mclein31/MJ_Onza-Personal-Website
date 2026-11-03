// Visits and likes proxy.

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
  const key = metric === 'likes' ? 'portfolio_likes' : 'portfolio_views';   // portfolio_views: restarted at 232 on 2026-10-31

  // Abacus: free, no-auth, namespace-isolated counter API
  // GET  → https://abacus.jasoncameron.dev/get/mcleinonza/<key>
  // HIT  → https://abacus.jasoncameron.dev/hit/mcleinonza/<key>
  const NAMESPACE = 'mcleinonza';
  const seen = /(?:^|;\s*)portfolio_visited=1(?:;|$)/.test(req.headers.cookie || '');
  const increment = type === 'increment' && (metric !== 'visits' || !seen);
  const endpoint = increment
    ? `https://abacus.jasoncameron.dev/hit/${NAMESPACE}/${key}`
    : `https://abacus.jasoncameron.dev/get/${NAMESPACE}/${key}`;

  try {
    const response = await fetch(endpoint, {
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (response.ok) {
      const data = await response.json();
      // Abacus returns { value: <number> }
      if (typeof data.value !== 'number' || !Number.isFinite(data.value)) {
        return res.status(502).json({ metric, error: 'Invalid counter response' });
      }
      const count = data.value;
      if (metric === 'visits' && type === 'increment') {
        const secure = req.headers['x-forwarded-proto'] === 'https' || process.env.VERCEL === '1';
        res.setHeader('Set-Cookie', `portfolio_visited=1; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`);
      }
      return res.status(200).json({ metric, count });
    } else {
      return res.status(502).json({ metric, error: 'Counter unavailable' });
    }
  } catch (err) {
    return res.status(502).json({ metric, error: 'Counter unavailable' });
  }
}
