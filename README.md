# McLein Jei Onza — Developer Portfolio

A hand-built portfolio for a Computer Science student on the data engineering path. No frameworks, no build step: semantic HTML, CSS custom properties and small ES modules, with a serverless stats proxy on Vercel.

Live Site: [onzamj.vercel.app](https://onzamj.vercel.app/)

---

## ⚡ Tech Stack

- **Core**: Semantic HTML5, CSS3 (tokens, grid, `color-mix`, scroll-snap), vanilla ES modules.
- **Typography**: Geist (display and body), Hedvig Letters Serif (footer wordmark), Geist Mono (code and labels).
- **Theming**: Graphite dark + paper light, synced to the OS until the visitor picks one (`portfolio-theme` in `localStorage`).
- **Contact**: FormSubmit AJAX form in a native `<dialog>`.
- **Stats**: `api/stats.js` (Vercel function) proxies visit/like counts to Abacus, with a direct fallback.

---

## 🚀 Features

1. **Preloader** — a once-per-session row counter that wipes away (with a timeout failsafe).
2. **Kinetic hero** — the name's letters get heavier near the cursor; a swipeable tool carousel includes draggable icons that spring back into place.
3. **Scroll-lit manifesto** — words light up as you scroll.
4. **Pinned work gallery** — vertical scroll drives a horizontal track on desktop; every project has a swipeable screenshot gallery (stacked cards on mobile).
5. **Stack as a schema** — skills shown as database tables; hovering a row "joins" related rows.
6. **Journey timeline** — pinned milestone slides with image cards and scroll transitions.
7. **Stacked award cards** — newest first, with a photo lightbox and a scrollable photo strip.
8. **Details** — contact cards, a GitHub contribution calendar, interface sounds, a draggable stats pill, an animated lighthouse footer and `prefers-reduced-motion` support.

---

## 📁 File Structure

```
├── api/stats.js        # Vercel function: visits & likes proxy (Abacus)
├── assets/
│   ├── fonts/ icons/ Logo/
│   └── images/
│       ├── awards/ trainings/   # recognition & DTI YEP photos
│       └── projects/            # composed project gallery slides
├── css/                # tokens, base, nav, fx, hero, about, work, stack, recognition, contact
├── js/                 # main.js entry + one module per feature
└── index.html
```

---

## 🛠️ Local Development

ES modules need to be served over HTTP (opening the file directly won't load them):

```bash
python3 -m http.server 3000
# or
npx serve .
```

Then open `http://localhost:3000`. The stats pill falls back to Abacus directly when `/api/stats` isn't available locally.

## 🧪 Testing

Playwright end-to-end tests (dev-only; the site itself still has no build step):

```bash
npm install
npx playwright install webkit   # Chrome projects use your installed Google Chrome
npm test                        # desktop Chrome, Pixel 7, iPhone 14 (WebKit)
npm run test:report             # open the HTML report
```

Specs live in `tests/`: page health (console errors, images, overflow, axe WCAG scan), interactions (nav, theme, galleries, lightbox, message form, like, GitHub calendar), phone layout and motion/keyboard behaviour. The first-visit timing check (`tests/timing.spec.mjs`) runs as a separate stage after everything else so parallel tests don't skew it; it's skipped if an earlier test fails. Third-party calls (Abacus, FormSubmit, GitHub contributions) are mocked, so test runs never add visits or likes or send email.

---

## 📄 License & Attribution

© 2026 McLein Jei G. Onza. All rights reserved.
