/**
 * Auditoría visual UI/UX: levanta `next dev`, captura todas las rutas
 * públicas y cada pestaña del estudio admin en desktop/tablet/móvil,
 * y reporta overflow horizontal por página. El servidor se apaga al terminar.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import { chromium } from "playwright";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const outDir = path.resolve(appRoot, "../output/audit-2026-09-24");
const PORT = 3210;
const BASE = `http://127.0.0.1:${PORT}`;

const envRaw = await readFile(path.join(appRoot, ".env.local"), "utf8");
const env = Object.fromEntries(
  envRaw.split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const EMAIL = process.env.AUDIT_EMAIL || env.ADMIN_TEST_EMAIL || "andris@gmail.com";
const PASSWORD = process.env.AUDIT_PASSWORD || env.ADMIN_TEST_PASSWORD || "Andris2026!";

await mkdir(outDir, { recursive: true });

// ---- dev server lifecycle ----
const server = spawn("cmd", ["/c", "npm", "run", "dev", "--", "-p", String(PORT)], {
  cwd: appRoot, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, BROWSER: "none" },
});
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

function waitReady(timeoutMs = 120000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(`${BASE}/admin`, (res) => { res.resume(); resolve(); });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) reject(new Error("server timeout\n" + serverLog.slice(-2000)));
        else setTimeout(tick, 1500);
      });
    };
    tick();
  });
}

function killServer() {
  return new Promise((resolve) => {
    if (!server.pid) return resolve();
    const killer = spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    killer.on("exit", resolve);
    setTimeout(resolve, 5000);
  });
}

const PUBLIC_ROUTES = ["/", "/proyectos", "/mapa", "/sobre-mi", "/calculadora", "/contacto"];
const ADMIN_TABS = ["resumen", "proyectos", "categorias", "leads", "cotizaciones", "esquema", "diagnostico"];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
  { name: "small", width: 320, height: 700 },
];

const overflowReport = [];
async function shot(page, name, fullPage = true) {
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage });
  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement;
    const over = el.scrollWidth - el.clientWidth;
    const offenders = [];
    if (over > 1) {
      for (const node of document.querySelectorAll("*")) {
        const r = node.getBoundingClientRect();
        if (r.right > el.clientWidth + 1 || r.left < -1) {
          const cls = typeof node.className === "string" ? node.className.slice(0, 80) : "";
          offenders.push(`${node.tagName.toLowerCase()}.${cls} right=${Math.round(r.right)}`);
          if (offenders.length >= 8) break;
        }
      }
    }
    return { over, offenders };
  });
  overflowReport.push({ name, ...overflow });
}

async function main() {
  await waitReady();
  const browser = await chromium.launch();
  try {
    // -------- público --------
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      for (const route of PUBLIC_ROUTES) {
        const slug = route === "/" ? "home" : route.slice(1);
        if (vp.name === "small" && !["home", "proyectos"].includes(slug)) continue;
        try {
          await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
          await shot(page, `public-${slug}-${vp.name}`);
        } catch (e) { overflowReport.push({ name: `public-${slug}-${vp.name}`, error: String(e).slice(0, 200) }); }
      }
      // ficha de proyecto
      try {
        await page.goto(`${BASE}/proyectos`, { waitUntil: "networkidle", timeout: 60000 });
        const href = await page.locator('a[href*="/proyectos/"]').first().getAttribute("href");
        if (href) {
          await page.goto(`${BASE}${href}`, { waitUntil: "networkidle", timeout: 60000 });
          await shot(page, `public-ficha-${vp.name}`);
        }
      } catch (e) { overflowReport.push({ name: `public-ficha-${vp.name}`, error: String(e).slice(0, 200) }); }
      await ctx.close();
    }

    // -------- admin: login desktop --------
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      page.on("console", (m) => { if (m.type() === "error") overflowReport.push({ name: `console-${vp.name}`, error: m.text().slice(0, 200) }); });
      await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 60000 });
      await shot(page, `admin-login-${vp.name}`, false);
      await page.fill("#email", EMAIL);
      await page.fill("#password", PASSWORD);
      await page.locator("button.admin-login-submit").click();
      try {
        await page.waitForSelector(".admin-nav, .admin-tabbar", { timeout: 30000 });
      } catch {
        await shot(page, `admin-login-FAILED-${vp.name}`, false);
        await ctx.close();
        continue;
      }
      await page.waitForTimeout(1500);
      for (const tab of ADMIN_TABS) {
        await page.evaluate((t) => (location.hash = t), tab);
        await page.waitForTimeout(1200);
        await shot(page, `admin-${tab}-${vp.name}`);
      }
      // menú "Más" en móvil
      if (vp.name === "mobile" || vp.name === "small") {
        const moreBtn = page.locator(".admin-tabbar button").last();
        await moreBtn.click();
        await page.waitForTimeout(600);
        await shot(page, `admin-more-menu-${vp.name}`, false);
      }
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
  await writeFile(path.join(outDir, "overflow-report.json"), JSON.stringify(overflowReport, null, 2));
  const problems = overflowReport.filter((r) => (r.over ?? 0) > 1 || r.error);
  console.log("OVERFLOW/ERRORS:", JSON.stringify(problems, null, 2));
}

try {
  await main();
} finally {
  await killServer();
}
