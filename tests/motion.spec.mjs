import { test, expect, gotoReady, isMobile } from './fixtures.mjs';

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
  await expect(page.locator('#fName')).toBeFocused();
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  const inside = await page.evaluate(() => !!document.activeElement.closest('[data-message]'));
  expect(inside, 'focus stays inside the open dialog').toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('.nav__hire')).toBeFocused();
});

// Share of the vista's width its drawn text covers, and whether the lighthouse is drawn
const vistaState = (page) => page.locator('[data-vista]').evaluate((v) => {
  const p = v.querySelector('.vista__layer--ink');
  if (!p) return { span: 0, scene: false };
  const r = document.createRange();
  r.selectNodeContents(p);
  return { span: r.getBoundingClientRect().width / v.clientWidth, scene: /\[=+\]/.test(p.textContent) };
});
const vistaText = (page) => page.locator('[data-vista]').evaluate((v) => v.textContent);

test('footer is one screen tall and the vista spans it, animating on its own', async ({ page }) => {
  await gotoReady(page);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect.poll(async () => (await vistaState(page)).scene).toBe(true);
  const { span } = await vistaState(page);
  expect(span).toBeGreaterThan(0.97);
  expect(span).toBeLessThan(1.01);
  const footerH = await page.locator('footer').evaluate((f) => f.getBoundingClientRect().height);
  expect(Math.abs(footerH - page.viewportSize().height)).toBeLessThan(2);
  const a = await vistaText(page);
  await page.waitForTimeout(700);
  expect(await vistaText(page), 'the scene moves without any scrolling').not.toBe(a);
});

test('reduced motion: the footer vista is drawn and holds still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect.poll(async () => (await vistaState(page)).scene).toBe(true);
  const a = await vistaText(page);
  await page.waitForTimeout(600);
  expect(await vistaText(page)).toBe(a);
});
