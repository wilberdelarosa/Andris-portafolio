import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navegando a admin...");
    const res = await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
    console.log("Status:", res?.status());
    
    await page.screenshot({ path: 'admin-error.png' });
    console.log("Screenshot taken: admin-error.png");

  } catch (err) {
    console.error("Error durante e2e:", err);
  } finally {
    await browser.close();
  }
})();
