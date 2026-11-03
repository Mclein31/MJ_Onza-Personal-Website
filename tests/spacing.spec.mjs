import { test, expect, gotoReady } from './fixtures.mjs';

test('desktop retains horizontal Work scrolling and pinned Journey slides', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop animation');
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await gotoReady(page);
  await expect(page.locator('#work')).toHaveClass(/is-pinned/);
  await expect(page.locator('[data-years]')).toHaveClass(/is-pinned/);
  const pin = page.locator('[data-work-pin]');
  await pin.evaluate(el => scrollTo({top:el.getBoundingClientRect().top + scrollY + 500,behavior:'instant'}));
  await expect.poll(()=>page.locator('[data-work-track]').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m41)).toBeLessThan(-100);
  const years=page.locator('[data-years]');
  await years.evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY+900,behavior:'instant'}));
  await expect.poll(()=>page.locator('[data-yr-i]').textContent()).not.toBe('01');
  await expect(page.locator('.yr.is-on')).toHaveCount(1);
});

test('phone and tablet keep journey animation within a screen-height frame', async ({ page, isMobile }) => {
  test.skip(isMobile, 'viewport matrix runs in desktop Chrome');
  for (const width of [390,768]) {
    await page.setViewportSize({width,height:1024});
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await gotoReady(page);
    await expect(page.locator('[data-years]')).toHaveClass(/is-pinned/);
    await expect(page.locator('.yr.is-on')).toHaveCount(1);
    const layout=await page.evaluate(()=>{
      const rect=s=>document.querySelector(s).getBoundingClientRect();
      return {hero:rect('.hero').height,gap:rect('.work__head').top-rect('.icon-field').bottom,frame:rect('.years__sticky').height,slide:rect('.years__list').height,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    expect(layout.gap).toBeGreaterThan(24);
    expect(layout.hero).toBeLessThan(850);
    expect(layout.frame).toBe(1024);
    expect(layout.slide).toBeGreaterThan(200);
    expect(layout.overflow).toBe(false);
  }
});

test('desktop Journey centers slides and keeps every caption above progress', async ({ page, isMobile }) => {
  test.setTimeout(90000);
  test.skip(isMobile, 'desktop viewport matrix');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [width, height] of [[1710, 984], [1440, 900], [1366, 650]]) {
    await page.setViewportSize({ width, height });
    await gotoReady(page);
    for (let index = 0; index < 7; index++) {
      await page.locator('[data-years]').evaluate((el, index) => {
        scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * ((index + .3) / 7), behavior: 'instant' });
      }, index);
      await expect(page.locator('[data-yr-i]')).toHaveText(String(index + 1).padStart(2, '0'));
      const slide = page.locator('.yr.is-on');
      await expect.poll(() => slide.locator('.yr__note').evaluate(el => getComputedStyle(el).transform)).toBe('none');
      const bounds = await slide.evaluate(el => {
        const words = el.querySelector('.yr__words').getBoundingClientRect();
        const note = el.querySelector('.yr__note').getBoundingClientRect();
        const media = el.querySelector('.yr__media')?.getBoundingClientRect();
        return { top: words.top, noteBottom: note.bottom, footTop: document.querySelector('.years__foot').getBoundingClientRect().top, wordsRight: words.right, mediaLeft: media?.left, overflow: document.documentElement.scrollWidth > innerWidth };
      });
      expect(bounds.top).toBeGreaterThanOrEqual(88);
      const stage = await page.locator('.years__list').boundingBox();
      expect(bounds.top).toBeGreaterThanOrEqual(stage.y);
      expect(Math.abs((bounds.top - stage.y) - (stage.y + stage.height - bounds.noteBottom))).toBeLessThanOrEqual(2);
      expect(bounds.noteBottom).toBeLessThanOrEqual(bounds.footTop - 16);
      if (bounds.mediaLeft) expect(bounds.wordsRight).toBeLessThan(bounds.mediaLeft);
      expect(bounds.overflow).toBe(false);
      if (width === 1710 && index === 0) await page.screenshot({ path: '/tmp/journey-spacing-after.png' });
    }
  }
});

test('mobile hero starts near navigation and projects have room between cards', async ({ page, isMobile }) => {
  test.skip(isMobile, 'viewport matrix runs in desktop Chrome');
  for (const width of [375, 393, 768]) {
    await page.setViewportSize({ width, height: 852 });
    await gotoReady(page);
    const layout = await page.evaluate(() => {
      const rect = s => document.querySelector(s).getBoundingClientRect();
      const projects = [...document.querySelectorAll('.project:not(.project--more)')];
      return { kicker: rect('.hero__kicker').top, gap: projects[1].getBoundingClientRect().top - projects[0].getBoundingClientRect().bottom, introGap: rect('.project__info p').top - rect('.project__info h3').bottom };
    });
    expect(layout.kicker).toBeLessThanOrEqual(120);
    expect(layout.kicker).toBeGreaterThanOrEqual(88);
    expect(layout.gap).toBeGreaterThanOrEqual(72);
    expect(layout.introGap).toBeGreaterThanOrEqual(15);
    if (width === 393) {
      await page.waitForTimeout(1600);
      await page.screenshot({ path: '/tmp/mobile-hero-after.png' });
      await page.locator('.project').first().screenshot({ path: '/tmp/mobile-project-after.png' });
    }
    await page.locator('[data-years]').evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * (2.3 / 7), behavior: 'instant' }));
    await expect(page.locator('[data-yr-i]')).toHaveText('03');
    await expect.poll(() => page.locator('.yr.is-on .yr__note').evaluate(el => getComputedStyle(el).transform)).toBe('none');
    const gap = await page.evaluate(() => {
      const note = document.querySelector('.yr.is-on .yr__note').getBoundingClientRect();
      return document.querySelector('.years__foot').getBoundingClientRect().top - note.bottom;
    });
    expect(gap).toBeGreaterThanOrEqual(15);
    expect(gap).toBeLessThanOrEqual(20);
    if (width === 393) {
      await page.waitForTimeout(1600);
      await page.screenshot({ path: '/tmp/mobile-journey-after.png' });
    }
  }
});

test('mobile About groups facts and keeps the service heading readable', async ({ page, isMobile }) => {
  test.skip(isMobile, 'viewport matrix runs in desktop Chrome');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [375, 393, 768]) {
    await page.setViewportSize({ width, height: 852 });
    await gotoReady(page, '/#about');
    const layout = await page.evaluate(() => {
      const facts = document.querySelector('.facts');
      const label = facts.querySelector('dt').getBoundingClientRect();
      const value = facts.querySelector('dd').getBoundingClientRect();
      const heading = document.querySelector('.does__head span:last-child');
      return { gap: document.querySelector('.does').getBoundingClientRect().top - document.querySelector('.about__intro').getBoundingClientRect().bottom, labelRight: label.right, valueLeft: value.left, headingHeight: heading.getBoundingClientRect().height, lineHeight: parseFloat(getComputedStyle(heading).lineHeight), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(layout.gap).toBe(32);
    expect(layout.labelRight).toBeLessThan(layout.valueLeft);
    expect(layout.headingHeight).toBeLessThanOrEqual(layout.lineHeight + 1);
    expect(layout.overflow).toBe(false);
    if (width === 393) await page.screenshot({ path: '/tmp/mobile-about-after.png' });
  }
});


test('portrait Journey centers the active slide and progress below navigation', async ({ page, isMobile }) => {
  test.skip(isMobile, 'viewport matrix runs in desktop Chrome');
  for (const [width, height] of [[393, 852], [768, 1024], [820, 1700], [1032, 1376]]) {
    await page.setViewportSize({ width, height });
    await gotoReady(page);
    for (const index of [4, 6]) {
      await page.locator('[data-years]').evaluate((el, index) => {
        scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * ((index + 0.3) / 7), behavior: 'instant' });
      }, index);
      await expect(page.locator('[data-yr-i]')).toHaveText(String(index + 1).padStart(2, '0'));
      await expect.poll(() => page.locator('.yr.is-on .yr__note').evaluate(el => getComputedStyle(el).transform)).toBe('none');
      const space = await page.evaluate(() => {
        const stage = document.querySelector('.years__sticky');
        const rect = stage.getBoundingClientRect();
        const style = getComputedStyle(stage);
        const list = document.querySelector('.years__list').getBoundingClientRect();
        const foot = document.querySelector('.years__foot').getBoundingClientRect();
        return { above: list.top - rect.top - parseFloat(style.paddingTop), below: rect.bottom - parseFloat(style.paddingBottom) - foot.bottom, bottom: foot.bottom };
      });
      expect(Math.abs(space.above - space.below)).toBeLessThanOrEqual(2);
      expect(space.bottom).toBeLessThanOrEqual(height);
    }
  }
});

test('activity calendar keeps readable square cells on phone and tablet', async ({ page, isMobile }) => {
  test.skip(isMobile, 'viewport matrix runs in desktop Chrome');
  for (const width of [393, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await gotoReady(page);
    await page.locator('[data-activity]').scrollIntoViewIfNeeded();
    await expect(page.locator('.activity')).toHaveClass(/is-live/);
    const grid = await page.evaluate(() => {
      const cell = document.querySelector('.activity .cell:not(.pad)').getBoundingClientRect();
      const scroll = document.querySelector('.activity__scroll');
      return { width: cell.width, height: cell.height, scroll: scroll.scrollWidth > scroll.clientWidth, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(grid.width).toBeGreaterThanOrEqual(16);
    expect(Math.abs(grid.width - grid.height)).toBeLessThan(1);
    expect(grid.overflow).toBe(false);
    if (width < 1000) expect(grid.scroll).toBe(true);
    if (width === 820) await page.locator('.activity').screenshot({ path: '/tmp/calendar-scale-after.png' });
  }
});


test('desktop Work retains the compact deck proportions from the reference', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop pinned composition');
  await page.setViewportSize({ width: 1710, height: 982 });
  await gotoReady(page);
  await page.locator('[data-work-pin]').evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
  const cards = await page.locator('.project').evaluateAll(items => items.slice(0, 2).map(el => {
    const r = el.getBoundingClientRect(); return { left: r.left, width: r.width };
  }));
  expect(cards[0].width).toBeGreaterThan(500);
  expect(cards[0].width).toBeLessThan(700);
  expect(cards[0].left).toBeGreaterThan(200);
  expect(cards[0].left).toBeLessThan(300);
  expect(cards[1].left + cards[1].width).toBeLessThan(1710);
});

test('capped project galleries fill their cards and center screenshots and video', async ({ page }) => {
  await page.setViewportSize({ width: 1710, height: 982 });
  await gotoReady(page);
  await page.locator('[data-work-pin]').evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
  for (const gallery of await page.locator('.project__media[data-gallery]').all()) {
    const bounds = await gallery.evaluate(el => {
      const outer = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const track = el.querySelector('.gallery__track').getBoundingClientRect();
      const slide = el.querySelector('.gallery__slide').getBoundingClientRect();
      const image = el.querySelector('.gallery__slide img').getBoundingClientRect();
      return { height: track.height, slideHeight: slide.height, imageHeight: image.height, width: track.width, available: outer.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight), center: Math.abs((track.left + track.right) / 2 - (outer.left + outer.right) / 2) };
    });
    expect(Math.abs(bounds.width - bounds.available)).toBeLessThan(2);
    expect(bounds.center).toBeLessThan(1);
    expect(Math.abs(bounds.slideHeight - bounds.height)).toBeLessThan(1);
    expect(Math.abs(bounds.imageHeight - bounds.height)).toBeLessThan(1);
  }
  await page.locator('.project').first().screenshot({ path: '/tmp/work-card-white-centered.png' });
});
