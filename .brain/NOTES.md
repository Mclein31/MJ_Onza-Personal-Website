---
type: notes
title: Personal Website Reference Notes
project: Personal Website
tags:
  - notes
  - reference
last_updated: 2026-11-02
---

# 📝 Personal Website — Technical Notes

## 🎯 Projects in the Work Gallery (order)
1. [[AdvanCare]] — 3 slides (staff console + app) + the 30s promo with voiceover as slide 4, also behind a "Watch the product video" button (2026-11-01). Source: `AdvanCare/promo_video/AdvanCare-promo-30s.mp4` (1080p60); same re-encode command as SERVIO plus `-vf fps=30`. 🏆 2nd, Cagayan Innovation Hack 2026. Role: McLein built the software (resident app, staff console, website, API); the team coach delivered the pitch. Copy must not say McLein pitched it.
2. [[MedCore1|MedCore]] — 3 slides (dashboard + patient app, from MedCore QA captures) + the 32s promo with the owner's voiceover as slide 4, also behind a "Watch the product video" button (2026-11-01). Source: `MedCore1/docs/media/production/medcore-promo.mp4` (1080p60); same re-encode command as SERVIO plus `-vf fps=30`. Poster: end card at 31.5s.
3. [[SERVIO]] — 2 slides (new UI, offline demo mode) + the 39s promo video (v2, feature-led, 2026-11-01) as slide 3, also behind a "Watch the product video" button. Source: `SERVIO/promo-video/servio-promo-vo.mp4` (its Remotion project is gone); re-encode with `ffmpeg -i <src> -c:v libx264 -preset slow -crf 26 -maxrate 3M -bufsize 3M -g 60 -keyint_min 60 -sc_threshold 0 -profile:v high -level 4.1 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k assets/video/servio-promo.mp4`.
4. [[MedRecord_App|MedRec]] — 3 slides in its warm folio look (ivory/aubergine, Remy): records + Medical ID + QR pass; Ask Remy + health summary; share + profile. Expo web with intercepted demo data (2026-10-29). Slide 4 is the 30s promo, also behind a "Watch the product video" button (2026-10-31). Source: `MedRecord_App/promo_video/medrec-promo.mp4`; same re-encode command as SERVIO.
5. [[Mulat_Media_Website]] — 4 slides (original screenshot + live-site captures).
6. [[CaesarCipherApp_FINAL|Cipher Shift]] — 1 image + "Click me" live demo window (`demos/cipher-shift/`, a copy of the app's web files; font paths fixed, Tesseract pinned to 4.1.4).
Hanguk Grill card removed (2026-10-25); still mentioned in the journey timeline. Phone frames have a 50px status-bar inset so the Dynamic Island never covers app headers.

Promo buttons all read "Watch the product video" plus the running time as a mono timecode (`.project__promo-time`, `aria-hidden`; a `.sr-only` ", N seconds" follows for screen readers). When a film is re-cut, update the timecode, the sr-only seconds and the slide's aria-label.

## 🔁 Regenerating Slides
Slides use **MockUPhone** device frames ([oursky/mockuphone.com](https://github.com/oursky/mockuphone.com), Apache-2.0; device art from Apple Design Resources): iMac 2015 Retina, MacBook Pro 14 silver, iPad Air 5 space grey, iPhone 14 Pro space black. Owner rejected hand-drawn CSS frames as fake (2026-10-31). Each screenshot is cover-fit into the frame's screen rect from MockUPhone's `device_info.json` (iMac: pasted over its black screen; others: under the frame), on a **transparent** 2000×1125 canvas with a soft shadow, saved as WebP with alpha (q84). No brand text or logos in slides.
- **Source material**: temporary capture scripts, raw screenshots and device-frame working files were removed during cleanup on 2026-11-01. Published WebP slides remain in `assets/images/projects/`; recreate working captures from the source applications when updating slides.
- **Exact sizes**: MacBook Pro 14 screen = 1512×982 @2, iPad Air 5 = 820×1180 @2, iPhone 14 Pro = 393×852 @3; web captures for the phone are taken at 393×798 and get a drawn iOS status bar (54pt) on top. iMac is 16:9, so 16:10 dashboards lose their bottom 10%.
- **Sources** (2026-10-31): the Oct 25 raw captures were lost, so AdvanCare, MedCore, SERVIO and Cipher Shift screens were cut from the old flat slides (SERVIO Tracking perspective-unwarped; those phone screens keep their old status bar). The AdvanCare overview has the old phone baked into its lower right, so slide 1 keeps a phone over that spot. Mulat Media recaptured live (Abacus blocked, stats pill hidden, 5s wait for its loader); MedRec recaptured from Expo web with `mrcapture.mjs` (all `/api/*` mocked). Recapture AdvanCare/MedCore/SERVIO from the running apps for sharper screens.
- SERVIO: `ng serve`, set `CapacitorStorage.servioDemoConnection` → `{"useMockApi":true}`, sign in with any email + `TEST_OTP` 123456.
- AdvanCare app: HashRouter (`/#/home`); seed `advancare.v1` = `{onboarded:true, session:{…, role:"household"}}`; block API calls.
- AdvanCare staff console: intercept `/api/v1/admin/*` with demo JSON (`me`, `overview`, `service-requests`).
- MedRec: `CI=1 npx expo start --web --port 8082` in `apps/mobile`; seed `medrec.session.v2` + `medrec.onboarded.v2`; intercept `/api/*`. Demo user Juan Dela Cruz; 393×852 @3x; a 50px status band is added in the frame. Routes used: `/`, `/medical`, `/share`, `/share/s1`, `/profile`, `/remy` (+ click "Find my latest blood test"), `/summary` (+ click "Write my summary"). `/record/explain` renders empty with demo data. Fonts and Remy PNGs come from `apps/mobile/assets/`.
- Mulat Media: live site pages (index, articles, about) at 1440×900 and 390×844.

## 🖼️ Image Formats
Every image the page loads is WebP or SVG (2026-11-02). Photos: `cwebp -q 82 -m 6 -sharp_yuv -metadata icc` at their original size (most award/training photos are Display P3, so the ICC profile must be kept; check `sips -g orientation` first, as cwebp ignores EXIF rotation). PNG icons: `cwebp -lossless -z 9 -metadata icc` (pixel-identical, smaller than lossy). Two exceptions stay as they are: the favicons (`assets/Logo/favicon-circle-*.png`, since PNG is the safe favicon format) and `og-image.jpg` (social preview crawlers handle WebP unevenly, and visitors never download it).

## 🎨 Theme Tokens (v3)
- Dark: bg `#0b0c0d`, ink `#f2f3ef` · Light: bg `#f2f3ef`, ink `#0b0c0d`
- Accent (signal lime): `#c8f03c`; accent text on light `#4a6400`

## ⚠️ Android Chrome auto-darken
Chrome on Android repaints pages that don't declare dark support when the phone is in dark mode (borders fade, backgrounds go grey). Keep `<meta name="color-scheme" content="light dark">` and `color-scheme: only light` on the light theme. Reproduce: launch Chrome with `--enable-features=WebContentsForceDark`, emulate `colorScheme: 'dark'`, store `portfolio-theme=light`.

## 📈 View counter (Abacus)
Visits: `mcleinonza/portfolio_views` (created 2026-10-31 at 232); likes: `mcleinonza/portfolio_likes`. The admin key for `portfolio_views` is in `.env.local` (git-ignored, keep private): to correct the count, `curl -X POST "https://abacus.jasoncameron.dev/set/mcleinonza/portfolio_views?value=N" -H "Authorization: Bearer $ABACUS_VIEWS_ADMIN_KEY"`. Every real visit increments (no once-per-browser lock since 2026-11-01); local hosts and automated browsers never increment.


## Gallery refresh (2026-11-04)
Owner feedback (UI/UX critique): slides looked blurred. All galleries except MedRec were recaptured at native resolution and are now 3200×1800 transparent WebP slides served as `-1600/-2400/-3200.webp` via `srcset` (q90, sharp_yuv). SERVIO 4 slides, AdvanCare 6, MedCore 6, Mulat 3; MedRec keeps its Oct 29 slides (its UI was mid-change in other sessions). Cipher Shift card, live demo window, `js/demo.js` and `demos/` removed at the owner's request; do not re-add or capture it.
- Phones: iPhone 16 simulator (iOS 18.6, 1179×2556 = MockUPhone iPhone 15 Pro), status bar overridden, framed on mockuphone.com (Black Titanium). Tablets: iPad Air 11 (M3) sim = iPad Air 5 frame.
- Dashboards (AdvanCare staff console, MedCore) use the **iMac** frame (owner: dashboards are for monitors). Capture 1920×1080 @2x; MockUPhone's iMac template is only 2000px, so the screenshot is pasted at full resolution into its screen rect (154,318)-(1845,1270) at composite time; never use the 2000px site output directly.
- Laptop/web pages (Mulat) use MacBook Pro 14 with a 64px (32pt) black top band so the notch never covers content (full-screen macOS layout). iPhone/iPad web pages are real Safari captures in the simulator (status bar + Safari chrome) — no bare page captures, so the Dynamic Island never covers the site.
- Data must look real, not demo: SERVIO offline demo with demo-only links hidden and app clock pinned to the status-bar time; AdvanCare resident app on-device data with filled forms, console via Playwright-intercepted JSON (Rowena Taguinod, Cagayan barangays); MedCore real API against a separate local `medcore_capture` DB seeded with its own seed (facility name without "(Demo)"), patient Teresa Navarro.
- Opening live Mulat pages in simulator Safari counted ~6 extra visits on its Abacus counter (each new tab is a session); laptop captures block Abacus and hide `#mulatStatsWidget`.
