import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const base = process.env.BASE_URL || 'http://127.0.0.1:3012';
const out = path.resolve('../output/playwright/journeys');
await mkdir(out,{recursive:true});
const browser = await chromium.launch({channel:'chrome'});
const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',hasTouch:true,serviceWorkers:'block'});
const page = await context.newPage();
page.setDefaultTimeout(12000);
const results = [];
const errors = [];
page.on('pageerror',e=>errors.push(e.message));
async function check(name, fn) {
  try { const detail=await fn(); results.push({name,pass:true,detail}); console.log('PASS',name); }
  catch(e) { results.push({name,pass:false,error:e.message}); console.log('FAIL',name,e.message); await page.keyboard.press('Escape').catch(()=>{}); }
}
async function go(route) {
  await page.goto(base+route,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);
}
async function shot(selector,name) {
  const locator=page.locator(selector);
  await page.evaluate(()=>document.activeElement?.blur());
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate(async el => { const imgs=[...el.querySelectorAll('img')];imgs.forEach(im=>im.loading='eager');await Promise.all(imgs.map(im=>im.decode().catch(()=>{}))); });
  await locator.screenshot({path:path.join(out,name+'.png')});
}
await check('Project selector, images and swipe',async()=>{
  await go('/?lang=es');
  await page.getByRole('button',{name:'Proyecto siguiente',exact:true}).click();
  const card=page.locator('.showcase-stage .pcard');
  await card.getByRole('heading',{name:'Terra Serena'}).waitFor();
  const before=await card.locator('.pcard-image img').getAttribute('src');
  await card.getByRole('button',{name:'Imagen siguiente: Terra Serena',exact:true}).click();
  await page.waitForFunction(prev=>document.querySelector('.showcase-stage .pcard-image img')?.getAttribute('src')!==prev,before);
  const media=card.locator('.pcard-media');
  await media.evaluate(el=>{
    const start=new Touch({identifier:1,target:el,clientX:220,clientY:100});
    el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[start]}));
    const end=new Touch({identifier:1,target:el,clientX:80,clientY:108});
    el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[end]}));
  });
  await page.waitForFunction(()=>document.querySelector('.showcase-stage .pcard-image-controls span')?.getAttribute('aria-label')?.includes('3 de'));
  await page.getByRole('button',{name:'Proyecto anterior',exact:true}).click();
  await card.getByRole('heading',{name:'Melcon Paradise'}).waitFor();
  await shot('.project-showcase','showcase-desktop');
});
await check('Favorites remain tied to their own project and persist',async()=>{
  await go('/proyectos?lang=es');
  await page.getByRole('button',{name:'Guardar Terra Serena',exact:true}).click();
  await page.getByRole('button',{name:'Guardar The Beach at Punta Cana City Place',exact:true}).click();
  await page.locator('.catalog-saved-toggle').getByRole('button',{name:'Guardados',exact:false}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.catalog-grid .pcard').length===2);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.header-settings').click();
  await page.getByRole('button',{name:'Tus guardados',exact:false}).count().then(async n=>{
    if(n) await page.getByRole('button',{name:'Tus guardados',exact:false}).click();
    else await page.locator('.settings-favorite').click();
  });
  const dialog=page.getByRole('dialog');
  assert.equal(await dialog.locator('.saved-project').count(),2);
  assert.ok(!(await dialog.textContent()).includes('Melcon Paradise'));
  await page.keyboard.press('Escape');
  await go('/proyectos/terra-serena?lang=es');
  const save=page.locator('.detail-actions .save-button');
  assert.equal(await save.getAttribute('aria-pressed'),'true');
  await save.click();
  assert.equal(await save.getAttribute('aria-pressed'),'false');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('ap-saved-slugs'))),['the-beach-at-punta-cana-city-place']);
});
await check('Filters, empty state and stable filters after language change',async()=>{
  await go('/proyectos?lang=es');
  await page.locator('.catalog-advanced summary').click();
  const amenities=page.locator('.catalog-filter-row').filter({has:page.locator('.catalog-filter-label').filter({hasText:'Amenidades'})});
  await amenities.locator('.catalog-chip').nth(1).click();
  await page.waitForFunction(()=>document.querySelectorAll('.catalog-grid .pcard').length===1);
  await page.locator('.language-control select').selectOption('en');
  await page.waitForFunction(()=>document.querySelectorAll('.catalog-grid .pcard').length===1);
  await page.locator('.language-control select').selectOption('es');
  await page.locator('.catalog-chip').filter({hasText:'Verón'}).click();
  await page.locator('.catalog-empty').waitFor();
  await page.getByRole('button',{name:'Quitar los filtros',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.catalog-grid .pcard').length===3);
  await shot('.catalog','catalog-desktop');
});
await check('Map deep links, markers, panel and controls',async()=>{
  await go('/mapa?lang=es&proyecto=terra-serena');
  await page.locator('.maplibregl-canvas').first().waitFor();
  assert.equal(await page.locator('.explorer-selected h3').textContent(),'Terra Serena');
  await page.locator('.ap-explorer-marker[aria-label="Centrar el mapa en Melcon Paradise"]').click();
  assert.equal(await page.locator('.explorer-selected h3').textContent(),'Melcon Paradise');
  assert.equal(new URL(page.url()).searchParams.get('proyecto'),'melcon-paradise');
  assert.ok((await page.locator('.explorer-selected a.button').getAttribute('href')).includes('melcon-paradise'));
  await page.getByRole('button',{name:'Acercar',exact:true}).click();
  await page.getByRole('button',{name:'Ver los tres proyectos',exact:true}).click();
  await page.getByRole('button',{name:'Estilo del mapa',exact:true}).click();
  await page.getByRole('button',{name:'Mapa sobrio',exact:true}).click();
  assert.equal(await page.locator('.explorer-map-area.is-muted').count(),1);
  assert.ok(await page.locator('.maplibregl-canvas').first().evaluate(el=>el.getBoundingClientRect().width>0));
  assert.equal(await page.locator('.explorer-canvas .maplibregl-canvas').count(),1);
  await shot('.explorer','map-desktop');
});
await check('Map error retains project links and has a working retry',async()=>{
  await page.route('https://tiles.openfreemap.org/**',r=>r.abort());
  await go('/mapa?lang=es&proyecto=terra-serena');
  await page.getByRole('button',{name:'Reintentar',exact:true}).waitFor({timeout:16000});
  assert.ok(await page.locator('.explorer-selected a.button').isVisible());
  await page.unroute('https://tiles.openfreemap.org/**');
  await page.getByRole('button',{name:'Reintentar',exact:true}).click();
  await page.locator('.maplibregl-canvas').first().waitFor();
  await page.locator('.explorer-blocker').waitFor({state:'hidden'});
});
await check('Keyboard dialog contains and returns focus',async()=>{
  await page.setViewportSize({width:375,height:844});
  await go('/?lang=es');
  const menu=page.locator('.mobile-menu');
  await menu.focus(); await page.keyboard.press('Enter');
  const dialog=page.getByRole('dialog'); await dialog.waitFor();
  for(let i=0;i<12;i++) {
    await page.keyboard.press('Tab');
    assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)));
  }
  await page.keyboard.press('Escape');
  assert.ok(await menu.evaluate(el=>el===document.activeElement));
  await menu.click();
  await dialog.getByRole('link',{name:'Sobre mí',exact:true}).click();
  await page.waitForURL('**/sobre-mi?lang=es');
  assert.equal(await page.locator('.mobile-dock a[aria-current="page"]').count(),0);
});
await check('Mobile selected projects and map screenshots',async()=>{
  await go('/?lang=es');
  await shot('.project-showcase','showcase-mobile');
  await shot('.advisor-preview','advisor-mobile');
  await go('/mapa?lang=es&proyecto=terra-serena');
  await page.locator('.maplibregl-canvas').first().waitFor();
  await shot('.explorer','map-mobile');
  await go('/proyectos?lang=es');
  await shot('.catalog','catalog-mobile');
});
await check('WCAG AA checks across routes, themes and locales',async()=>{
  const issues=[];
  for(const theme of ['light','dark']) {
    for(const route of ['/?lang=es','/proyectos?lang=fr','/mapa?lang=en','/contacto?lang=es','/sobre-mi?lang=es','/calculadora?lang=es','/proyectos/melcon-paradise?lang=es']) {
      await go(route);
      await page.evaluate(value=>{localStorage.setItem('ap-theme',value);document.documentElement.dataset.theme=value;},theme);
      await page.reload({waitUntil:'domcontentloaded'});
      const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      for(const v of result.violations) issues.push({theme,route,id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))});
    }
  }
  await writeFile(path.join(out,'accessibility.json'),JSON.stringify(issues,null,2));
  assert.equal(issues.length,0,`${issues.length} accessibility groups; see accessibility.json`);
});
await check('Dark mode desktop capture and no runtime errors',async()=>{
  await page.setViewportSize({width:1440,height:1000});
  await go('/?lang=fr');
  await shot('.project-showcase','showcase-dark-fr');
  assert.deepEqual(errors,[]);
});
await browser.close();
await writeFile(path.join(out,'report.json'),JSON.stringify({base,results,errors},null,2));
console.log(`${results.filter(r=>r.pass).length}/${results.length} passed`);
if(results.some(r=>!r.pass))process.exitCode=1;
