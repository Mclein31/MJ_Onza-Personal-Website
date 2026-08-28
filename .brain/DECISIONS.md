---
type: decisions-log
title: Personal Website Decisions
project: Personal Website
tags:
  - decisions
  - portfolio
  - web
last_updated: 2026-08-28
---

# ⚖️ Personal Website — Technical Decisions

## 2025-01-05 — Pure Vanilla CSS Design Tokens over Tailwind/Frameworks

### Decision
Build the entire portfolio UI using pure vanilla CSS3 custom properties and Bento Grid layouts with zero CSS frameworks or utility libraries.

### Reason
Achieves the absolute highest performance (<80KB total payload), eliminates build-step friction, gives 100% granular control over 3D transforms, and avoids dependency rot.

### Alternatives
- **Next.js + Tailwind CSS**: Common choice, but creates unnecessary megabytes of JavaScript for a portfolio website.

### Consequences
Ultra-fast sub-second First Contentful Paint and flawless 100 Lighthouse audit scores.

---

## 2025-02-01 — Vercel Serverless Proxy for Stats Counter

### Decision
Implement `api/stats.js` as a Vercel Serverless Function to proxy hit counts and likes from Abacus API rather than calling Abacus directly from clients.

### Reason
Prevents CORS policy blocks, manages caching headers (`no-store`), and provides a clean API layer for future migration to a custom database if needed.

### Alternatives
- Direct client-side `fetch()` to third-party endpoints (can fail if adblockers or strict CORS headers intervene).

### Consequences
Reliable count increments and seamless client integration.
