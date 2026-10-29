---
type: decisions-log
title: Personal Website Decisions
project: Personal Website
tags:
  - decisions
  - portfolio
  - web
last_updated: 2026-10-25
---

# ⚖️ Personal Website — Technical Decisions

## 2025-01-05 — Pure Vanilla CSS Design Tokens over Tailwind/Frameworks

### Decision
Build the entire portfolio UI using pure vanilla CSS3 custom properties and Bento Grid layouts with zero CSS frameworks or utility libraries.

### Reason
Achieves the absolute highest performance (<80KB total payload), eliminates build-step friction, gives 100% granular control over 3D transforms, and avoids dependency rot.

### Alternatives
- **Next.js + Tailwind CSS**: Common choice, but creates unnecessary megabytes of JavaScript for a portfolio website.

### Consequences
Ultra-fast sub-second First Contentful Paint and flawless 100 Lighthouse audit scores.

---

## 2025-02-01 — Vercel Serverless Proxy for Stats Counter

### Decision
Implement `api/stats.js` as a Vercel Serverless Function to proxy hit counts and likes from Abacus API rather than calling Abacus directly from clients.

### Reason
Prevents CORS policy blocks, manages caching headers (`no-store`), and provides a clean API layer for future migration to a custom database if needed.

### Alternatives
- Direct client-side `fetch()` to third-party endpoints (can fail if adblockers or strict CORS headers intervene).

### Consequences
Reliable count increments and seamless client integration.

---

## 2026-10-25 — v3 Rebuild Stays Framework-Free, Split into ES Modules

### Decision
Rebuild the site with the same zero-framework approach, but split styles into `css/*.css` and behavior into one ES module per feature under `js/`, loaded from `js/main.js` where each init is wrapped so one failure can't break the page.

### Reason
Keeps the "no build step" decision while making the much larger interaction layer maintainable. ES modules require serving over HTTP (Vercel already does).

### Consequences
Opening `index.html` from disk no longer works; use a local server.

---

## 2026-10-25 — Project Galleries Use Composed Real Screenshots

### Decision
Project cards show swipeable galleries of real screenshots composed into device/browser frames (`assets/images/projects/*.jpg`). No live links or status tags on cards (owner's request), except Mulat Media, which links to mulat-media.vercel.app (owner's request, 2026-10-29). Demo data came from each app's own demo mode (SERVIO offline demo, AdvanCare built-in demo profile) or in-browser intercepted API responses (AdvanCare staff console) — nothing was written to any project database. MedCore uses its existing QA captures in `MedCore1/docs/validation/ui-polish/after/`.

### Alternatives
- AI-generated mockups (rejected: less honest than real UI).
- Bare login-page screenshots of the live sites (rejected: weak visuals).

---

## 2026-10-25 — Playwright Tests as Dev-Only Tooling

### Decision
Add `@playwright/test` and `@axe-core/playwright` as devDependencies (`package.json` exists only for tooling) with specs in `tests/`. Runs on desktop Chrome, Pixel 7 (installed Chrome) and iPhone 14 (WebKit), served by `tests/serve.mjs`.

### Reason
Catch regressions in the interaction layer (palette, dialogs, galleries, stats, calendar) and keep accessibility measurable, without adding a build step to the site.

### Consequences
- Tests mock Abacus, `/api/stats`, the contributions API and FormSubmit, so a run never counts visits/likes or sends email.
- No `"type": "module"` in `package.json`, so Vercel keeps treating `api/*.js` as before; test files use `.mjs`.
- All specs pass since the audit fixes (2026-10-25); a failure now means a regression.

---

## 2026-10-25 — Audit Fixes: Phone Stats Pill, Reduced Motion, Preloader Timing

### Decision
- **Stats pill** lives in the footer's last row in the DOM: it floats (fixed, draggable) above 860px and sits static in the footer on phones, where a floating pill covered buttons.
- **Reduced motion** limits `transition-property` to opacity/colour properties instead of shrinking every `transition-duration` to 0.01ms.
- **Preloader** is clock-timed (`setTimeout`), not frame-timed, and overlaps page load: done 750ms after navigation (min 350ms of counting). The hero rise starts at 100 under the wipe (700ms, 30ms stagger). First visit ≈ 1.8–2.1s to a readable name.
- **Hover instructions** use `.on-hover` / `.on-touch` spans ("Hover" vs "Tap"), and schema rows join on tap.

### Reason
WCAG checks in `npm test`, plus a real bug: the blanket 0.01ms duration made every element transition `all`, so the footer wordmark fit read stale widths and collapsed to ~1px for reduced-motion phone users. A frame-timed counter also stretched to the 2.6s failsafe whenever rAF was starved.

---

## 2026-10-25 — Nav Hides on Visitor Intent; Fonts Self-Hosted

### Decision
- The nav bar hides only on scrolls the visitor drives (wheel/trackpad, touch, scroll keys), 48px past where they last scrolled up; any other scroll (anchor jumps, ⌘K, layout shifts from late content) keeps it visible.
- Fonts are self-hosted from `assets/fonts/` via `css/fonts.css` (OFL), same files and unicode ranges Google served, Cyrillic/Vietnamese dropped.

### Reason
- Timer-based "hold during jump" logic kept failing when content above the viewport resized after arrival (browser scroll anchoring scrolls the page down). Intent is the real signal.
- The Google Fonts stylesheet was render-blocking (~200–250ms cold) and an external dependency.

### Alternatives
- Holding the bar for a fixed time after jumps, or a movement threshold alone (rejected: both lose to large late layout shifts).


---

## 2026-10-25 — Views Count Unique Visitors

### Decision
The stats pill's view count increments once per browser, ever: `js/stats.js` sets `site_user_has_visited` in localStorage after a successful increment. Browsers that already have a cached `site_total_visits` count as visited, so existing visitors aren't counted twice when this rolls out.

### Reason
Owner wants only new visitors to move the number; the old sessionStorage flag counted every new tab or browser restart.

### Alternatives
- Server-side IP dedup in `api/stats.js` (rejected: Abacus has no per-visitor storage, and it would need a database). Clearing site data, private windows, or another browser/device still count as new visitors.

---

## 2026-10-27 — v4 Visual Redesign: Hallmark "Studio" Theme, Data Touches

### Decision
The draggable tech icons (eight data and backend tools, ink-toned with colour on hover or drag, in their own zone, never over the name) and the scroll-lit manifesto stay (owner asked to bring them back). Full redesign of the look and layout with the Hallmark skill (theme Studio, chosen by the owner over the dealt Almanac): cool proof paper with a dot grid, Hedvig Letters Serif heads over Geist, Geist Mono only for data (schema table names, column types, timestamps, figures), crop-marked "printed sheets" for galleries, tables and photos, one orange for the primary action. Light and dark both derived from the same tokens. Content, links, form fields, script hooks and tests unchanged; all Playwright specs pass.

### Dropped (owner reviewed live)
Custom cursor and magnetic buttons, photo marquee (now a still rail), SQL-style eyebrows above headings (`.table-name` stays as a hook on each head block for the nav-landing test), hand-drawn macOS demo window chrome, hero font-metric guides (owner found them odd).

### Notes
- `css/tokens.css` opens with the Hallmark stamp, waivers and dismissals; `.hallmark/` holds the before record and log.
- `theme.js` still sets `theme-color` to `#f2f3ef` / `#0b0c0d` (the theme test asserts it); the new paper is slightly cooler.
