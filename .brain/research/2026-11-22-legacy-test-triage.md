---
type: test-triage
title: Legacy test triage for Redesign v5
project: Personal Website
date: 2026-11-22
job: L1
---

# Redesign v5 — Legacy Test Triage

Audit of all 14 spec files (117 `test()` blocks total), `tests/fixtures.mjs`, `tests/serve.mjs`, and `tests/stats-api.node.mjs` against the [Redesign v5 brief](2026-11-22-redesign-v5-brief.md). No tests, configs, or site files were modified.

## Summary Counts

| Spec | Total | KEEP | ADAPT | RETIRE | Notes |
|---|---:|---:|---:|---:|---|
| [health.spec.mjs](../../tests/health.spec.mjs) | 6 | 2 | 4 | 0 | `loads without console errors...` relies on `gotoReady` in `fixtures.mjs` |
| [icons.spec.mjs](../../tests/icons.spec.mjs) | 4 | 0 | 0 | 4 | Signal icon carousel removed/replaced |
| [interactions.spec.mjs](../../tests/interactions.spec.mjs) | 22 | 0 | 18 | 4 | Core behaviours stay; wallet, copier, sounds, `.does` accordion retired |
| [mobile.spec.mjs](../../tests/mobile.spec.mjs) | 5 | 0 | 3 | 2 | Menu, 24×24 targets, non-hover copy stay; stats pill & pinned work check retired |
| [motion.spec.mjs](../../tests/motion.spec.mjs) | 5 | 0 | 2 | 3 | Reduced-motion visibility & focus trap stay; ASCII footer & header-away retired |
| [project-polish.spec.mjs](../../tests/project-polish.spec.mjs) | 2 | 0 | 1 | 1 | Journey dates/venue content stays; Signal gallery height parity retired |
| [redesign.spec.mjs](../../tests/redesign.spec.mjs) | 7 | 0 | 5 | 2 | SEO/a11y/overflow/reduced-motion stay; W7 screenshot captures retired |
| [responsive.spec.mjs](../../tests/responsive.spec.mjs) | 42 | 0 | 40 | 2 | 20×2 overflow/nav matrix adapted; Signal Journey rotation/tablet layout retired |
| [seo.spec.mjs](../../tests/seo.spec.mjs) | 3 | 2 | 1 | 0 | Metadata/JSON-LD & robots/sitemap kept; no-JS content check adapted |
| [spacing.spec.mjs](../../tests/spacing.spec.mjs) | 10 | 0 | 1 | 9 | Calendar readability adapted; Signal spacing/pinning geometry retired |
| [stats-api.node.mjs](../../tests/stats-api.node.mjs) | 4 | 4 | 0 | 0 | Pure Node unit tests of `api/stats.js` |
| [timing.spec.mjs](../../tests/timing.spec.mjs) | 1 | 0 | 1 | 0 | ≤2.5s loader reveal & repeat-visit skip contract stays |
| [visitors.spec.mjs](../../tests/visitors.spec.mjs) | 2 | 0 | 2 | 0 | Real-visit counting & retry without direct Abacus hit stay |
| [wallet.spec.mjs](../../tests/wallet.spec.mjs) | 4 | 0 | 0 | 4 | Signal contact wallet passes retired |
| **Total** | **117** | **8** | **78** | **31** | |

---

## Per-Spec Triage Tables

### 1. `tests/health.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `loads without console errors or failed requests` | KEEP | Design-independent error/network gate (assumes `gotoReady` in `fixtures.mjs` matches v5's ready state). | — |
| `every image loads` | ADAPT | Uses Signal's `[data-lb-img]` placeholder attribute to exclude the unpopulated lightbox image. | Every visible or eager-loaded image on the page loads with a non-zero natural width, excluding any intentionally empty modal placeholder before it is opened. |
| `nothing overflows the viewport sideways` | ADAPT | Uses `gotoReady` and checks unclipped elements across the full page at bottom scroll. | No unclipped page element extends past the left or right edges of the viewport after scrolling to the bottom of the page. |
| `share preview metadata points at a real absolute image` | KEEP | Uses `page.goto('/')` directly and checks `og:image` HTTPS URL + `canonical` link; design-independent. | — |
| `has no WCAG 2 A/AA violations (axe)` | ADAPT | Calls `gotoReady`, uses dead `.exclude('.manifesto')` selector, and only checks one theme. | The settled page under reduced motion has zero WCAG 2.0/2.1/2.2 A and AA violations in axe-core. |
| `the light theme opts out of Android Chrome auto-darkening` | ADAPT | Hardcodes `localStorage` key `'portfolio-theme'` and `goto` expectations for Signal's theme setup. | When light theme is active, the document declares a matching `color-scheme` opt-out (`only light` / `color-scheme` meta) so mobile browsers do not force-invert light surfaces. |

### 2. `tests/icons.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `tools carousel moves automatically and pauses on focus` | RETIRE | Tests Signal's `[data-icon-field]` auto-scrolling icon carousel, which is not required in v5. | — |
| `reduced motion keeps tools still and permits keyboard scrolling` | RETIRE | Tests Signal's 24-icon carousel scrolling; reduced-motion pausing is covered in `motion.spec.mjs`. | — |
| `an icon follows a drag outside the carousel and springs home on release` | RETIRE | Tests Signal's `.tech-icon--drag` spring drag-and-snap interaction. | — |
| `pointer cancellation restores an icon immediately with reduced motion` | RETIRE | Tests Signal's `.tech-icon--drag` `pointercancel` cleanup. | — |

### 3. `tests/interactions.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `nav links jump to their sections, the bar stays visible, scroll-spy follows` | ADAPT | Hardcodes `.nav__links`, `.nav__inner`, `.is-hidden`, `.is-active`, and Signal section IDs/offsets. | Clicking a primary navigation link scrolls its target section into clear view below any fixed header, updates active navigation state via scroll-spy, and keeps the navigation accessible after programmatic jumps; if auto-hiding on scroll is used, scrolling down hides and scrolling up reveals it. |
| `project gallery buttons and dots move between screenshots` | ADAPT | Hardcodes `[data-gallery]`, `.gallery__slide`, `[data-gallery-dots]`, and `[data-gallery-next]`. | Each project's screenshot gallery lets visitors step forward/backward and select individual slides directly, updating the active indicator and wrapping cleanly. |
| `AdvanCare promo opens in a video window, stops on close, focus returns` | ADAPT | Hardcodes `[data-video-open]`, `[data-video]`, `[data-video-player]`, and `body.is-locked`. | Activating AdvanCare's promo control via keyboard or pointer opens the video player titled AdvanCare with `assets/video/advancare-promo.mp4`, locks background scroll, pauses playback and unlocks scroll on Escape, and returns focus to the trigger. |
| `MedCore promo opens in a video window, stops on close, focus returns` | ADAPT | Same Signal video-window selectors as AdvanCare for MedCore. | Activating MedCore's promo control opens the video player titled MedCore with `assets/video/medcore-promo.mp4`, locks background scroll, pauses playback and unlocks scroll on Escape, and returns focus to the trigger. |
| `SERVIO promo opens in a video window, stops on close, focus returns` | ADAPT | Same Signal video-window selectors as AdvanCare for SERVIO. | Activating SERVIO's promo control opens the video player titled SERVIO with `assets/video/servio-promo.mp4`, locks background scroll, pauses playback and unlocks scroll on Escape, and returns focus to the trigger. |
| `MedRec promo opens in a video window, stops on close, focus returns` | ADAPT | Same Signal video-window selectors as AdvanCare for MedRec. | Activating MedRec's promo control opens the video player titled MedRec with `assets/video/medrec-promo.mp4`, locks background scroll, pauses playback and unlocks scroll on Escape, and returns focus to the trigger. |
| `AdvanCare deck ends on the promo video; expanding it opens the video window` | ADAPT | Hardcodes `.gallery__slide--video`, `[data-gallery-zoom]`, `[data-video]`, and `[data-lightbox]`. | Expanding AdvanCare's promo video item (with `advancare-promo-poster.webp`) opens the video player with `advancare-promo.mp4` rather than the image lightbox, and closes on Escape. |
| `MedCore deck ends on the promo video; expanding it opens the video window` | ADAPT | Same Signal gallery-video expansion selectors for MedCore. | Expanding MedCore's promo video item (with `medcore-promo-poster.webp`) opens the video player with `medcore-promo.mp4` rather than the image lightbox, and closes on Escape. |
| `SERVIO deck ends on the promo video; expanding it opens the video window` | ADAPT | Same Signal gallery-video expansion selectors for SERVIO. | Expanding SERVIO's promo video item (with `servio-promo-poster.webp`) opens the video player with `servio-promo.mp4` rather than the image lightbox, and closes on Escape. |
| `MedRec deck ends on the promo video; expanding it opens the video window` | ADAPT | Same Signal gallery-video expansion selectors for MedRec. | Expanding MedRec's promo video item (with `medrec-promo-poster.webp`) opens the video player with `medrec-promo.mp4` rather than the image lightbox, and closes on Escape. |
| `the video window swaps film, poster and title between promos` | ADAPT | Hardcodes `[data-video]`, `[data-video-player]`, and `[data-video-title-el]`. | Opening different project promos sequentially updates the player's title, video source, and poster image without leaking media from the previous project. |
| `theme toggle switches and survives a reload` | ADAPT | Hardcodes `[data-theme-toggle]`, `html[data-theme]`, and Signal cream `#F2EFE9` `theme-color`. | Activating the theme toggle switches between light and dark themes, updates `meta[name="theme-color"]` to match the active palette, and persists the visitor's choice across page reloads (with light as default when unset). |
| `award photo opens the lightbox, arrows page through, focus returns on close` | ADAPT | Hardcodes `.award__img`, `[data-lightbox]`, `[data-lb-img]`, and `[data-lb-count]`. | Clicking a training/certificate image opens the photo lightbox with a loaded image, pages through certificates with arrow keys, closes on Escape, and restores focus to the originating trigger. |
| `a project slide opens the screenshot viewer at that slide, with its note` | ADAPT | Hardcodes `[data-gallery]`, `.gallery__slide`, `.is-wide`, and `[data-lb-title]`. | Opening a project screenshot launches the screenshot viewer at that exact slide index with its caption/note, supports arrow-key navigation and Escape close with focus return, and remains isolated from certificate photo viewing. |
| `message form validates, then sends (mocked) and confirms` | ADAPT | Hardcodes `.contact [data-message-open]`, `[data-message]`, `#fName`, `#fEmail`, and `#fMsg`. | Opening the contact message form focuses the first input, blocks invalid/empty submission via constraint validation, posts valid submissions to FormSubmit AJAX, displays a sent confirmation, and closes/resets cleanly. |
| `copy email shows a confirmation toast` | RETIRE | Tests Signal's `.copier__btn` email copier bar and toast, which is explicitly replaced in v5. | — |
| `like button counts once per visitor (mocked counter)` | ADAPT | Hardcodes `[data-like]`, `[data-likes]`, and Signal's `.burst` floating feedback element. | Clicking the like control increments the displayed count once via `/api/stats?type=increment&metric=likes`, marks the control pressed, and ignores repeat clicks with feedback rather than sending duplicate increments. |
| `local and automated browsers read the view count but never add to it (mocked counter)` | ADAPT | Hardcodes `[data-visits]` and `gotoReady`. | Automated (`navigator.webdriver`) or local browsers fetch and display the current visit count from `/api/stats` without issuing a `visits` increment request, even after clearing `sessionStorage`. |
| `GitHub calendar renders a full year and settled stats` | ADAPT | Hardcodes `#activity`, `[data-activity]`, `.cell[data-i]`, and `[data-act="streak"|"best"]`. | The GitHub activity section fetches `/api/contributions` (falling back to the client API on failure) and renders a full 365-day contribution view alongside settled streak and best-day totals. |
| `what I do opens one row at a time` | RETIRE | Tests Signal's `.does__btn` single-open accordion UI; "What I do" content stays, but v5 need not use an accordion. | — |
| `the contact wallet brings a tapped pass to the front` | RETIRE | Tests Signal's stacked `.pass--*` wallet cards and `inert` card switching. | — |
| `contact sounds play after interaction without a site mute control` | RETIRE | Tests Signal's WebAudio UI sounds triggered by `.pass--gh .pass__head`. | — |

### 4. `tests/mobile.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `menu opens, locks scroll, closes on link and on Escape` | ADAPT | Hardcodes `[data-menu-toggle]`, `#menu`, `.is-open`, `body.is-locked`, and `.nav`. | On phones, the menu toggle opens the navigation drawer with `aria-expanded="true"` and locks body scroll; selecting a section link closes the drawer and scrolls the section into view without hiding the nav, and Escape closes it and resets `aria-expanded="false"`. |
| `work cards stack vertically and the desktop-only demo button is hidden` | RETIRE | Checks Signal's `#work.is-pinned` removal and `.project` vertical stacking; non-pinning on phones is covered by brief rules and overflow checks. | — |
| `the floating stats pill never covers a button or link` | RETIRE | Tests Signal's `[data-stats]` floating pill, which v5 explicitly drops ("No pills... stats pill may be replaced"). | — |
| `buttons meet the 24×24px minimum touch target (WCAG 2.5.8)` | ADAPT | Relies on `gotoReady` (`.hero.is-in`) and excludes only `visibility: hidden` buttons. | Every visible interactive button/control on phone viewports has a bounding box of at least 24×24 CSS pixels. |
| `copy that says "hover" is not the only instruction on touch screens` | ADAPT | Relies on `gotoReady` and only inspects `main p:visible`. | Visible instructional copy on touch viewports never directs visitors solely to "hover" to operate a control. |

### 5. `tests/motion.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `reduced motion: no preloader, nothing hidden, work not pinned` | ADAPT | Hardcodes `html.no-preload`, `#work.is-pinned`, `[data-reveal]`, `.strip__track`, and `[data-footer-mark]`. | Under `prefers-reduced-motion: reduce`, any intro loader is skipped or resolves immediately, no scroll-reveal content remains hidden at `opacity: 0`, sideways pinning is disabled, and ambient loops/marquees/WebGL scenes stay still. |
| `keyboard: skip link is first, dialogs trap and release focus` | ADAPT | Hardcodes `.skip-link`, `.nav__hire`, `[data-message]`, and `#fName`. | Pressing Tab on load focuses a skip-to-content link targeting `#main`, and any open modal dialog traps keyboard focus inside until dismissed via Escape, returning focus to its opener. |
| `footer is one screen tall and the vista spans it, animating on its own` | RETIRE | Tests Signal's 100vh footer and `[data-vista]` ASCII lighthouse animation. | — |
| `reduced motion: the footer vista is drawn and holds still` | RETIRE | Tests Signal's `[data-vista]` ASCII lighthouse static fallback. | — |
| `the header steps aside at the footer and returns above it` | RETIRE | Tests Signal's `.nav.is-away` choreography tied to the 100vh ASCII footer. | — |

### 6. `tests/project-polish.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `AdvanCare achievement does not change gallery height` | RETIRE | Tests Signal's horizontal `.project__media` height parity and `.work__foot` clearance. | — |
| `journey dates and hackathon location match owner corrections` | ADAPT | Hardcodes `.yr`, `.yr__year`, `.yr__place`, and trailing punctuation from Signal. | The Journey section preserves all owner-verified chronological entries (`2022`, `2024`, three `2026` entries including DTI Pitch Perfect and First sites shipped, `Now`, `Next`) and the venue `Tuguegarao City, Cagayan` for Cagayan Innovation Hack 2026. |

### 7. `tests/redesign.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `structure, SEO metadata, JSON-LD and no console errors` | ADAPT | Checks Signal `theme-color` values (`#F2EFE9`, `#0B0B0B`), `nav[aria-label="Footer"]`, and calls `gotoReady`. | The page exposes a single visible `<h1>`, semantic landmarks (`header`, `main`, `footer`, primary `nav`), canonical/OG/Twitter/robots/verification meta tags with v5 `theme-color` values, valid JSON-LD `@graph` (`Person`, `WebSite`, `ProfilePage`, `ItemList` with ≥5 projects), and zero console/network errors across a full scroll. |
| `no horizontal overflow across scroll positions` | ADAPT | Calls `gotoReady` and inspects unclipped elements at 0%, 50%, and 100% scroll. | At top, middle, and bottom scroll positions, `documentElement.scrollWidth` never exceeds `innerWidth` and no unclipped element extends outside the viewport horizontally. |
| `reduced motion keeps content readable and settled` | ADAPT | Hardcodes `.hero.is-in`, `[data-years].is-pinned`, `.yr`, and `[data-rise]`. | Under `prefers-reduced-motion: reduce`, all sections are un-pinned, un-inerted, readable (`opacity > 0`), and settled immediately on load. |
| `axe has no serious or critical violations (light)` | ADAPT | Calls `gotoReady` and hardcodes `localStorage('portfolio-theme')`. | In light theme under reduced motion, axe-core reports zero serious or critical WCAG 2.0/2.1/2.2 A/AA violations. |
| `axe has no serious or critical violations (dark)` | ADAPT | Calls `gotoReady` and hardcodes `localStorage('portfolio-theme')`. | In dark theme under reduced motion, axe-core reports zero serious or critical WCAG 2.0/2.1/2.2 A/AA violations. |
| `full-page screenshot (light)` | RETIRE | One-off Signal redesign W7 artifact capture waiting on `.activity__cal:not(.is-loading)`. | — |
| `full-page screenshot (dark)` | RETIRE | One-off Signal redesign W7 artifact capture waiting on `.activity__cal:not(.is-loading)`. | — |

### 8. `tests/responsive.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `${theme} layout fits ${width}×${height}` (20 viewports × `light`/`dark` = 40 tests) | ADAPT | Mixes multi-viewport zero-overflow & nav-fit checks with Signal `.hero` heights, `.pass--*` wallet bounds, `[data-typing]`, and `[data-years]` pinned geometry. | Across all viewports from 320×568 to 2560×1440 in both light and dark themes, the page has zero horizontal document overflow and the navigation bar neither overflows nor overlaps its action controls. |
| `Journey remains readable when a phone rotates into short landscape and back` | RETIRE | Tests Signal's `[data-years].is-pinned` toggling and `.yr.is-on` `inert` state on rotation. | — |
| `portrait tablet composition stays consistent with reduced motion` | RETIRE | Tests Signal's `.yr__words` / `.yr__media` geometry at 861–1100×1376. | — |

### 9. `tests/seo.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `homepage exposes one canonical identity and the requested name variants` | KEEP | Design-independent metadata/JSON-LD check (note: expects `footer nav a` to contain the GitHub/LinkedIn `sameAs` links). | — |
| `crawler discovery files point only to the canonical page` | KEEP | Fetches `/robots.txt` and `/sitemap.xml` directly; completely design-independent. | — |
| `identity and portfolio content are available without JavaScript` | ADAPT | Hardcodes Signal's `.about__lede` and `.project__info` selectors. | With JavaScript disabled, the initial HTML renders one visible `<h1>` ("McLein Jei Onza"), the About bio mentioning "McLein Jei Onza", and visible project descriptions. |

### 10. `tests/spacing.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `desktop retains horizontal Work scrolling and pinned Journey slides` | RETIRE | Tests Signal's `#work.is-pinned`, `[data-work-track]`, and `[data-years].is-pinned`. | — |
| `phone and tablet keep journey animation within a screen-height frame` | RETIRE | Tests Signal's `.years__sticky` 100vh pinning and `.icon-field` gap. | — |
| `desktop Journey centers slides and keeps every caption above progress` | RETIRE | Tests Signal's `.yr__words` / `.yr__note` / `.years__foot` geometry and writes `/tmp` screenshots. | — |
| `mobile hero starts near navigation and projects have room between cards` | RETIRE | Tests Signal's `.hero__kicker` clearance and `.project` 56/72px gap numbers. | — |
| `mobile About groups facts and keeps the service heading readable` | RETIRE | Tests Signal's `.facts` and `.does` exact 32px gap. | — |
| `portrait Journey centers the active slide and progress below navigation` | RETIRE | Tests Signal's `.years__sticky` top/bottom symmetry. | — |
| `activity calendar keeps readable square cells on phone and tablet` | ADAPT | Hardcodes `.activity`, `.cell:not(.pad)`, `.activity__scroll`, and writes a `/tmp` screenshot. | On phones, tablets, and desktops, the GitHub contribution grid renders legible cells (containment/horizontal scroll inside its own widget on narrow screens) with zero document-level horizontal overflow. |
| `desktop Work retains the compact deck proportions from the reference` | RETIRE | Tests Signal's `website_inspo` 500–700px card width and 200–300px left offset. | — |
| `capped project galleries fill their cards and center screenshots and video` | RETIRE | Tests Signal's `.project__media[data-gallery]` inner padding and centering math. | — |
| `short laptop windows retain a horizontal Work deck with visible captions` | RETIRE | Tests Signal's `#work.is-pinned` <=640px card width on short viewports. | — |

### 11. `tests/stats-api.node.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `first visitor increments` | KEEP | Node test directly exercising `api/stats.js` (`visits` cookie absent → `/hit/` + `Set-Cookie`). | — |
| `returning visitor only reads` | KEEP | Node test directly exercising `api/stats.js` (`portfolio_visited=1` → read only). | — |
| `likes remain independent` | KEEP | Node test directly exercising `api/stats.js` (`likes` increments regardless of `portfolio_visited=1`). | — |
| `upstream failure does not mark the visitor counted` | KEEP | Node test directly exercising `api/stats.js` (502 upstream → 502 response, no `Set-Cookie`). | — |

### 12. `tests/timing.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `first visit shows the name within 2.5s; repeat visits skip the preloader` | ADAPT | Hardcodes `.hero__name .char` WAAPI animations, `.preloader`, and `html.no-preload`. | On a first session visit, the hero name/LCP becomes readable within 2.5 seconds and the intro loader finishes; repeat loads within the same session skip the intro loader. |

### 13. `tests/visitors.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `first real visit counts once across reloads and later sessions` | ADAPT | Hardcodes `[data-visits]` and `sessionStorage('pf-loaded')`. | In a non-automated production context (`navigator.webdriver === false`), the first visit increments `/api/stats?metric=visits` once and subsequent reloads or new sessions only read the count. |
| `a failed first visit can retry and never increments Abacus directly` | ADAPT | Hardcodes `[data-visits]` and `localStorage('site_user_has_visited')`. | If `/api/stats` fails on first visit, the client does not mark the visitor as counted, never hits `abacus.jasoncameron.dev/*/hit/` directly, and retries on the next load. |

### 14. `tests/wallet.spec.mjs`

| Test name | Verdict | Reason | Behaviour contract (for ADAPT) |
|---|---|---|---|
| `GitHub squares load when contact is opened before the activity section` | RETIRE | Tests Signal's `.pass--gh` contact wallet card mini-grid. | — |
| `GitHub card shows an error and retries when contributions become available` | RETIRE | Tests Signal's `.pass--gh` wallet error/retry UI (note: the Activity calendar should cover API failure/fallback/retry). | — |
| `WhatsApp card opens the supplied number with an editable prefilled message` | RETIRE | Tests Signal's `.pass--wa` wallet card geometry (the `https://wa.me/639524781573` channel link remains required content). | — |
| `Card details leave actions visible and respect reduced motion` | RETIRE | Tests Signal's `.pass--gh/wa/in` wallet layouts and WhatsApp `#25D366` fill. | — |

---

## Behaviour Contracts Checklist for the New Build

- [ ] **SEO & static availability**: Canonical URL (`https://mcleinjeionza.vercel.app/`), `robots.txt`, `sitemap.xml`, OG/Twitter/verification meta, complete JSON-LD `@graph` (`Person`, `WebSite`, `ProfilePage`, `ItemList`), and visible `<h1>` ("McLein Jei Onza"), About bio, and project info with JS disabled.
- [ ] **Runtime health**: Zero console errors, page errors, failed requests, or HTTP ≥400 responses across initial load and full-page scroll; all non-placeholder images load with `naturalWidth > 0`.
- [ ] **Performance & loader timing**: First-visit intro loader reveals the hero name within 2.5s and does not block indefinitely; repeat visits in the same session skip the intro loader.
- [ ] **Reduced motion**: Under `prefers-reduced-motion: reduce`, intro loader is skipped/resolved immediately, all content is visible (`opacity: 1`) and un-inerted, pinned sideways scrolling is disabled, and ambient loops/WebGL motion stay still.
- [ ] **Accessibility**: Zero serious/critical (target zero A/AA) axe violations in both light and dark themes; skip-to-content link is first Tab stop; modals trap focus and restore it on Escape; mobile buttons meet ≥24×24px touch targets; no touch-screen copy relies solely on "hover".
- [ ] **Theme persistence & color-scheme**: Light theme is default, toggle switches between light and dark, updates `meta[name="theme-color"]` to v5 palette values, persists across reloads, and light theme opts out of browser auto-darkening.
- [ ] **Navigation**: Desktop anchor links jump clearly below fixed header with scroll-spy; phone menu toggle opens drawer, locks scroll, closes on link click or Escape, and never leaves nav stuck hidden.
- [ ] **Responsive layout**: Zero horizontal document overflow or nav collisions across 320px–2560px in light and dark themes at all scroll positions.
- [ ] **Work galleries & promo videos**: All project galleries support step/direct slide switching; clicking a screenshot opens the lightbox at that slide with its note and arrow-key navigation; AdvanCare, MedCore, SERVIO, and MedRec promo videos open and play (`*-promo.mp4`), stop on close, and return focus.
- [ ] **Training & Journey content**: Certificate photos open in a navigable lightbox with focus return; Journey preserves owner-verified dates (`2022`, `2024`, `2026`, `Now`, `Next`) and `Tuguegarao City, Cagayan` venue.
- [ ] **GitHub Activity**: Loads a full 365-day contribution view + streak/best-day stats from `/api/contributions` with client fallback and error resilience, staying legible without document overflow on phones/tablets.
- [ ] **Stats & Contact**: `api/stats.js` logic passes as-is; real visitors count once (`visits`), automated/local browsers only read, failed first visits retry without hitting Abacus directly, `likes` increments once per visitor; contact form validates and submits via FormSubmit AJAX with confirmation.

---

## `tests/fixtures.mjs` Helpers Worth Keeping

| Helper / Export | Verdict | Guidance for v5 |
|---|---|---|
| `contributionFixture()` | **Keep as-is** | Deterministic 365-day contribution fixture (`streak: 30`, `best: 40`); completely design-independent. |
| `test` (mocked routes fixture) | **Keep as-is** | Mocks `/api/stats?`, `abacus.jasoncameron.dev`, `/api/contributions \| github-contributions-api`, and `formsubmit.co` so tests never mutate live stats or send emails. |
| `isMobile(testInfo)` | **Keep as-is** | Reads Playwright project name (`desktop` vs phone projects); design-independent. |
| `expect` | **Keep as-is** | Standard re-export. |
| `scrollSettled(page)` | **Keep (review timing)** | Still useful after anchor jumps; check if 300ms window needs a slightly longer idle threshold when Lenis smooth scrolling is active. |
| `gotoReady(page, path)` | **Keep, but update** | Keep the concept (bypassing once-per-session loader + waiting for hero readiness), but replace Signal's `pf-loaded` / `.hero.is-in` check with v5's session key and ready attribute/state. |
| *(Note: `tests/serve.mjs`)* | **Keep as-is** | Static server with HTTP byte-range (`206`) support required for WebKit `<video>` playback. |
