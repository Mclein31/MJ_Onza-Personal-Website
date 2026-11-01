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
last_updated: 2026-11-01
---

# 🌐 Personal Website — Project Context

## 📌 Overview & Purpose
**Personal Website** is the developer portfolio of **McLein Jei Onza** (BSCS, Cagayan State University, Class of 2028; aiming for data engineering). v3 (Oct 2026) is a full rebuild with a data-pipeline theme: kinetic hero with a live SQL query card, scroll-lit manifesto, pinned horizontal work section with per-project screenshot galleries, skills as schema tables, a self-drawing journey timeline, stacked award cards (newest first, led by the Cagayan Innovation Hack 2026 2nd place), the DTI YEP feature, and the existing visit/like stats.

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
- **Typography** (self-hosted, `css/fonts.css`): Hedvig Letters Serif (heads, name, wordmark), Geist (body), Geist Mono (data only: identifiers, timestamps, figures). v4 Studio look, see DECISIONS 2026-10-27.

---

## 📂 Key Files & Structure
- `index.html` — all sections: hero, manifesto, about, work, stack + journey, recognition, training, contact, footer, dialogs.
- Favicon (2026-11-01): owner's portrait in a black formal shirt, phone retained, white background; zoomed toward the face in a circular crop with transparent corners. `assets/Logo/favicon-circle-{64,192}.png`, sourced from `mclein-formal-circle.png`; original full photo is `mclein-formal-phone.png`.
- `css/` — `tokens.css` first; one stylesheet per area.
- `js/` — `main.js` entry + one module per feature (see ARCHITECTURE.md).
- Hero layout (owner-approved exception to desktop restoration): single-column with a 100vh minimum height, oversized desktop name on one line, quiet lower-background marquee, intro/actions sharing a row on desktop and stacking on smaller screens, and full-width icon carousel at the bottom. The whole content group sits 24–56px higher (6vh) to reduce the blank area below navigation; short screens retain normal navigation clearance. Primary hero action is a filled pill; secondary action remains text. Decorative background text runs at half speed (140/158/176/194s per loop).
- Hero name accents: the dot over the lowercase i and the period after Onza use light orange (#ffb078); the i stem keeps the theme ink colour.
- Hero tools: horizontal, swipeable carousel in `.hero__zone`, with gentle looping auto-scroll, hover/focus/touch pause and arrow-key support; no visible play/pause control. Icons can be dragged out and spring back into their slots; reduced motion disables auto-scroll and returns dragged icons immediately. Mobile hero uses 24px after nav clearance and between text and icons (2026-11-01).
- Section headings (2026-11-01): use only the main headings; owner removed all small uppercase dot-prefixed section labels (Selected work, About, Journey, Activity, Stack, Recognition, Training).
- Responsive layout scope (2026-11-01): preserve the original desktop/laptop layouts and scroll animations. Work retains pinned horizontal scrolling where originally enabled; its pinned heading uses a compact row beneath navigation to move cards into the unused upper space, and its gallery height reserves room for the tallest project description and progress row so laptop screens do not clip details; Journey retains pinned year-by-year transitions. Only phone/tablet spacing (≤960px) is compacted, including a measured content-sized Journey stage. Do not replace these animations with static grids/timelines during layout fixes.
- Contact wallet has GitHub, LinkedIn, WhatsApp and Gmail cards. The latter three use local brand logo assets and matching blue, green and white/red palettes. WhatsApp uses the owner-provided wa.me link; wallet height derives from card count. GitHub pass loads contributions independently via the shared `js/contributions.js` request (including retries), and uses a fixed GitHub dark palette in both site themes: dark canvas, neutral bordered Follow button and green contribution levels (`css/wallet.css`).
- Journey date corrections supplied by owner: DTI YEP / Pitch Perfect in May 2026; first independent sites in late August 2026. Display year only on timeline labels and keep chronological order. Cagayan Innovation Hack location: Tuguegarao City, Cagayan. Restored gray journey secondary text and black highlight boxes with white lettering throughout both themes. Use orange sparingly as hero-style underlines on recruiter-relevant keywords (Python, PostgreSQL/SQL and shipped-project count), not orange boxes or full orange lines.
- `api/stats.js` — visits/likes proxy.
- `assets/images/projects/` — composed gallery slides (transparent WebP, see NOTES); `awards/` includes `cih-2026-*.jpg` (hackathon).

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
- Student Leader was awarded at graduation, June 2022, the same date as With High Honors; both sit at the end of the newest→oldest order. The Student Journalist card was removed at the owner's request (2026-10-31); its team photo stays in the photo strip.
