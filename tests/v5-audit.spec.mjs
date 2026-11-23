// Redesign v5 layout audit. Point it at any page of the repo:
//   V5_PATH=/prototypes/direction-a/ npm run audit:v5      (default V5_PATH is "/")
// One project per viewport (see playwright.config.mjs, "v5-*"). Every check is a soft assertion, so a single run
// lists all problems of a viewport at once. Output: test-results/v5-audit/<path-slug>/<viewport>.{png,txt,json}
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { scanViewport, checkReducedMotion, checkImages, scrollThrough, mergeFindings, formatSummary, slugOfPath } from './v5-audit-helpers.mjs';

const V5_PATH = process.env.V5_PATH || '/';
const OUT = join(process.cwd(), 'test-results', 'v5-audit', slugOfPath(V5_PATH));
const SETTLE_MS = Number(process.env.V5_SETTLE_MS || 2800); // intro loader / first reveals

test.describe.configure({ timeout: 300_000 });

/** Listens for console errors, page errors and failed requests, ignoring /api/ calls and other hosts. */
function watch(page) {
  const consoleErrors = [];
  const failed = [];
  const own = (u) => { try { return new URL(u, page.url() || 'http://x').host === new URL(page.url() || 'http://x').host; } catch { return true; } };
  const api = (u) => { try { return new URL(u).pathname.startsWith('/api/'); } catch { return false; } };
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    // Playwright's WebKit build lacks the icons of its own <video controls>: not the page's error
    if (m.text().startsWith('Button failed to load, iconName')) return;
    const u = m.location().url;
    if (u && (api(u) || (!own(u) && /^https?:/.test(u)))) return;
    consoleErrors.push({ sel: 'console.error', text: '', detail: m.text().slice(0, 300) + (u ? `  @ ${u}` : '') });
  });
  page.on('pageerror', (e) => consoleErrors.push({ sel: 'pageerror', text: '', detail: String(e.message).slice(0, 300) }));
  page.on('requestfailed', (r) => {
    const err = r.failure()?.errorText || '';
    if (api(r.url()) || !own(r.url()) || /ERR_ABORTED|cancelled|aborted/i.test(err)) return;
    failed.push({ sel: r.method(), text: '', detail: `${err} ${r.url()}` });
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && !api(r.url()) && own(r.url())) failed.push({ sel: `HTTP ${r.status()}`, text: '', detail: r.url() });
  });
  return { consoleErrors, failed };
}

async function open(page) {
  await page.goto(V5_PATH, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page.waitForTimeout(SETTLE_MS);
}

/**
 * axe judges colours at whatever opacity an element has at that moment, so text that is dimmed until a scroll-driven
 * reveal reaches it reads as low contrast. Re-test each flagged colour-contrast node scrolled into view; keep it only
 * if it still fails there.
 */
async function recheckContrast(page, violations) {
  const out = [];
  let budget = 40;
  for (const v of violations) {
    if (v.id !== 'color-contrast') { out.push(v); continue; }
    const nodes = [];
    for (const n of v.nodes) {
      if (n.target.length !== 1 || budget-- <= 0) { nodes.push(n); continue; }
      const sel = n.target[0];
      // scrub-lit text finishes lighting up a bit after it passes the middle: try centre first, then the top edge
      let stillFails = true;
      for (const block of ['center', 'start']) {
        const ok = await page.evaluate(([q, b]) => {
          const el = document.querySelector(q);
          if (!el) return false;
          el.scrollIntoView({ block: b, behavior: 'instant' });
          return true;
        }, [sel, block]).catch(() => false);
        if (!ok) break;
        await page.waitForTimeout(450);
        const again = await new AxeBuilder({ page }).include(sel).withRules(['color-contrast']).analyze().catch(() => null);
        stillFails = !again || again.violations.some((x) => x.id === 'color-contrast');
        if (!stillFails) break;
      }
      if (stillFails) nodes.push(n);
    }
    if (nodes.length) out.push({ ...v, nodes });
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  return out;
}

function save(name, text, data) {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, `${name}.txt`), text + '\n');
  writeFileSync(join(OUT, `${name}.json`), JSON.stringify(data, null, 2));
}

test.describe('layout', () => {
  test('layout, images, console and axe', async ({ page }, testInfo) => {
    const { viewportName, touch } = testInfo.project.metadata;
    const { consoleErrors, failed } = watch(page);
    await open(page);

    const found = new Map();
    let maxScrollWidth = 0;
    let clientWidth = 0;
    const steps = await scrollThrough(page, async () => {
      const r = await page.evaluate(scanViewport, { touch });
      maxScrollWidth = Math.max(maxScrollWidth, r.scrollWidth, r.bodyScrollWidth);
      clientWidth = r.clientWidth;
      mergeFindings(found, 'overflow', r.overflow, r.scrollY);
      mergeFindings(found, 'overlap', r.overlaps, r.scrollY);
      mergeFindings(found, 'small', r.small, r.scrollY);
    });
    const topScan = await page.evaluate(scanViewport, { touch });
    maxScrollWidth = Math.max(maxScrollWidth, topScan.scrollWidth);

    // images: give lazy ones a moment to finish
    let images = await page.evaluate(checkImages);
    for (let i = 0; i < 6 && images.some((x) => x.detail === 'still loading'); i++) {
      await page.waitForTimeout(500);
      images = await page.evaluate(checkImages);
    }

    // axe at the top of the fully revealed page
    const axe = await new AxeBuilder({ page }).analyze();
    axe.violations = await recheckContrast(page, axe.violations);
    const axeRows = (list) => list.map((v) => ({
      sel: `${v.id} [${v.impact}]`, text: v.help,
      detail: `${v.nodes.length} node(s): ${v.nodes.slice(0, 4).map((n) => n.target.join(' ')).join(' | ')}${v.nodes.length > 4 ? ' …' : ''}  ${v.helpUrl}`,
    }));
    const axeBlocking = axeRows(axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'));
    const axeMinor = axeRows(axe.violations.filter((v) => v.impact !== 'serious' && v.impact !== 'critical'));

    // screenshot (full page, CSS pixels so retina devices stay small)
    mkdirSync(OUT, { recursive: true });
    let shotNote = '';
    try {
      await page.screenshot({ path: join(OUT, `${viewportName}.png`), fullPage: true, scale: 'css' });
    } catch (e) {
      shotNote = `screenshot failed: ${String(e.message).split('\n')[0]}`;
    }

    const byKind = (k) => [...found.values()].filter((f) => f.kind === k);
    const docOverflow = maxScrollWidth > clientWidth + 1
      ? [{ sel: 'document', text: '', detail: `scrollWidth ${maxScrollWidth}px > clientWidth ${clientWidth}px (+${maxScrollWidth - clientWidth}px) → horizontal page scroll` }] : [];
    const sections = [
      { title: 'Horizontal page overflow', items: docOverflow },
      { title: 'Visible elements past the viewport edge', items: byKind('overflow') },
      { title: 'Overlapping text', items: byKind('overlap') },
      { title: 'Touch targets smaller than 24×24', items: byKind('small'), note: touch ? undefined : 'not checked: not a touch viewport' },
      { title: 'Images not loaded', items: images },
      { title: 'Console / page errors', items: consoleErrors },
      { title: 'Failed requests (ignoring /api/ and external hosts)', items: failed },
      { title: 'axe serious/critical', items: axeBlocking },
    ];
    if (shotNote) sections.push({ title: 'Screenshot', items: [{ sel: 'page.screenshot', text: '', detail: shotNote }] });
    const header = `=== v5 audit ${V5_PATH}  ·  ${viewportName}  ·  ${steps} scroll steps ===`;
    const summary = formatSummary(header, sections)
      + (axeMinor.length ? `\n\n(info, not failing) axe moderate/minor: ${axeMinor.map((a) => a.sel).join(', ')}` : '');
    console.log('\n' + summary);
    await testInfo.attach('v5-audit-summary', { body: summary, contentType: 'text/plain' });
    save(viewportName, summary, { path: V5_PATH, viewport: viewportName, sections: Object.fromEntries(sections.map((s) => [s.title, s.items])), axeInfo: axeMinor });

    for (const s of sections) expect.soft(s.items.length, `${s.title}: ${s.items.length} (see summary above / attached)`).toBe(0);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('headings and paragraphs end up visible', async ({ page }, testInfo) => {
    const { viewportName } = testInfo.project.metadata;
    await open(page);
    await scrollThrough(page, null, { settleMs: 120 });
    const bad = await page.evaluate(checkReducedMotion);
    // everything is static here, so colour contrast is judged on the final state of the page
    const contrast = (await new AxeBuilder({ page }).withRules(['color-contrast']).analyze()).violations.flatMap((v) => v.nodes.map((n) => ({
      sel: n.target.join(' '), text: '', detail: (n.any[0]?.message || v.help).slice(0, 200),
    })));
    const summary = formatSummary(`=== v5 reduced-motion ${V5_PATH}  ·  ${viewportName} ===`, [
      { title: 'Headings/paragraphs not visible with prefers-reduced-motion: reduce', items: bad, note: 'may also be an inactive slide or closed panel: check by eye' },
      { title: 'Colour contrast with all content static (any impact)', items: contrast },
    ]);
    console.log('\n' + summary);
    await testInfo.attach('v5-reduced-motion-summary', { body: summary, contentType: 'text/plain' });
    save(`${viewportName}.reduced-motion`, summary, { path: V5_PATH, viewport: viewportName, notVisible: bad });
    expect.soft(bad.length, `${bad.length} heading(s)/paragraph(s) hidden under reduced motion`).toBe(0);
    expect.soft(contrast.length, `${contrast.length} colour-contrast failure(s) with content static`).toBe(0);
  });
});
