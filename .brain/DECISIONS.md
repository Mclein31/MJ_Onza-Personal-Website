---
type: decisions-log
title: Personal Website Decisions
project: Personal Website
tags:
  - decisions
  - portfolio
  - web
last_updated: 2026-11-15
---

# ⚖️ Personal Website — Technical Decisions

Newest first. Superseded decisions are kept and marked; the newer, code-verified decision wins.

## 2026-11-04 — Paper and glass
_Moved verbatim from PROJECT_CONTEXT.md on 2026-11-15._

Owner asked for deliberately spread fibers with layering, imperfections and varied length/thickness, then more fibers, no visible repeat, and a felt paper surface rather than fibers floating on flat colour (2026-11-04). Paper is now five stacked layers in `assets/textures/`, each a distinct prime-sized tile so the whole never visibly repeats; do not go back to a single tile. The sheet has two layers. `paper-formation.webp` (509px raster shown at 1109px) holds faint cloudy pulp flocs. `paper-tooth.webp` (619px at 1×) holds a matted tooth of ~4,900 felted micro-fibers. Both are single ink colour with alpha and stay subtle: a stronger version read as granite. They are physical paper structure, not the isotropic noise grain the owner rejected earlier. On top sit `paper-fibers-deep.svg` (1031px), `paper-fibers-mid.svg` (1297px) and `paper-fibers-top.svg` (1543px), made more visible on 2026-11-04. They use Poisson-disk spacing, density drift, bundles, flecks and shives. `--paper-fibers` and `--paper-fibers-size` in `css/texture.css` hold the layer list (~285 KB total). Paper appears only on the page and pinned stage backgrounds, never on cards or images. Dark theme shows the paper only faintly.

Cards are Apple-style liquid glass at the owner's chosen 25% liquid level (75% tinted body). Owner's reference: frosted cards with a thick, bright, glowing white rim. On near-white paper, the glass reads through a cool tint (hue 228–232), a luminous inner rim, a crisp edge and corner highlight, and soft caustics whose positions vary per card. Levels (owner, 2026-11-04): about **20%** of the reference look on Work (`.project__media`, `.project--more`) and about **10%** on Stack, Contact, Recognition and About (`.table`, `.idcard`, `.award`, `.film`, open `.does__row`). A stronger version was tried first and rejected as too prominent. Work cards move every frame of the pinned scroll, so the same mix is pre-blended over paper with no live backdrop-filter; other cards use `backdrop-filter: blur(20px) saturate(160%)`. Inverted panels (lead award, first schema table, "More on GitHub") use tinted glass with dimmed or lifted backdrop (pre-blended in Work) to keep contrast. Glass tokens live in `css/texture.css` (`--glass-*`, Work overrides scoped on `.work`); opaque fallback for no backdrop-filter support and reduced transparency. Images, image mounts and gallery masks belong to a separate agent's screenshot-quality pass; glass rules change only card surfaces, and `work.css` was not edited.

---

## 2026-11-03 — Unique visit counting: first visit per browser
> **Supersedes** the 2026-11-01 "count every visit" change (see CHANGELOG) and refines "2026-10-25 — Views Count Unique Visitors". Verified in code 2026-11-15: `js/stats.js` + `api/stats.js` (`portfolio_visited` cookie, Abacus key `portfolio_views`).
_Moved verbatim from PROJECT_CONTEXT.md on 2026-11-15._

Unique visit counting (2026-11-03): owner changed visits from every visit to first visit per browser. `site_user_has_visited` persists after a successful API increment; a browser lock serializes first visits across tabs. The API uses a one-year HttpOnly/SameSite=Lax `portfolio_visited` cookie to turn repeated increment requests into reads. Failed visit increments never bypass the API with a direct Abacus hit and remain retryable. Existing totals and like behavior remain. This is browser-level deduplication, not IP/account identity; another browser or clearing both storage and cookies can count again.

---

## 2026-11-03 — Material finish, Work/Journey layout corrections, scroll performance
> **Partly superseded**: the paper treatment here (including the 30% fiber-contrast reduction) was replaced by "2026-11-04 — Paper and glass"; "Desktop Work scale correction" was superseded the same day by "Work card reference correction" (as stated below).
_Moved verbatim from PROJECT_CONTEXT.md on 2026-11-15._

`css/texture.css` preserves the original cool white/gray and dark surfaces, soft directional lighting, contact/cast shadows, slightly varied photo mounts and uneven orange highlights. Owner rejected fuzzy grain and halftone. Current paper treatment (superseded 2026-11-04, see "Paper and glass" below) uses three stacked fiber layers in `assets/textures/` (see below), painted behind content on page surfaces only. No turbulence/noise filter, full-screen overlay, or texture over photographs. Original footer treatment stays intact.

Project mockup shadow correction (2026-11-03): transparent gallery WebPs retain nonzero shadow alpha at the canvas boundary. `css/work.css` feathers image edges with intersected CSS masks in galleries and project lightbox views, blending the clipped shadow tails without changing gallery borders or source assets.

Journey centering (2026-11-03, owner request): pinned phone/tablet stages now use a 100svh minimum with centered content alignment. The measured active slide and its adjacent progress row move together into the middle of the area below navigation, instead of leaving all spare space below them. Long content can still grow; short landscape and reduced-motion flow remain unchanged.

Activity calendar scale (2026-11-03): main contribution grid uses a 16px minimum square cell with 4px gaps and horizontal scrolling when a full year will not fit. Day-label line height no longer stretches grid rows; inset scroll margins and an opaque sticky label gutter keep scrolled cells clear of weekday labels. Wallet calendar styling remains separate.

Desktop Work scale correction (2026-11-03): removed the card-width cap derived from `100svh - 600px`, which shrank desktop projects into multiple small cards on shorter screens. Pinned cards now use `min(82vw, 1180px)` with centered track edge padding; existing measured gallery-height allowance reserves actual caption/control space. Horizontal scroll and stacked phone/tablet layouts remain.

Paper texture adjustment (2026-11-03): fiber contrast reduced by 30%. Pinned Work/Journey stages paint their own opaque paper/fiber background, so the backdrop stays stationary during scroll-driven sequences rather than revealing the scrolling parent texture. Normal document flow retains the page texture.

Gallery/palette correction (2026-11-03): owner explicitly restored the original cool white/gray palette from `tokens.css`, including original dark colors; texture.css no longer overrides paper colors, and fibers/light are neutral. Gallery tracks have explicit 100% width so Safari cannot shrink the aspect-ratio box when gallery height is capped, leaving content left aligned within a wider card.

Work card reference correction (2026-11-03): owner explicitly selected the original compact multi-card deck screenshot. Restored original `min(74vw, 1180px, (100svh - 600px) * 1.7778)` card sizing (340px minimum) and original wrap-aligned track inset, superseding the 82vw full-card centering change. Keep the explicit gallery dimensions for centered, uncropped images within cards and the original white/gray palette.

Scroll performance correction (2026-11-03): Work now caches card centers during measurement, writes transform directly (avoiding inherited `--x` invalidation across the deck), updates its counter only when the selected project changes, and skips unchanged progress outside the pinned range. Heading scrubs batch geometry reads and skip unchanged reveals. A local Chrome profile with 4× CPU slowdown and 150 scroll steps showed Work layout count 157→13, style calculation time 1.98s→0.14s, and frame p95 33.4ms→16.7ms; Journey p95 33.3ms→16.7ms. These are local comparisons, not device-wide FPS guarantees. Card dimensions, texture and Journey composition are unchanged.

Short laptop Work layout (2026-11-03): landscape viewports ≥861px wide now retain horizontal pinning down to 600px usable height (previously 760px). At 600–759px, cards cap at 640px/56vw with compact two-column details and normal 44px controls, letting the measured gallery fit with captions/progress. Taller desktop/Mac and portrait/tablet compositions remain unchanged.

---

## 2026-11-02 — Journey, mobile spacing, responsive audit, sounds and CTAs
> **Note**: the hero height cap in the responsive audit is superseded by the "Hero follow-up" paragraph below (desktop/laptop with a fine pointer: full 100svh).
_Moved verbatim from PROJECT_CONTEXT.md on 2026-11-15._

Owner requested fuller use of the Journey stage. Pinned desktop slides now align below navigation, use equal text/image columns and a 1600px outer container, with image height capped to reserve caption and progress space on shorter screens. Phone/tablet sizing and year-by-year scroll transitions remain intact.

Journey slide 2 uses the owner-supplied black-shirt mirror photo, converted to assets/images/journey-portrait.webp (2026-11-02), with the full photo contained in the existing image frame.

Journey final slide includes the owner’s workspace photo showing MedCore development (assets/images/journey-workspace.webp, 1600×900), above the internship description and contact link (2026-11-02).

Contact wallet switching uses a brief synthesized card shuffle and soft landing, triggered by the wallet’s actual front-card change and playing after the browser’s required first interaction (2026-11-02).

Hero at ≤960px uses natural content height and starts 12px past navigation clearance, removing vertical centring. Mobile Work cards have 80px between projects, 24px between media and details, and 16px between detail rows. Journey reserves 8px past navigation clearance, measures the active slide rather than the tallest slide, and places progress 16px after its content. Desktop layout and scroll transitions are preserved.

Mobile About (≤860px, 2026-11-02): 24px heading/body gap; profile facts use compact bordered label/value rows; the service accordion follows after 32px and its label/subtitle stack cleanly. Desktop About layout is unchanged.

Journey images at 600–860px tablet widths allow 44svh height (up from 34svh), per owner request on 2026-11-02; phone and desktop image sizing stays unchanged.

Laptop composition is the owner’s base reference. Hero height caps at 960px on large displays and 760px on 961–1100px portrait tablets, eliminating the iPad Pro 13-inch centring gap while retaining laptop typography/actions. Portrait tablets through 1100px use content-sized, stacked Journey slides and compact Work spacing. Large desktop Journey stages cap at 960px. Short landscape phones show Journey in normal document flow so captions remain reachable; rotating back restores pinning. Contact cards adapt via container queries, with compact Gmail compose/actions below 360px card width; compact About facts depend on available column width. Laptop navigation and horizontal Work scrolling remain intact.

Owner removed the speaker/mute control (2026-11-02). Interface sounds stay enabled after the browser permits audio; legacy portfolio-sfx preferences are ignored. Card shuffle remains at the softer volume.

Hero follow-up (2026-11-02): desktop/laptop with a fine pointer and hover uses a full 100svh stage, with navigation clearance and padding included. Tablet/phone compact sizing remains as before (owner corrected the request to exclude tablets). The icon divider uses 6% ink for a very subtle separation. This supersedes the desktop hero height cap from the audit.

CTA review (2026-11-02): “See the work” remains the hero primary. Main form openers and the dialog title use “Send a message”; the contact form opener is a filled primary button. Gmail’s external mail action says “Email”. Hero messaging uses an in-page action arrow rather than the external-link arrow.

Journey spacing follow-up (2026-11-02): pinned desktop slides center vertically within their stage, with 24–48px of extra top clearance below navigation. Phone/tablet frames retain content-based sizing with 16–32px extra top clearance, including portrait tablets through 1100px.

---

## 2026-11-01 — Preserve scrolling animations; scope layout fixes to phone/tablet

Keep the original pinned horizontal Work section and pinned year-by-year Journey animations. Responsive spacing fixes must not replace them with static grids/timelines or redesign desktop/laptop layouts. At ≤960px, compact the section/hero gaps and measure Journey slide content to reduce unused stage space, retaining its pin, transitions, count and progress dots. Retain the separately requested draggable, spring-return icon carousel and no visible play/pause control.

---

## 2026-11-01 — Redesign after jeancreate.com, own colours and footer
> **Partly superseded**: the interface-sound mute toggle was removed by the owner on 2026-11-02 (sounds stay on after first interaction).

### Decision
Restyle the whole page after the owner's reference (jeancreate.com): one heavy grotesk (Geist) with tight tracking, floating pill nav, scroll-read headings with ink highlight boxes, rounded cards, a pinned year-by-year journey, and a dark contact with a wallet of channel cards. Keep the current colour tokens, the footer (moved to `css/footer.css`), and Work directly after the hero. Add interface sounds with a mute toggle.

### Reason
Owner liked the reference's text animation, UI and UX ("premium, not vibecoded") and asked for something similar but not a copy. The data-engineering identity supplies the differences: typed SQL in the journey, schema tables, a GitHub pass from real activity.

### Alternatives
- The owner chose pill navigation, highlighted words and index numbers from the reference.
- Inter as in the reference: rejected, Geist was already self-hosted with the full weight axis.

---

## 2026-11-01 — Owner design rules: favicon, hero, headings, responsive scope, contact wallet, Journey
> **Note**: the hero bullet's 960px desktop stage cap was superseded on 2026-11-02 (see "Hero follow-up" above). The contact wallet personality bullet is dated 2026-11-02.
_Moved verbatim from PROJECT_CONTEXT.md on 2026-11-15._

- Favicon (2026-11-01): owner's portrait in a black formal shirt, phone retained, white background; zoomed toward the face in a circular crop with transparent corners. `assets/Logo/favicon-circle-{64,192}.png`, sourced from `mclein-formal-circle.png`; original full photo is `mclein-formal-phone.png`.
- Hero layout (owner-approved exception to desktop restoration): single-column with a viewport-height stage capped at 960px (760px for tall portrait tablets), oversized desktop name on one line, quiet lower-background marquee, intro/actions sharing a row on desktop and stacking on smaller screens, and full-width icon carousel at the bottom. The whole content group sits 24–56px higher (6vh) to reduce the blank area below navigation; short screens retain normal navigation clearance. Primary hero action is “See the work” as a filled pill; “Send a message” is the secondary text link (owner confirmed, 2026-11-02). Decorative background text runs at half speed (140/158/176/194s per loop).
- Hero name accents: the dot over the lowercase i and the period after Onza use light orange (#e8894d); the i stem keeps the theme ink colour.
- Hero tools: horizontal, swipeable carousel in `.hero__zone`, with gentle looping auto-scroll, hover/focus/touch pause and arrow-key support; no visible play/pause control. Icons can be dragged out and spring back into their slots; reduced motion disables auto-scroll and returns dragged icons immediately. Mobile hero uses 24px after nav clearance and between text and icons (2026-11-01).
- Section headings (2026-11-01): use only the main headings; owner removed all small uppercase dot-prefixed section labels (Selected work, About, Journey, Activity, Stack, Recognition, Training).
- Responsive layout scope (2026-11-01): preserve the original desktop/laptop layouts and scroll animations. Work retains pinned horizontal scrolling where originally enabled; its pinned heading uses a compact row beneath navigation to move cards into the unused upper space, and its gallery height reserves room for the tallest project description and progress row so laptop screens do not clip details; Journey retains pinned year-by-year transitions. Only phone/tablet spacing (≤960px) is compacted, including a measured content-sized Journey stage. Do not replace these animations with static grids/timelines during layout fixes.
- Contact wallet has GitHub, LinkedIn, WhatsApp and Gmail cards. The latter three use local brand logo assets and matching blue, green and white/red palettes. WhatsApp uses the owner-provided wa.me link; wallet height derives from card count. GitHub pass loads contributions independently via the shared `js/contributions.js` request (including retries), and uses a fixed GitHub dark palette in both site themes: dark canvas, neutral bordered Follow button and green contribution levels (`css/wallet.css`).
- Contact wallet personality (owner-approved mockup, 2026-11-02): GitHub types a short building line above its real contribution grid; WhatsApp keeps bright #25d366 with one greeting bubble and brief typing dots; LinkedIn connects the owner’s actual portrait to a visitor icon with a dotted line. Details animate briefly on opening, respect reduced motion and the browser’s first-interaction audio requirement, and reserve a clear footer for each CTA. Card front height is 260px (268px on narrow phones).
- Journey date corrections supplied by owner: DTI YEP / Pitch Perfect in May 2026; first independent sites in late August 2026. Display year only on timeline labels and keep chronological order. Cagayan Innovation Hack location: Tuguegarao City, Cagayan. Restored gray journey secondary text and black highlight boxes with white lettering throughout both themes. Use orange sparingly as hero-style underlines on recruiter-relevant keywords (Python, PostgreSQL/SQL and shipped-project count), not orange boxes or full orange lines.
- Journey sizing (owner-requested desktop adjustment, 2026-11-01): Equal desktop text/image columns in a wider stage give images more room; milestone text uses a 3.3vw scale (56px cap) and card titles are 19px with the shared orange underline highlight. Phone/tablet milestone text uses a smaller 6.8vw scale (42px cap) and image height allowance increases to 34svh. Preserve the pinned transitions.

---

## 2026-10-31 — Project-First Page, Clear Gallery Slides

### Decision
- **Work comes first**: the Work section sits right after the hero (before the manifesto and About), and is first in the nav and phone menu.
- **Slides are transparent**: no brand gradients, logos or taglines in the gallery images; devices sit straight on the Work band in both themes. The gallery sheet lost its paper fill and shadow (crop marks stay).
- **Real device frames from MockUPhone** (Apache-2.0); screenshots are captured or cropped to each frame's exact screen size, so screens never show black bars. Hand-drawn CSS frames were tried first and rejected by the owner as fake.

### Reason
Owner asked for a more project-centred site with clear (not coloured) slide backgrounds, and pointed out the iMac and iPad screenshots did not fill their screens.

---

## 2026-10-27 — v4 Visual Redesign: Studio Theme, Data Touches
> **Partly superseded** by "2026-11-01 — Redesign after jeancreate.com": Geist is now the display/body face and Hedvig Letters Serif is used only for the footer wordmark; the icons are now 24 in a hero carousel. Custom cursor: `js/cursor.js` still initializes but `.cursor` is `display: none` in `css/fx.css` (verified 2026-11-15).

### Decision
The draggable tech icons (eight data and backend tools, ink-toned with colour on hover or drag, in their own zone, never over the name) and the scroll-lit manifesto stay (owner asked to bring them back). Full redesign of the look and layout with the Studio theme chosen by the owner: cool proof paper with a dot grid, Hedvig Letters Serif heads over Geist, Geist Mono only for data (schema table names, column types, timestamps, figures), crop-marked "printed sheets" for galleries, tables and photos, one orange for the primary action. Light and dark both derived from the same tokens. Content, links, form fields, script hooks and tests unchanged; all Playwright specs pass.

### Dropped (owner reviewed live)
Custom cursor and magnetic buttons, photo marquee (now a still rail), SQL-style eyebrows above headings (`.table-name` stays as a hook on each head block for the nav-landing test), hand-drawn macOS demo window chrome, hero font-metric guides (owner found them odd).

### Notes
- Temporary design records and metadata were removed during the 2026-11-01 repository cleanup; the theme remains defined in `css/tokens.css`.
- `theme.js` still sets `theme-color` to `#f2f3ef` / `#0b0c0d` (the theme test asserts it); the new paper is slightly cooler.

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
> **Superseded**: 2026-11-01 switched to counting every visit, then "2026-11-03 — Unique visit counting: first visit per browser" restored once-per-browser counting with a server cookie.

### Decision
The stats pill's view count increments once per browser, ever: `js/stats.js` sets `site_user_has_visited` in localStorage after a successful increment. Browsers that already have a cached `site_total_visits` count as visited, so existing visitors aren't counted twice when this rolls out.

### Reason
Owner wants only new visitors to move the number; the old sessionStorage flag counted every new tab or browser restart.

### Alternatives
- Server-side IP dedup in `api/stats.js` (rejected: Abacus has no per-visitor storage, and it would need a database). Clearing site data, private windows, or another browser/device still count as new visitors.

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

## 2026-10-25 — Project Galleries Use Composed Real Screenshots
> **Partly superseded**: galleries were recaptured at native resolution on 2026-11-04 (3200×1800 WebP via `srcset`; see NOTES "Gallery refresh"); MedCore no longer uses the old QA captures. Cipher Shift was removed 2026-11-04.

### Decision
Project cards show swipeable galleries of real screenshots composed into device/browser frames (`assets/images/projects/*.webp` since 2026-10-31, transparent). No live links or status tags on cards (owner's request), except Mulat Media, which links to mulat-media.vercel.app (owner's request, 2026-10-29). Demo data came from each app's own demo mode (SERVIO offline demo, AdvanCare built-in demo profile) or in-browser intercepted API responses (AdvanCare staff console) — nothing was written to any project database. MedCore uses its existing QA captures in `MedCore1/docs/validation/ui-polish/after/`.

### Alternatives
- AI-generated mockups (rejected: less honest than real UI).
- Bare login-page screenshots of the live sites (rejected: weak visuals).

---

## 2026-10-25 — v3 Rebuild Stays Framework-Free, Split into ES Modules

### Decision
Rebuild the site with the same zero-framework approach, but split styles into `css/*.css` and behavior into one ES module per feature under `js/`, loaded from `js/main.js` where each init is wrapped so one failure can't break the page.

### Reason
Keeps the "no build step" decision while making the much larger interaction layer maintainable. ES modules require serving over HTTP (Vercel already does).

### Consequences
Opening `index.html` from disk no longer works; use a local server.

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

## 2025-01-05 — Pure Vanilla CSS Design Tokens over Tailwind/Frameworks
> **Partly superseded** by the v3 rebuild (2026-10-25): Bento Grid layouts are gone; the no-framework/no-build approach still holds. Payload and Lighthouse figures were not re-verified.

### Decision
Build the entire portfolio UI using pure vanilla CSS3 custom properties and Bento Grid layouts with zero CSS frameworks or utility libraries.

### Reason
Achieves the absolute highest performance (<80KB total payload), eliminates build-step friction, gives 100% granular control over 3D transforms, and avoids dependency rot.

### Alternatives
- **Next.js + Tailwind CSS**: Common choice, but creates unnecessary megabytes of JavaScript for a portfolio website.

### Consequences
Ultra-fast sub-second First Contentful Paint and flawless 100 Lighthouse audit scores.
