# Phone layout pass — shared brief (2026-11-19)

Orchestrated pass: 7 workers (M1–M7) run at the same time, each owning a separate slice of files.
Read this whole brief before you touch anything.

## What the owner said (verbatim intent)
"The phone layout looks bad and isn't mobile friendly. Details get covered, there's too much going on in
the hero, the receipt copy (copier slip) isn't centred or full width. Make the site feel easy to use and
minimal, with fewer things going on and less text. Remove the pinpoint location etc. Keep the minimalist
vibe of my old website."

## The "old website" vibe to bring back (pre-redesign, commit 0bc6ecc)
Phone screenshots of the old site: `/private/tmp/claude-501/-Users-mclein-Documents-Developer-Personal-Projects-Personal-Website/73a6d748-f47c-42ba-8ab4-bec3e3b0a7e3/scratchpad/shots-old/sheet-*.jpg`
Current site, same viewport (iPhone 14, 390×844): `.../scratchpad/shots-before/sheet-*.jpg` (same folder, `shots-before`).
You can also read the old code with `git show 0bc6ecc:css/<file>.css` and `git show 0bc6ecc:index.html`.

What made the old phone layout feel minimal:
- One short line of meta above the name ("McLein Jei Onza · CS, Cagayan State University"), no coordinates, no clock.
- Tech tags as plain Geist Mono text separated by spacing, **not bordered pill chips**.
- No giant decorative numerals behind images; images sat calmly in soft cards.
- Small, quiet CTAs; the tagline in regular weight with one or two highlighted words.
- Lots of air, few borders, few labels. One idea per screen.

Keep the current Signal palette, Geist / Geist Mono, red accents and section order. This is a **phone
simplification**, not a re-theme.

## Hard rules
1. **Phone scope.** New layout rules go inside `@media (max-width: 700px)` (or the file's existing ≤860px
   phone block when it already handles the same thing). Desktop and laptop (≥861px) must look exactly as they
   do now. Exception: removing the location/coordinates/clock (M1, M7) applies at every size.
2. **Stay in your files.** Only edit the files listed for your worker. `index.html` is shared: edit **only your
   own section's markup**, with small targeted string replacements, never a whole-file rewrite, and re-read the
   lines right before each edit (other workers are editing other sections of the same file).
3. **Keep the owner rules in `.brain/DECISIONS.md` (2026-11-18 entry):** no red hero, no thin fonts / serif in
   headings, no page-spanning line, highlight boxes never cover neighbouring text, no duplicate stack ticker,
   no file-drawer, wallet cards keep brand colours, hero icon carousel stays (it may get smaller/quieter).
   Pinned Work and Journey scrolling on desktop stays.
4. **Nothing may be covered.** Text, buttons and gallery controls must never sit under the fixed nav or under
   other elements. No horizontal page scroll at 320, 375, 390 and 430px widths.
5. **Less text** means cutting or hiding secondary copy on phones (`display:none` in the phone media query, or
   shortening the copy when the shorter version also reads well on desktop). Never delete the only description
   of a project, award or milestone; shorten it instead.
6. Tap targets ≥ 44px. Body text ≥ 15px on phones. Keep `prefers-reduced-motion` behaviour.
7. **Do not commit, push or deploy.** The owner commits. Do not touch `.brain/` files other than your report.
8. Tests: if a Playwright assertion checks something you intentionally removed, update that one assertion
   with a targeted edit and say so in your report. Run your relevant specs on `pixel-7` and `iphone-14`
   (`npx playwright test tests/<spec> --project=pixel-7 --project=iphone-14`). The dev server is already on
   port 4173 (`tests/serve.mjs`); reuse it.
9. **Verify visually** before you finish: take phone screenshots (390×844 and 375×667) of your sections and look
   at them. Then write your report.

## Report
Write `.brain/research/mobile-reports/M<n>.md`: files changed, what you removed/hid, what you changed, test
results (pass/fail with output), screenshot paths, anything you could not do. Keep it short.

## Workers and file ownership
| ID | Scope | Files you may edit |
|----|-------|--------------------|
| M1 | Hero | `css/hero.css`, `js/hero.js`, the `#top` hero section in `index.html` |
| M2 | Nav, global phone rhythm (section padding, heading scale, section labels) | `css/nav.css`, `css/base.css`, `css/tokens.css`, `css/fx.css`, `css/reveal.css`, `js/ui.js`, `js/scroll.js`, the `<header class="nav">` block in `index.html` |
| M3 | Work | `css/work.css`, `js/work.js`, `js/gallery.js`, `js/video.js`, `js/lightbox.js`, the `#work` section in `index.html` |
| M4 | About + Journey | `css/about.css`, `css/journey.css`, `js/journey.js`, the `#about` and `#journey` sections in `index.html` |
| M5 | Activity + Stack | `css/activity.css`, `css/stack.css`, `js/activity.js`, `js/contributions.js`, the `#activity` and `#stack` sections in `index.html` |
| M6 | Recognition + Training | `css/recognition.css`, `css/drawer.css`, `js/drawer.js`, the `#recognition` and `#training` sections in `index.html` |
| M7 | Contact, copier, wallet, footer, floating stats pill (it lives in the footer) | `css/contact.css`, `css/copier.css`, `css/wallet.css`, `css/footer.css`, `js/contact.js`, `js/copier.js`, `js/wallet.js`, `js/vista.js`, `js/stats.js`, the `#contact` section and `<footer>` in `index.html` |

If you need a change in someone else's file, do not make it: write it under "Requests" in your report.
