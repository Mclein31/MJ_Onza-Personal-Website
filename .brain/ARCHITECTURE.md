---
type: architecture
title: Personal Website Architecture
project: Personal Website
tags:
  - architecture
  - portfolio
  - web
  - serverless
last_updated: 2026-11-23
---

# 🏛️ Personal Website — Architecture

## 📐 Frontend & Serverless Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│   Personal Website Frontend (index.html + 404.html, no build step)     │
│   styles/*.css (16 files) · scripts/main.js -> core/ + design/         │
│   vendor/ (self-hosted ESM: gsap 3.15.1, lenis 1.3.27, ogl 1.0.11)     │
├──────────────────────────────────┬─────────────────────────────────────┤
│ Sections (index.html):           │ Core + Design JS (scripts/):        │
│ - Intro loader + fixed header    │ - Theme toggle w/ circular wipe     │
│ - Hero (WebGL ETL field + tools) │ - Once-per-session intro gate       │
│ - Work (index table + 5 projects)│ - GSAP + ScrollTrigger + Lenis      │
│ - About (page-ground bio + does) │ - Scroll-spy + phone menu trap      │
│ - Journey (vertical-spine log)   │ - Galleries (snap/wipe) + Lightbox  │
│ - Activity (GitHub year grid)    │ - Promo video dialog + Toast        │
│ - Stack (5 schema join tables)   │ - Contact FormSubmit + Stats sync   │
│ - Recognition & Training indexes │ - Hero WebGL field + Scrollbar rail │
│ - Contact (SQL query) + Footer   │ - 2D dot-matrix wordmark + Motion   │
└──────────────────────────────────┴──────────────────┬──────────────────┘
                                                      │ fetch
                                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Vercel Serverless Functions (api/)                   │
│  - stats.js: CORS preflight; proxies visits & likes to Abacus          │
│    (namespace 'mcleinonza'); `portfolio_visited` cookie dedup          │
│  - contributions.js: GitHub contribution calendar for Mclein31         │
└──────────────────────┬──────────────────────────────┬──────────────────┘
                       ▼                              ▼
┌─────────────────────────────────────┐ ┌────────────────────────────────┐
│ Abacus (abacus.jasoncameron.dev)    │ │ GitHub public calendar         │
│ - portfolio_views (visits)          │ │ (client falls back to          │
│ - portfolio_likes                   │ │  github-contributions-api      │
└─────────────────────────────────────┘ │  .jogruber.de)                 │
                                        └────────────────────────────────┘
Contact form: FormSubmit AJAX (direct from the browser to mcleinjeionza06@gmail.com).
```

---

## 🎨 Styles (`styles/`, 16 files)

Linked in `<head>` after `/vendor/lenis/lenis.css` in strict cascade order (the old `css/` directory was removed):

| File | Owner | Scope |
|---|---|---|
| `tokens.css` | W1 foundation | `@font-face` (`Geist` 100–900, `Geist Mono` 400–500 from `/assets/fonts/`), light/dark palette tokens (`--bg`, `--bg-2`, `--plate`, `--ink*`, `--rule*`, `--orange`, `--cobalt`, `--field`, `--on-ink`, `--scrim`, `--theme-color-*`), type scale, grid (`--m`, `--g`, `--nav-h`, `--r: 2px`, `--btn-h`, `--section-gap`), motion easings, `color-scheme: only light` opt-out |
| `base.css` | W1 foundation | Reset, `.container` (12-col / 4-col), `.label`, `.rule`, `.section-head`, `.plate` (corner registration ticks), unified `.btn` hierarchy (`.btn--primary/secondary/ghost/icon/sm`), `.seg`, `.skip-link`, circular theme View Transition, `html.has-reveal` transitions + 4s CSS failsafe (`@keyframes reveal-failsafe`), `prefers-reduced-motion` overrides |
| `loader.css` | W1 foundation | Column-scan intro overlay (`[data-intro]`) |
| `nav.css` | W1 foundation | Fixed header bar (`[data-header]`), active `[aria-current]` orange square, progress readout, single `[data-theme-toggle]` icon button (moved into `.site-header__menu-theme` inside `[data-menu]` at `<1180px` by inline script), phone/tablet full-height menu drawer (`<1180px`) |
| `hero.css` | W1 / H2 / H3 | Minimal `.hero__status` line, sticky desktop WebGL hold (`>=961px` fine pointer), 12-col / 4-col hairlines (`--hair`), desktop-only `.hero__axis` stage labels (lines `2`/`6`/`10`), dimmed SVG poster fallback (`hero-field-{grey,orange}.svg` + `-phone.svg` at `<=720px`), `890×626` short-landscape adaptation, 24-tool row (hidden at `<=720px`) |
| `work.css` | W2 work | `.work__table` project index, per-project 12-col `.project__grid` spec sheet + `.project__plate` (`<=960px` stacked, `890×626` height-capped), `.project__ghost`/`.project__scan` wipe layers, end link |
| `about.css` | AB2 / W3 about | Unified page ground `var(--bg)` in both themes (no longer an ink band), top `.about__top-rule` hairline, `SplitText` `.about__title`, profile spec list, `<details name="does">` accordion |
| `journey.css` | W4 journey | 7-entry vertical log (`[data-journey-log]`), left hairline spine + scroll-driven fill + sliding orange marker |
| `activity.css` | W5 activity+stack | Cool-grey → `--orange` level 4 contribution grid (`[data-level="0..4"]`), sticky weekday gutter, loading shimmer & dot lattice, error card, 4-cell mono readout + floating tooltip (`[data-act-tip]`) |
| `stack.css` | W5 activity+stack | 5-table database schema layout (1 col on phones/768/Duo -> 2 cols at 960 -> 2-over-3 at 1120px), join-highlight states (`.is-source`, `.is-joined`, `.has-join`) |
| `recognition.css` | W6 recognition+training | Numbered editorial index rows (`[data-rec-row]`), open cols 9–10 preview corridor on fine-pointer desktop (`>=1024px`), inline `.plate` thumbs on touch/narrow viewports |
| `training.css` | W6 recognition+training | DTI YEP boot camp index row + 8-plate horizontal/grid program gallery |
| `contact.css` | W7 / CF2 | Aside identity, inline visits/likes stats, two-line SQL `.contact__query` + `1 row` availability result, primary message CTA, single direct email `[data-copy]` row, 4 channel cards with `620ms` orange scan-line hover/focus + 16-week GitHub mini grid (`<=960px` places query first, aside last) |
| `footer.css` | W7 / CF2 | Hairline rule, 3-column layout (*Sections*, *Elsewhere*, *Colophon*) + Back to top, centred edge-to-edge `.wordmark` (`"McLein Jei Onza"` / `"Onza"` `<720px` container, 4px SVG dot-mask fallback), year & `Load complete` status |
| `dialogs.css` | W7 contact+footer+dialogs | Lightbox (`dialog[data-lightbox-dialog]`), message form (`dialog[data-message]`), promo video (`dialog[data-video]`), and `[data-toast]` live region |
| `scrollbar.css` | S2 scrollbar | Thin styled native scrollbars on touch and inner scroll containers (`.activity__scroll`, `.site-header__menu`, `.message__form`, `dialog`, `[data-lenis-prevent]`, `textarea`) + fixed `.sbar` custom scrollbar rail on `@media (pointer: fine)` (hides `html` native scrollbar) |

---

## ⚙️ Entry & Behaviour Core (`scripts/main.js` & `scripts/core/`)

The old `js/` directory was removed. `scripts/main.js` is the single module entry (`<script type="module" src="/scripts/main.js">`). It starts fetching `core/motion.js` in parallel, executes each init inside an isolated `step(name, fn)` try/catch (so one failure never breaks downstream modules), runs `designSteps` from `scripts/design/index.js`, schedules `settle()` (`motion.refresh()` after window `load` + `document.fonts.ready` + eager `<img>` completion, plus on `activity:ready` and `intro:done`), sets `html[data-site-ready="true"]`, and dispatches `site:ready` (`{ ok, failed, ms }`).

### Core Init Order (`scripts/main.js`)
1. `theme` (`scripts/core/theme.js`) — `initTheme()`: syncs `[data-theme-toggle]`, `aria-pressed`, `data-theme-current`, and `meta[name="theme-color"]` from `--theme-color-light/dark`; drives circular `document.startViewTransition()` with `--theme-x/--theme-y/--theme-r` (instant under reduced motion); listens to OS changes until `localStorage['portfolio-theme']` is explicitly set. Flash-free bootstrap runs inline in `<head>`.
2. `intro` (`scripts/core/intro.js`) — `initIntro()`: owns the once-per-session intro gate (details below).
3. `motion` (`scripts/core/motion.js`) — `initMotion()`: registers GSAP `ScrollTrigger`, `SplitText`, `Flip`, `CustomEase`, and `ScrollToPlugin` (re-exported so all modules share one instance); initializes Lenis (`lerp: 0.1`, `syncTouch: false`, `allowNestedScroll: true`, `anchors: false`) only when `(pointer: fine)` and motion is not reduced (rebuilding live on preference changes); attaches the Lenis lock handler to `lock.js`; debounces `refresh()` on late image/video loads.
4. `nav` (`scripts/core/nav.js`) — `initNav()` (skipped if `motion.js` failed): scroll-spy across the 8 `[data-nav]` links, header hide/show past `[data-hero]` with an 8px dead zone, phone menu drawer (`[data-menu]`, Tab trap, `[data-menu-inert]`, `Escape`, click-outside, auto-close at desktop width), and `a[href="#id"]` routing via `motion.scrollTo` + `pushState` + target focus.
5. `toast` (`scripts/core/toast.js`) — `initToast()`: manages `[data-toast]` / `[data-toast-text]` polite live region and `toast:show` events.
6. `page` (`scripts/core/page.js`) — `initPage()`: updates `[data-year]` and handles delegated `[data-copy]` clicks with clipboard fallback, `[data-copy-label]` toast, `data-state="copied"`, and `copy:done`.
7. `galleries` (`scripts/core/gallery.js`) — `initGalleries()`: manages scroll-snap tracks (`[data-gallery-track]`), prev/next wrap, auto-generated `[data-gallery-dot]` buttons, `[data-gallery-count]`, `[data-gallery-zoom]`, arrow/Home/End keys, mouse click-drag, auto-pause of offscreen `<video>` slides, and `gallery:change` events.
8. `viewer` (`scripts/core/viewer.js`) — `initViewer()`: manages `dialog[data-lightbox-dialog]` for `[data-lightbox="<group>"]` and `[data-lightbox-target="<group>:<n>"]`, picks best `srcset` up to `2400w`, preloads neighbours, supports swipe/arrows/Esc, syncs closing gallery slides, and exposes `setViewerTransition(fn)`.
9. `video` (`scripts/core/video.js`) — `initVideo()`: manages `dialog[data-video]` from `[data-video-open]` triggers, calls `play()` inside user gesture, pauses inline videos, unloads `src`/`poster` + calls `load()` on close, and exposes `setVideoTransition(fn)`.
10. `contact` (`scripts/core/contact.js`) — `initContact()`: manages `dialog[data-message]` with Tab trap, `aria-invalid`, `_honey` honeypot short-circuit, 15s timeout, POST to FormSubmit AJAX (`mcleinjeionza06@gmail.com`), explicit rejection of HTTP 200 JSON `{ success: false | "false" }` (unactivated address), and `modal:open`/`modal:close`.
11. `stats` (`scripts/core/stats.js`) — `initStats()`: hydrates `[data-stats-visits]`, `[data-stats-likes]`, and `[data-stats-like]` via `/api/stats` (`Abacus` `/get/` fallback for reads only; `navigator.locks` serialized first-visit dedup). Failed likes roll back count and state with an error toast rather than hitting Abacus `/hit/` directly.
12. `activity` (`scripts/core/activity.js`) — `initActivity()`: lazily loads contributions (~1000px near viewport or Retry), renders the 52/53-week grid (`data-level="0..4"`, matching legend swatches) + `p[data-activity-summary]`, highlights (`[data-hl="active|streak|best"]`), `[data-act-tip]` tooltip, and the 16-week `[data-activity-mini]` card grid.

### Supporting Core Modules (`scripts/core/`)
- `lock.js` — single keyed scroll-lock registry (details below).
- `modal.js` — shared `$`, `$$`, `emit`, `reducedMotion`, `wait`, bounded `closeWithHook` (1.2s max), `returnFocus`, and re-exported `lockScroll`/`unlockScroll`.
- `contributions.js` — `loadContributions()` shared cached promise trying `/api/contributions` then `https://github-contributions-api.jogruber.de/v4/Mclein31?y=last` (8s timeout each; clears cache on failure so Retry works).
- `gl.js` — renderer-agnostic WebGL helper: `glSupport()` (reduced motion, `saveData`/2g, `deviceMemory < 4`, `small-touch` short side `<700px`, real `failIfMajorPerformanceCaveat` probe), `clampDpr()`, `reportFallback()`, and `createGLLoop()` (IntersectionObserver + `visibilitychange` sleep, `webglcontextlost`/`restored` recovery, clamped `dt <= 0.1`).

---

## 🚪 Intro Gate & Scroll-Lock Owner

- **Intro Gate (`scripts/core/intro.js` + `<head>` inline scripts)**:
  - Standalone with **no GSAP import** so a failed vendor script can never trap content behind the loader.
  - Inline `<head>` script synchronously checks `sessionStorage.getItem('v5-intro') !== '1'` and `prefers-reduced-motion: reduce`, adding `html.is-intro` or `html.is-ready` (and `html.has-reveal` when motion is allowed) before first paint.
  - Critical inline CSS failsafe uses `@keyframes` with `1%, 100%` stops (avoiding `to` stall bugs in Chrome) at `2.6s` on `[data-intro]` and `[data-intro-hold]`.
  - Inline body script runs the `000–100` scan animation immediately during parse (`D` budgeted from navigation start, `700–1300ms`) and resolves `window.__introLoader`, after which an inline module calls `completeIntro()`.
  - `intro.js` enforces the `2500ms` JS failsafe from `performance.now()` (min `400ms` play), wires `[data-intro-skip]` and `Escape`, sets `sessionStorage['v5-intro'] = '1'`, removes `is-intro`, adds `is-ready`, and emits `intro:start` / `intro:done`.
- **Single Scroll-Lock Owner (`scripts/core/lock.js`)**:
  - Keyed registry (`lockScroll(key)`, `unlockScroll(key)`, `isScrollLocked()`, `lockKeys()`) used by `nav.js` (`'menu'`), `viewer.js` (`'viewer'`), `video.js` (`'video'`), and `contact.js` (`'message'`).
  - Toggles `html.is-scroll-locked` and `body.is-locked` and dispatches `scroll:lock` / `scroll:unlock`.
  - `motion.js` registers `setLockHandler` so Lenis stops/starts when running and `scrollTo()` refuses calls while locked; when Lenis is absent (touch, reduced motion, or failed module), `lock.js` sets and restores inline `overflow: hidden` on `<html>`. Both `motion.js` and `modal.js` re-export `lockScroll` / `unlockScroll`.

---

## ✨ Design Layer (`scripts/design/`, 12 files)

`scripts/design/index.js` maps `AREAS = ['reveal', 'hero', 'work', 'about', 'journey', 'activity', 'stack', 'recognition', 'contact', 'footer', 'scrollbar']` into `designSteps`, each importing `./<name>.js` and awaiting `mod.init()` after the 12 core steps.

- `reveal.js` (W1) — IntersectionObserver + `whenIntroDone()` driver for `[data-reveal="rise|draw|fade"]`, `[data-reveal-stagger]`, `[data-tick]` (`data-tick-from`, tabular count-up), and `[data-scan]` (WAAPI 2px orange scan wipe); adds `html.reveal-live` and exports `observe(scope)` / `reveal(el)`.
- `hero.js` (W1 / H2 / H3) — initializes the header section/scroll-percentage readout (`[data-readout-name]`, `[data-readout-pct]`, null-safe) and the raw WebGL Extract → Transform → Load particle stream (`[data-field]`: `3,000` points desktop / `1,400` touch, DPR capped at `1.75`/`1.5`; overrides `gl.js`'s `small-touch` filter unless reduced motion, save-data, low memory, or no WebGL applies, falling back to `hero-field-{grey,orange}.svg` / `-phone.svg`). Reads `.hero__axis` tick centres into `uStage`, accelerates with scroll velocity, settles orange points onto the Transform centre line and grey points onto the other column hairlines, and parts points around the cursor.
- `work.js` (W2) — listens to `gallery:change` and wraps each `[data-gallery-track]`'s `scrollTo` to force `behavior: 'auto'` on prev/next/tick/arrow actions while wiping the incoming screenshot over a `.project__ghost` background span via `clip-path` + `.project__scan` orange edge (`380ms` ease-out, interruptible; native snap preserved for drags/swipes; ticks marked `.is-past`).
- `about.js` (AB2 / W3) — refreshes ScrollTrigger when `<details name="does">` toggles and splits `#about-title` with `SplitText` (`mask: 'lines'`) for a one-time line rise.
- `journey.js` (W4) — ScrollTrigger (with IntersectionObserver fallback) drives `--scaleY` on `[data-journey-fill]`, tracks `[data-journey-entry].is-active`, and slides `[data-journey-marker]` to `[data-journey-node]` offsets measured via `ResizeObserver` and `motion:refresh`.
- `activity.js` (W5) — listens to `activity:ready` / `activity:state`; sweeps `[data-week]` columns left to right via WAAPI (`520ms` stagger + `240ms` duration) and counts up `[data-act][data-tick]` (`680ms`, setting `data-tick-from` so `reveal.js` does not double-count).
- `stack.js` (W5) — interactive schema join highlighter on `[data-schema]` `tr[data-join]`: hover (`mouse`), focus, click/tap lock, `Enter`/`Space`, `ArrowUp`/`ArrowDown` within a table, and `Escape` clear, updating `.is-source`, `.is-joined`, `.has-join`, and `[data-schema-status]`.
- `recognition.js` (W6) — wires whole-row click activation on `#recognition` and `#training` rows and renders a lerped floating `.plate` preview (`.rec-preview`) strictly inside the cols 9–10 corridor on fine-pointer desktop (`>=1024px`), hiding cleanly if space is tight or on scroll/`Escape`/`viewer:open`.
- `contact.js` (W7 / CF2) — `initQuery()` types `[data-query-text]` once on entry (~1.1s) with a 2px orange caret (static if reduced motion, already in/above view at load, or jumped past; `.sr-only` twin carries plain text); also drives origin-anchored scale+fade open/close transitions for viewer, video, and message dialogs (`setViewerTransition`, `setVideoTransition`, `message:open`), `viewer:change` slide nudge, Copy button `Copied` state sync, and inline validation/submit label updates (`Send` / `Sending…`).
- `footer.js` (CF2) — draws the centred dot-matrix wordmark (`[data-wordmark]` / `[data-wordmark-canvas]`) on a 2D canvas (not WebGL) using `--field` grey + 3.5% `--orange` dots; streams points in from a left pipe on desktop entry (`[data-wordmark-status]` `Loading` → `Load complete`) and pushes points within `92px` of the cursor (`24px` max push, lerp back, rAF idle when still/offscreen/hidden); draws static dots on touch/reduced motion and leaves the CSS dotted-mask fallback if canvas/JS is unavailable.
- `scrollbar.js` (S2) — mounts `[data-scrollbar]` (`.sbar`) on `(pointer: fine)` viewports and unmounts on coarse pointers; draws proportional section ticks (`top`–`contact`) synced to `nav:change`, handles click-to-jump and pointer-captured thumb dragging via Lenis or native scroll, and updates `--theme` / `#about` state.

---

## 📦 Delivery, Vendor, Testing & Auxiliary Files

- **`vendor/`** — self-hosted ESM packages (`gsap@3.15.1`, `lenis@1.3.27`, `ogl@1.0.11`), minified in place with `esbuild@0.25.12`; manifest, SHA-256 checksums, and license refs in [vendor/README.md](vendor/README.md).
- **`vercel.json`** — Cache-Control headers only (no rewrites/redirects; `api/` untouched): `/assets/(.*)` `max-age=604800, stale-while-revalidate=86400`; `/assets/fonts/(.*)` `max-age=31536000, immutable`; `/vendor/(.*)` `max-age=2592000, stale-while-revalidate=86400`; `/` `max-age=0, must-revalidate`; `/styles/(.*)` & `/scripts/(.*)` `max-age=300, must-revalidate`.
- **`404.html`** — standalone Instrument error page (`/styles/tokens.css` + `/styles/base.css`, flash-free theme bootstrap, `noindex`, requested `location.pathname` readout, orange rule scan line, primary Home + ghost Contact links).
- **`tests/` & `playwright.config.mjs`**:
  - `tests/v5-behaviour.spec.mjs` (`npm run test:v5`, projects `v5b-desktop` Chrome `1440×900`, `v5b-iphone14` WebKit, `v5b-duo-folded` WebKit `466×678` touch DPR 3): data-hook/ARIA behaviour tests with third parties mocked via `tests/fixtures.mjs`.
  - `tests/v5-audit.spec.mjs` + `tests/v5-audit-helpers.mjs` (`npm run audit:v5`, 13 `v5-*` projects: 9 Chrome widths `320×568`–`2560×1440`, `v5-webkit-iphone14`, and `v5-duo-folded/portrait/landscape`): soft-asserted layout, horizontal overflow, text overlap, touch target (`>=24×24`), image load, console/network, axe WCAG, and `reducedMotion: 'reduce'` checks, writing reports/screenshots to `test-results/v5-audit/<path-slug>/`.
  - Retained contract specs (`npm test` on `desktop-chrome`, `pixel-7`, `iphone-14`): `health.spec.mjs`, `mobile.spec.mjs`, `motion.spec.mjs`, `project-polish.spec.mjs`, `seo.spec.mjs`, `visitors.spec.mjs`, plus `serve.mjs` and `stats-api.node.mjs` (the 7 Signal-only specs were removed).
- **Other root files**: `assets/` (`fonts/`, `icons/`, `images/` incl. `hero-field-{grey,orange}.svg` & `hero-field-{grey,orange}-phone.svg` — `assets/textures/` removed — `Logo/`, `video/`), `prototypes/` (`direction-a/b/c`, `skeleton`), `robots.txt`, `sitemap.xml`, `PersonalPortfolio/` (Obsidian vault), `.env.local` (git-ignored).
