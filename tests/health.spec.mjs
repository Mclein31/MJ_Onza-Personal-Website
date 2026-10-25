import AxeBuilder from '@axe-core/playwright';
import { test, expect, gotoReady } from './fixtures.mjs';

test('loads without console errors or failed requests', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => errors.push(`${r.failure()?.errorText} ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

  await gotoReady(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('every image loads', async ({ page }) => {
  await gotoReady(page);
  const broken = await page.evaluate(async () => {
    const imgs = [...document.images].filter((img) => !img.hasAttribute('data-lb-img'));
    imgs.forEach((img) => { img.loading = 'eager'; });
    await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
    return imgs.filter((img) => !img.naturalWidth).map((img) => img.currentSrc || img.src);
  });
  expect(broken).toEqual([]);
});

test('nothing overflows the viewport sideways', async ({ page }) => {
  await gotoReady(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const offenders = await page.evaluate(() => {
    // Clipped by a scroller/clip ancestor, or riding on a fixed layer (cursor, toast)
    const clips = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (s.overflowX !== 'visible' || s.position === 'fixed') return true;
      }
      return false;
    };
    return [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || getComputedStyle(el).position === 'fixed') return false;
        return (r.right > innerWidth + 1 || r.left < -1) && !clips(el);
      })
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`)
      .slice(0, 10);
  });
  expect(offenders).toEqual([]);
});

test('share preview metadata points at a real absolute image', async ({ page, request }) => {
  await page.goto('/');
  const og = await page.getAttribute('meta[property="og:image"]', 'content');
  expect(og, 'og:image should be an absolute URL so link previews work').toMatch(/^https:\/\//);
  expect((await request.get(new URL(og, page.url()).pathname)).ok()).toBeTruthy();
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
});

test('has no WCAG 2 A/AA violations (axe)', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); // reveals start visible, so axe sees settled content
  await gotoReady(page);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .exclude('.manifesto') // word colour depends on scroll position by design
    .analyze();
  const summary = results.violations.map((v) => `${v.impact} · ${v.id} · ${v.nodes.length} node(s) · ${v.help}`);
  await testInfo.attach('axe-violations.json', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
  expect(summary).toEqual([]);
});
