import { test, expect, gotoReady, isMobile } from './fixtures.mjs';

test('keyboard: skip link is first, dialogs trap and release focus', async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo), 'keyboard flow is a desktop concern');
  await gotoReady(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);

  await page.locator('[data-header] [data-message-open]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-message]')).toBeVisible();
  await expect(page.locator('#fName')).toBeFocused();
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  const inside = await page.evaluate(() => !!document.activeElement.closest('[data-message]'));
  expect(inside, 'focus stays inside the open dialog').toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-header] [data-message-open]')).toBeFocused();
});
