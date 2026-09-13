import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.BASE_URL || 'http://127.0.0.1:3012';
const out = path.resolve('../output/playwright/premium-motion');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
const page = await context.newPage();
page.setDefaultTimeout(20000);
const results = [], errors = [];
page.on('pageerror', error => errors.push(error.message));
async function check(name, run) {
  try { const detail = await run(); results.push({ name, pass: true, detail }); console.log('PASS', name); }
  catch (error) { results.push({ name, pass: false, error: error.message }); console.log('FAIL', name, error.message); }
}
async function go(route) {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
}
async function mapReady() {
  await page.locator('.leaflet-tile-loaded').first().waitFor();
  await page.locator('.explorer-blocker').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => {
    const tiles = [...document.querySelectorAll('.leaflet-tile')];
    return tiles.length > 0 && tiles.every(tile => tile.complete && tile.naturalWidth > 0);
  });
}
async function shot(selector, name) {
  const target = page.locator(selector);
  await page.evaluate(() => document.activeElement?.blur());
  await target.scrollIntoViewIfNeeded();
  await target.evaluate(async el => {
    await Promise.all([...el.querySelectorAll('img')].map(img => img.decode().catch(() => {})));
  });
  await page.waitForTimeout(350);
  await target.screenshot({ path: path.join(out, `${name}.png`) });
}
async function transform(selector) {
  return page.locator(selector).first().evaluate(el => getComputedStyle(el).transform);
}
await check('Maps start automatically on home, map and all three project pages', async () => {
  const routes = ['/', '/mapa', '/proyectos/melcon-paradise', '/proyectos/terra-serena', '/proyectos/the-beach-at-punta-cana-city-place'];
  for (const route of routes) {
    await go(route + '?lang=es');
    await mapReady();
    assert.equal(await page.locator('.explorer-activate').count(), 0);
    assert.equal(await page.locator('.leaflet-marker-icon').count(), 3);
    assert.ok(await page.getByRole('button', { name: 'Acercar', exact: true }).isEnabled());
  }
  return routes;
});
await check('Map keeps all project pins in view when resized to a phone', async () => {
  await go('/?lang=es'); await mapReady();
  await page.setViewportSize({ width: 375, height: 844 });
  await page.locator('.explorer').scrollIntoViewIfNeeded();
  await mapReady();
  await page.waitForTimeout(350);
  const visible = await page.locator('.explorer-canvas').evaluate(el => {
    const area = el.getBoundingClientRect();
    return [...el.querySelectorAll('.leaflet-marker-icon')].map(marker => {
      const box = marker.getBoundingClientRect();
      return { title: marker.title, visible: box.left >= area.left && box.right <= area.right && box.top >= area.top && box.bottom <= area.bottom };
    });
  });
  assert.ok(visible.every(pin => pin.visible), JSON.stringify(visible));
  return visible;
});
await check('Decorative depth follows downward and upward scroll reversibly', async () => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go('/?lang=es');
  const top = await page.locator('.project-showcase').evaluate(el => el.getBoundingClientRect().top + scrollY);
  const selector = '.project-showcase [data-decorative-depth]';
  const scroll = async y => { await page.evaluate(value => scrollTo({ top: value, behavior: 'instant' }), y); await page.waitForTimeout(350); return transform(selector); };
  const before = await scroll(top - 650);
  const down = await scroll(top + 100);
  const up = await scroll(top - 650);
  assert.notEqual(before, down);
  assert.equal(before, up);
  assert.ok(await page.locator('.project-showcase .editorial-title').isVisible());
  return { before, down, up };
});
await check('Desktop cards respond to pointer position and return after pointer exit', async () => {
  const card = page.locator('.showcase-stage .pcard');
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0); await page.waitForTimeout(600);
  const initial = await transform('.showcase-stage .pcard');
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width * .8, box.y + box.height * .3);
  await page.waitForTimeout(600);
  const hover = await transform('.showcase-stage .pcard');
  const light = await card.locator('.surface-light').evaluate(el => Number(getComputedStyle(el).opacity));
  assert.notEqual(initial, hover); assert.ok(light > .9);
  await page.mouse.move(0, 0); await page.waitForTimeout(800);
  assert.ok(await card.locator('.surface-light').evaluate(el => Number(getComputedStyle(el).opacity) < .01));
  await card.dispatchEvent('pointermove', { pointerType: 'touch', clientX: 400, clientY: 350 });
  await page.waitForTimeout(300);
  assert.ok(await card.locator('.surface-light').evaluate(el => Number(getComputedStyle(el).opacity) < .01));
  return { initial, hover, light };
});
await check('Reduced motion leaves depth, heading and pointer effects static', async () => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await go('/?lang=es');
  const selector = '.project-showcase [data-decorative-depth]';
  const first = await transform(selector);
  await page.locator('.showcase-stage').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  assert.equal(await transform(selector), first);
  assert.equal(await transform('.project-showcase [data-scroll-depth]'), 'none');
  assert.equal(await transform('.project-showcase .editorial-word'), 'none');
  const card = page.locator('.showcase-stage .pcard');
  await card.hover({ position: { x: 100, y: 100 } });
  assert.equal(await card.locator('.surface-light').evaluate(el => getComputedStyle(el).display), 'none');
});
await check('Editorial headings remain within the viewport in three languages and four widths', async () => {
  const issues = [];
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 760 ? 844 : 1000 });
    for (const locale of ['es', 'en', 'fr']) {
      for (const route of ['/', '/proyectos', '/sobre-mi', '/contacto', '/calculadora']) {
        await go(`${route}?lang=${locale}`);
        const overflow = await page.evaluate(() => {
          const bad = [...document.querySelectorAll('.editorial-word, .editorial-accent')].filter(el => {
            const box = el.getBoundingClientRect(); return box.left < -1 || box.right > innerWidth + 1;
          }).map(el => ({ text: el.textContent, left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right }));
          if (document.documentElement.scrollWidth > innerWidth) bad.push({ pageOverflow: document.documentElement.scrollWidth });
          return bad;
        });
        if (overflow.length) issues.push({ width, locale, route, overflow });
      }
    }
  }
  await writeFile(path.join(out, 'typography-layout.json'), JSON.stringify(issues, null, 2));
  assert.equal(issues.length, 0, `${issues.length} layouts overflow; see typography-layout.json`);
  return '60 route / locale / viewport combinations';
});
await check('Fresh desktop and mobile captures show the final effects and automatic map', async () => {
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: width === 375 ? 844 : 1100 });
    await go('/?lang=es'); await mapReady();
    const device = width === 375 ? 'mobile' : 'desktop';
    for (const [selector, name] of [['.project-showcase', 'showcase'], ['.home-map', 'home-map'], ['.advisor-preview', 'advisor'], ['.journey-actions', 'actions']]) await shot(selector, `${name}-${device}`);
    await go('/proyectos?lang=es'); await shot('.catalog', `catalog-${device}`);
    await go('/contacto?lang=es'); await shot('.contact-section', `contact-${device}`);
  }
});
await check('Server-rendered content remains visible before JavaScript runs', async () => {
  const plain = await browser.newPage({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  await plain.goto(base + '/?lang=es');
  const hiddenAncestors = await plain.locator('.project-showcase').evaluate(el => {
    const hidden = []; let parent = el;
    while (parent) { if (getComputedStyle(parent).opacity === '0' || getComputedStyle(parent).visibility === 'hidden') hidden.push(parent.tagName); parent = parent.parentElement; }
    return hidden;
  });
  assert.deepEqual(hiddenAncestors, []); await plain.close();
});
await check('No runtime errors', async () => assert.deepEqual(errors, []));
await browser.close();
await writeFile(path.join(out, 'report.json'), JSON.stringify({ base, results, errors }, null, 2));
console.log(`${results.filter(result => result.pass).length}/${results.length} passed`);
if (results.some(result => !result.pass)) process.exitCode = 1;
