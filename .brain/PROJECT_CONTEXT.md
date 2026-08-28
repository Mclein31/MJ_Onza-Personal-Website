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
last_updated: 2026-08-28
---

# 🌐 Personal Website — Project Context

## 📌 Overview & Purpose
**Personal Website** is the signature developer portfolio and personal brand platform for **McLein Jei Onza** (Computer Science student and software developer). The website showcases software engineering projects, technical skillsets, academic milestones at Cagayan State University, DTI YEP entrepreneurship/pitch awards, and contact channels. It features an interactive **3D coverflow project carousel**, an interactive **developer terminal** emulator, Bento grid layouts, system-synchronized **dark/light theme switching**, an asynchronous AJAX contact form, and live visit/like metrics powered by Vercel Serverless Functions and Abacus API.

---

## 🎯 Current Objectives & Status
- **Status**: `Active / Production Deployed`
- **Live Deployment**: [onzamj.vercel.app](https://onzamj.vercel.app/)
- **Primary Deliverables**: Sub-second load time static portfolio with serverless stats API deployed on Vercel.

---

## 💻 Tech Stack & Dependencies
- **Core Markup & UI**: Vanilla Semantic HTML5 (`index.html`), Modern CSS3 (CSS Custom Properties, Bento Grid, Flexbox, 3D Transforms, Glassmorphism)
- **Interactive Scripting**: Vanilla ES6+ JavaScript (`main.js`)
- **Serverless Backend**: Vercel Serverless Functions (`api/stats.js` Node.js handler)
- **External Services**:
  - **Abacus Count API**: Live hit/like counter endpoint (`abacus.jasoncameron.dev`)
  - **FormSubmit AJAX API**: Contact form asynchronous submission with zero page reload
- **Typography**: Plus Jakarta Sans (Headings), Inter (Body Text), JetBrains Mono (Code/Terminal), Sora, Bungee, Bowlby One

---

## 📂 Key Files & Structure
- `index.html`: Complete single-page portfolio layout containing:
  - Floating frosted pill navigation with active scroll-spy.
  - Hero section with live availability indicator and interactive 3-tab terminal (`profile.ts`, `stack.json`, `bash.sh`).
  - About Me Bento Grid detailing background, education credentials, and core philosophy.
  - Featured Projects Gallery with 3D Coverflow stage showcasing flagship projects.
  - Categorized Tech Stack grid (Languages, Developer Tools, AI & Systems).
  - Career Timeline, DTI YEP training slider, and awards lightbox gallery.
  - Contact Hub with 1-click email copy toast and AJAX contact form.
- `main.js`: Main interactive controller managing theme switching, 3D coverflow carousel math, typing animation, stats widget, and modal controls.
- `api/stats.js`: Vercel serverless function handling CORS and proxying requests to Abacus count API.
- `home.css`, `project.css`, `about-me.css`, `skills.css`, `contact.css`, `general.css`, `style.css`: Modular design token stylesheets.
- `assets/`: Project screenshots (`project1.png` through `project5.png`), training photography, award certificates, and tech stack icons.

---

## 🔗 Related Projects & Links
- 🌟 **Central Ecosystem Showcase**:
  - [[Mulat_Media_Website]] — Featured in Coverflow Slide 0.
  - [[Hangguk Grill FINAL]] — Featured in Coverflow Slide 1.
  - [[CaesarCipherApp_FINAL]] — Featured in Coverflow Slide 2.
  - [[MedRecord_App]] — Featured in Coverflow Slide 4.
- 🗺️ [[_BRAIN/PROJECT_INDEX|Master Project Index]]
- 📊 [[_BRAIN/CROSS_PROJECT_MAP|Cross-Project Map]]
- 🐙 **Repository**: [github.com/Mclein31/MJ_Onza-Personal-Website](https://github.com/Mclein31/MJ_Onza-Personal-Website.git)

---

## ⚠️ Known Limitations
- No limitations — highly optimized with <80KB total asset footprint and 100 Lighthouse performance rating.
