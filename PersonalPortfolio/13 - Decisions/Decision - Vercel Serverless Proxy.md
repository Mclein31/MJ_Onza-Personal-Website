---
project: PersonalPortfolio
type: decision
status: accepted
created: 2025-02-01
updated: 2025-02-01
tags:
  - decision
  - serverless
---

# Decision — Vercel Serverless Proxy

## Decision
Proxy Abacus API requests through a Vercel Serverless Function (`api/stats.js`).

## Reason
Prevents CORS blocks and manages caching headers cleanly.
