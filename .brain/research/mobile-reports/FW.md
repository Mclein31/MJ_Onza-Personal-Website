# FW: Work "More on GitHub" card (2026-11-19)

Files changed: `css/work.css` only (no markup edit needed). Not committed.

## What changed
- Removed the black slab, the 6px red `border-bottom` and the 900-weight headline at every size.
- `.project--more` is now a quiet outlined card in the page colours: transparent fill, 1px `--color-rule` border, `--radius-card`.
  "More on GitHub" at weight 600 (`--text-xl`), URL in muted Geist Mono, a plain `→` on the right (CSS `::after`).
- Hover (hover devices only): border darkens, faint ink tint, arrow nudges 4px. Removed the lift/scale transform. `:focus-visible` has a 2px ink outline.
- Selectors are `.work .project.project--more` because `css/texture.css` (loaded later) re-colours `.project.project--more` to flat ink; raising specificity avoids editing that file.
- Desktop pinned deck: same width (`min(32vw, 420px)`), `align-self: stretch`, `margin-bottom: 140px`; text sits bottom-left of the card.
- Phones / non-pinned: full-width single row (title + URL left, arrow right), ~96px tall (≥44px tap target), last item in the stack. Desktop at ≥861px pinned layout keeps its card shape.

## Screenshots
- `.brain/research/mobile-reports/FW-390.png` (390x844, iPhone-size, no horizontal scroll: scrollWidth 390)
- `.brain/research/mobile-reports/FW-1440.png` (1440x900, end of the pinned deck; the hover state was also viewed)

## Other red/heavy border accents in css/ (not edited)
- `css/contact.css:84`: `border-top: 4px solid var(--red)` (contact card/slip top edge; same "coloured slab edge" style, candidate for M7).
- `css/wallet.css:13`: `.pass--mail { border-top: 3px solid #ea4335 }`: Gmail brand strip on a wallet card, intentional (brand colours rule).
- `css/work.css:145` was the only red `border-bottom: Npx solid`, now removed. Other `border-bottom` hits are 1px hairlines (hero.css:21, about.css:7/96).

## Not done
- No Playwright spec was run (CSS-only change; no assertion references `.project--more` styles; `js/work.js` excludes it from the project list unchanged). 375x667 / 320 / 430 not captured.
