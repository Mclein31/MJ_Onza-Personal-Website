# F-N: Work numerals + "More on GitHub" card (2026-11-19)

Files changed: `css/work.css` only (no markup, JS or test edits). Not committed.

## 1. Numerals (all five: 01 AdvanCare, 02 MedCore, 03 SERVIO, 04 MedRec, 05 Mulat Media)
Cause: `.project__num` sat behind the gallery (z-index 0, same box), so every mockup covered most of it.
Now each numeral gets its own clear space, sized from the card (`--num-size: clamp(4.5rem, 16cqi, 9rem)`):
- **Pinned deck (desktop/laptop):** `.work.is-pinned .gallery__slide` gets `padding-left: var(--num-col)`. The gallery box, controls and
  card width are unchanged; contained images just centre in what is left. Costs little where images are already
  letterboxed (short laptops), ~20% image width where they fill the box (1440x900). Canvases carry ~7% empty margin,
  so the column may reach 3cqi into it.
- **Stacked cards (tablet portrait, <=860 wide landscape):** the numeral gets a band above the gallery (`padding-top`), FIG label
  baseline-aligned to the band; the image is not shrunk. Numerals are full red here (no `.is-current` when unpinned).
- Non-current numerals: opacity 0.5 (was 0.55), now clear of the mockups, so they read as numbers.
- Phones (<=700px): still hidden (phone block unchanged; my rules are inside `min-width: 701px` / `.is-pinned`).
- Compact laptop block (600-759px high): own sizing (`15cqi`, 8px media pad).
- AdvanCare award badge used to sit on top of the "01" in cards <=560px wide. In the pinned deck it now starts after the
  numeral column and wraps; the FIG label is hidden on that one card (badge + numeral + label do not fit one row). In
  561-640px cards the award line used to run under the gallery controls (pre-existing); it now stops 340px from the right.

Screenshots (card current, per project), in this folder:
- 1440x900: `FN-1440x900-01.png` ... `-05.png`
- 1280x720: `FN-1280x720-01.png` ... `-05.png`
- Tablet 834x1194 (stacked): `FN-834x1194-01.png` ... `-05.png`
Also looked at 1366x768 and 1920x1080 (all five steps): numerals whole, no overlap.
Note: at 1440x900 card 01 is never the *current* card (first card's centre is further from the viewport centre than card 02 even at scroll 0,
logic in `js/work.js` `update()`), so "01" shows at the dim 0.5 there; it still reads clearly. Request for M3/js owner: treat card 0 as current when p = 0.

## 2. "More on GitHub" card (`.work .project.project--more`)
Back to a solid ink fill: `background: var(--color-ink); color: var(--color-paper)` with a 1px ink border. Kept from F-W: no red bottom border,
title weight 600, muted mono URL, plain arrow (nudges on hover), subtle hover (fill steps to `--color-ink-2`).
- Light theme: black card. Dark theme: `--color-ink` is the cream token, so the card is the cream inverse, exactly as before F-W; it stands
  well apart from the near-black page (a literal black card would vanish there).
- URL colour `color-mix(paper 68%, ink)`: ~8:1 on black (light), ~6.5:1 on cream (dark), both above AA 4.5:1 (computed from token values; axe not run on this card).
- Text stays bottom-left on the tall desktop card (matches the project cards' captions at the same baseline); not centred.
Before = F-W's outlined card (reproduced by an injected override), after = now:
`FN-more-1440x900-{light,dark}-{before,after}.png`, `FN-more-390x844-{light,dark}-{before,after}.png`.

## Tests
`npx playwright test tests/spacing.spec.mjs tests/project-polish.spec.mjs --project=desktop-chrome --project=pixel-7 --project=iphone-14`
-> 18 passed, 18 skipped (desktop-only tests skipped on phones), 0 failed.

## Requests
- `js/work.js`: make the first card current at scroll progress 0 (see note above).
