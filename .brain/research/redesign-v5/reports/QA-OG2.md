---
type: worker-report
job: QA-OG2
project: Personal Website
date: 2026-11-23
---

# QA-OG2 — Social Preview Refresh (`og-image.jpg`)

## What Changed
1. **Helper composition and render script** (`.brain/research/redesign-v5/QA-OG2/`):
   - `.brain/research/redesign-v5/QA-OG2/og-preview.html`: dedicated `1200×630` light-theme Instrument composition linking `/styles/tokens.css`, `/styles/base.css`, `/styles/hero.css`, and the static field SVGs (`/assets/images/hero-field-grey.svg`, `/assets/images/hero-field-orange.svg`).
   - Renders the exact `#top` 4-cell spec strip (`Open to` / `Data engineering internships`, `Focus` / `SQL · PostgreSQL · Python · ETL`, `Shipped` / `7+ projects, web and mobile →`, `Latest` / `2nd place, Cagayan Innovation Hack 2026 →`), the Extract / Transform / Load particle field aligned on column lines 2, 6, and 10, `McLein Jei Onza`, `I build full-stack apps and train in data engineering.`, and the `mcleinjeionza.vercel.app` marker with an orange index square. No school or course appears.
   - `.brain/research/redesign-v5/QA-OG2/render-og.mjs`: self-contained Playwright script using `page.route` over local files (runs cleanly with `node .brain/research/redesign-v5/QA-OG2/render-og.mjs` without port binding), capturing `assets/images/og-image.jpg` at `1200×630`, JPEG quality `85`.
2. **Regenerated image**: `assets/images/og-image.jpg`.
3. **Head meta alt tags** (`index.html`, lines 26 and 31 only): updated `og:image:alt` and `twitter:image:alt` to describe the updated card plainly without gendered pronouns, school, or course.

## Verification
- Ran `node .brain/research/redesign-v5/QA-OG2/render-og.mjs` from the repo root:
  - Dimensions: `1200×630`
  - Size: `75,114` bytes (`73.4 KB`, under `300 KB`)
- Opened and visually inspected `assets/images/og-image.jpg`: Geist and Geist Mono loaded cleanly, all four strip cells and hairlines align on the 12-column grid, the Extract / Transform / Load field and markers sit cleanly, and `mcleinjeionza.vercel.app` balances the bottom-right aside with no clipping or overlap.
- Inspected `index.html` lines 17–36 to confirm only `og:image:alt` (line 26) and `twitter:image:alt` (line 31) changed in the head.
- Note: `npx playwright test tests/health.spec.mjs tests/seo.spec.mjs --project=desktop-chrome` was blocked in the sandbox on loopback `127.0.0.1:4173` (`ERR_ACCESS_DENIED` / `EPERM`).
