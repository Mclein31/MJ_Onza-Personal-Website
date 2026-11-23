---
type: worker-report
job: CF2
project: Personal Website
date: 2026-11-23
---

# Report CF2: Contact and footer signature moment

Owner feedback: "the contact and footer is boring, add some special touch to it." Concept: the hero shows the data
pipeline (Extract → Transform → Load); Contact and the footer are now its **Load** end, so the page closes with a
bookend instead of a sitemap. Both stay on the normal page ground (`var(--bg)`) in light and dark, as the owner's
theme-consistency rule requires; the footer wordmark is centred at every width (owner request relayed mid-job).

## What was built

### Contact (`#contact`)
- **Query readout** under the heading "So, what are we building?" (heading and lede unchanged):
  `SELECT * FROM opportunities` / `WHERE role = 'data engineering intern';` in Geist Mono (12px at 320 → 20px on
  desktop; keywords in ink 500, identifiers in `--ink-2`; a wrapped line hangs under its keyword). Under a hairline,
  a one-row result: **■ 1 row · open to internships and projects** (the site's existing availability line, moved here
  from the aside so it is not stated twice). Then **Send a message** (the single `.btn--primary`, the way to "run"
  the query) and the existing ghost "See the work →".
- **Typing (scripts/design/contact.js, `initQuery`)**: types once when the query enters the view (~1.1 s, slightly
  uneven per character, a short beat at the line break) with a 2px orange caret riding the last character; the
  caret fades out (no blinking) and the result row fades up 6px. Characters are pre-laid out and only change
  `visibility`, so nothing reflows. Static (fully shown) under reduced motion, without JS, when the query is
  already on screen or above at load, or when a jump scrolls past it before it starts. Screen readers get the plain
  sentence once (the split copy is `aria-hidden`, a `.sr-only` twin carries the text).
- **Channel rows**: on hover (fine pointer) or keyboard focus, a 1px orange scan line passes along the row's hairline
  (draws in from the left, leaves to the right, 620 ms `--ease-in-out`, one pass), the action's ghost underline grows
  and its ↗ nudges 2px. Replaced the old grey hover fill. Reduced motion: the orange line simply shows, no travel.
- **Phones / tablets (≤960)**: the query now follows the heading directly; the person card and visits/likes move to
  the end of the section.
- Kept: exactly one copy control (`data-copy` on the email), every channel link, the stats readout
  (`data-stats-visits`, `data-stats-like`, `data-stats-likes`), `data-message-open`, `data-activity-mini`,
  `data-activity-mini-total`, all ARIA.

### Footer
- **Three quiet columns** on the 12-column grid: *Sections* (8 `.btn--ghost` in-page links, 2 columns), *Elsewhere*
  (GitHub, LinkedIn, WhatsApp, Email, ghost with ↗), *Colophon* ("Set in Geist and Geist Mono. Built with plain HTML,
  CSS and JavaScript, no framework. Hosted on Vercel."), and **Back to top ↑** (`.btn--ghost`, smooth scroll via
  `scripts/core/nav.js`). Tablet: three columns, back-to-top below; phones: stacked, links in 2 columns. No clock, no
  location.
- **Wordmark (scripts/design/footer.js, 2D canvas, not WebGL)**: "McLein Jei Onza" drawn edge-to-edge (margin to
  margin) and centred, as a dot matrix of the hero's grey points (`--field`, about 19% at half alpha for texture)
  with a sparse 3.5% scatter of `--orange` points. The letters are rasterised once, sampled on a grid whose pitch
  scales with the type (3.4–8 px), snapped to device pixels. When the box is narrower than 720 px the word is
  "Onza" (the full name's strokes are too thin for a legible grid there).
  - *Desktop, fine pointer, motion allowed*: when the wordmark comes into view the points stream in from the left
    edge inside a narrow band (the pipe) and fan out into their letters (≤1.2 s, cubic ease-out, once). The status
    label reads "Loading" with a grey square, then **■ Load complete**. Points within 92 px of the cursor are pushed
    up to 24 px away and lerp back (no overshoot). rAF runs only while something moves; paused offscreen
    (IntersectionObserver) and when the tab is hidden; DPR capped at 2; rebuilt on resize, recoloured on
    `theme:change` and on OS scheme change.
  - *Touch or reduced motion*: the settled dots are drawn once, crisp. *No JS / no canvas*: the same Geist 600 text
    with a 4px dot mask over solid `--field` (theme-aware). Never a blank box.
- Base line: `© <span data-year>` McLein Jei G. Onza (left) and the **Load complete** status (right; stacked under
  400 px).

## Files changed
- `index.html`: `#contact` markup (query block added, aside availability line removed) and the `<footer>` markup only.
- `styles/contact.css`, `styles/footer.css` (rewritten).
- `scripts/design/contact.js` (added `initQuery`; dialog/copy/validation code untouched), `scripts/design/footer.js`
  (was a stub; already loaded by `scripts/design/index.js`).
- Nothing in `scripts/core/`, `styles/hero.css`, `styles/nav.css`, `scripts/design/hero.js` or the header/hero markup.

## Verification
Served with `node tests/serve.mjs 4523`; Playwright (Chrome channel + WebKit) scripts with mocked stats/contributions.
- **Viewports** 320x568, 390x844, 466x678, 626x890, 890x626, 1280x800, 1440x900, 1920x1080, 2560x1440, light and
  dark: no horizontal overflow, console clean. Reduced motion at 390 and 1440, light and dark. No-JS at 1440 light and
  390 dark (dotted CSS fallback). WebKit (touch, mobile) at the three iPhone Duo postures: canvas `letterSpacing`
  supported, static dots drawn, no overflow, no errors.
- **Frame time while sweeping the cursor across the wordmark** (Chrome, DPR 2, 120 mouse moves over 2 s): 1440x900
  median 16.7 ms, p95 16.8 ms, max 16.8 ms; 2560x1440 (largest point count) median 16.7 ms, p95 16.7 ms, max 16.8 ms
  (steady 60 fps). Pointer event to painted frame: median 16.7 ms, p95 ≤18.6 ms. After the cursor leaves:
  0 redraws in 1 s (loop idle).
- **Animations stepped with Playwright's fake clock**: typing mid-frame shows the caret on the last typed character;
  the scan line at 250 ms of 620 ms; stream frames at 120/300 ms show the band fanning into letters.
- `npm run test:v5`: 46 passed, 3 skipped, 2 failed. The 2 failures are the theme toggle test on `v5b-iphone14` and
  `v5b-duo-folded` (toggle not visible), caused by the concurrent H3 job moving the theme toggle into the burger
  menu, not by CF2. Every form, stats, toast, copy, dialog-lock, reduced-motion, contribution and page-health test
  passes on desktop, iPhone and Duo folded (re-run filtered: 22 passed, 2 skipped).
- `npm run audit:v5`: 26 passed, every viewport "TOTAL: clean" (overflow, overlap, tap targets, images, console,
  axe serious/critical, reduced motion), including WebKit iPhone 14 and the three Duo postures. axe scoped to
  `#contact` and `footer` (390 light, 1440 dark): 0 violations of any impact (the audit's minor
  aria-allowed-role / presentation-role-conflict notes come from other sections).
- Impeccable detector on the four changed files: clean (an earlier `radial-gradient` dot fill was flagged as
  "gradient text"; replaced by an SVG dot mask).

## Screenshots (`.brain/research/redesign-v5/CF2/`)
- `before-contact-*` / `before-footer-*`: 390x844 and 1440x900, light and dark (state before CF2).
- `after-contact-<vp>-<theme>.png` / `after-footer-<vp>-<theme>.png`: all nine viewports, light and dark;
  `*-rm.png`: reduced motion (390, 1440).
- `anim-*`: typing mid-frame, channel scan, stream frames, cursor push; `nojs-*`: CSS fallback; `webkit-duo-*`:
  WebKit at the Duo postures.
- Note: element screenshots of the (now taller than one screen) footer at phone sizes can show the fixed header and
  skip link pasted over the top; that is a capture artefact (in a real viewport the skip link stays at
  translateY(-70px) and nothing is focused).

## Left undone / for the orchestrator
- Real-device check of the cursor push and stream on a real GPU/screen (measured only in Playwright Chrome).
- The full name on the wordmark is fairly fine at 720–900 px wide boxes (890x626 landscape Duo): legible, but the
  dot grid is at its minimum pitch there; "Onza" alone could be used up to ~900 px if the owner prefers bolder.
