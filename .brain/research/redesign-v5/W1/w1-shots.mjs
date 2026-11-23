// W1 screenshot pass: node .brain/research/redesign-v5/W1/w1-shots.mjs [port]
import { chromium, webkit } from '@playwright/test';
const port = process.argv[2] || 4501;
const base = `http://127.0.0.1:${port}/`;
const dir = decodeURIComponent(new URL('.', import.meta.url).pathname);
const vps = [
  ['390x844', 390, 844, 'webkit', true], ['duo-folded', 466, 678, 'webkit', true], ['duo-portrait', 626, 890, 'webkit', true],
  ['duo-landscape', 890, 626, 'webkit', true], ['768x1024', 768, 1024, 'chromium', true], ['1280x800', 1280, 800, 'chromium', false],
  ['1440x900', 1440, 900, 'chromium', false], ['1920x1080', 1920, 1080, 'chromium', false],
];
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const out = [];
for (const [name, width, height, engine, touch] of vps) {
  if (only && !only.includes(name)) continue;
  const browser = await (engine === 'webkit' ? webkit : chromium).launch(engine === 'chromium' ? { channel: 'chrome' } : {});
  for (const scheme of ['light', 'dark', 'reduce']) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: touch ? 2 : 1, hasTouch: touch, isMobile: touch && engine === 'webkit',
      colorScheme: scheme === 'dark' ? 'dark' : 'light', reducedMotion: scheme === 'reduce' ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/api\/stats|Button failed/.test(m.text() + m.location().url)) errs.push(m.text()); });
    await page.addInitScript(() => { try { sessionStorage.setItem('v5-intro', '1'); } catch {} });
    await page.goto(base);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${dir}w1-${name}-${scheme}-hero.png` });
    const m = await page.evaluate(() => {
      const r = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
      const cta = r('.hero__cta'); const name = r('.hero__name');
      return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, ctaBottom: cta && Math.round(cta.bottom), nameRight: name && Math.round(name.right), vh: innerHeight,
        plot: document.querySelector('[data-plot]').className, fb: document.querySelector('[data-plot]').dataset.glFallback || '' };
    });
    if (scheme === 'light') {
      const t = page.locator('[data-menu-toggle]');
      if (await t.isVisible()) { await t.click(); await page.waitForTimeout(700); await page.screenshot({ path: `${dir}w1-${name}-menu.png` }); await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
      await page.evaluate(() => { const t = document.querySelector('.hero__tools'); window.scrollTo(0, t.getBoundingClientRect().top + scrollY - innerHeight * 0.5); });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${dir}w1-${name}-tools.png` });
    }
    out.push({ name, scheme, ...m, errs });
    await ctx.close();
  }
  await browser.close();
}
console.log(JSON.stringify(out, null, 0).replace(/},{/g, '},\n{'));
