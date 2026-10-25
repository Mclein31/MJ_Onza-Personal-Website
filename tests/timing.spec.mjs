import { test, expect } from './fixtures.mjs';

// Time from navigation until every letter of the hero name has finished rising into place.
// Read from the page's own animation timeline (ms since navigation start), so polling and
// test-runner overhead on a busy machine don't count against the page.
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
  // Runs as its own stage after the rest of the suite (see playwright.config.mjs), so parallel tests
  // don't skew it. Other apps can still load the machine, so allow one retry.
  // A pass on retry shows as "flaky" in the report; a real regression fails both attempts.
  test.describe.configure({ retries: 1 });

  test('first visit shows the name within 2.5s; repeat visits skip the preloader', async ({ page }, testInfo) => {
    const first = await nameSettledAfter(page);
    await expect(page.locator('.preloader')).toHaveCount(0);
    const repeat = await nameSettledAfter(page); // same session
    testInfo.annotations.push({ type: 'timing', description: `name settled: first visit ${first}ms, repeat ${repeat}ms` });
    // The loader overlaps page load, so a repeat visit isn't always faster on a busy machine; check it's skipped instead
    await expect(page.locator('html'), 'repeat visits skip the preloader').toHaveClass(/no-preload/);
    expect(first, 'visitors wait this long to read the name on their first visit').toBeLessThan(2500);
  });
});
