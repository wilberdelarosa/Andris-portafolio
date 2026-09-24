/**
 * Humo del CMS sin tocar Supabase ni datos de producción.
 * Comprueba el acceso sin sesión y las vistas autenticadas con una sesión
 * simulada de solo navegador; así detecta errores de renderizado como los de
 * una dependencia pública usada dentro del administrador.
 */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const baseURL = new URL(process.env.BASE_URL || "http://127.0.0.1:3012");
const appRoot = fileURLToPath(new URL("../", import.meta.url));
const output = path.resolve(appRoot, "../output/playwright/cms-checks");
const widths = [375, 1440];
const report = { baseURL: baseURL.href, checks: [], errors: [] };

await mkdir(output, { recursive: true });

function fakeSession() {
  return {
    accessToken: "qa-local-token",
    refreshToken: "qa-local-refresh-token",
    expiresAt: 4_102_444_800,
    email: "qa-cms@example.test",
    userId: "qa-cms-user",
  };
}

async function mockCmsReadEndpoints(page) {
  await page.route("**/rest/v1/**", async (route) => {
    const request = route.request();
    if (!["GET", "HEAD"].includes(request.method())) {
      await route.abort("blockedbyclient");
      return;
    }
    const pathname = new URL(request.url()).pathname;
    const projects = pathname.endsWith("/projects");
    const rows = projects
      ? [
          {
            id: "00000000-0000-4000-8000-000000000001",
            slug: "qa-project",
            name: "Proyecto de prueba local",
            public_status: "published",
            sector: "Punta Cana",
            city: "Punta Cana",
            updated_at: "2026-09-24T12:00:00.000Z",
            property_category_id: null,
            property_categories: null,
            project_media: [],
            project_price_snapshots: [],
          },
        ]
      : [];
    await route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      headers: { "content-range": projects ? "0-0/1" : "*/0" },
      body: JSON.stringify(rows),
    });
  });
}

async function navigate(page, pathname) {
  const response = await page.goto(new URL(pathname, baseURL).href, {
    waitUntil: "domcontentloaded",
  });
  assert.ok(response?.ok(), `HTTP ${response?.status()} en ${pathname}`);
}

async function capture(page, name) {
  await page.screenshot({
    path: path.join(output, `${name}.png`),
    fullPage: true,
    caret: "initial",
  });
}

async function check(name, action) {
  process.stdout.write(`${name} ... `);
  try {
    const details = await action();
    report.checks.push({ name, passed: true, details });
    process.stdout.write("OK\n");
  } catch (error) {
    report.checks.push({ name, passed: false, error: error.message });
    process.stdout.write(`ERROR: ${error.message}\n`);
  }
}

let browser;
try {
  browser = await chromium.launch({
    headless: process.env.HEADED !== "1",
    channel: process.env.BROWSER_CHANNEL || "chrome",
    ...(process.env.BROWSER_EXECUTABLE
      ? { executablePath: process.env.BROWSER_EXECUTABLE }
      : {}),
  });

  for (const width of widths) {
    await check(`CMS sin sesión muestra acceso @ ${width}px`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      page.on("pageerror", (error) => report.errors.push(`[sin sesión ${width}] ${error.message}`));
      await navigate(page, "/admin/");
      await page.getByRole("heading", { name: "Estudio CMS", exact: true }).waitFor();
      assert.equal(await page.locator(".admin-login-form").count(), 1);
      await capture(page, `login-${width}`);
      await page.close();
      return { login: true };
    });

    await check(`CMS autenticado: lista de proyectos @ ${width}px`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await mockCmsReadEndpoints(page);
      await page.addInitScript((session) => {
        localStorage.setItem("ap-cms-session", JSON.stringify(session));
      }, fakeSession());
      page.on("pageerror", (error) => report.errors.push(`[proyectos ${width}] ${error.message}`));
      await navigate(page, "/admin/#proyectos");
      await page.locator(".admin-shell").waitFor();
      await page.getByRole("heading", { name: "Proyectos", exact: true }).waitFor();
      await page.locator(".admin-project-row").first().waitFor({ state: "attached" });
      assert.equal(await page.locator(".admin-project-row").count(), 1);
      assert.equal(await page.getByText("Proyecto de prueba local", { exact: true }).count(), 1);
      await capture(page, `projects-list-${width}`);
      await page.close();
      return { projectEditor: true, mockedProject: true };
    });

    await check(`CMS autenticado: alta de proyecto y vista previa @ ${width}px`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await mockCmsReadEndpoints(page);
      await page.addInitScript((session) => {
        localStorage.setItem("ap-cms-session", JSON.stringify(session));
      }, fakeSession());
      page.on("pageerror", (error) => report.errors.push(`[nuevo ${width}] ${error.message}`));
      await navigate(page, "/admin/#proyectos");
      await page.locator(".admin-shell").waitFor();
      await page.getByRole("heading", { name: "Proyectos", exact: true }).waitFor();
      await page.getByRole("button", { name: "Añadir proyecto", exact: true }).click();
      await page.getByRole("heading", { name: "Añadir proyecto", exact: true }).waitFor();
      assert.equal(await page.locator(".admin-preview-panel").count(), 1);
      assert.equal(await page.locator(".pcard").count(), 1);
      await capture(page, `new-project-preview-${width}`);
      await page.close();
      return { newProjectForm: true, livePreview: true };
    });
  }

  await check("CMS no registra excepciones de JavaScript", async () => {
    assert.deepEqual(report.errors, []);
    return { errors: 0 };
  });
} catch (error) {
  report.checks.push({ name: "Preparación del navegador CMS", passed: false, error: error.message });
  console.error(`No se pudo completar la verificación CMS: ${error.message}`);
} finally {
  await browser?.close();
  report.finishedAt = new Date().toISOString();
  report.passed = report.checks.length > 0 && report.checks.every((item) => item.passed);
  await writeFile(path.join(output, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`${report.passed ? "PASS" : "FAIL"}: ${report.checks.filter((item) => item.passed).length}/${report.checks.length} comprobaciones. ${output}`);
  if (!report.passed) process.exitCode = 1;
}
