/**
 * Capturas de revision visual.
 *
 * No es una prueba: no afirma nada ni falla por diseno. Solo deja imagenes
 * estables por ruta y ancho para poder juzgar el resultado con evidencia.
 *
 *   node scripts/capture-review.mjs
 *   BASE_URL=http://localhost:3010 node scripts/capture-review.mjs
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL || "http://localhost:3010";
const appRoot = fileURLToPath(new URL("../", import.meta.url));
const out = path.resolve(appRoot, "../output/review");

const shots = [
  { name: "home-1440", pathname: "/?lang=es", width: 1440, height: 900 },
  { name: "home-375", pathname: "/?lang=es", width: 375, height: 812 },
  { name: "home-full", pathname: "/?lang=es", width: 1440, height: 900, full: true },
  { name: "proyectos-1440", pathname: "/proyectos?lang=es", width: 1440, height: 900, full: true },
  { name: "proyectos-375", pathname: "/proyectos?lang=es", width: 375, height: 812, full: true },
  { name: "mapa-1440", pathname: "/mapa?lang=es", width: 1440, height: 900 },
  { name: "mapa-375", pathname: "/mapa?lang=es", width: 375, height: 812 },
  { name: "melcon-1440", pathname: "/proyectos/melcon-paradise?lang=es", width: 1440, height: 900, full: true },
];

async function settle(page, { scan = false } = {}) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  if (scan) {
    // Recorre la pagina para activar imagenes diferidas, mapas y revelados.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 260));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState("networkidle").catch(() => {});
  }
  await page.waitForTimeout(1100);
}

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const context = await browser.newContext({ deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

await mkdir(out, { recursive: true });

for (const shot of shots) {
  await page.setViewportSize({ width: shot.width, height: shot.height });
  const response = await page.goto(new URL(shot.pathname, baseURL).href, { waitUntil: "domcontentloaded" });
  await settle(page, { scan: Boolean(shot.full) });
  await page.screenshot({ path: path.join(out, `${shot.name}.png`), fullPage: Boolean(shot.full) });
  console.log(`${shot.name}  ${response?.status()}  ${shot.width}x${shot.height}`);
}

await browser.close();

if (errors.length > 0) {
  console.log("\nErrores de consola:");
  for (const error of [...new Set(errors)]) console.log(` - ${error}`);
} else {
  console.log("\nSin errores de consola.");
}
console.log(`\nCapturas en ${out}`);
