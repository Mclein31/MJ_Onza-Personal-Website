---
type: worker-report
job: D-A
project: Personal Website
date: 2026-11-23
---

# Report D-A: "Instrument" (finish pass)

Prototype: `prototypes/direction-a/` (open `http://127.0.0.1:4311/prototypes/direction-a/` after `node tests/serve.mjs 4311`).
Screenshots: `.brain/research/redesign-v5/D-A/`.

## Pitch (plain words)
Your site as a precision instrument. The page is a cool-grey spec sheet with hairline columns and small mono labels
(program, university, class of 2028, looking for a data engineering internship). Behind your name, a field of grey
dots with a few orange ones streams left to right through three labelled stages, Extract, Transform and Load, so a
visitor reads "data engineering" before they read a word. Work is a clean index table, then MedCore as one long,
calm spec sheet: each screenshot wipes in with an orange scan line and the spec table updates with it. The page
then flips to a dark ink field for About. Quiet, exact, and a bit nerdy in the right way.

## Palette
| Token | Light | Dark |
|---|---|---|
| bg (page) | `#E9EAEC` | `#0F1012` |
| bg-2 (raised) | `#F3F4F5` | `#17191C` |
| plate (screenshot) | `#FFFFFF` | `#1C1E22` |
| ink | `#111214` | `#E8E9EB` |
| ink-2 / ink-3 | `#45484D` / `#5E6268` | `#B3B7BD` / `#8F939A` |
| rule / rule-2 | `#C3C6CB` / `#D5D7DB` | `#2E3136` / `#24272B` |
| orange (shapes, scan) | `#FF4F00` | `#FF5A1A` |
| cobalt (focus ring, rare) | `#2448D8` | `#7088FF` |
| field (grey points) | `#7E838A` | `#6B7078` |

## Type (Geist + Geist Mono, self-hosted, weights 400-600)
Hero name `clamp(60px, 10.6vw, 176px)` w600, -0.052em · H2 `clamp(40px, 5.4vw, 92px)` w600 · H3 (project names)
`clamp(40px, 4.6vw, 76px)` · lede `clamp(18px, 1.45vw, 22px)` w500 · body 16px w400 · mono labels 12px w400
(Geist Mono). Radius 2px everywhere. 12-column grid (4 on phones), margin `clamp(16px, 2.6vw, 40px)`.

## The big moments
1. **Loader** (once per session, about 2.2s): a 000 to 100 counter and an orange scan bar draw the same column
   hairlines the hero uses, then the nav drops, rules draw and the name rises line by line. Skipped on repeat
   visits and under reduced motion.
2. **Data field** (the one WebGL piece, raw WebGL, no library): around 4,000 points on desktop, 2,048 on phones.
   Positions are a pure function of time in the vertex shader (no simulation), grey with some orange. Scrolling
   the first half-screen settles every point onto the column hairlines (desktop holds the hero for that; phones
   settle as it scrolls away); the cursor parts the stream. Paused offscreen and when the tab is hidden. Static SVG
   fallback (grey and orange masks) for no WebGL, weak devices and reduced motion.
3. **MedCore figures** (desktop pinned vertically, never sideways): scroll picks the figure, the new one wipes in
   with clip-path while an orange scan line rides the edge, and the odometer, spec table and caption follow.
   On phones and tablets (under 961px) it is a normal stack of seven figures; the film plays after tapping
   "Watch the product video".
4. **Transition into About**: the ink field rises under the SERVIO teaser (translate only), then the heading rises
   line by line. The light/dark toggle uses a circular wipe.

## Libraries
Lenis 1.3.27 (vendored in `vendor/lenis/` with licence; off under reduced motion). No GSAP, no OGL, no CDN.
Everything else is CSS, WAAPI and vanilla ES modules.

## Changed in this pass
`prototypes/direction-a/css/hero.css` only. Below 961px the hero used a fixed `100svh` box, so on the iPhone Duo
landscape (890x626) the intro and both buttons spilled past the hero and were cut off at the fold. Now the hero grows
with its content, and at short landscape sizes (721-960px wide, up to 760px tall) the name and intro share a row
and the name scales with viewport height. Folded and portrait were already fine.

## Verification
- Chromium 1440x900: scrolled end to end (hero, Work index, MedCore figures, SERVIO teaser, About); console clean.
- WebKit, touch, DPR 3 (script, not the MCP): 390x844, folded 466x678, portrait 626x890, landscape 890x626: no
  horizontal overflow (`scrollWidth == clientWidth`), nothing wider than the viewport, WebGL live, hero and CTAs
  inside the first screen at all four. WebKit headless logs "Button failed to load (invalid-placard...)" from the
  native video controls; these are not page errors.
- Reduced motion (1440, 466, 890): no loader, static plot, no text below 0.5 opacity, no overflow, no errors.

## Best 6 to compare (in `D-A/`)
1. Desktop hero: `da-1440-hero.png`
2. Desktop work: `da-1440-work-medcore.png`
3. Desktop transition: `da-1440-transition-about.png`
4. Phone hero: `da-390-hero.png`
5. Phone work: `da-390-work-medcore.png`
6. Duo folded: `duo-folded.png`
Also: `duo-portrait.png`, `duo-landscape.png` (+ `-work` and `-about` for each), `da-1440-hero-dark.png`, `da-1440-work-medcore-dark.png`.

## Known gaps
- Prototype ends at the About heading by design (note text on the page says so). No Journey, Stack, Contact, form or stats.
- Only MedCore has a full gallery; the other four projects are index rows, SERVIO is a teaser (one image).
- No WebGL on a real foldable or low-end device was tested; performance numbers are laptop-only. The field is
  capped at 2,048 points on phones and DPR is limited, but a real-device pass is still owed.
- The 390 and Duo-2x screenshots of the hero and MedCore were taken with a settled scroll; the scan-line wipe and
  the loader are only shown in the older `da-1440-m1/m3` frame sequences.
- The right-most hairline in the hero appears only below the plot (the canvas covers it above). Cosmetic.
