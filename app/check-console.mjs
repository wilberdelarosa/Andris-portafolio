import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  
  await page.goto('http://localhost:3000/admin');
  await page.waitForTimeout(3000);

  console.log("Console errors found:", errors.length);
  errors.forEach(e => console.log("- " + e));

  await browser.close();
})();
