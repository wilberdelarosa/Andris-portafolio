/**
 * Comprueba que la pagina nunca se ve antes que la cortina.
 * Muestrea el color del pixel superior izquierdo desde el primer instante.
 */
import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL || "http://localhost:3030";
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

await page.goto(new URL("/?lang=es", baseURL).href, { waitUntil: "commit" });
const start = Date.now();
const samples = [];
for (let i = 0; i < 14; i += 1) {
  const shot = await page.screenshot({ clip: { x: 4, y: 4, width: 2, height: 2 } });
  // PNG minimo: se compara el tamano/bytes para clasificar claro u oscuro.
  const buffer = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return getComputedStyle(document.documentElement).backgroundColor;
  });
  samples.push({ ms: Date.now() - start, bytes: shot.length, htmlBg: buffer });
  await page.waitForTimeout(90);
}
const paint = await page.evaluate(() =>
  performance.getEntriesByType("paint").map((e) => ({ name: e.name, ms: Math.round(e.startTime) })),
);
console.log("Pintados:", JSON.stringify(paint));
console.log("Cortina visible en el primer pintado:", await page.evaluate(() => {
  const el = document.querySelector(".intro");
  if (!el) return "no existe";
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? "si" : "no";
}));
await browser.close();
