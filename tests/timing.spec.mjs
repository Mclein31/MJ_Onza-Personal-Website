import { test, expect } from './fixtures.mjs';

async function nameSettledAfter(page) {
  await page.goto('/');
  return page.evaluate(async () => {
    const chars = [...document.querySelectorAll('.hero__name .char')];
    await new Promise((r) => { const ready = () => (chars.every((c) => c.getAnimations().length) ? r() : requestAnimationFrame(ready)); ready(); });
    const anims = chars.flatMap((c) => c.getAnimations());
    await Promise.all(anims.map((a) => a.finished));
    return Math.round(Math.max(...anims.map((a) => a.startTime + a.effect.getComputedTiming().endTime)));
  });
}

test.describe('first-visit timing', () => {
  test.describe.configure({ retries: 1 });

  test('first visit shows the name within 2.5s; repeat visits skip the preloader', async ({ page }, testInfo) => {
    const first = await nameSettledAfter(page);
    await expect(page.locator('.preloader')).toHaveCount(0);
    const repeat = await nameSettledAfter(page);
    testInfo.annotations.push({ type: 'timing', description: `name settled: first visit ${first}ms, repeat ${repeat}ms` });
    await expect(page.locator('html'), 'repeat visits skip the preloader').toHaveClass(/no-preload/);
    expect(first, 'visitors wait this long to read the name on their first visit').toBeLessThan(2500);
  });
});
