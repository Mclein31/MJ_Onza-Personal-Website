---
type: research-brief
title: Redesign v5 brief (clean, minimal, cool grey, wow moments)
project: Personal Website
date: 2026-11-22
---

# Redesign v5: shared brief for every worker

The owner wants the **whole site redesigned from scratch**: same content, completely new style. Forget the
current look ("Signal": cream/red bands, giant red numerals, copier, wallet). Do not restyle it; design anew.
Use the skills `design-taste-frontend`, `impeccable` and `emil-design-eng` (and `animate` for motion),
and check your work in a real browser with the Playwright MCP.

## 1. Owner interview (2026-11-22)
| Topic | Owner answer |
|---|---|
| Overall | Clean, minimal, aesthetic. "Hard to minimal rounded corners". |
| Corners | **2px hairline** radius on everything: cards, buttons, images, inputs, chips. No pills, no 8px+ cards. (Circles for true dots/avatars are fine.) |
| Base colour | **Cool light grey** page (around `#E8E9EB`–`#EDEEF0`), white or near-white surfaces, near-black ink. |
| Accents | **International orange** (around `#FF4F00`) as the main pop, used sparingly; a **cobalt** blue as a rare second accent. |
| Type | **Grotesk + mono labels**: Geist (self-hosted variable 100–900, already in `assets/fonts/`) for display and body, Geist Mono for dates, numbers, metadata. Old owner rule still stands: **no thin fonts** (never below 400; display usually 500–650). |
| Theme | **Light + dark** with a toggle; light is the default, follows the OS until the visitor chooses. |
| Wow factor | "Surprise me with scroll animations, motion graphics, transitions, loaders. Research how top personal websites add wow. I want mine unique and to leave an impression." |
| Intensity | **Quiet luxury + 2–3 big moments**: smooth scroll and precise reveals everywhere, plus a few signature set pieces (intro loader, hero, one scroll-driven showpiece). Minimal stays minimal. |
| WebGL | **Yes, one tasteful WebGL piece**, with a static fallback for weak devices, no WebGL support and reduced motion. |
| Phones | **Lighter but still special**: same identity and loader, simpler scroll effects, no pinned sideways scrolling, nothing that fights thumb scrolling. |
| Old features | Nothing is sacred: pinned horizontal Work, pinned Journey, icon carousel, ASCII lighthouse, sounds, stats pill, preloader, wallet and copier may all be replaced by something new. |
| Process | The owner first picks one of **3 directions** from screenshots, then the team builds the full site. |

## 2. Content (must all survive)
Every piece of content on the current site stays: name and intro, the five Work projects (AdvanCare, MedCore,
SERVIO, MedRecord, Mulat Media) with their screenshot galleries and promo videos, About and "What I do", the
Journey years and photos, GitHub activity (live data), Stack, Recognition, Training (with certificate photos),
Contact channels and the message form, SEO metadata and JSON-LD. The source of truth is the current page markup
plus the data arrays in the JS modules; a content inventory is being written to
`2026-11-22-content-inventory.md` in this folder.

Functional pieces that must keep working in the final build: `/api/stats` visits/likes (Abacus), `/api/contributions`
GitHub calendar (with the client fallback), FormSubmit AJAX contact form to `mcleinjeionza06@gmail.com`, the promo
videos, screenshot lightbox, SEO (canonical, OG, JSON-LD, robots, sitemap).

## 3. Hard rules
- **No build step.** Plain `index.html`, CSS files, vanilla ES modules, served over HTTP (Vercel static).
- **Self-host everything.** No Google Fonts, no font or JS CDNs at runtime (GDPR rule). Libraries are vendored as
  local files with their licence. Allowed libraries: GSAP 3 (ScrollTrigger, SplitText, Flip, CustomEase; free for
  commercial use since 2025), Lenis, OGL (or three.js only if OGL cannot do it). Prefer CSS/WAAPI where enough.
- 2px radius, cool light grey base, orange + rare cobalt accents, Geist + Geist Mono, no weights below 400.
- **Motion quality** (Emil Kowalski): purposeful, interruptible, composite-only properties (transform, opacity,
  clip-path, filter sparingly), no layout-thrashing scroll handlers, ease-out for entrances, nothing slower than
  needed, no bounce on UI. Every animation has a `prefers-reduced-motion` path that shows all content.
- **Performance**: 60fps on a laptop; WebGL paused offscreen and when the tab is hidden; DPR capped (≤1.5–2);
  loader never blocks longer than ~2.5s and only plays once per session; LCP content not hidden behind JS forever
  (failsafe timeout).
- **Accessibility**: real headings, focus styles, keyboard reachable, 4.5:1 text contrast (orange on grey fails
  for body text: use it for shapes, large type or with ink text), `aria-hidden` on decorative motion.
- **Responsive**: no horizontal page scroll at any width from 320px to 2560px; check 390×844, 768×1024,
  1280×800, 1440×900, 1920×1080 at least.
- **iPhone Duo is a must (owner, 2026-11-22)**: the layout must look intentional on the owner's foldable
  iPhone Duo in all three postures: folded **466×678**, unfolded portrait **626×890** and unfolded landscape
  **890×626** (touch, WebKit, DPR 3). These are odd in-between sizes: no squashed hero, no pinned sideways scroll
  on touch, nothing cut off in the short 626px landscape height, readable type, 24px+ tap targets. The
  `npm run audit:v5` projects `v5-duo-*` cover them.
- Old owner rules that still apply: no thin fonts; no page-spanning scroll-drawn line/path; highlight boxes never
  cover neighbouring text; no pinpoint location or live clock; one copy action per thing (no duplicates);
  "With High Honors" is not listed in Recognition.
- Do not commit. Do not touch `api/`, `.env*`, `.vercel/` or other projects.

## 4. Verification (everyone)
Serve the repo root with `node tests/serve.mjs <port>` (use the port your job gives you) and use the Playwright
MCP to open the page, take screenshots at desktop and phone sizes, scroll through every animated section,
read the console (no errors), and emulate `prefers-reduced-motion: reduce`. Fix what you see before reporting.

## 5. Reports
Write your report to `.brain/research/redesign-v5/reports/<JOB-ID>.md`: what you built, files touched, how you
verified it (screenshot paths), known gaps. Screenshots go in `.brain/research/redesign-v5/<JOB-ID>/`.
