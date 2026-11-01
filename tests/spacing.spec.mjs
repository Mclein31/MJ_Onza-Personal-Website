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

test('phone and tablet keep journey animation with a compact content-sized frame', async ({ page, isMobile }) => {
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
    expect(layout.hero).toBeGreaterThanOrEqual(1024);
    expect(layout.frame).toBeLessThan(1024);
    expect(layout.slide).toBeGreaterThan(200);
    expect(layout.overflow).toBe(false);
  }
});
