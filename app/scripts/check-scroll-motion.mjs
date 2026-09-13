/**
 * Comprueba que el movimiento ligado al scroll responde en los dos sentidos.
 *
 * Mide la opacidad de un bloque revelado en tres momentos: antes de llegar a
 * el, con el en pantalla, y despues de pasarlo y volver a subir. Si solo
 * animara al bajar, el tercer valor delataria que no se repite.
 */
import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL || "http://localhost:3001";
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(new URL("/?lang=es", baseURL).href, { waitUntil: "domcontentloaded" });
// Se salta la cortina de entrada para medir solo el scroll.
await page.evaluate(() => sessionStorage.setItem("ap-intro-seen", "1"));
await page.reload({ waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

const target = ".guide-section .section-heading";
const read = async () =>
  page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const style = getComputedStyle(el);
    return { opacity: Number(style.opacity), transform: style.transform };
  }, target);

const scrollTo = async (y) => {
  await page.evaluate((value) => window.scrollTo({ top: value, behavior: "instant" }), y);
  await page.waitForTimeout(900);
};

const box = await page.evaluate((selector) => {
  const el = document.querySelector(selector);
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
}, target);

if (box === null) {
  console.log(`No se encontro ${target}`);
} else {
  await scrollTo(0);
  const before = await read();
  await scrollTo(box - 400);
  const during = await read();
  await scrollTo(box + 2600);
  const past = await read();
  await scrollTo(box - 400);
  const backUp = await read();

  console.log(`bloque medido: ${target}`);
  console.log(` antes de llegar   opacidad ${before?.opacity}`);
  console.log(` en pantalla       opacidad ${during?.opacity}`);
  console.log(` ya pasado         opacidad ${past?.opacity}`);
  console.log(` al volver a subir opacidad ${backUp?.opacity}`);
  console.log(
    `\nresponde al subir: ${during && backUp && Math.abs(during.opacity - backUp.opacity) < 0.05 ? "si" : "revisar"}`,
  );
  console.log(
    `se reinicia al salir: ${past && past.opacity < 0.9 ? "si (bidireccional)" : "no (solo una vez)"}`,
  );
}

const lenis = await page.evaluate(() => document.documentElement.className);
console.log(`clase en <html>: "${lenis}"`);
console.log(`barra de progreso: ${(await page.locator(".scroll-progress-bar").count()) > 0 ? "presente" : "ausente"}`);

await browser.close();
console.log(errors.length ? `\nErrores: ${[...new Set(errors)].slice(0, 3).join(" | ")}` : "\nSin errores de consola.");
