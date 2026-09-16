import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL || "http://localhost:3001";
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());

for (const [width, height, name] of [[1440, 900, "afterword-web"], [390, 844, "afterword-movil"]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(new URL("/?lang=es", baseURL).href, { waitUntil: "networkidle" });
  await page.evaluate(() => sessionStorage.setItem("ap-intro-seen", "1"));
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1300);

  const element = await page.$("[class*=afterword]");
  if (!element) {
    console.log(`${name}: no se encontro el bloque`);
    await page.close();
    continue;
  }
  await element.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const box = await element.boundingBox();
  await page.screenshot({
    path: `../output/review/${name}.png`,
    clip: { x: 0, y: Math.max(0, box.y - 150), width, height: Math.min(height - 10, box.height + 190) },
  });
  console.log(`${name} capturado`);
  await page.close();
}

await browser.close();
