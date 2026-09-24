/**
 * Auditoría profunda: sub-pantallas del admin (wizard Añadir proyecto,
 * editor, modales de categoría, grupos de amenidades) en desktop y móvil,
 * más páginas públicas con movimiento reducido (contenido real visible).
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import { chromium } from "playwright";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const outDir = path.resolve(appRoot, "../output/audit-2026-09-24/deep");
const PORT = 3212;
const BASE = `http://127.0.0.1:${PORT}`;

const envRaw = await readFile(path.join(appRoot, ".env.local"), "utf8");
const env = Object.fromEntries(
  envRaw.split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const EMAIL = env.ADMIN_TEST_EMAIL || "andris@gmail.com";
const PASSWORD = env.ADMIN_TEST_PASSWORD || "Andris2026!";

await mkdir(outDir, { recursive: true });

const server = spawn("node", [path.join(appRoot, "scripts/serve-for-test.mjs")], {
  cwd: appRoot, stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: String(PORT), STATIC_DIR: path.join(appRoot, "out") },
});
function waitReady(timeoutMs = 120000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(`${BASE}/admin`, (res) => { res.resume(); resolve(); });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) reject(new Error("timeout"));
        else setTimeout(tick, 1500);
      });
    };
    tick();
  });
}
function killServer() {
  return new Promise((resolve) => {
    if (!server.pid) return resolve();
    const k = spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    k.on("exit", resolve); setTimeout(resolve, 5000);
  });
}

const notes = [];
async function shot(page, name, fullPage = true) {
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage });
}
async function overflow(page, name) {
  const o = await page.evaluate(() => {
    const el = document.scrollingElement;
    return el.scrollWidth - el.clientWidth;
  });
  if (o > 1) notes.push(`${name}: overflow horizontal ${o}px`);
}

async function login(page) {
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 60000 });
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.locator("button.admin-login-submit").click();
  await page.waitForFunction(
    () => document.querySelector(".admin-nav") || document.querySelector(".admin-tabbar"),
    { timeout: 30000 }
  );
  await page.waitForTimeout(2000);
}

async function adminDeep(vp) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await login(page);
  await shot(page, `${vp.name}-admin-resumen`, true);
  await overflow(page, `${vp.name}-admin-resumen`);

  // --- pestaña proyectos ---
  await page.evaluate(() => (location.hash = "proyectos"));
  await page.waitForTimeout(1500);
  await shot(page, `${vp.name}-admin-proyectos`, true);
  await overflow(page, `${vp.name}-admin-proyectos`);

  // Añadir proyecto (wizard)
  const addBtn = page.getByRole("button", { name: /a[ñn]adir proyecto/i }).first();
  if (await addBtn.count()) {
    await addBtn.click();
    await page.waitForTimeout(1200);
    await shot(page, `${vp.name}-admin-nuevo-paso1`, true);
    await overflow(page, `${vp.name}-admin-nuevo-paso1`);
    // intentar avanzar por los pasos del wizard
    for (let step = 2; step <= 6; step++) {
      const next = page.getByRole("button", { name: /siguiente|continuar/i }).first();
      if (!(await next.count())) break;
      const disabled = await next.isDisabled().catch(() => false);
      if (disabled) { notes.push(`${vp.name}: paso ${step} botón siguiente deshabilitado`); break; }
      await next.click();
      await page.waitForTimeout(900);
      await shot(page, `${vp.name}-admin-nuevo-paso${step}`, true);
    }
    // FAB de vista previa (solo móvil/tablet): captura de viewport
    if (!vp.name.includes("desk")) await shot(page, `${vp.name}-admin-nuevo-fab`, false);
    // cerrar wizard con su propio botón (nunca "Cerrar sesión" del chrome)
    const close = page.locator(".npf-back-btn").first();
    if (await close.count()) await close.click().catch(() => {});
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  // Editar primer proyecto
  const editBtn = page.getByRole("button", { name: /^editar$/i }).first();
  if (await editBtn.count()) {
    await editBtn.click();
    await page.waitForTimeout(1500);
    await shot(page, `${vp.name}-admin-editar-proyecto`, true);
    await overflow(page, `${vp.name}-admin-editar-proyecto`);
    await page.keyboard.press("Escape");
    const back = page.locator(".npf-back-btn").first();
    if (await back.count()) await back.click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // --- categorías ---
  await page.evaluate(() => (location.hash = "categorias"));
  await page.waitForTimeout(1500);
  await shot(page, `${vp.name}-admin-categorias`, true);
  await overflow(page, `${vp.name}-admin-categorias`);

  // sub-pestaña grupos de amenidades
  const groupsTab = page.getByRole("button", { name: /grupos de amenidades/i }).first();
  if (await groupsTab.count()) {
    await groupsTab.click();
    await page.waitForTimeout(1000);
    await shot(page, `${vp.name}-admin-amenidades`, true);
    await overflow(page, `${vp.name}-admin-amenidades`);
    await page.evaluate(() => (location.hash = "categorias"));
    await page.waitForTimeout(800);
  }
  // modal editar categoría
  const catEdit = page.getByRole("button", { name: /^editar$/i }).first();
  if (await catEdit.count()) {
    await catEdit.click();
    await page.waitForTimeout(900);
    await shot(page, `${vp.name}-admin-categoria-modal`, false);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  }
  // modal "Añadir categoría" (alta rediseñada)
  const catAdd = page.getByRole("button", { name: /a[ñn]adir categor[ií]a/i }).first();
  if (await catAdd.count()) {
    await catAdd.click();
    await page.waitForTimeout(900);
    await shot(page, `${vp.name}-admin-categoria-nueva-modal`, false);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  }

  // --- resto de pestañas ---
  for (const tab of ["leads", "cotizaciones", "esquema", "diagnostico"]) {
    await page.evaluate((t) => (location.hash = t), tab);
    await page.waitForTimeout(1500);
    await shot(page, `${vp.name}-admin-${tab}`, true);
    await overflow(page, `${vp.name}-admin-${tab}`);
  }

  // menú "Más" móvil
  if (vp.name.includes("mobile")) {
    const moreBtn = page.locator(".admin-tabbar button").last();
    if (await moreBtn.count()) { await moreBtn.click(); await page.waitForTimeout(500); await shot(page, `${vp.name}-admin-mas-menu`, false); }
  }
  await ctx.close();
}

async function publicDeep(vp) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  const allRoutes = ["/", "/proyectos", "/mapa", "/sobre-mi", "/calculadora", "/contacto"];
  const routeFilter = (process.env.AUDIT_ROUTES || "").trim();
  const routes = routeFilter ? allRoutes.filter((r) => routeFilter.includes(r.slice(1) || "home")) : allRoutes;
  for (const route of routes) {
    const slug = route === "/" ? "home" : route.slice(1);
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(6000);
      await shot(page, `${vp.name}-public-${slug}`, true);
      await overflow(page, `${vp.name}-public-${slug}`);
    } catch (e) { notes.push(`${vp.name}-public-${slug}: ${String(e).slice(0, 120)}`); }
  }
  // ficha
  try {
    await page.goto(`${BASE}/proyectos`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(5000);
    const href = await page.locator('a[href*="/proyectos/"]').first().getAttribute("href");
    if (href) {
      await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(5000);
      await shot(page, `${vp.name}-public-ficha`, true);
      await overflow(page, `${vp.name}-public-ficha`);
    }
  } catch (e) { notes.push(`${vp.name}-public-ficha: ${String(e).slice(0, 120)}`); }
  // menú móvil del header
  if (vp.name.includes("mobile")) {
    try {
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(4000);
      const menuBtn = page.locator("header button, [class*=menu] button, button[aria-label*=enú]").first();
      if (await menuBtn.count()) {
        await menuBtn.click().catch(() => {});
        await page.waitForTimeout(700);
        await shot(page, `${vp.name}-public-menu`, false);
      }
    } catch (e) { notes.push(`${vp.name}-public-menu: ${String(e).slice(0, 120)}`); }
  }
  await ctx.close();
}

let browser;
try {
  await waitReady();
  browser = await chromium.launch();
  const viewports = [
    { name: "desk", width: 1440, height: 900 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 375, height: 812 },
  ];
  const only = (process.env.AUDIT_ONLY || "").trim();
  const vpFilter = (process.env.AUDIT_VP || "").trim();
  const vps = vpFilter ? viewports.filter((v) => vpFilter.split(",").includes(v.name)) : viewports;
  for (const vp of vps) if (!only || only === "admin") await adminDeep(vp);
  for (const vp of vps) if (!only || only === "public") await publicDeep(vp);
} finally {
  if (browser) await browser.close();
  await killServer();
}
await writeFile(path.join(outDir, "notes.json"), JSON.stringify(notes, null, 2));
console.log("NOTES:", JSON.stringify(notes, null, 2));
