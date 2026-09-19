/**
 * Verificación visual de /admin y /calculadora tras la ampliación CMS.
 * Captura escritorio y móvil, reporta errores de consola.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL || "http://localhost:3000";
const appRoot = fileURLToPath(new URL("../", import.meta.url));
const out = path.resolve(appRoot, "../output/playwright/cms-checks");
await mkdir(out, { recursive: true });

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
});
const errors = [];

for (const width of [1440, 375]) {
  const page = await browser.newPage({
    viewport: { width, height: Math.round(width * 0.75) },
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[${width}] ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`[${width}] ${err.message}`));

  for (const route of ["admin", "calculadora"]) {
    await page.goto(`${baseURL}/${route}/`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(out, `${route}-${width}.png`),
      fullPage: route === "admin",
    });
  }

  // Interacción: pestaña Proyectos del estudio
  await page.goto(`${baseURL}/admin/#proyectos`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, `admin-proyectos-${width}.png`), fullPage: true });

  // Calculadora: seleccionar proyecto Terra Serena y comprobar preset
  await page.goto(`${baseURL}/calculadora/`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.selectOption("#calc-project", "terra-serena");
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(out, `calculadora-preset-${width}.png`) });
  await page.close();
}

await browser.close();
if (errors.length) {
  console.log("ERRORES DE CONSOLA:");
  for (const e of errors) console.log(" -", e);
  process.exit(1);
}
console.log("Sin errores de consola. Capturas en output/playwright/cms-checks");
