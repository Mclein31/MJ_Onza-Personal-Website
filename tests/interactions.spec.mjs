import { test, expect, gotoReady, revealNav } from './fixtures.mjs';

test.describe('desktop interactions', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('nav links jump to their sections and scroll-spy follows', async ({ page }) => {
    await gotoReady(page);
    for (const id of ['about', 'stack', 'recognition', 'contact']) {
      await revealNav(page);
      await page.click(`.nav__links a[href="#${id}"]`);
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
    await expect(page.locator('.nav__links a[href="#contact"]')).toHaveClass(/is-active/);
  });

  test('command palette opens with Ctrl/⌘+K, filters, runs and closes', async ({ page }) => {
    await gotoReady(page);
    const palette = page.locator('[data-palette]');
    await page.keyboard.press('ControlOrMeta+k');
    await expect(palette).toBeVisible();
    await expect(page.locator('[data-palette-input]')).toBeFocused();
    await page.keyboard.type('recog');
    await expect(page.locator('.palette__item')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(palette).toBeHidden();
    await expect(page.locator('#recognition')).toBeInViewport();

    await page.keyboard.press('/');
    await expect(palette).toBeVisible();
    await page.keyboard.type('zzzz');
    await expect(page.locator('.palette__empty')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(palette).toBeHidden();
  });

  test('project gallery buttons and dots move between screenshots', async ({ page }) => {
    await gotoReady(page);
    const gallery = page.locator('[data-gallery]').first();
    await gallery.scrollIntoViewIfNeeded();
    const dots = gallery.locator('[data-gallery-dots] button');
    await expect(dots).toHaveCount(3);
    await gallery.locator('[data-gallery-next]').click();
    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
    await dots.nth(2).click();
    await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true');
    await gallery.locator('[data-gallery-next]').click(); // wraps to the first
    await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');
  });

  test('Cipher Shift opens as a live demo window and closes', async ({ page }) => {
    await gotoReady(page);
    const opener = page.locator('[data-demo-open]');
    await opener.scrollIntoViewIfNeeded();
    await opener.click({ force: true }); // it sits on the moving work track
    const win = page.locator('[data-demo]');
    await expect(win).toBeVisible();
    await expect(page.frameLocator('[data-demo-frame]').locator('body')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
    await expect(page.locator('body')).not.toHaveClass(/is-locked/);
  });
});

test('theme toggle switches and survives a reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await gotoReady(page);
  const html = page.locator('html');
  await expect(html).not.toHaveAttribute('data-theme', 'light');
  await page.click('[data-theme-toggle]');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f2f3ef');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');
});

test('award photo opens the lightbox, arrows page through, focus returns on close', async ({ page }) => {
  await gotoReady(page);
  const first = page.locator('.award__img').first();
  await first.scrollIntoViewIfNeeded();
  await first.click();
  const box = page.locator('[data-lightbox]');
  await expect(box).toBeVisible();
  await expect(page.locator('[data-lb-img]')).toHaveJSProperty('complete', true);
  const count = page.locator('[data-lb-count]');
  const start = await count.textContent();
  await page.keyboard.press('ArrowRight');
  await expect(count).not.toHaveText(start);
  await page.keyboard.press('Escape');
  await expect(box).toBeHidden();
  await expect(first).toBeFocused();
});

test('message form validates, then sends (mocked) and confirms', async ({ page }) => {
  await gotoReady(page);
  await page.locator('.contact [data-message-open]').scrollIntoViewIfNeeded();
  await page.locator('.contact [data-message-open]').click();
  const dlg = page.locator('[data-message]');
  await expect(dlg).toBeVisible();
  await expect(page.locator('#fName')).toBeFocused();

  await page.click('[data-message-submit]');
  await expect(page.locator('#fName')).toHaveJSProperty('validity.valid', false);

  await page.fill('#fName', 'Test Visitor');
  await page.fill('#fEmail', 'visitor@example.com');
  await page.fill('#fMsg', 'Hello from Playwright');
  const sent = page.waitForRequest(/formsubmit\.co/);
  await page.click('[data-message-submit]');
  await sent;
  await expect(page.locator('[data-message-status]')).toHaveText(/Sent/);
  await expect(dlg).toBeHidden({ timeout: 5000 });
});

test('copy email shows a confirmation toast', async ({ page, context }, testInfo) => {
  if (testInfo.project.name !== 'iphone-14') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await gotoReady(page);
  const btn = page.locator('.link-row[data-copy]');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(page.locator('[data-toast]')).toHaveClass(/is-show/);
  await expect(page.locator('[data-toast-text]')).toHaveText('Email copied to clipboard');
});

test('like button counts once per visitor (mocked counter)', async ({ page }) => {
  await gotoReady(page);
  const like = page.locator('[data-like]');
  await expect(page.locator('[data-likes]')).toHaveText('10');
  await like.click();
  await expect(like).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-likes]')).toHaveText('11');
  await like.click();
  await expect(page.locator('.burst').last()).toHaveText(/Already liked/);
  await expect(page.locator('[data-likes]')).toHaveText('11');
  expect(page.stats.hits.filter((h) => h.includes('increment') && h.includes('likes'))).toHaveLength(1);
});

test('GitHub calendar renders a full year and settled stats', async ({ page }) => {
  await gotoReady(page);
  await page.locator('#activity').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-activity]')).toHaveClass(/is-live/);
  await expect(page.locator('.cell[data-i]')).toHaveCount(365);
  await expect(page.locator('[data-act="streak"]')).toHaveText('30');
  await expect(page.locator('[data-act="best"]')).toHaveText('40');
  await expect(page.locator('.cell[data-i]').last()).toHaveCSS('opacity', '1');
});
