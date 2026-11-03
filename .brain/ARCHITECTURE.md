---
type: architecture
title: Personal Website Architecture
project: Personal Website
tags:
  - architecture
  - portfolio
  - web
  - serverless
last_updated: 2026-11-01
---

# 🏛️ Personal Website — Architecture

## 📐 Frontend & Serverless Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Personal Website Frontend                       │
│                        (Semantic HTML5 / CSS3)                         │
├──────────────────────────────────┬─────────────────────────────────────┤
│ UI Layout Modules:               │ Interactive Components (js/*.js):   │
│ - Hide-on-scroll Glass Navbar    │ - Pinned Horizontal Work Scroll     │
│ - Kinetic Hero + SQL Query Card  │ - Dark/Light Theme Manager          │
│ - Profile Record + Trait Deck    │ - Screenshot Galleries              │
│ - Skills Schema · Award Stack    │ - Film Strip & Award Lightbox       │
│ - Categorized Skills Grid        │ - AJAX Contact Form Handler         │
│ - Timeline & Award Showcase      │ - Visit & Like Counter Sync         │
└──────────────────────────────────┴──────────────────┬──────────────────┘
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Vercel Serverless Function (api/stats.js)            │
│  - Handles CORS preflight (OPTIONS)                                    │
│  - Proxies visits & likes to Abacus API (namespace: 'mcleinonza')      │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Abacus Count API (abacus.jasoncameron.dev)              │
│  - portfolio_visits                                                    │
│  - portfolio_likes                                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 v3 Module Map (`js/`)
- `main.js` — entry; runs each `init*` inside a try/catch, then the preloader → adds `.hero.is-in`.
- `util.js` — `$`/`$$`, `clamp`, `lerp`, safe `store` (localStorage/sessionStorage), `viewProgress`, `toast`, `copyText`.
- `theme.js` — `portfolio-theme` key, OS sync until explicit choice; flash-free bootstrap is inline in `<head>`.
- `preloader.js` — once per session (`pf-loaded` in sessionStorage), timeout failsafe.
- `hero.js` — splits the name into `.char` spans; pointer distance drives `font-weight` (300–800); Asia/Manila clock; typed SQL queries.
- `cursor.js` — lerped ring + `data-cursor` labels; `data-magnetic` buttons. Fine pointers only.
- `scroll.js` — reveals (`data-reveal`, `--i` stagger), progress bar, nav hide/scroll-spy, manifesto word lighting, timeline fill, award card scaling, footer fill.
- `work.js` — pins `#work` on ≥861px: pin height = track overflow + viewport; scroll progress → `--x`. Otherwise cards stack vertically.
- `gallery.js` — per-card screenshot galleries (scroll-snap + dots + prev/next + mouse drag). A tap, Enter or the expand button opens the set in the lightbox (`openViewer`), using each slide's `data-title` / `data-desc` as the caption. A slide holding a `<video>` (the last of AdvanCare's, MedCore's, SERVIO's and MedRec's) is left out of the lightbox set: its own controls take clicks, mouse drags on it don't scroll the deck, it pauses when another slide shows or it leaves the screen, and expand opens it in the video window at the same time.
- `video.js` — `<dialog data-video>` player on the demo window's sheet (`.appwin--video`, 16:9). Opened by `[data-video-open]` buttons (src, poster, title in data attributes) or `openVideo(clip, from, at)`; plays with sound on open, pauses on close.
- `ui.js` — mobile menu, "What I do" accordion (`[data-does]`, one row open), schema row "joins" (`data-join` tags), DTI film strip, copy email. (The trait deck and portrait tilt code stay but have no markup since the 2026-11-01 redesign.)
- `reveal.js` — sets `.reveal-ready` (skipped under reduced motion, so nothing hides without it): `[data-scrub]` headings split into words whose opacity follows the scroll (0.14 → 1) and whose `.hl` boxes wipe ink left to right (`--wipe`); `[data-rise]` blocks rise once (`="kids"` staggers children); hero `.ln` lines rise out of a mask on `.hero.is-in`.
- `journey.js` — pins `[data-years]` (adds `.is-pinned`, height = n × 75svh + 100svh), shows one `.yr` per stretch of scroll, types its `data-q` SQL line. Reduced motion: a static stacked list. Small screens (≤960px) measure the tallest slide into `--year-content` so the stage fits its content while preserving the same pin/transitions.
- `wallet.js` — contact channel passes: tap a header to bring that pass to the front (`--pos`, `.is-front`, others `inert`); types the email's first line once on screen; fills the GitHub pass directly from the shared `contributions.js` loader, with loading/error/retry states and an exact total independent of calendar animations; wallet height adjusts to its GitHub, LinkedIn, WhatsApp and Email cards; 12-hour Asia/Manila clock (`[data-clock-12]`).
- `icons.js` — 24 tool/stack logos (`ICONS`: file, label, mono flag) in a horizontal swipeable carousel within `.hero__zone` below the actions at every viewport. A duplicate, accessibility-hidden group enables a seamless loop at 24px/s. Pauses on hover, focus, touch, offscreen, hidden document ; reduced motion uses one static scrollable group. Arrow keys scroll the focused region. Individual icons use pointer capture and a fixed overlay to drag outside the scroll container, then return to their slot via an interruptible damped spring with release velocity; reduced motion returns immediately. Ink-grey at rest, brand colour on hover; black marks invert in dark mode. Logos from Simple Icons (CC0) or existing project assets.
- `sfx.js` — interface sounds synthesized with Web Audio (no files): one capture-phase click listener picks click / open / close / whoosh / toggle / success / pop / drop / step; typing ticks from `wallet.js` and `journey.js`. Silent until the first pointer or key press (autoplay rules). Sounds then stay enabled; the owner removed the mute control and legacy preference on 2026-11-02. Wallet front-card changes trigger a separate soft card-shuffle sound.
- `lightbox.js` — `PHOTOS` data (awards + hackathon), `<dialog>` viewer, photo strip render. `openViewer(items, i, from)` reuses the dialog for project screenshots (`.is-wide` sheet, "Screenshot viewer" label, arrows hidden for a single slide).
- `vista.js` — footer ASCII scene (Cape Engaño lighthouse at night): drawn each frame into a char grid, split into three `<pre>` colour layers (ink, muted, accent). Grid from the footer's free width/height; objects scale with it. ~12fps while on screen, still under reduced motion.
- `stats.js` — cached totals (`site_total_*`), once-per-browser first visits (`site_user_has_visited`, serialized with browser locks), and independent once-per-browser likes (`site_user_has_liked`). Visits increment through the API only; `api/stats.js` also deduplicates using a one-year HttpOnly cookie. Pointer capture starts after an actual drag.
- `contact.js` — `<dialog>` FormSubmit form; exports `openMessage()`.

## 🎨 Styles (`css/`)
`tokens.css` (all colors/type/motion; dark default, `[data-theme="light"]` override) → `base.css` → one file per area, plus `reveal.css`, `journey.css`, `wallet.css`, and `footer.css` (footer + vista, kept apart so redesigns leave it alone; its wordmark uses `--font-mark`, Hedvig). All motion respects `prefers-reduced-motion`.
