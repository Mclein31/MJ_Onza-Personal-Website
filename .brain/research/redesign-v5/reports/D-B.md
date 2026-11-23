---
type: worker-report
job: D-B
project: Personal Website
date: 2026-11-23
---

# Report D-B: "Exhibition" (finish pass)

Prototype: `prototypes/direction-b/` (open `http://127.0.0.1:4312/prototypes/direction-b/` after `node tests/serve.mjs 4312`).
Screenshots: `.brain/research/redesign-v5/D-B/` (42 files).

## Pitch (plain words)
Your work hung like a quiet gallery show. The page is a cool-grey wall with a lot of empty space, your name very large,
and every screenshot shown as a framed print (thin dark frame, white mat) with a small museum label underneath: title,
year, one line, and the tools in mono like "medium: oil on canvas". On arrival, a small print flips through your
projects and the last one flies into place as the hero picture. Scrolling into Work, the camera walks up to the
MedCore print until it almost fills the screen, then steps back and the wall label appears beside it. The other
MedCore screenshots and the film hang below as a salon wall, SERVIO waits in a small frame, and a dark curtain sweeps
up over the room to reveal the About heading. Calm, spacious, a bit museum-like.

## Palette
| Token | Light | Dark |
|---|---|---|
| wall (page, hero) | `#E9EAEC` | `#111214` |
| paper (work room) | `#F4F5F6` | `#17181B` |
| mat (inside frames) | `#FFFFFF` | `#E6E6E6` (prints stay light, dimmed to 90%) |
| frame | `#16171A` | `#3A3C42` |
| ink / ink-2 / ink-3 | `#111214` / `#4B4F56` / `#63676E` | `#ECEDEF` / `#B0B4BA` / `#8F939A` |
| accent (one action per screen) | `#FF4F00`, text on it `#111214` | `#FF5A12` |
| cobalt (focus ring, selection) | `#2346D8` | `#7D96FF` |
| About room (inverts) | `#121316` on `#EEEFF1` text | `#E9EAEC` with `#111214` text |

## Type (Geist + Geist Mono, self-hosted, weights 420-620, radius 2px)
Name `clamp(64px, 13.4vw, 360px)` w560, -0.052em, one line on desktop (phones `clamp(56px, 19.4vw, 150px)`, two lines) ·
display H2/H3 `clamp(44px, 6.6vw, 132px)` w560-580 · About heading `clamp(36px, 5.2vw, 104px)` · statement
`clamp(20px, 1.72vw, 30px)` w460-480 · body 17px w420 (16px phones) · labels 16px (title w580, line w420 ink-2) ·
mono captions 13px. 12-column grid, margin `clamp(16px, 2.4vw, 44px)`.

## The big moments
1. **Loader + FLIP** (once per session, ends at 2.0-2.1s measured in Chromium and WebKit): a 248-340px framed print
   wipes through 8 screenshots (caption: project name / "Hanging the work"), then the hero's sharp picture swaps in
   and the print flies to its hero spot with a WAAPI translate+scale (860ms, ease-in-out) while the name rises.
   Skipped on repeat visits and under reduced motion; 3s failsafe.
2. **WebGL exhibits** (raw WebGL2/1 in `js/gl.js`, one fixed canvas): the hero print and the plates are drawn as
   subdivided planes that arch slightly with scroll velocity, wipe in inside the shader, and swell like a glass lens
   under the pointer. Paused offscreen and in hidden tabs, DPR capped at 1.5. Fallback = the same framed DOM pictures
   (touch screens, under 900px, reduced motion, low memory/cores, save-data, no WebGL).
3. **The zoom** (desktop, at least 900x560, motion allowed): a 330svh sticky stage scrubs the MedCore print from small
   to near full-bleed, then back to the right column as the label fades in. Phones: no pin, the print grows from 0.86
   to 1 as it enters.
4. **Rooms and curtain**: the work room slides over the hero (hero scales to 0.95 and dims); the dark About room rises
   over SERVIO while its heading hangs back (0.38x), so the edge wipes the heading into view. Vertical only, nothing
   pinned sideways.

## Libraries
Lenis 1.3.27 (vendored in `prototypes/direction-b/vendor/lenis/` with LICENSE). No GSAP, no OGL, no CDN; the rest is
CSS, WAAPI, raw WebGL and vanilla ES modules.

## Changed in this pass
`index.html`, `css/exhibition.css`, `js/main.js` (in `prototypes/direction-b/`; `gl.js` untouched).
- Duo landscape (890x626) fell back to the one-column phone stack: the hero print fell below the fold and every plate
  filled the screen. Short-and-wide screens (700-899, landscape, 500px+ tall) now keep the gallery grid; the whole
  title wall fits 626px.
- Curtain into About: was a plain slide-over; now the heading is held back and wiped in by the edge, its word rise
  cued by the curtain. The hold is off on touch screens (native scroll would make the held text trail).
- Covered rooms stopped staying pinned for the whole page (and keeping the WebGL loop awake): each room is released
  once fully covered, at a moment when it is off-screen, so nothing visible changes. Checked scrolling down and up.
- SERVIO teaser left an empty band above it on phones (forced 100svh); work checklist wrapped at 1280 (now two-row
  below 1366); captions 14 to 16px and mono 12.5 to 13px; phone loader caption no longer wraps; loader caption now
  changes as its picture wipes in.

## Verification
- Own Playwright scripts (the shared MCP browser was locked by another worker): scroll-throughs at 320, 390x844
  (WebKit, touch), 466x678, 626x890, 890x626 (WebKit, touch, DPR 3), 768x1024, 1024x768, 1280x800, 1440x900,
  1920x1080: no horizontal overflow, no element past the edge, no tap target under 24px, console clean everywhere.
- Motion checked frame by frame from recordings: loader/FLIP, zoom, cover, curtain (down and up; clipping confirmed
  on stills). Lightbox (focus to Close, Esc), film playback, theme toggle (stored, aria-label) all work.
- `V5_PATH=/prototypes/direction-b/ npx playwright test v5-audit.spec.mjs` on v5-duo-folded/portrait/landscape,
  v5-webkit-iphone14, v5-390x844, v5-1440x900: 12/12 passed (layout, images, console, axe, reduced-motion contrast).
- Reduced motion: no loader, no pins, no WebGL, every heading/paragraph/image visible (`desktop-1440-11-reduced-motion-full.png`).
- Detectors: taste lint 0 FAIL (mono lines marked as owner-pinned). Impeccable flags Geist as "overused" (owner-pinned)
  and "cramped padding" on the full-bleed room bands (false positive: the inner grids carry the margins).

## Six screenshots for the owner
1. Desktop hero: `D-B/desktop-1440-02-hero.png`
2. Desktop work: `D-B/desktop-1440-03-work.png`
3. Desktop transition: `D-B/desktop-1440-04-transition.png`
4. Phone hero: `D-B/phone-390-01-hero.png`
5. Phone work: `D-B/phone-390-02-work.png`
6. Duo folded: `D-B/duo-folded.png` (also `duo-portrait.png`, `duo-landscape.png`)

Motion frames: `motion-1-loader-flip-1..6`, `motion-2-zoom-1..5`, `motion-3-curtain-1..4`, `motion-4-cover-1..2`.

## Known gaps
- The WebGL bend and lens only run with a mouse on 900px+ screens; the owner's Duo and phones see the static framed
  pictures (by design, but it means the WebGL piece is desktop-only).
- The taste inspector still flags, on purpose: the loader delays the title (brief requires the loader), text covered
  during the one-screen slide-over, the 3-screen zoom hold, the About heading at 3 lines on phones (the owner's own
  copy), and the salon hang's varied left edges.
- Lightbox covers the five hang plates, not the hero or zoom print. The SERVIO teaser has no film yet.
- Prototype stops at the About heading. Tested in Playwright WebKit, not on the physical Duo.
- No owner interview in this pass: worked from the v5 brief.
