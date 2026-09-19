// Capturas para el documento de estructura — robusto y con logs.
import { createRequire } from "node:module";
const require = createRequire("E:/PROYECTOS WEB/AndrisPortafolio/app/package.json");
const { chromium } = require("playwright-core");
import fs from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "E:/PROYECTOS WEB/AndrisPortafolio/output/doc-structure/shots/";
const EXECUTABLE = "C:/Users/wilbe/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";
const log = (m) => { const line = `[${new Date().toISOString()}] ${m}`; console.log(line); fs.appendFileSync(OUT + "capture.log", line + "\n"); };

const routes = [
  { name: "home", path: "/" },
  { name: "proyectos", path: "/proyectos" },
  { name: "ficha-melcon", path: "/proyectos/melcon-paradise" },
  { name: "mapa", path: "/mapa" },
  { name: "sobre-mi", path: "/sobre-mi" },
  { name: "calculadora", path: "/calculadora" },
  { name: "contacto", path: "/contacto" },
];

fs.mkdirSync(OUT, { recursive: true });
log("launching browser");
const browser = await chromium.launch({ executablePath: EXECUTABLE });
log("browser up");

async function settle(page, ms = 2500) {
  await page.addStyleTag({ content: "nextjs-portal,#__next-build-watcher{display:none!important}" }).catch(() => {});
  await page.evaluate(async () => {
    await Promise.race([
      Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : new Promise((res) => { img.onload = img.onerror = res; })
        )
      ),
      new Promise((res) => setTimeout(res, 6000)),
    ]);
  }).catch(() => {});
  await page.waitForTimeout(ms);
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await desktop.newPage();
for (const r of routes) {
  log("goto " + r.path);
  await page.goto(BASE + r.path, { waitUntil: "load", timeout: 60000 });
  await settle(page);
  await page.screenshot({ path: OUT + r.name + "-hero.png" });
  log("hero shot " + r.name);
  await page.screenshot({ path: OUT + r.name + "-full.png", fullPage: true, timeout: 60000 });
  log("full shot " + r.name);
}

// Móvil
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", isMobile: true, hasTouch: true });
const mpage = await mobile.newPage();
for (const r of [{ name: "home-mobile", path: "/" }, { name: "proyectos-mobile", path: "/proyectos" }]) {
  log("goto mobile " + r.path);
  await mpage.goto(BASE + r.path, { waitUntil: "load", timeout: 60000 });
  await settle(mpage);
  await mpage.screenshot({ path: OUT + r.name + ".png", fullPage: true, timeout: 60000 });
  log("mobile shot " + r.name);
}
await mobile.close();

// Tema oscuro
const dark = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", colorScheme: "dark" });
const dpage = await dark.newPage();
await dpage.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
await dpage.addStyleTag({ content: "nextjs-portal,#__next-build-watcher{display:none!important}" }).catch(() => {});
await dpage.evaluate(() => { localStorage.setItem("theme", "dark"); document.documentElement.setAttribute("data-theme", "dark"); }).catch(() => {});
await settle(dpage);
await dpage.screenshot({ path: OUT + "home-dark.png" });
log("dark shot");
await dark.close();
await desktop.close();
await browser.close();
log("DONE");
