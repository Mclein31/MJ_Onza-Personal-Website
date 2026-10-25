import { test, expect, gotoReady, isMobile } from './fixtures.mjs';

// Time from navigation until every letter of the hero name has finished rising into place
async function nameSettledAfter(page) {
  const t0 = Date.now();
  await page.goto('/');
  await page.waitForFunction(() => {
    const chars = [...document.querySelectorAll('.hero__name .char')];
    return chars.length && chars.every((c) => getComputedStyle(c).transform === 'none' || getComputedStyle(c).transform === 'matrix(1, 0, 0, 1, 0, 0)');
  }, null, { timeout: 15_000 });
  return Date.now() - t0;
}

test('first visit shows the name within 2.5s; repeat visits skip the preloader', async ({ page }, testInfo) => {
  const first = await nameSettledAfter(page);
  await expect(page.locator('.preloader')).toHaveCount(0);
  const repeat = await nameSettledAfter(page); // same session: preloader is skipped
  testInfo.annotations.push({ type: 'timing', description: `name settled: first visit ${first}ms, repeat ${repeat}ms` });
  expect(repeat).toBeLessThan(first);
  expect(first, 'visitors wait this long to read the name on their first visit').toBeLessThan(2500);
});

test('reduced motion: no preloader, nothing hidden, work not pinned', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/no-preload/);
  await expect(page.locator('#work')).not.toHaveClass(/is-pinned/);
  const hidden = await page.locator('[data-reveal]').evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
  expect(hidden).toBe(0);
  await expect(page.locator('.strip__track')).toHaveCSS('animation-play-state', /running|paused/);
  const marqueeMoves = await page.locator('.strip__track').evaluate(async (el) => {
    const a = el.getBoundingClientRect().left;
    await new Promise((r) => setTimeout(r, 600));
    return Math.abs(el.getBoundingClientRect().left - a) > 1;
  });
  expect(marqueeMoves, 'the photo marquee should hold still under reduced motion').toBe(false);

  // A blanket transition-duration override once made font-size transition, so the wordmark fit collapsed to ~1px
  await expect.poll(() => page.locator('[data-footer-mark]').evaluate((m) => {
    const r = document.createRange();
    r.selectNodeContents(m);
    return r.getBoundingClientRect().width / m.clientWidth;
  }), { message: 'the footer wordmark still spans its container' }).toBeGreaterThan(0.95);
});

test('keyboard: skip link is first, dialogs trap and release focus', async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo), 'keyboard flow is a desktop concern');
  await gotoReady(page);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);

  await page.locator('.nav__hire').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-message]')).toBeVisible();
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  const inside = await page.evaluate(() => !!document.activeElement.closest('[data-message]'));
  expect(inside, 'focus stays inside the open dialog').toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('.nav__hire')).toBeFocused();
});
