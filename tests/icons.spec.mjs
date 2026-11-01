import { test, expect, gotoReady } from './fixtures.mjs';

test('tools carousel moves automatically and pauses on focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await gotoReady(page);
  const field = page.getByRole('region', { name: 'Tools and technologies, scroll to explore' });
  await field.scrollIntoViewIfNeeded();
  await expect.poll(() => field.evaluate(el => el.scrollLeft)).toBeGreaterThan(10);
  await field.focus();
  const stopped = await field.evaluate(el => el.scrollLeft);
  await page.waitForTimeout(250);
  expect(await field.evaluate(el => el.scrollLeft)).toBe(stopped);
  await field.evaluate(el => el.blur());
  await page.mouse.move(0, 0);
  await expect.poll(() => field.evaluate(el => el.scrollLeft)).toBeGreaterThan(stopped + 5);
});

test('reduced motion keeps tools still and permits keyboard scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoReady(page);
  const field = page.getByRole('region', { name: 'Tools and technologies, scroll to explore' });
  await field.scrollIntoViewIfNeeded();
  await expect(page.locator('[data-icons-toggle]')).toHaveCount(0);
  await expect(field.locator('img')).toHaveCount(24);
  await page.waitForTimeout(250);
  expect(await field.evaluate(el => el.scrollLeft)).toBe(0);
  await field.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => field.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
});

test('an icon follows a drag outside the carousel and springs home on release', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await gotoReady(page);
  const field = page.locator('[data-icon-field]');
  await field.scrollIntoViewIfNeeded();
  await field.focus();
  // Start from a visible slot even when a slow browser lets auto-scroll run longer.
  await field.evaluate(el => { el.scrollLeft = 0; });
  const icon = field.locator('.tech-icon').nth(1);
  const home = await icon.boundingBox();
  await page.mouse.move(home.x + home.width / 2, home.y + home.height / 2);
  await page.mouse.down();
  await page.mouse.move(home.x + home.width / 2 + 80, home.y + home.height / 2 - 100, { steps: 6 });
  const floating = page.locator('.tech-icon--drag');
  await expect(floating).toBeVisible();
  const moved = await floating.boundingBox();
  expect(Math.abs(moved.x - home.x - 80)).toBeLessThan(2);
  expect(Math.abs(moved.y - home.y + 100)).toBeLessThan(2);
  await expect(icon.locator('img')).toBeHidden();
  await page.mouse.up();
  await expect(floating).toHaveCount(0);
  await expect(icon.locator('img')).toBeVisible();
  const returned = await icon.boundingBox();
  expect(Math.abs(returned.x - home.x)).toBeLessThan(1);
  expect(Math.abs(returned.y - home.y)).toBeLessThan(1);
});

test('pointer cancellation restores an icon immediately with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoReady(page);
  const icon = page.locator('[data-icon-field] .tech-icon').nth(1);
  await icon.scrollIntoViewIfNeeded();
  await icon.evaluate(el => el.addEventListener('pointerdown', e => { el.dataset.pointerId = e.pointerId; }, { once: true }));
  const home = await icon.boundingBox();
  await page.mouse.move(home.x + home.width / 2, home.y + home.height / 2);
  await page.mouse.down();
  await page.mouse.move(home.x + 80, home.y + 60);
  const floating = page.locator('.tech-icon--drag');
  const pointerId = Number(await icon.getAttribute('data-pointer-id'));
  await floating.dispatchEvent('pointercancel', { pointerId });
  await page.mouse.up();
  await expect(floating).toHaveCount(0);
  await expect(icon.locator('img')).toBeVisible();
});
