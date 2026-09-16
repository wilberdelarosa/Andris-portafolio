import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.BASE_URL || 'http://localhost:3001';
const out = path.resolve('../output/playwright/contact-scroll');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.addInitScript(() => sessionStorage.setItem('ap-intro-seen', '1'));
const page = await context.newPage();
const errors = [], results = [];
page.on('pageerror', error => errors.push(error.message));
async function check(name, run) {
  try { results.push({ name, pass: true, detail: await run() }); console.log('PASS', name); }
  catch (error) { results.push({ name, pass: false, error: error.message }); console.log('FAIL', name, error.message); }
}
async function go(locale = 'es') {
  await page.goto(`${base}/?lang=${locale}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!document.documentElement.dataset.theme);
  await page.evaluate(() => document.fonts.ready);
}
async function sample() {
  return page.evaluate(() => {
    const layer = document.querySelector('.project-showcase [data-decorative-depth]');
    const panel = document.querySelector('.project-showcase [data-scroll-depth]');
    const progress = document.querySelector('.reading-progress');
    return {
      y: scrollY,
      layer: layer ? new DOMMatrixReadOnly(getComputedStyle(layer).transform).m42 : null,
      panel: panel ? getComputedStyle(panel).transform : null,
      progress: progress ? new DOMMatrixReadOnly(getComputedStyle(progress).transform).m11 : null,
    };
  });
}
await check('Scroll responds to actual wheel input in both directions', async () => {
  await go();
  const top = await page.locator('.project-showcase').evaluate(el => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), top - 700);
  await page.waitForTimeout(500);
  const before = await sample();
  assert.notEqual(before.layer, null, 'Required decorative target is missing');
  assert.notEqual(before.panel, null, 'Required panel target is missing');
  assert.notEqual(before.progress, null, 'Required reading progress is missing');
  await page.mouse.move(80, 600);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1800);
  const down = await sample();
  await page.mouse.wheel(0, -600);
  await page.waitForTimeout(1800);
  const up = await sample();
  assert.ok(down.y > before.y + 300);
  assert.ok(up.y < down.y - 300);
  assert.ok(down.layer < before.layer - 10);
  assert.ok(up.layer > down.layer + 10);
  assert.ok(down.progress > before.progress);
  assert.notEqual(down.panel, before.panel);
  return { before, down, up };
});
await check('Portrait, copy and action fit at four widths and three languages', async () => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 760 ? 844 : 1000 });
    for (const locale of ['es', 'en', 'fr']) {
      await go(locale);
      const card = page.locator('.journey-contact');
      await card.scrollIntoViewIfNeeded();
      await card.locator('img').evaluate(img => img.decode());
      await page.waitForTimeout(500);
      const layout = await card.evaluate(el => {
        const box = el.getBoundingClientRect();
        const copy = el.querySelector(':scope > div').getBoundingClientRect();
        const portrait = el.querySelector('.journey-contact-portrait').getBoundingClientRect();
        const intersects = Math.min(copy.right, portrait.right) - Math.max(copy.left, portrait.left) > 2 && Math.min(copy.bottom, portrait.bottom) - Math.max(copy.top, portrait.top) > 2;
        return { pageOverflow: document.documentElement.scrollWidth > innerWidth + 1, copyInside: copy.left >= box.left && copy.right <= box.right + 1 && copy.bottom <= box.bottom + 1, intersects, portraitVisible: portrait.width > 80 && portrait.height > 80 };
      });
      assert.equal(layout.pageOverflow, false, `${width}/${locale}: page overflow`);
      assert.equal(layout.copyInside, true, `${width}/${locale}: clipped copy`);
      assert.equal(layout.intersects, false, `${width}/${locale}: portrait overlaps copy`);
      assert.equal(layout.portraitVisible, true);
      assert.match(await card.getAttribute('href'), new RegExp(`/contacto\\?lang=${locale}`));
      if (locale === 'es') await card.screenshot({ path: path.join(out, `contact-${width}.png`) });
    }
  }
});
await check('Keyboard opens the contact route', async () => {
  await go();
  await page.locator('.journey-contact').focus();
  await page.locator('.journey-contact').press('Enter');
  await page.waitForURL('**/contacto?lang=es');
});
await check('Reduced motion keeps portrait and scroll layers static', async () => {
  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
  const p = await reduced.newPage();
  await p.goto(`${base}/?lang=es`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => !!document.documentElement.dataset.theme);
  const card = p.locator('.journey-contact');
  await card.scrollIntoViewIfNeeded();
  const portrait = card.locator('.journey-contact-portrait');
  const before = await portrait.evaluate(el => getComputedStyle(el).transform);
  await card.hover();
  await p.waitForTimeout(600);
  assert.equal(await portrait.evaluate(el => getComputedStyle(el).transform), before);
  assert.equal(await p.locator('.project-showcase [data-decorative-depth]').evaluate(el => getComputedStyle(el).transform), 'none');
  assert.equal(await p.locator('.reading-progress').isVisible(), false);
  await reduced.close();
});
await check('No runtime errors', async () => assert.deepEqual(errors, []));
await browser.close();
await writeFile(path.join(out, 'report.json'), JSON.stringify({ base, results, errors }, null, 2));
if (results.some(result => !result.pass)) process.exitCode = 1;
