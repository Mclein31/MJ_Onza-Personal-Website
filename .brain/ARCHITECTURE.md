---
type: architecture
title: Personal Website Architecture
project: Personal Website
tags:
  - architecture
  - portfolio
  - web
  - serverless
last_updated: 2026-10-25
---

# 🏛️ Personal Website — Architecture

## 📐 Frontend & Serverless Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Personal Website Frontend                       │
│                        (Semantic HTML5 / CSS3)                         │
├──────────────────────────────────┬─────────────────────────────────────┤
│ UI Layout Modules:               │ Interactive Components (js/*.js):   │
│ - Hide-on-scroll Glass Navbar    │ - Pinned Horizontal Work Scroll     │
│ - Kinetic Hero + SQL Query Card  │ - Dark/Light Theme Manager          │
│ - Profile Record + Trait Deck    │ - Screenshot Galleries              │
│ - Skills Schema · Award Stack    │ - Film Strip & Award Lightbox       │
│ - Categorized Skills Grid        │ - AJAX Contact Form Handler         │
│ - Timeline & Award Showcase      │ - Visit & Like Counter Sync         │
└──────────────────────────────────┴──────────────────┬──────────────────┘
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Vercel Serverless Function (api/stats.js)            │
│  - Handles CORS preflight (OPTIONS)                                    │
│  - Proxies visits & likes to Abacus API (namespace: 'mcleinonza')      │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Abacus Count API (abacus.jasoncameron.dev)              │
│  - portfolio_visits                                                    │
│  - portfolio_likes                                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 v3 Module Map (`js/`)
- `main.js` — entry; runs each `init*` inside a try/catch, then the preloader → adds `.hero.is-in`.
- `util.js` — `$`/`$$`, `clamp`, `lerp`, safe `store` (localStorage/sessionStorage), `viewProgress`, `toast`, `copyText`.
- `theme.js` — `portfolio-theme` key, OS sync until explicit choice; flash-free bootstrap is inline in `<head>`.
- `preloader.js` — once per session (`pf-loaded` in sessionStorage), timeout failsafe.
- `hero.js` — splits the name into `.char` spans; pointer distance drives `font-weight` (300–800); Asia/Manila clock; typed SQL queries.
- `icons.js` — draggable/throwable tech icons with inertia + bounds (rAF, paused off-screen).
- `cursor.js` — lerped ring + `data-cursor` labels; `data-magnetic` buttons. Fine pointers only.
- `scroll.js` — reveals (`data-reveal`, `--i` stagger), progress bar, nav hide/scroll-spy, manifesto word lighting, timeline fill, award card scaling, footer fill.
- `work.js` — pins `#work` on ≥861px: pin height = track overflow + viewport; scroll progress → `--x`. Otherwise cards stack vertically.
- `gallery.js` — per-card screenshot galleries (scroll-snap + dots + prev/next + mouse drag).
- `ui.js` — mobile menu, trait deck, schema row "joins" (`data-join` tags), portrait tilt, DTI film strip, copy email.
- `lightbox.js` — `PHOTOS` data (awards + hackathon), `<dialog>` viewer, photo strip render.
- `stats.js` — same keys/endpoints as v2 (`site_total_*`, `site_user_has_liked`); pointer capture only after a real drag so taps still like.
- `contact.js` — `<dialog>` FormSubmit form; exports `openMessage()`.

## 🎨 Styles (`css/`)
`tokens.css` (all colors/type/motion; dark default, `[data-theme="light"]` override) → `base.css` → one file per area. All motion respects `prefers-reduced-motion`.
