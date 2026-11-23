---
type: research-brief
title: Redesign v5 build brief ("Instrument", full site)
project: Personal Website
date: 2026-11-23
---

# Redesign v5 build brief: "Instrument", full site

The owner picked **Direction A, "Instrument"** (2026-11-23). Build the whole site in that look.
Read, in this order: `2026-11-22-redesign-v5-brief.md` (owner interview and hard rules, still in force), this file,
`redesign-v5/reports/D-A.md` (the approved prototype: palette, type scale, moments), and look at the prototype itself
in `prototypes/direction-a/` and its screenshots in `redesign-v5/D-A/`. Motion ideas per section:
`2026-11-22-motion-research.md`.

Design skills: Claude workers load `design-taste-frontend`, `impeccable`, `emil-design-eng`, `animate`.
agy workers read the same skills as files: `~/.claude/skills/emil-design-eng/SKILL.md`,
`~/.claude/skills/impeccable/SKILL.md`, `~/.claude/skills/design-taste-frontend/SKILL.md`,
`~/.claude/skills/animate/SKILL.md` (read SKILL.md and follow its rules; skip any tool steps you cannot run).

## 1. Owner feedback on the prototype (2026-11-23, must follow)
- "I like A better, but **minimize the scrolling per project** in Work. **One scroll per project is enough.** Just
  add a **next and prev button** for viewing the different slides." So: no pinned multi-screen figure scroll.
  Each project is one block about one viewport tall; its screenshots change with prev/next buttons (plus swipe on
  touch, arrow keys when focused), never by scrolling the page.
- "**Improve the button hierarchy throughout the website.**" Use the system in section 3 everywhere.
- iPhone Duo must work: folded 466x678, unfolded 626x890 and 890x626 (touch, WebKit).

## 2. Where things live (scaffold made by the orchestrator)
- **Page**: the root `index.html` (moved from the wired skeleton). All content and data hooks are already in it. Each
  worker edits ONLY its own section's markup (and keeps every `data-*` hook, id and ARIA attribute working).
- **Styles**: `styles/tokens.css` and `styles/base.css` (seeded from the prototype), then one file per area, already
  linked from the page head: `loader, nav, hero, work, about, journey, activity, stack, recognition, training,
  contact, footer, dialogs`. Each file header names its owner. Do not edit another owner's file; if you need a
  shared token or component that is missing, use a local fallback and say so in your report.
- **Design motion**: `scripts/design/<area>.js`, each exporting `init()`, run by `scripts/design/index.js` after the
  core modules (`scripts/core/*`, behaviour already done and tested: do not edit core modules; listen to their
  events instead). Libraries: `/vendor/gsap/*`, `/vendor/lenis/*`, `/vendor/ogl/*` (ES modules) or plain WAAPI/CSS.
  `scripts/core/motion.js` exports `gsap`, `ScrollTrigger`, `reducedMotion()`.
- **Tests**: `npm run test:v5` (behaviour, data hooks only, must end fully green) and `npm run audit:v5` (layout:
  overflow, overlap, tap targets, images, axe, reduced motion; 12 viewports including `v5-duo-*`). Serve with
  `node tests/serve.mjs <your port>` and check your section with the Playwright MCP (or a Playwright script).

## 3. Shared components (W1 implements them in `styles/base.css`; everyone uses these exact names now)
**Buttons: one clear hierarchy.** All 2px radius, Geist 500, `gap: 10px`, height 44px (40px allowed at >=1024px
with a fine pointer; never under 44px on touch), visible cobalt focus ring (`outline: 2px solid var(--cobalt);
outline-offset: 2px`), press feedback `transform: scale(0.98)` 100ms, hover transitions 160ms ease-out, no bounce.
| Class | Look | Use for (max per view) |
|---|---|---|
| `.btn.btn--primary` | ink fill, `--bg` text, small orange square marker on the left (`.btn__mark`) | THE main action of a view: hero "See the work", Contact "Send a message", form "Send". One per section at most. |
| `.btn.btn--secondary` | 1px ink outline, transparent | the second action next to a primary: hero "Send a message", "Watch the product video", "Open live site" |
| `.btn.btn--ghost` | text only, underline grows on hover, trailing arrow `.btn__arrow` (→ in-page, ↗ external) | tertiary links: "GitHub ↗", "All certificates", "Retry", footer links |
| `.btn.btn--icon` | 44x44 square (40 on fine pointer), 1px `--rule` border, icon 16px; hover: ink border | gallery prev/next, expand, dialog close, menu |
| `.btn--sm` | 36px tall (fine pointer only), used in the nav | nav "Let's talk" (primary, small) |
| `.seg` | segmented control | theme Light/Dark only |
Disabled: 40% opacity, no pointer events. Never two primaries side by side. Do not invent other button styles.

**Labels and structure**: `.label` (Geist Mono 12px, `--ink-3`, tracking 0.02em), `.rule` (1px `--rule` hairline),
`.section-head` (mono index label `03 / Journey` in the left columns + the H2 in columns 4-12 on desktop, stacked on
phones), `.container` (12-column grid, margin `--m`, gutter `--g`), `.plate` (white screenshot mount with the four
corner ticks from the prototype). Type scale and colours: only the tokens in `styles/tokens.css`. Orange is for
shapes, markers, scan lines and large type only, never body text. Cobalt is rare (focus, one probe).

**Reveal attributes (W1 implements in `scripts/design/reveal.js`; everyone adds them to markup now)**:
`data-reveal="rise"` (line/block rises out of a mask once, ease-out ~600ms), `data-reveal="draw"` (hairline draws
scaleX 0 to 1), `data-reveal="fade"`, `data-reveal-stagger` on a parent (staggers children ~60ms), `data-tick` on a
number (odometer count-up to its text value, Geist Mono tabular), `data-scan` on an image plate (clip-path wipe with
a thin orange scan line riding the edge). Content is visible without JS and under reduced motion (hide only after JS
adds `html.has-reveal`). Section-specific motion beyond these goes in your own `scripts/design/<area>.js`.

## 4. Page rhythm
Light cool-grey page everywhere, except About, which is the dark ink field from the prototype (theme-aware: in dark
mode it becomes a slightly raised panel). Sections open with `.section-head`. Generous vertical rhythm
(`clamp(96px, 12vw, 192px)` between sections on desktop, 72px on phones). Hairline grid columns may show faintly
behind the hero only. One WebGL piece only (the hero field). No pinned sideways scrolling anywhere; no pinned
multi-screen sequences on touch. No page-spanning scroll-drawn line. Nothing slower than it needs to be.

## 5. Each worker
Stay inside your files and your section's markup. Keep all content verbatim (no new claims, no lorem ipsum).
Check 390x844, the three iPhone Duo sizes, 768x1024, 1280x800, 1440x900 and 1920x1080, light and dark, and reduced
motion. Console clean. Report to `redesign-v5/reports/<JOB>.md` (what you built, files, screenshots in
`redesign-v5/<JOB>/`, test results, gaps). Do not commit.
