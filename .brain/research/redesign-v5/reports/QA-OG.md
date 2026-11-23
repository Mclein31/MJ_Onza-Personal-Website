# QA-OG — Social Preview Image (`og-image.jpg`)

## Decision: Dedicated Scratch Composition
1. First captured the live hero on `node tests/serve.mjs 4509` at `1200x630`, `deviceScaleFactor: 1`, `portfolio-theme=light`, `v5-intro=1`, reduced motion off (`3.2 s` settle).
2. At `1200x630`, the live hero was cramped for a social thumbnail: the top navbar and CTA buttons added clutter, the `Onza` baseline sat very close to the bottom edge, and `Class of` rendered `2024` (from `data-tick-from="2024"`) rather than `2028`.
3. Rendered a dedicated `1200x630` composition in the scratch directory (`og-preview.html`) using `/styles/tokens.css` and `/styles/base.css` (light theme, 12-column `--rule-2` hairlines), featuring:
   - Spec strip: `BS Computer Science` · `Cagayan State University` · `Class of 2028` + `mcleinjeionza.vercel.app`
   - Static Extract / Transform / Load particle field from `/assets/images/hero-field-grey.svg` and `/assets/images/hero-field-orange.svg`
   - Display name `McLein Jei Onza` and intro line `I build full-stack apps and train in data engineering.`

## Output & Verification
- **Image**: `assets/images/og-image.jpg` — `1200×630` JPEG (quality `85`), `57 KB` (under `300 KB`). Visually verified via `read_file`: crisp Geist/Geist Mono typography, balanced margins, legible at thumbnail scale.
- **Meta alt updates** (`index.html`, lines 26 and 31 only): updated `og:image:alt` and `twitter:image:alt` to describe the new Instrument card and Extract/Transform/Load particle field. No other lines in `index.html` were modified.
