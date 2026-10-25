import { test, expect, gotoReady, scrollSettled } from './fixtures.mjs';

test.describe('phones', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone only');

  test('menu opens, locks scroll, closes on link and on Escape', async ({ page }) => {
    await gotoReady(page);
    const btn = page.locator('[data-menu-toggle]');
    const menu = page.locator('#menu');
    await btn.click();
    await expect(menu).toHaveClass(/is-open/);
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('body')).toHaveClass(/is-locked/);
    await menu.locator('a[href="#work"]').click();
    await expect(menu).not.toHaveClass(/is-open/);
    await expect(page.locator('#work')).toBeInViewport();

    await scrollSettled(page);
    await expect(page.locator('.nav'), 'the menu button is still reachable after the jump').not.toHaveClass(/is-hidden/);
    await btn.click();
    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveClass(/is-open/);
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('work cards stack vertically and the desktop-only demo button is hidden', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('#work')).not.toHaveClass(/is-pinned/);
    const [a, b] = await page.locator('.project').evaluateAll((els) => els.slice(0, 2).map((e) => e.getBoundingClientRect().top));
    expect(b).toBeGreaterThan(a);
    await expect(page.locator('[data-demo-open]')).toBeHidden();
  });

  test('the floating stats pill never covers a button or link', async ({ page }) => {
    await gotoReady(page);
    const covered = [];
    const height = await page.evaluate(() => document.body.scrollHeight);
    const vh = page.viewportSize().height;
    for (let y = 0; y < height; y += vh) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(150);
      covered.push(...await page.evaluate(() => {
        const pill = document.querySelector('[data-stats]').getBoundingClientRect();
        return [...document.querySelectorAll('main a, main button, footer a')]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width || r.bottom < 0 || r.top > innerHeight) return false;
            return r.left < pill.right && r.right > pill.left && r.top < pill.bottom && r.bottom > pill.top;
          })
          .map((el) => `${Math.round(scrollY)}px: ${(el.getAttribute('aria-label') || el.textContent).trim().slice(0, 40)}`);
      }));
    }
    expect([...new Set(covered)]).toEqual([]);
  });

  test('buttons meet the 24×24px minimum touch target (WCAG 2.5.8)', async ({ page }) => {
    await gotoReady(page);
    const small = await page.evaluate(() => [...document.querySelectorAll('button')]
      .filter((b) => {
        const r = b.getBoundingClientRect();
        return r.width && getComputedStyle(b).visibility !== 'hidden' && (r.width < 24 || r.height < 24);
      })
      .map((b) => `${b.getAttribute('aria-label') || b.className} (${Math.round(b.getBoundingClientRect().width)}×${Math.round(b.getBoundingClientRect().height)})`));
    expect([...new Set(small)]).toEqual([]);
  });

  test('copy that says "hover" is not the only instruction on touch screens', async ({ page }) => {
    await gotoReady(page);
    // innerText, not textContent: the "Hover" word is still in the DOM, just hidden on touch screens
    const hoverCopy = await page.locator('main p:visible').evaluateAll((ps) => ps.map((p) => p.innerText).filter((t) => /\bhover\b/i.test(t)));
    expect(hoverCopy).toEqual([]);
  });
});
