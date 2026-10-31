---
type: notes
title: Personal Website Reference Notes
project: Personal Website
tags:
  - notes
  - reference
last_updated: 2026-10-25
---

# 📝 Personal Website — Technical Notes

## 🎯 Projects in the Work Gallery (order)
1. [[AdvanCare]] — 3 slides (staff console + app). 🏆 2nd, Cagayan Innovation Hack 2026. Role: McLein built the software (resident app, staff console, website, API); the team coach delivered the pitch. Copy must not say McLein pitched it.
2. [[MedCore1|MedCore]] — 3 slides (dashboard + patient app, from MedCore QA captures).
3. [[SERVIO]] — 2 slides (new UI, offline demo mode).
4. [[MedRecord_App|MedRec]] — 3 slides in its warm folio look (ivory/aubergine, Remy): records + Medical ID + QR pass; Ask Remy + health summary; share + profile. Expo web with intercepted demo data (2026-10-29).
5. [[Mulat_Media_Website]] — 4 slides (original screenshot + live-site captures).
6. [[CaesarCipherApp_FINAL|Cipher Shift]] — 1 image + "Click me" live demo window (`demos/cipher-shift/`, a copy of the app's web files; font paths fixed, Tesseract pinned to 4.1.4).
Hanguk Grill card removed (2026-10-25); still mentioned in the journey timeline. Phone frames have a 50px status-bar inset so the Dynamic Island never covers app headers.

## 🔁 Regenerating Slides
Slides use **MockUPhone** device frames ([oursky/mockuphone.com](https://github.com/oursky/mockuphone.com), Apache-2.0; device art from Apple Design Resources): iMac 2015 Retina, MacBook Pro 14 silver, iPad Air 5 space grey, iPhone 14 Pro space black. Owner rejected hand-drawn CSS frames as fake (2026-10-31). Each screenshot is cover-fit into the frame's screen rect from MockUPhone's `device_info.json` (iMac: pasted over its black screen; others: under the frame), on a **transparent** 2000×1125 canvas with a soft shadow, saved as WebP with alpha (q84). No brand text or logos in slides.
- **Kit**: `.slides/` (gitignored, local only): `mucompose.py` (compositor), `layouts.py` (per-slide device, width, position), `mu/` (frame PNGs), `shots/` (all screens), `mulat.mjs` / `mrcapture.mjs` (capture scripts). `python3 .slides/mucompose.py [slide…]` → `.slides/out/*.png`, then convert to WebP into `assets/images/projects/`.
- **Exact sizes**: MacBook Pro 14 screen = 1512×982 @2, iPad Air 5 = 820×1180 @2, iPhone 14 Pro = 393×852 @3; web captures for the phone are taken at 393×798 and get a drawn iOS status bar (54pt) on top. iMac is 16:9, so 16:10 dashboards lose their bottom 10%.
- **Sources** (2026-10-31): the Oct 25 raw captures were lost, so AdvanCare, MedCore, SERVIO and Cipher Shift screens were cut from the old flat slides (SERVIO Tracking perspective-unwarped; those phone screens keep their old status bar). The AdvanCare overview has the old phone baked into its lower right, so slide 1 keeps a phone over that spot. Mulat Media recaptured live (Abacus blocked, stats pill hidden, 5s wait for its loader); MedRec recaptured from Expo web with `mrcapture.mjs` (all `/api/*` mocked). Recapture AdvanCare/MedCore/SERVIO from the running apps for sharper screens.
- SERVIO: `ng serve`, set `CapacitorStorage.servioDemoConnection` → `{"useMockApi":true}`, sign in with any email + `TEST_OTP` 123456.
- AdvanCare app: HashRouter (`/#/home`); seed `advancare.v1` = `{onboarded:true, session:{…, role:"household"}}`; block API calls.
- AdvanCare staff console: intercept `/api/v1/admin/*` with demo JSON (`me`, `overview`, `service-requests`).
- MedRec: `CI=1 npx expo start --web --port 8082` in `apps/mobile`; seed `medrec.session.v2` + `medrec.onboarded.v2`; intercept `/api/*`. Demo user Juan Dela Cruz; 393×852 @3x; a 50px status band is added in the frame. Routes used: `/`, `/medical`, `/share`, `/share/s1`, `/profile`, `/remy` (+ click "Find my latest blood test"), `/summary` (+ click "Write my summary"). `/record/explain` renders empty with demo data. Fonts and Remy PNGs come from `apps/mobile/assets/`.
- Mulat Media: live site pages (index, articles, about) at 1440×900 and 390×844.

## 🎨 Theme Tokens (v3)
- Dark: bg `#0b0c0d`, ink `#f2f3ef` · Light: bg `#f2f3ef`, ink `#0b0c0d`
- Accent (signal lime): `#c8f03c`; accent text on light `#4a6400`
