import { test, expect } from './fixtures.mjs';
async function productionBrowser(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {get:()=>false});
    sessionStorage.setItem('pf-loaded','1');
  });
  await page.route('https://portfolio.test/**', async route => {
    const url=new URL(route.request().url());
    if(url.pathname==='/api/stats') return route.fallback();
    await route.fulfill({response:await route.fetch({url:'http://127.0.0.1:4173'+url.pathname+url.search})});
  });
}
test('first real visit counts once across reloads and later sessions', async ({page}) => {
  await productionBrowser(page);
  await page.goto('https://portfolio.test/');
  await expect(page.locator('[data-visits]')).toHaveText('101');
  await page.evaluate(()=>sessionStorage.clear());
  await page.reload();
  await expect(page.locator('[data-visits]')).toHaveText('101');
  expect(page.stats.hits.filter(h=>h.includes('increment')&&h.includes('visits'))).toHaveLength(1);
});
test('a failed first visit can retry and never increments Abacus directly', async ({page}) => {
  await productionBrowser(page);
  let fail=true; const direct=[];
  await page.route(/abacus\.jasoncameron\.dev/, route=>{direct.push(route.request().url());return route.fulfill({json:{value:100}});});
  await page.route(/\/api\/stats\?.*metric=visits/, route=>fail?route.fulfill({status:502,json:{error:'offline'}}):route.fallback());
  await page.goto('https://portfolio.test/');
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('site_user_has_visited'))).toBe(null);
  fail=false;
  await page.reload();
  await expect(page.locator('[data-visits]')).toHaveText('101');
  expect(direct.filter(url=>url.includes('/hit/'))).toHaveLength(0);
});
