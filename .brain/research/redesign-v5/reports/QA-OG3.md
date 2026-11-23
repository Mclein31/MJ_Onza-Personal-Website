---
type: worker-report
job: QA-OG3
project: Personal Website
date: 2026-11-23
---

# QA-OG3 — Social Preview Refresh (`og-image.jpg`)

## What Changed
1. **Helper composition and render script** (`.brain/research/redesign-v5/QA-OG3/`):
   - `.brain/research/redesign-v5/QA-OG3/og-preview.html`: `1200×630` light-theme Instrument composition linking `/styles/tokens.css`, `/styles/base.css`, `/styles/hero.css`, and the static field SVGs (`/assets/images/hero-field-grey.svg`, `/assets/images/hero-field-orange.svg`).
   - Matches the updated `#top` hero: the quieter Extract / Transform / Load particle field aligned on column lines 2, 6, and 10, the single status line (`Open to data engineering internships` with orange index square), `McLein Jei Onza`, `I build full-stack apps and train in data engineering.`, and the `mcleinjeionza.vercel.app` marker. No strip cells, no school, no course, and no buttons.
   - `.brain/research/redesign-v5/QA-OG3/render-og.mjs`: self-contained Playwright script using `page.route` over local files (run from repo root with `node .brain/research/redesign-v5/QA-OG3/render-og.mjs`), capturing `assets/images/og-image.jpg` at `1200×630`, JPEG quality `85`.
2. **Regenerated image**: `assets/images/og-image.jpg`.
3. **Head meta alt tags** (`index.html`, lines 26 and 31 only): updated `og:image:alt` and `twitter:image:alt` to describe the updated card plainly with no gendered pronouns.

## Verification
- Ran `node .brain/research/redesign-v5/QA-OG3/render-og.mjs` from the repo root:
  - Dimensions: `1200×630`
  - Size: `58,091` bytes (`56.7 KB`, under `300 KB`)
- Opened and visually inspected `assets/images/og-image.jpg`: Geist and Geist Mono loaded cleanly, the 12-column grid hairlines, Extract / Transform / Load field, status line, name, intro, and `mcleinjeionza.vercel.app` marker align with no clipping or overlap.
- Inspected `index.html` lines 24–33 to confirm only `og:image:alt` (line 26) and `twitter:image:alt` (line 31) changed.
