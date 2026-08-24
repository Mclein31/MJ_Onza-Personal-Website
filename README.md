# McLein Jei Onza — Modern Developer Portfolio

A developer portfolio and personal website engineered with precision, high-performance CSS custom properties, responsive Bento grid architecture, and a modern aesthetic inspired by Linear, Apple, and Vercel.

Live Site: [onzamj.vercel.app](https://onzamj.vercel.app/)

---

## ⚡ Tech Stack & Architecture

- **Core**: Vanilla Semantic HTML5, Modern CSS3 (Tokens, Bento Grid, Flexbox, Glassmorphism), Vanilla ES6+ JavaScript.
- **Typography**: Plus Jakarta Sans (Headings & UI), Inter (Body Text), JetBrains Mono (Code, Badges & Terminal).
- **Theming**: System-synced Obsidian Dark Mode (`#09090b`) & Alabaster Light Mode with local persistence (`localStorage`).
- **Form Submission**: Asynchronous AJAX submission via FormSubmit (`fetch` API) with real-time state feedback and zero page reloads.
- **Zero Heavy Dependencies**: <80KB total asset footprint for instantaneous sub-second page loads.

---

## 🚀 Key Features

1. **Floating Frosted Navigation**: Fixed glass pill with backdrop blur (`backdrop-filter: blur(18px)`) and IntersectionObserver-powered active section scroll spy.
2. **Interactive Hero & Terminal**: Live developer status indicator (🟢 Available for Internships) paired with an interactive multi-tab code terminal (`profile.ts`, `stack.json`, `bash.sh`).
3. **About Me Bento Grid**: Clean modular layout showcasing engineering philosophy, education credentials, and core metrics.
4. **Flagship Projects Showcase**: Featured multi-card showcase featuring live demo actions, architecture highlights, and tech stack tags for projects like *Mulat Media*, *Hanguk Grill*, *Cipher Shift*, and *MedRec*.
5. **Categorized Tech Stack**: Domain-categorized ecosystem (Languages & Core, Developer Tooling, AI & Systems) replacing subjective dot rating scales.
6. **Academic & Career Timeline**: Structured chronological milestones highlighting Computer Science degree progress at Cagayan State University, coursework, and technical development.
7. **Contact Hub & Quick Copy**: 1-Click "Copy Email" button with animated toast notification and an asynchronous AJAX contact form.

---

## 📁 File Structure

```
├── assets/
│   ├── Logo/
│   │   ├── logo-1.png
│   │   └── logo-black.png
│   ├── icons/
│   │   └── ... (tech & system icons)
│   └── images/
│       └── ... (project screenshots & profile photos)
├── index.html      # Semantic HTML5 document & metadata
├── style.css       # Unified design token stylesheet
├── main.js         # Interactive scripts & theme controller
└── README.md       # Project documentation
```

---

## 🛠️ Local Development

Open `index.html` directly in any modern browser, or run a local lightweight server:

```bash
# Using Python
python3 -m http.server 3000

# Using Node / npx
npx serve .
```

Navigate to `http://localhost:3000` to view the website.

---

## 📄 License & Attribution

© 2026 McLein Jei G. Onza. All rights reserved.
