---
type: changelog
title: Personal Website Changelog
project: Personal Website
tags:
  - changelog
  - history
last_updated: 2026-10-25
---

# 📜 Personal Website — Changelog

## [Unreleased] — Testing & Audit (2026-10-25)
- **Added**: Playwright + axe test suite (`tests/`, `playwright.config.mjs`, dev-only `package.json`); 39 pass, 15 fail on known audit findings (see TODO.md "Design Audit Backlog").
- **Fixed**: All 15 audit failures — suite now 54/54. Muted-ink contrast, 24px gallery dot targets, keyboard-reachable galleries/film/calendar, inert trait-deck back cards, like-button name, phone stats pill moved into the footer, "Hover"/"Tap" copy, schema tap-to-join, faster clock-timed preloader (~2.1s to a readable name), absolute `og:image` (`assets/images/og-image.jpg`) + canonical.
- **Removed**: ⌘K command palette (nav "Jump to" button, footer hint, `/` and Ctrl/⌘+K shortcuts, `js/palette.js`) at the owner's request.
- **Fixed**: Nav jumps landed ~250px low (88px nav clearance + section padding stacked). Sections now land 50px under the nav (`scroll-margin-top`); Work lands at its pinned start. Activity placeholder reserves the calendar's real height so Safari (no scroll anchoring) doesn't shift after a jump.
- **Fixed**: Nav bar no longer hides after a nav link / ⌘K jump (hides only on visitor-driven scrolls). Work section track now sits on the content column instead of starting at the screen gutter (was ~300px off on 1920px screens).
- **Changed**: Self-hosted fonts; hover effects gated to hover-capable devices; UI transitions cut to 240ms; nav dot / calendar cells no longer grow from near-zero; photo strip pauses off screen; preloader overlaps page load (done 750ms after navigation, min 350ms of counting).
- **Tests**: First-visit timing measured from the page's animation timeline and run as a separate stage after the suite (`*-timing` projects); nav tests assert the bar stays visible after jumps and still hides on wheel scroll.
- **Fixed**: Reduced-motion users saw the footer wordmark collapse to ~1px on phones (blanket 0.01ms transitions made `font-size` transition); reduced motion now limits `transition-property` to opacity/colour. Regression check added to `tests/motion.spec.mjs`.

## [3.0.0] — Full Rebuild (branch `portfolio-rebuild-v2`)
- **Changed**: New visual system — graphite + signal lime, paper-white light mode; Bricolage Grotesque / Geist / Geist Mono.
- **Changed**: `style.css` + `main.js` replaced by `css/*.css` and ES modules in `js/` (no build step).
- **Added**: Preloader, kinetic hero name, live SQL query card, scroll-lit manifesto, pinned horizontal work section, skills-as-schema tables with row "joins", self-drawing timeline, stacked award cards, ⌘K command palette, custom cursor, magnetic buttons.
- **Added**: Projects AdvanCare, MedCore and SERVIO; MedRec described as v2. Each card is a swipeable screenshot gallery (no status tags or links, per owner).
- **Added**: Cagayan Innovation Hack 2026 — 2nd place (₱10,000) with AdvanCare; awards ordered newest → oldest.
- **Removed**: 3D coverflow, the 25-byte stub stylesheets, hero scroll cue, pulsing nav/status dots.
- **Changed (later, same day)**: MedRec v2 screens; 3 more Mulat Media slides; Hanguk Grill card removed; Cipher Shift playable in a demo window; phone-frame island inset.
- **Performance**: award/training photos resized (~46MB → ~9MB); 64px favicon.

## [2.2.0] — Coverflow & Image Optimization
- **Changed**: Updated Hanguk Grill project cover image and enhanced 3D coverflow carousel navigation buttons.
- **Added**: DTI YEP training photo slider and awards lightbox modal.
- **Added**: Vercel serverless stats proxy (`api/stats.js`) for visit and like counting.

## [2.0.0] — Bento Grid & 3D Coverflow Redesign
- **Added**: Modern Bento grid layout for About Me, Education, and Tech Stack.
- **Added**: 3D Coverflow carousel with responsive touch and mouse swipe support.
- **Added**: Interactive terminal emulator with multi-tab viewing.
- **Added**: Obsidian Dark and Alabaster Light theme toggling with system sync.

## [1.0.0] — Initial Portfolio Release
- **Added**: Semantic HTML5 portfolio and contact form.
