// Permanent v5 behaviour suite. Defaults to the wired skeleton; set V5_PATH=/ when the new page is ready.
// Selects elements solely by data hooks, ids and ARIA roles/names (never CSS classes).
import { test, expect, contributionFixture } from './fixtures.mjs';

const V5_PATH = process.env.V5_PATH || '/';
// WebKit logs native <video controls> placard icon loading errors as console errors; browser UI, not the page.
const WEBKIT_VIDEO_UI_NOISE = /^Button failed to load, iconName\b/;

function watchHealth(page) {
  const errors = [];
  const badResponses = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !WEBKIT_VIDEO_UI_NOISE.test(msg.text())) errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('response', (res) => {
    if (res.status() >= 400) badResponses.push(`${res.status()} ${res.url()}`);
  });
  return { errors, badResponses };
}

async function gotoV5(page, { seenIntro = true } = {}) {
  if (seenIntro) {
    await page.addInitScript(() => {
      try { sessionStorage.setItem('v5-intro', '1'); } catch {}
    });
  }
  await page.goto(V5_PATH);
  await expect(page.locator('html')).toHaveAttribute('data-site-ready', 'true', { timeout: 15_000 });
}

async function scrollCenter(locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
}

test.describe('page health', () => {
  test('boots cleanly with no console/page errors, no 4xx/5xx, and core hooks wired', async ({ page, hasTouch }) => {
    const { errors, badResponses } = watchHealth(page);
    await gotoV5(page);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-site-ready', 'true');
    await expect(html).toHaveClass(/\bis-ready\b/);
    await expect(html).not.toHaveClass(/\bis-intro\b/);
    if (hasTouch) await expect(html).not.toHaveClass(/\bis-smooth-scroll\b/);
    else await expect(html).toHaveClass(/\bis-smooth-scroll\b/);

    await expect(page.locator('script[type="module"][src="/scripts/main.js"]')).toHaveCount(1);
    await expect(page.locator('link[href="/vendor/lenis/lenis.css"]')).toHaveCount(1);
    await expect(html).toHaveAttribute('data-theme', /^(light|dark)$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('[data-year]')).toHaveText(String(new Date().getFullYear()));

    for (const hook of ['[data-header]', '[data-hero]', '[data-nav]', '[data-menu]', '[data-menu-toggle]', '[data-intro-skip]']) {
      expect(await page.locator(hook).count(), `missing hook ${hook}`).toBeGreaterThan(0);
    }

    // Trigger lazy sections (activity calendar and contact mini grid) before checking responses and images.
    await page.locator('#activity').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(page.locator('[data-activity]')).toHaveAttribute('data-state', 'ready', { timeout: 12_000 });
    await page.locator('#contact').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect.poll(() => page.locator('[data-activity-mini] [data-day]').count()).toBeGreaterThan(0);

    const brokenImages = await page.evaluate(() => [...document.images]
      .filter((img) => !img.closest('dialog') && img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src') || img.alt || 'image'));
    expect(brokenImages).toEqual([]);
    expect(errors).toEqual([]);
    expect(badResponses).toEqual([]);
  });
});

test.describe('theme toggle, persistence and theme-color', () => {
  // On phones/tablets the one toggle lives inside the burger menu: open it first, close it after.
  const pressToggle = async (page, toggle) => {
    const inMenu = !(await toggle.isVisible());
    if (inMenu) {
      await page.locator('[data-menu-toggle]').click();
      await expect(toggle).toBeVisible();
    }
    await toggle.click();
    if (inMenu) {
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-menu-toggle]')).toHaveAttribute('aria-expanded', 'false');
    }
  };
  test('toggles theme, updates meta[name="theme-color"], and persists across reload', async ({ page }) => {
    await gotoV5(page);
    const html = page.locator('html');
    const toggle = page.locator('[data-theme-toggle]');

    const colors = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return {
        light: cs.getPropertyValue('--theme-color-light').trim() || '#EDEEF0',
        dark: cs.getPropertyValue('--theme-color-dark').trim() || '#0D0E10',
      };
    });

    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    for (const meta of await page.locator('meta[name="theme-color"]').all()) {
      await expect(meta).toHaveAttribute('content', colors.light);
    }

    await pressToggle(page, toggle);
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('data-theme-current', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('portfolio-theme'))).toBe('dark');
    for (const meta of await page.locator('meta[name="theme-color"]').all()) {
      await expect(meta).toHaveAttribute('content', colors.dark);
    }

    await page.reload();
    await expect(html).toHaveAttribute('data-site-ready', 'true', { timeout: 15_000 });
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    for (const meta of await page.locator('meta[name="theme-color"]').all()) {
      await expect(meta).toHaveAttribute('content', colors.dark);
    }

    await pressToggle(page, toggle);
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => localStorage.getItem('portfolio-theme'))).toBe('light');
    for (const meta of await page.locator('meta[name="theme-color"]').all()) {
      await expect(meta).toHaveAttribute('content', colors.light);
    }
  });
});

test.describe('nav jump and scroll-spy (desktop)', () => {
  test.skip(({ hasTouch }) => hasTouch, 'desktop only');

  test('nav link jumps cleanly under header and scroll-spy tracks every section', async ({ page }) => {
    await gotoV5(page);

    const aboutLink = page.locator('[data-header] [data-nav][href="#about"]');
    await aboutLink.click();

    await expect.poll(() => new URL(page.url()).hash).toBe('#about');
    await expect(aboutLink).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('html')).not.toHaveClass(/\blenis-scrolling\b/, { timeout: 8_000 });
    await expect.poll(async () => page.evaluate(() => {
      const top = document.getElementById('about').getBoundingClientRect().top;
      const hh = document.querySelector('[data-header]').getBoundingClientRect().height;
      return Math.round(Math.abs(top - hh));
    }), { timeout: 8_000 }).toBeLessThanOrEqual(4);

    const sectionIds = ['work', 'about', 'journey', 'activity', 'stack', 'recognition', 'training', 'contact'];
    for (const id of sectionIds) {
      await page.evaluate(async (targetId) => {
        const { scrollTo } = await import('/scripts/core/motion.js');
        const el = document.getElementById(targetId);
        const r = el.getBoundingClientRect();
        const hh = document.querySelector('[data-header]').getBoundingClientRect().height;
        const band = Math.round(Math.max(hh + 16, window.innerHeight * 0.35));
        const aim = r.top + window.scrollY + Math.min(r.height * 0.4, 80) - band;
        scrollTo(aim, { immediate: true });
      }, id);
      await expect(page.locator('html')).not.toHaveClass(/\blenis-scrolling\b/);
      await expect.poll(() => page.evaluate(() => {
        const cur = document.querySelector('[data-nav][aria-current="location"]');
        return cur ? cur.getAttribute('href') : null;
      }), { message: `scroll-spy expected #${id}` }).toBe(`#${id}`);
    }

    await page.evaluate(async () => {
      const { scrollTo } = await import('/scripts/core/motion.js');
      scrollTo(0, { immediate: true });
    });
    await expect(page.locator('html')).not.toHaveClass(/\blenis-scrolling\b/);
    await expect(page.locator('[data-nav][aria-current]')).toHaveCount(0);
  });
});

test.describe('phone menu focus trap and Escape (touch)', () => {
  test.skip(({ hasTouch }) => !hasTouch, 'touch only');

  test('opens, traps Tab/Shift+Tab, closes on Escape, and closes on link navigation', async ({ page, browserName }) => {
    await gotoV5(page);
    const toggle = page.locator('[data-menu-toggle]');
    const menu = page.locator('[data-menu]');
    const html = page.locator('html');
    const body = page.locator('body');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();
    await expect(html).toHaveClass(/\bis-menu-open\b/);
    await expect(html).toHaveClass(/\bis-scroll-locked\b/);
    await expect(body).toHaveClass(/\bis-locked\b/);

    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('[data-menu]'))).toBe(true);
    const inertStates = await page.locator('[data-menu-inert]').evaluateAll((els) => els.map((e) => e.inert));
    expect(inertStates.length).toBeGreaterThan(0);
    expect(inertStates.every(Boolean)).toBe(true);

    // WebKit skips <a> links on plain Tab unless Option+Tab is pressed.
    const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    const seenFocus = new Set();
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press(tabKey);
      const info = await page.evaluate(() => {
        const ae = document.activeElement;
        return {
          inside: !!(ae && (ae.closest('[data-menu]') || ae === document.querySelector('[data-menu-toggle]') || ae.closest('[data-header]'))),
          tag: ae ? `${ae.tagName}:${ae.getAttribute('href') || ae.textContent?.trim()}` : 'none',
        };
      });
      expect(info.inside, `Tab escape at step ${i}: ${info.tag}`).toBe(true);
      seenFocus.add(info.tag);
    }
    expect(seenFocus.size).toBeGreaterThan(2);

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press(`Shift+${tabKey}`);
      const inside = await page.evaluate(() => {
        const ae = document.activeElement;
        return !!(ae && (ae.closest('[data-menu]') || ae === document.querySelector('[data-menu-toggle]') || ae.closest('[data-header]')));
      });
      expect(inside, `Shift+Tab escape at step ${i}`).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(html).not.toHaveClass(/\bis-menu-open\b/);
    await expect(html).not.toHaveClass(/\bis-scroll-locked\b/);
    await expect(body).not.toHaveClass(/\bis-locked\b/);
    await expect(toggle).toBeFocused();
    expect(await page.locator('[data-menu-inert]').evaluateAll((els) => els.every((e) => !e.inert))).toBe(true);

    await toggle.click();
    await expect(menu).toBeVisible();
    await menu.locator('[data-nav][href="#stack"]').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(html).not.toHaveClass(/\bis-menu-open\b/);
    await expect(body).not.toHaveClass(/\bis-locked\b/);
    await expect.poll(() => new URL(page.url()).hash).toBe('#stack');
    await expect(page.locator('[data-menu] [data-nav][href="#stack"]')).toHaveAttribute('aria-current', 'location');
  });
});

test.describe('galleries and screenshot viewer', () => {
  test('all 5 galleries step and open the viewer at the clicked slide', async ({ page }) => {
    await gotoV5(page);
    const galleries = page.locator('[data-gallery]');
    await expect(galleries).toHaveCount(5);

    const viewer = page.locator('dialog[data-lightbox-dialog]');
    for (let g = 0; g < 5; g++) {
      const gal = galleries.nth(g);
      await scrollCenter(gal);

      const slides = gal.locator('[data-gallery-track] > *');
      const slideCount = await slides.count();
      expect(slideCount).toBeGreaterThan(1);

      const dots = gal.locator('[data-gallery-dot]');
      await expect(dots).toHaveCount(slideCount);
      await expect(gal).toHaveAttribute('data-index', '0');
      await expect(gal.locator('[data-gallery-current]')).toHaveText('1');
      await expect(gal.locator('[data-gallery-total]')).toHaveText(String(slideCount));
      await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');

      await gal.locator('[data-gallery-next]').click();
      await expect(gal).toHaveAttribute('data-index', '1');
      await expect(gal.locator('[data-gallery-current]')).toHaveText('2');
      await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');

      const slide = slides.nth(1);
      const expectedTitle = await slide.locator('img').first().getAttribute('data-title');
      const trigger = slide.locator('[data-lightbox]');
      await scrollCenter(trigger);
      await trigger.click();

      await expect(viewer).toHaveJSProperty('open', true);
      await expect(viewer.locator('[data-lightbox-title]')).toHaveText(expectedTitle);
      await expect(viewer.locator('[data-lightbox-count]')).toHaveText(/^2 \//);
      await expect.poll(() => viewer.locator('[data-lightbox-image]').evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);

      await page.keyboard.press('Escape');
      await expect(viewer).toHaveJSProperty('open', false);
      await expect(page.locator('body')).not.toHaveClass(/\bis-locked\b/);
      await expect(trigger).toBeFocused();
    }
  });

  test('gallery wraps, dots jump, video slide opens video dialog, and viewer arrow keys page', async ({ page }) => {
    await gotoV5(page);
    const firstGal = page.locator('[data-gallery]').first();
    await scrollCenter(firstGal);

    const slideCount = await firstGal.locator('[data-gallery-track] > *').count();
    const dots = firstGal.locator('[data-gallery-dot]');

    // Prev from first wraps to last (promo video slide), Next wraps back to first, dot selects directly.
    await firstGal.locator('[data-gallery-prev]').click();
    await expect(firstGal).toHaveAttribute('data-index', String(slideCount - 1));
    await expect(dots.nth(slideCount - 1)).toHaveAttribute('aria-current', 'true');

    // Video slide opens dialog[data-video], not the image viewer.
    const videoSlideBtn = firstGal.locator('[data-gallery-track] > *').nth(slideCount - 1).locator('[data-video-open]');
    await scrollCenter(videoSlideBtn);
    await videoSlideBtn.click();
    await expect(page.locator('dialog[data-video]')).toHaveJSProperty('open', true);
    await expect(page.locator('dialog[data-lightbox-dialog]')).toHaveJSProperty('open', false);
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[data-video]')).toHaveJSProperty('open', false);

    await firstGal.locator('[data-gallery-next]').click();
    await expect(firstGal).toHaveAttribute('data-index', '0');

    await dots.nth(2).click();
    await expect(firstGal).toHaveAttribute('data-index', '2');
    await expect(firstGal.locator('[data-gallery-current]')).toHaveText('3');

    // Training certificate group opens in the same viewer and navigates with Arrow keys.
    const certBtn = page.locator('[data-lightbox="training"]').first();
    await scrollCenter(certBtn);
    await certBtn.click();
    const viewer = page.locator('dialog[data-lightbox-dialog]');
    await expect(viewer).toHaveJSProperty('open', true);
    await expect(viewer.locator('[data-lightbox-count]')).toHaveText(/^1 \//);
    await page.keyboard.press('ArrowRight');
    await expect(viewer.locator('[data-lightbox-count]')).toHaveText(/^2 \//);
    await page.keyboard.press('ArrowLeft');
    await expect(viewer.locator('[data-lightbox-count]')).toHaveText(/^1 \//);
    await page.keyboard.press('Escape');
    await expect(viewer).toHaveJSProperty('open', false);
    await expect(certBtn).toBeFocused();
  });
});

test.describe('promo videos play and stop on close', () => {
  test('every distinct promo clip plays in the video dialog and unloads on close', async ({ page }) => {
    test.setTimeout(60_000);
    await gotoV5(page);

    const openers = await page.locator('[data-video-open]').evaluateAll((els) => {
      const seen = new Set();
      const picks = [];
      els.forEach((el, index) => {
        const src = el.getAttribute('data-video-src') || '';
        if (!src || seen.has(src)) return;
        seen.add(src);
        picks.push({ index, src, poster: el.getAttribute('data-video-poster') || '', title: el.getAttribute('data-video-title') || '' });
      });
      return picks;
    });
    expect(openers.length).toBeGreaterThanOrEqual(4);

    const dlg = page.locator('dialog[data-video]');
    const player = dlg.locator('[data-video-player]');

    for (let i = 0; i < openers.length; i++) {
      const clip = openers[i];
      const btn = page.locator('[data-video-open]').nth(clip.index);
      await scrollCenter(btn);
      await btn.click();

      await expect(dlg).toHaveJSProperty('open', true);
      await expect(dlg.locator('[data-video-title-el]')).toHaveText(clip.title);
      await expect(player).toHaveAttribute('src', new RegExp(`${clip.src.split('/').pop().replace('.', '\\.')}$`));
      if (clip.poster) await expect(player).toHaveAttribute('poster', new RegExp(`${clip.poster.split('/').pop().replace('.', '\\.')}$`));

      await expect.poll(
        () => player.evaluate((v) => !v.paused && v.currentTime > 0.25),
        { timeout: 10_000, message: `video ${clip.title} did not advance playback` },
      ).toBe(true);

      if (i === openers.length - 1) await page.keyboard.press('Escape');
      else await dlg.locator('[data-video-close]').click();

      await expect(dlg).toHaveJSProperty('open', false);
      await expect(player).toHaveJSProperty('paused', true);
      expect(await player.getAttribute('src')).toBeNull();
      expect(await player.getAttribute('poster')).toBeNull();
      await expect(page.locator('body')).not.toHaveClass(/\bis-locked\b/);
      await expect(btn).toBeFocused();
    }
  });
});

test.describe('message form validation and mocked submit', () => {
  test('validates empty/invalid input without posting, then submits to mocked FormSubmit and closes', async ({ page }) => {
    const posts = [];
    await gotoV5(page);
    // Register after fixtures.mjs's route so route.fallback() delegates fulfillment back to fixtures.mjs.
    await page.route(/formsubmit\.co/, async (route) => {
      posts.push({ url: route.request().url(), method: route.request().method(), body: route.request().postData() || '' });
      await route.fallback();
    });

    const openBtn = page.locator('[data-message-open]').first();
    await openBtn.click();

    const dlg = page.locator('dialog[data-message]');
    const form = dlg.locator('[data-message-form]');
    await expect(dlg).toHaveJSProperty('open', true);
    await expect(page.locator('body')).toHaveClass(/\bis-locked\b/);
    await expect(page.locator('#fName')).toBeFocused();

    // Empty submit blocked by constraint validation
    await dlg.locator('[data-message-submit]').click();
    await expect(page.locator('#fName')).toHaveAttribute('aria-invalid', 'true');
    expect(posts).toHaveLength(0);
    await expect(form).not.toHaveAttribute('data-state', 'success');

    // Invalid email blocked
    await page.fill('#fName', 'Test Visitor');
    await expect(page.locator('#fName')).not.toHaveAttribute('aria-invalid', 'true');
    await page.fill('#fEmail', 'not-an-email');
    await page.fill('#fMsg', 'Hello from Playwright.');
    await dlg.locator('[data-message-submit]').click();
    await expect(page.locator('#fEmail')).toHaveAttribute('aria-invalid', 'true');
    expect(posts).toHaveLength(0);

    // Valid submission hits mocked FormSubmit once, shows success, auto-closes and unlocks
    await page.fill('#fEmail', 'visitor@example.com');
    await dlg.locator('[data-message-submit]').click();

    await expect(form).toHaveAttribute('data-state', 'success', { timeout: 6_000 });
    await expect(dlg.locator('[data-message-status]')).toHaveText(/Sent/i);
    expect(posts).toHaveLength(1);
    expect(posts[0].method).toBe('POST');
    expect(posts[0].url).toMatch(/formsubmit\.co\/ajax\/mcleinjeionza06@gmail\.com/);
    expect(posts[0].body).toContain('visitor@example.com');

    await expect(dlg).toHaveJSProperty('open', false, { timeout: 6_000 });
    await expect(page.locator('body')).not.toHaveClass(/\bis-locked\b/);
    await expect(page.locator('html')).not.toHaveClass(/\bis-scroll-locked\b/);
  });
});

test.describe('stats render and like once', () => {
  test('renders mocked counts without incrementing visits, and likes once per browser', async ({ page }) => {
    await gotoV5(page);

    const visits = page.locator('[data-stats-visits]');
    const likes = page.locator('[data-stats-likes]');
    const likeBtn = page.locator('[data-stats-like]');

    await expect(visits).toHaveText('100');
    await expect(visits).toHaveAttribute('data-count', '100');
    await expect(likes).toHaveText('10');
    await expect(likes).toHaveAttribute('data-count', '10');
    await expect(likeBtn).toHaveAttribute('aria-pressed', 'false');
    expect(page.stats.hits.filter((h) => h.includes('increment') && h.includes('visits'))).toHaveLength(0);

    await scrollCenter(likeBtn);
    await likeBtn.click();

    await expect(likes).toHaveText('11');
    await expect(likeBtn).toHaveAttribute('aria-pressed', 'true');
    expect(page.stats.hits.filter((h) => h.includes('increment') && h.includes('likes'))).toHaveLength(1);

    // Second click in same session is ignored
    await likeBtn.click();
    await expect(likes).toHaveText('11');
    await expect(page.locator('[data-toast-text]')).toHaveText(/Already liked/i);
    expect(page.stats.hits.filter((h) => h.includes('increment') && h.includes('likes'))).toHaveLength(1);

    // Persists across reload without re-incrementing
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-site-ready', 'true', { timeout: 15_000 });
    await expect(likeBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(likes).toHaveText('11');
    await scrollCenter(likeBtn);
    await likeBtn.click();
    expect(page.stats.hits.filter((h) => h.includes('increment') && h.includes('likes'))).toHaveLength(1);
  });
});

test.describe('activity calendar and retry state', () => {
  test('renders 365 day cells, legend, totals, highlight toggle and contact mini grid', async ({ page }) => {
    const fixture = contributionFixture();
    const expectedTotal = fixture.contributions.reduce((s, d) => s + d.count, 0);
    const expectedActive = fixture.contributions.filter((d) => d.count > 0).length;
    const expectedBest = Math.max(...fixture.contributions.map((d) => d.count));

    await gotoV5(page);
    await page.locator('#activity').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));

    const activity = page.locator('[data-activity]');
    await expect(activity).toHaveAttribute('data-state', 'ready', { timeout: 12_000 });
    await expect(page.locator('[data-activity-loading]')).toBeHidden();
    await expect(page.locator('[data-activity-error]')).toBeHidden();

    const dayCells = page.locator('[data-activity-calendar] [data-day]:not([data-pad])');
    await expect(dayCells).toHaveCount(365);
    await expect(page.locator('[data-activity-calendar] [data-day][data-level]:not([data-pad])')).toHaveCount(365);

    const legendLevels = await page.locator('[data-activity] [data-level]:not([data-day])').evaluateAll((els) => els.map((e) => e.getAttribute('data-level')));
    expect(legendLevels).toEqual(['0', '1', '2', '3', '4']);
    await expect(page.locator('[data-l]')).toHaveCount(0);

    await expect(page.locator('[data-act="total"]')).toHaveText(String(expectedTotal));
    await expect(page.locator('[data-act="days"]')).toHaveText(String(expectedActive));
    await expect(page.locator('[data-act="streak"]')).toHaveText('30');
    await expect(page.locator('[data-act="best"]')).toHaveText(String(expectedBest));

    const bestHl = page.locator('[data-hl="best"]');
    await scrollCenter(bestHl);
    await bestHl.click();
    await expect(bestHl).toHaveAttribute('aria-pressed', 'true');
    await expect(activity).toHaveAttribute('data-highlight', 'best');
    await bestHl.click();
    await expect(bestHl).toHaveAttribute('aria-pressed', 'false');

    await page.locator('#contact').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(page.locator('[data-activity-mini] [data-day][data-level]')).toHaveCount(112, { timeout: 8_000 });
    await expect(page.locator('[data-activity-mini-total]')).toHaveText(new RegExp(String(expectedTotal)));
  });

  test('shows error state when both contribution sources fail and recovers on Retry', async ({ page }) => {
    let failBoth = true;
    const seenSources = [];
    await gotoV5(page);
    await page.route(/\/api\/contributions|github-contributions-api/, (route) => {
      seenSources.push(route.request().url());
      if (failBoth) return route.fulfill({ status: 503, json: { error: 'offline' } });
      return route.fallback();
    });

    await page.locator('#activity').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    const activity = page.locator('[data-activity]');
    const retryBtn = page.locator('[data-activity-retry]');

    await expect(activity).toHaveAttribute('data-state', 'error', { timeout: 12_000 });
    await expect(page.locator('[data-activity-error]')).toBeVisible();
    await expect(retryBtn).toBeVisible();
    await expect(page.locator('[data-activity-calendar]')).toBeHidden();
    expect(seenSources.some((u) => u.includes('/api/contributions'))).toBe(true);
    expect(seenSources.some((u) => u.includes('github-contributions-api'))).toBe(true);

    failBoth = false;
    await scrollCenter(retryBtn);
    await retryBtn.click();

    await expect(activity).toHaveAttribute('data-state', 'ready', { timeout: 12_000 });
    await expect(page.locator('[data-activity-error]')).toBeHidden();
    await expect(page.locator('[data-activity-calendar] [data-day]:not([data-pad])')).toHaveCount(365);
    await expect(page.locator('[data-act="total"]')).toHaveText('100');
  });
});

test.describe('dialogs lock and unlock scrolling', () => {
  test('message, viewer and video dialogs lock scrolling while open and restore it on close', async ({ page, hasTouch }) => {
    await gotoV5(page);
    const html = page.locator('html');
    const body = page.locator('body');

    const scenarios = [
      {
        name: 'message',
        dlg: page.locator('dialog[data-message]'),
        open: async () => {
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await page.locator('[data-message-open]').first().click();
        },
        close: () => page.keyboard.press('Escape'),
      },
      {
        name: 'viewer',
        dlg: page.locator('dialog[data-lightbox-dialog]'),
        open: async () => {
          const trigger = page.locator('[data-lightbox]').first();
          await scrollCenter(trigger);
          await trigger.click();
        },
        close: () => page.keyboard.press('Escape'),
      },
      {
        name: 'video',
        dlg: page.locator('dialog[data-video]'),
        open: async () => {
          const trigger = page.locator('[data-video-open]').first();
          await scrollCenter(trigger);
          await trigger.click();
        },
        close: () => page.locator('dialog[data-video] [data-video-close]').click(),
      },
    ];

    for (const s of scenarios) {
      await s.open();
      await expect(s.dlg, `${s.name} did not open`).toHaveJSProperty('open', true);
      await expect(html).toHaveClass(/\bis-scroll-locked\b/);
      await expect(body).toHaveClass(/\bis-locked\b/);

      if (hasTouch) {
        expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
      } else {
        await expect(html).toHaveClass(/\blenis-stopped\b/);
        const y0 = await page.evaluate(() => window.scrollY);
        await page.mouse.move(700, 450);
        await page.mouse.wheel(0, 800);
        await page.waitForTimeout(350);
        const y1 = await page.evaluate(() => window.scrollY);
        expect(Math.abs(y1 - y0), `${s.name} scrolled while locked`).toBeLessThan(2);
      }

      await s.close();
      await expect(s.dlg, `${s.name} did not close`).toHaveJSProperty('open', false);
      await expect(html).not.toHaveClass(/\bis-scroll-locked\b/);
      await expect(body).not.toHaveClass(/\bis-locked\b/);

      if (hasTouch) {
        expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
      } else {
        await expect(html).not.toHaveClass(/\blenis-stopped\b/);
        const r0 = await page.evaluate(() => window.scrollY);
        await page.mouse.move(700, 450);
        await page.mouse.wheel(0, 800);
        await expect.poll(() => page.evaluate(() => window.scrollY), { message: `${s.name} did not resume wheel scroll` }).toBeGreaterThan(r0 + 50);
      }
    }
  });

  test('keyed lock registry is shared across lock.js, motion.js and modal.js', async ({ page }) => {
    await gotoV5(page);
    const res = await page.evaluate(async () => {
      const [lock, motion, modal] = await Promise.all([
        import('/scripts/core/lock.js'),
        import('/scripts/core/motion.js'),
        import('/scripts/core/modal.js'),
      ]);
      const shared = lock.lockScroll === motion.lockScroll && lock.lockScroll === modal.lockScroll
        && lock.unlockScroll === motion.unlockScroll && lock.unlockScroll === modal.unlockScroll;

      lock.lockScroll('test-a');
      lock.lockScroll('test-b');
      lock.lockScroll('test-a');
      const bothLocked = document.body.classList.contains('is-locked') && lock.isScrollLocked();

      lock.unlockScroll('test-a');
      const stillLocked = document.body.classList.contains('is-locked') && lock.isScrollLocked();

      lock.unlockScroll('test-b');
      const unlocked = !document.body.classList.contains('is-locked') && !lock.isScrollLocked();

      return { shared, bothLocked, stillLocked, unlocked };
    });

    expect(res).toEqual({ shared: true, bothLocked: true, stillLocked: true, unlocked: true });
  });
});

test.describe('reduced motion shows everything', () => {
  test.use({ reducedMotion: 'reduce' });

  test('skips intro, disables smooth scroll, reveals all sections and still locks dialogs', async ({ page }) => {
    const { errors, badResponses } = watchHealth(page);
    await gotoV5(page, { seenIntro: false });

    const html = page.locator('html');
    await expect(html).toHaveClass(/\bis-ready\b/);
    await expect(html).toHaveClass(/\bis-reduced-motion\b/);
    await expect(html).not.toHaveClass(/\bis-intro\b/);
    await expect(html).not.toHaveClass(/\bis-smooth-scroll\b/);

    await expect(page.locator('[data-intro]')).toHaveCSS('display', 'none');
    await expect(page.locator('[data-hero]')).toHaveCSS('opacity', '1');
    for (const el of await page.locator('[data-intro-hold]').all()) {
      await expect(el).toHaveCSS('opacity', '1');
    }

    const hiddenSections = await page.evaluate(() => [...document.querySelectorAll('main > section, main > section h2, footer')]
      .filter((el) => {
        const cs = getComputedStyle(el);
        return cs.opacity === '0' || cs.visibility === 'hidden' || cs.display === 'none';
      })
      .map((el) => el.id || el.tagName));
    expect(hiddenSections).toEqual([]);

    await page.locator('[data-message-open]').first().click();
    await expect(page.locator('dialog[data-message]')).toHaveJSProperty('open', true);
    await expect(page.locator('body')).toHaveClass(/\bis-locked\b/);
    await expect(html).toHaveClass(/\bis-scroll-locked\b/);
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[data-message]')).toHaveJSProperty('open', false);
    await expect(page.locator('body')).not.toHaveClass(/\bis-locked\b/);

    expect(errors).toEqual([]);
    expect(badResponses).toEqual([]);
  });
});

test.describe('intro once per session and CSS failsafe', () => {
  test('first visit plays intro and completes once per session; reload skips it', async ({ page }) => {
    const { errors, badResponses } = watchHealth(page);
    await page.goto(V5_PATH);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-site-ready', 'true', { timeout: 15_000 });
    await expect(html).toHaveClass(/\bis-ready\b/, { timeout: 8_000 });
    await expect(html).not.toHaveClass(/\bis-intro\b/);
    await expect(page.locator('[data-intro]')).toHaveCSS('display', 'none');
    await expect(page.locator('[data-hero]')).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => sessionStorage.getItem('v5-intro'))).toBe('1');

    // Let initial stats requests settle before reloading so nothing is aborted mid-flight.
    await expect(page.locator('[data-stats-visits]')).toHaveText('100');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(html).toHaveClass(/\bis-ready\b/);
    await expect(html).not.toHaveClass(/\bis-intro\b/);
    await expect(html).toHaveAttribute('data-site-ready', 'true', { timeout: 15_000 });
    expect(errors).toEqual([]);
    expect(badResponses).toEqual([]);
  });

  test('Skip intro button reveals the page immediately', async ({ page }) => {
    const { errors, badResponses } = watchHealth(page);
    await page.addInitScript(() => {
      window.__introEvents = [];
      document.addEventListener('intro:start', () => window.__introEvents.push({ type: 'start' }));
      document.addEventListener('intro:done', (e) => window.__introEvents.push({ type: 'done', reason: e.detail?.reason }));
    });

    await page.goto(V5_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__introEvents.some((e) => e.type === 'start'), null, { timeout: 8_000 });
    await page.locator('[data-intro-skip]').click();

    const html = page.locator('html');
    await expect(html).toHaveClass(/\bis-ready\b/);
    await expect(html).not.toHaveClass(/\bis-intro\b/);
    await expect(html).toHaveAttribute('data-site-ready', 'true', { timeout: 15_000 });

    const done = await page.evaluate(() => window.__introEvents.find((e) => e.type === 'done'));
    expect(done?.reason).toBe('skip');
    expect(await page.evaluate(() => sessionStorage.getItem('v5-intro'))).toBe('1');
    expect(errors).toEqual([]);
    expect(badResponses).toEqual([]);
  });

  test('CSS failsafe reveals hero when main.js is blocked', async ({ page }) => {
    await page.route(/\/scripts\/main\.js/, (route) => route.abort());
    await page.goto(V5_PATH, { waitUntil: 'domcontentloaded' });

    const html = page.locator('html');
    const hero = page.locator('[data-hero]');
    const intro = page.locator('[data-intro]');

    await expect(html).toHaveClass(/\bis-intro\b/);
    await expect(hero).toHaveCSS('opacity', '0');

    // Failsafe CSS animation completes at 2.6s; confirm hero becomes visible without JS.
    await expect(hero).toHaveCSS('opacity', '1', { timeout: 6_000 });
    await expect(intro).toHaveCSS('visibility', 'hidden', { timeout: 6_000 });
    expect(await html.getAttribute('data-site-ready')).toBeNull();
  });
});
