import { test, expect, gotoReady } from './fixtures.mjs';

const sizes = [[320,568],[375,812],[393,852],[430,932],[600,960],[768,792],[820,1180],[860,1180],[861,1180],[960,1280],[961,1280],[1032,1376],[1100,1400],[1101,1400],[1376,1032],[1280,720],[1366,768],[1440,900],[1920,1080],[2560,1440]];
for (const theme of ['light', 'dark']) {
  for (const [width,height] of sizes) {
    test(`${theme} layout fits ${width}×${height}`, async ({page, isMobile}) => {
      test.skip(isMobile, 'screen matrix runs in desktop Chrome; device interaction coverage is separate');
      await page.setViewportSize({width,height});
      await page.addInitScript(theme=>localStorage.setItem('portfolio-theme',theme),theme);
      await gotoReady(page);
      const layout = await page.evaluate(()=>{
        const rect=s=>document.querySelector(s).getBoundingClientRect();
        return {overflow:document.documentElement.scrollWidth>innerWidth,hero:rect('.hero').height,kicker:rect('.hero__kicker').top,nav:document.querySelector('.nav__inner').scrollWidth>document.querySelector('.nav__inner').clientWidth,navOverlap:rect('.nav__links').right>rect('.nav__actions').left};
      });
      expect(layout.overflow).toBe(false);
      expect(layout.nav).toBe(false);
      expect(layout.navOverlap).toBe(false);
      if (width>1100) expect(layout.hero).toBe(height);
      else expect(layout.hero).toBeLessThanOrEqual(960);
      if (width>=961 && width<=1100 && height>width) expect(layout.kicker).toBeLessThan(220);
      for (const kind of ['in','wa','gh','mail']) {
        const card=page.locator('.pass--'+kind);
        await card.locator('.pass__head').click();
        if (kind==='mail') await expect(card.locator('[data-typing]')).toHaveText('Hi McLein, are you open to an internship this summer?', { timeout: 20000 });
        const bounds=await card.evaluate(el=>{
          const rect=el.getBoundingClientRect();
          const action=el.querySelector('.pass__go').getBoundingClientRect();
          const compose=el.querySelector('.compose')?.getBoundingClientRect();
          return {left:action.left-rect.left,right:rect.right-action.right,bottom:rect.bottom-action.bottom,composeBottom:compose?.bottom,actionTop:el.querySelector('.pass__acts')?.getBoundingClientRect().top,fullCompose:compose && Math.abs(compose.width-(rect.width-36))<2};
        });
        expect(bounds.left).toBeGreaterThanOrEqual(0);
        expect(bounds.right).toBeGreaterThanOrEqual(0);
        expect(bounds.bottom).toBeGreaterThanOrEqual(0);
        if (bounds.fullCompose) expect(bounds.composeBottom).toBeLessThanOrEqual(bounds.actionTop);
      }
      await page.locator('[data-years]').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.offsetHeight-innerHeight)*4.3/7,behavior:'instant'}));
      await expect(page.locator('[data-yr-i]')).toHaveText('05');
      const journey=await page.evaluate(()=>({progress:document.querySelector('.years__foot').getBoundingClientRect().bottom,note:document.querySelector('.yr.is-on .yr__note').getBoundingClientRect().bottom}));
      expect(journey.progress).toBeGreaterThan(journey.note);
      expect(journey.progress).toBeLessThanOrEqual(height+1);
    });
  }
}

test('Journey remains readable when a phone rotates into short landscape and back', async ({page})=>{
  await page.setViewportSize({width:393,height:852});
  await gotoReady(page);
  await expect(page.locator('[data-years]')).toHaveClass(/is-pinned/);
  await page.setViewportSize({width:852,height:393});
  await expect(page.locator('[data-years]')).not.toHaveClass(/is-pinned/);
  for (const item of await page.locator('.yr').all()) await expect(item).toHaveJSProperty('inert',false);
  await page.setViewportSize({width:393,height:852});
  await expect(page.locator('[data-years]')).toHaveClass(/is-pinned/);
  await expect(page.locator('.yr.is-on')).toHaveCount(1);
});

test('portrait tablet composition stays consistent with reduced motion', async ({page})=>{
  for (const reducedMotion of ['no-preference','reduce']) {
    await page.emulateMedia({reducedMotion});
    for (const width of [861,1032,1100]) {
      await page.setViewportSize({width,height:1376});
      await gotoReady(page);
      const positions=await page.locator('.yr').first().evaluate(el=>{
        const words=el.querySelector('.yr__words').getBoundingClientRect();
        const image=el.querySelector('.yr__media').getBoundingClientRect();
        return {wordsLeft:words.left,imageLeft:image.left,imageTop:image.top,wordsBottom:words.bottom};
      });
      expect(Math.abs(positions.wordsLeft-positions.imageLeft)).toBeLessThan(1);
      expect(positions.imageTop).toBeGreaterThan(positions.wordsBottom);
    }
  }
});
