# FA report — About section follow-ups (2026-11-19)

## Files changed
- `index.html`: #about only. `band--night` removed from the section class (now `section about`).
- `css/about.css`. `css/base.css` untouched: the `.band--night` rules stay (nothing uses them now, so they are dead; safe to delete later).

## 1. "Not full width" strip
I could not reproduce a geometric cause. In Chrome (Pixel 7, 390, 375, 768, 1440) and WebKit (iPhone 14), `#about` is exactly the viewport width (left 0, right = innerWidth, no margin, no scrollbar math), `scrollWidth == innerWidth`, and at every scroll position (also after a sideways scrollTo) the band stays 0..innerWidth. The only wider things (hero icon track, 2571px) are inside `.hero { overflow: clip }`, so nothing unclipped overflows.
Most likely cause on a real iPhone: a transient visual-viewport wider than the layout viewport (rubber-band / the carousel's horizontal drag), where the area outside the layout width shows the cream canvas, visible only against a black band. That is not fixable inside the band. Because #about now sits on page paper (same colour as the canvas), a strip like that is invisible. I also set `.about { width: 100% }`. Request for the owner/M1 if the strip still shows in cream sections: test on the real device with Safari Web Inspector.

## 2. Light / dark page scheme
- Removed the local night token re-map. #about uses the page tokens: cream paper and ink in light, the dark page tokens in dark. Explicit `background: var(--color-paper)`.
- Hairline: `border-top: 1px solid var(--color-rule)` full width to separate it from Work; the shared phone `.section::before` rule is hidden on #about so there is no double line.
- `.hl` "how data flows.": now uses the page highlight tokens (ink box with cream text in light, cream box with ink text in dark), like the Journey boxes. Line-height 1.32 desktop / 1.28 phone kept, so the box never touches neighbouring lines (checked in screenshots).
- "do." accent: `--color-signal-text` (already via `em.serif`). Also moved to `--color-signal-text`: open-row number (01/02/03), the desktop discipline index numerals, the giant accordion numerals (failed axe in light with plain signal red on the card), link hover.
- Muted Model / Automate words: mix raised from 56% to 62% ink so the closed rows pass in light; open-row card = `--color-paper-2`; +/- buttons use `--color-card-2` (open one stays signal red with ink icon); focus rings follow `--color-focus` from the page tokens (red-dark in light, soft red in dark).
- Desktop layout and the accordion behaviour unchanged.

## Tests
- Axe (wcag2a/aa) on #about, both themes, Build open and Model open, at 390x844, 375x667, 1440x900: **0 violations** (one violation on desktop light numerals was fixed first, see above).
- `npx playwright test tests/spacing.spec.mjs tests/mobile.spec.mjs --project=desktop-chrome --project=pixel-7 --project=iphone-14`: **22 passed, 0 failed, 23 skipped** (skips are the desktop-only specs on phone projects, as before).

## Screenshots (looked at all)
`/private/tmp/claude-501/-Users-mclein-Documents-Developer-Personal-Projects-Personal-Website/ebe03019-080d-4a36-8427-d436a524bb74/scratchpad/fa/`: `after-a-{m,s,d}-{light,dark}.png` (m 390x844, s 375x667, d 1440x900), `axe-390-light-model.png` (nav-jump position, Model open), `edge-{m,d}.png` (Work/About boundary showing the hairline), `before-*` for comparison.

## Notes
- Phone: `.section` keeps `margin-top: var(--section-gap-s)` at <=960px, so the hairline sits about 48px below the end of Work; this reads fine.
- Another agent (F-N) claims `css/about.css`; re-read it before editing.
