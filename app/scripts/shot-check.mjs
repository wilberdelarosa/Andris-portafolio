import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL || "http://localhost:3001";
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const errors = [];

const shots = [
  { w: 1440, h: 900, name: "hero-web", sel: null },
  { w: 390, h: 844, name: "hero-movil", sel: null },
  { w: 1440, h: 900, name: "contacto-web", sel: ".journey-contact" },
  { w: 390, h: 844, name: "contacto-movil", sel: ".journey-contact" },
  { w: 768, h: 1024, name: "contacto-tablet", sel: ".journey-contact" },
];

for (const shot of shots) {
  const page = await browser.newPage({ viewport: { width: shot.w, height: shot.h } });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(new URL("/?lang=es", baseURL).href, { waitUntil: "networkidle" });
  await page.evaluate(() => sessionStorage.setItem("ap-intro-seen", "1"));
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);

  if (shot.sel) {
    const el = await page.$(shot.sel);
    if (!el) {
      console.log(`${shot.name}: no se encontro ${shot.sel}`);
      await page.close();
      continue;
    }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await el.screenshot({ path: `../output/review/${shot.name}.png` });
  } else {
    await page.screenshot({ path: `../output/review/${shot.name}.png` });
  }
  console.log(`${shot.name}  ${shot.w}x${shot.h}`);
  await page.close();
}

await browser.close();
console.log(errors.length ? `\nErrores: ${[...new Set(errors)].slice(0, 3).join(" | ")}` : "\nSin errores de consola.");
