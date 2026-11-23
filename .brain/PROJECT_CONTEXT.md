---
type: project-brain
title: Personal Website Project Context
project: Personal Website
status: live
tags:
  - project
  - portfolio
  - web
  - showcase
  - serverless
last_updated: 2026-11-23
---

# 🌐 Personal Website — Project Context

## 📌 Overview & Purpose
**Personal Website** is the developer portfolio of **McLein Jei Onza** (BSCS, Cagayan State University,
Class of 2028; aiming for data engineering). It is a single animated page with a companion `404.html`: a
column-scan intro loader, a spec-sheet Hero with a raw WebGL Extract → Transform → Load particle field
(and static SVG fallback) plus a 24-tool row, Work with an index table and one-viewport-per-project spec
sheets (prev/next/tick/swipe/key screenshot galleries and promo video dialogs), a rising dark ink About
field with a "What I do" `<details>` accordion, a vertical-spine Journey log, live GitHub Activity calendar,
interactive Stack schema tables, Recognition and Training editorial indexes with desktop hover previews and
lightbox, Contact with direct email copy, inline visits/likes stats, 4 channel cards (including a 16-week
GitHub mini grid) and message dialog, and a footer. The current design (since 2026-11-23) is the **"Instrument"**
redesign (v5 Direction A): cool light-grey/dark grounds (`#E9EAEC` / `#0F1012`), 2px hairline corners, Geist
(weights ≥400) and Geist Mono, international orange (`#FF4F00` / `#FF5A1A`) used sparingly for markers/scans,
and rare cobalt (`#2448D8` / `#7088FF`) focus/probe accents. Retained owner rules (no thin fonts, no
page-spanning scroll line, no location/clock, one copy action, no "With High Honors", iPhone Duo support)
live in [DECISIONS.md](DECISIONS.md).

---

## 🎯 Status (verified 2026-11-23)
- **Live (pre-v5)**: [mcleinjeionza.vercel.app](https://mcleinjeionza.vercel.app/) (Vercel project `onzamj`; the old
  `onzamj.vercel.app` still redirects with a temporary 307).
- **Instrument redesign (v5)** is implemented in the working tree (uncommitted, not yet deployed); `assets/images/og-image.jpg`
  and its alt text still reflect the 2026-11-18 Signal hero pending regeneration.
- Google Search Console verified, sitemap submitted, indexing requested (2026-11-03); indexing/ranking still
  unconfirmed. See [SEO_SETUP.md](SEO_SETUP.md).
- Open work is in [TODO.md](TODO.md). Owner design rules live in [DECISIONS.md](DECISIONS.md).

---

## 💻 Tech Stack & Dependencies
- **Markup & UI**: `index.html` and `404.html`; CSS split into `styles/*.css` (15 files, `tokens.css` first) plus `vendor/lenis/lenis.css`.
- **Scripting**: vanilla ES modules in `scripts/` (`main.js` entry, 16 modules in `scripts/core/`, 10 files in `scripts/design/`); **no build step**; must be served over HTTP.
- **Vendored libraries (`vendor/`, self-hosted ESM, minified in place, no runtime CDNs)**: GSAP `3.15.1` (`ScrollTrigger`, `SplitText`, `Flip`, `CustomEase`, `ScrollToPlugin`), Lenis `1.3.27` (fine pointers with motion enabled), and OGL `1.0.11` (vendored; hero field uses raw WebGL directly).
- **Delivery & Serverless (Vercel)**: `vercel.json` Cache-Control headers; `api/stats.js` (visits/likes proxy → Abacus) and `api/contributions.js` (GitHub contribution calendar for `Mclein31`, with a jogruber API fallback in the client).
- **Services**: Abacus (`abacus.jasoncameron.dev`, namespace `mcleinonza`), FormSubmit AJAX (`mcleinjeionza06@gmail.com`), GitHub.
- **Typography** (self-hosted, `styles/tokens.css`, `assets/fonts/`): Geist (display and body, ≥400) and Geist Mono (labels, dates, tabular data). Hedvig Letters Serif removed.
- **Dev tooling only**: `package.json` with `@playwright/test` 1.64.1 and `@axe-core/playwright` 4.14.0 (`npm run test:v5`, `npm run audit:v5`, `npm test`).

Structure and module map: [ARCHITECTURE.md](ARCHITECTURE.md). Gotchas, slide recipes and counters: [NOTES.md](NOTES.md).

---

## 🔗 Related Projects & Links
- 🌟 **Central Ecosystem Showcase** (Work gallery, in page order): [[AdvanCare]], [[MedCore1]], [[SERVIO]],
  [[MedRecord_App]], [[Mulat_Media_Website]]. [[Hangguk Grill FINAL]] is mentioned in the Journey only (card
  removed 2026-10-25); [[CaesarCipherApp_FINAL]] (Cipher Shift) was removed 2026-11-04.
- 🗺️ [[_BRAIN/PROJECT_INDEX|Master Project Index]]
- 📊 [[_BRAIN/CROSS_PROJECT_MAP|Cross-Project Map]]
- 📚 Obsidian vault: `PersonalPortfolio/` (tracked in this repo).
- 🐙 **Repository**: [github.com/Mclein31/MJ_Onza-Personal-Website](https://github.com/Mclein31/MJ_Onza-Personal-Website.git)
