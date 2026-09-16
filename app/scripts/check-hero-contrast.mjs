/**
 * Comprueba, por ancho, que el texto del hero se separa de su fondo y que la
 * ficha de Melcon conserva miniatura y apilado.
 *
 * Mide contraste WCAG real en lugar de mirar una captura: un texto puede
 * parecer legible en pantalla y estar por debajo del minimo.
 */
import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL || "http://localhost:3001";

const channel = (value) => {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const parse = (value) => (value.match(/\d+/g) || []).slice(0, 3).map(Number);
const contrast = (a, b) => {
  const first = luminance(parse(a));
  const second = luminance(parse(b));
  const high = Math.max(first, second);
  const low = Math.min(first, second);
  return (high + 0.05) / (low + 0.05);
};

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());

for (const width of [390, 760, 1100, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(new URL("/?lang=es", baseURL).href, { waitUntil: "networkidle" });
  await page.evaluate(() => sessionStorage.setItem("ap-intro-seen", "1"));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  const data = await page.evaluate(() => {
    const meet = document.querySelector("[class*=meet]");
    const advice = meet?.closest("[class*=advice]");
    const photo = document.querySelector("[class*=projectPhoto]");
    const text = document.querySelector("[class*=projectText]");
    return {
      color: meet ? getComputedStyle(meet).color : null,
      glass: advice ? getComputedStyle(advice, "::before").display : "none",
      photoWidth: photo ? Math.round(photo.getBoundingClientRect().width) : 0,
      stacked: text ? getComputedStyle(text).display : null,
    };
  });

  // Fondo efectivo: crema cuando no hay panel de vidrio, navy graduado cuando si.
  const background = data.glass === "none" ? "rgb(251,249,244)" : "rgb(24,42,66)";
  const ratio = contrast(data.color, background);
  const verdict = ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA grande" : "INSUFICIENTE";

  console.log(
    `${String(width).padEnd(5)} color ${data.color.padEnd(20)} contraste ${ratio.toFixed(2).padStart(6)} ${verdict.padEnd(13)} miniatura ${String(data.photoWidth).padStart(3)}px  texto ${data.stacked}`,
  );
  await page.close();
}

await browser.close();
