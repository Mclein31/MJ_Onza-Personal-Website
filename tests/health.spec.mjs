import { test, expect, gotoReady } from './fixtures.mjs';

test('every image loads', async ({ page }) => {
  await gotoReady(page);
  const broken = await page.evaluate(async () => {
    const imgs = [...document.images].filter((img) => !img.closest('dialog'));
    await Promise.all(imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return null;
      return new Promise((r) => {
        const done = () => r();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
        img.loading = 'eager';
        if (img.complete && img.naturalWidth > 0) done();
        setTimeout(done, 10_000);
      });
    }));
    return imgs.filter((img) => !img.naturalWidth).map((img) => img.currentSrc || img.src);
  });
  expect(broken).toEqual([]);
});

test('share preview metadata points at a real absolute image', async ({ page, request }) => {
  await page.goto('/');
  const og = await page.getAttribute('meta[property="og:image"]', 'content');
  expect(og, 'og:image should be an absolute URL so link previews work').toMatch(/^https:\/\//);
  expect((await request.get(new URL(og, page.url()).pathname)).ok()).toBeTruthy();
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
});

test('the light theme opts out of Android Chrome auto-darkening', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('portfolio-theme', 'light'));
  await page.goto('/');
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute('content', /dark/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toMatch(/only/);
});
