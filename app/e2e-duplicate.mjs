import { chromium } from "@playwright/test";

// Ejecutar con: node --env-file=.env.local e2e-duplicate.mjs
const ADMIN_EMAIL = process.env.ADMIN_TEST_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('Faltan ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD. Define ambas en .env.local y corre con: node --env-file=.env.local e2e-duplicate.mjs');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navegando a admin...");
    await page.goto("http://localhost:3000/admin");
    
    // Login
    await page.fill("input[type=\"email\"]", ADMIN_EMAIL);
    await page.fill("input[type=\"password\"]", ADMIN_PASSWORD);
    await page.click("button[type=\"submit\"]");

    await page.waitForTimeout(3000);
    console.log("Logueado. Iniciando creacion de 3 proyectos simulados...");

    for (let i = 1; i <= 3; i++) {
      console.log(`Creando proyecto duplicado ${i}...`);
      await page.click("text=\"A�adir proyecto\"");
      await page.waitForTimeout(1000);

      await page.fill("input[aria-label=\"Nombre\"]", `Proyecto Duplicado ${i}`);
      await page.fill("input[aria-label=\"Ubicaci�n\"]", "Punta Cana Central");
      
      await page.click("text=\"Siguiente\"");
      await page.waitForTimeout(500);
      await page.click("text=\"Siguiente\""); // Precios
      await page.waitForTimeout(500);
      await page.click("text=\"Siguiente\""); // Especificaciones
      await page.waitForTimeout(500);
      await page.click("text=\"Siguiente\""); // Multimedia
      await page.waitForTimeout(500);
      await page.click("text=\"Siguiente\""); // Publicar
      
      // Save draft (Guardar borrador)
      await page.click("button:has-text(\"Guardar borrador\")");
      await page.waitForTimeout(2000);
      console.log(`Borrador ${i} guardado.`);
    }

    console.log("Verificando si aparecen en Proyectos...");
    await page.click("text=\"Proyectos\"");
    await page.waitForTimeout(2000);
    
    const count = await page.locator(".admin-project-item").count();
    console.log(`Hay ${count} proyectos en la lista.`);
    
    console.log("Prueba de interfaz completada con exito.");
  } catch (err) {
    console.error("Error durante e2e:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
