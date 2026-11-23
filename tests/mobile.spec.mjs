import { test, expect, gotoReady } from './fixtures.mjs';

test.describe('phones', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone only');

  test('copy that says "hover" is not the only instruction on touch screens', async ({ page }) => {
    await gotoReady(page);
    const hoverCopy = await page.locator('main p:visible').evaluateAll((ps) => ps.map((p) => p.innerText).filter((t) => /\bhover\b/i.test(t)));
    expect(hoverCopy).toEqual([]);
  });
});
