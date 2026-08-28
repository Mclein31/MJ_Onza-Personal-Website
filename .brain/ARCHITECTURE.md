---
type: architecture
title: Personal Website Architecture
project: Personal Website
tags:
  - architecture
  - portfolio
  - web
  - serverless
last_updated: 2026-08-28
---

# 🏛️ Personal Website — Architecture

## 📐 Frontend & Serverless Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Personal Website Frontend                       │
│                        (Semantic HTML5 / CSS3)                         │
├──────────────────────────────────┬─────────────────────────────────────┤
│ UI Layout Modules:               │ Interactive Components (main.js):   │
│ - Floating Frosted Glass Navbar  │ - 3D Coverflow Stage Controller     │
│ - Interactive Terminal Tabs      │ - Dark/Light Theme Manager          │
│ - Bento Grid (About/Philosophy)  │ - Typing Effect Engine              │
│ - 3D Project Coverflow Carousel  │ - Training Slider & Award Lightbox  │
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

## 🎠 3D Coverflow Carousel Engine (`main.js`)
- Calculates angular offset:
  $$\Delta = (i - 	ext{currentIndex} + N) \pmod{N}$$
- Assigns dynamic CSS classes (`active`, `next`, `prev`, `hidden-left`, `hidden-right`) to trigger hardware-accelerated 3D CSS transforms (`translate3d`, `rotateY`, `scale3d`).
- Synchronizes indicator dots and active metadata card (title, description, demo link).

---

## 🎨 Theme Management & Persistence
- Automatically detects system preference via `window.matchMedia('(prefers-color-scheme: light)')`.
- Saves explicit user preference in `localStorage.getItem('portfolio-theme')`.
- Toggles `data-theme="light"` on document root with smooth CSS variable color transitions.
