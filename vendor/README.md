# Vendored Browser ES Modules

Self-hosted, bundler-free ES modules copied from official npm tarballs. No CDN requests at runtime, no `node_modules` required.

## Packages

| Package | Version | Source Tarball | SHA-256 | License |
|---|---|---|---|---|
| `gsap` | `3.15.1` | `gsap-3.15.1.tgz` | `c70a3bcf656015f32b4f6456e686034564c90d64280db535cfbd84de4497d988` | [Standard "no charge" license](https://gsap.com/standard-license) (`vendor/gsap/LICENSE`) |
| `lenis` | `1.3.27` | `lenis-1.3.27.tgz` | `0a2437de050959246edd645a2ffa8b50a6ff6b80d98f6d960f1b4557a4c4209e` | MIT (`vendor/lenis/LICENSE`) |
| `ogl` | `1.0.11` | `ogl-1.0.11.tgz` | `1a8cf32e3d16c6f48e365f88ed79b37075092fbc2749d71377fce049799e10a3` | Unlicense (`vendor/ogl/LICENSE`) |

### Notes
- `gsap` includes core (`index.js`, `gsap-core.js`, `CSSPlugin.js`) plus `ScrollTrigger.js` (and `Observer.js`), `SplitText.js`, `Flip.js` (and `utils/matrix.js`), `CustomEase.js` (and `utils/paths.js`), and `ScrollToPlugin.js`.
- `lenis` (`dist/lenis.mjs`) is saved as `vendor/lenis/lenis.js` so static servers without `.mjs` MIME mappings (such as `tests/serve.mjs`) serve it as `text/javascript`. `vendor/lenis/lenis.css` is included alongside it.
- `ogl` is the full `src/` ES module tree placed directly under `vendor/ogl/` with relative `.js` imports.

---

## Copy-Paste Imports & Setup

### GSAP + Plugins
```js
import { gsap } from './vendor/gsap/index.js';
import { ScrollTrigger } from './vendor/gsap/ScrollTrigger.js';
import { SplitText } from './vendor/gsap/SplitText.js';
import { Flip } from './vendor/gsap/Flip.js';
import { CustomEase } from './vendor/gsap/CustomEase.js';
import { ScrollToPlugin } from './vendor/gsap/ScrollToPlugin.js';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase, ScrollToPlugin);
```

### Lenis + ScrollTrigger Sync
Include the stylesheet in `<head>`:
```html
<link rel="stylesheet" href="./vendor/lenis/lenis.css" />
```
Then sync Lenis with GSAP `ScrollTrigger`:
```js
import Lenis from './vendor/lenis/lenis.js';
import { gsap } from './vendor/gsap/index.js';
import { ScrollTrigger } from './vendor/gsap/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
```

### OGL
```js
import { Renderer, Camera, Transform, Box, Program, Mesh } from './vendor/ogl/index.js';

const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
const gl = renderer.gl;
```

---

## Minification (2026-11-22)

Every `.js` file under `vendor/gsap/`, `vendor/lenis/` and `vendor/ogl/` was minified in place, file by file (not bundled), so all file names, exports and relative `./x.js` imports are unchanged and licence banners (`/*! ... @license ... */`) are kept.

- Tool: `esbuild@0.25.12`, run one-off from a scratch directory outside the repo (not in `package.json`):
  `esbuild <file> --minify --format=esm --legal-comments=inline --allow-overwrite --outfile=<file>`
- Sizes (bytes, all `.js` in the folder): gsap 533,956 -> 171,934; lenis 33,274 -> 18,807; ogl 348,106 -> 147,062; total 915,336 -> 337,803.
- Not human-readable now. To update a package: re-copy from the tarball (SHA-256 above), then re-run the command on each file.
- Verified in Chromium: all modules import, the six GSAP plugins register, a Lenis instance runs, an OGL renderer draws a triangle (pixel read back red), no console errors.
