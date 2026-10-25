---
type: project-brain
title: Personal Website Project Context
project: Personal Website
status: active
tags:
  - project
  - portfolio
  - web
  - showcase
  - serverless
last_updated: 2026-10-25
---

# 🌐 Personal Website — Project Context

## 📌 Overview & Purpose
**Personal Website** is the developer portfolio of **McLein Jei Onza** (BSCS, Cagayan State University, Class of 2028; aiming for data engineering). v3 (Oct 2026) is a full rebuild with a data-pipeline theme: kinetic hero with a live SQL query card, scroll-lit manifesto, pinned horizontal work section with per-project screenshot galleries, skills as schema tables, a self-drawing journey timeline, stacked award cards (newest first, led by the Cagayan Innovation Hack 2026 2nd place), the DTI YEP feature, a ⌘K command palette, and the existing visit/like stats.

---

## 🎯 Current Objectives & Status
- **Status**: v3 is on `main` (pushed) and live — confirmed on onzamj.vercel.app 2026-10-25. Design audit backlog cleared; Playwright suite green.
- **Live Deployment (v3)**: [onzamj.vercel.app](https://onzamj.vercel.app/)
- **Next**: commit + push the 2026-10-25 polish round (nav, fonts, motion, strip, Work alignment).

---

## 💻 Tech Stack & Dependencies
- **Markup & UI**: Semantic HTML5, CSS3 split into `css/*.css` (tokens, scroll-snap, `color-mix`, sticky pinning)
- **Scripting**: Vanilla ES modules in `js/` (no build step; must be served over HTTP)
- **Serverless**: `api/stats.js` (Vercel) → Abacus counter
- **Services**: Abacus (`abacus.jasoncameron.dev`, namespace `mcleinonza`), FormSubmit AJAX
- **Typography**: Bricolage Grotesque (display), Geist (body), Geist Mono (labels/code) via Google Fonts

---

## 📂 Key Files & Structure
- `index.html` — all sections: hero, manifesto, about, work, stack + journey, recognition, training, contact, footer, dialogs.
- `css/` — `tokens.css` first; one stylesheet per area.
- `js/` — `main.js` entry + one module per feature (see ARCHITECTURE.md).
- `api/stats.js` — visits/likes proxy.
- `assets/images/projects/` — composed gallery slides; `awards/` includes `cih-2026-*.jpg` (hackathon).

---

## 🔗 Related Projects & Links
- 🌟 **Central Ecosystem Showcase**:
  - [[Mulat_Media_Website]] — Work gallery.
  - [[Hangguk Grill FINAL]] — Work gallery.
  - [[CaesarCipherApp_FINAL]] — Work gallery.
  - [[MedRecord_App]] — Work gallery.
  - [[AdvanCare]], [[MedCore1]], [[SERVIO]] — Work gallery (added in v3).
- 🗺️ [[_BRAIN/PROJECT_INDEX|Master Project Index]]
- 📊 [[_BRAIN/CROSS_PROJECT_MAP|Cross-Project Map]]
- 🐙 **Repository**: [github.com/Mclein31/MJ_Onza-Personal-Website](https://github.com/Mclein31/MJ_Onza-Personal-Website.git)

---

## ⚠️ Known Limitations
- ES modules don't load from `file://`; use a local server.
- AdvanCare staff console slides use intercepted demo data (no real staff login); MedRec has a single image.
- Student Journalist / Student Leader were awarded at graduation, June 2022, the same date as With High Honors; the three sit together at the end of the newest→oldest order.
