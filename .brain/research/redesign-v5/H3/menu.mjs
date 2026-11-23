import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w,h,t] of [[390,844,'light'],[890,626,'dark'],[1100,800,'dark']]) {
  const c = await b.newContext({ viewport:{width:w,height:h}, hasTouch:true, isMobile:true, colorScheme:t });
  await c.addInitScript(t=>{try{localStorage.setItem('portfolio-theme',t)}catch{}},t);
  const p = await c.newPage(); await p.goto('http://localhost:4522/'); await p.waitForTimeout(4000);
  await p.click('[data-menu-toggle]'); await p.waitForTimeout(900);
  await p.screenshot({path:`.brain/research/redesign-v5/H3/h3-menu-${w}x${h}-${t}.png`});
  const before = await p.evaluate(()=>document.documentElement.dataset.theme);
  await p.click('[data-theme-toggle]'); await p.waitForTimeout(600);
  console.log(w, before, '->', await p.evaluate(()=>document.documentElement.dataset.theme), await p.evaluate(()=>document.querySelectorAll('[data-theme-toggle]').length));
  await c.close();
}
await b.close();
