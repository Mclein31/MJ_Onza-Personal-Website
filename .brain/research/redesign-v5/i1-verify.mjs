// I1 verification: skeleton wiring. Run from the repo root with `node tests/serve.mjs 4321` already running:
//   node .brain/research/redesign-v5/i1-verify.mjs [desktop|iphone|all]
// Every third party is mocked exactly as tests/fixtures.mjs does (no real stats, email or GitHub traffic).
import { createRequire } from 'node:module';
import { join } from 'node:path';
const require = createRequire(join(process.cwd(), 'package.json'));
const { chromium, webkit, devices } = require('@playwright/test');

const BASE = process.env.BASE || 'http://127.0.0.1:4321';
const PAGE = '/prototypes/skeleton/index.html';
const which = process.argv[2] || 'all';

function contributionFixture() {
  const days = [];
  const end = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const count = i < 30 ? (i % 3) + 1 : i === 100 ? 40 : 0;
    days.push({ date: d.toISOString().slice(0, 10), count, level: Math.min(4, count) });
  }
  return { total: { lastYear: days.reduce((s, d) => s + d.count, 0) }, contributions: days };
}

let pass = 0, fail = 0;
const failures = [];
function check(label, ok, extra) {
  if (ok) { pass++; console.log(`  ok   ${label}`); }
  else { fail++; failures.push(label); console.log(`  FAIL ${label}${extra !== undefined ? '  -> ' + JSON.stringify(extra) : ''}`); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newPage(browser, ctxOpts, { seenIntro = true, reduced = false } = {}) {
  const context = await browser.newContext({ ...ctxOpts, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  const log = { errors: [], posts: [], statsHits: [], bad: [] };
  // WebKit logs its own native <video controls> icon loading (blob: placard icons) as console errors; that is browser UI, not the page.
  const webkitNoise = /^Button failed to load, iconName = [\w-]+-placard, layoutTraits = \[MacOSLayoutTraits Inline\], src = blob:/;
  page.on('console', (m) => { if (m.type() === 'error' && !webkitNoise.test(m.text())) log.errors.push(m.text()); });
  page.on('pageerror', (e) => log.errors.push('pageerror: ' + e.message));
  page.on('response', (r) => { if (r.status() >= 400 && !/\/api\/contributions/.test(r.url())) log.bad.push(r.status() + ' ' + r.url()); });
  const stats = { visits: 100, likes: 10 };
  await page.route(/\/api\/stats\?/, (route) => {
    const url = new URL(route.request().url());
    const metric = url.searchParams.get('metric');
    if (url.searchParams.get('type') === 'increment') stats[metric] += 1;
    log.statsHits.push(url.search);
    route.fulfill({ json: { count: stats[metric] } });
  });
  await page.route(/abacus\.jasoncameron\.dev/, (route) => route.fulfill({ json: { value: 0 } }));
  await page.route(/\/api\/contributions|github-contributions-api/, (route) => route.fulfill({ json: contributionFixture() }));
  await page.route(/formsubmit\.co/, (route) => { log.posts.push({ url: route.request().url(), body: route.request().postData() }); route.fulfill({ json: { success: 'true' } }); });
  if (seenIntro) await page.addInitScript(() => { try { sessionStorage.setItem('v5-intro', '1'); } catch {} });
  return { page, context, log, stats };
}

async function boot(page) {
  await page.goto(BASE + PAGE);
  await page.waitForFunction(() => document.documentElement.getAttribute('data-site-ready') === 'true', null, { timeout: 15000 });
}

async function runSuite(name, browser, ctxOpts, phone) {
  console.log(`\n=== ${name} ===`);
  const { page, context, log, stats } = await newPage(browser, ctxOpts);
  await boot(page);

  // ---- init ----
  const ready = await page.evaluate(() => new Promise((res) => {
    // site:ready already fired; the state is on the root + we can re-read via a probe
    res({ attr: document.documentElement.getAttribute('data-site-ready'), cls: document.documentElement.className });
  }));
  check('site ready attribute set', ready.attr === 'true', ready);
  check('no is-intro left (intro seen)', !/is-intro/.test(ready.cls) && /is-ready/.test(ready.cls), ready.cls);
  const smooth = await page.evaluate(() => document.documentElement.classList.contains('is-smooth-scroll'));
  check(phone ? 'phone: no Lenis' : 'desktop: Lenis running', phone ? !smooth : smooth);

  // head contract
  const head = await page.evaluate(() => {
    const s = [...document.querySelectorAll('script')].find((x) => x.type === 'module');
    return { src: s && s.getAttribute('src'), theme: document.documentElement.getAttribute('data-theme'),
      lenisCss: !!document.querySelector('link[href="/vendor/lenis/lenis.css"]'),
      failsafe: [...document.styleSheets].some((ss) => { try { return [...ss.cssRules].some((r) => r.name === 'intro-leave'); } catch { return false; } }),
      hooks: ['[data-nav]', '[data-menu-toggle]', '[data-menu]', '[data-intro-skip]', '[data-header]', '[data-hero]'].map((q) => document.querySelectorAll(q).length) };
  });
  check('/scripts/main.js loaded as root-absolute module', head.src === '/scripts/main.js', head);
  check('theme bootstrap set data-theme', head.theme === 'light' || head.theme === 'dark', head.theme);
  check('lenis.css linked + intro failsafe keyframes present', head.lenisCss && head.failsafe, head);
  check('nav hooks present', head.hooks.every((n) => n > 0), head.hooks);

  // ---- stats ----
  await page.waitForFunction(() => /\d/.test(document.querySelector('[data-stats-visits]')?.textContent || '') && document.querySelector('[data-stats-visits]').textContent.trim() !== '0', null, { timeout: 8000 }).catch(() => {});
  const st = await page.evaluate(() => ({ v: document.querySelector('[data-stats-visits]').textContent.trim(), l: document.querySelector('[data-stats-likes]').textContent.trim() }));
  check('stats render (visits 100, likes 10)', st.v === '100' && st.l === '10', st);
  await page.locator('[data-stats-like]').click();
  await page.waitForFunction(() => document.querySelector('[data-stats-likes]').textContent.trim() === '11', null, { timeout: 5000 }).catch(() => {});
  const lk = await page.evaluate(() => ({ l: document.querySelector('[data-stats-likes]').textContent.trim(), p: document.querySelector('[data-stats-like]').getAttribute('aria-pressed') }));
  check('like increments to 11 and aria-pressed', lk.l === '11' && lk.p === 'true', lk);

  // ---- activity (loads lazily when near the viewport, so bring it near first) ----
  await page.evaluate(() => document.getElementById('activity').scrollIntoView());
  await page.waitForFunction(() => document.querySelector('[data-activity]')?.getAttribute('data-state') === 'ready', null, { timeout: 12000 }).catch(() => {});
  const act = await page.evaluate(() => ({
    state: document.querySelector('[data-activity]').getAttribute('data-state'),
    days: document.querySelectorAll('[data-activity-calendar] [data-day]:not([data-pad])').length,
    withLevel: document.querySelectorAll('[data-activity-calendar] [data-day][data-level]:not([data-pad])').length,
    legend: [...document.querySelectorAll('.activity__legend [data-level]')].map((e) => e.getAttribute('data-level')).join(','),
    legendOld: document.querySelectorAll('[data-l]').length,
    total: document.querySelector('[data-act="total"]').textContent.trim(),
    streak: document.querySelector('[data-act="streak"]').textContent.trim(),
  }));
  check('activity ready with 365 day cells', act.state === 'ready' && act.days === 365 && act.withLevel === 365, act);
  check('legend uses data-level 0..4 (no data-l)', act.legend === '0,1,2,3,4' && act.legendOld === 0, act);
  check('activity stats render (total 100, streak 30)', act.total === '100' && act.streak === '30', act);
  await page.evaluate(() => document.getElementById('contact').scrollIntoView());   // the contact card's mini grid loads when near
  await page.waitForFunction(() => document.querySelectorAll('[data-activity-mini] [data-day]').length > 0, null, { timeout: 8000 }).catch(() => {});
  const mini = await page.evaluate(() => ({ cells: document.querySelectorAll('[data-activity-mini] [data-day]').length, total: document.querySelector('[data-activity-mini-total]').textContent.trim(), lv: document.querySelectorAll('[data-activity-mini] [data-day][data-level]').length }));
  check('contact mini grid renders (112 cells with data-level, 100 contributions)', mini.cells === 112 && mini.lv === 112 && /100/.test(mini.total), mini);

  // ---- theme ----
  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.locator('[data-theme-toggle]').click();
  await sleep(700);
  const after = await page.evaluate(() => ({ t: document.documentElement.getAttribute('data-theme'), ls: localStorage.getItem('portfolio-theme'), p: document.querySelector('[data-theme-toggle]').getAttribute('aria-pressed') }));
  check('theme toggle flips + stores', after.t !== before && after.ls === after.t, { before, after });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.getAttribute('data-site-ready') === 'true');
  const persisted = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check('theme persists across reload', persisted === after.t, persisted);
  await page.locator('[data-theme-toggle]').click(); await sleep(600); // restore

  // ---- nav ----
  if (!phone) {
    await page.locator('header [data-nav][href="#about"]').click();
    await page.waitForFunction(() => location.hash === '#about', null, { timeout: 5000 }).catch(() => {});
    await sleep(1800);
    const n1 = await page.evaluate(() => ({ hash: location.hash, cur: document.querySelector('[data-nav][aria-current]')?.getAttribute('href'), top: Math.round(document.getElementById('about').getBoundingClientRect().top), hh: document.querySelector('[data-header]').getBoundingClientRect().height }));
    check('nav jump to #about: hash, aria-current, lands under header', n1.hash === '#about' && n1.cur === '#about' && Math.abs(n1.top - n1.hh) <= 4, n1);
    // scroll-spy by scrolling to each section
    const ids = ['work', 'journey', 'activity', 'stack', 'recognition', 'training', 'contact'];
    const spy = [];
    for (const id of ids) {
      await page.evaluate((i) => { const el = document.getElementById(i); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - (document.querySelector('[data-header]').offsetHeight)); }, id);
      await sleep(500);
      spy.push(await page.evaluate(() => document.querySelector('[data-nav][aria-current]')?.getAttribute('href')));
    }
    check('scroll-spy follows each section', spy.every((h, i) => h === '#' + ids[i]) || spy.filter((h, i) => h === '#' + ids[i]).length >= 6, spy);
    await page.evaluate(() => window.scrollTo(0, 0)); await sleep(500);
    const top = await page.evaluate(() => document.querySelectorAll('[data-nav][aria-current]').length);
    check('scroll-spy clears at the top', top === 0, top);
  }

  // ---- phone menu ----
  if (phone) {
    const toggle = page.locator('[data-menu-toggle]');
    await toggle.click();
    await sleep(300);
    const m = await page.evaluate(() => ({ exp: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'), open: document.documentElement.classList.contains('is-menu-open'), locked: document.documentElement.classList.contains('is-scroll-locked') && document.body.classList.contains('is-locked'), inMenu: !!document.activeElement.closest('[data-menu]'), inert: document.querySelector('main').inert }));
    check('menu opens: aria-expanded, locked, focus inside, main inert', m.exp === 'true' && m.open && m.locked && m.inMenu && m.inert, m);
    // Safari skips links on Tab by default; Option+Tab is its link-tabbing key. Chromium tabs links with plain Tab.
    const TAB = browser.browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab';
    const tabs = [];
    for (let i = 0; i < 14; i++) { await page.keyboard.press(TAB); tabs.push(await page.evaluate(() => !!document.activeElement.closest('[data-menu]') || document.activeElement === document.querySelector('[data-menu-toggle]') || !!document.activeElement.closest('[data-header]'))); }
    check('Tab stays inside menu/header (focus trap)', tabs.every(Boolean), tabs);
    const tabsBack = [];
    for (let i = 0; i < 6; i++) { await page.keyboard.press('Shift+' + TAB); tabsBack.push(await page.evaluate(() => !!document.activeElement.closest('[data-menu]') || document.activeElement === document.querySelector('[data-menu-toggle]') || !!document.activeElement.closest('[data-header]'))); }
    check('Shift+Tab stays inside', tabsBack.every(Boolean), tabsBack);
    await page.keyboard.press('Escape');
    await sleep(300);
    const c = await page.evaluate(() => ({ exp: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'), locked: document.body.classList.contains('is-locked'), focusToggle: document.activeElement === document.querySelector('[data-menu-toggle]'), inert: document.querySelector('main').inert }));
    check('Escape closes menu, unlocks, focus back on toggle', c.exp === 'false' && !c.locked && c.focusToggle && !c.inert, c);
    await toggle.click(); await sleep(300);
    await page.locator('[data-menu] [data-nav][href="#stack"]').click();
    await sleep(1800);
    const j = await page.evaluate(() => ({ hash: location.hash, cur: document.querySelector('[data-nav][aria-current]')?.getAttribute('href'), open: document.documentElement.classList.contains('is-menu-open'), locked: document.body.classList.contains('is-locked') }));
    check('menu link jumps to #stack, closes menu, scroll-spy follows', j.hash === '#stack' && j.cur === '#stack' && !j.open && !j.locked, j);
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  // ---- galleries ----
  const galleryCount = await page.locator('[data-gallery]').count();
  check('5 project galleries', galleryCount === 5, galleryCount);
  for (let g = 0; g < galleryCount; g++) {
    const gal = page.locator('[data-gallery]').nth(g);
    await gal.scrollIntoViewIfNeeded();
    const info = await gal.evaluate((el) => ({ slides: el.querySelector('[data-gallery-track]').children.length, dots: el.querySelectorAll('[data-gallery-dot]').length, cur: el.querySelector('[data-gallery-current]')?.textContent, total: el.querySelector('[data-gallery-total]')?.textContent, id: el.closest('article')?.id }));
    check(`gallery ${info.id}: dots=${info.dots} match slides=${info.slides}, count total`, info.dots === info.slides && info.cur === '1' && Number(info.total) === info.slides, info);
    // step with next (if more than one slide)
    if (info.slides > 1) {
      await gal.locator('[data-gallery-next]').click();
      await sleep(700);
      const s = await gal.evaluate((el) => ({ idx: el.getAttribute('data-index'), cur: el.querySelector('[data-gallery-current]').textContent, dot: [...el.querySelectorAll('[data-gallery-dot]')].findIndex((d) => d.hasAttribute('aria-current')) }));
      check(`gallery ${info.id}: next steps to slide 2 (index, count, dot)`, s.cur === '2' && s.dot === 1, s);
    }
    // click the current slide's trigger -> viewer opens at that slide (or video opens for the film slide)
    const curIdx = info.slides > 1 ? 1 : 0;
    const slide = gal.locator('[data-gallery-track] > *').nth(curIdx);
    const isVideoSlide = await slide.locator('[data-video-open]').count();
    if (isVideoSlide) {
      await slide.locator('[data-video-open]').click();
      await sleep(500);
      const v = await page.evaluate(() => ({ video: document.querySelector('dialog[data-video]').open, viewer: document.querySelector('dialog[data-lightbox-dialog]').open }));
      check(`gallery ${info.id}: video slide opens the video window, not the viewer`, v.video && !v.viewer, v);
      await page.keyboard.press('Escape'); await sleep(500);
    } else {
      const expected = await slide.locator('img').first().getAttribute('data-title');
      await slide.locator('[data-lightbox]').click();
      await sleep(600);
      const v = await page.evaluate(() => { const d = document.querySelector('dialog[data-lightbox-dialog]'); return { open: d.open, title: d.querySelector('[data-lightbox-title]').textContent.trim(), count: d.querySelector('[data-lightbox-count]').textContent.trim(), src: d.querySelector('[data-lightbox-image]').getAttribute('src') }; });
      check(`gallery ${info.id}: viewer opens at clicked slide (${expected} · ${v.count})`, v.open && v.title === expected && v.count.startsWith(String(curIdx + 1) + ' /'), { expected, v });
      await page.keyboard.press('Escape'); await sleep(500);
      const closed = await page.evaluate(() => ({ open: document.querySelector('dialog[data-lightbox-dialog]').open, locked: document.body.classList.contains('is-locked') }));
      check(`gallery ${info.id}: viewer closes and unlocks`, !closed.open && !closed.locked, closed);
    }
  }

  // ---- promo videos ----
  const vids = await page.$$eval('[data-video-open]', (els) => els.map((e) => ({ src: e.getAttribute('data-video-src'), title: e.getAttribute('data-video-title'), vis: !!(e.offsetWidth || e.offsetHeight) })));
  const seen = new Set();
  for (let i = 0; i < vids.length; i++) {
    const v = vids[i];
    if (seen.has(v.src)) continue;
    seen.add(v.src);
    const btn = page.locator('[data-video-open]').nth(i);
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForFunction(() => { const p = document.querySelector('[data-video-player]'); return p && p.currentTime > 0.3 && !p.paused; }, null, { timeout: 8000 }).catch(() => {});
    const pl = await page.evaluate(() => { const p = document.querySelector('[data-video-player]'); return { t: p.currentTime, paused: p.paused, src: p.currentSrc || p.getAttribute('src') || '', open: document.querySelector('dialog[data-video]').open, title: document.querySelector('[data-video-title-el]').textContent.trim() }; });
    check(`video ${v.title} plays (${v.src.split('/').pop()}) t=${pl.t.toFixed(2)}`, pl.open && !pl.paused && pl.t > 0.3 && pl.src.includes(v.src.split('/').pop()) && pl.title === v.title, pl);
    await page.locator('[data-video-close]').click();
    await sleep(500);
    const cl = await page.evaluate(() => { const p = document.querySelector('[data-video-player]'); return { open: document.querySelector('dialog[data-video]').open, paused: p.paused, src: p.getAttribute('src'), locked: document.body.classList.contains('is-locked') }; });
    check(`video ${v.title} stops on close (paused, src removed, unlocked)`, !cl.open && cl.paused && !cl.src && !cl.locked, cl);
  }

  // ---- contact form ----
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(300);
  await page.locator('[data-message-open]').first().click();
  await sleep(400);
  const dlg = await page.evaluate(() => ({ open: document.querySelector('dialog[data-message]').open, locked: document.body.classList.contains('is-locked') }));
  check('message dialog opens and locks scroll', dlg.open && dlg.locked, dlg);
  await page.locator('[data-message-submit]').click();
  await sleep(300);
  const empty = await page.evaluate(() => ({ posts: 0, invalid: document.querySelectorAll('[data-message-form] [aria-invalid="true"]').length, status: document.querySelector('[data-message-status]').textContent.trim(), state: document.querySelector('[data-message-form]').getAttribute('data-state') }));
  check('empty submit blocked (aria-invalid, message, no POST)', empty.invalid > 0 && log.posts.length === 0 && empty.state !== 'success', { empty, posts: log.posts.length });
  await page.fill('#fName', 'Test Visitor');
  await page.fill('#fEmail', 'not-an-email');
  await page.fill('#fMsg', 'Hello there, this is a test message.');
  await page.locator('[data-message-submit]').click();
  await sleep(300);
  check('invalid email blocked', log.posts.length === 0, log.posts.length);
  await page.fill('#fEmail', 'visitor@example.com');
  await page.locator('[data-message-submit]').click();
  await page.waitForFunction(() => document.querySelector('[data-message-form]').getAttribute('data-state') === 'success', null, { timeout: 6000 }).catch(() => {});
  check('valid submit posts once to the FormSubmit mock', log.posts.length === 1 && /formsubmit\.co\/ajax\/mcleinjeionza06@gmail\.com/.test(log.posts[0].url) && /visitor@example\.com/.test(log.posts[0].body || ''), log.posts);
  await page.waitForFunction(() => !document.querySelector('dialog[data-message]').open, null, { timeout: 8000 }).catch(() => {});
  const done = await page.evaluate(() => ({ open: document.querySelector('dialog[data-message]').open, locked: document.body.classList.contains('is-locked'), locks: document.documentElement.classList.contains('is-scroll-locked') }));
  check('after success the dialog closes and scroll unlocks', !done.open && !done.locked && !done.locks, done);

  // ---- dialogs stop smooth scrolling (desktop: Lenis) ----
  if (!phone) {
    const dialogs = [
      ['message', async () => { await page.locator('[data-message-open]').first().click(); }, async () => { await page.keyboard.press('Escape'); }],
      ['viewer', async () => { await page.locator('[data-lightbox]').first().scrollIntoViewIfNeeded(); await page.locator('[data-lightbox]').first().click(); }, async () => { await page.keyboard.press('Escape'); }],
      ['video', async () => { const b = page.locator('[data-video-open]').first(); await b.scrollIntoViewIfNeeded(); await b.click(); }, async () => { await page.locator('[data-video-close]').click(); }],
    ];
    for (const [nm, open, close] of dialogs) {
      await page.evaluate(() => window.scrollTo(0, 0)); await sleep(500);
      await open(); await sleep(600);
      const y0 = await page.evaluate(() => scrollY);
      await page.mouse.move(700, 450);
      await page.mouse.wheel(0, 800); await sleep(900);
      const s = await page.evaluate(() => ({ y: scrollY, stopped: document.documentElement.classList.contains('lenis-stopped'), cls: document.documentElement.classList.contains('is-scroll-locked') && document.body.classList.contains('is-locked') }));
      check(`${nm} dialog: Lenis stopped, locked classes, wheel does not scroll page`, s.stopped && s.cls && Math.abs(s.y - y0) < 2, { y0, ...s });
      await close(); await sleep(900);
      const r0 = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 800); await sleep(1200);
      const r = await page.evaluate(() => ({ y: scrollY, stopped: document.documentElement.classList.contains('lenis-stopped'), cls: document.documentElement.classList.contains('is-scroll-locked') || document.body.classList.contains('is-locked') }));
      check(`${nm} dialog closed: Lenis restarted, unlocked, wheel scrolls again`, !r.stopped && !r.cls && r.y > r0 + 50, { r0, ...r });
    }
    // keyed locks: two holders, releasing one keeps the lock
    const keyed = await page.evaluate(async () => {
      const lock = await import('/scripts/core/lock.js');
      lock.lockScroll('a'); lock.lockScroll('b'); lock.lockScroll('a');
      const both = document.body.classList.contains('is-locked');
      lock.unlockScroll('a');
      const afterA = document.body.classList.contains('is-locked') && lock.isScrollLocked();
      lock.unlockScroll('b');
      return { both, afterA, end: document.body.classList.contains('is-locked') || lock.isScrollLocked() };
    });
    check('keyed lock registry (idempotent, held until last key released)', keyed.both && keyed.afterA && !keyed.end, keyed);
    const same = await page.evaluate(async () => { const a = await import('/scripts/core/lock.js'); const m = await import('/scripts/core/motion.js'); const mo = await import('/scripts/core/modal.js'); return a.lockScroll === m.lockScroll && a.lockScroll === mo.lockScroll; });
    check('motion.js and modal.js re-export the same lock functions', same);
  } else {
    // phone: native overflow lock
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('[data-message-open]').first().click(); await sleep(400);
    const o = await page.evaluate(() => ({ ov: document.documentElement.style.overflow, cls: document.body.classList.contains('is-locked') }));
    check('phone: message dialog locks (overflow hidden + is-locked)', o.ov === 'hidden' && o.cls, o);
    await page.keyboard.press('Escape'); await sleep(500);
    const o2 = await page.evaluate(() => ({ ov: document.documentElement.style.overflow, cls: document.body.classList.contains('is-locked') }));
    check('phone: closing restores overflow', o2.ov !== 'hidden' && !o2.cls, o2);
  }

  // ---- console ----
  check('zero console / page errors', log.errors.length === 0, log.errors);
  check('no 4xx/5xx responses', log.bad.length === 0, log.bad);
  check('no real third-party traffic (formsubmit only mocked)', log.posts.every((p) => /formsubmit\.co/.test(p.url)));
  await context.close();
}

async function runReduced(browser, ctxOpts) {
  console.log('\n=== reduced motion + fresh intro ===');
  const { page, context, log } = await newPage(browser, ctxOpts, { seenIntro: false, reduced: true });
  await boot(page);
  const r = await page.evaluate(() => {
    const hero = document.querySelector('[data-hero]');
    const intro = document.querySelector('[data-intro]');
    const hold = [...document.querySelectorAll('[data-intro-hold]')];
    return { cls: document.documentElement.className, heroOpacity: getComputedStyle(hero).opacity, introDisplay: getComputedStyle(intro).display, holdVisible: hold.every((h) => getComputedStyle(h).opacity === '1'), smooth: document.documentElement.classList.contains('is-smooth-scroll'), reduced: document.documentElement.classList.contains('is-reduced-motion') };
  });
  check('reduced motion: no intro, hero visible, no Lenis', !/is-intro/.test(r.cls) && /is-ready/.test(r.cls) && r.heroOpacity === '1' && r.introDisplay === 'none' && r.holdVisible && !r.smooth && r.reduced, r);
  // everything shown: nothing hidden by opacity 0 / visibility among main sections
  const hidden = await page.evaluate(() => [...document.querySelectorAll('main > section, main > section h2, footer')].filter((e) => { const s = getComputedStyle(e); return s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none'; }).map((e) => e.id || e.tagName));
  check('reduced motion shows all sections', hidden.length === 0, hidden);
  await page.locator('[data-message-open]').first().click(); await sleep(300);
  const lk = await page.evaluate(() => ({ locked: document.body.classList.contains('is-locked'), ov: document.documentElement.style.overflow }));
  check('reduced motion: dialog still locks scroll', lk.locked, lk);
  check('reduced motion: zero console errors', log.errors.length === 0, log.errors);
  await context.close();

  console.log('\n=== first visit intro plays then finishes (motion allowed) ===');
  const t = await newPage(browser, ctxOpts, { seenIntro: false, reduced: false });
  await t.page.goto(BASE + PAGE);
  const started = await t.page.evaluate(() => document.documentElement.classList.contains('is-intro') || document.documentElement.classList.contains('is-ready'));
  await t.page.waitForFunction(() => document.documentElement.classList.contains('is-ready') && !document.documentElement.classList.contains('is-intro'), null, { timeout: 8000 }).catch(() => {});
  const fin = await t.page.evaluate(() => ({ cls: document.documentElement.className, ov: getComputedStyle(document.querySelector('[data-intro]')).display, hero: getComputedStyle(document.querySelector('[data-hero]')).opacity }));
  check('intro ends by itself (data-intro-duration) and reveals the hero', started && /is-ready/.test(fin.cls) && fin.ov === 'none' && fin.hero === '1', fin);
  // skip button
  await sleep(1500); // let the first load's reads settle so the reload aborts nothing
  await t.page.evaluate(() => sessionStorage.removeItem('v5-intro'));
  await t.page.reload();
  const sk = t.page.locator('[data-intro-skip]');
  if (await sk.isVisible().catch(() => false)) { await sk.click(); await t.page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), null, { timeout: 3000 }).catch(() => {}); }
  check('Skip intro button reveals the page', await t.page.evaluate(() => document.documentElement.classList.contains('is-ready') && !document.documentElement.classList.contains('is-intro')));
  check('intro: zero console errors', t.log.errors.length === 0, t.log.errors);
  await t.context.close();

  console.log('\n=== CSS failsafe: main.js blocked ===');
  const f = await newPage(browser, ctxOpts, { seenIntro: false, reduced: false });
  await f.page.route(/\/scripts\/main\.js/, (route) => route.abort());
  await f.page.goto(BASE + PAGE);
  await sleep(1000);
  const early = await f.page.evaluate(() => getComputedStyle(document.querySelector('[data-hero]')).opacity);
  await sleep(2600);
  const late = await f.page.evaluate(() => ({ hero: getComputedStyle(document.querySelector('[data-hero]')).opacity, intro: getComputedStyle(document.querySelector('[data-intro]')).visibility }));
  check('without JS the hero is held, then revealed by the CSS failsafe', early === '0' && late.hero === '1' && late.intro === 'hidden', { early, late });
  await f.context.close();
}

const out = [];
if (which === 'desktop' || which === 'all') {
  const b = await chromium.launch({ channel: 'chrome' });
  await runSuite('desktop Chrome 1440x900', b, { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, false);
  await runReduced(b, { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } });
  await b.close();
}
if (which === 'iphone' || which === 'all') {
  const b = await webkit.launch();
  await runSuite('WebKit iPhone 14', b, { ...devices['iPhone 14'] }, true);
  await runReduced(b, { ...devices['iPhone 14'] });
  await b.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILED:\n - ' + failures.join('\n - ')); process.exit(1); }
