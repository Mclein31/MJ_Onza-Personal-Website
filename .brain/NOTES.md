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
4. [[MedRecord_App|MedRec]] — 2 slides (v2 Expo web with intercepted demo data).
5. [[Mulat_Media_Website]] — 4 slides (original screenshot + live-site captures).
6. [[CaesarCipherApp_FINAL|Cipher Shift]] — 1 image + "Click me" live demo window (`demos/cipher-shift/`, a copy of the app's web files; font paths fixed, Tesseract pinned to 4.1.4).
Hanguk Grill card removed (2026-10-25); still mentioned in the journey timeline. Phone frames have a 50px status-bar inset so the Dynamic Island never covers app headers.

## 🔁 Regenerating Slides
Screens were captured with Playwright + system Chrome and composed in HTML (phone/browser frames, brand gradient), 1600×900 JPEG q80.
- SERVIO: `ng serve`, set `CapacitorStorage.servioDemoConnection` → `{"useMockApi":true}`, sign in with any email + `TEST_OTP` 123456.
- AdvanCare app: HashRouter (`/#/home`); seed `advancare.v1` = `{onboarded:true, session:{…, role:"household"}}`; block API calls.
- AdvanCare staff console: intercept `/api/v1/admin/*` with demo JSON (`me`, `overview`, `service-requests`).
- MedRec: `CI=1 npx expo start --web --port 8082` in `apps/mobile`; seed `medrec.session.v2` + `medrec.onboarded.v2`; intercept `/api/*`.
- Mulat Media: live site pages (index, articles, about) at 1440×900 and 390×844.

## 🎨 Theme Tokens (v3)
- Dark: bg `#0b0c0d`, ink `#f2f3ef` · Light: bg `#f2f3ef`, ink `#0b0c0d`
- Accent (signal lime): `#c8f03c`; accent text on light `#4a6400`
