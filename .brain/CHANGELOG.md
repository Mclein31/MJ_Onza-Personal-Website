---
type: changelog
title: Personal Website Changelog
project: Personal Website
tags:
  - changelog
  - history
last_updated: 2026-11-24
---

# 📜 Personal Website — Changelog

Newest first. Entries dated 2026-10-31 and older (including the versioned 1.0.0–3.0.0 releases) are archived verbatim in [archive/CHANGELOG_ARCHIVE.md](archive/CHANGELOG_ARCHIVE.md).

## 2026-11-24 — Simpler Recognition and Training, stronger hero, centred footer
- **Recognition and Training**: visible photos cut from 21 to 4 (two each). Removed the archive and program galleries, row thumbnails, the floating hover preview and `scripts/design/recognition.js`, which toggled 39 times across 40 wheel steps with a moving cursor. Content in both sections no longer reveals on scroll.
- **Contact**: replaced the SQL query and its typing animation with a three-item facts list (`.contact__facts`) and shortened the lede.
- **Hero**: thicker, more opaque points (`4.2px` grey, `5.8px` orange), orange share `3%` → `7%`, SVG posters thickened to match. Phones and tablets at least `620px` tall now pin the hero for half a screen while the points settle.
- **Footer**: the wordmark is positioned from painted pixels instead of `measureText`, fixing a `2–4px` rightward offset in WebKit on phone and tablet sizes.
- **Verified**: `test:v5` 48 passed, 3 skipped, matching the previous commit on isolated ports. Real-device check still open.

## 2026-11-23 — Instrument follow-ups: minimal hero, one theme, custom scrollbar, Contact SQL & Footer wordmark
- **Hero & Nav (`H2`, `H3`)**: unified all hero hairlines, `.hero__plot`, `.hero__tools::after`, and stage ticks (column lines `2`/`6`/`10` desktop, `1`/`2`/`3` on 4-col phones) onto `.container` with equal outer margins and `--hair: var(--rule-2)`; added `hero-field-{grey,orange}-phone.svg` fallbacks. Removed the school/course strip (and interim 4-cell H2 strip) and telemetry readout (`N points · flow`) in favour of a single `.hero__status` line (`Open to data engineering internships`), quieter WebGL field (`3,000` desktop / `1,400` touch points) + dimmed poster fallback, desktop-only `.hero__axis` labels (`>=961px` fine pointer), hidden `.hero__tools` on phones (`<=720px`), and faster hero/nav entrances (`40ms`/`100ms`/`140ms`). Replaced the header `.seg` theme switch with one `.btn--icon` `[data-theme-toggle]` button moved into `.site-header__menu-theme` inside `[data-menu]` at `<1180px` by an inline script.
- **One theme across the page (`about.css`, `about.js`)**: removed `#about`'s rising dark ink field (`#111214` / `--bg-2`); About now sits on `var(--bg)` in both light and dark modes with a top hairline rule, and `scripts/design/about.js` drops the dark-field scrub.
- **Custom scrollbar (`S2`)**: added `styles/scrollbar.css` and `scripts/design/scrollbar.js` (appended to `AREAS` in `scripts/design/index.js`), providing a fixed `.sbar` rail with proportional section ticks and a draggable thumb on `(pointer: fine)` desktop, plus `6px` styled native scrollbars on touch and inner scroll containers.
- **Contact & Footer (`CF2`)**: added the two-line SQL query readout (`SELECT * FROM opportunities` / `WHERE role = 'data engineering intern';` + `1 row · open to internships and projects`) with one-time character typing (`initQuery()` in `scripts/design/contact.js`) and `620ms` orange scan-line hover/focus on channel rows (`<=960px` places query first, aside last). Rebuilt `<footer>` (`styles/footer.css`, `scripts/design/footer.js`) into three columns + Back to top and a centred edge-to-edge 2D-canvas dot-matrix wordmark (`"McLein Jei Onza"` / `"Onza"` `<720px`) with left-pipe stream-in (`Loading` → `Load complete`) and cursor push on fine-pointer desktop.
- **QA, OG & Test fixes (`QA-M`, `FX1`, `QA-OG2`)**: `tests/visitors.spec.mjs` retry race fixed (`FX1`: `8/8` passing on `iphone-14`); `assets/images/og-image.jpg` and head `og:image:alt`/`twitter:image:alt` refreshed in `QA-OG2` for the `H2` hero; `QA-M` completed phone & iPhone Duo design audit (0 overflow across 5 viewports, 14 findings logged incl. dark-mode glare on `journey-portrait.webp` and `avatar.webp`). Note: `H3` moving `[data-theme-toggle]` into the closed burger drawer on `<1180px` leaves the touch theme-toggle test in `tests/v5-behaviour.spec.mjs` needing a `[data-menu-toggle]` click first (`H3.md`, `CF2.md`).

## 2026-11-23 — "Instrument" redesign v5 (built by parallel workers)
- **Changed (full rebuild)**: replaced the Signal `css/` and `js/` codebase with owner-picked Direction A **"Instrument"** (`styles/` 15 files, `scripts/main.js`, `scripts/core/` 16 modules, `scripts/design/` 10 files). Cool light-grey/dark ground (`#E9EAEC` / `#0F1012`), 2px hairline radius everywhere (`--r: 2px`), Geist (weights 400–600) + Geist Mono, international orange (`#FF4F00` / `#FF5A1A`) + rare cobalt (`#2448D8` / `#7088FF`), unified button hierarchy (`.btn--primary/secondary/ghost/icon/sm`, `.seg`), shared `.section-head`/`.plate`/`.container` primitives, single keyed scroll-lock (`scripts/core/lock.js`), and standalone `scripts/core/intro.js` gate with 2.5s JS / 2.6s CSS failsafes.
- **Added (vendor & delivery)**: self-hosted vendored ESM packages in `vendor/` (GSAP `3.15.1`, Lenis `1.3.27`, OGL `1.0.11`; minified in place with `esbuild@0.25.12`, 915,336 B → 337,803 B, documented in `vendor/README.md`), `vercel.json` Cache-Control headers, standalone `404.html`, and static SVG hero fallback assets (`assets/images/hero-field-{grey,orange}.svg`).
- **Changed (sections)**:
  - **Loader & Nav**: column-scan 000–100 intro loader; fixed header with section links, active orange square, scroll progress readout, Light/Dark `.seg` (circular View Transition wipe), small "Let's talk", and `<1180px` full-height drawer.
  - **Hero**: spec strip, raw WebGL Extract → Transform → Load particle stream (`4,096` desktop / `2,048` touch points settling onto column hairlines over static SVG fallbacks), and a static 24-tool row.
  - **Work**: index jump table + one-viewport-per-project spec sheets with `.plate` galleries driven by prev/next buttons, ticks, touch swipe, arrow keys, and orange clip-path wipes (`scripts/design/work.js`); no pinned horizontal or multi-screen scroll per owner feedback.
  - **About**: rising dark ink field (`--bg-2` raised panel in dark mode) with top orange scan line, `SplitText` line-rise heading, profile spec list, and native `<details name="does">` accordion.
  - **Journey, Activity & Stack**: 7-entry vertical-spine log (`scripts/design/journey.js`); cool-grey → orange level 4 GitHub Activity grid with WAAPI column sweep (`scripts/design/activity.js`); 5-table Stack schema grid with interactive join highlighting (`scripts/design/stack.js`).
  - **Recognition, Training, Contact & Footer**: editorial index rows with desktop corridor floating preview (`scripts/design/recognition.js`) and 8-plate training gallery; Contact aside with single direct email `[data-copy]`, inline visits/likes readout, 4 channel cards + 16-week GitHub mini grid, origin-anchored dialogs (`scripts/design/contact.js`), and minimal Geist footer wordmark.
- **Removed**: Signal visual system (cream/signal-red bands, giant numerals, pinned Work/Journey, draggable hero icon carousel, Contact wallet and receipt copier, floating stats pill, ASCII lighthouse footer, Web Audio sounds, Hedvig Letters Serif font) and 7 retired Signal-only test specs (`icons`, `interactions`, `redesign`, `responsive`, `spacing`, `timing`, `wallet`).
- **Tests**: added `tests/v5-behaviour.spec.mjs` (`npm run test:v5`, 48 passed / 3 viewport-gated skips observed in W1 & W5 runs across `v5b-desktop`, `v5b-iphone14`, `v5b-duo-folded`) and `tests/v5-audit.spec.mjs` + `tests/v5-audit-helpers.mjs` (`npm run audit:v5`, 13 viewports incl. all 3 iPhone Duo postures); adapted 6 retained contract specs (`health`, `mobile`, `motion`, `project-polish`, `seo`, `visitors`).
- **Artifacts**: briefs in `.brain/research/2026-11-22-redesign-v5-brief.md` and `2026-11-23-v5-build-brief.md`; prototype and worker reports in `.brain/research/redesign-v5/reports/`; three prototypes under `prototypes/`.

## 2026-11-19 — Phone layout pass (9 Jarviee workers, agy + claude)
- **Removed (all sizes)**: hero coordinates line and Manila clock (`js/hero.js` is now an empty stub), the contact id card's "Tuguegarao City · local time" clock (`js/wallet.js`), the Gmail card's Copy button (the copier's COPY prints the slip), the contact project thumbnails strip.
- **Changed (all sizes)**: Contact moved off the night band onto the normal page scheme, `min-height: 100svh`, two columns on desktop. Copier slip prints on white paper with a hairline, shadow and torn edge. GitHub wallet grid is fluid (week count computed from width in `js/wallet.js`). Gmail card re-laid out as a compose window. "More on GitHub" is a quiet outlined card (red slab border removed).
- **Changed (phones, ≤700px only)**: slim 52px frosted nav and `--nav-clear: 72px`; calmer heading scale and section spacing; one-line hero meta, smaller name, tagline and CTAs, quieter icons; Work without giant numerals or FIG labels, plain mono tags, controls under the gallery; About keeps two facts; Journey image 4:3 at full width with a one-slide-at-a-time swap and a frame sized by the tallest year; Activity shows two stats and a one-line fallback; Stack tables as wrapped mono lists; Recognition/Training compact rows, no photo strip; footer vista 230px.
- **Changed (follow-ups)**: About moved off the night band onto the page scheme (`.section.about` keeps its jump offset); Work numerals 01–05 get their own clear space beside (pinned deck) or above (stacked tablet) the mockups instead of sitting behind them; "More on GitHub" back to a solid ink card (no red border, 600 title); `js/work.js` makes card 01 current at the start of the deck.
- **Tests**: phone-specific assertions updated in `motion`, `spacing`, `project-polish`, `interactions` and `wallet` specs (footer shorter than a screen, nav clearance 72px, 64px between Work projects, fixed Journey progress row, copier-only copy, width-dependent GitHub grid). Full suite 227 passed on desktop Chrome, Pixel 7, iPhone 14; redesign matrix 91 passed.
- Reports: `.brain/research/mobile-reports/`, brief: `.brain/research/2026-11-19-mobile-brief.md`.

## 2026-11-18 — "Signal" redesign (built by parallel Jarviee workers)
- **Changed**: whole-site restyle to cream / ink / signal red (tokens rewritten, names kept), Geist 900 display, Geist Mono 500 labels, `.band--*` section schemes, `.btn-pill`, `.numeral`, `.label`. Paper fibre layers and liquid glass removed (`assets/textures/` deleted).
- **Changed**: hero on the page background with round red i-dot and full stop; Work deck with red numerals and FIG labels; About as a night band with numbered "What I do" rows; Journey with outlined year numerals; Activity calendar in red steps; Stack schema tables with ink headers; Contact night band with a copier that prints the email (`js/copier.js`, `css/copier.css`, new `print` sound in `js/sfx.js`).
- **Removed** (owner requests during the build): the red hero band, Instrument Serif, the scroll-drawn signal line plus cursor ink trail (`js/signal.js`, `css/signal.css` deleted), the black word ticker under the hero (duplicated the icon carousel), the Recognition/Training file-drawer (replaced by an editorial index, `js/drawer.js` / `css/drawer.css`) and the "With High Honors" award (markup and lightbox `PHOTOS` entry; `data-lb` indexes renumbered).
- **Restored**: brand colours on the LinkedIn, WhatsApp and Gmail wallet cards (owner request).
- **SEO**: share image (`assets/images/og-image.jpg`) regenerated from the new hero, alt text updated.
- **SEO**: projects as a JSON-LD `ItemList`, wider `knowsAbout`, `dateModified`, light/dark `theme-color` metas, `og:locale`, sitemap `lastmod`, `viewport-fit=cover`; image `width`/`height` and lazy loading in Journey, Recognition, Training and Contact.
- **Tests**: redesign device matrix incl. iPhone Duo folded/unfolded in `playwright.config.mjs` + `tests/redesign.spec.mjs`; legacy theme-color and WhatsApp-pass assertions updated to the new palette.

## 2026-11-16 — Dead JS hooks and cursor script removed
- **Removed**: `js/cursor.js` and its `initCursor` import/call in `js/main.js` (`.cursor` is `display: none` in `css/fx.css` and `[data-magnetic]` has no markup).
- **Removed**: Dead hooks in `js/scroll.js` for removed v3 features: `splitWords` / `[data-words]` manifesto, `[data-timeline]` (`--tp`), `[data-award]` overlap scaling (`--s`), `[data-reveal]` / `.milestone` observer + `countUp`, and `.progress` bar (`--progress`).
- **Removed**: Dead `deck()` (`[data-deck]`) and `tilt()` (`[data-tilt]`) hooks in `js/ui.js`.

## 2026-11-15 — Brain cleanup
- Verified the brain against code, git log and the live site (latest commit `d36e90f` is live; old domain still 307).
- PROJECT_CONTEXT cut from 147 to a concise overview; its dated design notes moved verbatim to DECISIONS, domain and
  known-limitation notes to NOTES, name-search SEO details to SEO_SETUP, the repository cleanup note to this file.
- Fixed stale facts: Abacus visit key is `portfolio_views` (not `portfolio_visits`); visits count once per browser
  (NOTES said every visit); Work gallery is 5 projects (Cipher Shift removed); theme tokens are OKLCH white/gray +
  orange (not signal lime); `api/contributions.js`, `activity.js` and `contributions.js` added to ARCHITECTURE;
  typed SQL hero/journey lines and the visible custom cursor are gone.
- DECISIONS reordered newest-first with superseded markers; TODO restructured (obsolete items closed, FormSubmit
  activation and 307→308 redirect added). Entries dated 2026-10-31 and older moved to `archive/CHANGELOG_ARCHIVE.md`.
- Playwright suite was not re-run during this cleanup.

## 2026-11-14 — First Journey slide and contact email
- **Changed**: The first Journey slide ("High school / With High Honors") is replaced by "Self-taught / Started coding"
  with a new photo (`assets/images/journey-first-code.webp`); section intro now "From first lines of code to shipping
  full-stack platforms." (owner request via a Jarviee-launched agent; see [AGENT_RUNS.md](AGENT_RUNS.md)).
- **Changed**: Work email is now `mcleinjeionza06@gmail.com` in the wallet, footer, FormSubmit endpoint and error text.
- Commit `d36e90f`; live on 2026-11-15. (Entry reconstructed from git during the 2026-11-15 cleanup.)

## 2026-11-04 — Sharper device mockups; Cipher Shift removed
- **Changed**: Galleries recaptured at native resolution as 3200×1800 transparent WebP with `srcset`; more feature
  slides (AdvanCare 6, MedCore 6, SERVIO 4, Mulat 3). Details in NOTES "Gallery refresh (2026-11-04)".
- **Removed**: Cipher Shift card, demo window, `js/demo.js` and `demos/` (owner request).
- **Tests**: gallery slide counts are read from the page; slower typing allowed under load (`0843d76`).
- Commits `ea93c6e`, `0843d76`. (Entry reconstructed from git during the 2026-11-15 cleanup.)

## 2026-11-04 — Felt paper surface; more visible fibers
- **Added**: A paper sheet under the fibers (owner: "I don't feel the paper, I just see fibers"). `paper-formation.webp` (509px raster shown at 1109px) adds faint cloudy pulp flocs. `paper-tooth.webp` (619px, 1×) adds a matted tooth of felted micro-fibers. Both are single ink colour with alpha and periodic, so they tile seamlessly. A first, stronger pass read as granite and was toned down about 40%.
- **Changed**: Fiber layers are about 1.5× more opaque, and the mid layer is denser (minimum spacing 50→45px). Five prime-sized layers stack in `--paper-fibers` / `--paper-fibers-size`, ~285 KB total.
- **Tests**: health 18/18 (all three devices) and responsive 42/42.

## 2026-11-04 — Sparser layered paper fibers; liquid-glass cards
- **Changed**: The single 960px `paper-pulp.svg` tile (its repeat was visible) is replaced by three stacked layers: `paper-fibers-top.svg` (1543px), `paper-fibers-mid.svg` (1297px) and `paper-fibers-deep.svg` (1031px). Each is its own prime-sized tile with its own seed, so the combined pattern only repeats every ~2×10⁹ px. Density is about 560 fibers/Mpx, roughly 2.2× the interim version (the original had ~2,900 strokes per 960px tile). Poisson-disk spacing keeps fibers apart. A seamless density drift thins some zones. Lengths are mostly 3–9px, with some 10–22px and rare 26–52px strands, and thickness runs about 0.2–1.8px. Small near-parallel bundles, pulp flecks and shives add variety. Deep is faint and wide, mid has the most variety, surface is crisp with a light edge. 138 KB total (original 312 KB). No filters and no full-page overlay.
- **Changed**: Cards no longer carry fibers. They are liquid glass at the owner's 25% level (75% tinted body), styled after the owner's reference of frosted cards with a bright glowing rim: a cool tinted body, a luminous inner rim, a crisp edge and corner highlight, and caustics that vary per card. The owner then set intensity to about 20% of the reference on Work (`.project__media`, `.project--more`) and about 10% elsewhere (Stack, Contact, Recognition, About). Work cards are pre-blended with no live blur because they move during the pinned scroll. The other cards use `backdrop-filter: blur(20px) saturate(160%)`. Inverted panels use tinted glass that stays dark (light theme) or light (dark theme). The contact card's hairline outline and the photo card's frame line give way to the glass edge. Opaque fallback when backdrop-filter is unsupported or `prefers-reduced-transparency: reduce`.
- **Unchanged**: Photos, gallery images, image mounts and shadows, and `work.css` (another agent is redoing project screenshots).
- **Tests (final)**: health (axe), project-polish, spacing and interactions: 99 pass, 24 skipped across desktop Chrome, Pixel 7 and iPhone 14. `responsive.spec` desktop: 42/42 at `--workers=2`.
- **Tests**: 203 pass, 113 skipped. 5 `responsive.spec` desktop cases time out waiting for the Gmail typing animation under parallel load. The same failure occurs on untouched `HEAD` (4 at `--workers=4`), and the suite passes 42/42 at `--workers=2`.

## 2026-11-03 — Paper texture, palette restore, Work sizing, scroll performance, first-visit counting
- Paper texture/image shadows/responsive spacing refined, then the original white/gray palette and compact project
  cards restored at the owner's request; Work cards fit shorter laptop screens; pinned scrolling does less layout
  work (Work p95 33.4ms → 16.7ms locally); visits count only the first visit per browser.
- Details and measurements in DECISIONS (2026-11-03 entries). Commits `c278323`, `07b363a`, `6e50cbf`, `ac8ba32`,
  `cfeadd1`, `44e2014`. (Entry reconstructed from git during the 2026-11-15 cleanup.)

## 2026-11-02 — Responsive polish, contact animations, CTAs, name-search SEO
- Journey layout and photos updated; contact cards gained personality animations and a soft card-shuffle sound;
  mute control removed; hero primary action styled by class; CTA hierarchy clarified; responsive layouts polished;
  name-search SEO (JSON-LD, robots.txt, sitemap.xml) and Google verification tag added; Journey slides centered.
- Details in DECISIONS (2026-11-02) and [SEO_SETUP.md](SEO_SETUP.md). Commits `05f6e0f`, `b0d5252`, `0c85c60`,
  `c6e863a`, `e8f354a`, `9ac6774`, `74e7222`. (Entry reconstructed from git during the 2026-11-15 cleanup.)

## 2026-11-02 — Metadata moved to the new domain
- **Changed**: The production domain is now `mcleinjeionza.vercel.app` (`onzamj.vercel.app` 307-redirects to it). The canonical link, `og:url` and `og:image` in `index.html`, the README's live link and the vault's Current State note now use the new domain. Both checked with curl: the new domain returns 200 for the page and `og-image.jpg`.
- **Tests**: `health.spec` 18 pass.

## 2026-11-02 — Images converted to WebP
- **Changed**: Owner asked for all site images in WebP. The 17 award and training photos (JPG) and the 9 PNG tool and contact icons were converted (recipe in NOTES.md, "Image Formats"); `index.html`, `js/lightbox.js` and `js/icons.js` point to the new files and the old JPG/PNG files were deleted. Total weight of these images: 9.4 MB → 4.0 MB (photos about 60% smaller at SSIM ≈ 0.98; icons lossless). Favicons and `og-image.jpg` intentionally unchanged.
- **Checked**: all 44 WebP images on the page load and decode in Chrome and WebKit (script).
- **Tests**: 137 pass, 19 skipped.

## 2026-11-01 — Repository Cleanup
_Moved verbatim from PROJECT_CONTEXT.md on 2026-11-15 (commit `f89d909`)._

Temporary redesign captures, mockup working files, generated reports, old design metadata and unreferenced legacy display assets were removed. Published gallery assets, original personal photos, source code, tests, licenses and project documentation remain. Decorative file banners and repetitive styling comments were trimmed; compatibility and behavior explanations remain.

## 2026-11-01 — MedCore promo video; promo buttons relabelled
- **Added**: The MedCore promo (from `MedCore1/docs/media/production/medcore-promo.mp4`, 24 MB, 32s, 1080p60, owner's voiceover) as the last slide of the MedCore deck, plus a watch button under its description, as the other three have (owner asked). Encoded with the recipe in NOTES.md plus `-vf fps=30`: `assets/video/medcore-promo.mp4`, 4.7 MB, SSIM 0.994, peak 2.1 Mbps. Poster is the end card at 31.5s (logo, "MedCore", "Clear the way for care."), 1280×720 (`medcore-promo-poster.webp`). Aria-label says "with voiceover" (the production README lists the owner's VO).
- **Changed**: All four promo buttons now read "Watch the product video" (owner asked for something like "Watch the product promotion video"), with the running time after a hairline as a Geist Mono timecode (0:30, 0:32, 0:39, 0:30). The timecode is `aria-hidden`; a `.sr-only` ", N seconds" is read instead. Fits on one line at 320px.
- **Checked**: plays in Chrome and WebKit (script).
- **Tests**: 99 pass, 15 skipped. The promo-window, deck and swap tests now include MedCore.

## 2026-11-01 — Redesign revisions
- **Owner's notes, applied**: halftone portrait removed from "What I do"; hero cut to "I build full-stack apps and train in data engineering." with both roles marked by an orange stroke that sweeps in (kicker now carries "CS, Cagayan State University"); About body cut to two short lines; the typed SQL lines in Journey removed; Journey phrases set on one line (smaller words, `nowrap`); project slides in Journey shown whole (`.yr__media--fit`, contain on the card) and the portrait framed to keep the full head; "Next" rewritten (An internship. / Data engineering., a plain note and a "Get in touch" link; the SQL code card is gone); Contact now follows the page theme instead of always dark; its five cropped thumbnails replaced by three project cards (AdvanCare, MedCore, SERVIO) with names; contact paragraph shortened; the hero marquee drops its bottom row (Tuguegarao · Cagayan · Philippines) so the Scroll cue reads clearly; the GitHub pass is GitHub purple (#6e40c9) with its weeks in white; the preloader is restyled in the new type (heavy count, name, 4px ink bar, plain paper). After a psql console card and a MacBook with an opening lid were both tried and rejected, the hero's right side is the floating draggable icons again (`icons.js` rewritten), now 24 of them laid out in the right column: Python, PostgreSQL, SQLite, Neon, Supabase, Drizzle, TypeScript, JavaScript, React, Angular, Ionic, Capacitor, Expo, Node.js, Hono, Cloudflare, Vercel, Git, GitHub, VS Code, Cursor, Claude, Gemini, Ollama. Journey 2024 uses the owner's new portrait (`assets/images/portrait.webp`, 1000×874: cut just above where the shirt meets the photo edges, fitted whole in the same 4:3 card as the other photos on matching white); the halftone ID photo is no longer used there. The contact card avatar and the email pass's "To" chip use the same photo whole, scaled to 240×240 (`assets/images/avatar.webp`; a tight face crop read as too zoomed in). The green status dots are removed (contact tag now neutral, the "Open" chip dropped).
- **Changed**: The view counter counts every visit (the once-per-browser lock is gone). Local copies and automated browsers still only read it.
- **Tests**: 108 pass, 15 skipped.

## 2026-11-01 — Redesign after jeancreate.com
- **Changed**: Owner asked for a redesign in the style of jeancreate.com (its text animation, UI and UX), keeping their colours, their footer, and Work directly under the hero; no intro splash and no exploding-camera animation; "add some uniqueness, don't copy all of it".
- **Type & shape**: Geist only for the page (display 800, −0.045em; heads 650), full 100–900 axis declared. Rounded cards (28px), pill buttons (outline / ink / orange), floating pill nav with a sliding active pill. Colours unchanged.
- **Motion**: hero lines rise out of masks; section headings read in word by word with the scroll and an ink highlight box wipes across the key words; blocks rise in; pale words drift in rows behind the hero.
- **Sections**: hero (small name, big "McLein Onza.", icons kept on the right); Work as rounded cards (pinned track kept); About in two columns plus a "What I do" accordion (Build / Model / Automate, halftone portrait `profile-arms.webp`); the manifesto, record rows and trait deck removed; new Journey: one year per screen, pinned, with a typed SQL line and a real photo (2022 High Honors → Next: data engineering); Activity and Stack as card tiles (schema join kept); Recognition as a dark lead card plus a two-by-two grid; Contact always dark with a profile card (local time), a message button and a wallet of Email / LinkedIn / GitHub passes (GitHub fills from the real calendar).
- **Added**: interface sounds (`sfx.js`, Web Audio, mute toggle in the nav), at the owner's request.
- **Unique to this site** (not in the reference): typed SQL per year, photos instead of skylines, schema tables, GitHub pass from live data, accent-orange pass.
- **Tests**: 108 pass, 15 skipped (new: accordion, wallet, sound toggle; nav jump lands under the floating bar; copy test uses the wallet's Copy). `motion.spec` footer-vista test was flaky once on iphone-14 (passes on rerun); footer untouched.

## 2026-11-01 — Promo buttons more visible
- **Changed**: The three "Watch the N-second promo" buttons (AdvanCare, SERVIO, MedRec) were small grey underlined text; owner asked for them to stand out. They're now printed controls (`.btn` + `.project__promo`: ink border, inset rule, 44px tall, `--text-sm`) with an orange play mark (`--color-accent-text`), the outlined style of "Message me", not the filled orange of the main calls to action. `button.project__link` rule removed; `.project__link` stays for the Mulat Media site link.
- **Tests**: 93 pass, 15 skipped.

## 2026-11-01 — AdvanCare promo video
- **Added**: The AdvanCare promo (from `AdvanCare/promo_video/AdvanCare-promo-30s.mp4`, 22 MB, 1080p60) as the last slide of the AdvanCare deck, plus the "Watch the 30-second promo" button under its description, as SERVIO and MedRec have (owner asked for the same treatment). Encoded with the recipe in NOTES.md plus `-vf fps=30` to match the other promos: `assets/video/advancare-promo.mp4`, 5.6 MB, SSIM 0.993, peak 2.75 Mbps. Poster is the end card at 29.5s (logo, "No barangay resident left behind.", "Cagayan · Philippines"), 1280×720 (`advancare-promo-poster.webp`). It has narration (checked with a whisper transcript), so the aria-label says "with voiceover". The award line sits in the margin under the slides, so it doesn't cover the video's controls.
- **Checked**: plays in Chrome and WebKit (script).
- **Tests**: 93 pass, 15 skipped. The promo-window, deck and swap tests now include AdvanCare; the first-deck dots test expects 4 dots and jumps to the last before wrapping.

## 2026-11-01 — SERVIO promo v2
- **Changed**: `assets/video/servio-promo.mp4` now holds the new 39s feature-led cut with the new voiceover (re-rendered in `SERVIO/promo-video/servio-promo-vo.mp4`, 15 MB). Encoded with the recipe in NOTES.md: 6.0 MB, SSIM 0.996, peak 3.5 Mbps. Poster is the new end card at 37s (logo, "Help, delivered." and 8 feature chips), 1280×720. The button and the video's aria-label say 39 seconds instead of 30.
- **Checked**: plays in Chrome and WebKit (script). Tests: 87 pass, 15 skipped.
