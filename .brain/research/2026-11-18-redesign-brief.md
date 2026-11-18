---
type: research
title: Redesign brief — "Signal" (2026-11-18)
project: Personal Website
status: active
last_updated: 2026-11-18
---

# Redesign brief — "Signal"

The owner asked for a redesign of the portfolio based on four screen recordings in `website_inspo/` (frames: `.brain/research/redesign-inspo/*.jpg`; start with `v1_detail.jpg`). Seven workers build it in parallel, each owning distinct files. **Read this whole brief before editing anything.**

## 1. What the inspiration says (and what we take)

| Seen in the recordings | We take |
|---|---|
| Signal-red, black and cream blocks; flat colour, no gradients | The palette (section 3) and hard colour bands between sections |
| Enormous heavy grotesk display type, very tight tracking | Geist at weight 900, giant sizes |
| Grotesk headline + **italic serif** second line ("Made to look good. *Built to feel different.*") | Italic serif accents (Instrument Serif Italic) inside headings |
| A thick red ribbon that snakes through every section as you scroll, and a cursor that paints red ink | **The signal line**: one red "data pipeline" drawn through the page on scroll + a cursor ink trail in the hero |
| Oversized numerals (01–04) behind 3D objects | Giant red index numerals behind project device mockups and service rows |
| Mono micro-labels ("02 / SERVICES", "FIG. 02 / KEYCAP", "04 DISCIPLINES", coordinates) | `.label` mono captions everywhere: section index, FIG. numbers, coordinates of Tuguegarao, live clock |
| Black marquee band with huge words separated by a red ✦ | A marquee band between Hero and Work |
| Tactile interactions: a **copier** that prints a slip, a **file drawer** of testimonial cards, bent carousels | Copier for "copy email" (Contact) and a file drawer for Recognition/Training |
| Pill buttons with a circular arrow chip | `.btn-pill` |

Do **not** copy any inspiration site's copy, logo, name or layout one-to-one. Our identity is the owner's: a CS student building full-stack apps and training in **data engineering**. The red line is a *data pipeline*, not a paint stroke. That is the twist that makes it ours.

## 2. What must stay (owner decisions still in force — see DECISIONS.md)

- All content and facts: names, dates, project copy, links, emails, award names, the WhatsApp/LinkedIn/GitHub links. You may restyle headings (e.g. wrap the last words in `<em class="serif">`), but do not rewrite facts.
- Section order: Hero → (new marquee band) → Work → About → Journey → Activity → Stack → Recognition → Training → Contact → Footer.
- **Work**: pinned horizontal scroll on `(min-width: 861px) and (min-height: 600px) and (orientation: landscape)`, stacked otherwise; galleries with MockUPhone device frames on transparent slides; promo videos; lightbox; existing card sizing formula and gallery masks.
- **Journey**: pinned year-by-year scroll with progress; normal flow under reduced motion and on short landscape phones.
- Hero: draggable, spring-return tool-icon carousel (restyle only); live Asia/Manila clock.
- Contact wallet: GitHub, LinkedIn, WhatsApp and Email cards with their personality animations; the GitHub pass keeps its GitHub dark palette.
- Footer: the ASCII Cape Engaño lighthouse vista and the wordmark (footer.css). Only colour tokens change there.
- Interface sounds (sfx.js), the visit/like stats pill, light/dark theme toggle, preloader.
- No build step, no frameworks, no CDN, no external requests for assets. Vanilla ES modules. Self-hosted fonts.
- Every `data-*` hook and class that JS or tests rely on. You may add classes; do not remove hooks.
- `prefers-reduced-motion` respected everywhere; `(hover: hover)` gating for hover effects.

Superseded by this brief (record in DECISIONS.md at the end, not now): the cool white/gray palette, the paper fibre texture stack, liquid-glass cards, the orange accent.

## 3. Tokens (W1 implements in `css/tokens.css`; everyone else uses these names)

Existing token **names stay** (so untouched CSS picks up the new look). New values and new names:

Light theme
```
--color-paper:   #F2EFE9   (cream)        --color-paper-2: #E8E4DC   --color-paper-3: #DCD6CB   --color-paper-hi: #FAF8F4
--color-ink:     #0D0D0D                  --color-ink-2:   #2A2A2A   --color-muted:   #5C5953 (≥4.5:1 on cream)
--color-rule:    #CFC8BC
--color-signal:      #FF2D1F   (brand red: fills, the signal line, numerals)
--color-signal-text: #C41D10   (red used as text on cream: ≥4.5:1)
--color-signal-ink:  #0D0D0D   (text on a red fill; cream only for ≥24px bold)
--color-night:   #0D0D0D       --color-night-ink: #F2EFE9     --color-night-muted: #A39E95
--color-accent / --color-accent-2 → var(--color-signal); --color-accent-text, --color-focus → var(--color-signal-text)
--color-highlight: #0D0D0D; --color-highlight-ink: #F2EFE9   (ink highlight boxes, as before)
theme-color meta: #F2EFE9
```
Dark theme
```
--color-paper: #0B0B0B   --color-paper-2: #151515   --color-paper-3: #1F1F1F   --color-paper-hi: #121212
--color-ink:   #F2EFE9   --color-ink-2:   #D6D1C7   --color-muted:   #A39E95   --color-rule: #2E2C29
--color-signal: #FF3B2E  --color-signal-text: #FF6A5E  --color-signal-ink: #0B0B0B
--color-night: #000000   --color-night-ink: #F2EFE9  (night bands use paper-2 edges so they stay distinct)
theme-color meta: #0B0B0B
```
Type
```
--font-display / --font-body: Geist (variable 100–900, already self-hosted)
--font-serif: "Instrument Serif", "Hedvig Letters Serif", Georgia, serif   (italic only; W1 self-hosts Instrument Serif Italic, OFL)
--font-data: Geist Mono
--display-weight: 900   --tracking-display: -0.055em
--text-giant: clamp(4.25rem, 15.5vw, 15rem)    (hero name, giant numerals)
--text-hero / --text-mega / --text-section: keep names, W1 retunes values
```
Motion: keep the existing easing/duration tokens; add `--ease-snap: cubic-bezier(.2, .9, .1, 1)`.

## 4. Shared components (W1 builds them in `css/base.css`; others only use them)

- `.label` — Geist Mono 11–12px, uppercase, letter-spacing .08em, muted. Content patterns: `02 / WORK`, `FIG. 03 / SERVIO`, `17.61°N 121.73°E · TUGUEGARAO`.
- `em.serif` — italic Instrument Serif, weight 400, tracking 0, slightly larger optical size (≈1.06em) inside grotesk headings.
- `.band--night`, `.band--signal`, `.band--paper` — section colour schemes. They **re-map** `--color-paper`, `--color-ink`, `--color-muted`, `--color-rule`, `--color-highlight*` locally, so every component inside inverts without extra rules.
- `.btn-pill` — ink pill, cream text, with a trailing round red chip holding a ↗ arrow (`.btn-pill__chip`). Hover: chip rotates 45°. Min height 48px.
- `.numeral` — giant index numeral (Geist 900, `--text-giant`, red, `line-height:.8`), `aria-hidden="true"`.
- `[data-signal-anchor]` — see section 5.

## 5. The signal line (W2 builds `js/signal.js` + `css/signal.css`)

One red line, ~22–34px thick (clamp to viewport), round caps, drawn progressively as the visitor scrolls, as if data flows from the hero down through every section to the contact form. Small cream "packets" travel along the drawn part.

Contract for section owners: put **1–3 empty `<i data-signal-anchor aria-hidden="true"></i>` markers** in your section where the line should pass (e.g. beside a heading, between columns). Optional `data-signal-side="left|right"` hints. Do not put anchors inside the pinned Work track or inside the pinned Journey stage; put them before/after those stages. W2 builds one SVG path through all anchors in document order (smooth curves), behind section content but above section backgrounds, and leaves gaps where a section is pinned.

Rules: one rAF scroll handler; cache geometry and path length; recompute on resize/ResizeObserver/font load only; no layout reads per frame; hidden for `prefers-reduced-motion` (show the full static line instead) and in print.

Hero cursor ink: fine pointer + hover only, not under reduced motion. A canvas red ink trail that thickens with speed and fades within ~1.2s. Mono caption in the hero: `MOVE YOUR CURSOR — LEAVE A TRACE`.

## 6. Section direction

- **Hero (W2)** — full-bleed `.band--signal`. Name "McLein Onza." in ink-black at `--text-giant`; the dot over the i and the final period in cream. Intro: "I build full-stack apps *and train in data engineering.*" (second half `em.serif`). `.label` row: name + university, coordinates, live clock. CTAs: "See the work" `.btn-pill`, "Send a message" text link. Tool-icon carousel at the bottom, icons ink on red, cream on hover. Cursor ink trail. Remove the old faint background marquee rows from the hero.
- **Marquee band (W2)** — new `<div class="ticker band--night">` right after the hero: one row of huge words (Python ✦ SQL ✦ PostgreSQL ✦ Pipelines ✦ Full-stack ✦ Cloudflare ✦) in cream with red ✦, speed nudged by scroll velocity, paused off-screen and under reduced motion.
- **Work (W3)** — on cream. Heading "Things I’ve *built.*" + `.label` `01 / WORK` and a mono counter `02 / 05`. Each project: giant red `.numeral` (01–05) partly behind the device mockup, `.label` `FIG. 0n / PROJECT`, title in Geist 900, tags as mono chips, gallery controls restyled (round ink buttons). Keep every Work rule from section 2.
- **About (W4)** — `.band--night`. Heading keeps the "how data flows." highlight (red highlight box, ink text). "What I do" becomes a numbered list in the spirit of "What we do": three rows `01 Build`, `02 Model`, `03 Automate`, a giant numeral revealed on the open row, and a right-hand `.label` list `03 DISCIPLINES`. Keep the accordion behaviour (one open row). Facts as mono label/value rows.
- **Journey (W4)** — on cream. Keep the pinned year-by-year mechanism. Giant year numerals (outlined ink or red) behind each slide, `.label` progress `YEAR 2 / 5`, serif-italic captions, red underline on recruiter keywords (Python, PostgreSQL/SQL, shipped count).
- **Activity (W5)** — calendar levels from `--color-paper-3` to `--color-signal` (5 steps); totals and streak as big Geist 900 numbers with `.label` captions.
- **Stack (W5)** — schema tables: ink header bar with cream mono table name and a red key glyph; rows mono; the join highlight in red.
- **Recognition + Training (W5)** — a **file drawer**: awards/trainings as folder cards with tabs standing in a drawer; hover/focus/tap lifts a folder to show its photo and caption; Enter/Space toggles; `aria-expanded`; reduced motion = no lift animation. Lead award as a red folder. Certificates still open in the existing lightbox.
- **Contact (W6)** — `.band--night`. Headline "So, what are we *building?*" at display size. Wallet restyled (surfaces, type, red accent) without changing its card set or personality. New **copier**: a small CSS-drawn copier beside the email card; "Copy email" makes it print a paper slip with the address in mono and a red `COPIED` LED; announces via `aria-live`; sound via sfx; reduced motion = slip appears instantly. Footer: keep, only colours via tokens. 
- **Nav (W1)** — floating pill nav restyled: ink pill on cream, active item marked by a red dot; "Let’s talk" `.btn-pill` at the right.
- **Preloader + stats pill (W1)** — restyle to the new palette (red progress bar, mono count).

## 7. Responsive and device matrix (everyone checks their own section; W7 automates it)

Check at: 375×667 (iPhone SE), 390×844 (iPhone 14), 440×956 (iPhone 16 Pro Max), **466×678 (iPhone Duo folded, cover screen)**, **626×890 (iPhone Duo unfolded, portrait)**, **890×626 (iPhone Duo unfolded, landscape)**, 744×1133 (iPad mini), 1032×1376 (iPad Pro 13), 1280×800, 1440×900, 1920×1080, 2560×1440.

The iPhone Duo is Apple's first foldable (announced Sept 2026). Its CSS viewports above are derived from the panel resolutions at 3× (Apple has not published official values). The unfolded landscape size (890×626) triggers the pinned Work layout on a touch device, so it must work with a coarse pointer and 626px height. Use `viewport-fit=cover` with `env(safe-area-inset-*)` paddings. As progressive enhancement, avoid placing key content across a fold with `@media (horizontal-viewport-segments: 2)`.

No horizontal overflow at any size. Touch targets ≥44px. Text contrast WCAG AA in both themes.

## 8. SEO (W7)

Keep canonical, OG/Twitter, JSON-LD Person/WebSite/ProfilePage, robots and sitemap. Improve: projects as a JSON-LD `ItemList` of `SoftwareApplication`/`CreativeWork` (name, description, url when public), `knowsAbout`, `sameAs`; static `theme-color` metas with media queries matching section 3; sitemap `lastmod` 2026-11-18; one `<h1>`; descriptive `alt` on content images (report gaps to owners, don't edit their markup); `width`/`height` on images; `fetchpriority="high"` only on the LCP element; lazy-load below-the-fold images. New OG image at the end (orchestrator will ask).

## 9. File ownership

| Worker | Tool | Owns (only these files, plus its own section(s) of the HTML page) |
|---|---|---|
| W1 Foundation | claude | `css/tokens.css`, `css/base.css`, `css/fonts.css` (+ new Instrument Serif woff2 in `assets/fonts/`), `css/texture.css`, `css/reveal.css`, `css/fx.css`, `css/nav.css`, `js/theme.js`, `js/preloader.js`, `js/scroll.js`, `js/reveal.js`; HTML: `<header class="nav">`, preloader, the font `<link rel="preload">` line |
| W2 Hero + signal | claude | `css/hero.css`, `css/signal.css`, `js/hero.js`, `js/icons.js`, `js/signal.js`; HTML: `<section class="hero">` and the new ticker band right after it |
| W3 Work | claude | `css/work.css`, `js/work.js`, `js/gallery.js`, `js/lightbox.js`, `js/video.js`; HTML: `<section class="work">`, the lightbox and video `<dialog>`s |
| W4 About + Journey | agy | `css/about.css`, `css/journey.css`, `js/journey.js`, `js/ui.js` (accordion part only); HTML: `#about`, `#journey` |
| W5 Activity, Stack, Recognition, Training | agy | `css/activity.css`, `css/stack.css`, `css/recognition.css`, `css/drawer.css`, `js/activity.js`, `js/drawer.js`; HTML: `#activity`, `#stack`, `#recognition`, `#training` |
| W6 Contact + footer | claude | `css/contact.css`, `css/wallet.css`, `css/footer.css`, `css/copier.css`, `js/wallet.js`, `js/contact.js`, `js/vista.js`, `js/copier.js`, `js/sfx.js`; HTML: `#contact`, `<footer>`, the message `<dialog>` |
| W7 SEO + QA | agy | `tests/*`, `playwright.config.mjs`, `robots.txt`, `sitemap.xml`; HTML: `<head>` meta tags and JSON-LD only |

The orchestrator already added the `<link>`s for `css/signal.css`, `css/drawer.css`, `css/copier.css` and wired `js/signal.js`, `js/drawer.js`, `js/copier.js` (each exports `initSignal` / `initDrawer` / `initCopier`) into `js/main.js`. Do not edit `js/main.js` or the stylesheet `<link>` list.

## 10. Working rules (all workers)

1. **The HTML page is shared.** Edit it only inside your own section(s), with small targeted string replacements. Never rewrite, reformat or re-save the whole file. Re-read the region right before each edit — six other agents are editing other sections at the same time.
2. Don't edit another worker's files. If you need something from them, write it under "Notes for other workers" in your report; the orchestrator relays it.
3. Use your skills: **impeccable** (design + polish), **emil-design-eng** and **animate** / **animation-performance** (motion), **web-design-guidelines**, **break-ui**, **frontend-ui-engineering**. Ponytail rule applies: no new dependencies, smallest code that does the job.
4. Verify visually: serve the site on your own port (W1 4201 … W7 4207, e.g. `python3 -m http.server 4203`) and take Playwright screenshots of your section at the device sizes in section 7, light and dark. Save them under `test-results/redesign/<worker>/` (git-ignored scratch).
5. Don't touch `tests/` unless you are W7. Don't commit or push (Jarviee commits your files when you finish).
6. Finish with a report at `.brain/research/redesign-reports/<W#>.md`: what changed, files, screenshot paths, known issues, notes for other workers.
