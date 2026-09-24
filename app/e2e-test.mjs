import { chromium } from '@playwright/test';

// Ejecutar con: node --env-file=.env.local e2e-test.mjs
const ADMIN_EMAIL = process.env.ADMIN_TEST_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('Faltan ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD. Define ambas en .env.local y corre con: node --env-file=.env.local e2e-test.mjs');
}

(async () => {
  console.log("Iniciando navegador...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navegando al panel de admin...");
    await page.goto('http://localhost:3000/admin');
    
    // Login
    console.log("Iniciando sesi�n...");
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // Navegar a nuevo proyecto
    console.log("Entrando a la pesta�a Nuevo Proyecto...");
    await page.click('text="A�adir proyecto"');
    await page.waitForTimeout(1000);

    console.log("Llenando formulario b�sico...");
    await page.fill('input[aria-label="Nombre"]', 'Proyecto E2E Test');
    await page.fill('input[aria-label="Ubicaci�n"]', 'Punta Cana');
    await page.fill('textarea[aria-label="Descripci�n"]', 'Un proyecto de prueba automatizada');

    // Cambiar de pesta�a en el formulario
    await page.click('text="Siguiente"');
    await page.waitForTimeout(500);

    console.log("Llenando espacios...");
    // Habitaciones (ya son inputs en el form?)
    // This is just a smoke test, we verify it doesn't crash
    await page.click('text="Siguiente"');
    await page.waitForTimeout(500);
    
    console.log("Verificando preview panel...");
    const previewText = await page.locator('.admin-preview-panel').innerText();
    if (!previewText) throw new Error("No hay preview panel visible");

    console.log("Test de UI b�sico completado con �xito.");
    
  } catch (error) {
    console.error("Test fall�:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
