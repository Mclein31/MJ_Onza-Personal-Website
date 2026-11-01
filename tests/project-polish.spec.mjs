import { test, expect, gotoReady } from './fixtures.mjs';

test('AdvanCare achievement does not change gallery height', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await gotoReady(page);
  const heights = await page.locator('.project__media').evaluateAll(els => els.slice(0, 3).map(el => el.getBoundingClientRect().height));
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(1);
  await expect(page.locator('.project__award')).toContainText('2nd place');
  if (await page.locator('#work').evaluate(el => el.classList.contains('is-pinned'))) {
    const clearance = await page.evaluate(() => {
      const bottom = Math.max(...[...document.querySelectorAll('.project:not(.project--more)')].map(el => el.getBoundingClientRect().bottom));
      return document.querySelector('.work__foot').getBoundingClientRect().top - bottom;
    });
    expect(clearance).toBeGreaterThanOrEqual(15);
  }
});

test('journey dates and hackathon location match owner corrections', async ({ page }) => {
  await gotoReady(page);
  const years = await page.locator('.yr__year').allTextContents();
  expect(years).toEqual(['2022.', '2024.', '2026.', '2026.', '2026.', 'Now.', 'Next.']);
  const dti = page.locator('.yr').filter({ hasText: 'Pitch Perfect.' });
  await expect(dti.locator('.yr__year')).toHaveText('2026.');
  const sites = page.locator('.yr').filter({ hasText: 'First sites shipped.' });
  await expect(sites.locator('.yr__year')).toHaveText('2026.');
  await expect(page.locator('.yr').filter({ hasText: 'Cagayan Innovation Hack 2026' }).locator('.yr__place')).toHaveText('Tuguegarao City, Cagayan.');
});
