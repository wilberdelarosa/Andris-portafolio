/** Captura cualquier ruta a viewport real en varios scrolls. Env: ROUTE, NAME, WIDTH. */
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import { chromium } from "playwright";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const outDir = path.resolve(appRoot, "../output/audit-2026-09-24/deep");
const PORT = 3214;
const BASE = `http://127.0.0.1:${PORT}`;
const ROUTE = "/" + (process.env.ROUTE || "contacto").replace(/^\/+/, "");
const NAME = process.env.NAME || "route";
const WIDTH = Number(process.env.WIDTH || 375);
const HEIGHT = Number(process.env.HEIGHT || 812);

const server = spawn("node", [path.join(appRoot, "scripts/serve-for-test.mjs")], {
  cwd: appRoot, stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: String(PORT), STATIC_DIR: path.join(appRoot, "out") },
});
function waitReady(timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(`${BASE}/`, (res) => { res.resume(); resolve(); });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) reject(new Error("timeout"));
        else setTimeout(tick, 1200);
      });
    };
    tick();
  });
}
await mkdir(outDir, { recursive: true });
await waitReady();
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(5000);
  const total = await page.evaluate(() => document.scrollingElement.scrollHeight);
  const steps = Math.max(1, Math.min(8, Math.ceil(total / HEIGHT)));
  for (let i = 0; i <= steps; i++) {
    const y = Math.round((total - HEIGHT) * (i / steps));
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: path.join(outDir, `${NAME}-scroll${i}.png`), fullPage: false });
  }
  console.log("total height:", total, "steps:", steps);
} finally {
  await browser.close();
  await new Promise((resolve) => {
    if (!server.pid) return resolve();
    const k = spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    k.on("exit", resolve); setTimeout(resolve, 4000);
  });
}
