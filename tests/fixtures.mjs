import { test as base, expect } from '@playwright/test';

// A year of contribution days ending today, with a known streak and best day
export function contributionFixture() {
  const days = [];
  const end = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const count = i < 30 ? (i % 3) + 1 : i === 100 ? 40 : 0;
    days.push({ date: d.toISOString().slice(0, 10), count, level: Math.min(4, count) });
  }
  return { total: { lastYear: days.reduce((s, d) => s + d.count, 0) }, contributions: days };
}

// Every test runs against mocked third parties: no real visits/likes are counted,
// no email is sent, and the GitHub graph never depends on the network.
export const test = base.extend({
  page: async ({ page }, use) => {
    const stats = { visits: 100, likes: 10, hits: [] };
    await page.route(/\/api\/stats\?/, (route) => {
      const url = new URL(route.request().url());
      const metric = url.searchParams.get('metric');
      if (url.searchParams.get('type') === 'increment') stats[metric] += 1;
      stats.hits.push(url.search);
      route.fulfill({ json: { count: stats[metric] } });
    });
    await page.route(/abacus\.jasoncameron\.dev/, (route) => route.fulfill({ json: { value: 0 } }));
    await page.route(/\/api\/contributions|github-contributions-api/, (route) => route.fulfill({ json: contributionFixture() }));
    await page.route(/formsubmit\.co/, (route) => route.fulfill({ json: { success: 'true' } }));
    page.stats = stats;
    await use(page);
  },
});

// Skip the once-per-session preloader for tests that aren't about it
export async function gotoReady(page, path = '/') {
  await page.addInitScript(() => sessionStorage.setItem('pf-loaded', '1'));
  await page.goto(path);
  await expect(page.locator('.hero')).toHaveClass(/is-in/);
}

// The bar hides while the page scrolls down (including after a nav jump); a visitor scrolls up a little to get it back
export async function revealNav(page) {
  await page.waitForFunction(() => new Promise((r) => { const y = scrollY; setTimeout(() => r(Math.abs(scrollY - y) < 1), 200); }));
  await page.evaluate(() => window.scrollBy(0, -150));
  await expect(page.locator('.nav')).not.toHaveClass(/is-hidden/);
}

export const isMobile = (testInfo) => testInfo.project.name !== 'desktop-chrome';

export { expect };
