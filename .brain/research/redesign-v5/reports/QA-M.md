---
type: worker-report
job: QA-M
project: Personal Website
date: 2026-11-23
scope: Phone & iPhone Duo design review (review-only)
---

# QA-M: Phone & iPhone Duo Design Review ("Instrument" v5)

Reviewed all screenshot sets in `.brain/research/redesign-v5/QA-M/` across **390×844** (`iphone-*`), **320×568** (`small-*`), **466×678** (`folded-*`), **626×890** (`portrait-*`), and **890×626** (`landscape-*`) in Light and Dark themes, including loader sequences, fast-flick captures, and interaction states (menu, anchor jumps, gallery, lightbox, video, message dialog). Unclear or live-changed behaviours (tap targets, anchor-jump header state, fast-scroll reveals, `Direct email` wrapping, hero fold fit) were re-checked live in Playwright WebKit touch on `node tests/serve.mjs 4512`.

---

## Findings (Ordered by Severity)

### 1. [P1 / High] Fast-flick scrolling leaves headings, copy, and plates blank or stuck mid-reveal
- **Viewport**: `390×844`, `466×678`, `890×626` (all touch viewports)
- **Theme**: Light & Dark
- **Section**: Journey (`#journey`), Stack (`#stack`)
- **Screenshots**: `flick-390-light/f1.png`, `flick-390-light/f2.png`, `flick-890-dark/f0.png`, `flick-890-dark/f1.png`, `flick-890-dark/f2.png`, `flick-890-dark/blank-55.png` (live check at `466×678`: `#stack-title` stayed `opacity: 0` after `window.scrollTo`)
- **What is wrong**: `scripts/design/reveal.js` gates `[data-reveal]` and `[data-reveal-stagger]` behind a velocity check (`fast = vel > vh * 2.5`) and an `88%` viewport line (`LINE = 0.88`). After a quick phone flick, `dt > 120ms` / the `250ms` fallback interval fires late and starts a `560ms` transition + up to `250ms` stagger. Content appears stuck at ~0.15 opacity (`flick-390-light/f1.png`, `flick-890-dark/f1.png`), completely invisible (`Five tables, one schema.` + lede missing in `flick-390-light/f2.png`; `Looking for my first data role` and `Get in touch` missing in `flick-890-dark/f2.png` and `blank-55.png`), sliced vertically mid-clip (`Next.` cut in half in `flick-890-dark/f2.png`), or mid-count (`2004.` instead of `2024.` in `flick-390-light/f1.png`).
- **Concrete fix**:
  - `scripts/design/reveal.js` (`LINE`, `check()`, `play()`): raise `LINE` from `0.88` to `0.98` (or `1.0` on coarse pointers); when `fast` is true and an element enters or sits in the upper 60% of the viewport, call `instant(el)` instead of leaving it unrevealed.
  - `styles/base.css` (`@media (pointer: coarse)` under `html.has-reveal [data-reveal='rise']`): remove `clip-path` masking on touch (`opacity` + `translate: 0 14px` only, `300ms` duration) so text is never clipped mid-glyph.
  - `index.html` (Journey `<span class="journey__label" data-tick data-tick-from="2000">`): remove `data-tick` on static historical years (`2022.`, `2024.`, `2026.`) so fast scrolling never displays wrong intermediate years (`2004.`).

### 2. [P1 / High] Lazy-loaded inline thumbnails render as blank white squares inside registration ticks
- **Viewport**: `626×890`, `890×626` (reproduced live across all 5 viewports: `trainingThumbComplete: false, naturalWidth: 0`)
- **Theme**: Light & Dark
- **Section**: Training (`#training`), Recognition (`#recognition`)
- **Screenshots**: `portrait-light/s25.png` (on `portrait-light/sheets/sheet06.jpg`), `landscape-light/s35.png` (on `landscape-light/sheets/sheet08.jpg`, vs `s36.png` once decoded)
- **What is wrong**: `.recognition__thumb` and `.training__thumb` images in `index.html` (lines 1273, 1298, 1323, 1348, 1482) use `loading="lazy"` inside `.plate` (`#FFFFFF` in light mode) without `data-scan`. Because `scripts/design/reveal.js`'s `warm` observer only watches `[data-scan] img`, these inline thumbnails are not promoted to `eager` ahead of arrival and show a blank white box inside the crop marks while decoding.
- **Concrete fix**:
  - `scripts/design/reveal.js` (`observe()` / `warm`): observe `.plate img` (not only `[data-scan] img`) in `warm` (`rootMargin: '0px 0px 150% 0px'`) to switch `img.loading = 'eager'` and pre-decode early.
  - `styles/recognition.css` (`.plate.recognition__thumb img`) and `styles/training.css` (`.plate.training__thumb img`): set `background: var(--bg-2);` so mounts never flash empty white while decoding.

### 3. [P1 / High] Recognition and Training metadata column is placed into the 76px index column on 626px–890px
- **Viewport**: `626×890` (Duo portrait), `890×626` (Duo landscape)
- **Theme**: Light & Dark
- **Section**: Recognition (`#recognition`), Training (`#training`)
- **Screenshots**: `portrait-recog.jpg`, `portrait-light/sheets/sheet05.jpg` (`s21`, `s22`), `portrait-light/sheets/sheet06.jpg` (`s25`), `landscape-light/sheets/sheet08.jpg` (`s32`, `s36`), `landscape-dark/sheets/sheet08.jpg` (`s32`, `s36`)
- **What is wrong**: In `styles/recognition.css` (lines 177–181, 202–207) and `styles/training.css` (lines 187–191, 212–217), `.recognition__meta`, `.training__program-meta`, `.recognition__action-wrap`, and `.training__action-wrap` declare `grid-area: meta;` / `grid-area: action;` followed immediately by `grid-column: auto;`. Because `grid-column: auto` overrides the column tracks of `grid-area`, CSS auto-places `meta` and `action` into column 1 (`76px` wide, under `01`) instead of column 2 (`minmax(0, 1fr)`). That forces `DTI Region 02 / SMEDD / Lingu, Solana, Cagayan / May 19 to 21, 2026` to wrap into 4–8 narrow lines (`DTI Region / 02 / / SMEDD`) and leaves a ~180px empty vertical void beneath the middle description column (`landscape-light/s36.png`, `portrait-light/s25.png`).
- **Concrete fix**:
  - `styles/recognition.css` (lines 177–181, 202–207) and `styles/training.css` (lines 187–191, 212–217): remove `grid-column: auto;` after `grid-area: meta;` and `grid-area: action;` (or explicitly use `grid-column: 2;`) so issuer, location, dates, and `View certificate →` align cleanly in the main column (`minmax(0, 1fr)`) under the title and description.

### 4. [P1 / High] Loader exits to an empty grey/dark frame before Hero type and buttons animate in
- **Viewport**: `390×844`, `890×626` (all phone/Duo viewports)
- **Theme**: Light & Dark
- **Section**: Intro loader (`.intro`) → Hero (`#top`)
- **Screenshots**: `loader-iphone-light.jpg`, `loader-iphone-dark.jpg`, `loader-landscape-light.jpg`, `loader-iphone-light/t1400.png`, `loader-iphone-light/t2000.png`, `loader-landscape-light/t2000.png`
- **What is wrong**: At `~1.4s` (`t1400.png`), `100` renders while `Grid` still reads `...`. Once `.intro` exits around `2.0s` (`t2000.png`), the visitor sees a nearly blank screen with only the WebGL particle field (and 10px of the navbar bottom at `890×626`) because `.site-header` (`60ms` delay + `760ms`), `.hero__name` (`260ms`/`350ms` delay + `1050ms`), and `.hero__aside` (`520ms`/`600ms` delay + `900ms`) wait up to `t=3.4s` to settle. Also `.intro__skip` (`styles/loader.css` line 79) sits tight at the top edge on `320px` between `McLein Jei Onza` and `Portfolio`.
- **Concrete fix**:
  - `styles/hero.css` (lines 247–257) and `styles/nav.css` (line 212): start hero and header entrances immediately upon `is-ready` (reduce `.hero__name` delay to `40ms`/`100ms` and duration to `620ms`, `.hero__aside` delay to `140ms`/`200ms` and duration to `520ms`, and `nav-drop` delay to `0ms` / duration `420ms`) so there is no dead empty screen at `t=2.0s`.
  - `styles/loader.css` (`.intro__skip`): add `min-height: 44px; min-width: 44px; padding: 0 12px;` so the skip control meets touch-target sizing without crowding the top labels on `320px`.

### 5. [P1 / High] Hero CTAs pushed below the fold at 320×568 (and tight at 466×678)
- **Viewport**: `320×568` (`ctaBottom: 682 > 568`), `466×678` (`ctaBottom: 656` live; overflowed fold in `folded-light/s00.png` & `folded-dark/s00.png`)
- **Theme**: Light & Dark
- **Section**: Hero (`#top`)
- **Screenshots**: `small-light/sheets/sheet00.jpg` (`s00`, `s01`), `small-dark/sheets/sheet00.jpg` (`s00`, `s01`), `folded-light/sheets/sheet00.jpg` (`s00`, `s01`), `folded-dark/sheets/sheet00.jpg` (`s00`, `s01`)
- **What is wrong**: At `320×568`, `.hero__inner` enforces `min-height: max(100svh, 600px)` (`styles/hero.css` line 215), `.hero__plot` enforces `min-height: 160px` (line 219), and `@media (max-width: 360px)` stacks both CTAs to 100% width (`line 233`), pushing both `See the work` and `Send a message` completely below the `568px` fold (`ctaBottom: 682px`). At `466×678`, only `22px` margin remains live and any 2-line spec wrapping clips the CTAs below `678px`.
- **Concrete fix**:
  - `styles/hero.css` (`@media (max-width: 720px)`): set `.hero__inner { min-height: 100svh; }` (drop the `600px` floor), reduce `.hero__plot { min-height: clamp(104px, 19svh, 156px); }`, tighten `.hero__spec { padding-block: 10px 12px; row-gap: 8px; }`, and under `@media (max-width: 380px)` size `.hero__name { font-size: clamp(3rem, 11vw, 3.75rem); }` and `.hero__cta { gap: 8px; }` so both CTAs sit comfortably above the fold at `320×568` and `466×678`.

### 6. [P1 / High] Toolchain 24 icons: Drizzle is nearly invisible in light mode; Ollama & Cursor render harsh boxes
- **Viewport**: All viewports (`320×568` – `890×626`)
- **Theme**: Light (`drizzle`, `react`, `neon`, `ollama`) and Dark (`ollama`, `cursor`)
- **Section**: Hero Toolchain (`.hero__tools`)
- **Screenshots**: `toolchain-light.png`, `toolchain-dark.png`, `misc-390-light/toolchain.png`, `misc-390-dark/toolchain.png`, `misc-390-dark/toolchain-crop.png`
- **What is wrong**:
  - `assets/icons/drizzle.svg` (`fill="#C5F74F"`) under `filter: grayscale(1)` (`styles/hero.css` line 171) desaturates to pale grey on `#E9EAEC` (~1.15:1 contrast, almost invisible in `toolchain-light.png`). `react.svg` (`#61DAFB`) and `neon.svg` (`#34D59A`) are similarly faint in light mode.
  - `assets/icons/ollama.webp` has a solid `#FFFFFF` square background, showing a stark white square on `#E9EAEC` (`toolchain-light.png`) and an inverted `#000000` square on `#0F1012` (`toolchain-dark.png`).
  - `assets/icons/cursor.webp` is included in `:root[data-theme='dark'] .hero__tool img:is(..., [alt='Cursor'], ...) { filter: grayscale(1) invert(1); }` (`styles/hero.css` line 180), turning its dark rounded badge into a glaring white rounded-square tile in dark mode (`toolchain-dark.png`).
- **Concrete fix**:
  - `styles/hero.css`: in light mode, darken pale pastel SVGs (`:root[data-theme='light'] .hero__tool img:is([alt='Drizzle'], [alt='React'], [alt='Neon']) { filter: grayscale(1) brightness(0.5) contrast(1.7); }`); remove `[alt='Cursor']` from the dark-mode `invert(1)` selector (line 180); replace `assets/icons/ollama.webp` with a transparent SVG/WebP silhouette (and apply `mix-blend-mode: multiply` in light mode as interim guard).

### 7. [P1 / High] Touch targets under 44px on Hero spec links and 320px Work gallery dots
- **Viewport**: All 5 viewports for `.hero__link` (`18–39px` height); `320×568` for `.project__dots` (`38×44px`)
- **Theme**: Light & Dark
- **Section**: Hero spec strip (`.hero__spec`), Work galleries (`#advancare`, `#medcore`)
- **Screenshots**: Live Playwright WebKit measurements across all 5 viewports; `small-light/sheets/sheet00.jpg` (`s03`), `small-light/sheets/sheet01.jpg` (`s06`)
- **What is wrong**:
  - `.hero__link` links in `index.html` (`7+ projects, web and mobile →` and `2nd place, Cagayan Innovation Hack 2026 →`) measure `18px` tall on `466×678` / `626×890` and `36–39px` tall on `390×844` / `890×626` — under the `44px` touch floor.
  - At `320×568`, 7-slide galleries (`AdvanCare`, `MedCore`) fit 7 `[data-gallery-dot]` buttons inside `288px` with `gap: 4px`, making each button `38×44px` (CSS `min-width: 24px` in `styles/work.css` line 156 overrides the 44px width target).
- **Concrete fix**:
  - `styles/hero.css` (`@media (pointer: coarse)`): make `.hero__cell:has(.hero__link)` the relative hit container with `.hero__link::after { content: ''; position: absolute; inset: -6px 0; min-height: 44px; }` (or give `.hero__link { display: inline-flex; align-items: center; min-height: 44px; }`).
  - `styles/work.css` (`@media (max-width: 380px)`): set `.project__dots { gap: 2px; flex-wrap: wrap; }` and `.project__dots [data-gallery-dot] { min-width: 44px; }` on `pointer: coarse` so 7-slide dots never drop below `44×44px`.

### 8. [P2 / Medium] Anchor jumps from the menu hide the fixed header, exposing a blank 52–56px band above the section
- **Viewport**: All 5 viewports (`320×568`, `390×844`, `466×678`, `626×890`, `890×626`)
- **Theme**: Light & Dark
- **Section**: Fixed header (`.site-header`) → About (`#about`), Contact (`#contact`)
- **Screenshots**: `inter-small-light/03-anchor-about.png`, `inter-iphone-light/03-anchor-about.png`, `inter-portrait-light/03-anchor-about.png`, `inter-landscape-light/03-anchor-about.png` (confirmed live: `headerHidden: true, aboutTop: 52/56`)
- **What is wrong**: `scripts/core/nav.js` (`onScrollFrame`, line 166) hides `.site-header` on any downward scroll (`y > lastY`), including programmatic `goTo()` / `land()` jumps triggered from the phone menu or `"See the work"` / `"Let's talk"`. Because `[id]` reserves `scroll-margin-top: var(--nav-h)` (`52px`/`56px`), hiding the header leaves an empty `52–56px` grey strip above `#about`'s orange scan line.
- **Concrete fix**:
  - `scripts/core/nav.js` (`goTo()`, `land()`, `onScrollFrame()`): track a `programmatic` flag during `goTo()`/`land()` (cancelled on `wheel`/`touchstart`/`pointerdown`/`keydown`, matching the 2026-10-25 rule in `DECISIONS.md`) and keep `setHidden(false)` while `programmatic` is active.

### 9. [P2 / Medium] Journey portrait and Contact avatar show stark white studio backgrounds in Dark Mode
- **Viewport**: All 5 viewports (`320×568` – `890×626`)
- **Theme**: Dark
- **Section**: Journey (`#journey` `2024.`), Contact (`#contact` `.contact__avatar`)
- **Screenshots**: `iphone-dark/sheets/sheet02.jpg` (`s13`), `small-dark/sheets/sheet04.jpg` (`s20`), `folded-dark/sheets/sheet03.jpg` (`s16`), `portrait-dark/sheets/sheet02.jpg` (`s13`), `landscape-dark/sheets/sheet04.jpg` (`s17`, `s18`), `iphone-dark/sheets/sheet06.jpg` (`s32`)
- **What is wrong**: `assets/images/journey-portrait.webp` and `assets/images/avatar.webp` are opaque `#FFFFFF` studio backgrounds. On `#0F1012` / `#1C1E22` in Dark Mode, `journey-portrait.webp` renders as a bright white rectangle (especially jarring full-width at `890×626` in `s17`/`s18`), and `avatar.webp` sits as a stark white 48×48 square next to `McLein Jei Onza`.
- **Concrete fix**:
  - Re-export `assets/images/journey-portrait.webp` and `assets/images/avatar.webp` with transparent backgrounds (or a dark-compatible neutral studio backdrop) so `.plate` (`#1C1E22`) and `.contact__avatar` blend naturally in Dark Mode, matching the transparent Work mockups.

### 10. [P2 / Medium] GitHub Activity calendar opens scrolled to the oldest empty months on phones and Duo portrait
- **Viewport**: `320×568`, `390×844`, `466×678`, `626×890`
- **Theme**: Light & Dark
- **Section**: Activity (`#activity`)
- **Screenshots**: `misc-390-light/calendar.png`, `misc-390-dark/calendar.png`, `iphone-light/sheets/sheet03.jpg` (`s18`), `small-light/sheets/sheet05.jpg` (`s27`), `folded-light/sheets/sheet04.jpg` (`s22`), `portrait-light/sheets/sheet03.jpg` (`s18`)
- **What is wrong**: `.activity__scroll` (`styles/activity.css` line 152) opens at `scrollLeft = 0`, showing only `Dec Jan Feb Mar` (12 months ago, nearly all level-0 grey squares; `Mar` clipped to `M` at `320px`) while all `1,875` contributions and orange peak days (`Jul–Nov`) sit hidden off-screen to the right with no scroll cue.
- **Concrete fix**:
  - `scripts/core/activity.js` (after populating `[data-activity-calendar]`): set `scroller.scrollLeft = scroller.scrollWidth` inside `requestAnimationFrame` when `scroller.scrollWidth > scroller.clientWidth` so phones land on the latest months (`Aug–Nov`), and add a compact mono hint (`Swipe for earlier months` or left-fade indicator) on `<=890px`.

### 11. [P2 / Medium] Native WebKit `<video controls>` UI crowds narrow phones and fills ~92% height at 890×626
- **Viewport**: `320×568`, `390×844`, `466×678`, `890×626`
- **Theme**: Light & Dark
- **Section**: Promo video dialog (`dialog.video`)
- **Screenshots**: `inter-small-light/09-video.png`, `inter-small-dark/09-video.png`, `inter-folded-light/09-video.png`, `inter-landscape-light/09-video.png`, `folded-inter.jpg`, `landscape-inter.jpg`
- **What is wrong**: On `320×568`, WebKit's native `<video controls>` bar covers the bottom third of the `~260px` video with a thick pill scrubber; on `390–890px` it floats a second pill volume slider over the top-right video text (`"Care shouldn't"`). At `890×626` (`inter-landscape-light/09-video.png`), the dialog stretches close to the top and bottom viewport edges.
- **Concrete fix**:
  - `styles/dialogs.css` (`@media (max-height: 680px)`): adjust `dialog.video` width cap to `calc((100dvh - 2 * var(--m) - 112px) * 16 / 9)` and `.video__plate { margin: 4px; }` for vertical breathing room at `626px` height; long-term, replace native `controls` with a slim custom bar below `.video__aspect` on touch.

### 12. [P2 / Medium] Contact `Direct email` Copy wraps alone at 466px; Mulat live link hyphen-breaks at 320px; Contact stats/mini-grid alignment
- **Viewport**: `466×678` (`Direct email`), `320×568` (`Open live site`), `320×568` & `390×844` (`.contact__stats`, `.channel--github`)
- **Theme**: Light & Dark
- **Section**: Work (`#mulat`) and Contact (`#contact`)
- **Screenshots**: `folded-light/sheets/sheet07.jpg` (`s36`), `folded-dark/sheets/sheet07.jpg` (`s36`), `small-light/sheets/sheet02.jpg` (`s14`), `iphone-light/sheets/sheet08.jpg` (`s32`, `s33`), `iphone-dark/sheets/sheet06.jpg` (`s32`, `s33`)
- **What is wrong**:
  - At `466×678` (`folded-light/s36.png`, live `wrapped: true, boxH: 101`), `Direct email` + `mcleinjeionza06@gmail.com` fill row 1 and push `▪ Copy` alone onto row 2 bottom-left.
  - At `320×568` (`small-light/s14.png`), Mulat Media's `Open live site mulat-media.vercel.app ↗` wraps inside the button across 2 lines (`Open live / site` + `mulat- / media.vercel.app`).
  - In `.contact__stats` (`iphone-light/s32.png`), `Visits` pushes `334` to the far right edge while `♡ 83 likes` sits compactly left-aligned underneath.
  - On `390×844` (`iphone-light/s32.png`), `.channel` collapses to 1 column at `max-width: 420px`, leaving the ~94px 16-week `.channel__grid` with ~260px of empty space on its right.
- **Concrete fix**:
  - `styles/contact.css`: at `@media (max-width: 520px)` set `.contact__direct > .label { flex-basis: 100%; }` so `email` + `Copy` stay paired on row 2 at `466px`; change `.contact__visits` to `justify-content: flex-start; gap: 10px;` on `<=720px` so `Visits` pairs tightly like `♡ 83 likes`; lower the single-column `.channel` breakpoint from `420px` to `359px` so `Follow ↗` aligns top-right at `390px` (matching `466px`).
  - `styles/work.css` (`@media (max-width: 380px)`): style `.project__actions .btn` with `flex-wrap: wrap; height: auto; min-height: var(--btn-h); padding-block: 10px;` or hide `.project__dur` under `360px` so `mulat-media.vercel.app` never hyphen-breaks.

### 13. [P3 / Polish] Work projects stack across ~2 viewports at 890×626 (Duo landscape)
- **Viewport**: `890×626` (Duo landscape)
- **Theme**: Light & Dark
- **Section**: Work (`#work`)
- **Screenshots**: `landscape-light/sheets/sheet00.jpg`–`sheet03.jpg` (`s03`–`s12`), `landscape-dark/sheets/sheet00.jpg`–`sheet03.jpg` (`s03`–`s12`)
- **What is wrong**: `styles/work.css` sets the 2-column `.project__grid` only at `@media (min-width: 961px)`. At `890×626`, each project stacks its gallery above its spec sheet across ~2 screens (`s03` + `s04` per project) instead of using the `890px` width for a one-screen-per-project side-by-side split.
- **Concrete fix**:
  - `styles/work.css`: add `@media (min-width: 820px) and (max-width: 960px) and (orientation: landscape)` with `.project__spec { grid-column: 1 / 6; grid-row: 1; }`, `.project__gallery { grid-column: 6 / 13; grid-row: 1; max-width: calc((100svh - var(--nav-h) - 180px) * 16 / 9 + 24px); }`, and `padding-block: 28px`.

### 14. [P3 / Polish] Tight top-bar spacing at 320px and footer link row breathing room
- **Viewport**: `320×568`, `390×844`
- **Theme**: Light & Dark
- **Section**: Top bar (`.site-header__bar`), Footer (`.site-footer__nav`)
- **Screenshots**: `small-light/sheets/sheet00.jpg` (`s00`), `small-light/sheets/sheet10.jpg` (`s54`), `iphone-light/sheets/sheet08.jpg` (`s34`)
- **What is wrong**: At `320×568`, `McLein` sits only `10px` from the theme toggle and `.site-header__cta` hides `.btn__mark` (`<=340px`); in `.site-footer__nav ul`, wrapped 44px ghost links have `gap: 0 16px` (`styles/footer.css` line 102), putting the top row's hairline underline very close to the next row's labels.
- **Concrete fix**:
  - `styles/footer.css` (`@media (max-width: 720px)`): change `.site-footer__nav ul { gap: 4px 16px; }`.

---

## What Already Looks Great

- **Zero horizontal overflow (`scrollWidth === clientWidth`)** verified across all 5 viewports (`320`, `390`, `466`, `626`, `890`) in both themes.
- **Duo unfolded landscape (`890×626`) hero & menu (`inter-landscape-light/01-menu.png`)**: hero places `McLein Jei Onza` beside intro + CTAs (`ctaBottom: 602 <= 626`), and the 2-column landscape drawer fits all 8 links in one view without scrolling.
- **Instrument 2px precision & registration plates**: hairlines, `.plate` corner ticks, tabular mono numerals, and restrained `#FF4F00` / `#FF5A1A` orange accents translate cleanly to small screens without visual noise.
- **About (`#about`) & Stack (`#stack`)**: rising dark ink field (`#111214`), native `<details name="does">` accordion, and single-column Stack schema tables (`320–890px`) are legible, well-spaced, and free of truncation.
- **Dialogs (`dialog.lightbox`, `dialog.message`)**: `44×44` icon controls, `2px` cobalt focus rings, `16px` form controls (no iOS zoom), and the 2-column compact form at `890×626` (`inter-landscape-light/10-message.png`) work smoothly.
- **WebGL Extract → Transform → Load particle field**: renders reliably in WebKit touch at 2,048 points in both Light and Dark themes (`s00` across all 5 viewports).
