---
type: project-brain
title: Personal Website Project Context
project: Personal Website
status: active
tags:
  - project
  - portfolio
  - web
  - showcase
  - serverless
last_updated: 2026-11-02
---

# 🌐 Personal Website — Project Context

## 📌 Overview & Purpose
**Personal Website** is the developer portfolio of **McLein Jei Onza** (BSCS, Cagayan State University, Class of 2028; aiming for data engineering). v3 (Oct 2026) is a full rebuild with a data-pipeline theme: kinetic hero with a live SQL query card, scroll-lit manifesto, pinned horizontal work section with per-project screenshot galleries, skills as schema tables, a self-drawing journey timeline, stacked award cards (newest first, led by the Cagayan Innovation Hack 2026 2nd place), the DTI YEP feature, and the existing visit/like stats.

---

## 🎯 Current Objectives & Status
- **Status**: v3 is on `main` (pushed) and live — confirmed on onzamj.vercel.app 2026-10-25. Design audit backlog cleared; Playwright suite green.
- **Live Deployment (v3)**: [mcleinjeionza.vercel.app](https://mcleinjeionza.vercel.app/)
- **Next**: commit + push the 2026-10-25 polish round (nav, fonts, motion, strip, Work alignment).

---

## 💻 Tech Stack & Dependencies
- **Markup & UI**: Semantic HTML5, CSS3 split into `css/*.css` (tokens, scroll-snap, `color-mix`, sticky pinning)
- **Scripting**: Vanilla ES modules in `js/` (no build step; must be served over HTTP)
- **Serverless**: `api/stats.js` (Vercel) → Abacus counter
- **Services**: Abacus (`abacus.jasoncameron.dev`, namespace `mcleinonza`), FormSubmit AJAX
- **Typography** (self-hosted, `css/fonts.css`): Geist (display and body), Hedvig Letters Serif (footer wordmark), Geist Mono (data only: identifiers, timestamps, figures).

---

## 📂 Key Files & Structure
- `index.html` — all sections: hero, manifesto, about, work, stack + journey, recognition, training, contact, footer, dialogs.
- Favicon (2026-11-01): owner's portrait in a black formal shirt, phone retained, white background; zoomed toward the face in a circular crop with transparent corners. `assets/Logo/favicon-circle-{64,192}.png`, sourced from `mclein-formal-circle.png`; original full photo is `mclein-formal-phone.png`.
- `css/` — `tokens.css` first; one stylesheet per area.
- `js/` — `main.js` entry + one module per feature (see ARCHITECTURE.md).
- Hero layout (owner-approved exception to desktop restoration): single-column with a viewport-height stage capped at 960px (760px for tall portrait tablets), oversized desktop name on one line, quiet lower-background marquee, intro/actions sharing a row on desktop and stacking on smaller screens, and full-width icon carousel at the bottom. The whole content group sits 24–56px higher (6vh) to reduce the blank area below navigation; short screens retain normal navigation clearance. Primary hero action is “See the work” as a filled pill; “Send a message” is the secondary text link (owner confirmed, 2026-11-02). Decorative background text runs at half speed (140/158/176/194s per loop).
- Hero name accents: the dot over the lowercase i and the period after Onza use light orange (#e8894d); the i stem keeps the theme ink colour.
- Hero tools: horizontal, swipeable carousel in `.hero__zone`, with gentle looping auto-scroll, hover/focus/touch pause and arrow-key support; no visible play/pause control. Icons can be dragged out and spring back into their slots; reduced motion disables auto-scroll and returns dragged icons immediately. Mobile hero uses 24px after nav clearance and between text and icons (2026-11-01).
- Section headings (2026-11-01): use only the main headings; owner removed all small uppercase dot-prefixed section labels (Selected work, About, Journey, Activity, Stack, Recognition, Training).
- Responsive layout scope (2026-11-01): preserve the original desktop/laptop layouts and scroll animations. Work retains pinned horizontal scrolling where originally enabled; its pinned heading uses a compact row beneath navigation to move cards into the unused upper space, and its gallery height reserves room for the tallest project description and progress row so laptop screens do not clip details; Journey retains pinned year-by-year transitions. Only phone/tablet spacing (≤960px) is compacted, including a measured content-sized Journey stage. Do not replace these animations with static grids/timelines during layout fixes.
- Contact wallet has GitHub, LinkedIn, WhatsApp and Gmail cards. The latter three use local brand logo assets and matching blue, green and white/red palettes. WhatsApp uses the owner-provided wa.me link; wallet height derives from card count. GitHub pass loads contributions independently via the shared `js/contributions.js` request (including retries), and uses a fixed GitHub dark palette in both site themes: dark canvas, neutral bordered Follow button and green contribution levels (`css/wallet.css`).
- Contact wallet personality (owner-approved mockup, 2026-11-02): GitHub types a short building line above its real contribution grid; WhatsApp keeps bright #25d366 with one greeting bubble and brief typing dots; LinkedIn connects the owner’s actual portrait to a visitor icon with a dotted line. Details animate briefly on opening, respect reduced motion and the browser’s first-interaction audio requirement, and reserve a clear footer for each CTA. Card front height is 260px (268px on narrow phones).
- Journey date corrections supplied by owner: DTI YEP / Pitch Perfect in May 2026; first independent sites in late August 2026. Display year only on timeline labels and keep chronological order. Cagayan Innovation Hack location: Tuguegarao City, Cagayan. Restored gray journey secondary text and black highlight boxes with white lettering throughout both themes. Use orange sparingly as hero-style underlines on recruiter-relevant keywords (Python, PostgreSQL/SQL and shipped-project count), not orange boxes or full orange lines.
- Journey sizing (owner-requested desktop adjustment, 2026-11-01): Equal desktop text/image columns in a wider stage give images more room; milestone text uses a 3.3vw scale (56px cap) and card titles are 19px with the shared orange underline highlight. Phone/tablet milestone text uses a smaller 6.8vw scale (42px cap) and image height allowance increases to 34svh. Preserve the pinned transitions.
- `api/stats.js` — visits/likes proxy.
- `assets/images/projects/` — composed gallery slides (transparent WebP, see NOTES); `awards/` includes `cih-2026-*.webp` (hackathon). All site images are WebP or SVG except the favicons and `og-image.jpg` (see NOTES, "Image Formats").

---

## 🔗 Related Projects & Links
- 🌟 **Central Ecosystem Showcase**:
  - [[Mulat_Media_Website]] — Work gallery.
  - [[Hangguk Grill FINAL]] — Work gallery.
  - [[CaesarCipherApp_FINAL]] — Work gallery.
  - [[MedRecord_App]] — Work gallery.
  - [[AdvanCare]], [[MedCore1]], [[SERVIO]] — Work gallery (added in v3).
- 🗺️ [[_BRAIN/PROJECT_INDEX|Master Project Index]]
- 📊 [[_BRAIN/CROSS_PROJECT_MAP|Cross-Project Map]]
- 🐙 **Repository**: [github.com/Mclein31/MJ_Onza-Personal-Website](https://github.com/Mclein31/MJ_Onza-Personal-Website.git)

---

## Repository Cleanup (2026-11-01)

Temporary redesign captures, mockup working files, generated reports, old design metadata and unreferenced legacy display assets were removed. Published gallery assets, original personal photos, source code, tests, licenses and project documentation remain. Decorative file banners and repetitive styling comments were trimmed; compatibility and behavior explanations remain.

## ⚠️ Known Limitations
- ES modules don't load from `file://`; use a local server.
- AdvanCare staff console slides use intercepted demo data (no real staff login); MedRec has a single image.
- Student Leader was awarded at graduation, June 2022, the same date as With High Honors; both sit at the end of the newest→oldest order. The Student Journalist card was removed at the owner's request (2026-10-31); its team photo stays in the photo strip.

## Domain Change (2026-11-02)

Production domain changed in Vercel to `mcleinjeionza.vercel.app`; `onzamj.vercel.app` remains configured as a 307 redirect to the new address. Vercel project name remains `onzamj`. The canonical link, `og:url` and `og:image` in `index.html` and the README's live link now use the new domain (uncommitted as of 2026-11-02; goes live with the next push).

## Journey desktop space (2026-11-02)

Owner requested fuller use of the Journey stage. Pinned desktop slides now align below navigation, use equal text/image columns and a 1600px outer container, with image height capped to reserve caption and progress space on shorter screens. Phone/tablet sizing and year-by-year scroll transitions remain intact.

Journey slide 2 uses the owner-supplied black-shirt mirror photo, converted to assets/images/journey-portrait.webp (2026-11-02), with the full photo contained in the existing image frame.

Journey final slide includes the owner’s workspace photo showing MedCore development (assets/images/journey-workspace.webp, 1600×900), above the internship description and contact link (2026-11-02).

Contact wallet switching uses a brief synthesized card shuffle and soft landing, triggered by the wallet’s actual front-card change and playing after the browser’s required first interaction (2026-11-02).

## Mobile spacing (2026-11-02)

Hero at ≤960px uses natural content height and starts 12px past navigation clearance, removing vertical centring. Mobile Work cards have 80px between projects, 24px between media and details, and 16px between detail rows. Journey reserves 8px past navigation clearance, measures the active slide rather than the tallest slide, and places progress 16px after its content. Desktop layout and scroll transitions are preserved.

Mobile About (≤860px, 2026-11-02): 24px heading/body gap; profile facts use compact bordered label/value rows; the service accordion follows after 32px and its label/subtitle stack cleanly. Desktop About layout is unchanged.

Journey images at 600–860px tablet widths allow 44svh height (up from 34svh), per owner request on 2026-11-02; phone and desktop image sizing stays unchanged.

## Responsive consistency audit (2026-11-02)

Laptop composition is the owner’s base reference. Hero height caps at 960px on large displays and 760px on 961–1100px portrait tablets, eliminating the iPad Pro 13-inch centring gap while retaining laptop typography/actions. Portrait tablets through 1100px use content-sized, stacked Journey slides and compact Work spacing. Large desktop Journey stages cap at 960px. Short landscape phones show Journey in normal document flow so captions remain reachable; rotating back restores pinning. Contact cards adapt via container queries, with compact Gmail compose/actions below 360px card width; compact About facts depend on available column width. Laptop navigation and horizontal Work scrolling remain intact.

Owner removed the speaker/mute control (2026-11-02). Interface sounds stay enabled after the browser permits audio; legacy portfolio-sfx preferences are ignored. Card shuffle remains at the softer volume.

Hero follow-up (2026-11-02): desktop/laptop with a fine pointer and hover uses a full 100svh stage, with navigation clearance and padding included. Tablet/phone compact sizing remains as before (owner corrected the request to exclude tablets). The icon divider uses 6% ink for a very subtle separation. This supersedes the desktop hero height cap from the audit.

CTA review (2026-11-02): “See the work” remains the hero primary. Main form openers and the dialog title use “Send a message”; the contact form opener is a filled primary button. Gmail’s external mail action says “Email”. Hero messaging uses an in-page action arrow rather than the external-link arrow.

## Name-search SEO (2026-11-02)

Canonical site remains https://mcleinjeionza.vercel.app/. Homepage metadata and accessible H1 identify McLein Jei Onza; WebSite/ProfilePage/Person JSON-LD connects McLein Onza and mcleinjeionza, with existing GitHub/LinkedIn profiles as sameAs. Deployed robots.txt advertises a one-URL sitemap.xml (section fragments are not separate pages). The initial live audit found old onzamj.vercel.app using a temporary 307 redirect. A permanent redirect should be configured in Vercel when the owner can access domain settings. No indexing or ranking is guaranteed.

Search Console follow-up: canonical URL-prefix property ownership is verified, and Google's exact HTML verification tag is deployed in index.html. Sitemap submission succeeded with one discovered page. The November 2 live URL test confirms the homepage can be indexed and has one valid Profile page item. After the initial daily quota limit, the owner supplied a November 3 screenshot confirming “Indexing requested” and placement in Google's priority crawl queue. Submission is complete; indexing/ranking remain unconfirmed. See .brain/SEO_SETUP.md.

Journey spacing follow-up (2026-11-02): pinned desktop slides center vertically within their stage, with 24–48px of extra top clearance below navigation. Phone/tablet frames retain content-based sizing with 16–32px extra top clearance, including portrait tablets through 1100px.

## Material finish (2026-11-03)

`css/texture.css` preserves the original cool white/gray and dark surfaces, soft directional lighting, contact/cast shadows, slightly varied photo mounts and uneven orange highlights. Owner rejected fuzzy grain and halftone. Current paper treatment uses `assets/textures/paper-pulp.svg`: denser short curved fibers with varied 0.3–1.9px thickness at fixed 960px tile scale, painted behind content on page/card surfaces. No turbulence/noise filter, full-screen overlay, or texture over photographs. Original footer treatment stays intact.

Project mockup shadow correction (2026-11-03): transparent gallery WebPs retain nonzero shadow alpha at the canvas boundary. `css/work.css` feathers image edges with intersected CSS masks in galleries and project lightbox views, blending the clipped shadow tails without changing gallery borders or source assets.

Journey centering (2026-11-03, owner request): pinned phone/tablet stages now use a 100svh minimum with centered content alignment. The measured active slide and its adjacent progress row move together into the middle of the area below navigation, instead of leaving all spare space below them. Long content can still grow; short landscape and reduced-motion flow remain unchanged.

Activity calendar scale (2026-11-03): main contribution grid uses a 16px minimum square cell with 4px gaps and horizontal scrolling when a full year will not fit. Day-label line height no longer stretches grid rows; inset scroll margins and an opaque sticky label gutter keep scrolled cells clear of weekday labels. Wallet calendar styling remains separate.

Desktop Work scale correction (2026-11-03): removed the card-width cap derived from `100svh - 600px`, which shrank desktop projects into multiple small cards on shorter screens. Pinned cards now use `min(82vw, 1180px)` with centered track edge padding; existing measured gallery-height allowance reserves actual caption/control space. Horizontal scroll and stacked phone/tablet layouts remain.

Paper texture adjustment (2026-11-03): fiber contrast reduced by 30%. Pinned Work/Journey stages paint their own opaque paper/fiber background, so the backdrop stays stationary during scroll-driven sequences rather than revealing the scrolling parent texture. Normal document flow retains the page texture.

Gallery/palette correction (2026-11-03): owner explicitly restored the original cool white/gray palette from `tokens.css`, including original dark colors; texture.css no longer overrides paper colors, and fibers/light are neutral. Gallery tracks have explicit 100% width so Safari cannot shrink the aspect-ratio box when gallery height is capped, leaving content left aligned within a wider card.

Work card reference correction (2026-11-03): owner explicitly selected the original compact multi-card deck screenshot. Restored original `min(74vw, 1180px, (100svh - 600px) * 1.7778)` card sizing (340px minimum) and original wrap-aligned track inset, superseding the 82vw full-card centering change. Keep the explicit gallery dimensions for centered, uncropped images within cards and the original white/gray palette.

Scroll performance correction (2026-11-03): Work now caches card centers during measurement, writes transform directly (avoiding inherited `--x` invalidation across the deck), updates its counter only when the selected project changes, and skips unchanged progress outside the pinned range. Heading scrubs batch geometry reads and skip unchanged reveals. A local Chrome profile with 4× CPU slowdown and 150 scroll steps showed Work layout count 157→13, style calculation time 1.98s→0.14s, and frame p95 33.4ms→16.7ms; Journey p95 33.3ms→16.7ms. These are local comparisons, not device-wide FPS guarantees. Card dimensions, texture and Journey composition are unchanged.
