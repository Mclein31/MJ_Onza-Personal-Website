---
type: todo-list
title: Personal Website Tasks & Backlog
project: Personal Website
tags:
  - todo
  - backlog
last_updated: 2026-11-16
---

# 📋 Personal Website — TODO & Task Tracker

## 🔴 Open
- [ ] Confirm FormSubmit delivers to the new contact address `mcleinjeionza06@gmail.com` (changed 2026-11-14 in
  `d36e90f`; FormSubmit requires a one-time activation per address before AJAX submissions arrive).
- [ ] Vercel domain settings: change the `onzamj.vercel.app` redirect from temporary 307 to permanent 308 (still 307
  on 2026-11-15). See [SEO_SETUP.md](SEO_SETUP.md).
- [ ] Reinspect the homepage in Search Console for "URL is on Google"; monitor name-search queries.
- [ ] Set the canonical site URL on the owner's GitHub and LinkedIn profiles (SEO identity reinforcement).
- [ ] Keep featured project links and demo screenshots synchronized with recent code releases.
- [ ] Optional: real AdvanCare staff-console screenshot; recapture MedRec at native resolution like the other decks.
- [x] Optional cleanup: `js/cursor.js` still runs although `.cursor` is hidden, and `scroll.js`/`ui.js` keep hooks for
  removed manifesto, timeline, award-scaling, trait-deck and tilt markup.

## 🟡 Medium Priority
- [ ] Add an interactive blog / tech articles section linking to published pieces.

## 💡 Future Ideas
- [ ] Embed interactive mini-games or WebAssembly canvas demos. (Originally "into the terminal"; the v2 terminal
  emulator no longer exists.)

## ✅ Done
- [x] Review v3, commit, merge and deploy (2026-10-25).
- [x] Confirm hackathon wording ("I built the software side…"): McLein built the software; the team coach delivered the pitch. Journey reworded to match.
- [x] Dates for Student Journalist / Student Leader awards: both given at graduation, June 2022 (same as With High Honors).
- [x] Optimize award certificate image file sizes (v3: ~46MB → ~9MB; WebP conversion 2026-11-02: 9.4 MB → 4.0 MB).
- [x] ~~Command palette (`Cmd+K` / `Ctrl+K`)~~ — built in v3, removed 2026-10-25 at the owner's request.
- [x] Domain moved to `mcleinjeionza.vercel.app`; canonical/OG metadata updated (2026-11-02, live).
- [x] Name-search SEO: JSON-LD, robots.txt, sitemap.xml, Search Console verification, sitemap submission and indexing request (2026-11-02 to 2026-11-03).
- [x] Gallery refresh at native resolution; Cipher Shift removed (2026-11-04).
- [x] First Journey slide replaced with "Started coding" (2026-11-14, live).
- [x] ~~Add sound effects toggle~~ — obsolete: interface sounds shipped 2026-11-01 and the owner removed the mute control on 2026-11-02.
- [x] ~~Hero floating icons reach the screen edge on phones (up to 412px on a 412px screen)~~ — obsolete: the floating icons became a full-width carousel inside `.hero__zone` (2026-11-01).

### Design Audit Backlog (2026-10-25 — Impeccable · Emil Kowalski · Taste skills + Playwright)
All items fixed 2026-10-25; suite was green (54 pass) at the time. 🧪 = check in `npm test`.
- [x] 🧪 Muted text `--ink-3` contrast → dark `#878a83`, light `#62655f` (≥4.5:1 on every surface). Project index badge background 0.55 → 0.7. (Values from the v3 palette; tokens have since changed.)
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
