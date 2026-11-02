import { test, expect } from './fixtures.mjs';

const canonical = 'https://mcleinjeionza.vercel.app/';

test('homepage exposes one canonical identity and the requested name variants', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('McLein Jei Onza | Developer Portfolio');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index, follow/);
  const data = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  const nodes = data['@graph'];
  const person = nodes.find(node => node['@type'] === 'Person');
  const profile = nodes.find(node => node['@type'] === 'ProfilePage');
  const website = nodes.find(node => node['@type'] === 'WebSite');
  expect(person.name).toBe('McLein Jei Onza');
  expect(person.alternateName).toEqual(['McLein Onza', 'mcleinjeionza']);
  expect(profile.mainEntity['@id']).toBe(person['@id']);
  expect(profile.isPartOf['@id']).toBe(website['@id']);
  expect(person.sameAs).toEqual(await page.locator('footer nav a').evaluateAll(links => links.filter(a => /github\.com|linkedin\.com/.test(a.href)).map(a => a.href)));
});

test('crawler discovery files point only to the canonical page', async ({ request, page }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Allow: /');
  expect(await robots.text()).toContain('Sitemap: ' + canonical + 'sitemap.xml');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  await page.goto('/');
  const result = await page.evaluate(xml => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    return { error: !!doc.querySelector('parsererror'), urls: [...doc.querySelectorAll('loc')].map(el => el.textContent) };
  }, await sitemap.text());
  expect(result).toEqual({ error: false, urls: [canonical] });
});

test('identity and portfolio content are available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('McLein Jei Onza');
    await expect(page.locator('.about__lede')).toContainText('McLein Jei Onza');
    await expect(page.locator('.project__info').first()).toBeVisible();
  } finally { await context.close(); }
});
