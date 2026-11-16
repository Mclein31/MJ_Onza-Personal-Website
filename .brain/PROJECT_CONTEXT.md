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
last_updated: 2026-11-15
---

# 🌐 Personal Website — Project Context

## 📌 Overview & Purpose
**Personal Website** is the developer portfolio of **McLein Jei Onza** (BSCS, Cagayan State University,
Class of 2028; aiming for data engineering). It is a single animated page: hero with a draggable tool-icon
carousel, pinned horizontal Work section with per-project screenshot galleries and promo videos, About with a
"What I do" accordion, a pinned year-by-year Journey, GitHub Activity, Stack schema tables, Recognition and
Training cards, a Contact wallet of channel cards, and a footer ASCII lighthouse scene. Visit/like stats sit in
a floating pill. The current look (since 2026-11-01) follows the owner's jeancreate.com-inspired redesign on a
cool white/gray palette with felt paper texture and subtle liquid-glass cards.

---

## 🎯 Status (verified 2026-11-15)
- **Live**: [mcleinjeionza.vercel.app](https://mcleinjeionza.vercel.app/) (Vercel project `onzamj`; the old
  `onzamj.vercel.app` still redirects with a temporary 307).
- `main` is in sync with `origin/main`; last code commit 2026-11-14 (first Journey slide replaced with
  "Started coding"; contact email changed to `mcleinjeionza06@gmail.com`, including the FormSubmit endpoint).
- Google Search Console verified, sitemap submitted, indexing requested (2026-11-03); indexing/ranking still
  unconfirmed. See [SEO_SETUP.md](SEO_SETUP.md).
- Open work is in [TODO.md](TODO.md). Owner design rules live in [DECISIONS.md](DECISIONS.md).

---

## 💻 Tech Stack & Dependencies
- **Markup & UI**: one `index.html`; CSS split into `css/*.css` (17 files, `tokens.css` first).
- **Scripting**: vanilla ES modules in `js/` (21 modules, `main.js` entry); **no build step**; must be served over HTTP.
- **Serverless (Vercel)**: `api/stats.js` (visits/likes proxy → Abacus) and `api/contributions.js` (GitHub
  contribution calendar for user `Mclein31`, with a jogruber API fallback in the client).
- **Services**: Abacus (`abacus.jasoncameron.dev`, namespace `mcleinonza`), FormSubmit AJAX, GitHub.
- **Typography** (self-hosted, `css/fonts.css`): Geist (display and body), Hedvig Letters Serif (footer
  wordmark), Geist Mono (data only).
- **Dev tooling only**: `package.json` with `@playwright/test` 1.64.1 and `@axe-core/playwright` 4.14.0;
  specs in `tests/` run on desktop Chrome, Pixel 7 and iPhone 14 (WebKit).

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
