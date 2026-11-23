// run from repo root: node .brain/research/redesign-v5/H3/capture.mjs
import { chromium, webkit } from '@playwright/test';
const out = '.brain/research/redesign-v5/H3/';
const sizes = [[320,568],[390,844],[466,678],[626,890],[890,626],[1280,800],[1440,900],[1920,1080]];
const report = [];
async function run(mode, theme, [w,h]) {
  const touch = w <= 890;
  const b = await chromium.launch({ args: mode === 'nogl' ? ['--disable-webgl','--disable-gpu'] : ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport:{width:w,height:h}, hasTouch:touch, isMobile:touch, deviceScaleFactor:1, reducedMotion: mode==='reduced'?'reduce':'no-preference', colorScheme: theme });
  await ctx.addInitScript(t => { try { localStorage.setItem('portfolio-theme', t); localStorage.setItem('intro-seen','1'); sessionStorage.setItem('intro-seen','1'); } catch {} }, theme);
  const p = await ctx.newPage();
  await p.goto('http://localhost:4522/', { waitUntil: 'load' });
  await p.waitForTimeout(mode==='reduced'?1500:4500);
  const m = await p.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); const cs=getComputedStyle(e); return cs.display==='none'?'hidden':{t:Math.round(b.top),b:Math.round(b.bottom),l:Math.round(b.left),r:Math.round(b.right)}; };
    const toggles=[...document.querySelectorAll('[data-theme-toggle]')].map(e=>({parent:e.parentElement.className,w:Math.round(e.getBoundingClientRect().width)}));
    return { h:innerHeight, status:r('.hero__status'), name:r('.hero__name'), intro:r('.hero__intro'), cta:r('.hero__cta'), tools:r('.hero__tools'), axis:r('.hero__axis'), readout:!!document.querySelector('.hero__readout'),
      brand:r('.site-header__brand'), talk:r('.site-header__cta'), menu:r('.site-header__toggle'), toggles, ovf: document.documentElement.scrollWidth - innerWidth, fallback: document.querySelector('.hero__plot').className };
  });
  report.push({ mode, theme, w, h, ...m });
  await p.screenshot({ path: `${out}h3-${mode}-${w}x${h}-${theme}.png` });
  await b.close();
}
const only = process.argv[2];
for (const theme of ['light','dark']) for (const s of sizes) await run('normal', theme, s);
for (const theme of ['light','dark']) for (const s of [[390,844],[1440,900]]) { await run('reduced', theme, s); await run('nogl', theme, s); }
console.log(JSON.stringify(report.map(r=>({k:`${r.mode} ${r.w}x${r.h} ${r.theme}`, cta:r.cta&&r.cta.b, H:r.h, status:r.status&&r.status.t, name:r.name&&r.name.t, tools:r.tools, axis:r.axis, ro:r.readout, toggles:r.toggles, ovf:r.ovf, fb:r.fallback.includes('fallback')})),null,0).replace(/\},\{"k"/g,'},\n{"k"'));
