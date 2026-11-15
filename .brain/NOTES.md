---
type: notes
title: Personal Website Reference Notes
project: Personal Website
tags:
  - notes
  - reference
last_updated: 2026-11-15
---

# 📝 Personal Website — Technical Notes

## 🎯 Projects in the Work Gallery (current order, verified 2026-11-15)
Slides are `assets/images/projects/<project>-N-{1600,2400,3200}.webp` (srcset) unless noted. Each of the first
four decks ends with its promo video slide and has a "Watch the product video" button.
1. [[AdvanCare]] — 6 slides + the 30s promo with voiceover (2026-11-01). Source: `AdvanCare/promo_video/AdvanCare-promo-30s.mp4` (1080p60); same re-encode command as SERVIO plus `-vf fps=30`. 🏆 2nd, Cagayan Innovation Hack 2026. Role: McLein built the software (resident app, staff console, website, API); the team coach delivered the pitch. Copy must not say McLein pitched it.
2. [[MedCore1|MedCore]] — 6 slides + the 32s promo with the owner's voiceover (2026-11-01). Source: `MedCore1/docs/media/production/medcore-promo.mp4` (1080p60); same re-encode command as SERVIO plus `-vf fps=30`. Poster: end card at 31.5s.
3. [[SERVIO]] — 4 slides + the 39s promo video (v2, feature-led, 2026-11-01). Source: `SERVIO/promo-video/servio-promo-vo.mp4` (its Remotion project is gone); re-encode with `ffmpeg -i <src> -c:v libx264 -preset slow -crf 26 -maxrate 3M -bufsize 3M -g 60 -keyint_min 60 -sc_threshold 0 -profile:v high -level 4.1 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k assets/video/servio-promo.mp4`.
4. [[MedRecord_App|MedRec]] — 3 slides (`medrec-1..3.webp`, single size, Oct 29 captures) in its warm folio look (ivory/aubergine, Remy): records + Medical ID + QR pass; Ask Remy + health summary; share + profile. Expo web with intercepted demo data (2026-10-29). Plus the 30s promo (2026-10-31). Source: `MedRecord_App/promo_video/medrec-promo.mp4`; same re-encode command as SERVIO.
5. [[Mulat_Media_Website]] — 3 slides; the card links to the live site (mulat-media.vercel.app).

Removed: Hanguk Grill card (2026-10-25; still mentioned in the Journey), Cipher Shift card + live demo window,
`js/demo.js` and `demos/` (2026-11-04, owner request; do not re-add or capture it; the demo had been a copy of the
app's web files in `demos/cipher-shift/` with font paths fixed and Tesseract pinned to 4.1.4). Phone frames have a 50px
status-bar inset so the Dynamic Island never covers app headers.

Promo buttons all read "Watch the product video" plus the running time as a mono timecode (`.project__promo-time`, `aria-hidden`; a `.sr-only` ", N seconds" follows for screen readers). When a film is re-cut, update the timecode, the sr-only seconds and the slide's aria-label.

## 🔁 Regenerating Slides
Current recipe is "Gallery refresh (2026-11-04)" below; the 2026-10-31 notes in this section remain for history and for MedRec.

Slides use **MockUPhone** device frames ([oursky/mockuphone.com](https://github.com/oursky/mockuphone.com), Apache-2.0; device art from Apple Design Resources): iMac 2015 Retina, MacBook Pro 14 silver, iPad Air 5 space grey, iPhone 14 Pro space black. Owner rejected hand-drawn CSS frames as fake (2026-10-31). Each screenshot is cover-fit into the frame's screen rect from MockUPhone's `device_info.json` (iMac: pasted over its black screen; others: under the frame), on a **transparent** 2000×1125 canvas with a soft shadow, saved as WebP with alpha (q84). No brand text or logos in slides.
- **Source material**: temporary capture scripts, raw screenshots and device-frame working files were removed during cleanup on 2026-11-01. Published WebP slides remain in `assets/images/projects/`; recreate working captures from the source applications when updating slides.
- **Exact sizes**: MacBook Pro 14 screen = 1512×982 @2, iPad Air 5 = 820×1180 @2, iPhone 14 Pro = 393×852 @3; web captures for the phone are taken at 393×798 and get a drawn iOS status bar (54pt) on top. iMac is 16:9, so 16:10 dashboards lose their bottom 10%.
- **Sources** (2026-10-31): the Oct 25 raw captures were lost, so AdvanCare, MedCore, SERVIO and Cipher Shift screens were cut from the old flat slides (SERVIO Tracking perspective-unwarped; those phone screens keep their old status bar). The AdvanCare overview has the old phone baked into its lower right, so slide 1 keeps a phone over that spot. Mulat Media recaptured live (Abacus blocked, stats pill hidden, 5s wait for its loader); MedRec recaptured from Expo web with `mrcapture.mjs` (all `/api/*` mocked). (Superseded for AdvanCare/MedCore/SERVIO/Mulat by the 2026-11-04 native recapture.)
- SERVIO: `ng serve`, set `CapacitorStorage.servioDemoConnection` → `{"useMockApi":true}`, sign in with any email + `TEST_OTP` 123456.
- AdvanCare app: HashRouter (`/#/home`); seed `advancare.v1` = `{onboarded:true, session:{…, role:"household"}}`; block API calls.
- AdvanCare staff console: intercept `/api/v1/admin/*` with demo JSON (`me`, `overview`, `service-requests`).
- MedRec: `CI=1 npx expo start --web --port 8082` in `apps/mobile`; seed `medrec.session.v2` + `medrec.onboarded.v2`; intercept `/api/*`. Demo user Juan Dela Cruz; 393×852 @3x; a 50px status band is added in the frame. Routes used: `/`, `/medical`, `/share`, `/share/s1`, `/profile`, `/remy` (+ click "Find my latest blood test"), `/summary` (+ click "Write my summary"). `/record/explain` renders empty with demo data. Fonts and Remy PNGs come from `apps/mobile/assets/`.
- Mulat Media: live site pages (index, articles, about) at 1440×900 and 390×844.

### Gallery refresh (2026-11-04)
Owner feedback (UI/UX critique): slides looked blurred. All galleries except MedRec were recaptured at native resolution and are now 3200×1800 transparent WebP slides served as `-1600/-2400/-3200.webp` via `srcset` (q90, sharp_yuv). SERVIO 4 slides, AdvanCare 6, MedCore 6, Mulat 3; MedRec keeps its Oct 29 slides (its UI was mid-change in other sessions). Cipher Shift card, live demo window, `js/demo.js` and `demos/` removed at the owner's request; do not re-add or capture it.
- Phones: iPhone 16 simulator (iOS 18.6, 1179×2556 = MockUPhone iPhone 15 Pro), status bar overridden, framed on mockuphone.com (Black Titanium). Tablets: iPad Air 11 (M3) sim = iPad Air 5 frame.
- Dashboards (AdvanCare staff console, MedCore) use the **iMac** frame (owner: dashboards are for monitors). Capture 1920×1080 @2x; MockUPhone's iMac template is only 2000px, so the screenshot is pasted at full resolution into its screen rect (154,318)-(1845,1270) at composite time; never use the 2000px site output directly.
- Laptop/web pages (Mulat) use MacBook Pro 14 with a 64px (32pt) black top band so the notch never covers content (full-screen macOS layout). iPhone/iPad web pages are real Safari captures in the simulator (status bar + Safari chrome) — no bare page captures, so the Dynamic Island never covers the site.
- Data must look real, not demo: SERVIO offline demo with demo-only links hidden and app clock pinned to the status-bar time; AdvanCare resident app on-device data with filled forms, console via Playwright-intercepted JSON (Rowena Taguinod, Cagayan barangays); MedCore real API against a separate local `medcore_capture` DB seeded with its own seed (facility name without "(Demo)"), patient Teresa Navarro.
- Opening live Mulat pages in simulator Safari counted ~6 extra visits on its Abacus counter (each new tab is a session); laptop captures block Abacus and hide `#mulatStatsWidget`.

## 🖼️ Image Formats
Every image the page loads is WebP or SVG (2026-11-02). Photos: `cwebp -q 82 -m 6 -sharp_yuv -metadata icc` at their original size (most award/training photos are Display P3, so the ICC profile must be kept; check `sips -g orientation` first, as cwebp ignores EXIF rotation). PNG icons: `cwebp -lossless -z 9 -metadata icc` (pixel-identical, smaller than lossy). Two exceptions stay as they are: the favicons (`assets/Logo/favicon-circle-*.png`, since PNG is the safe favicon format) and `og-image.jpg` (social preview crawlers handle WebP unevenly, and visitors never download it).

## 🎨 Theme Tokens
Current tokens (`css/tokens.css`, verified 2026-11-15) use OKLCH: cool white/gray paper (`--color-paper` ≈ `oklch(97.2% 0.006 215)`),
deep ink (`oklch(16% 0.032 250)`) and one orange accent (`oklch(68% 0.172 50)`); dark theme under
`:root:not([data-theme="light"])`. Hero name accents use light orange `#e8894d`. `theme.js` still sets `theme-color`
to `#f2f3ef` / `#0b0c0d` (a test asserts it).
- _Historical (v3, 2026-10-25)_: Dark bg `#0b0c0d`, ink `#f2f3ef` · Light bg `#f2f3ef`, ink `#0b0c0d`; accent (signal lime) `#c8f03c`, accent text on light `#4a6400`. No longer used.

## ⚠️ Android Chrome auto-darken
Chrome on Android repaints pages that don't declare dark support when the phone is in dark mode (borders fade, backgrounds go grey). Keep `<meta name="color-scheme" content="light dark">` and `color-scheme: only light` on the light theme. Reproduce: launch Chrome with `--enable-features=WebContentsForceDark`, emulate `colorScheme: 'dark'`, store `portfolio-theme=light`.

## 📈 View counter (Abacus)
Visits: `mcleinonza/portfolio_views` (created 2026-10-31 at 232; the old `portfolio_visits` key stopped at 526); likes: `mcleinonza/portfolio_likes`. The admin key for `portfolio_views` is in `.env.local` (git-ignored, keep private): to correct the count, `curl -X POST "https://abacus.jasoncameron.dev/set/mcleinonza/portfolio_views?value=N" -H "Authorization: Bearer $ABACUS_VIEWS_ADMIN_KEY"`. Since 2026-11-03 only the **first visit per browser** increments (localStorage `site_user_has_visited` + browser lock + one-year HttpOnly `portfolio_visited` cookie in `api/stats.js`; see DECISIONS). Local hosts and automated browsers never increment. (Corrected 2026-11-15: this note previously said every visit counts, which was true only 2026-11-01 to 2026-11-03.)

## 🌐 Domains and deployment
Hosted on Vercel (project `onzamj`), deploying from `main`. Contact form posts to FormSubmit's AJAX endpoint for the
owner's address; a new address must be activated by FormSubmit before it delivers (see TODO).

Domain Change (2026-11-02): Production domain changed in Vercel to `mcleinjeionza.vercel.app`; `onzamj.vercel.app` remains configured as a 307 redirect to the new address. Vercel project name remains `onzamj`. The canonical link, `og:url` and `og:image` in `index.html` and the README's live link now use the new domain (uncommitted as of 2026-11-02; goes live with the next push).
- Update 2026-11-15: committed in `598e5b9` and live; `onzamj.vercel.app` still answers with a temporary 307 (checked by curl).

## ⚠️ Known Limitations
- ES modules don't load from `file://`; use a local server (`npm run serve` or `tests/serve.mjs`).
- AdvanCare staff console slides use intercepted demo data (no real staff login); MedRec has a single image.
  (2026-11-15: MedRec now has 3 single-size slides; the "single image" wording is outdated.)
- Student Leader was awarded at graduation, June 2022, the same date as With High Honors; both sit at the end of the newest→oldest order. The Student Journalist card was removed at the owner's request (2026-10-31); its team photo stays in the photo strip.

## 🧪 Testing gotchas
- Tests mock Abacus, `/api/stats`, the contributions API and FormSubmit; a run never counts visits/likes or sends email.
- `responsive.spec` desktop cases can time out waiting for the Gmail typing animation under parallel load; they pass at `--workers=2` (same on untouched HEAD; 2026-11-04). Typing allowance was raised in `0843d76`.
- `motion.spec` footer-vista test was flaky once on iphone-14 (passes on rerun).
- WebKit may need `npx playwright install webkit` after Playwright upgrades; `tests/serve.mjs` must answer byte ranges for WebKit MP4 playback.
- No `"type": "module"` in `package.json` (keeps Vercel's handling of `api/*.js`); test files use `.mjs`.
