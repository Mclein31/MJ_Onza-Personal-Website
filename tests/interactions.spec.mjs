import { test, expect, gotoReady, scrollSettled } from './fixtures.mjs';

test.describe('desktop interactions', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('nav links jump to their sections, the bar stays visible, scroll-spy follows', async ({ page }) => {
    await gotoReady(page);
    for (const id of ['about', 'stack', 'recognition', 'contact']) {
      await page.click(`.nav__links a[href="#${id}"]`);
      await expect(page.locator(`#${id}`)).toBeInViewport();
      // The section's main heading lands just under the floating nav (contact is a full screen of its own)
      if (id !== 'contact') await expect.poll(() => page.locator(`#${id} h2`).first().evaluate((h) => {
        const gap = h.getBoundingClientRect().top - document.querySelector('.nav__inner').getBoundingClientRect().bottom;
        return gap > 12 && gap < 80;
      }), { message: `#${id} heading lands just under the nav` }).toBe(true);
      await scrollSettled(page);
      await expect(page.locator('.nav'), 'a jump down must not hide the bar').not.toHaveClass(/is-hidden/);
    }
    await expect(page.locator('.nav__links a[href="#contact"]')).toHaveClass(/is-active/);

    await page.evaluate(() => scrollTo(0, document.querySelector('#about').offsetTop));
    await scrollSettled(page);
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 600);
    await expect(page.locator('.nav')).toHaveClass(/is-hidden/);
    await page.mouse.wheel(0, -200);
    await expect(page.locator('.nav')).not.toHaveClass(/is-hidden/);
  });

  test('project gallery buttons and dots move between screenshots', async ({ page }) => {
    await gotoReady(page);
    const gallery = page.locator('[data-gallery]').first();
    await gallery.scrollIntoViewIfNeeded();
    const dots = gallery.locator('[data-gallery-dots] button');
    await expect(dots).toHaveCount(4); // 3 screenshots + the promo
    await gallery.locator('[data-gallery-next]').click();
    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
    await dots.nth(3).click();
    await expect(dots.nth(3)).toHaveAttribute('aria-current', 'true');
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

for (const [name, slug] of [['AdvanCare', 'advancare'], ['MedCore', 'medcore'], ['SERVIO', 'servio'], ['MedRec', 'medrec']]) {
  test(`${name} promo opens in a video window, stops on close, focus returns`, async ({ page }) => {
    await gotoReady(page);
    const opener = page.locator(`[data-video-open][data-video-title="${name}"]`);
    // Keyboard, not a click: on desktop the button rides the moving work track, and a click can land behind it
    await opener.focus();
    await page.keyboard.press('Enter');
    const win = page.locator('[data-video]');
    await expect(win).toBeVisible();
    await expect(win.locator('[data-video-title-el]')).toHaveText(name);
    const player = win.locator('[data-video-player]');
    await expect(player).toHaveAttribute('src', new RegExp(`assets/video/${slug}-promo\\.mp4$`));
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
    await expect.poll(() => player.evaluate((v) => v.paused)).toBe(true); // the close event comes a task later
    await expect(page.locator('body')).not.toHaveClass(/is-locked/);
    await expect(opener).toBeFocused();
  });

  test(`${name} deck ends on the promo video; expanding it opens the video window`, async ({ page }) => {
    await gotoReady(page);
    const gallery = page.locator(`[data-gallery]:has(.gallery__slide--video[data-video-title="${name}"])`);
    await expect(gallery.locator('.gallery__slide').last().locator('video')).toHaveAttribute('poster', new RegExp(`${slug}-promo-poster\\.webp$`));
    await gallery.scrollIntoViewIfNeeded();
    await gallery.locator('[data-gallery-dots] button').last().click({ force: true });
    await expect(gallery.locator('[data-gallery-dots] button').last()).toHaveAttribute('aria-current', 'true');
    await gallery.locator('[data-gallery-zoom]').click({ force: true });
    await expect(page.locator('[data-video]')).toBeVisible();
    await expect(page.locator('[data-video-player]')).toHaveAttribute('src', new RegExp(`assets/video/${slug}-promo\\.mp4$`));
    await expect(page.locator('[data-lightbox]')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-video]')).toBeHidden();
  });
}

test('the video window swaps film, poster and title between promos', async ({ page }) => {
  await gotoReady(page);
  const win = page.locator('[data-video]');
  const player = win.locator('[data-video-player]');
  for (const [name, slug] of [['AdvanCare', 'advancare'], ['MedCore', 'medcore'], ['SERVIO', 'servio'], ['MedRec', 'medrec']]) {
    await page.locator(`[data-video-open][data-video-title="${name}"]`).focus();
    await page.keyboard.press('Enter');
    await expect(win.locator('[data-video-title-el]')).toHaveText(name);
    await expect(player).toHaveAttribute('src', new RegExp(`${slug}-promo\\.mp4$`));
    await expect(player).toHaveAttribute('poster', new RegExp(`${slug}-promo-poster\\.webp$`));
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
  }
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

test('a project slide opens the screenshot viewer at that slide, with its note', async ({ page }) => {
  await gotoReady(page);
  const gallery = page.locator('[data-gallery]').first();
  await gallery.scrollIntoViewIfNeeded();
  const slides = gallery.locator('.gallery__slide');
  await gallery.locator('[data-gallery-next]').click();
  await expect(gallery.locator('[data-gallery-dots] button').nth(1)).toHaveAttribute('aria-current', 'true');

  const zoom = gallery.locator('[data-gallery-zoom]');
  await zoom.click();
  const box = page.locator('[data-lightbox]');
  await expect(box).toBeVisible();
  await expect(box).toHaveClass(/is-wide/);
  await expect(box).toHaveAttribute('aria-label', 'Screenshot viewer');
  await expect(page.locator('[data-lb-count]')).toHaveText('2 / 3');
  await expect(page.locator('[data-lb-title]')).toHaveText(await slides.nth(1).getAttribute('data-title'));
  await expect(page.locator('[data-lb-img]')).toHaveJSProperty('complete', true);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-lb-title]')).toHaveText(await slides.nth(2).getAttribute('data-title'));
  await page.keyboard.press('Escape');
  await expect(box).toBeHidden();
  await expect(zoom).toBeFocused();

  // Tapping the slide itself opens the viewer too
  await slides.nth(1).click();
  await expect(box).toBeVisible();
  await page.keyboard.press('Escape');

  // The award photos still open in the narrow photo viewer afterwards
  const award = page.locator('.award__img').first();
  await award.scrollIntoViewIfNeeded();
  await award.click();
  await expect(box).not.toHaveClass(/is-wide/);
  await expect(box).toHaveAttribute('aria-label', 'Photo viewer');
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
  const btn = page.locator('.pass__copy[data-copy]');
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

test('local and automated browsers read the view count but never add to it (mocked counter)', async ({ page }) => {
  await gotoReady(page);
  await expect(page.locator('[data-visits]')).toHaveText('100');
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.locator('[data-visits]')).toHaveText('100');
  expect(page.stats.hits.filter((h) => h.includes('increment') && h.includes('visits'))).toHaveLength(0);
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

test('what I do opens one row at a time', async ({ page }) => {
  await gotoReady(page);
  const btns = page.locator('.does__btn');
  await expect(btns.nth(0)).toHaveAttribute('aria-expanded', 'true');
  await btns.nth(1).scrollIntoViewIfNeeded();
  await btns.nth(1).click();
  await expect(btns.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(btns.nth(0)).toHaveAttribute('aria-expanded', 'false');
  await btns.nth(1).click();
  await expect(btns.nth(1)).toHaveAttribute('aria-expanded', 'false');
});

test('the contact wallet brings a tapped pass to the front', async ({ page }) => {
  await gotoReady(page);
  const linkedin = page.locator('.pass--in');
  await linkedin.scrollIntoViewIfNeeded();
  await expect(page.locator('.pass--mail')).toHaveClass(/is-front/);
  await linkedin.locator('.pass__head').click();
  await expect(linkedin).toHaveClass(/is-front/);
  await expect(linkedin.locator('.pass__head')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.pass--mail .pass__body')).toHaveJSProperty('inert', true);
  await expect(linkedin.locator('.pass__go')).toHaveAttribute('href', /linkedin\.com/);
});

test('contact sounds play after interaction without a site mute control', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('portfolio-sfx', 'off');
    const Audio = window.AudioContext || window.webkitAudioContext;
    const original = Audio.prototype.createBufferSource;
    Audio.prototype.createBufferSource = function (...args) {
      const source = original.apply(this, args);
      const start = source.start.bind(source);
      source.start = (...args) => { window.soundStarts = (window.soundStarts || 0) + 1; return start(...args); };
      return source;
    };
  });
  await gotoReady(page);
  await expect(page.locator('[data-sfx-toggle]')).toHaveCount(0);
  await page.locator('.pass--gh .pass__head').click();
  await expect.poll(() => page.evaluate(() => window.soundStarts || 0)).toBeGreaterThan(0);
});
