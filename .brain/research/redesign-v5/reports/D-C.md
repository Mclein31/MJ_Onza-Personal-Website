# D-C: Kinetic

Prototype: `prototypes/direction-c/` · served at `http://127.0.0.1:4313/prototypes/direction-c/` (`node tests/serve.mjs 4313`).
Captures: `.brain/research/redesign-v5/D-C/`.

## Pitch (for the owner)
Your name is the whole first screen: "McLein / Jei / Onza" set enormous across a frosted glass plane with a slow
orange-and-cobalt light moving behind it. Move the cursor over the letters and the ones near it grow heavier and
lift away, then settle. A short loader scrambles the same name into place with a percentage counter. As you scroll,
the light speeds up, the project names run across the page like a ticker that reacts to how fast you scroll, and the
"Things I've built" title shrinks up into the nav as a small label. The projects then stack like cards: each new one
slides over the last, which steps back and dims. In About, the big sentence turns from grey to black one word at a
time as you scroll. It is the loudest of the three directions, but everything is grey, black, one orange and one
cobalt, with 2px corners. On phones it keeps the name, the light and the loader but drops pinning and the shrinking
title, so the page scrolls like a normal page.

## Palette
| Token | Light | Dark |
|---|---|---|
| bg | `#E9EAEC` | `#0F1012` |
| surface | `#F7F8F9` | `#17191C` |
| surface-2 | `#DFE1E4` | `#1E2125` |
| ink | `#0E0F11` | `#ECEDEF` |
| ink-2 (text) | `#4A4E56` | `#A4A8AF` |
| ink-3 (large type only) | `#7F838B` | `#6B6F77` |
| line | `rgba(14,15,17,.16)` | `rgba(236,237,239,.18)` |
| orange | `#FF4F00` | `#FF5A14` |
| cobalt | `#1E44DB` | `#6F8BFF` |
| light-field base | `#DADCE0` | `#1A1C20` |

Radius 2px everywhere (circles only for dots). Theme follows the OS until the toggle is used (View Transition circle reveal).

## Type scale (Geist display/body, Geist Mono for metadata, self-hosted)
| Role | Size | Weight |
|---|---|---|
| Hero name | `min(21vw, fit-to-height)`; phone `min(25.5vw,150px)` | 500 (cursor pushes up to 700, rest 500, never below 420) |
| Section h2 (Work) | `clamp(2.75rem, 7.4vw, 8.5rem)` | 560 |
| Marquee | `clamp(3.75rem, 11.5vw, 13rem)` | 560 |
| Card title | `clamp(2.5rem, 4.6vw, 5rem)` | 580 |
| About heading | `clamp(2.5rem, 5.7vw, 6.5rem)` | 560 |
| Lead | `clamp(1.25rem, 1.55vw, 1.625rem)` | 500 |
| Body | 17px | 400 |
| Mono label | 13px / 12px | 400 |

## Signature moments
1. **Loader** (`js/loader.js`): once per session, ~2.2s, the real hero letters scramble (glyph + weight) with a % counter, then a wipe hands over to the hero entrance. Skippable by key/click; CSS failsafe hides it at 2.6s.
2. **Kinetic name** (`js/name.js`): per-letter variable weight (420 to 700) and a small push away from the pointer, eased, one rAF loop that sleeps when settled. Fine pointers only.
3. **Light field** (`js/field.js`): hand-written WebGL1 shader, orange + cobalt noise gradient seen through a frosted plane (grain overlay). Energy follows scroll velocity, dims as the hero leaves, a third soft light follows the pointer. Paused offscreen/hidden tab, DPR capped at 1.5 and rendered at 0.6 scale, static CSS poster for no WebGL, reduced motion, save-data, low memory.
4. **Masked line reveals + About word scrub** (`SplitText`): lines rise from a mask; About words scrub grey (0.16) to ink with scroll.
5. **Velocity marquee**: project names, speed and skew follow scroll velocity, direction follows scroll direction.
6. **Sticky title shrink**: the Work h2 scales and translates (transform only) into a label beside the wordmark in the nav, measured live so it survives resizes.
7. **Stacking cards**: CSS `position: sticky` cards; the previous one scales to .93 and dims as the next arrives (scrub). Desktop only.
8. Lenis smooth scroll on fine pointers only; touch scrolls natively.

## Libraries (all in `vendor/`, no CDN)
GSAP 3.15.1 + ScrollTrigger + SplitText (GreenSock no-charge licence), Lenis 1.3.27 (MIT). WebGL is raw, no OGL/three. See `vendor/LICENSES.md`.

## Changes in this wrap-up pass
- `css/base.css`: nav brand and links now 32px tall tap targets (were 23-24px); **fixed a real bug**: the `.btn` CSS `transform` transition fought GSAP's inline reveal transform, leaving "Watch the product video" stuck 26px low and overlapping the tech chips on touch layouts. GSAP-driven buttons now transition colour only.
- `css/hero.css`: short-landscape rule (max 899px wide, max 700px tall): smaller name and more air above the lead so the CTA sits in the first screen at 890x626.
- `css/work.css`: same short-landscape rule caps gallery height (56svh, max 360px) so a card never exceeds the 626px viewport.

## Verification
Own headless Chromium (Playwright, shared MCP browser was locked by another worker), touch + DPR 2 for phone sizes, at 1440x900, 1280x800, 390x844, 466x678, 626x890, 890x626.
- No horizontal overflow at any size (`scrollWidth == clientWidth`).
- Desktop: name lines never overlap nav, lead copy, CTAs or the project index (1440: copy y353-518, name line 1 ends y324; line 3 starts x706, copy ends x516).
- Phone/Duo: hero name, copy and CTA in order, no pinned stack (cards `position: relative`), landscape CTA at y482-526 within 626.
- Tap targets: no interactive element under 24px at touch sizes after the fix.
- Reduced motion (1440 and 390): 0 hidden text nodes, 0 dimmed words; everything visible.
- Console: no errors or page errors. Only headless-GL driver warnings ("GPU stall due to ReadPixels", from SwiftShader, not from the code, which never calls readPixels).
- Visually reviewed duo-folded, duo-portrait, duo-landscape, phone hero/work.

## Six comparison captures
1. Desktop hero: `D-C/desktop-1440-02-hero.png`
2. Desktop work: `D-C/desktop-1440-03-work.png`
3. Desktop About transition: `D-C/desktop-1440-04-transition-about.png`
4. Phone hero: `D-C/phone-390-hero.png`
5. Phone work: `D-C/phone-390-work.png`
6. Duo folded: `D-C/duo-folded.png` (also `duo-portrait.png`, `duo-landscape.png`)

## Open gaps
- Only Work and About-heading exist in this prototype; Journey, GitHub, Stack, Recognition, Training and Contact are not designed here.
- Real iPhone Duo / WebKit not tested; Chromium emulation only (no actual touch gestures, no WebKit variable-font weight rendering check).
- `.brain/research/redesign-v5/D-C/` earlier `wip-*` and `motion-*` frames remain; they predate the fixes above.
- Light-field performance only measured on software GL; needs a real-GPU frame-time check (target 60fps) and an iOS Safari check of the 0.6 render scale.
- Dark-mode captures are WIP-era (`wip-dark-*`); not re-shot after this pass.
- Stacking-card scale on a very short desktop viewport (under ~700px tall) not tuned.
