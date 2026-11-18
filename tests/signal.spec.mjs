// The signal line (js/signal.js) must never cover body copy, labels, chips, buttons or images.
// signalOverlaps samples the rendered stroke outline against every visible text and image rectangle.
import { test, expect, gotoReady } from './fixtures.mjs';
import { signalOverlaps } from './signal-overlap.mjs';

// Scroll positions: each section's top and middle, plus the middle of each pinned stage
const SPOTS = [
  ['hero', '.hero', 0], ['work', '#work', 0.08], ['work deck', '[data-work-pin]', 0.5], ['about', '#about', 0.25],
  ['about rows', '#about', 0.65], ['journey', '[data-years]', 0.5], ['journey end', '[data-years]', 1],
  ['activity', '#activity', 0.1], ['stack', '#stack', 0.4], ['recognition', '#recognition', 0.3],
  ['training', '#training', 0.3], ['contact', '#contact', 0.4],
];

async function scrollToSpot(page, sel, frac) {
  await page.evaluate(async ([sel, frac]) => {
    const el = document.querySelector(sel), r = el.getBoundingClientRect();
    const span = Math.max(0, r.height - innerHeight);
    const y = r.top + scrollY + (span > 0 ? span * frac : r.height * frac - 60);
    // Step there so scroll-driven code (pins, the line's tip) follows as it would for a visitor
    const s = scrollY;
    for (let i = 1; i <= 12; i++) { scrollTo(0, s + (y - s) * (i / 12)); await new Promise((r) => requestAnimationFrame(r)); }
  }, [sel, frac]);
  await page.waitForTimeout(1200);
}

async function sweep(page) {
  const found = [];
  let painted = 0;
  for (const [name, sel, frac] of SPOTS) {
    await scrollToSpot(page, sel, frac);
    const res = await page.evaluate(signalOverlaps);
    painted += res.paths;
    for (const o of res.overlaps) found.push(`${name}: ${o.what} @${o.x},${o.y} ${o.w}x${o.h}`);
  }
  return { found, painted };
}

test('the overlap check catches a stroke drawn over body copy', async ({ page }) => {
  await gotoReady(page);
  await scrollToSpot(page, '#about', 0);
  const res = await page.evaluate((check) => {
    const p = document.querySelector('#about p:not(.label)');
    const r = p.getBoundingClientRect();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'signal');
    svg.style.cssText = `position:fixed;left:0;top:0;width:${innerWidth}px;height:${innerHeight}px`;
    svg.innerHTML = `<path d="M${r.left} ${r.top + r.height / 2 - 6}h${r.width}v12h${-r.width}Z"/>`;
    document.querySelector('#about').append(svg);
    // eslint-disable-next-line no-new-func
    return new Function(`return (${check})()`)();
  }, signalOverlaps.toString());
  expect(res.overlaps.length).toBeGreaterThan(0);
});

test('the signal line never covers content while it draws', async ({ page }) => {
  test.setTimeout(90_000);
  await gotoReady(page);
  const { found, painted } = await sweep(page);
  expect(painted, 'the line is painted somewhere along the way').toBeGreaterThan(0);
  expect(found).toEqual([]);
});

test('reduced motion: the complete static line covers nothing', async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoReady(page);
  const { found, painted } = await sweep(page);
  expect(painted).toBeGreaterThan(0);
  expect(found).toEqual([]);
});
