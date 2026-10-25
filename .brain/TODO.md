---
type: todo-list
title: Personal Website Tasks & Backlog
project: Personal Website
tags:
  - todo
  - backlog
last_updated: 2026-10-25
---

# 📋 Personal Website — TODO & Task Tracker

## 🔴 High Priority
- [x] Review v3, commit, merge and deploy — live on onzamj.vercel.app (confirmed 2026-10-25).
- [x] Confirm hackathon wording ("I built the software side…"): confirmed. McLein built the software; the team coach delivered the pitch. Journey timeline reworded from "Pitched AdvanCare…" to match.
- [x] Dates for Student Journalist / Student Leader awards: both given at graduation, June 2022 (same as With High Honors).
- [ ] Optional: real AdvanCare staff-console screenshot and more MedRec screens for the galleries.
- [ ] Keep featured project links and demo screenshots synchronized with recent code releases.

## 🔍 Design Audit Backlog (2026-10-25 — Impeccable · Emil Kowalski · Taste skills + Playwright)
Each item below is either a check in `npm test` (marked 🧪) or a skill finding. All 🧪 items fixed 2026-10-25; suite is green (54 pass).
- [x] 🧪 Muted text `--ink-3` contrast → dark `#878a83`, light `#62655f` (≥4.5:1 on every surface). Project index badge background 0.55 → 0.7.
- [x] 🧪 Stats pill covered buttons on phones → sits in the footer's last row ≤860px (still floats/drags on desktop).
- [x] 🧪 First visit name readable at ~3.3s → ~2.1s (clock-timed 750ms preloader, hero rises under the wipe, 700ms rise / 30ms stagger).
- [x] 🧪 `og:image` → absolute `assets/images/og-image.jpg` (1200×630 current hero, CTA row hidden); added canonical, og:image size/alt, `twitter:card`.
- [x] 🧪 Gallery dots → 24×24 buttons with the 6px dot drawn by `::before`.
- [x] 🧪 Gallery/film tracks focusable with ←/→ (`arrowKeys()` in `util.js`); calendar scroller focusable only while it overflows; trait deck back cards `inert`; like button name now includes its visible count.
- [x] 🧪 "Hover" copy → "Tap" on touch screens (`.on-hover` / `.on-touch`); schema rows join on tap.
- [x] Reduced motion now limits `transition-property` to opacity/colour (was 0.01ms on everything, which also collapsed the footer wordmark to ~1px on phones).
- [x] Fonts self-hosted (`css/fonts.css`, `assets/fonts/*-v*.woff2`, latin/latin-ext + Geist Mono symbols2); no Google requests, DOMContentLoaded ~250ms → ~100ms.
- [x] Photo strip kept as a marquee (owner didn't pick; default) but pauses off screen, on hover and on keyboard focus. Make it static if preferred.
- [x] Motion polish: all 35 `:hover` rules gated by `(hover: hover)`; nav dot starts at scale 0.5 + fade; calendar cells at 0.9; UI transitions (hover, nav, menu, theme icon, toast, deck, dialogs) → 240ms. Entrances (preloader, hero, reveals, calendar fill, theme crossfade) unchanged.
- [x] Nav bar now hides only on visitor-driven scrolls (wheel/touch/scroll keys); anchor jumps, ⌘K and layout shifts never hide it.
- [x] Work section track aligned to the content column (first card under the heading, last card on the right edge); "scroll →" kept clear of the stats pill.
- [ ] Hero floating icons reach the screen edge on phones (up to 412px on a 412px screen) — check whether that's intended.

## 🟡 Medium Priority
- [ ] Add an interactive blog / tech articles section linking to published pieces.
- [x] Implement command palette (`Cmd+K` / `Ctrl+K`) for keyboard-driven site navigation. (v3)

## 🟢 Low Priority
- [ ] Add sound effects toggle (subtle click audio for terminal and buttons).
- [x] Optimize award certificate image file sizes. (v3: ~46MB → ~9MB)

## 💡 Future Ideas
- [ ] Embed interactive mini-games or WebAssembly canvas demos into the terminal.
