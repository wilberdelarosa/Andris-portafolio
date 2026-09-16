import { chromium } from "playwright-core";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../output/playwright/comparison-ui");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });

const contextDesktop = await browser.newContext({ viewport: { width: 1440, height: 950 } });
await contextDesktop.addInitScript(() => {
  sessionStorage.setItem("ap-intro-seen", "1");
});
const page = await contextDesktop.newPage();
await page.goto("http://127.0.0.1:3012/proyectos?lang=es", { waitUntil: "load" });
await page.evaluate(() => {
  document.documentElement.dataset.intro = "skip";
  return document.fonts.ready;
});
await page.waitForTimeout(400);

await page.screenshot({ path: path.join(outDir, "01-catalog-filters-desktop.png"), fullPage: false });

// Open Advanced Drawer
await page.click(".catalog-advanced-btn");
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(outDir, "02-advanced-drawer-open.png"), fullPage: false });

// Select compare buttons on 2 cards
const compareButtons = page.locator(".pcard-compare-pill");
const count = await compareButtons.count();
if (count >= 2) {
  await compareButtons.nth(0).click();
  await page.waitForTimeout(300);
  await compareButtons.nth(1).click();
  await page.waitForTimeout(400);
}
await page.screenshot({ path: path.join(outDir, "03-floating-dock-visible.png"), fullPage: false });

// Open Comparison Modal
await page.click(".compare-dock-btn-primary");
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(outDir, "04-comparison-modal.png"), fullPage: false });

// Toggle "Solo diferencias"
await page.click(".compare-filter-toggle");
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(outDir, "05-comparison-only-differences.png"), fullPage: false });

// Click "Comparar los 3" inside the modal
await page.click(".compare-btn-add-all");
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(outDir, "07-comparison-all-three.png"), fullPage: false });

// Close modal
await page.click(".compare-close-btn");
await page.waitForTimeout(300);

// 2. Mobile Viewport (375px)
const contextMobile = await browser.newContext({ viewport: { width: 375, height: 844 } });
await contextMobile.addInitScript(() => {
  sessionStorage.setItem("ap-intro-seen", "1");
});
const mobilePage = await contextMobile.newPage();
await mobilePage.goto("http://127.0.0.1:3012/proyectos?lang=es", { waitUntil: "load" });
await mobilePage.evaluate(() => {
  document.documentElement.dataset.intro = "skip";
  return document.fonts.ready;
});
await mobilePage.waitForTimeout(400);
await mobilePage.screenshot({ path: path.join(outDir, "06-catalog-mobile.png"), fullPage: false });

await browser.close();
console.log("Updated UI captures saved successfully in output/playwright/comparison-ui");
