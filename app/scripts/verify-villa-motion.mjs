import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.BASE_URL || 'http://localhost:3001';
const out = path.resolve('../output/playwright/villa-motion');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.addInitScript(() => sessionStorage.setItem('ap-intro-seen', '1'));
const page = await context.newPage();
const errors = [], results = [];
let currentCheck = '';
page.on('pageerror', e => errors.push(`${currentCheck}: ${e.message}`));
async function check(name, run) {
  currentCheck = name;
  try { results.push({ name, pass: true, detail: await run() }); console.log('PASS', name); }
  catch (e) { results.push({ name, pass: false, error: e.message }); console.log('FAIL', name, e.message); }
}
async function go(locale = 'es') {
  await page.goto(`${base}/?lang=${locale}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!document.documentElement.dataset.theme);
  await page.evaluate(() => document.fonts.ready);
}
await check('Villa image, callouts and generated-content disclosure', async () => {
  await go();
  assert.equal(await page.locator('.villa-scene').count(), 1);
  await page.locator('.villa-scene').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const img = document.querySelector('.villa-scene-image');
    return img?.complete && img.naturalWidth > 0;
  });
  await page.locator('.villa-scene-image').evaluate(img => img.decode());
  assert.equal(await page.locator('.villa-scene-callout').count(), 3);
  assert.match(await page.locator('.villa-scene-caption').textContent(), /no es una propiedad ofertada/);
  assert.equal(await page.evaluate(() => document.documentElement.className.includes('lenis')), false);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
});
await check('Villa follows wheel scroll directly and reverses', async () => {
  const top = await page.locator('.villa-scene').evaluate(el => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), top - 500);
  await page.waitForTimeout(250);
  const read = () => page.locator('.villa-scene-art').evaluate(el => ({ y: scrollY, transform: getComputedStyle(el).transform }));
  const before = await read();
  await page.mouse.move(40, 500);
  await page.mouse.wheel(0, 420);
  await page.waitForTimeout(300);
  const down = await read();
  await page.mouse.wheel(0, -420);
  await page.waitForTimeout(300);
  const up = await read();
  assert.ok(down.y > before.y + 300);
  assert.notEqual(down.transform, before.transform);
  assert.ok(Math.abs(up.y - before.y) < 2);
  assert.notEqual(up.transform, down.transform);
  return { before, down, up };
});
await check('Responsive layouts and callouts in all languages', async () => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 760 ? 844 : 1000 });
    for (const lang of ['es', 'en', 'fr']) {
      await go(lang);
      await page.locator('.villa-scene').scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const issues = await page.evaluate(() => {
        const issues = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) issues.push('page overflow');
        for (const el of document.querySelectorAll('.villa-scene-callout, .villa-scene-caption')) {
          const r = el.getBoundingClientRect();
          if (r.left < -1 || r.right > innerWidth + 1) issues.push(`${el.className}: horizontal clipping`);
        }
        return issues;
      });
      assert.deepEqual(issues, [], `${width}/${lang}: ${issues}`);
      if (lang === 'es') {
        await page.locator('.villa-scene-image').evaluate(img => img.decode());
        await page.locator('.villa-scene').screenshot({ path: path.join(out, `villa-${width}.png`) });
      }
    }
  }
});
await check('Headings do not collide while entering and leaving', async () => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await go();
    const top = await page.locator('.project-showcase').evaluate(el => el.getBoundingClientRect().top + scrollY);
    for (const offset of [-760, -420, 20]) {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), top + offset);
      await page.waitForTimeout(150);
      const overlap = await page.locator('.project-showcase .editorial-title').evaluate(el => {
        const a = el.querySelector('.editorial-lead').getBoundingClientRect();
        const b = el.querySelector('.editorial-accent').getBoundingClientRect();
        return a.bottom > b.top + 1;
      });
      assert.equal(overlap, false);
    }
    await page.locator('.project-showcase').screenshot({ path: path.join(out, `decorations-${width}.png`) });
  }
});
await check('Reduced motion and dark presentation', async () => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await go();
  await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
  await page.locator('.villa-scene').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('.villa-scene-art').evaluate(el => getComputedStyle(el).transform), 'none');
  assert.equal(await page.locator('.project-showcase [data-decorative-depth]').evaluate(el => getComputedStyle(el).transform), 'none');
  await page.locator('.villa-scene').screenshot({ path: path.join(out, 'villa-dark-reduced.png') });
});
await check('No runtime errors', async () => assert.deepEqual(errors, []));
await browser.close();
await writeFile(path.join(out, 'report.json'), JSON.stringify({ base, results, errors }, null, 2));
if (results.some(r => !r.pass)) process.exitCode = 1;
