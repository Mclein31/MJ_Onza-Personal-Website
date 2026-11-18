---
type: architecture
title: Personal Website Architecture
project: Personal Website
tags:
  - architecture
  - portfolio
  - web
  - serverless
last_updated: 2026-11-18
---

# 🏛️ Personal Website — Architecture

## 📐 Frontend & Serverless Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│              Personal Website Frontend (index.html, no build)          │
│              css/*.css (tokens first) · js/*.js ES modules             │
├──────────────────────────────────┬─────────────────────────────────────┤
│ Sections:                        │ Interactive modules (js/*.js):      │
│ - Floating pill nav              │ - Pinned horizontal Work scroll     │
│ - Hero + draggable icon carousel │ - Screenshot galleries + lightbox   │
│ - Work (galleries, promo videos) │ - Promo video window                │
│ - About + "What I do" accordion  │ - Pinned year-by-year Journey       │
│ - Journey · Activity · Stack     │ - Contact wallet + message dialog   │
│ - Recognition · Training         │ - Theme manager · interface sounds  │
│ - Contact wallet · Footer vista  │ - Visit & like counter sync         │
└──────────────────────────────────┴──────────────────┬──────────────────┘
                                                      │ fetch
                                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Vercel Serverless Functions (api/)                   │
│  - stats.js: CORS preflight; proxies visits & likes to Abacus          │
│    (namespace 'mcleinonza'); `portfolio_visited` cookie dedup          │
│  - contributions.js: GitHub contribution calendar for Mclein31         │
└──────────────────────┬──────────────────────────────┬──────────────────┘
                       ▼                              ▼
┌─────────────────────────────────────┐ ┌────────────────────────────────┐
│ Abacus (abacus.jasoncameron.dev)    │ │ GitHub public calendar         │
│ - portfolio_views (visits)          │ │ (client falls back to          │
│ - portfolio_likes                   │ │  github-contributions-api      │
└─────────────────────────────────────┘ │  .jogruber.de)                 │
                                        └────────────────────────────────┘
Contact form: FormSubmit AJAX (direct from the browser).
```

---

## 🧩 Module Map (`js/`, verified 2026-11-16)
- `main.js` — entry; runs each `init*` inside a try/catch, then the preloader → adds `.hero.is-in`.
- `util.js` — `$`/`$$`, `clamp`, `lerp`, safe `store` (localStorage/sessionStorage), `viewProgress`, `toast`, `copyText`, `arrowKeys`.
- `theme.js` — `portfolio-theme` key, OS sync until explicit choice; flash-free bootstrap is inline in `<head>`.
- `preloader.js` — once per session (`pf-loaded` in sessionStorage), timeout failsafe.
- `hero.js` — the Asia/Manila live clock (`[data-clock]`) only. Since the 2026-11-18 Signal redesign the name is plain Geist 900 with CSS-drawn round red i-dot and full stop (`::after`); the old weight-following `.char` split, the word ticker and the signal line are gone.
- `scroll.js` — nav hide/scroll-spy and active pill (`--po`/`--px`/`--pw`), nav steps aside at the footer (`.nav.is-away`), footer wordmark fit and scroll fill (`--fill`).
- `work.js` — pins `#work` when `(min-width: 861px) and (min-height: 600px) and (orientation: landscape)`; caches card centers and writes transforms directly. Otherwise cards stack vertically.
- `gallery.js` — per-card screenshot galleries (scroll-snap + dots + prev/next + mouse drag). A tap, Enter or the expand button opens the set in the lightbox (`openViewer`), using each slide's `data-title` / `data-desc` as the caption. A slide holding a `<video>` (the last of AdvanCare's, MedCore's, SERVIO's and MedRec's) is left out of the lightbox set: its own controls take clicks, mouse drags on it don't scroll the deck, it pauses when another slide shows or it leaves the screen, and expand opens it in the video window at the same time.
- `video.js` — `<dialog data-video>` player on the demo window's sheet (`.appwin--video`, 16:9). Opened by `[data-video-open]` buttons (src, poster, title in data attributes) or `openVideo(clip, from, at)`; plays with sound on open, pauses on close.
- `ui.js` — mobile menu, "What I do" accordion (`[data-does]`, one row open), schema row "joins" (`data-join` tags), DTI film strip, copy email, footer `[data-year]`.
- `reveal.js` — sets `.reveal-ready` (skipped under reduced motion, so nothing hides without it): `[data-scrub]` headings split into words whose opacity follows the scroll (0.14 → 1) and whose `.hl` boxes wipe ink left to right (`--wipe`); `[data-rise]` blocks rise once (`="kids"` staggers children); hero `.ln` lines rise out of a mask on `.hero.is-in`.
- `journey.js` — pins `[data-years]` (adds `.is-pinned`, height = n × 75svh + 100svh), shows one `.yr` per stretch of scroll. Reduced motion and short landscape phones: normal flow. Small screens measure the active slide so the stage fits its content while preserving the pin/transitions. (Typed SQL lines were removed 2026-11-01.)
- `activity.js` — GitHub activity section: contribution calendar, totals and streak summary from `contributions.js`.
- `contributions.js` — shared, retrying loader: `/api/contributions` first, then the jogruber public API.
- `wallet.js` — contact channel passes: tap a header to bring that pass to the front (`--pos`, `.is-front`, others `inert`); types the email's first line once on screen; fills the GitHub pass from the shared `contributions.js` loader, with loading/error/retry states; wallet height adjusts to its GitHub, LinkedIn, WhatsApp and Email cards; 12-hour Asia/Manila clock (`[data-clock-12]`).
- `icons.js` — 24 tool/stack logos (`ICONS`: file, label, mono flag) in a horizontal swipeable carousel within `.hero__zone` below the actions at every viewport. A duplicate, accessibility-hidden group enables a seamless loop at 24px/s. Pauses on hover, focus, touch, offscreen, hidden document; reduced motion uses one static scrollable group. Arrow keys scroll the focused region. Individual icons use pointer capture and a fixed overlay to drag outside the scroll container, then return to their slot via an interruptible damped spring with release velocity; reduced motion returns immediately. Ink-grey at rest, brand colour on hover; black marks invert in dark mode. Logos from Simple Icons (CC0) or existing project assets.
- `sfx.js` — interface sounds synthesized with Web Audio (no files): one capture-phase click listener picks click / open / close / whoosh / toggle / success / pop / drop / step; typing ticks from `wallet.js`. Silent until the first pointer or key press (autoplay rules). Sounds then stay enabled; the owner removed the mute control and legacy preference on 2026-11-02. Wallet front-card changes trigger a separate soft card-shuffle sound.
- `lightbox.js` — `PHOTOS` data (awards + hackathon), `<dialog>` viewer, photo strip render. `openViewer(items, i, from)` reuses the dialog for project screenshots (`.is-wide` sheet, "Screenshot viewer" label, arrows hidden for a single slide).
- `vista.js` — footer ASCII scene (Cape Engaño lighthouse at night): drawn each frame into a char grid, split into three `<pre>` colour layers (ink, muted, accent). Grid from the footer's free width/height; objects scale with it. ~12fps while on screen, still under reduced motion.
- `stats.js` — cached totals (`site_total_*`), once-per-browser first visits (`site_user_has_visited`, serialized with browser locks), and independent once-per-browser likes (`site_user_has_liked`). Visits increment through the API only; `api/stats.js` also deduplicates using a one-year HttpOnly cookie. Pointer capture starts after an actual drag.
- `contact.js` — `<dialog>` FormSubmit form (`formsubmit.co/ajax/<owner email>`); exports `openMessage()`.
- `drawer.js` — Recognition and Training **editorial index** (2026-11-18): numbered row buttons (`[data-idx-row]`, `aria-current`, arrow keys) feature one panel at a time on desktop (sticky photo + caption, crossfade) and work as a one-open accordion on narrow screens; certificate photos open in the lightbox (`data-lb`, `data-training-lb`, `TRAINING_PHOTOS`).
- `copier.js` — Contact copier (2026-11-18): any `[data-copy]` click prints a slip with the address and lights a COPIED LED; `aria-live` announcement; `print` sound in `sfx.js`; instant under reduced motion.

## 🎨 Styles (`css/`)
`tokens.css` (all colors/type/motion; `[data-theme]` light/dark overrides) → `base.css` → one file per area:
`nav`, `hero`, `work`, `about`, `journey`, `activity`, `stack`, `recognition`, `contact`, `wallet`, plus `fonts.css`,
`reveal.css`, `fx.css` (preloader, stats pill, toast), `texture.css` (zero-specificity flat fallbacks only since
the 2026-11-18 redesign; the paper layers and glass tokens are gone), `drawer.css` (editorial index), `copier.css`
and `footer.css` (footer + vista, kept apart so redesigns leave it alone; its wordmark uses `--font-mark`, Hedvig).
Shared components live in `base.css`: `.label`, `em.serif` (upright, red emphasis — no serif font), `.numeral`,
`.btn-pill`, `.band--night/--signal/--paper` (local token re-maps). All motion respects `prefers-reduced-motion`.

## 📁 Other files
- `assets/` — `fonts/` (self-hosted WOFF2), `icons/` (tool and contact logos, `brand-sources.md`), `images/`
  (`projects/` gallery slides, `awards/`, `trainings/`, journey photos, `og-image.jpg`), `Logo/` (favicons and
  source portraits), `textures/` (five paper layers), `video/` (four promo MP4s + posters).
- `robots.txt`, `sitemap.xml` (one URL) — see [SEO_SETUP.md](SEO_SETUP.md).
- `tests/` — Playwright specs (`*.spec.mjs`), `fixtures.mjs`, `serve.mjs` (local server with byte ranges),
  `stats-api.node.mjs`; config in `playwright.config.mjs` (plus `*-timing` projects run after the suite).
- `PersonalPortfolio/` — Obsidian vault (tracked in git).
- `.env.local` — git-ignored; holds the Abacus admin key (see NOTES).
