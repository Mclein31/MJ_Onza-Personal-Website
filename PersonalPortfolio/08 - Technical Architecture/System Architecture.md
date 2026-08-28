---
project: PersonalPortfolio
type: architecture
status: completed
created: 2026-08-28
updated: 2026-08-28
tags:
  - architecture
  - web
---

# System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Personal Website Frontend                │
│             (Semantic HTML5 / Pure CSS3)               │
├──────────────────────────┬─────────────────────────────┤
│ UI Components:           │ Interactive Modules:        │
│ - Floating Nav Pill      │ - 3D Coverflow Engine       │
│ - Hero & Terminal Tabs   │ - Theme Switcher with Sync  │
│ - Bento Grid Profile     │ - AJAX FormSubmit Handler   │
└──────────────────────────┴──────────────┬──────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────┐
│        Vercel Serverless Function (api/stats.js)       │
│  - Handles CORS preflight headers                      │
│  - Proxies visits & likes to Abacus Count API          │
└────────────────────────────────────────────────────────┘
```
