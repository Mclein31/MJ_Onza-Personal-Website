import { test, expect, gotoReady } from './fixtures.mjs';

test('journey dates and hackathon location match owner corrections', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoReady(page);
  const entries = await page.locator('[data-journey-entry]').allTextContents();
  const years = entries.map(t => (t.trim().match(/^(\d{4}\.|Now\.|Next\.)/) || [])[0]);
  expect(years).toEqual(['2022.', '2024.', '2026.', '2026.', '2026.', 'Now.', 'Next.']);
  const dti = page.locator('[data-journey-entry]').filter({ hasText: 'Pitch Perfect.' });
  await expect(dti).toContainText(/^\s*2026\./);
  const sites = page.locator('[data-journey-entry]').filter({ hasText: 'First sites shipped.' });
  await expect(sites).toContainText(/^\s*2026\./);
  await expect(page.locator('[data-journey-entry]').filter({ hasText: 'Cagayan Innovation Hack 2026' })).toContainText('Tuguegarao City, Cagayan.');
});
