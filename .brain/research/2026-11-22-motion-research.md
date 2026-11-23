---
type: research
title: Motion and wow-factor catalogue for Redesign v5 (job R1)
project: Personal Website
date: 2026-11-22
---

# Motion research: how top portfolios get "wow" while staying minimal

Brief: [2026-11-22-redesign-v5-brief.md](2026-11-22-redesign-v5-brief.md). Style stays clean, cool light grey, 2px corners,
international orange; **quiet luxury + 2-3 big moments**, one tasteful WebGL piece, phones lighter.

## 0. How this was researched, and what is verified

**Verified by fetching the pages (2026-11-22):**
- Awwwards portfolio winners list (SOTD/SOTM/Honors, Jan 2025 to Nov 2026) and the Awwwards detail pages of 10 recent winners
  (tags, "Elements" labels, scores).
- Homepage text of 12 portfolios. Caveat: the fetch tool returns text, **not script tags or canvas markup**, so I could not see which
  libraries a site loads. Where a technique is attributed to a site below, the source is one of: Awwwards' own "Elements"/technology
  tags, or visible copy on the page. Nothing was watched in a browser.
- Official docs: GSAP standard licence, Lenis README, OGL README, web.dev (scroll-driven animations Baseline, same-document view
  transitions Baseline), Chrome cross-document view transitions docs, WebKit scroll-driven animations guide.

**Not verified:**
- Codrops 2026 portfolio case studies (Joffrey Spitzer, Arnaud Rocca, Thibault Guignand's "From Shader Uniforms to Clip-Path Wipes")
  returned HTTP 403. I only have their titles and one-line search excerpts, so they are cited as "further reading", never as proof.
- "How to build" recipes, cost figures and phone behaviour are my engineering judgement (standard practice), not claims from those
  sites. Byte sizes marked "~" are approximate from memory; re-measure when vendoring.
- Lenis: the README documents a classic `<script>` build (`dist/lenis.min.js`) and an npm ESM import. A direct local ESM file path
  was **not** confirmed by my fetches. **Resolved afterwards by job V1:** `vendor/README.md` shows `lenis@1.3.27` `dist/lenis.mjs`
  vendored as `vendor/lenis/lenis.js` (+ `lenis.css`), OGL 1.0.11 under `vendor/ogl/`, and GSAP including ScrollTrigger, SplitText,
  Flip and CustomEase under `vendor/gsap/`. Use those local files.

### Platform facts that change the build plan (all as of Nov 2026)
| Feature | Status | Source |
|---|---|---|
| CSS scroll-driven animations (`animation-timeline: view()/scroll()`) | **Baseline Newly available**: Chrome/Edge 115, Safari 26, Firefox 159 (Oct 2026) | [web.dev Oct 2026](https://web.dev/blog/web-platform-10-2026), [WebKit guide](https://www.webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/) |
| Same-document View Transitions (`document.startViewTransition`) | **Baseline Newly available since 2025-10-14** (Firefox 144 was last) | [web.dev](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available) |
| Cross-document View Transitions (`@view-transition { navigation: auto }`) | Chrome/Edge 126, Safari 18.2, **Firefox not supported** | [Chrome docs](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) |
| GSAP incl. ScrollTrigger, SplitText, Flip | **Free, commercial use allowed** (standard licence, effective 2025-04-30). CustomEase is not named on the licence page; treat as probably covered, verify before vendoring | [gsap.com/standard-license](https://gsap.com/standard-license/) |
| Lenis | MIT, zero deps; `respectReducedMotion` defaults to true (smoothing off for reduce) | [github.com/darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) |
| OGL | Unlicense (public domain); core 8 KB, math 6 KB, extras 15 KB (29 KB gz total, less if you import only what you use) | [github.com/oframe/ogl](https://github.com/oframe/ogl) |

Consequence: this site can lean on CSS scroll-driven animations and same-document view transitions as the **default**, and keep
GSAP only for what CSS cannot do (SplitText, pinned scrub timelines, Flip, loader sequencing). Cross-document transitions are not
needed (single page) and should not be relied on.

### Sites sampled (Awwwards pages read; scores are Awwwards' own)
| Site | Award | Tags / elements per Awwwards | URL |
|---|---|---|---|
| Carter Ogunsola | SOTD 2026-11-19 | GSAP, WebGL, Astro; theme flip, page transition, project wheel, "dynamic scrollbar" lab piece, telemetry header, command palette | https://carterogunsola.com |
| Pacôme Pertant | SOTD 2026-06-09 | GSAP, Three.js; spiral view to list transition, loading, footer scroll transition, mouse trail, "enter with/without sound" gate | https://pacomepertant.com |
| Jesper Landberg | SOTD 2026-09-29 | GSAP, Three.js; home to project and project to project transitions | http://jesperlandberg.com |
| NOTHIN' | SOTD 2026-08-10 | GSAP, WebGL; "Hero Shaders" and 3D mouse interaction | https://www.noth.in |
| Elliott Mangham | SOTD 2025-12-02 | GSAP; preloader (0/20/40/60/80% sequence), scroll-to-reveal, awards showcase, video modal | https://elliott.mangham.dev |
| Gianluca Gradogna | SOTD 2025-01-23 | loading counter + loading transition, hover image effect, clip animation, page transition | https://gianlucagradogna.com |
| Artiom Yakushev | SOTD 2025-12-27 | GSAP, Webflow; parallax, a designed 404 | https://www.art-yakushev.com |
| Olha Lazarieva | SOTD 2025-10-02 | GSAP, React; designed 404 and thank-you page | https://www.olhalazarieva.com |
| Studio Null | SOTD 2025-05-02 | preloader, content window, designed 404 | https://www.madebynull.com |
| Bruno Simon | SOTM 2026-01 | Three.js/WebGL driveable 3D world; open source (folio-2025) | https://bruno-simon.com |
| Şaho Bîrkar | nominee | staged intro with fake "DOWNLOADING THE PAGE / RECEIVED 0.0 MB" counter | https://birkar.me |
| Daniel Neath | n/a | "Skip intro" link, nav labels duplicated (hover swap, inferred) | https://danielneath.com |

Pattern across the winners: preloaders, page/section transitions and hover image effects are the most common labelled elements;
GSAP appears on 8 of 10 detail pages; WebGL on only 3 of 10. The "wow" is usually **one signature idea executed with precision**,
not many effects.

---

## 1. Catalogue (24 techniques)

Rating legend: **Fit** = fit to this brief (5 best). **Cost** = runtime cost (S low, M medium, L high).
"RM" = `prefers-reduced-motion: reduce` path. "Phone" = <=768px behaviour.

### A. Loaders and intros

**1. Counter + clip-path curtain loader**
- *What:* a mono counter 000 to 100 over ~1.2-1.8s, then the panel wipes away (clip-path `inset()` to 0 from the bottom) revealing the hero.
- *Examples:* Gianluca Gradogna (loading counter "0" and loading transition) https://gianlucagradogna.com ; Elliott Mangham (percent sequence) https://elliott.mangham.dev ; Studio Null (preloader) https://www.madebynull.com
- *Why it lands:* it sets tone and hides font/image loading; the wipe is a clean "curtain up" moment.
- *Build:* inline critical CSS shows the loader from first paint (no JS needed to show it); a small module counts using real progress (fonts via `document.fonts.ready`, hero image decode) with a minimum of ~900ms and hard cap 2.4s; WAAPI or one GSAP tween animates `clip-path`. Failsafe `setTimeout` removes it. `sessionStorage` flag so it plays once per session.
- *Cost:* S (one composited layer, clip-path + text transform).
- *RM:* no counter animation; page is visible immediately, loader never mounted. *Phone:* identical (cheap), shorter minimum.
- *Fit:* 4. Safe baseline; make it distinctive via #2 or #3 rather than a bare number.

**2. Pipeline "boot" loader (data-engineering twist), with Skip**
- *What:* three mono lines tick through `ingest ... transform ... load ... ready` with a thin orange bar, then hand off to the hero. A visible "Skip" link.
- *Examples (spirit):* birkar.me staged "DOWNLOADING THE PAGE / RECEIVED 0.0 MB" intro https://birkar.me ; danielneath.com "Skip intro" https://danielneath.com
- *Why it lands:* it tells the visitor what this person does (ETL) in 2 seconds; unique among portfolios, still minimal (text only).
- *Build:* same as #1 but the counter becomes three stage labels; stage text is real: stage 1 = fonts ready, 2 = hero image decoded, 3 = first paint of WebGL canvas or fallback. Use `aria-hidden` on the decorative lines and a `<noscript>` rule that hides the loader.
- *Cost:* S. *RM:* skip entirely. *Phone:* same, shorter.
- *Fit:* 5. Strong identity, owner-compatible (mono labels, sparing orange), within the 2.5s cap.

**3. Loader to hero hand-off (shared element via Flip or View Transition)**
- *What:* the name/wordmark shown in the loader physically travels into its hero position instead of fading.
- *Examples:* Joffrey Spitzer portfolio (Codrops write-up, "reveals, Flip transitions" per its title; article not readable, 403) https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/
- *Why it lands:* continuity; the loader feels like part of the page, not a gate.
- *Build:* GSAP Flip (`Flip.getState` on the loader wordmark, move element into hero container, `Flip.from`), or same-document `startViewTransition` with matching `view-transition-name`. Only transform/opacity animate.
- *Cost:* S. *RM:* swap without motion. *Phone:* same.
- *Fit:* 4. Do it only if #1/#2 is built; it is the polish layer.

**(Considered, not catalogued as a recommendation)** "Enter with / without sound" gate (Pacôme Pertant): works for a motion/sound designer, adds a click wall for a student portfolio. See section 3.

### B. Hero moments

**4. Masked line reveal for the headline (SplitText)**
- *What:* each headline line slides up from behind an `overflow: clip` mask (translateY 110% to 0), staggered ~60ms, once the loader finishes.
- *Examples:* Artiom Yakushev hero copy is split into line fragments (inferred from page text) https://www.art-yakushev.com ; Elliott Mangham https://elliott.mangham.dev
- *Why it lands:* the single most reliable "expensive" cue; reads as typographic confidence.
- *Build:* GSAP SplitText (`type: "lines"`, `mask: "lines"`), re-split on resize via `autoSplit: true`; ease `power3.out`/CustomEase ~0.7s per line. Keep real text in the DOM (SplitText adds `aria-label`). Pure CSS alternative: two nested spans + CSS animation delays for a static headline.
- *Cost:* S. *RM:* text visible, no motion. *Phone:* same, fewer lines so same stagger.
- *Fit:* 5.

**5. Hero WebGL: ordered-dither / halftone data-grid field (the one WebGL piece)**
- *What:* a full-bleed, very low-contrast field of grey dots/cells that subtly displaces toward the pointer and settles; a few cells glow international orange. Reads as "data matrix" without being literal.
- *Examples (spirit):* NOTHIN' "Hero Shaders" https://www.noth.in ; Thibault Guignand's "Shader Uniforms to Clip-Path Wipes" (full-screen triangle driven by one GSAP uniform; summarised from a search excerpt, article unreadable) https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/ ; Arnaud Rocca (OGL fluid WebGL, per excerpt) https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/
- *Why it lands:* it is the "alive" layer that makes the grey page feel premium; one idea, no 3D clutter. Doubles as the identity: grid = tables/data.
- *Build:* OGL `Renderer` + one full-screen triangle `Program` with a fragment shader (noise or a pointer-distance falloff, quantised to a cell grid, orange accent via uniform). Uniforms: `uTime`, `uPointer`, `uReveal` (driven by the loader hand-off). DPR cap 1.5, `IntersectionObserver` pauses the loop offscreen, `visibilitychange` pauses when hidden, `webglcontextlost` falls back, feature-detect WebGL then swap in a static CSS/SVG dot-grid poster (also used on RM and low-end).
- *Cost:* M on laptop (single quad, cheap fragment). Keep it at half-resolution render target if needed. ~29 KB OGL max.
- *RM:* static poster, no loop. *Phone:* render once at DPR 1 with slow idle drift (no pointer), or static poster on low-end (`navigator.hardwareConcurrency <= 4` or `deviceMemory <= 4`).
- *Fit:* 5. Top pick for the single WebGL piece.

**6. Live "telemetry" strip (without a clock)**
- *What:* a mono one-line strip: visit count, likes, last commit, contribution count, build version, FPS/LCP-style readouts.
- *Examples:* Carter Ogunsola's telemetry header (`UT / FPS / ONLINE / LCP / PRESENCE`) https://carterogunsola.com ; Elliott Mangham "England, UK time" clock https://elliott.mangham.dev
- *Why it lands:* signals engineering craft in a few characters; fits a data-engineering identity (metrics as decoration).
- *Build:* reuse existing `/api/stats` and `/api/contributions`; numbers tick up with a tiny count-up; update text only (no layout shift, `font-variant-numeric: tabular-nums`).
- *Cost:* S. *RM:* static numbers. *Phone:* collapse to 2 items.
- *Fit:* 4. **Owner rule: no live clock and no pinpoint location, so copy the idea, not the clock.**

### C. Scroll choreography

**7. Lenis smooth scroll synced to ScrollTrigger (foundation)**
- *What:* inertial scroll that makes every other effect feel smooth.
- *Examples:* Lenis is the standard in this tier; Codrops 2026 portfolio write-ups list GSAP + Lenis (+ OGL/Three) stacks (search excerpts; articles unreadable).
- *Why it lands:* invisible quality: "this site feels expensive" before any effect fires.
- *Build:* vendor Lenis locally; `new Lenis({ autoRaf: false })`; `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t => lenis.raf(t * 1000))`; `gsap.ticker.lagSmoothing(0)` (per the Lenis README). Add `data-lenis-prevent` on lightbox/modals; enable `anchors: true` for in-page links; keep keyboard and focus scroll working (test Tab to an off-screen link).
- *Cost:* S-M. Known limits from the README: capped at 60fps in Safari, 30fps in low power mode, no CSS scroll-snap.
- *RM:* automatic (Lenis disables smoothing when reduce is set). *Phone:* leave native touch scroll (do not enable `syncTouch`); Lenis is then effectively off.
- *Fit:* 5. Use a modest lerp (~0.1) so it never feels laggy.

**8. Pinned Work index with swapping preview (desktop only)**
- *What:* Work section pins; a big list `01 AdvanCare ... 05 Mulat Media` on the left; as scroll advances, the active row lights up and a large preview (screenshot, then promo video) crossfades/clip-reveals on the right. Click opens the existing gallery/lightbox.
- *Examples:* Carter Ogunsola "Home project wheel" https://carterogunsola.com ; Pacôme Pertant "Spiral View / Spiral to List" https://pacomepertant.com ; Elliott Mangham awards showcase https://elliott.mangham.dev
- *Why it lands:* this is the **scroll-driven showpiece** the owner asked for, and it frames five projects like a curated index rather than a card grid. One pin, not sideways scrolling.
- *Build:* ScrollTrigger `pin: true`, `scrub: 0.5`, `snap` off; a single timeline toggles `data-active` and swaps preview layers using `clip-path` + opacity (not width/height). Preload the 5 preview images; start video only for the active row.
- *Cost:* M (pinned layer, video decode: pause inactive videos).
- *RM:* no pin; plain stacked list. *Phone:* **no pin**: vertical list of cards, each with its own `view()` reveal (#9). This honours "no pinned sideways scrolling".
- *Fit:* 5. Replaces the current pinned horizontal Work.

**9. CSS scroll-driven reveals and progress (zero JS)**
- *What:* sections fade/translate in as they enter, a thin progress rail fills with page scroll, images scale 1.08 to 1 while crossing the viewport.
- *Examples:* browser-native since Oct 2026 (Baseline: Chrome 115, Safari 26, Firefox 159). WebKit guide https://www.webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/ ; web.dev https://web.dev/blog/web-platform-10-2026
- *Why it lands:* runs on the compositor, so it stays smooth while the main thread is busy; "precise reveals everywhere" without a library.
- *Build:* `@supports (animation-timeline: view()) { @media (prefers-reduced-motion: no-preference) { .reveal { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% entry 60%; } } }`. Declare `animation-timeline` **after** the `animation` shorthand (the shorthand resets it; noted in the WebKit guide). Progress rail: `animation-timeline: scroll(root)` on `transform: scaleX()`. Browsers without support just show the content.
- *Cost:* S (compositor-driven).
- *RM:* the media query keeps content visible and static. *Phone:* works the same (good thumb-scroll behaviour because it is native).
- *Fit:* 5. Use as the default for all ordinary reveals; reserve GSAP for the signature moments.

**10. Section-local "data flow" drawing + counters (Stack and GitHub)**
- *What:* inside Stack, short SVG connectors draw between schema-like tables as they enter; in GitHub Activity the contribution grid fills cell by cell and the totals count up.
- *Examples (spirit):* Carter Ogunsola "About telemetry" https://carterogunsola.com ; Elliott's loader percent readouts https://elliott.mangham.dev
- *Why it lands:* it turns the data-engineering identity into motion, reusing the live contributions data the site already has.
- *Build:* `stroke-dasharray`/`stroke-dashoffset` or `pathLength=1` driven by `view()` timelines (#9) per connector; grid cells reveal with staggered `opacity`/`scale` via a ScrollTrigger once-only batch (`ScrollTrigger.batch`); counters by rAF or `gsap.to` on a plain object.
- *Cost:* S-M (a few hundred cells: animate a parent mask via `clip-path` instead of 365 elements if needed).
- *RM:* final state immediately. *Phone:* fluid grid reveals as one wipe, no stagger per cell.
- *Fit:* 4. **Owner rule: no page-spanning scroll-drawn line**; keep each draw local to its section.

**11. Inset clip reveal for screenshots and photos**
- *What:* an image starts as a `clip-path: inset(0 0 100% 0)` strip and opens to full while the inner image scales 1.15 to 1.
- *Examples:* Gianluca Gradogna "Clip Animation" https://gianlucagradogna.com ; Artiom Yakushev parallax work cards https://www.art-yakushev.com
- *Why it lands:* gives static screenshots weight and editorial feel; works well with 2px corners (sharp edges look intentional).
- *Build:* CSS `view()` timeline on `clip-path` and on the nested `img` transform; or one ScrollTrigger batch. Add width/height to avoid layout shift.
- *Cost:* S. *RM:* fully revealed. *Phone:* keep (it is cheap), shorten the range.
- *Fit:* 5.

### D. Section transitions

**12. Theme flip: dark/light toggle as a View Transition**
- *What:* clicking the theme toggle expands a circular reveal from the button; the whole page changes theme inside the reveal.
- *Examples:* Carter Ogunsola "Theme flip" (Awwwards element) https://carterogunsola.com
- *Why it lands:* turns a required utility (the owner wants a toggle) into a signature micro-moment.
- *Build:* `document.startViewTransition(() => setTheme())`, then animate `::view-transition-new(root)` with `clip-path: circle(0 at X Y)` to `circle(150vmax at X Y)` via WAAPI (`document.documentElement.animate(..., { pseudoElement: '::view-transition-new(root)' })`). Fallback: instant swap when `startViewTransition` is missing. Same-document VT is Baseline since 2025-10-14.
- *Cost:* S-M (one full-page snapshot for ~500ms).
- *RM:* instant swap (skip transition). *Phone:* same, or instant to be safe on low-end.
- *Fit:* 5. Cheap, memorable, directly relevant.

**13. Project detail via Flip / View Transition (screenshot to lightbox)**
- *What:* clicking a project thumbnail grows it into the lightbox/detail view (the thumbnail is the same element, not a fade).
- *Examples:* Jesper Landberg "Home to project detail", "Project to project" https://jesperlandberg.com ; Pacôme "Spiral to List" https://pacomepertant.com
- *Why it lands:* spatial continuity: "this opened from here", the quality bar of Apple-style interfaces.
- *Build:* `view-transition-name` set on the clicked thumbnail in JS, `startViewTransition` to open the lightbox, name cleared after. Fallback: GSAP Flip. Keep focus management: move focus into the lightbox, restore on close, `Escape` closes.
- *Cost:* S-M. *RM:* open instantly. *Phone:* use a simple fade+scale from the thumbnail (or instant), still real focus handling.
- *Fit:* 4. Works with the existing screenshot lightbox requirement.

**14. Footer "curtain" reveal**
- *What:* the contact section is pinned/revealed beneath the previous section as it scrolls away (`position: sticky; bottom: 0` footer under a `z-index` curtain).
- *Examples:* Pacôme Pertant "Footer Scroll Transition" https://pacomepertant.com ; Awwwards footers on NOTHIN' https://www.noth.in
- *Why it lands:* a satisfying ending beat for a long page; costs almost nothing.
- *Build:* CSS only: footer `position: sticky; bottom: 0; z-index: -1` with a margin-bottom wrapper equal to footer height; optional `view()` timeline scales the footer content 0.96 to 1.
- *Cost:* S. *RM:* works (static). *Phone:* fine, no pin needed (sticky only).
- *Fit:* 4.

### E. Text effects

**15. SplitText word/line reveals plus mono "decode" labels**
- *What:* section titles reveal by line (see #4); small Geist Mono labels (dates, numbers) do a brief character "scramble" settle (200-400ms), only when first entering view.
- *Examples:* Elliott Mangham https://elliott.mangham.dev ; Studio Null https://www.madebynull.com (tag-level evidence only)
- *Why it lands:* a hint of "data/terminal" in the labels without full terminal theatrics.
- *Build:* own 30-line scrambler (random chars from a mono set, resolve left to right) so no extra plugin licence question; `aria-label` holds the real text, animated span is `aria-hidden`. Run once per element.
- *Cost:* S (text nodes only). *RM:* final text immediately. *Phone:* same.
- *Fit:* 4. Use on labels only; never on body copy (readability, rule: highlight must not hide neighbours).

**16. Character-roll hover on nav and links**
- *What:* on hover, link text rolls up and an identical copy rolls in underneath (each letter staggered 15ms).
- *Examples:* danielneath.com nav labels appear twice in the markup, consistent with a roll/swap (inference) https://danielneath.com
- *Why it lands:* tiny, crisp, signals polish every time the hand moves.
- *Build:* two stacked copies in an `overflow: clip` line; CSS `transition: transform 280ms cubic-bezier(.2,.7,.2,1)`, per-letter delay via `--i`; true text exposed once (`aria-hidden` on the copy). Hover/focus-visible only.
- *Cost:* S. *RM:* colour change only. *Phone:* no hover; skip.
- *Fit:* 4. Keep weight constant (no thin fonts, no layout shift).

### F. Hover and micro-interactions

**17. Image follower on list rows (hover preview)**
- *What:* hovering a list row (Journey years, Recognition, Training) shows a small image (certificate or photo) that follows the pointer with light inertia.
- *Examples:* Gianluca Gradogna "Hover Image Effect" https://gianlucagradogna.com ; very common in Awwwards portfolios
- *Why it lands:* makes dense text lists feel tactile; shows Training certificates without clutter.
- *Build:* a fixed 2px-radius `figure`, `transform: translate3d` updated in rAF with lerp toward the pointer; image swapped per row via `data-img`; `pointer: fine` only. Also expose the images on focus for keyboard users.
- *Cost:* S. *RM:* image appears in place, no follow. *Phone:* no hover; show images inline or in a tap-to-open lightbox.
- *Fit:* 5 for Recognition/Training/Journey.

**18. Press states and a light magnetic pull on primary buttons**
- *What:* buttons translate 1-2px toward the pointer within ~40px and compress to 0.97 on `:active`.
- *Examples:* ubiquitous; see Elliott Mangham ("RETURN KEY [ENTER]" keyboard hint style) https://elliott.mangham.dev
- *Why it lands:* responsiveness; the Emil-Kowalski "feels alive" detail, if subtle.
- *Build:* CSS `:active { transform: scale(.97) }` with 120ms ease-out for everyone; magnet via a small pointermove handler on the Contact CTA only.
- *Cost:* S. *RM:* keep press state only. *Phone:* press state only.
- *Fit:* 3. Press state yes everywhere; magnet only on one or two CTAs.

### G. Cursor

**19. Contextual cursor label ("View", "Open", "Drag")**
- *What:* over project rows/screenshots, a small 2px-radius label follows the pointer; otherwise the native cursor stays.
- *Examples:* Pacôme Pertant "Mouse trail" element https://pacomepertant.com ; Carter Ogunsola "Live Cursors" lab piece (shows other visitors' cursors) https://carterogunsola.com
- *Why it lands:* communicates affordance and adds personality without hiding the real cursor.
- *Build:* one absolutely positioned element moved with `transform` in rAF; show/hide by `[data-cursor]` on the hovered element; never hide the system cursor globally. The repo already has a dormant `js/cursor.js` hook (TODO.md), but treat this as new code.
- *Cost:* S. *RM:* no follow; static native cursor. *Phone:* disabled (`pointer: coarse`).
- *Fit:* 3. Only if the rest is done; label on Work and gallery only.

### H. WebGL pieces (besides #5)

**20. Hover displacement on Work thumbnails (optional second use of the same renderer)**
- *What:* project thumbnails ripple/refract slightly under the pointer using a displacement texture; settles in ~600ms.
- *Examples:* Arnaud Rocca (fluid WebGL, excerpt only) https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/ ; NOTHIN' mouse interactions https://www.noth.in ; heavyweight reference: Bruno Simon's full 3D world https://bruno-simon.com
- *Why it lands:* turns screenshots into objects; but it is the point where "tasteful" can tip into "template".
- *Build:* reuse the OGL context from #5 with a second pass; use CSS `filter`-free DOM image as fallback. Risk: promo videos and screenshots lose sharpness; text in screenshots is legible content.
- *Cost:* M-L (extra textures, per-image planes).
- *RM:* off. *Phone:* off.
- *Fit:* 2. Brief says **one** WebGL piece. Skip unless the owner asks for more.

### I. Page details (scrollbar, selection, focus, favicon, 404, easter eggs)

**21. Progress rail, selection colour, focus ring**
- *What:* a 2px orange rail on the viewport edge that tracks scroll (and ticks for section anchors); `::selection` in orange with ink text; a crisp 2px offset focus ring on every focusable.
- *Examples:* Carter Ogunsola's "Dynamic Scrollbar blooms into a live analog clock" lab piece https://carterogunsola.com (idea only: clocks are disallowed here)
- *Why it lands:* tiny consistency details are what judges notice; also an a11y win.
- *Build:* rail = `animation-timeline: scroll(root)` on `scaleX` (#9) with `transform-origin: left`; `scrollbar-color: var(--ink) transparent; scrollbar-width: thin;`; `:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px }`; `::selection { background: var(--orange); color: var(--ink) }` (checks 4.5:1 for ink on orange).
- *Cost:* S. *RM:* rail still fine (it is information, not decoration). *Phone:* rail kept; hide native scrollbar styling concerns.
- *Fit:* 5.

**22. Dynamic favicon and tab title**
- *What:* favicon is an SVG with `prefers-color-scheme` colours; when the tab is hidden the title changes (e.g. `Back in a bit`); optional tiny dot colour change after the visitor likes.
- *Examples:* common in creative-dev portfolios; not verifiable per site here
- *Why it lands:* delight in a place nobody else polishes; cheap.
- *Build:* `<link rel="icon" type="image/svg+xml">` with media-aware `<style>` inside the SVG; `visibilitychange` swaps `document.title` (keep SEO title intact in HTML).
- *Cost:* S. *RM:* fine. *Phone:* n/a (tabs).
- *Fit:* 4.

**23. A designed 404 and "message sent" page/state**
- *What:* the 404 reuses the hero's dither field with a witty mono line; the contact form success state has its own small motion (a check that draws, then a line of text).
- *Examples:* Artiom Yakushev (404 element) https://www.art-yakushev.com ; Olha Lazarieva (404 and thank-you page elements) https://www.olhalazarieva.com ; Studio Null (404) https://www.madebynull.com
- *Why it lands:* judges and visitors click these; a designed 404 is a recurring Awwwards "element".
- *Build:* add `404.html` (Vercel serves it automatically for a static site) sharing the same CSS/tokens; success state via SVG `stroke-dashoffset` (one-off).
- *Cost:* S. *RM:* no draw, instant. *Phone:* same.
- *Fit:* 4.

**24. One quiet easter egg plus a console greeting**
- *What:* a console message (`console.log` styled) with a tiny "hello, recruiter" and the repo link; one hidden gesture: pressing `D` toggles a debug overlay showing the data grid values; or typing `sql` swaps the contact heading into a `SELECT ... FROM` line.
- *Examples:* Bruno Simon's site is built around hidden/achievement play https://bruno-simon.com (scale far bigger than needed); Carter Ogunsola's ⌘K command palette and presence https://carterogunsola.com
- *Why it lands:* gives the "unique, impression" memory hook after the main experience, and suits a data-engineering student.
- *Build:* a keydown listener that ignores form fields; zero visual cost until triggered; all content remains reachable without it.
- *Cost:* S. *RM:* the effect swaps text instantly. *Phone:* skip or make a triple-tap on the logo.
- *Fit:* 3. **Note:** the owner removed a command palette in 2026-10 (TODO.md, "built in v3, removed 2026-10-25 at the owner's request"). Do not re-add a palette without asking.

---

## 2. Top 8 recommendations for this site

Content to carry: 5 projects, journey, GitHub activity, stack, recognition, training, contact (all must survive).

1. **Pipeline boot loader with Skip, handing the name into the hero (#2 + #3).** ~1.6s, plays once per session, failsafe at 2.4s, text only. This is the "unique" intro and states the identity (data engineering) immediately. Phone: same, shorter.
2. **Hero WebGL dither/halftone data-grid field in grey with orange cells (#5)**, with a static dot-grid poster for no-WebGL, reduced motion and weak phones. The single WebGL piece.
3. **Masked line reveal on headlines (#4) with the loader hand-off.** One consistent entrance language used across every section title.
4. **Pinned Work index with a swapping large preview (#8)**, replacing the sideways pin. Desktop only; phones get a vertical card list with `view()` reveals. This is the scroll-driven showpiece.
5. **Default everything else to CSS scroll-driven reveals and an orange progress rail (#9, #21).** Zero JS for ordinary reveals, native on thumb-scroll phones, safe under reduced motion. Add Lenis (#7) on desktop only.
6. **Theme flip View Transition for the dark/light toggle (#12).** Cheap, memorable, satisfies the owner's toggle request.
7. **Data-flow motion in Stack and GitHub Activity (#10) plus the telemetry strip without a clock (#6).** The identity "data engineer" expressed as motion, reusing the live `/api/contributions` and `/api/stats`.
8. **Hover image follower for Journey, Recognition and Training rows (#17) plus a View Transition/Flip lightbox open (#13).** Gives the certificates and screenshots tactile presence. Add the small page details: designed 404 and success state (#23), SVG favicon (#22), console/easter-egg (#24).

Suggested weighting for the "2-3 big moments": loader (#1/2), hero shader field (#5), pinned Work index (#8). Everything else stays quiet.

## 3. Five overused or tacky things to avoid

1. **Long, fake or every-visit preloaders and sound/entry gates.** A 5s percent counter that has nothing to wait for, or an "enter with sound" wall (Pacôme Pertant can pull it off as a motion/sound designer; a student portfolio loses recruiters). Cap at ~2.5s, once per session, always skippable.
2. **Scroll-jacking and heavy inertia.** Hijacking wheel input for horizontal pins on phones, full-page snapping, or a very high Lenis lerp that makes the page feel laggy. Native touch on phones; modest smoothing on desktop.
3. **Fade-up-on-everything plus parallax on every block.** The generic template look; it dilutes the 2-3 big moments. Reveal selectively, keep distances small (~16-24px).
4. **Blob / trailing / `mix-blend-mode: difference` cursors over the entire page.** They hide the real pointer, lag, and fail on touch. Use a small contextual label only.
5. **3D gimmicks that do not carry meaning:** rotating laptop mockups, floating tech-logo spheres, particle galaxies, aurora/glow blobs, glassmorphism, fluid sims. Also a driveable 3D world: Bruno Simon's is a masterpiece because it *is* his work; for this brief it breaks "clean, minimal, one tasteful WebGL piece".

## 4. Build and performance notes for the implementers

- **Order of preference:** CSS (`view()` timelines, transitions) first, then WAAPI, then GSAP only where it earns its weight (SplitText, pin scrub, Flip, loader timeline). This keeps the bundle small and the page smooth when the main thread is busy.
- **Library budget (approximate, re-measure):** GSAP core ~27 KB gz, ScrollTrigger ~12 KB, SplitText ~7 KB, Flip ~7 KB, Lenis ~4 KB, OGL (only imported classes) <=15 KB. Self-host all in `vendor/` with licences.
- **No build step:** import the already-vendored local ES modules (`./vendor/gsap/*.js`, `./vendor/lenis/lenis.js`, `./vendor/ogl/index.js`) from `<script type="module">`; see `vendor/README.md` for the Lenis + ScrollTrigger sync snippet.
- **Failsafes:** loader removed by `setTimeout(2400)`; every reveal class has a `no-js`/reduced-motion path that leaves content visible; WebGL fallback poster must have the same dimensions (no CLS).
- **Pause rules:** shader loop paused offscreen (`IntersectionObserver`) and in hidden tabs (`visibilitychange`); videos paused when inactive in the pinned Work section; DPR <= 1.5.
- **Touch rules:** `pointer: coarse` or width <= 768px disables pins, cursor, image follower and magnet; keep tap targets >= 44px.
- **Accessibility:** decorative canvases and animated copies `aria-hidden`; focus never trapped by the loader (loader `inert`, removed from the tree after exit); orange text on grey fails body contrast, so use orange for shapes, large type or beside ink text.

## 5. Open questions for the orchestrator/owner

- Confirm the loader copy tone (`ingest / transform / load` vs a plain wordmark) at the direction-picking stage.
- Confirm that only one WebGL piece is wanted even though #20 would be easy once the renderer exists.
- CustomEase is not named on the GSAP licence page; if the build needs it, check gsap.com before vendoring (or substitute `cubic-bezier`/`linear()` in CSS, which is enough).
- Codrops case studies (Joffrey Spitzer, Arnaud Rocca, Thibault Guignand) were blocked; if the owner pastes them, they can sharpen #3, #5 and #7.

## Sources

- Awwwards portfolio winners: https://www.awwwards.com/inspiration_search/winner_category_portfolio/ ; https://www.awwwards.com/websites/portfolio/
- Awwwards site pages: https://www.awwwards.com/sites/carter-ogunsola , /pacome-pertant-portfolio , /jesper-landberg-4 , /nothin , /elliott-mangham , /gianluca-gradogna-portfolio , /artiom-yakushev , /olha-lazarieva , /studio-null , /brunos-portfolio
- web.dev scroll-driven animations (Oct 2026): https://web.dev/blog/web-platform-10-2026
- WebKit guide: https://www.webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/
- Same-document view transitions Baseline: https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
- Cross-document view transitions: https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
- GSAP standard licence: https://gsap.com/standard-license/
- Lenis: https://github.com/darkroomengineering/lenis ; OGL: https://github.com/oframe/ogl
- Codrops 2026 portfolio write-ups (titles only, pages returned 403): https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/ ; https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/ ; https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/
