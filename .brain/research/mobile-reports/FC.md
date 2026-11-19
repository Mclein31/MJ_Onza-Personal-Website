# FC report — contact section follow-ups (2026-11-19)

## Files changed
`index.html` (#contact only), `css/contact.css`, `css/wallet.css`, `css/copier.css`, `js/wallet.js`, `tests/interactions.spec.mjs` (1 selector), `tests/wallet.spec.mjs` (2 assertions). `js/copier.js` and `js/contact.js` untouched (`data-copy` stays: it drives the copier's COPY).

## 1. Gmail card
- Removed the Copy button (`.pass__copy`, its `data-copy`) and all its CSS (4 rules). No JS was tied to it.
- New layout: a compose window where To / Subject share one 64px label column (chip and subject text start on the same x), the typed message under them, and the Email action in its own row (right-aligned on desktop, full width and 44px tall on phones). Compose now fills the card width and flexes, so nothing is cramped or clipped (checked 320 to 1440). Gmail white/red kept. `--front` raised 260 to 276 (284 on <=420px) so the compose window fits without overflow; the `.pass__acts` / `.pass__go` structure responsive.spec relies on is kept.

## 2. Contact is on the normal page scheme
- Removed `band--night` and the local dark token re-map. #contact now uses page tokens: cream/ink in light, the dark page tokens in dark. Heading accent uses `--color-signal-text` (AA in both themes); status badge, id card, Send a message button (ink pill, red arrow) and focus rings follow the page tokens. Added a hairline top rule to separate it from Training.
- The message dialog (`.msg__panel`) keeps its own night panel via a local re-map (it lives outside the section). Say so if the owner wants it light too.
- Wallet cards keep brand colours. The copier machine keeps its fixed dark body (reads on both themes).
- Dead markup removed: the three-thumbnail strip `.contact__work` (hidden on phones by M7, now removed at every size to make the desktop section fit one screen). The "See the work" link stays on desktop.

## 3. 100svh
- `.contact { min-height: 100svh }`, content centred. Desktop is now two columns: heading (moved into the left column), badge, intro, copier on the left; the card on the right. Measured: 900px at 1440x900, 768px at 1366x768 (short-screen compaction block), 800px at 1000x800.
- Phones: content is 1300px (wallet alone is 444px; copier plus its slip window add more), so it cannot fit 844 or 667. It grows naturally (min-height only), as agreed.
- The section pads for the nav itself, so I added `scroll-margin-top: calc(-1 * var(--nav-clear))`: a nav jump now lands the section flush with the viewport top (before, scroll-padding pushed it 88px down and the bottom was cut).

## 4. Peer requests (from personal-website-70, passed on as owner feedback)
- **Receipt sheet**: slip paper is now #FFFFFF (page cream was identical), with a hairline plus soft drop-shadow filter on the clipping window (the slip's own clip-path would cut an outline), torn zigzag edge kept, print animation unchanged, full content width and centred on phones, email on one line. Verified in state done: `x-1440-900-{light,dark}-copy.png`, `x-390-844-{light,dark}-copy.png`.
- **GitHub card**: grid now fluid. `js/wallet.js` computes the week count from the grid width (cell about 13px, 3px gap, 7 rows, max 52 weeks), CSS uses `repeat(var(--cols), 1fr)` with `aspect-ratio: 1` cells; levels unchanged, dark palette kept. Card body is a flex column (typed line, grid, footer row spaced evenly: 28px gaps on phones, 16px on desktop, 18px bottom padding); footer is a new `.pass__foot` row so Follow is centre-aligned with the text. Measured: grid fills the body width at 390 (288px, 126 days), 375, 320, 1000, 1440 (577px, 252 days). On a phone the footer text wraps to two lines. Shots: `gh-*.png`.

## Tests (desktop-chrome, pixel-7, iphone-14; wallet, responsive, interactions)
120 passed, 84 skipped (desktop-only), 0 failed. Updated: `interactions.spec` copy test now clicks `.copier__btn[data-copy]`; `wallet.spec` grid count 126 became "non-zero and a multiple of 7" (count now depends on width).
Earlier run of mobile + redesign: only failure is `redesign.spec.mjs:131` axe (light) on pixel-7/iphone-14: contrast on `.work__label`, `.journey__eyebrow`, `#activity .label`. None are in #contact (whole-page axe filtered to contact: none), so it belongs to the Work/Journey/Activity owners.

## Axe on #contact (wcag2a/aa)
0 violations at 390x844, 375x667, 1440x900, light and dark.

## Screenshots
Scratchpad `/private/tmp/claude-501/-Users-mclein-Documents-Developer-Personal-Projects-Personal-Website/1488810b-6b24-4163-b747-75a30466cc4d/scratchpad/fc/`: `c-{m,s,d}-{light,dark}.png` (viewport; m=390x844, s=375x667, d=1440x900) and `c-*-full.png` (whole section), `b-*` earlier pass, `x-*` copier/extra sizes, `gh-*` GitHub card.

## Notes
- Slip window reserves about 100px above the copier even when idle, so there is visible blank space between card and copier on phones and above the machine on desktop (M7 design, kept).
