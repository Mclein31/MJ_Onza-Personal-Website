---
type: content-inventory
title: Redesign v5 — Verbatim Content, Functional Features & Assets Inventory
project: Personal Website
date: 2026-11-22
source: index.html, js/*.js, css/fonts.css, api/*.js, robots.txt, sitemap.xml
---

# Personal Website — Complete Verbatim Content Inventory (v4 / Signal)

Every piece of content, metadata, media, link, script hook, functional behaviour, and asset on the current site (`index.html` and supporting `js/` / `css/` / `api/` modules) in page order.

---

## 0. Head Metadata, SEO, Favicons, Stylesheets & Scripts

### Document & Meta Tags
- **Lang**: `en` (`<html lang="en">`)
- **Charset**: `UTF-8`
- **Viewport**: `width=device-width, initial-scale=1.0, viewport-fit=cover`
- **Title**: `McLein Jei Onza | Developer Portfolio`
- **Meta Description**: `McLein Jei Onza (McLein Onza), a Computer Science student at Cagayan State University, builds full-stack apps and trains in data engineering.`
- **Meta Author**: `McLein Jei Onza`
- **Meta Robots**: `index, follow, max-image-preview:large`
- **Google Site Verification**: `ACf-3Knttm50GvQHKe0-0iF4WPhBt0darbvBvzp-MA8`
- **Theme Color (light)**: `#F2EFE9` (`media="(prefers-color-scheme: light)"`)
- **Theme Color (dark)**: `#0B0B0B` (`media="(prefers-color-scheme: dark)"`)
- **Color Scheme**: `light dark`
- **Canonical Link**: `https://mcleinjeionza.vercel.app/`

### Open Graph & Twitter Cards
- `og:type`: `website`
- `og:locale`: `en_US`
- `og:site_name`: `McLein Jei Onza`
- `og:url`: `https://mcleinjeionza.vercel.app/`
- `og:title`: `McLein Jei Onza | Developer Portfolio`
- `og:description`: `McLein Jei Onza (McLein Onza), a Computer Science student at Cagayan State University, builds full-stack apps and trains in data engineering.`
- `og:image`: `https://mcleinjeionza.vercel.app/assets/images/og-image.jpg` (`1200` × `630`)
- `og:image:alt`: `The McLein Onza portfolio hero: the name in large black type with red dots, the intro line and a row of tool icons`
- `twitter:card`: `summary_large_image`
- `twitter:title`: `McLein Jei Onza | Developer Portfolio`
- `twitter:description`: `McLein Jei Onza (McLein Onza), a Computer Science student at Cagayan State University, builds full-stack apps and trains in data engineering.`
- `twitter:image`: `https://mcleinjeionza.vercel.app/assets/images/og-image.jpg`
- `twitter:image:alt`: `The McLein Onza portfolio hero: the name in large black type with red dots, the intro line and a row of tool icons`

### JSON-LD (`<script type="application/ld+json">`)
`@context`: `https://schema.org`, `@graph` containing 4 nodes:
1. **`WebSite`** (`@id`: `https://mcleinjeionza.vercel.app/#website`):
   - `url`: `https://mcleinjeionza.vercel.app/`
   - `name`: `McLein Jei Onza`
   - `alternateName`: `["McLein Onza", "mcleinjeionza"]`
   - `inLanguage`: `en`
   - `publisher`: `{"@id": "https://mcleinjeionza.vercel.app/#person"}`
2. **`ProfilePage`** (`@id`: `https://mcleinjeionza.vercel.app/#profile`):
   - `url`: `https://mcleinjeionza.vercel.app/`
   - `name`: `McLein Jei Onza | Developer Portfolio`
   - `description`: `McLein Jei Onza (McLein Onza), a Computer Science student at Cagayan State University, builds full-stack apps and trains in data engineering.`
   - `dateModified`: `2026-11-18`
   - `isPartOf`: `{"@id": "https://mcleinjeionza.vercel.app/#website"}`
   - `mainEntity`: `{"@id": "https://mcleinjeionza.vercel.app/#person"}`
   - `hasPart`: `{"@id": "https://mcleinjeionza.vercel.app/#projects"}`
   - `inLanguage`: `en`
3. **`Person`** (`@id`: `https://mcleinjeionza.vercel.app/#person`):
   - `name`: `McLein Jei Onza`
   - `givenName`: `McLein Jei`
   - `familyName`: `Onza`
   - `alternateName`: `["McLein Onza", "mcleinjeionza"]`
   - `url`: `https://mcleinjeionza.vercel.app/`
   - `image`: `https://mcleinjeionza.vercel.app/assets/images/avatar.webp`
   - `description`: `Computer Science student at Cagayan State University building full-stack applications and training in data engineering.`
   - `affiliation`: `EducationalOrganization` — `Cagayan State University`
   - `knowsAbout`: `["Full-stack development", "Data engineering", "Python", "SQL", "PostgreSQL", "TypeScript", "JavaScript", "React", "Cloudflare Workers", "Database schema design", "Drizzle ORM", "AI workflows"]`
   - `sameAs`: `["https://github.com/Mclein31", "https://www.linkedin.com/in/mclein-jei-onza-9b0769322/"]`
   - `mainEntityOfPage`: `{"@id": "https://mcleinjeionza.vercel.app/#profile"}`
4. **`ItemList`** (`@id`: `https://mcleinjeionza.vercel.app/#projects`):
   - `name`: `Selected projects by McLein Jei Onza`
   - `numberOfItems`: `5`
   - Items (`position` 1–5):
     1. `SoftwareApplication`: `AdvanCare` | `HealthApplication` | `Web, Android, iOS` | `Affordable care plans, telehealth, non-emergency transport and caregiver booking for Cagayan barangays: a resident app, a staff console for LGU teams and an AI care assistant.` | `award`: `2nd place, Cagayan Innovation Hack 2026`
     2. `SoftwareApplication`: `MedCore` | `HealthApplication` | `Web, Android, iOS` | `Applies PhilHealth, HMO and senior/PWD deductions in order so cashiers and security see one final balance. A staff dashboard, a patient companion app and an AI concierge.`
     3. `SoftwareApplication`: `SERVIO` | `BusinessApplication` | `Web, Android, iOS` | `Services sold like catalog items: upfront prices, instant technician matching, live on-the-way tracking and in-app escrow. Launching in Tuguegarao City.`
     4. `SoftwareApplication`: `MedRec` | `HealthApplication` | `Web, Android, iOS` | `Upload records, get plain-language AI readings, share them by QR and keep a Medical ID, rebuilt for v2 on a serverless stack.`
     5. `CreativeWork`: `Mulat Media` | `url`: `https://mulat-media.vercel.app/` | `A multi-page publication platform with article submission workflows, category hierarchies and role-based editorial access, backed by Supabase with row-level security.`

### Favicons, Preloads, Stylesheets & Scripts in `<head>`
- Favicons:
  - `assets/Logo/favicon-circle-64.png` (`64x64`, `image/png`)
  - `assets/Logo/favicon-circle-192.png` (`192x192`, `image/png`)
- Inline bootstrap `<script>` before first paint: adds `js` class on `<html>`, reads `localStorage.getItem('portfolio-theme')` + `matchMedia('(prefers-color-scheme: light)')` to set `data-theme="light"`, reads `sessionStorage.getItem('pf-loaded')` to add `no-preload` class.
- Font preload: `assets/fonts/geist-v5-latin.woff2` (`as="font" type="font/woff2" crossorigin`)
- Stylesheets (19 files in load order): `css/fonts.css`, `css/tokens.css`, `css/base.css`, `css/nav.css`, `css/fx.css`, `css/hero.css`, `css/about.css`, `css/work.css`, `css/stack.css`, `css/activity.css`, `css/recognition.css`, `css/contact.css`, `css/journey.css`, `css/wallet.css`, `css/footer.css`, `css/reveal.css`, `css/texture.css`, `css/drawer.css`, `css/copier.css`
- Entry script: `<script type="module" src="js/main.js"></script>`
- Supporting SEO files in repo root:
  - `robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://mcleinjeionza.vercel.app/sitemap.xml`
  - `sitemap.xml`: `<loc>https://mcleinjeionza.vercel.app/</loc>`, `<lastmod>2026-11-18</lastmod>`

---

## 1. Global Chrome, Preloader & Navigation

- **Skip link**: `Skip to content` → `#main`
- **Preloader** (`.preloader`, `aria-hidden="true"`):
  - Name: `McLein Jei Onza`
  - Counter: `[data-count]` initial text `0` (animated `000`–`100`)
- **Custom Cursor** (`.cursor`, `aria-hidden="true"`): `.cursor__ring` > `.cursor__label`, `.cursor__dot` (hidden via CSS in v4)
- **Header Nav** (`header.nav`):
  - Brand link: `McLein` → `#top` (`aria-label="McLein Onza, back to top"`)
  - Primary `<nav class="nav__links" aria-label="Primary">` (plus `.nav__pill` indicator):
    - `Work` → `#work`
    - `About` → `#about`
    - `Journey` → `#journey`
    - `Stack` → `#stack`
    - `Recognition` → `#recognition`
    - `Contact` → `#contact`
  - Actions:
    - Theme toggle `<button data-theme-toggle aria-label="Toggle light and dark theme">`
    - CTA `<button data-message-open>`: `Let’s talk`
    - Mobile menu button `<button data-menu-toggle aria-label="Open menu" aria-expanded="false" aria-controls="menu">`
- **Mobile Menu Drawer** (`#menu`, `aria-hidden="true"`):
  - `Work` → `#work`
  - `About` → `#about`
  - `Journey` → `#journey`
  - `Stack` → `#stack`
  - `Recognition` → `#recognition`
  - `Contact` → `#contact`

---

## 2. Main Sections (`<main id="main">`) in Page Order

### Section 0: Hero
- **Anchor / ID**: `#top` (`aria-label="Introduction"`)
- **Script hooks / attributes**: `canvas[data-hero-ink]` (`aria-hidden="true"`), `[data-message-open]`, `[data-icon-field]` (`tabindex="0" role="region" aria-label="Tools and technologies, scroll to explore"`)
- **Kicker**: `McLein Jei Onza · CS, Cagayan State University`
- **Heading (`<h1>`, `aria-label="McLein Jei Onza"`)**:
  - Line 1: `McLeın` (styled `McLe<span class="hero__i">ı</span>n`)
  - Line 2: `Onza.`
- **Body Copy**: `I build full-stack apps and train in data engineering.`
- **Links / Actions**:
  - `See the work` → `#work`
  - `Send a message` (`button[data-message-open]`)
- **Tool Icon Carousel (`js/icons.js` `ICONS`, rendered into `[data-icon-field]`)**:
  All 24 items (`img.src = assets/icons/<file>`, `img.alt = label`, `li.title = label`; `mono = true` adds `.tech-icon--mono`):
  1. `assets/icons/python-icon.webp` — `Python`
  2. `assets/icons/postgres-icon.webp` — `PostgreSQL`
  3. `assets/icons/sqlite.svg` — `SQLite`
  4. `assets/icons/neon.svg` — `Neon`
  5. `assets/icons/supabase.svg` — `Supabase`
  6. `assets/icons/drizzle.svg` — `Drizzle`
  7. `assets/icons/typescript-icon.webp` — `TypeScript`
  8. `assets/icons/javascript-icon.webp` — `JavaScript`
  9. `assets/icons/react.svg` — `React`
  10. `assets/icons/angular.svg` — `Angular`
  11. `assets/icons/ionic.svg` — `Ionic`
  12. `assets/icons/capacitor.svg` — `Capacitor`
  13. `assets/icons/expo.svg` — `Expo` (`mono: true`)
  14. `assets/icons/nodejs.svg` — `Node.js`
  15. `assets/icons/hono.svg` — `Hono`
  16. `assets/icons/cloudflare.svg` — `Cloudflare`
  17. `assets/icons/vercel.svg` — `Vercel` (`mono: true`)
  18. `assets/icons/git-icon.webp` — `Git`
  19. `assets/icons/github-icon.webp` — `GitHub`
  20. `assets/icons/vscode-icon.webp` — `VS Code`
  21. `assets/icons/cursor.webp` — `Cursor`
  22. `assets/icons/claude-ai-icon.svg` — `Claude`
  23. `assets/icons/gemini.svg` — `Gemini`
  24. `assets/icons/ollama.webp` — `Ollama`

---

### Section 1: Work
- **Anchor / ID**: `#work` (`aria-label="Selected work"`)
- **Section Label**: `01 / WORK`
- **Heading (`<h2>`, `data-scrub`)**: `Things I’ve built.`
- **Counter**: `[data-work-count]` initial text `01 / 05`
- **Script hooks / attributes**: `[data-work-pin]`, `[data-work-track]`, `[data-work-count]`, `[data-gallery]`, `[data-gallery-track]`, `[data-gallery-zoom]`, `[data-gallery-prev]`, `[data-gallery-dots]`, `[data-gallery-next]`, `[data-video-open]`, `[data-video-poster]`, `[data-video-title]`, `[data-cursor="GitHub"]`

#### Project 01: AdvanCare
- **Numeral / Figure**: `01` / `FIG. 01 / ADVANCARE`
- **Award badge**: `2nd place, Cagayan Innovation Hack 2026`
- **Heading (`<h3>`)**: `AdvanCare`
- **Body Copy**: `Affordable care plans, telehealth, non-emergency transport and caregiver booking for Cagayan barangays: a resident app, a staff console for LGU teams and an AI care assistant.`
- **Promo Video Button**: `Watch the product video` (`0:30`, `<span class="sr-only">, 30 seconds</span>`)
  - `data-video-open`: `assets/video/advancare-promo.mp4`
  - `data-video-poster`: `assets/video/advancare-promo-poster.webp`
  - `data-video-title`: `AdvanCare`
- **Tech Stack List (`aria-label="Built with"`)**:
  - `React`, `Capacitor`, `Hono on Workers`, `Neon Postgres`, `Drizzle`, `Gemini assistant`
- **Gallery (`aria-label="AdvanCare screenshots"`)**:
  - Zoom button `aria-label`: `View AdvanCare screenshots larger`
  - Prev button `aria-label`: `Previous screenshot of AdvanCare`
  - Next button `aria-label`: `Next screenshot of AdvanCare`
  - Slide 1:
    - `src`: `assets/images/projects/advancare-1-2400.webp`
    - `srcset`: `assets/images/projects/advancare-1-1600.webp 1600w, assets/images/projects/advancare-1-2400.webp 2400w, assets/images/projects/advancare-1-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `AdvanCare: staff console overview and resident app`
    - `data-title`: `Staff console and resident app`
    - `data-desc`: `The LGU overview counts who is waiting for a caregiver, what is in progress, escalated and billed. Beside it, the resident app.`
  - Slide 2:
    - `src`: `assets/images/projects/advancare-2-2400.webp`
    - `srcset`: `assets/images/projects/advancare-2-1600.webp 1600w, assets/images/projects/advancare-2-2400.webp 2400w, assets/images/projects/advancare-2-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `AdvanCare: services, telehealth booking and doctor choice`
    - `data-title`: `Book a doctor from home`
    - `data-desc`: `Residents pick a service, choose a day and time, and book any available telehealth doctor in Cagayan.`
  - Slide 3:
    - `src`: `assets/images/projects/advancare-3-2400.webp`
    - `srcset`: `assets/images/projects/advancare-3-1600.webp 1600w, assets/images/projects/advancare-3-2400.webp 2400w, assets/images/projects/advancare-3-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `AdvanCare: RHU services, triage and prescription refill`
    - `data-title`: `RHU visits, triage and prescriptions`
    - `data-desc`: `Request a Rural Health Unit visit, describe symptoms for clinician triage, or refill a prescription.`
  - Slide 4:
    - `src`: `assets/images/projects/advancare-4-2400.webp`
    - `srcset`: `assets/images/projects/advancare-4-1600.webp 1600w, assets/images/projects/advancare-4-2400.webp 2400w, assets/images/projects/advancare-4-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `AdvanCare: transport, pharmacy and assistant`
    - `data-title`: `Transport, medicines and help`
    - `data-desc`: `Book non-emergency transport to CVMC, order medicines at member prices and ask the care assistant.`
  - Slide 5:
    - `src`: `assets/images/projects/advancare-5-2400.webp`
    - `srcset`: `assets/images/projects/advancare-5-1600.webp 1600w, assets/images/projects/advancare-5-2400.webp 2400w, assets/images/projects/advancare-5-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `AdvanCare: service request queue and triage form`
    - `data-title`: `Requests reach the staff queue`
    - `data-desc`: `A resident’s triage request lands in the service request queue with who asked, when, and who is assigned.`
  - Slide 6:
    - `src`: `assets/images/projects/advancare-6-2400.webp`
    - `srcset`: `assets/images/projects/advancare-6-1600.webp 1600w, assets/images/projects/advancare-6-2400.webp 2400w, assets/images/projects/advancare-6-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `AdvanCare: caregiver shifts board`
    - `data-title`: `Shifts board`
    - `data-desc`: `Caregiver shifts for the day, from needing a caregiver to confirmed, in progress and completed, with clock-in times.`
  - Slide 7 (Video):
    - `src`: `assets/video/advancare-promo.mp4`
    - `poster`: `assets/video/advancare-promo-poster.webp`
    - `data-video-title`: `AdvanCare`
    - `aria-label`: `AdvanCare promo video, 30 seconds, with voiceover`

#### Project 02: MedCore
- **Numeral / Figure**: `02` / `FIG. 02 / MEDCORE`
- **Heading (`<h3>`)**: `MedCore`
- **Body Copy**: `Applies PhilHealth, HMO and senior/PWD deductions in order so cashiers and security see one final balance. A staff dashboard, a patient companion app and an AI concierge.`
- **Promo Video Button**: `Watch the product video` (`0:32`, `<span class="sr-only">, 32 seconds</span>`)
  - `data-video-open`: `assets/video/medcore-promo.mp4`
  - `data-video-poster`: `assets/video/medcore-promo-poster.webp`
  - `data-video-title`: `MedCore`
- **Tech Stack List (`aria-label="Built with"`)**:
  - `Vercel dashboard`, `Expo`, `Hono on Workers`, `Neon Postgres`
- **Gallery (`aria-label="MedCore screenshots"`)**:
  - Zoom button `aria-label`: `View MedCore screenshots larger`
  - Prev button `aria-label`: `Previous screenshot of MedCore`
  - Next button `aria-label`: `Next screenshot of MedCore`
  - Slide 1:
    - `src`: `assets/images/projects/medcore-1-2400.webp`
    - `srcset`: `assets/images/projects/medcore-1-1600.webp 1600w, assets/images/projects/medcore-1-2400.webp 2400w, assets/images/projects/medcore-1-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `MedCore: hospital overview dashboard and patient app home`
    - `data-title`: `Hospital dashboard and patient app`
    - `data-desc`: `Billing staff see discharge holds, pending HMO authorizations, bed census and receivables at a glance. The patient sees the balance left after coverage.`
  - Slide 2:
    - `src`: `assets/images/projects/medcore-2-2400.webp`
    - `srcset`: `assets/images/projects/medcore-2-1600.webp 1600w, assets/images/projects/medcore-2-2400.webp 2400w, assets/images/projects/medcore-2-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `MedCore: discharge clearance board`
    - `data-title`: `Discharge clearance`
    - `data-desc`: `Every discharge moves through six stages, from the doctor’s order to the gate pass, with the current blocker and the time elapsed against the 45-minute target.`
  - Slide 3:
    - `src`: `assets/images/projects/medcore-3-2400.webp`
    - `srcset`: `assets/images/projects/medcore-3-1600.webp 1600w, assets/images/projects/medcore-3-2400.webp 2400w, assets/images/projects/medcore-3-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `MedCore: encounter ledger and patient bill breakdown`
    - `data-title`: `One bill, every deduction in order`
    - `data-desc`: `Staff see each charge and how VAT exemption, senior or PWD discount, PhilHealth and HMO are applied. The patient sees the same breakdown on their phone.`
  - Slide 4:
    - `src`: `assets/images/projects/medcore-4-2400.webp`
    - `srcset`: `assets/images/projects/medcore-4-1600.webp 1600w, assets/images/projects/medcore-4-2400.webp 2400w, assets/images/projects/medcore-4-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `MedCore: patient bill, Cora AI explanation and coverage`
    - `data-title`: `A bill patients can understand`
    - `data-desc`: `Patients check their bill and coverage, and Cora AI explains the balance in Taglish, English, Tagalog or Ilokano.`
  - Slide 5:
    - `src`: `assets/images/projects/medcore-5-2400.webp`
    - `srcset`: `assets/images/projects/medcore-5-1600.webp 1600w, assets/images/projects/medcore-5-2400.webp 2400w, assets/images/projects/medcore-5-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `MedCore: claims scrubber and patient payment`
    - `data-title`: `Claims checked before they are filed`
    - `data-desc`: `A pre-flight scrubber checks PhilHealth claims before submission. Patients can settle the balance in full or in part from the app.`
  - Slide 6:
    - `src`: `assets/images/projects/medcore-6-2400.webp`
    - `srcset`: `assets/images/projects/medcore-6-1600.webp 1600w, assets/images/projects/medcore-6-2400.webp 2400w, assets/images/projects/medcore-6-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `MedCore: revenue cycle analytics dashboard`
    - `data-title`: `Revenue cycle analytics`
    - `data-desc`: `Average discharge time, trapped capital and the main bottleneck, with an AI briefing on what to fix first.`
  - Slide 7 (Video):
    - `src`: `assets/video/medcore-promo.mp4`
    - `poster`: `assets/video/medcore-promo-poster.webp`
    - `data-video-title`: `MedCore`
    - `aria-label`: `MedCore promo video, 32 seconds, with voiceover`

#### Project 03: SERVIO
- **Numeral / Figure**: `03` / `FIG. 03 / SERVIO`
- **Heading (`<h3>`)**: `SERVIO`
- **Body Copy**: `Services sold like catalog items: upfront prices, instant technician matching, live on-the-way tracking and in-app escrow. Launching in Tuguegarao City.`
- **Promo Video Button**: `Watch the product video` (`0:39`, `<span class="sr-only">, 39 seconds</span>`)
  - `data-video-open`: `assets/video/servio-promo.mp4`
  - `data-video-poster`: `assets/video/servio-promo-poster.webp`
  - `data-video-title`: `SERVIO`
- **Tech Stack List (`aria-label="Built with"`)**:
  - `Ionic`, `Angular`, `Capacitor`, `Hono on Workers`, `Drizzle`, `Postgres`, `Durable Objects`
- **Gallery (`aria-label="SERVIO screenshots"`)**:
  - Zoom button `aria-label`: `View SERVIO screenshots larger`
  - Prev button `aria-label`: `Previous screenshot of SERVIO`
  - Next button `aria-label`: `Next screenshot of SERVIO`
  - Slide 1:
    - `src`: `assets/images/projects/servio-1-2400.webp`
    - `srcset`: `assets/images/projects/servio-1-1600.webp 1600w, assets/images/projects/servio-1-2400.webp 2400w, assets/images/projects/servio-1-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `SERVIO: home, live tracking map and chat`
    - `data-title`: `Home and live tracking`
    - `data-desc`: `Book a verified helper, then follow them on a real street map of Tuguegarao from accepted to arrived, and message them in the app.`
  - Slide 2:
    - `src`: `assets/images/projects/servio-2-2400.webp`
    - `srcset`: `assets/images/projects/servio-2-1600.webp 1600w, assets/images/projects/servio-2-2400.webp 2400w, assets/images/projects/servio-2-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `SERVIO: helper profile, checkout and add-on approval`
    - `data-title`: `Verified pros, upfront prices`
    - `data-desc`: `Profiles show NBI clearance and TESDA credentials. Checkout shows the fixed price held in escrow, and any extra part needs your approval with photo evidence.`
  - Slide 3:
    - `src`: `assets/images/projects/servio-3-2400.webp`
    - `srcset`: `assets/images/projects/servio-3-1600.webp 1600w, assets/images/projects/servio-3-2400.webp 2400w, assets/images/projects/servio-3-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `SERVIO: completion PIN and review`
    - `data-title`: `Paid only when the job is done`
    - `data-desc`: `Escrow is released only when you share your completion PIN after inspecting the work. Then rate the helper and leave a tip.`
  - Slide 4:
    - `src`: `assets/images/projects/servio-4-2400.webp`
    - `srcset`: `assets/images/projects/servio-4-1600.webp 1600w, assets/images/projects/servio-4-2400.webp 2400w, assets/images/projects/servio-4-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `SERVIO: bulletin, directory and profile`
    - `data-title`: `Neighbors helping neighbors`
    - `data-desc`: `Neighbors post requests to the bulletin, browse helpers by skill and offer their own services at clear rates.`
  - Slide 5 (Video):
    - `src`: `assets/video/servio-promo.mp4`
    - `poster`: `assets/video/servio-promo-poster.webp`
    - `data-video-title`: `SERVIO`
    - `aria-label`: `SERVIO promo video, 39 seconds, with voiceover`

#### Project 04: MedRec
- **Numeral / Figure**: `04` / `FIG. 04 / MEDREC`
- **Heading (`<h3>`)**: `MedRec`
- **Body Copy**: `Upload records, get plain-language AI readings, share them by QR and keep a Medical ID, rebuilt for v2 on a serverless stack.`
- **Promo Video Button**: `Watch the product video` (`0:30`, `<span class="sr-only">, 30 seconds</span>`)
  - `data-video-open`: `assets/video/medrec-promo.mp4`
  - `data-video-poster`: `assets/video/medrec-promo-poster.webp`
  - `data-video-title`: `MedRec`
- **Tech Stack List (`aria-label="Built with"`)**:
  - `Expo`, `Cloudflare Workers`, `Neon Postgres`, `R2 storage`, `Gemini`
- **Gallery (`aria-label="MedRec screenshots"`)**:
  - Zoom button `aria-label`: `View MedRec screenshots larger`
  - Prev button `aria-label`: `Previous screenshot of MedRec`
  - Next button `aria-label`: `Next screenshot of MedRec`
  - Slide 1:
    - `src`: `assets/images/projects/medrec-1.webp` (no `srcset`/`sizes`, `2000×1125`)
    - `alt`: `MedRec: Medical ID, records list and a QR share pass`
    - `data-title`: `Medical ID, records and a share pass`
    - `data-desc`: `The Medical ID keeps blood type, allergies, conditions and an emergency contact. Records list newest first, and a timed QR pass shares only the records you pick.`
  - Slide 2:
    - `src`: `assets/images/projects/medrec-2.webp` (no `srcset`/`sizes`, `2000×1125`)
    - `alt`: `MedRec: Ask Remy finding a blood test, and a plain-language health summary`
    - `data-title`: `Ask Remy and a health summary`
    - `data-desc`: `Ask Remy finds records in plain language, here the latest blood test. The health summary turns conditions, medications and recent results into one short page.`
  - Slide 3:
    - `src`: `assets/images/projects/medrec-3.webp` (no `srcset`/`sizes`, `2000×1125`)
    - `alt`: `MedRec: Sharing with a doctor, and profile settings`
    - `data-title`: `Sharing and profile`
    - `data-desc`: `Pick records, set a time limit and send a link; active and past shares stay listed. The profile holds health details, privacy settings and record exports.`
  - Slide 4 (Video):
    - `src`: `assets/video/medrec-promo.mp4`
    - `poster`: `assets/video/medrec-promo-poster.webp`
    - `data-video-title`: `MedRec`
    - `aria-label`: `MedRec promo video, 30 seconds`

#### Project 05: Mulat Media
- **Numeral / Figure**: `05` / `FIG. 05 / MULAT MEDIA`
- **Heading (`<h3>`)**: `Mulat Media`
- **Body Copy**: `A multi-page publication platform with article submission workflows, category hierarchies and role-based editorial access, backed by Supabase with row-level security.`
- **Link**: `mulat-media.vercel.app` → `https://mulat-media.vercel.app/` (`target="_blank" rel="noopener noreferrer"`)
- **Tech Stack List (`aria-label="Built with"`)**:
  - `HTML / CSS / JS`, `Supabase Postgres`, `Auth + RLS`, `Storage`
- **Gallery (`aria-label="Mulat Media screenshots"`)**:
  - Zoom button `aria-label`: `View Mulat Media screenshots larger`
  - Prev button `aria-label`: `Previous screenshot of Mulat Media`
  - Next button `aria-label`: `Next screenshot of Mulat Media`
  - Slide 1:
    - `src`: `assets/images/projects/mulat-1-2400.webp`
    - `srcset`: `assets/images/projects/mulat-1-1600.webp 1600w, assets/images/projects/mulat-1-2400.webp 2400w, assets/images/projects/mulat-1-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `Mulat Media: front page on laptop, tablet and phone`
    - `data-title`: `Front page on every screen`
    - `data-desc`: `The student newsroom front page on laptop, tablet and phone: masthead, featured story and newsroom photo, laid out for each screen.`
  - Slide 2:
    - `src`: `assets/images/projects/mulat-2-2400.webp`
    - `srcset`: `assets/images/projects/mulat-2-1600.webp 1600w, assets/images/projects/mulat-2-2400.webp 2400w, assets/images/projects/mulat-2-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `Mulat Media: members directory on laptop and About page on phone`
    - `data-title`: `The people behind each issue`
    - `data-desc`: `The members directory introduces every writer, editor and photographer. On phones, the About page tells how the newsroom started.`
  - Slide 3:
    - `src`: `assets/images/projects/mulat-3-2400.webp`
    - `srcset`: `assets/images/projects/mulat-3-1600.webp 1600w, assets/images/projects/mulat-3-2400.webp 2400w, assets/images/projects/mulat-3-3200.webp 3200w`
    - `sizes`: `(max-width: 860px) 100vw, 1180px` (`3200×1800`)
    - `alt`: `Mulat Media: article sections on laptop and phone`
    - `data-title`: `Every story, by category`
    - `data-desc`: `Articles are grouped into six sections, from opinion and news to sports and campus press, with a newsroom login for publishing.`

#### Work End Card
- **Link (`a.project.project--more`, `data-cursor="GitHub"`)**: `More on GitHub` / `github.com/Mclein31` → `https://github.com/Mclein31?tab=repositories` (`target="_blank" rel="noopener noreferrer"`)

---

### Section 2: About
- **Anchor / ID**: `#about`
- **Eyebrow**: `02 / ABOUT`
- **Heading (`<h2>`, `data-scrub`)**: `Student first, builder always, now learning how data flows.` (`how data flows.` wrapped in `<span class="hl">`)
- **Script hooks / attributes**: `[data-scrub]`, `[data-rise="kids"]`, `[data-countup="7"]`, `[data-does]`
- **Body Copy (`[data-rise="kids"]`)**:
  - `I’m McLein Jei Onza, a CS student at Cagayan State University, headed for data engineering.`
  - `I write Python, model tables in PostgreSQL and ship apps people use. Have an opening? Let’s talk.`
    - Link: `Let’s talk` → `#contact`
- **Facts Definition List (`<dl class="facts" aria-label="Profile">`)**:
  - `Program`: `BS Computer Science, 2024 to 2028`
  - `Shipped`: `7+ projects` (`7` has `data-countup="7"`)
  - `Off the clock`: `Tennis and a long manhwa list`
- **"What I do." Accordion (`[data-does]`)**:
  - Header: `What I do.` | `03 DISCIPLINES`
  - Disciplines list (`<ol aria-label="Disciplines">`):
    1. `01` `Build`
    2. `02` `Model`
    3. `03` `Automate`
  - Row 1 (`is-open` by default, `aria-expanded="true"`, `aria-controls="does-build"`):
    - `01` · `Build` · `Full-stack · Mobile · APIs · Deploys`
    - Panel `#does-build` (`role="region" aria-label="Build"`):
      - `Full-stack web apps`
      - `Mobile apps with Expo and Capacitor`
      - `APIs with Hono on Workers`
      - `Deploys on Vercel and Cloudflare`
      - Decorative numeral: `01`
  - Row 2 (`aria-expanded="false"`, `aria-controls="does-model"`):
    - `02` · `Model` · `Schemas · SQL · PostgreSQL`
    - Panel `#does-model` (`role="region" aria-label="Model"`):
      - `Schema design and normalization`
      - `PostgreSQL, Neon and SQLite`
      - `SQL queries and migrations with Drizzle`
      - `Row-level security on Supabase`
      - Decorative numeral: `02`
  - Row 3 (`aria-expanded="false"`, `aria-controls="does-automate"`):
    - `03` · `Automate` · `Python · OCR · AI workflows`
    - Panel `#does-automate` (`role="region" aria-label="Automate"`):
      - `Python scripting and automation`
      - `OCR extraction`
      - `Claude and OpenAI APIs`
      - `Local LLMs with Ollama and agentic workflows`
      - Decorative numeral: `03`

---

### Section 3: Journey
- **Anchor / ID**: `#journey`
- **Eyebrow**: `03 / JOURNEY`
- **Heading (`<h2>`, `data-scrub`)**: `Journey so far.`
- **Subcopy**: `From first lines of code to shipping full-stack platforms.`
- **Script hooks / attributes**: `[data-years]` (`style="--n:7"`), `data-yr-bg` on each `<li class="yr">`, `[data-yr-i]` (`YEAR 01 / 07`)
- **Slides (`<ol class="container years__list">`, 7 items)**:
  1. **Slide 1 (`--k:0`, `data-yr-bg="2022"`)**:
     - Year / Place / Line: `2022.` / `Self-taught.` / `Started coding.`
     - Image: `assets/images/journey-first-code.webp` (`1600×1143`) — `alt`: `Laptop in the dark running VS Code with HTML and CSS files side by side`
     - Heading (`<h3>`): `Where the interest began`
     - Copy: `Gained an interest in programming, starting with HTML and CSS tutorials late at night and building small pages from scratch.`
  2. **Slide 2 (`--k:1`, `data-yr-bg="2024"`)**:
     - Year / Place / Line: `2024.` / `Carig Campus.` / `BS Computer Science.`
     - Image: `assets/images/journey-portrait.webp` (`1536×1024`) — `alt`: `McLein Jei Onza in a black shirt taking a mirror photo`
     - Heading (`<h3>`): `Cagayan State University, Tuguegarao City`
     - Copy: `Data structures and algorithms, object-oriented programming in Java and Python, database systems, operating systems and software engineering. Expected 2028.`
  3. **Slide 3 (`--k:2`, `data-yr-bg="2026"`)**:
     - Year / Place / Line: `2026.` / `Solana, Cagayan.` / `Pitch Perfect.`
     - Image: `assets/images/trainings/dti-yep-pitch-medcore.webp` (`1800×1012`) — `alt`: `Pitching MedCore at the DTI Youth Entrepreneurship Program`
     - Heading (`<h3>`): `DTI Youth Entrepreneurship Program`
     - Copy: `Three days on business models and pitching. Our live pitch of MedCore won Pitch Perfect and the Silent Billionaire recognition.`
  4. **Slide 4 (`--k:3`, `data-yr-bg="2026"`)**:
     - Year / Place / Line: `2026.` / `On my own.` / `First sites shipped.`
     - Image: `assets/images/projects/mulat-1-1600.webp` (`1600×900`) — `alt`: `Mulat Media on laptop, tablet and phone`
     - Heading (`<h3>`): `Independent full-stack work`
     - Copy: `Shipped Mulat Media, a publication platform with editorial roles on Supabase, and Hanguk Grill.`
  5. **Slide 5 (`--k:4`, `data-yr-bg="2026"`)**:
     - Year / Place / Line: `2026.` / `Tuguegarao City, Cagayan.` / `2nd place.`
     - Image: `assets/images/awards/cih-2026-check.webp` (`1600×900`) — `alt`: `Holding the 2nd place prize check at Cagayan Innovation Hack 2026`
     - Heading (`<h3>`): `Cagayan Innovation Hack 2026`
     - Copy: `AdvanCare placed second at the Final Pitch and took home ₱10,000. I built the software side: the resident app, staff console, website and API.`
  6. **Slide 6 (`--k:5`, `data-yr-bg="NOW"`)**:
     - Year / Place / Line: `Now.` / `Full-stack.` / `Four platforms.`
     - Image: `assets/images/projects/advancare-1-1600.webp` (`1600×900`) — `alt`: `AdvanCare staff console and resident app`
     - Heading (`<h3>`): `AdvanCare, MedCore, SERVIO, MedRec`
     - Copy: `Community healthcare, hospital billing, local services and personal health records: apps, staff consoles and APIs on Workers and Postgres.`
  7. **Slide 7 (`--k:6`, `data-yr-bg="NEXT"`)**:
     - Year / Place / Line: `Next.` / `An internship.` / `Data engineering.`
     - Image: `assets/images/journey-workspace.webp` (`1600×900`) — `alt`: `My desk with MedCore code, a mobile app simulator and the staff dashboard on screen`
     - Heading (`<h3>`): `Looking for my first data role`
     - Copy: `An internship where I can work on real pipelines: SQL and PostgreSQL first, Python for data, then ETL and orchestration.`
     - Link: `Get in touch` → `#contact`

---

### Section 4: GitHub Activity
- **Anchor / ID**: `#activity` (`aria-label="GitHub activity"`)
- **Eyebrow**: `04 / ACTIVITY · GITHUB`
- **Heading (`<h2>`, `data-scrub`)**: `A year of shipping, one square at a time.`
- **Script hooks / attributes**: `[data-activity]`, `[data-rise]`, `[data-act-scroll]`, `[data-act-cal]` (`role="img" aria-label="GitHub contribution calendar, loading"`), `[data-cursor="GitHub"]`, `[data-act-tip]` (`role="status" aria-live="polite"`), `[data-act-stats]`, `[data-rise="kids"]`, `[data-hl]`, `[data-act]`
- **Footer / Legend**:
  - Link: `github.com/Mclein31` → `https://github.com/Mclein31` (`target="_blank" rel="noopener noreferrer"`)
  - Legend (`aria-hidden="true"`): `less` `[data-l="0..4"]` `more`
  - Error fallback string (injected by `js/activity.js`): `Couldn’t reach GitHub. Open on GitHub ↗` → `https://github.com/Mclein31`
- **Interactive Stat Buttons (`[data-act-stats]`)**:
  1. `Total` (`data-hl="active"`, `aria-pressed="false"`): `<b data-act="total">0</b>` `contributions`
  2. `Active days` (`data-hl="active"`, `aria-pressed="false"`): `<b data-act="days">0</b>` `<span data-act="daysNote">days with a push</span>`
  3. `Longest streak` (`data-hl="streak"`, `aria-pressed="false"`): `<b data-act="streak">0</b>` `<span data-act="streakNote">days in a row</span>`
  4. `Best day` (`data-hl="best"`, `aria-pressed="false"`): `<b data-act="best">0</b>` `<span data-act="bestNote">contributions</span>`

---

### Section 5: Stack
- **Anchor / ID**: `#stack`
- **Eyebrow**: `05 / STACK`
- **Heading (`<h2>`, `data-scrub`)**: `Five tables, one schema.`
- **Subcopy**: `Point at a row to see what it joins across the stack.`
- **Script hooks / attributes**: `[data-schema]`, `[data-rise="kids"]`, `.row[data-n][data-join]`
- **Schema Tables (5 tables)**:
  1. **`python_scripting`** (`PK`):
     - `1`: `Python 3` — `lang` (`data-join="data py"`)
     - `2`: `Algorithms` — `core` (`data-join="cs"`)
     - `3`: `OCR extraction` — `data` (`data-join="data py"`)
     - `4`: `OOP & logic` — `core` (`data-join="cs"`)
     - `5`: `Automation` — `data` (`data-join="data py ai"`)
  2. **`sql_databases`** (`PK`):
     - `1`: `PostgreSQL` — `db` (`data-join="data db"`)
     - `2`: `SQL queries` — `db` (`data-join="data db"`)
     - `3`: `SQLite` — `db` (`data-join="db"`)
     - `4`: `Schema design` — `model` (`data-join="data db cs"`)
     - `5`: `Normalization` — `model` (`data-join="data db cs"`)
  3. **`web_fullstack`** (`PK`):
     - `1`: `JavaScript (ES6+)` — `lang` (`data-join="web"`)
     - `2`: `HTML5 / CSS3` — `web` (`data-join="web"`)
     - `3`: `CSS custom tokens` — `web` (`data-join="web"`)
     - `4`: `Responsive UI/UX` — `web` (`data-join="web"`)
     - `5`: `Vercel` — `deploy` (`data-join="web ship"`)
  4. **`ai_workflows`** (`PK`):
     - `1`: `Google Antigravity` — `agent` (`data-join="ai"`)
     - `2`: `Local LLMs (Ollama)` — `model` (`data-join="ai py"`)
     - `3`: `Claude & OpenAI APIs` — `api` (`data-join="ai web"`)
     - `4`: `Agentic workflows` — `agent` (`data-join="ai ship"`)
     - `5`: `Prompt engineering` — `craft` (`data-join="ai"`)
  5. **`toolchain`** (`PK`):
     - `1`: `Git & GitHub` — `vcs` (`data-join="ship"`)
     - `2`: `VS Code / Cursor` — `editor` (`data-join="ship ai"`)
     - `3`: `Unix terminal` — `shell` (`data-join="ship py"`)
     - `4`: `Browser DevTools` — `debug` (`data-join="web"`)

---

### Section 6: Recognition
- **Anchor / ID**: `#recognition`
- **Eyebrow**: `06 / RECOGNITION`
- **Heading (`<h2>`, `data-scrub`)**: `Recognition along the way.`
- **Script hooks / attributes**: `[data-index][data-awards][data-rise]` (`style="--n:5"`, `role="group" aria-label="Recognition"`), `[data-idx-row]`, `[data-idx-panel]`, `[data-lb]`, `[data-cursor="View"]`, `[data-strip]`
- **Editorial Index Rows (4 items in DOM — note IDs jump from `rec-row-2` to `rec-row-4` because "With High Honors" was omitted per owner rule)**:
  1. **Row `01` (`#rec-row-0` → `#rec-file-0`, `is-active`, `aria-current="true"`, `aria-expanded="true"`, `data-lb="6"`)**:
     - Date / Title / Sub: `Oct 2026` · `CIH 2026 · 2nd place` · `Hackathon`
     - Button `aria-label`: `View photo: Cagayan Innovation Hack 2026, 2nd place` (`VIEW PHOTO ↗`)
     - Image: `assets/images/awards/cih-2026-check.webp` (`1600×900`) — `alt`: `Holding the 2nd place prize check at Cagayan Innovation Hack 2026`
     - Panel `<h3>`: `2nd place, Cagayan Innovation Hack 2026`
     - Copy: `Our team placed second at the Final Pitch with AdvanCare, an AI-enabled healthcare platform for grassroots communities, and took home ₱10,000. I built the software side: the resident app, staff console, website and API.`
     - Meta: `iHub Innovation Hub, Final Pitch` · `Oct 19, 2026`
  2. **Row `02` (`#rec-row-1` → `#rec-file-1`, `data-lb="1"`)**:
     - Date / Title / Sub: `May 2026` · `Pitch Perfect` · `Pitch award`
     - Button `aria-label`: `View photo: Pitch Perfect` (`VIEW PHOTO ↗`)
     - Image: `assets/images/awards/cert-pitch-and-silent-billionaire.webp` (`1800×1012`) — `alt`: `Pitch Perfect and Silent Billionaire certificates`
     - Panel `<h3>`: `Pitch Perfect`
     - Copy: `Top presentation award for the live pitch of MedCore, an AI-powered healthcare optimization concept.`
     - Meta: `DTI Region 02, Youth Entrepreneurship Program` · `May 2026`
  3. **Row `03` (`#rec-row-2` → `#rec-file-2`, `data-lb="2"`)**:
     - Date / Title / Sub: `May 2026` · `Silent Billionaire` · `Impact`
     - Button `aria-label`: `View photo: Silent Billionaire` (`VIEW PHOTO ↗`)
     - Image: `assets/images/awards/award-dti-yep-team.webp` (`1800×1350`) — `alt`: `DTI YEP pitch presentation team`
     - Panel `<h3>`: `Silent Billionaire`
     - Copy: `A distinct recognition for exceptional impact and dedication during the program.`
     - Meta: `DTI Region 02, Youth Entrepreneurship Program` · `May 2026`
  4. **Row `04` (`#rec-row-4` → `#rec-file-4`, `data-lb="3"`)**:
     - Date / Title / Sub: `Jun 2022` · `Student Leader` · `Leadership`
     - Button `aria-label`: `View photo: Student Leader` (`VIEW PHOTO ↗`)
     - Image: `assets/images/awards/award-community-leadership.webp` (`1600×1200`) — `alt`: `Student leadership and community outreach group`
     - Panel `<h3>`: `Student Leader`
     - Copy: `Student initiative, representation and community outreach programs.`
     - Meta: `Student leadership` · `June 2022`

- **Recognition Photo Strip (`[data-strip]`, `aria-label="Recognition photos"`) & Lightbox `PHOTOS` array (`js/lightbox.js`)**:
  Populated into `.strip__track[data-strip]` (duplicated once with `tabindex="-1" aria-hidden="true"` for infinite marquee) and opened via `[data-lb="<index>"]`. All 8 items verbatim:
  - `[0]` `assets/images/awards/award-bnhs-journalism-team.webp`
    - `title`: `Student Leadership & Campus Journalism Team`
    - `desc`: `Campus journalist, radio broadcaster and student leader at Ballesteros National High School.`
  - `[1]` `assets/images/awards/cert-pitch-and-silent-billionaire.webp`
    - `title`: `Pitch Perfect & Silent Billionaire Awards`
    - `desc`: `Certificates of Recognition from DTI Region 02 (YEP) for the MedCore pitch presentation and exceptional impact.`
  - `[2]` `assets/images/awards/award-dti-yep-team.webp`
    - `title`: `DTI Youth Entrepreneurship Program — Pitch Team`
    - `desc`: `The MedCore pitch team with regional mentors, youth innovators and DTI-SMEDD organizers.`
  - `[3]` `assets/images/awards/award-community-leadership.webp`
    - `title`: `Student Leadership & Community Outreach`
    - `desc`: `Youth leadership representation, community volunteer work and collaborative outreach programs.`
  - `[4]` `assets/images/awards/award-deped-tree-project.webp`
    - `title`: `DepEd 235K Christmas Trees Project`
    - `desc`: `Student leadership in the nationwide DepEd tree planting initiative.`
  - `[5]` `assets/images/awards/award-symposium-arena.webp`
    - `title`: `Regional Academic & Pitch Symposium`
    - `desc`: `Presenting in the regional symposium arena before academic panels and enterprise evaluators.`
  - `[6]` `assets/images/awards/cih-2026-check.webp`
    - `title`: `Cagayan Innovation Hack 2026 — 2nd Place`
    - `desc`: `Final Pitch, October 19, 2026. AdvanCare took second place and a ₱10,000 prize at the iHub Innovation Hub event.`
  - `[7]` `assets/images/awards/cih-2026-stage.webp`
    - `title`: `AdvanCare on stage — Cagayan Innovation Hack 2026`
    - `desc`: `With the AdvanCare platform on screen after the Final Pitch. Theme: “From Local Challenges to Innovative Solutions.”`

---

### Section 7: Training
- **Anchor / ID**: `#training` (`aria-label="Training"`)
- **Eyebrow**: `07 / TRAINING`
- **Heading (`<h2>`, `data-scrub`)**: `Three days of learning to pitch.`
- **Script hooks / attributes**: `[data-rise="kids"]`, `.idx--training[data-index]` (`style="--n:8"`, `role="group" aria-label="Training frames"`), `[data-idx-row]`, `[data-idx-panel]`, `[data-training-lb]`, `[data-cursor="View"]`
- **Program Intro**:
  - Heading (`<h3>`): `DTI Youth Entrepreneurship Program`
  - Meta: `May 19 to 21, 2026` · `Lingu, Solana, Cagayan`
  - Copy:
    - `An intensive three-day boot camp run by DTI Region 02 / SMEDD on entrepreneurial thinking, business model generation, financial viability and pitching digital ideas for sponsorship and seed funding.`
    - `Our team built and presented the live pitch for MedCore, an AI-powered healthcare optimization concept, and won the Pitch Perfect award along with the Silent Billionaire recognition.`
- **Training Frames Index (`#trn-row-0`..`7` → `#trn-file-0`..`7`)**:
  1. **Frame `01` (`#trn-row-0` → `#trn-file-0`, `is-active`, `data-training-lb="0"`)**:
     - Date / Title / Sub: `May 2026` · `MedCore Pitch` · `Pitch`
     - Button `aria-label`: `View photo: Pitching MedCore` (`VIEW PHOTO ↗`)
     - Image: `assets/images/trainings/dti-yep-pitch-medcore.webp` (`1800×1012`) — `alt`: `Pitching MedCore, an AI-powered healthcare optimization concept`
     - Panel `<h3>`: `Pitching MedCore`
     - Copy: `Pitching MedCore, an AI-powered healthcare optimization concept.`
     - Meta: `DTI YEP · Lingu, Solana` · `May 2026`
  2. **Frame `02` (`#trn-row-1` → `#trn-file-1`, `data-training-lb="1"`)**:
     - Date / Title / Sub: `May 2026` · `Awardees` · `Awards`
     - Button `aria-label`: `View photo: Pitch Perfect and Silent Billionaire awardees` (`VIEW PHOTO ↗`)
     - Image: `assets/images/trainings/dti-yep-awards-banner.webp` (`1800×1012`) — `alt`: `Pitch Perfect and Silent Billionaire awardees`
     - Panel `<h3>`: `Awards Recognition` (in `TRAINING_PHOTOS` lightbox title: `Pitch Perfect & Silent Billionaire`)
     - Copy: `Pitch Perfect and Silent Billionaire awardees.`
     - Meta: `DTI Region 02 / SMEDD` · `May 2026`
  3. **Frame `03` (`#trn-row-2` → `#trn-file-2`, `data-training-lb="2"`)**:
     - Date / Title / Sub: `May 2026` · `DTI Officials` · `Panel`
     - Button `aria-label`: `View photo: The presentation team with DTI-SMEDD officials` (`VIEW PHOTO ↗`)
     - Image: `assets/images/trainings/dti-yep-officials.webp` (`1800×1012`) — `alt`: `The presentation team with DTI-SMEDD officials`
     - Panel `<h3>`: `With DTI-SMEDD Officials`
     - Copy: `The presentation team with DTI-SMEDD officials.`
     - Meta: `DTI Region 02 / SMEDD` · `May 2026`
  4. **Frame `04` (`#trn-row-3` → `#trn-file-3`, `data-training-lb="3"`)**:
     - Date / Title / Sub: `May 2026` · `Balay Na Magu` · `Team`
     - Button `aria-label`: `View photo: Team celebration at Balay Na Magu, Solana` (`VIEW PHOTO ↗`)
     - Image: `assets/images/trainings/dti-yep-outdoor-team.webp` (`1800×1012`) — `alt`: `Team celebration at Balay Na Magu, Solana`
     - Panel `<h3>`: `Balay Na Magu, Solana`
     - Copy: `Team celebration at Balay Na Magu, Solana.`
     - Meta: `Solana, Cagayan` · `May 2026`
  5. **Frame `05` (`#trn-row-4` → `#trn-file-4`, `data-training-lb="4"`)**:
     - Date / Title / Sub: `May 19, 2026` · `Opening Day` · `Day 01`
     - Button `aria-label`: `View photo: Opening day of Be Your Own Boss!` (`VIEW PHOTO ↗`)
     - Image: `assets/images/trainings/dti-yep-opening-banner.webp` (`1800×1350`) — `alt`: `Opening day of Be Your Own Boss!`
     - Panel `<h3>`: `Opening Day`
     - Copy: `Opening day of Be Your Own Boss!`
     - Meta: `DTI YEP · Day 01` · `May 19, 2026`
  6. **Frame `06` (`#trn-row-5` → `#trn-file-5`, `data-training-lb="5"`)**:
     - Date / Title / Sub: `May 2026` · `Pitch Team` · `Mentor`
     - Button `aria-label`: `View photo: The MedCore pitch team with our program mentor` (`VIEW PHOTO ↗`)
     - Image: `assets/images/trainings/dti-yep-pitch-team.webp` (`1800×1012`) — `alt`: `The MedCore pitch team with our program mentor`
     - Panel `<h3>`: `Pitch Team & Mentor`
     - Copy: `The MedCore pitch team with our program mentor.`
     - Meta: `Mentorship · MedCore` · `May 2026`
  7. **Frame `07` (`#trn-row-6` → `#trn-file-6`, `data-training-lb="6"`)**:
     - Date / Title / Sub: `May 20, 2026` · `Workshop` · `Day 02`
     - Button `aria-label`: `View photo: Business ideation and pitch preparation workshop` (`VIEW PHOTO ↗`)
     - Image: `assets/images/trainings/dti-yep-workshop-session.webp` (`1800×1012`) — `alt`: `Business ideation and pitch preparation workshop`
     - Panel `<h3>`: `Ideation Workshop` (in `TRAINING_PHOTOS` lightbox title: `Ideation & Pitch Workshop`)
     - Copy: `Business ideation and pitch preparation workshop.`
     - Meta: `DTI YEP · Workshop` · `May 20, 2026`
  8. **Frame `08` (`#trn-row-7` → `#trn-file-7`, `data-training-lb="7"`)**:
     - Date / Title / Sub: `May 21, 2026` · `Certificates` · `Day 03`
     - Button `aria-label`: `View photo: Certificates from the program` (`VIEW PHOTO ↗`)
     - Image: `assets/images/trainings/dti-yep-certificates.webp` (`1800×1321`) — `alt`: `Certificates from the program`
     - Panel `<h3>`: `Program Certificates`
     - Copy: `Certificates from the program.`
     - Meta: `DTI Region 02 / SMEDD` · `May 21, 2026`

- **Lightbox `TRAINING_PHOTOS` Array (`js/drawer.js`, opened via `[data-training-lb]`)**:
  All 8 entries (`src` prefixed with `assets/images/trainings/`):
  - `[0]` `dti-yep-pitch-medcore.webp` — `Pitching MedCore` — `Pitching MedCore, an AI-powered healthcare optimization concept.`
  - `[1]` `dti-yep-awards-banner.webp` — `Pitch Perfect & Silent Billionaire` — `Pitch Perfect and Silent Billionaire awardees.`
  - `[2]` `dti-yep-officials.webp` — `With DTI-SMEDD Officials` — `The presentation team with DTI-SMEDD officials.`
  - `[3]` `dti-yep-outdoor-team.webp` — `Balay Na Magu, Solana` — `Team celebration at Balay Na Magu, Solana.`
  - `[4]` `dti-yep-opening-banner.webp` — `Opening Day` — `Opening day of Be Your Own Boss!`
  - `[5]` `dti-yep-pitch-team.webp` — `Pitch Team & Mentor` — `The MedCore pitch team with our program mentor.`
  - `[6]` `dti-yep-workshop-session.webp` — `Ideation & Pitch Workshop` — `Business ideation and pitch preparation workshop.`
  - `[7]` `dti-yep-certificates.webp` — `Program Certificates` — `Certificates from the program.`

---

### Section 8: Contact
- **Anchor / ID**: `#contact`
- **Heading (`<h2>`)**: `So, what are we building?`
- **Availability Tag**: `Open to internships and projects`
- **Body Copy**: `Internships and projects in data engineering or full-stack work. Tell me what you have in mind.`
- **Link**: `See the work` → `#work`
- **Script hooks / attributes**: `[data-rise]`, `[data-message-open]`, `[data-wallet]`, `[data-gh-typing]`, `[data-pass-grid]`, `[data-pass-total]`, `[data-typing]`, `[data-copier]`, `[data-copier-slip]`, `[data-copier-no]`, `[data-copier-addr]`, `[data-copier-led]`, `[data-copy="mcleinjeionza06@gmail.com"]`, `[data-copier-live]`
- **ID Card (`.idcard`)**:
  - Avatar: `assets/images/avatar.webp` (`64×64`, `alt=""`)
  - Name: `McLein Jei Onza`
  - Role: `CS student · data engineering`
  - Action button: `Send a message` (`[data-message-open]`)
- **Contact Wallet Channels (`.wallet[data-wallet]`)**:
  1. **GitHub** (`.pass--gh`, initial `aria-expanded="false"`):
     - Terminal text (`[data-gh-typing]`, `aria-label="Building something good"`): `> building something good_`
     - Live mini contribution grid: `[data-pass-grid]`
     - Activity note: `@Mclein31 · a year of commits` (`[data-pass-total]`, updates dynamically to `<N> contributions this year`)
     - Link: `Follow` → `https://github.com/Mclein31` (`target="_blank" rel="noopener noreferrer"`)
  2. **LinkedIn** (`.pass--in`, initial `aria-expanded="false"`):
     - Icon: `assets/icons/linkedin-brand.svg` (`24×24`, `alt=""`)
     - Name / Sub: `McLein Jei Onza` · `CS student · Data engineering`
     - Decorative connection avatar: `assets/images/avatar.webp` (`36×36`, `alt=""`)
     - Link: `Connect` → `https://www.linkedin.com/in/mclein-jei-onza-9b0769322/` (`target="_blank" rel="noopener noreferrer"`)
  3. **WhatsApp** (`.pass--wa`, initial `aria-expanded="false"`):
     - Icon: `assets/icons/whatsapp.svg` (`24×24`, `alt=""`)
     - SR-only name: `McLein Jei G. Onza`
     - Decorative chat bubble: `Hey, let’s build something 👋`
     - Link: `Chat on WhatsApp` → `https://wa.me/639524781573?text=Hi%20McLein%21%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20talk%20about%20a%20project%20or%20opportunity.` (`target="_blank" rel="noopener noreferrer"`)
  4. **Gmail** (`.pass--mail`, initial `aria-expanded="true"`):
     - Icon: `assets/icons/gmail.webp` (`24×24`, `alt=""`)
     - Decorative compose preview (`aria-hidden="true"`):
       - `To`: `McLein` (avatar `assets/images/avatar.webp`, `240×240`, `alt=""`)
       - `Subject`: `Internship or project`
       - Message (`[data-typing]`): `Hi McLein, are you open to an internship this summer?`
     - Link: `Email` → `mailto:mcleinjeionza06@gmail.com?subject=Internship%20or%20project`
- **Email Copier (`.copier[data-copier]`, `data-state="idle"`)**:
  - Slip tag (`[data-copier-no]`): `COPY 001 / EMAIL`
  - Slip address (`[data-copier-addr]`): `mcleinjeionza06@gmail.com`
  - LED label: `COPIED`
  - Button (`[data-copy="mcleinjeionza06@gmail.com"]`, `aria-label="Copy email address and print a slip"`): `COPY`
  - Live region (`[data-copier-live]`, `role="status" aria-live="polite"`)

---

## 3. Footer, Toast & Modal Dialogs

### Footer (`footer.footer.proof`)
- **Copyright**: `© 2026 McLein Jei G. Onza` (`2026` wrapped in `[data-year]`, dynamically set to current year)
- **Footer Nav (`<nav aria-label="Footer">`)**:
  - `GitHub` → `https://github.com/Mclein31` (`target="_blank" rel="noopener noreferrer"`)
  - `LinkedIn` → `https://www.linkedin.com/in/mclein-jei-onza-9b0769322/` (`target="_blank" rel="noopener noreferrer"`)
  - `Email` → `mailto:mcleinjeionza06@gmail.com`
  - `Back to top` → `#top`
- **Wordmark (`[data-footer-mark]`, `aria-hidden="true"`)**: `mclein.onza` (rendered in `Hedvig Letters Serif`)
- **ASCII Lighthouse Vista (`[data-vista]`, `aria-hidden="true"`)**: procedurally generated multi-layer ASCII island/lighthouse/sea/beam scene (`js/vista.js`).
- **Site Stats Pill (`[data-stats]`, `role="group" aria-label="Site stats"`)**:
  - Visits (`title="Total visits"`): `<b data-visits>0</b>` + `<span class="sr-only">visits</span>`
  - Like button (`button[data-like]`, `aria-pressed="false"`): `<span class="sr-only">Like this website,</span>` + `<b data-likes>0</b>` + `<span class="sr-only">likes</span>`

### Toast (`div.toast[data-toast]`, `role="status" aria-live="polite"`)
- Text (`[data-toast-text]`): `Copied` (updated to `Email copied to clipboard` on copy)

### Lightbox Dialog (`dialog.lightbox[data-lightbox]`, `aria-label="Photo viewer"`)
- Count (`[data-lb-count]`): initial `1 / 7` (dynamically `${index + 1} / ${items.length}`)
- Close button (`[data-lb-close]`, `aria-label="Close viewer"`)
- Stage (`[data-lb-stage]`): `<img data-lb-img src="" alt="" />`, Prev (`[data-lb-prev]`, `aria-label="Previous photo"`), Next (`[data-lb-next]`, `aria-label="Next photo"`)
- Caption: `<h4 data-lb-title></h4>`, `<p data-lb-desc></p>`

### Message Form Dialog (`dialog.msg[data-message]`, `aria-labelledby="msgTitle"`)
- Title (`#msgTitle`): `Send a message`
- Close button (`[data-message-close]`, `aria-label="Close message form"`)
- Form (`[data-message-form]`):
  - `action`: `https://formsubmit.co/ajax/mcleinjeionza06@gmail.com`
  - `method`: `POST`
  - Hidden inputs:
    - `_subject`: `New message from portfolio (McLein Jei)`
    - `_captcha`: `false`
    - `_template`: `table`
  - Honeypot: `input.hp[name="_honey"]` (`tabindex="-1" autocomplete="off" aria-hidden="true"`)
  - Fields:
    - `#fName` (`name="name"`, `type="text"`, `autocomplete="name"`, `required`) — Label: `Your name` — Placeholder: `Juan Dela Cruz`
    - `#fEmail` (`name="email"`, `type="email"`, `autocomplete="email"`, `required`) — Label: `Email` — Placeholder: `you@example.com`
    - `#fMsg` (`name="message"`, `rows="5"`, `required`) — Label: `Message` — Placeholder: `What are you working on?`
  - Submit button (`[data-message-submit]`): `Send message`
  - Status (`[data-message-status]`, `role="status" aria-live="polite"`)

### Video Dialog (`dialog.appwin.appwin--video[data-video]`, `aria-labelledby="videoTitle"`)
- Close button (`[data-video-close]`, `aria-label="Close video"`)
- Title (`#videoTitle[data-video-title-el]`): default `SERVIO`
- Hint: `promo video`
- Player: `<video data-video-player controls playsinline preload="none"></video>`

---

## 4. Functional Features Inventory

| Feature | Module(s) | Endpoint / Storage / API | Selectors & Inputs | Behaviour |
|---|---|---|---|---|
| **Theme bootstrap & toggle** | `<head>` inline script + `js/theme.js` | `localStorage` key `portfolio-theme` (`'light'` \| `'dark'`), `prefers-color-scheme: light` | `[data-theme-toggle]`, `meta[name="theme-color"]` (`#F2EFE9` / `#0B0B0B`), `html[data-theme="light"]` | Sets `data-theme="light"` before first paint when stored or OS prefers light; toggles and persists on click; listens to OS scheme changes when no stored choice. |
| **Preloader** | `<head>` inline script + `js/preloader.js` | `sessionStorage` key `pf-loaded` (`'1'`), `prefers-reduced-motion` | `.preloader`, `[data-count]`, `.preloader__bar i`, `html.no-preload`, `.hero.is-in` | Plays once per session (~350–750ms ease-out count `000`→`100`), skipped when `pf-loaded` or `prefers-reduced-motion` is set; resolves before adding `.hero.is-in`. |
| **Header nav & scroll spy** | `js/scroll.js`, `js/ui.js` | `IntersectionObserver`, `scrollY`, `document.fonts.ready` | `main section[id]`, `.nav`, `.nav__links a`, `.nav__pill`, `[data-menu-toggle]`, `#menu`, `[data-footer-mark]` | Slides `.nav__pill` under active section link; hides nav on downward user scroll (`>48px` after `400px`) and steps aside near footer (`.is-away`); mobile `#menu` drawer + `Escape` close; scales `[data-footer-mark]` to container width and updates `--fill` on scroll. |
| **Tool icon carousel** | `js/icons.js` | `IntersectionObserver`, `requestAnimationFrame`, Pointer Events | `[data-icon-field]`, `ICONS` (24 assets) | Auto-scrolls horizontally when visible, unpaused, and reduced-motion off; clones group for seamless loop; arrow-key scrolling; pointer drag-to-lift ghost icon with damped spring return. |
| **Work horizontal pin & counter** | `js/work.js` | `scroll`, `resize`, `matchMedia('(min-width: 861px) and (min-height: 600px) and (orientation: landscape)')` | `#work`, `[data-work-pin]`, `[data-work-track]`, `[data-work-count]`, `.work__bar` | Pins `#work` on landscape viewports (`!reducedMotion`), maps vertical scroll to horizontal `translate3d`, sizes `--gallery-max-height`, updates `01 / 05` counter and `--wp` progress bar. |
| **Project galleries** | `js/gallery.js` | `IntersectionObserver`, `scrollTo` | `[data-gallery]`, `[data-gallery-track]`, `[data-gallery-zoom]`, `[data-gallery-prev]`, `[data-gallery-next]`, `[data-gallery-dots]` | Generates slide indicator dots; mouse drag-snap, arrow keys, prev/next wrap-around; pauses off-slide/off-screen videos and sets `preload="auto"` on active video slide; clicking slide/Enter/zoom opens photo lightbox (`openViewer`) or video dialog (`openVideo`, resuming timestamp). |
| **Video modal dialog** | `js/video.js` | HTML `<dialog>.showModal()`, `<video>` | `[data-video]`, `[data-video-player]`, `[data-video-title-el]`, `[data-video-open]`, `[data-video-poster]`, `[data-video-title]`, `[data-video-close]` | Opens modal with `{ src, poster, title }`, optional resume time `at`, locks body scroll (`is-locked`), auto-plays with sound on user gesture, pauses and restores focus on close. |
| **Photo lightbox & strip** | `js/lightbox.js` | HTML `<dialog>.showModal()`, `IntersectionObserver`, Touch Events | `[data-lightbox]`, `[data-lb-img]`, `[data-lb-stage]`, `[data-lb-title]`, `[data-lb-desc]`, `[data-lb-count]`, `[data-lb-prev]`, `[data-lb-next]`, `[data-lb-close]`, `[data-lb]`, `[data-strip]`, `PHOTOS` (8 items) | Populates infinite `[data-strip]` marquee in Recognition; opens modal for `PHOTOS` (via `[data-lb]`), `TRAINING_PHOTOS` (via `openViewer` from `drawer.js`), or project screenshots (via `openViewer` from `gallery.js`, adding `.is-wide`); keyboard Left/Right and touch swipe navigation. |
| **About accordion & count-up** | `js/ui.js` (count-up attribute in HTML) | Click + Arrow/Home/End keys | `[data-does]`, `.does__row`, `.does__btn`, `[data-countup="7"]` | Single-open accordion for Build / Model / Automate (`aria-expanded`, `.is-open`). Note: `[data-countup="7"]` exists in HTML (`About` Shipped `7+`), though no JS module currently animates `[data-countup]`. |
| **Journey pinned slideshow** | `js/journey.js` | `scroll`, `resize`, `matchMedia` | `[data-years]`, `.yr`, `.years__dots i`, `[data-yr-i]` | Maps vertical scroll progress across `[data-years]` to 7 slides (`is-on`, `inert` on inactive slides), updates `YEAR 01 / 07` and dots; unpins in short landscape or `reducedMotion`. |
| **GitHub contribution calendar** | `js/contributions.js`, `js/activity.js`, `api/contributions.js` | Primary: `/api/contributions` (scrapes `https://github.com/users/Mclein31/contributions`, edge-cached `s-maxage=3600`); Client fallback: `https://github-contributions-api.jogruber.de/v4/Mclein31?y=last` (8s timeout) | `[data-activity]`, `[data-act-cal]`, `[data-act-scroll]`, `[data-act-tip]`, `[data-act-stats]`, `[data-act="total\|days\|streak\|best\|daysNote\|streakNote\|bestNote"]`, `.stat[data-hl]` | Lazy-fetches on `IntersectionObserver` (`rootMargin: '1000px 0px'`); renders 52+ week grid (`data-l="0..4"`), computes total, active days, longest streak, best day with count-up animation; cell hover tooltip; clicking/hovering stat buttons highlights matching cells (`active`, `streak`, `best`). |
| **Stack schema join highlighter** | `js/ui.js` | Pointer Events | `[data-schema]`, `.row[data-join]` | Hover (mouse) or tap (touch) on any row highlights `.is-source` and all rows sharing a space-separated token in `data-join` (`.is-joined`). |
| **Recognition & Training editorial index** | `js/drawer.js` | `matchMedia('(min-width: 64rem)')`, Click, Mousemove, Focus, Arrow/Home/End | `[data-index]`, `[data-idx-row]`, `[data-idx-panel]`, `[data-training-lb]`, `TRAINING_PHOTOS` (8 items) | Wide (`>=64rem`): hover/focus/click switches sticky featured panel; Narrow: accordion toggle preserving scroll position. Training photo buttons open `TRAINING_PHOTOS` in lightbox. |
| **Contact wallet passes** | `js/wallet.js`, `js/contributions.js` | `IntersectionObserver`, `ResizeObserver`, shared `loadContributions()` | `[data-wallet]`, `.pass`, `.pass__head`, `.pass__body`, `[data-typing]`, `[data-gh-typing]`, `[data-pass-grid]`, `[data-pass-total]` | Stacked pass switcher (`--pos`, `.is-front`, `inert` on back cards); auto-types Gmail line (`[data-typing]`) and GitHub prompt (`[data-gh-typing]`); renders responsive mini GitHub contribution grid into `[data-pass-grid]` when GitHub pass is brought forward. |
| **Email copier & clipboard toast** | `js/copier.js`, `js/ui.js`, `js/util.js` | `navigator.clipboard.writeText` (textarea `execCommand('copy')` fallback) | `[data-copy]`, `[data-copier]`, `[data-copier-addr]`, `[data-copier-no]`, `[data-copier-live]`, `[data-toast]`, `[data-toast-text]` | Copies `data-copy` (`mcleinjeionza06@gmail.com`), shows toast (`Email copied to clipboard`), increments slip counter (`COPY 001 / EMAIL`), animates slip print/retract and `COPIED` LED, announces via `aria-live`. |
| **Contact message form (FormSubmit AJAX)** | `js/contact.js` | `POST https://formsubmit.co/ajax/mcleinjeionza06@gmail.com` (`Accept: application/json`, `FormData`) | `[data-message]`, `[data-message-open]`, `[data-message-close]`, `[data-message-form]`, `[data-message-submit]`, `[data-message-status]`, `#fName`, `#fEmail`, `#fMsg`, hidden `_subject`, `_captcha`, `_template`, honeypot `_honey` | Opens modal (`showModal()`), focuses `#fName`; submits via `fetch` with FormData; disables submit (`Sending…`), displays success (`Sent. I'll reply to you by email soon.`) and auto-closes after 2.4s, or error fallback (`That didn't go through. Email me directly at mcleinjeionza06@gmail.com.`). |
| **Visits & Likes stats proxy** | `js/stats.js`, `api/stats.js` | Primary: `/api/stats?type={get\|increment}&metric={visits\|likes}` (proxies `https://abacus.jasoncameron.dev/{get\|hit}/mcleinonza/{portfolio_views\|portfolio_likes}`, sets `HttpOnly` cookie `portfolio_visited=1`); Fallback (except visit increment): direct Abacus URL; `localStorage` keys `site_total_visits`, `site_total_likes`, `site_user_has_visited`, `site_user_has_liked` | `[data-stats]`, `[data-visits]`, `[data-likes]`, `[data-like]` | Skips visit increment on `navigator.webdriver` or localhost/127.0.0.1/0.0.0.0/`[::1]`; serializes first-visit check with `navigator.locks`; supports one-time like per browser (`+1 ♥` / `Already liked ♥`); draggable when `position: fixed`. |
| **Footer ASCII lighthouse vista** | `js/vista.js` | Canvas/DOM character grid (`requestAnimationFrame` / theme-aware) | `[data-vista]` | Renders procedural ASCII island, striped lighthouse, sweeping beam (night) or sun/clouds (day, reading `data-theme="light"`), trees, dock, and water reflections. |
| **Scroll reveal & heading scrub** | `js/reveal.js` | `IntersectionObserver`, `scroll`, `prefers-reduced-motion` | `[data-scrub]`, `.hl`, `[data-rise]`, `[data-rise="kids"]` | Splits `[data-scrub]` headings into word spans (`.sw`) and wipes `.hl` boxes on scroll; triggers `.is-in` on `[data-rise]` blocks with staggered `--i` on children. |
| **Web Audio SFX** | `js/sfx.js` | Web Audio API (`AudioContext` + noise buffer) | Delegated click listener on `a, button, [role="button"], summary` | Synthesizes tactile clicks, accordion tones, card shuffle, thermal printer chatter (`[data-copy]`), modal pop/drop, typing ticks, and gallery/journey steps after first user gesture. |
| **Dynamic copyright year** | `js/ui.js` | `new Date().getFullYear()` | `[data-year]` | Updates copyright year text on load. |

---

## 5. Assets Inventory (`assets/` — 132 total files)

### Used in `index.html` directly (91 files)

#### Favicons & OG / Avatar (4 files)
- `assets/Logo/favicon-circle-64.png`
- `assets/Logo/favicon-circle-192.png`
- `assets/images/og-image.jpg` (referenced via absolute canonical URL in `og:image` and `twitter:image`)
- `assets/images/avatar.webp` (referenced in JSON-LD `Person.image`, Contact `.idcard__face`, LinkedIn pass, Gmail compose chip)

#### Fonts (1 preloaded in `index.html`; all 5 loaded in `css/fonts.css`)
- `assets/fonts/geist-v5-latin.woff2` (preloaded in `index.html` + `css/fonts.css`)

#### Icons in `index.html` (3 files)
- `assets/icons/linkedin-brand.svg`
- `assets/icons/whatsapp.svg`
- `assets/icons/gmail.webp`

#### Project Screenshots (60 files)
- AdvanCare (18 files):
  - `assets/images/projects/advancare-1-1600.webp`, `advancare-1-2400.webp`, `advancare-1-3200.webp` (Note: `advancare-1-1600.webp` is also used directly as `src` in Journey slide 6)
  - `assets/images/projects/advancare-2-1600.webp`, `advancare-2-2400.webp`, `advancare-2-3200.webp`
  - `assets/images/projects/advancare-3-1600.webp`, `advancare-3-2400.webp`, `advancare-3-3200.webp`
  - `assets/images/projects/advancare-4-1600.webp`, `advancare-4-2400.webp`, `advancare-4-3200.webp`
  - `assets/images/projects/advancare-5-1600.webp`, `advancare-5-2400.webp`, `advancare-5-3200.webp`
  - `assets/images/projects/advancare-6-1600.webp`, `advancare-6-2400.webp`, `advancare-6-3200.webp`
- MedCore (18 files — wait: listed below; let's keep exact per-project counts):
  - `assets/images/projects/medcore-1-1600.webp`, `medcore-1-2400.webp`, `medcore-1-3200.webp`
  - `assets/images/projects/medcore-2-1600.webp`, `medcore-2-2400.webp`, `medcore-2-3200.webp`
  - `assets/images/projects/medcore-3-1600.webp`, `medcore-3-2400.webp`, `medcore-3-3200.webp`
  - `assets/images/projects/medcore-4-1600.webp`, `medcore-4-2400.webp`, `medcore-4-3200.webp`
  - `assets/images/projects/medcore-5-1600.webp`, `medcore-5-2400.webp`, `medcore-5-3200.webp`
  - `assets/images/projects/medcore-6-1600.webp`, `medcore-6-2400.webp`, `medcore-6-3200.webp`
- SERVIO (12 files):
  - `assets/images/projects/servio-1-1600.webp`, `servio-1-2400.webp`, `servio-1-3200.webp`
  - `assets/images/projects/servio-2-1600.webp`, `servio-2-2400.webp`, `servio-2-3200.webp`
  - `assets/images/projects/servio-3-1600.webp`, `servio-3-2400.webp`, `servio-3-3200.webp`
  - `assets/images/projects/servio-4-1600.webp`, `servio-4-2400.webp`, `servio-4-3200.webp`
- MedRec (3 files):
  - `assets/images/projects/medrec-1.webp`, `medrec-2.webp`, `medrec-3.webp`
- Mulat Media (9 files):
  - `assets/images/projects/mulat-1-1600.webp`, `mulat-1-2400.webp`, `mulat-1-3200.webp` (Note: `mulat-1-1600.webp` is also used directly as `src` in Journey slide 4)
  - `assets/images/projects/mulat-2-1600.webp`, `mulat-2-2400.webp`, `mulat-2-3200.webp`
  - `assets/images/projects/mulat-3-1600.webp`, `mulat-3-2400.webp`, `mulat-3-3200.webp`

#### Project Videos & Posters (8 files)
- `assets/video/advancare-promo.mp4`, `assets/video/advancare-promo-poster.webp`
- `assets/video/medcore-promo.mp4`, `assets/video/medcore-promo-poster.webp`
- `assets/video/servio-promo.mp4`, `assets/video/servio-promo-poster.webp`
- `assets/video/medrec-promo.mp4`, `assets/video/medrec-promo-poster.webp`

#### Journey Images (3 dedicated + 4 shared with Projects/Awards/Training)
- Dedicated:
  - `assets/images/journey-first-code.webp`
  - `assets/images/journey-portrait.webp`
  - `assets/images/journey-workspace.webp`
- Shared (already listed above or below): `dti-yep-pitch-medcore.webp`, `mulat-1-1600.webp`, `cih-2026-check.webp`, `advancare-1-1600.webp`

#### Recognition Images in `index.html` (4 files; also in `js/lightbox.js`)
- `assets/images/awards/cih-2026-check.webp`
- `assets/images/awards/cert-pitch-and-silent-billionaire.webp`
- `assets/images/awards/award-dti-yep-team.webp`
- `assets/images/awards/award-community-leadership.webp`

#### Training Images in `index.html` (8 files; also in `js/drawer.js`)
- `assets/images/trainings/dti-yep-pitch-medcore.webp`
- `assets/images/trainings/dti-yep-awards-banner.webp`
- `assets/images/trainings/dti-yep-officials.webp`
- `assets/images/trainings/dti-yep-outdoor-team.webp`
- `assets/images/trainings/dti-yep-opening-banner.webp`
- `assets/images/trainings/dti-yep-pitch-team.webp`
- `assets/images/trainings/dti-yep-workshop-session.webp`
- `assets/images/trainings/dti-yep-certificates.webp`

*(Subtotal of distinct files referenced in `index.html`: 4 + 1 + 3 + 60 + 8 + 3 + 4 + 8 = 91 files.)*

### Used via CSS or JS modules only (32 additional files)

#### Fonts in `css/fonts.css` (4 files)
- `assets/fonts/geist-v5-latin-ext.woff2`
- `assets/fonts/geist-mono-v6-latin.woff2`
- `assets/fonts/geist-mono-v6-latin-ext.woff2`
- `assets/fonts/hedvig-letters-serif-v7-latin.woff2`

#### Tool Carousel Icons in `js/icons.js` (24 files)
- `assets/icons/python-icon.webp`
- `assets/icons/postgres-icon.webp`
- `assets/icons/sqlite.svg`
- `assets/icons/neon.svg`
- `assets/icons/supabase.svg`
- `assets/icons/drizzle.svg`
- `assets/icons/typescript-icon.webp`
- `assets/icons/javascript-icon.webp`
- `assets/icons/react.svg`
- `assets/icons/angular.svg`
- `assets/icons/ionic.svg`
- `assets/icons/capacitor.svg`
- `assets/icons/expo.svg`
- `assets/icons/nodejs.svg`
- `assets/icons/hono.svg`
- `assets/icons/cloudflare.svg`
- `assets/icons/vercel.svg`
- `assets/icons/git-icon.webp`
- `assets/icons/github-icon.webp`
- `assets/icons/vscode-icon.webp`
- `assets/icons/cursor.webp`
- `assets/icons/claude-ai-icon.svg`
- `assets/icons/gemini.svg`
- `assets/icons/ollama.webp`

#### Extra Recognition Photos in `js/lightbox.js` `PHOTOS` / Strip (4 files)
- `assets/images/awards/award-bnhs-journalism-team.webp`
- `assets/images/awards/award-deped-tree-project.webp`
- `assets/images/awards/award-symposium-arena.webp`
- `assets/images/awards/cih-2026-stage.webp`

*(Total used files across `index.html` + `css/` + `js/`: 91 + 32 = 123 files.)*

### Unused Files in `assets/` (9 files)
- `assets/Logo/mclein-formal-circle.png`
- `assets/Logo/mclein-formal-phone.png`
- `assets/Logo/mclein-photo-white-background.png`
- `assets/icons/brand-sources.md` (source notes markdown for icon attributions)
- `assets/images/awards/cert-high-honors.webp` (intentionally excluded from Recognition per owner rule)
- `assets/images/portrait.webp` (replaced by `journey-portrait.webp`)
- `assets/images/profile-2.png`
- `assets/images/profile.jpeg`
- `assets/images/profile2.jpeg`
