import { test, expect, gotoReady, contributionFixture } from './fixtures.mjs';

test('GitHub squares load when contact is opened before the activity section', async ({ page }) => {
  let requests = 0;
  await page.route(/\/api\/contributions|github-contributions-api/, async route => {
    requests++;
    await new Promise(resolve => setTimeout(resolve, 300));
    await route.fulfill({ json: contributionFixture() });
  });
  await gotoReady(page, '/#contact');
  const card = page.locator('.pass--gh');
  await card.locator('.pass__head').click();
  await expect(card.locator('[data-pass-grid] i')).toHaveCount(126);
  await expect(card.locator('[data-pass-total]')).toHaveText(`${contributionFixture().contributions.reduce((sum, day) => sum + day.count, 0)} contributions this year`);
  await page.locator('#activity').scrollIntoViewIfNeeded();
  await expect(page.locator('.activity__grid .cell:not(.pad)')).toHaveCount(365);
  expect(requests).toBe(1);
});

test('GitHub card shows an error and retries when contributions become available', async ({ page }) => {
  let available = false;
  await page.route(/\/api\/contributions|github-contributions-api/, route => {
    return !available ? route.fulfill({ status: 503, json: {} }) : route.fulfill({ json: contributionFixture() });
  });
  await gotoReady(page, '/#contact');
  const card = page.locator('.pass--gh');
  await card.locator('.pass__head').click();
  await expect(card.locator('[data-pass-total]')).toContainText('unavailable');
  available = true;
  await card.locator('.pass__head').click();
  await expect(card.locator('[data-pass-grid] i')).toHaveCount(126);
  await expect(card.locator('[data-pass-total]')).toHaveText(`${contributionFixture().contributions.reduce((sum, day) => sum + day.count, 0)} contributions this year`);
});

test('WhatsApp card opens the supplied number with an editable prefilled message', async ({ page }) => {
  await gotoReady(page, '/#contact');
  const card = page.locator('.pass--wa');
  await card.locator('.pass__head').click();
  await expect(card).toHaveClass(/is-front/);
  await expect(card.locator('.pass__name')).toHaveText('McLein Jei G. Onza');
  const link = new URL(await card.locator('.pass__go').getAttribute('href'));
  expect(link.origin + link.pathname).toBe('https://wa.me/639524781573');
  expect(link.searchParams.get('text')).toBe('Hi McLein! I saw your portfolio and would like to talk about a project or opportunity.');
  const bounds = await page.locator('[data-wallet]').boundingBox();
  const cardBounds = await card.boundingBox();
  expect(cardBounds.y + cardBounds.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1);
});
