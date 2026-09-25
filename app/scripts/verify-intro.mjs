import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());

try {
  const firstContext = await browser.newContext({ reducedMotion: "no-preference" });
  const firstPage = await firstContext.newPage();
  const response = await firstPage.goto(new URL("/?lang=es", baseURL).href, {
    waitUntil: "domcontentloaded",
  });
  assert.ok(response?.ok(), `La portada respondió HTTP ${response?.status()}`);
  await firstPage.locator(".intro").waitFor({ state: "visible" });
  console.log("OK: la cortina aparece en una pestaña nueva.");

  await firstPage.waitForTimeout(3100);
  await firstPage.locator(".intro").waitFor({ state: "detached", timeout: 1500 });
  console.log("OK: la cortina termina y deja libre la página.");

  await firstPage.reload({ waitUntil: "domcontentloaded" });
  await firstPage.waitForTimeout(350);
  assert.equal(await firstPage.locator(".intro").isVisible(), false);
  console.log("OK: al volver en la misma pestaña no se repite.");

  const secondContext = await browser.newContext({ reducedMotion: "no-preference" });
  const secondPage = await secondContext.newPage();
  await secondPage.goto(new URL("/?lang=es", baseURL).href, {
    waitUntil: "domcontentloaded",
  });
  await secondPage.locator(".intro").waitFor({ state: "visible" });
  console.log("OK: una pestaña nueva inicia una sesión de intro independiente.");
  await secondContext.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(new URL("/?lang=es", baseURL).href, {
    waitUntil: "domcontentloaded",
  });
  const mobileIntro = mobilePage.locator(".intro");
  await mobileIntro.waitFor({ state: "visible" });
  const bounds = await mobileIntro.boundingBox();
  assert.ok(bounds && bounds.width >= 375 && bounds.height >= 812);
  console.log("OK: la cortina cubre y se adapta a la pantalla móvil.");
  await mobileContext.close();
  await firstContext.close();
} finally {
  await browser.close();
}
