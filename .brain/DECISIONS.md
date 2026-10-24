---
type: decisions-log
title: Personal Website Decisions
project: Personal Website
tags:
  - decisions
  - portfolio
  - web
last_updated: 2026-10-25
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

---

## 2026-10-25 — v3 Rebuild Stays Framework-Free, Split into ES Modules

### Decision
Rebuild the site with the same zero-framework approach, but split styles into `css/*.css` and behavior into one ES module per feature under `js/`, loaded from `js/main.js` where each init is wrapped so one failure can't break the page.

### Reason
Keeps the "no build step" decision while making the much larger interaction layer maintainable. ES modules require serving over HTTP (Vercel already does).

### Consequences
Opening `index.html` from disk no longer works; use a local server.

---

## 2026-10-25 — Project Galleries Use Composed Real Screenshots

### Decision
Project cards show swipeable galleries of real screenshots composed into device/browser frames (`assets/images/projects/*.jpg`). No live links or status tags on cards (owner's request). Demo data came from each app's own demo mode (SERVIO offline demo, AdvanCare built-in demo profile) or in-browser intercepted API responses (AdvanCare staff console) — nothing was written to any project database. MedCore uses its existing QA captures in `MedCore1/docs/validation/ui-polish/after/`.

### Alternatives
- AI-generated mockups (rejected: less honest than real UI).
- Bare login-page screenshots of the live sites (rejected: weak visuals).

