---
type: changelog
title: Personal Website Changelog
project: Personal Website
tags:
  - changelog
  - history
last_updated: 2026-11-02
---

# 📜 Personal Website — Changelog

## Images converted to WebP (2026-11-02)
- **Changed**: Owner asked for all site images in WebP. The 17 award and training photos (JPG) and the 9 PNG tool and contact icons were converted (recipe in NOTES.md, "Image Formats"); `index.html`, `js/lightbox.js` and `js/icons.js` point to the new files and the old JPG/PNG files were deleted. Total weight of these images: 9.4 MB → 4.0 MB (photos about 60% smaller at SSIM ≈ 0.98; icons lossless). Favicons and `og-image.jpg` intentionally unchanged.
- **Checked**: all 44 WebP images on the page load and decode in Chrome and WebKit (script).
- **Tests**: 137 pass, 19 skipped.

## MedCore promo video; promo buttons relabelled (2026-11-01)
- **Added**: The MedCore promo (from `MedCore1/docs/media/production/medcore-promo.mp4`, 24 MB, 32s, 1080p60, owner's voiceover) as the last slide of the MedCore deck, plus a watch button under its description, as the other three have (owner asked). Encoded with the recipe in NOTES.md plus `-vf fps=30`: `assets/video/medcore-promo.mp4`, 4.7 MB, SSIM 0.994, peak 2.1 Mbps. Poster is the end card at 31.5s (logo, "MedCore", "Clear the way for care."), 1280×720 (`medcore-promo-poster.webp`). Aria-label says "with voiceover" (the production README lists the owner's VO).
- **Changed**: All four promo buttons now read "Watch the product video" (owner asked for something like "Watch the product promotion video"), with the running time after a hairline as a Geist Mono timecode (0:30, 0:32, 0:39, 0:30). The timecode is `aria-hidden`; a `.sr-only` ", N seconds" is read instead. Fits on one line at 320px.
- **Checked**: plays in Chrome and WebKit (script).
- **Tests**: 99 pass, 15 skipped. The promo-window, deck and swap tests now include MedCore.

## Redesign revisions (2026-11-01)
- **Owner's notes, applied**: halftone portrait removed from "What I do"; hero cut to "I build full-stack apps and train in data engineering." with both roles marked by an orange stroke that sweeps in (kicker now carries "CS, Cagayan State University"); About body cut to two short lines; the typed SQL lines in Journey removed; Journey phrases set on one line (smaller words, `nowrap`); project slides in Journey shown whole (`.yr__media--fit`, contain on the card) and the portrait framed to keep the full head; "Next" rewritten (An internship. / Data engineering., a plain note and a "Get in touch" link; the SQL code card is gone); Contact now follows the page theme instead of always dark; its five cropped thumbnails replaced by three project cards (AdvanCare, MedCore, SERVIO) with names; contact paragraph shortened; the hero marquee drops its bottom row (Tuguegarao · Cagayan · Philippines) so the Scroll cue reads clearly; the GitHub pass is GitHub purple (#6e40c9) with its weeks in white; the preloader is restyled in the new type (heavy count, name, 4px ink bar, plain paper). After a psql console card and a MacBook with an opening lid were both tried and rejected, the hero's right side is the floating draggable icons again (`icons.js` rewritten), now 24 of them laid out in the right column: Python, PostgreSQL, SQLite, Neon, Supabase, Drizzle, TypeScript, JavaScript, React, Angular, Ionic, Capacitor, Expo, Node.js, Hono, Cloudflare, Vercel, Git, GitHub, VS Code, Cursor, Claude, Gemini, Ollama. Journey 2024 uses the owner's new portrait (`assets/images/portrait.webp`, 1000×874: cut just above where the shirt meets the photo edges, fitted whole in the same 4:3 card as the other photos on matching white); the halftone ID photo is no longer used there. The contact card avatar and the email pass's "To" chip use the same photo whole, scaled to 240×240 (`assets/images/avatar.webp`; a tight face crop read as too zoomed in). The green status dots are removed (contact tag now neutral, the "Open" chip dropped).
- **Changed**: The view counter counts every visit (the once-per-browser lock is gone). Local copies and automated browsers still only read it.
- **Tests**: 108 pass, 15 skipped.

## Redesign after jeancreate.com (2026-11-01)
- **Changed**: Owner asked for a redesign in the style of jeancreate.com (its text animation, UI and UX), keeping their colours, their footer, and Work directly under the hero; no intro splash and no exploding-camera animation; "add some uniqueness, don't copy all of it".
- **Type & shape**: Geist only for the page (display 800, −0.045em; heads 650), full 100–900 axis declared. Rounded cards (28px), pill buttons (outline / ink / orange), floating pill nav with a sliding active pill. Colours unchanged.
- **Motion**: hero lines rise out of masks; section headings read in word by word with the scroll and an ink highlight box wipes across the key words; blocks rise in; pale words drift in rows behind the hero.
- **Sections**: hero (small name, big "McLein Onza.", icons kept on the right); Work as rounded cards (pinned track kept); About in two columns plus a "What I do" accordion (Build / Model / Automate, halftone portrait `profile-arms.webp`); the manifesto, record rows and trait deck removed; new Journey: one year per screen, pinned, with a typed SQL line and a real photo (2022 High Honors → Next: data engineering); Activity and Stack as card tiles (schema join kept); Recognition as a dark lead card plus a two-by-two grid; Contact always dark with a profile card (local time), a message button and a wallet of Email / LinkedIn / GitHub passes (GitHub fills from the real calendar).
- **Added**: interface sounds (`sfx.js`, Web Audio, mute toggle in the nav), at the owner's request.
- **Unique to this site** (not in the reference): typed SQL per year, photos instead of skylines, schema tables, GitHub pass from live data, accent-orange pass.
- **Tests**: 108 pass, 15 skipped (new: accordion, wallet, sound toggle; nav jump lands under the floating bar; copy test uses the wallet's Copy). `motion.spec` footer-vista test was flaky once on iphone-14 (passes on rerun); footer untouched.

## Promo buttons more visible (2026-11-01)
- **Changed**: The three "Watch the N-second promo" buttons (AdvanCare, SERVIO, MedRec) were small grey underlined text; owner asked for them to stand out. They're now printed controls (`.btn` + `.project__promo`: ink border, inset rule, 44px tall, `--text-sm`) with an orange play mark (`--color-accent-text`), the outlined style of "Message me", not the filled orange of the main calls to action. `button.project__link` rule removed; `.project__link` stays for the Mulat Media site link.
- **Tests**: 93 pass, 15 skipped.

## AdvanCare promo video (2026-11-01)
- **Added**: The AdvanCare promo (from `AdvanCare/promo_video/AdvanCare-promo-30s.mp4`, 22 MB, 1080p60) as the last slide of the AdvanCare deck, plus the "Watch the 30-second promo" button under its description, as SERVIO and MedRec have (owner asked for the same treatment). Encoded with the recipe in NOTES.md plus `-vf fps=30` to match the other promos: `assets/video/advancare-promo.mp4`, 5.6 MB, SSIM 0.993, peak 2.75 Mbps. Poster is the end card at 29.5s (logo, "No barangay resident left behind.", "Cagayan · Philippines"), 1280×720 (`advancare-promo-poster.webp`). It has narration (checked with a whisper transcript), so the aria-label says "with voiceover". The award line sits in the margin under the slides, so it doesn't cover the video's controls.
- **Checked**: plays in Chrome and WebKit (script).
- **Tests**: 93 pass, 15 skipped. The promo-window, deck and swap tests now include AdvanCare; the first-deck dots test expects 4 dots and jumps to the last before wrapping.

## SERVIO promo v2 (2026-11-01)
- **Changed**: `assets/video/servio-promo.mp4` now holds the new 39s feature-led cut with the new voiceover (re-rendered in `SERVIO/promo-video/servio-promo-vo.mp4`, 15 MB). Encoded with the recipe in NOTES.md: 6.0 MB, SSIM 0.996, peak 3.5 Mbps. Poster is the new end card at 37s (logo, "Help, delivered." and 8 feature chips), 1280×720. The button and the video's aria-label say 39 seconds instead of 30.
- **Checked**: plays in Chrome and WebKit (script). Tests: 87 pass, 15 skipped.

## MedRec promo video (2026-10-31)
- **Added**: The MedRec promo (from `MedRecord_App/promo_video/medrec-promo.mp4`) as the last slide of the MedRec deck, plus the same "Watch the 30-second promo" button under its description, as SERVIO has (owner asked for the same treatment). Re-encoded with the SERVIO recipe to `assets/video/medrec-promo.mp4` (7.8 MB, was 54 MB; peak 4.2 Mbps in the flying-papers scene). Overall SSIM 0.964: 0–17s ≈0.995; the aubergine scenes from 18s drop to 0.89–0.95 because the source's film grain is smoothed out, while text and UI stay sharp. Poster is the 28s end card ("MedRec — Medical records, together."), 1280×720 (`medrec-promo-poster.webp`). Label omits "with voiceover": not confirmed whether it has narration or only music.
- **Code**: none needed in `gallery.js` / `video.js`; both were already per-deck. Plays in Chrome and WebKit (checked by script).
- **Tests**: 87 pass, 15 skipped. The promo-window and deck tests now run for SERVIO and MedRec (picked by `data-video-title`), plus one that opens both in turn and checks the window swaps film, poster and title.

## SERVIO promo video (2026-10-31)
- **Added**: The SERVIO promo with voiceover (from `SERVIO/promo-video/servio-promo-vo.mp4`) as the last slide of the SERVIO deck, plus a "Watch the 30-second promo" button under the title that opens it in a video window (owner asked for both). Re-encoded for the web to `assets/video/servio-promo.mp4` (H.264 CRF 26, faststart, 7.1 MB, was 28 MB; SSIM 0.993); poster is the end card (`servio-promo-poster.webp`). `preload="none"`, so nothing loads until play.
- **Fixed** (same day, after deploy): Safari sat on a loading spinner after play. The slide now switches to `preload="auto"` when it becomes the current slide, so the film is buffered before play. Re-encoded with a 3 Mbps cap and 2s keyframes (peak 5.9 → 3.8 Mbps in the town scene, 6.4 MB). `tests/serve.mjs` answers byte ranges, which WebKit needs to play MP4 locally. The video-window test now opens it by keyboard (a forced click could miss the moving work track).
- **Checked**: view/like counts are not locked. Abacus keys are live and the proxy increments; 232 holds because only new browsers count, once each (owner's own browser, localhost and automated browsers never do).
- **Tests**: 78 pass (new: video window opens, pauses on close, returns focus; deck's last slide is the video and expand opens the video window). `health.spec` ignores Playwright WebKit's "Button failed to load, iconName" errors, which its own `<video controls>` icons raise. `tests/serve.mjs` serves `.mp4` as `video/mp4`.

## Footer vista (2026-10-31)
- **Added**: Muted colour: island in three greens, brick-and-off-white lighthouse with a red roof. Light theme is daytime: lamp off (no beam or water glint), the moon becomes a sun with turning rays and a shimmer on the sea, clouds drift, no stars, dock lamp off; heavier glyphs and deeper tones for contrast. Toggling the theme redraws at once.
- **Fixed**: View count inflated by non-visitors: on localhost (no `/api`) the client fell back to Abacus `hit`, so every local load and every automated browser (tests, screenshots) counted. Now only real browsers on a non-local host count (`navigator.webdriver` and hostname check). Visits moved to a fresh Abacus key `portfolio_views`, created at 232 (old `portfolio_visits` stopped at 526). Likes unchanged (72).
- **Fixed**: On Android Chrome with the phone in dark mode and the site's light theme chosen, Chrome auto-darkened the page and the trait deck's card edges faded out. Light theme now declares `color-scheme: only light`; `<meta name="color-scheme" content="light dark">` added. Regression test in `health.spec.mjs`.
- **Added**: Full-width ASCII scene under the footer wordmark (owner's request: a scenic reward for reaching the end): Cape Engaño lighthouse on Palaui Island, Cagayan, at night. Starry sky spans the whole footer behind the text. A shaded full moon (left) with maria and craters, a dock with a lamp and a footpath up to the lighthouse, an island shore that slopes in smoothly, land and tower heights scaled to the grid's proportions so phones and tablets get a broad hill and a stone foundation (no needle-thin peak), trees, a sailboat crossing, waves drifting, and a beam that sweeps down onto the sea without retracting. Runs on its own clock (not tied to scroll); still under reduced motion. Small type (~4px per column) for detail.
- **Changed**: The nav slides away once the footer's top edge reaches it (`.nav.is-away`, `scroll.js`) and returns above it, so the scene shows unobstructed.
- **Changed**: The footer is exactly one screen tall (100svh); the scene fills whatever space the rows leave. Tests: 66 pass.
- Rejected along the way: a mountain-lake scene, a 0/1 decode reveal, a static-only version.

## Project-first, clear slides (2026-10-31)
- **Fixed**: iMac screenshots (AdvanCare, MedCore) and the Mulat Media iPad/MacBook screens didn't fill their device screens (16:10 captures letterboxed in 16:9 frames). All 15 slides rebuilt on MockUPhone device frames (iMac, MacBook Pro 14, iPad Air, iPhone 14 Pro) with every screenshot filling its screen; Mulat Media and MedRec recaptured at the exact device sizes. (A CSS-frame version from earlier the same day was rejected as fake.)
- **Changed**: Slides have transparent backgrounds (WebP with alpha, 2000×1125, 1.2 MB total, was ~1.9 MB of JPEG); brand gradients, logos and taglines dropped. Gallery sheet has no fill or shadow.
- **Changed**: Work moved directly under the hero; Work is first in the nav and phone menu.
- **Added**: Screenshot viewer: tap a slide (or Enter, or the new expand button) to open the project's set in a wide lightbox, with a short note per slide. Project cards are larger (up to 74vw / 1180px).
- **Fixed**: On narrow cards (≤560px) the AdvanCare award line wrapped to four lines beside the controls; it now takes its own line under the slide.
- **Tests**: 60 pass (new: screenshot viewer opens at the current slide, returns focus, and award photos still open in the narrow viewer). WebKit had to be reinstalled for Playwright 1.64.1 (`npx playwright install webkit`).
- **Removed**: Student Journalist, Radio Broadcaster award card.

## Less copy, quieter hovers (2026-10-29)
- **Changed**: Owner felt the layout still read as AI-made (labels and subtext around every heading). Section heads are now the heading alone (dropped the side paragraphs on Work, Activity, Stack, Recognition). Removed: hero meta line (kept as a bare rule; `icons.js` measures it), portrait caption, deck hint, 5 of 8 About record rows, project subtitles, "Scroll" label, activity card header, table descriptions and row counts, journey subtext and the hackathon milestone (covered in Recognition), lead-award theme line, training subtitle and outcomes list, contact h3 and link keys, footer tagline, menu numbers.
- **Changed**: Hover is a tint: `--color-hover` (paper-2 at 55%) and `--color-accent-hover` (accent with 6% ink) in `tokens.css`, used by every button; lifts cut to 1px.
- **Added**: Mulat Media card links to its live site, mulat-media.vercel.app (`.project__link`), at the owner's request; the other cards still have no live links.
- **Changed**: MedRec gallery recaptured from the warm folio redesign (DD-45 in MedRecord_App) and recomposed in its own palette with Remy: 3 slides (was 2, old mint look).

## Tablet hero (2026-10-29)
- **Fixed**: Portrait tablets (iPad Mini/Air/Pro 13) — the hero name was 16vw (about half the width) and the iPad Pro got the full-height desktop hero with the top half empty. Phones and portrait screens up to 80rem now share one rule: hero sized to content, name sized to fill the column (`(100vw − 2·gutter) / 3.45`), icon row above. Landscape tablets keep the desktop layout.
- **Fixed**: Work section on portrait tablets (iPad Pro 13) pinned sideways with 60vw cards and ~400px of empty frame. The pin now also requires `orientation: landscape` (`js/work.js`); portrait screens get the stacked full-width cards.
- **Fixed** (24-device sweep, 320px phones → 2560px desktop; no horizontal overflow anywhere): contact email split mid-word at 320/390/912/1032/1024 — key column fixed at 4.5rem, value shrinks with its container (floor `--text-lg`), `<wbr>` after the @ for the smallest phones. Stack table names ("python_scripting") broke mid-word at 320 — name size follows the card width. Stats pill floated over content on touch tablets — now in the footer on `(hover: none) and (pointer: coarse)` too.

## [Unreleased] — Testing & Audit (2026-10-25)
- **Changed**: View counter counts each browser once, ever (`site_user_has_visited` in localStorage), instead of once per session.
- **Added**: Playwright + axe test suite (`tests/`, `playwright.config.mjs`, dev-only `package.json`); 39 pass, 15 fail on known audit findings (see TODO.md "Design Audit Backlog").
- **Fixed**: All 15 audit failures — suite now 54/54. Muted-ink contrast, 24px gallery dot targets, keyboard-reachable galleries/film/calendar, inert trait-deck back cards, like-button name, phone stats pill moved into the footer, "Hover"/"Tap" copy, schema tap-to-join, faster clock-timed preloader (~2.1s to a readable name), absolute `og:image` (`assets/images/og-image.jpg`) + canonical.
- **Removed**: ⌘K command palette (nav "Jump to" button, footer hint, `/` and Ctrl/⌘+K shortcuts, `js/palette.js`) at the owner's request.
- **Fixed**: Nav jumps landed ~250px low (88px nav clearance + section padding stacked). Sections now land 50px under the nav (`scroll-margin-top`); Work lands at its pinned start. Activity placeholder reserves the calendar's real height so Safari (no scroll anchoring) doesn't shift after a jump.
- **Fixed**: Nav bar no longer hides after a nav link / ⌘K jump (hides only on visitor-driven scrolls). Work section track now sits on the content column instead of starting at the screen gutter (was ~300px off on 1920px screens).
- **Changed**: Self-hosted fonts; hover effects gated to hover-capable devices; UI transitions cut to 240ms; nav dot / calendar cells no longer grow from near-zero; photo strip pauses off screen; preloader overlaps page load (done 750ms after navigation, min 350ms of counting).
- **Changed**: Hero name now Lora (`--font-hero`, weight effect clamps to 400–700), hero intro Open Sans (`--font-hero-body`), About body Nunito (`--font-about`); section headings keep Bricolage. Preloads swapped Bricolage → Lora + Open Sans. Owner felt the old type looked AI-generated.
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
