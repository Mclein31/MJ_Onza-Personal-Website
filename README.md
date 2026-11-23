# McLein Jei Onza — Developer Portfolio

A hand-built portfolio ("Instrument" redesign v5) for a Computer Science student on the data engineering path. No frameworks, no build step: semantic HTML, modular CSS custom properties, self-hosted ES modules, and Vercel serverless proxies.

Live Site: [mcleinjeionza.vercel.app](https://mcleinjeionza.vercel.app/)

---

## ⚡ Tech Stack

- **Core**: Semantic HTML5 (`index.html`, `404.html`), CSS3 (`styles/*.css`), vanilla ES modules (`scripts/main.js`, `scripts/core/`, `scripts/design/`).
- **Vendored libraries (`vendor/`)**: Self-hosted, minified ESM builds of GSAP `3.15.1` (`ScrollTrigger`, `SplitText`, `Flip`, `CustomEase`, `ScrollToPlugin`), Lenis `1.3.27`, and OGL `1.0.11` — zero runtime CDNs.
- **Typography**: Self-hosted Geist (display and body) and Geist Mono (indexes, metadata, tabular figures) in `assets/fonts/`.
- **Theming**: Cool light-grey (`#E9EAEC`) and dark (`#0F1012`) modes synced to `prefers-color-scheme` until toggled (`portfolio-theme` in `localStorage`), revealed via circular View Transition.
- **Contact & Backend**: FormSubmit AJAX form in a native `<dialog>`; Vercel functions `api/stats.js` (Abacus visit/like proxy) and `api/contributions.js` (GitHub contribution calendar with client fallback); `vercel.json` cache headers.

---

## 🚀 Features

1. **Intro loader (`core/intro.js`)** — once-per-session `000–100` column-scan preloader with Skip, `Escape`, 2.5s JS / 2.6s CSS failsafes, and instant bypass under `prefers-reduced-motion`.
2. **Instrument hero (`design/hero.js`)** — spec strip, raw WebGL Extract → Transform → Load particle field (`4,096` desktop / `2,048` touch points) settling onto column hairlines with static SVG fallback, and a 24-tool stack row.
3. **Work spec sheets (`design/work.js`, `core/gallery.js`)** — project index jump table plus one-viewport-per-project blocks with prev/next/tick/swipe/arrow-key screenshot galleries, orange scan-line clip-path wipes, screenshot lightbox (`core/viewer.js`), and promo video dialog (`core/video.js`).
4. **About & Journey (`design/about.js`, `design/journey.js`)** — rising dark ink About band with `SplitText` line-rise heading and `<details>` discipline accordion, followed by a 7-entry vertical-spine Journey log.
5. **Activity & Stack (`core/activity.js`, `design/activity.js`, `design/stack.js`)** — live GitHub contribution grid with streak/day readouts and interactive 5-table database schema join highlighter.
6. **Recognition, Training & Contact (`design/recognition.js`, `core/contact.js`, `core/stats.js`)** — numbered editorial index rows with desktop hover previews, certificate lightbox, single direct email copy (`core/page.js`), inline visit/like counts, 4 channel cards (including a 16-week GitHub mini grid), and standalone `404.html`.

---

## 📁 File Structure

```
├── api/                  # Vercel functions: stats.js (Abacus), contributions.js (GitHub)
├── assets/
│   ├── fonts/            # Self-hosted Geist & Geist Mono WOFF2
│   ├── icons/            # Toolchain SVG/WebP icons
│   ├── images/           # Hero SVG fallbacks, awards/, trainings/, projects/, journey photos
│   ├── Logo/             # Circular favicons & portraits
│   └── video/            # Promo MP4s & posters
├── scripts/
│   ├── main.js           # Isolated core + design boot entry
│   ├── core/             # Behaviour & infrastructure (16 modules: theme, intro, motion, lock, nav, gl, gallery, viewer, video, contact, stats, activity, etc.)
│   └── design/           # Design-layer motion & interactions (index.js + 9 area modules)
├── styles/               # tokens.css, base.css, loader, nav, hero, work, about, journey, activity, stack, recognition, training, contact, footer, dialogs
├── vendor/               # Self-hosted GSAP 3.15.1, Lenis 1.3.27, OGL 1.0.11 + README.md
├── tests/                # Playwright specs (v5-behaviour, v5-audit, contract specs, serve.mjs)
├── index.html
├── 404.html
└── vercel.json
```

---

## 🛠️ Local Development

ES modules need to be served over HTTP (opening `index.html` from disk won't load them):

```bash
npm run serve
# or, with byte-range video support (needed for WebKit tests):
node tests/serve.mjs 3000
```

Then open `http://localhost:3000`. The stats counter falls back to Abacus GET reads when `/api/stats` isn't available locally, and the activity grid falls back to the public contributions endpoint when `/api/contributions` is unavailable.

---

## 🧪 Testing

Playwright end-to-end and layout-audit tooling (dev-only; the site itself has no build step):

```bash
npm install
npx playwright install webkit   # Chrome projects use your installed Google Chrome
npm run test:v5                 # v5 behaviour suite (desktop Chrome, iPhone 14, iPhone Duo folded)
npm run audit:v5                # 13-viewport layout, overflow, axe & reduced-motion audit (incl. iPhone Duo)
npm test                        # retained contract specs (desktop Chrome, Pixel 7, iPhone 14)
npm run test:report             # open the HTML report
```

Third-party calls (Abacus, FormSubmit, GitHub contributions) are mocked via `tests/fixtures.mjs`, so test runs never add visits or likes or send email.

---

## 📄 License & Attribution

© 2026 McLein Jei G. Onza. All rights reserved.
