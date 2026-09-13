/**
 * Captura la cortina de entrada en varios instantes.
 * Sirve para juzgar el ritmo de la secuencia con evidencia, no de memoria.
 *
 *   BASE_URL=http://localhost:3001 node scripts/capture-intro.mjs
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL || "http://localhost:3001";
const out = path.resolve(fileURLToPath(new URL("../", import.meta.url)), "../output/review/intro");
const marks = [260, 700, 1150, 1600, 2050, 2400, 2750, 3200];

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await mkdir(out, { recursive: true });

// Sesión limpia: sessionStorage vacío, así la cortina se muestra entera.
await page.goto(new URL("/?lang=es", baseURL).href, { waitUntil: "commit" });
const start = Date.now();
for (const mark of marks) {
  const wait = mark - (Date.now() - start);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: path.join(out, `t-${String(mark).padStart(4, "0")}.png`) });
  console.log(`captura a ${mark} ms`);
}

// Segunda visita en la misma sesión: la cortina no debe aparecer.
await page.goto(new URL("/?lang=es", baseURL).href, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(320);
// Lo que importa es si se ve, no si el nodo existe: en la segunda visita
// el CSS la oculta antes de pintar y React la retira despues.
const curtainOnReturn = await page.locator(".intro").isVisible().catch(() => false);
await page.screenshot({ path: path.join(out, "segunda-visita.png") });
console.log(`cortina en la segunda visita: ${curtainOnReturn ? "SE VE (mal)" : "no se ve (correcto)"}`);

await browser.close();
console.log(errors.length ? `\nErrores: ${[...new Set(errors)].join(" | ")}` : "\nSin errores de consola.");
console.log(`Capturas en ${out}`);
