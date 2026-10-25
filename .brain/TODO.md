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
- [ ] Review v3 on `portfolio-rebuild-v2`, commit, then merge and deploy.
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
- [ ] Self-host the fonts: the Google Fonts stylesheet is render-blocking (~200–250ms on a cold load) and makes the first-visit timing test flaky under parallel load.
- [ ] Photo strip is an infinite marquee (Impeccable + Taste flag it); consider a static strip or pausing off-screen.
- [ ] Motion polish (Emil): hover effects not gated by `(hover: hover)` (schema rows done); nav active dot enters from `scale(0)` and calendar cells from `scale: 0.4` (start ≥0.9 with opacity); several UI transitions 500–1100ms (aim ≤300ms for UI).
- [ ] Nav jump hides the bar (scroll-down hide triggers on anchor scrolls), so the next link needs a scroll up first.

## 🟡 Medium Priority
- [ ] Add an interactive blog / tech articles section linking to published pieces.
- [x] Implement command palette (`Cmd+K` / `Ctrl+K`) for keyboard-driven site navigation. (v3)

## 🟢 Low Priority
- [ ] Add sound effects toggle (subtle click audio for terminal and buttons).
- [x] Optimize award certificate image file sizes. (v3: ~46MB → ~9MB)

## 💡 Future Ideas
- [ ] Embed interactive mini-games or WebAssembly canvas demos into the terminal.
