import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { test, expect, gotoReady } from './fixtures.mjs';

const CANONICAL = 'https://mcleinjeionza.vercel.app/';
const SHOT_DIR = join(process.cwd(), 'test-results', 'redesign', 'W7');

function attachErrorListeners(page) {
  const errors = [];
  // Playwright's WebKit build lacks the icons for its own <video controls>; that noise is not the page's.
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().startsWith('Button failed to load, iconName')) {
      errors.push(`console.error: ${m.text()}`);
    }
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.failure()?.errorText} ${r.url()}`));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`);
  });
  return errors;
}

test('structure, SEO metadata, JSON-LD and no console errors', async ({ page }) => {
  const errors = attachErrorListeners(page);
  await gotoReady(page);

  // Single H1 and semantic landmarks
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('header')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.locator('nav[aria-label="Primary"]')).toHaveCount(1);
  await expect(page.locator('nav[aria-label="Footer"]')).toHaveCount(1);

  // Meta and canonical tags
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', CANONICAL);
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S+/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index,\s*follow/);
  await expect(page.locator('meta[name="google-site-verification"]')).toHaveAttribute('content', /\S+/);
  await expect(page.locator('meta[name="theme-color"][media="(prefers-color-scheme: light)"]')).toHaveAttribute('content', '#F2EFE9');
  await expect(page.locator('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]')).toHaveAttribute('content', '#0B0B0B');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /\S+/);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /\S+/);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', CANONICAL);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\//);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /^https:\/\//);

  // Parseable JSON-LD with Person, ProfilePage, WebSite, ItemList, knowsAbout, sameAs
  const rawLd = await page.locator('script[type="application/ld+json"]').textContent();
  const ld = JSON.parse(rawLd);
  const graph = ld['@graph'];
  expect(Array.isArray(graph)).toBe(true);
  const person = graph.find((n) => n['@type'] === 'Person');
  const website = graph.find((n) => n['@type'] === 'WebSite');
  const profile = graph.find((n) => n['@type'] === 'ProfilePage');
  const projects = graph.find((n) => n['@type'] === 'ItemList');
  expect(person).toBeTruthy();
  expect(website).toBeTruthy();
  expect(profile).toBeTruthy();
  expect(projects).toBeTruthy();
  expect(Array.isArray(person.knowsAbout) && person.knowsAbout.length).toBeGreaterThanOrEqual(5);
  expect(Array.isArray(person.sameAs) && person.sameAs.length).toBeGreaterThanOrEqual(2);
  expect(projects.itemListElement.length).toBeGreaterThanOrEqual(5);
  for (const entry of projects.itemListElement) {
    expect(entry.item?.name).toBeTruthy();
    expect(entry.item?.description).toBeTruthy();
    expect(['SoftwareApplication', 'CreativeWork']).toContain(entry.item?.['@type']);
  }

  // Signal anchors present

  // Scroll full page and ensure zero console/network errors
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('no horizontal overflow across scroll positions', async ({ page }) => {
  await gotoReady(page);
  for (const frac of [0, 0.5, 1]) {
    await page.evaluate((f) => window.scrollTo(0, Math.round(document.body.scrollHeight * f)), frac);
    const result = await page.evaluate(() => {
      const clips = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const s = getComputedStyle(p);
          if (s.overflowX !== 'visible' || s.position === 'fixed') return true;
        }
        return false;
      };
      const offenders = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (!r.width || getComputedStyle(el).position === 'fixed') return false;
          return (r.right > innerWidth + 1 || r.left < -1) && !clips(el);
        })
        .map((el) => `${el.tagName.toLowerCase()}.${el.className}`)
        .slice(0, 10);
      return {
        docOverflow: document.documentElement.scrollWidth > innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth,
        offenders,
      };
    });
    expect(result.docOverflow, `doc scrollWidth ${result.scrollWidth} > innerWidth ${result.innerWidth}`).toBe(false);
    expect(result.offenders).toEqual([]);
  }
});

test('reduced motion keeps content readable and settled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoReady(page);
  await expect(page.locator('.hero')).toHaveClass(/is-in/);
  await expect(page.locator('[data-years]')).not.toHaveClass(/is-pinned/);
  for (const item of await page.locator('.yr').all()) {
    await expect(item).toHaveJSProperty('inert', false);
  }
  const hiddenReveals = await page.evaluate(() => {
    return [...document.querySelectorAll('[data-rise]')].filter((el) => getComputedStyle(el).opacity === '0').length;
  });
  expect(hiddenReveals).toBe(0);
});

for (const theme of ['light', 'dark']) {
  test(`axe has no serious or critical violations (${theme})`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
    await page.addInitScript((t) => localStorage.setItem('portfolio-theme', t), theme);
    await gotoReady(page);
    await page.evaluate(() => document.fonts.ready);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const seriousOrCritical = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const summary = seriousOrCritical.map(
      (v) => `${v.impact} | ${v.id} | ${v.nodes.length} node(s) | ${v.help} | ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`
    );
    await testInfo.attach(`axe-${theme}.json`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
    expect(summary).toEqual([]);
  });

  test(`full-page screenshot (${theme})`, async ({ page }, testInfo) => {
    mkdirSync(SHOT_DIR, { recursive: true });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.addInitScript((t) => localStorage.setItem('portfolio-theme', t), theme);
    await gotoReady(page);
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (let y = 0; y <= document.body.scrollHeight; y += Math.max(300, innerHeight)) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForSelector('.activity__cal:not(.is-loading)', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(250);
    await page.screenshot({
      path: join(SHOT_DIR, `${testInfo.project.name}-${theme}.png`),
      fullPage: true,
    });
  });
}
