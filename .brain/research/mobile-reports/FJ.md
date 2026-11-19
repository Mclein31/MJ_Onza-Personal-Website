# FJ — Journey on phones (<=700px)

## Files changed
- `css/journey.css`: replaced M4's `@media (max-width: 700px)` block (desktop >=861px and 701-860px untouched).
- `js/journey.js`: `measureFrame()` now sizes the pinned frame from the tallest slide on phones (<=700px). Other widths behave as before.
- `index.html`: not touched.

## What changed on phones
- **Photo**: 4:3 frame, full content width (343x257 at 375x667, 358x286 at 390x844 where it is 5:4 because the screen is tall enough; 16:10 only under 620px height). It was 16:10 capped to `min(28svh, 200px)`. `max-height: 42svh`.
- **Crops (object-fit cover, per-image focal point)**: portrait 62% 50% (face and phone fully inside), DTI pitch 65% 50% (screen and both people), 2nd-place check 45% 40% (both faces and the check), workspace desk photo cover 50% 50%. The two device mockups (Mulat, AdvanCare) stay `contain` on their card so nothing is cut.
- **Slide** is now: year + place on one row, highlighted line, photo, title, one paragraph, then the progress row. Year and place share a row to save height.
- **Stable frame**: the list height is the tallest slide, so photo position and progress row do not move between years; progress row has 24px clear of the paragraph (it was touching it mid-transition before).
- **Clean swap**: whole slide fades as one unit. Outgoing: opacity 0 over 120ms, then `visibility: hidden`. Incoming: waits 130ms, then 240ms fade + 10px rise. The per-part stagger, line clip-path reveal and image zoom are switched off on phones. Sampled every animation frame while scrolling year 2 to 3 at all five sizes: **never more than 1 slide visible, opacity sum never above 1**.
- Kept: pinned year-by-year scroll, `YEAR 0x / 07` row, `prefers-reduced-motion` (JS still skips pinning; stacked list, gap `--space-xl`).

## Verification (Playwright/Chromium, mobile emulation, dpr 2)
Measured on all 7 slides at 320x568, 360x640, 375x667, 390x844, 430x932: no horizontal overflow; slide top identical on every year; note bottom always above the progress row (gap 24-97px); nothing under the nav (words start at >=80px, nav bottom 60px); sticky height equals viewport height at 360x640 and up.
Known limit: at 320x568 the frame is 575px tall in a 568px viewport (7px over, only the bottom padding); all content is visible.

Screenshots (all 7 years, plus mid-transition frames y1-to-2 at 80/180/320ms):
- `/private/tmp/claude-501/-Users-mclein-Documents-Developer-Personal-Projects-Personal-Website/be5467e4-f2e9-4e16-a885-cf2ef2342454/scratchpad/fj/sheet-390x844.png`
- `/private/tmp/claude-501/-Users-mclein-Documents-Developer-Personal-Projects-Personal-Website/be5467e4-f2e9-4e16-a885-cf2ef2342454/scratchpad/fj/sheet-375x667.png`
- `.../scratchpad/fj/after-<size>-y<k>.png` and `after-<size>-y<k>-to<k+1>-t<ms>.png` (same folder). Note: screenshot latency (~100ms+) means these mid frames land near the settled state; the per-frame sampling above is the real overlap evidence.
- Before: `.../scratchpad/fj/before-*.png`.

## Tests
- `tests/mobile.spec.mjs`, `project-polish.spec.mjs` (journey), `responsive.spec.mjs` (Journey, portrait tablet) on pixel-7 + iphone-14: **16/16 passed** (spacing specs are desktop-project only, skipped there).
- `tests/spacing.spec.mjs -g Journey` on desktop-chrome: **4/4 passed** (desktop pinned Journey unchanged, phone/tablet frame within screen height, portrait Journey).
- No assertions edited.

## Notes
- The owner's screenshot (thin image, overlapping slides) matched the earlier M4 state; the stacking came from the staggered per-child fades on absolutely stacked slides.
- Two cross-session messages about the contact section arrived; they were for F-C and ignored here.
