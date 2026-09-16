import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.BASE_URL || "http://localhost:3001";
const out = new URL("../../output/review/discovery/", import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
  serviceWorkers: "block",
});
await context.addInitScript(() => sessionStorage.setItem("ap-intro-seen", "1"));
const page = await context.newPage();
page.setDefaultTimeout(20000);
const report = { passed: [], errors: [], pageErrors: [], requests: [] };
page.on("pageerror", (error) => report.pageErrors.push(error.message));
page.on("request", (request) => {
  if (request.url().includes("kuula.co")) report.requests.push(request.url());
});
async function check(name, action) {
  process.stdout.write(name + " ... ");
  try {
    await action();
    report.passed.push(name);
    process.stdout.write("OK\n");
  } catch (error) {
    report.errors.push({ name, error: error.message });
    process.stdout.write(error.message + "\n");
  }
}
async function go(path) {
  await page.goto(base + path, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => document.documentElement.dataset.experienceReady === "true",
  );
}
async function waitForCards(count) {
  await page.waitForFunction(
    (expected) => document.querySelectorAll(".catalog-card").length === expected,
    count,
  );
}
async function shot(name) {
  await page.screenshot({ path: fileURLToPath(new URL(name + ".png", out)) });
}
async function fits(locator) {
  const { width, height } = page.viewportSize();
  // A viewport command can resolve before Chromium commits its responsive layout.
  // Wait for actual geometry, with the same strict bounds as the assertion below.
  await page.waitForFunction(
    ({ element, width, height }) => {
      if (!element || innerWidth !== width || innerHeight !== height)
        return false;
      const box = element.getBoundingClientRect();
      return (
        box.width > 0 &&
        box.height > 0 &&
        box.x >= -1 &&
        box.y >= -1 &&
        box.right <= width + 1 &&
        box.bottom <= height + 1
      );
    },
    { element: await locator.elementHandle(), width, height },
    { timeout: 3000, polling: "raf" },
  );
  const box = await locator.boundingBox();
  assert.ok(
    box &&
      box.x >= -1 &&
      box.y >= -1 &&
      box.x + box.width <= width + 1 &&
      box.y + box.height <= height + 1,
    JSON.stringify({ box, width, height }),
  );
}
try {
  await check("search, budget and live counts", async () => {
    await go("/proyectos/?lang=es");
    await waitForCards(3);
    await page.locator(".kuula-warmup-frame").waitFor({ timeout: 8000 });
    assert.match(
      await page.locator(".kuula-warmup-frame").getAttribute("src"),
      /\/share\/htQc3\/collection\/7HsBR/,
    );
    await page.getByRole("searchbox").fill("terra");
    await waitForCards(1);
    await page.getByRole("searchbox").fill("");
    await waitForCards(3);
    await page.getByLabel("Presupuesto (USD)").selectOption("under150");
    await waitForCards(1);
    await page.getByLabel("Presupuesto (USD)").selectOption("");
    await waitForCards(3);
    await shot("catalog-desktop");
  });
  await check("year, beach and golf filters; reset and close", async () => {
    await go("/proyectos/?lang=es");
    await page
      .getByRole("button", { name: "Filtros avanzados", exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "Filtrar proyectos" });
    await dialog.getByRole("button", { name: /^2028/ }).click();
    await dialog
      .getByRole("button", { name: /^Acceso a campo de golf/ })
      .click();
    assert.equal(
      await dialog
        .getByRole("button", { name: "Ver 1 proyecto", exact: true })
        .count(),
      1,
    );
    await shot("filters-desktop");
    await dialog.getByRole("button", { name: "Limpiar filtros" }).click();
    await dialog.getByRole("button", { name: /^2026/ }).click();
    assert.equal(
      await dialog
        .getByRole("button", { name: "Ver 0 proyectos", exact: true })
        .count(),
      1,
    );
    await dialog.getByRole("button", { name: "Limpiar filtros" }).click();
    await dialog.getByRole("button", { name: /^Primera línea/ }).click();
    await dialog
      .getByRole("button", { name: "Ver 0 proyectos", exact: true })
      .click();
    assert.equal(await page.locator(".catalog-empty").count(), 1);
    await page.getByRole("button", { name: "Quitar los filtros" }).click();
    await page
      .getByRole("button", { name: "Filtros avanzados", exact: true })
      .click();
    await dialog.getByRole("button", { name: /^Unidades listas/ }).click();
    await dialog.getByRole("button", { name: /^Cancha de tenis/ }).click();
    await dialog
      .getByRole("button", { name: "Ver 1 proyecto", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("article", {
          name: "The Beach at Punta Cana City Place",
          exact: true,
        })
        .count(),
      1,
    );
    await page
      .getByRole("button", { name: "Limpiar filtros", exact: true })
      .click();
  });
  await check("comparison has honest data and table semantics", async () => {
    await go("/proyectos/?lang=es");
    await page
      .getByRole("button", { name: "Comparativa de Proyectos", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    assert.equal(await dialog.getByRole("table").count(), 1);
    assert.equal(await dialog.getByRole("columnheader").count(), 4);
    assert.match(await dialog.innerText(), /No documentado/);
    assert.doesNotMatch(
      await dialog.innerText(),
      /No aplica|0% IPI|den opcional/,
    );
    await shot("comparison-desktop");
    await page.keyboard.press("Escape");
  });
  await check("Android comparison tray expands and opens modal", async () => {
    await page.setViewportSize({ width: 360, height: 812 });
    await go("/proyectos/?lang=es");
    await page
      .getByRole("button", { name: /Añadir Terra Serena al comparador/ })
      .click();
    const dock = page.locator(".compare-dock");
    const toggle = page.locator(".compare-dock-mobile-toggle");
    await toggle.waitFor();
    await fits(toggle);
    assert.equal(await dock.getAttribute("data-open"), "false");
    await toggle.click();
    await page.locator('.compare-dock[data-open="true"]').waitFor();
    await fits(page.locator(".compare-dock-inner"));
    assert.equal(await page.locator(".compare-dock-chip").count(), 1);
    await page.locator(".compare-dock-btn-primary").click();
    await page.getByRole("dialog", { name: "Comparativa de Proyectos" }).waitFor();
    await fits(page.getByRole("dialog"));
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
      0,
    );
    await shot("comparison-tray-android");
    await page.keyboard.press("Escape");
  });
  for (const width of [320, 375, 768]) {
    await check("filter and comparison fit " + width, async () => {
      await page.setViewportSize({ width, height: 812 });
      await go("/proyectos/?lang=es");
      await page
        .getByRole("button", { name: "Filtros avanzados", exact: true })
        .click();
      await fits(page.getByRole("dialog"));
      await fits(page.locator(".catalog-filter-footer"));
      await shot("filters-" + width);
      await page.keyboard.press("Escape");
      await page
        .getByRole("button", { name: "Comparativa de Proyectos", exact: true })
        .click();
      await fits(page.getByRole("dialog"));
      await fits(page.locator(".compare-footer"));
      if (width < 760) {
        assert.equal(
          await page.locator(".compare-mobile-list").evaluate((element) => getComputedStyle(element).display),
          "grid",
        );
        assert.equal(await page.locator(".compare-mobile-project").count(), 3);
        assert.equal(await page.locator(".compare-mobile-row").count(), 21);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
          0,
        );
      }
      await shot("comparison-" + width);
      await page.keyboard.press("Escape");
    });
  }
  await check(
    "map defaults flat, exact reference pin and optional 3D",
    async () => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await go("/mapa/?lang=es&proyecto=terra-serena");
      await page.locator('[data-map-ready="true"]').waitFor({ timeout: 45000 });
      assert.equal(
        await page
          .locator(".explorer-canvas")
          .getAttribute("data-map-dimension"),
        "2d",
      );
      assert.equal(
        await page
          .locator(".explorer-item[aria-pressed=true]")
          .innerText()
          .then((v) => v.includes("Terra Serena")),
        true,
      );
      await page
        .getByRole("button", { name: "Activar vista 3D", exact: true })
        .click();
      assert.equal(
        await page
          .locator(".explorer-canvas")
          .getAttribute("data-map-dimension"),
        "3d",
      );
      await shot("map-3d");
      await page
        .getByRole("button", { name: "Desactivar vista 3D", exact: true })
        .click();
      await page.locator('[data-map-dimension="2d"]').waitFor();
      assert.equal(await page.getByRole("button", { name: "Activar vista 3D", exact: true }).count(), 1);
      await shot("map-2d");
    },
  );
  await check("Terra map marker opens all six 360 scenes", async () => {
    await page
      .locator('.ap-explorer-marker[data-project="terra-serena"]')
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Terra Serena",
      exact: true,
    });
    await dialog.waitFor();
    assert.equal(await dialog.locator("iframe").count(), 1);
    assert.match(
      await dialog.getByRole("link", { name: /Abrir en Kuula/ }).getAttribute("href"),
      /\/share\/htQc3\/collection\/7HsBR$/,
    );
    assert.equal(
      await dialog.getByRole("combobox").locator("option").count(),
      6,
    );
    const frame = page.frameLocator(".project-tour-frame");
    await frame
      .getByRole("img", { name: "360 EXT 1.jpg", exact: true })
      .waitFor({ timeout: 45000 });
    await shot("tour-desktop");
    await dialog.getByRole("combobox").selectOption("5");
    await frame
      .getByRole("img", { name: "360 INT DORMITORIO-AJUSTE", exact: true })
      .waitFor({ timeout: 45000 });
    assert.match(await dialog.locator("iframe").getAttribute("src"), /L4pD3/);
    assert.match(
      await dialog.getByRole("link", { name: /Abrir en Kuula/ }).getAttribute("href"),
      /\/share\/L4pD3\/collection\/7HsBR$/,
    );
    for (const width of [320, 375, 768]) {
      await page.setViewportSize({ width, height: 812 });
      await fits(dialog);
      await fits(page.locator(".project-tour-controls"));
      await shot("tour-" + width);
    }
    await dialog.getByRole("button", { name: "Imágenes", exact: true }).click();
    assert.equal(await dialog.locator("iframe").count(), 0);
    await dialog.getByRole("button", { name: "Siguiente imagen" }).click();
    assert.match(
      await dialog.locator(".project-media-caption").innerText(),
      /^2\/5/,
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".project-tour-frame").count(), 0);
    assert.equal(await page.locator(".kuula-warmup-frame").count(), 1);
  });
  await check(
    "consent gates preparation; complete inquiry stays local",
    async () => {
      await page.setViewportSize({ width: 375, height: 812 });
      await go("/contacto/?lang=es&proyecto=terra-serena");
      const form = page.locator(".contact-form");
      for (const [name, value] of Object.entries({
        name: "Prueba local",
        email: "qa@example.com",
        phone: "+1 809 000 0000",
        country: "República Dominicana",
      }))
        await form.locator('[name="' + name + '"]').fill(value);
      await form.locator('[name="budget"]').selectOption({ index: 1 });
      await form.locator('[name="timeframe"]').selectOption({ index: 2 });
      assert.equal(await form.locator('[type="submit"]').isDisabled(), true);
      await form.dispatchEvent("submit");
      assert.equal(await page.getByRole("dialog").count(), 0);
      await form.locator('[name="consent"]').check();
      await form.locator('[type="submit"]').click();
      const dialog = page.getByRole("dialog", {
        name: "Tu consulta está preparada",
      });
      await dialog.waitFor();
      const summary = await dialog.locator("pre").innerText();
      for (const value of [
        "República Dominicana",
        "+1 809 000 0000",
        "3 y 6 meses",
        "US$150,000",
        "aceptadas",
      ])
        assert.ok(summary.includes(value));
      await shot("contact-summary-mobile");
      await page.keyboard.press("Escape");
      await page.locator(".footer-credit").scrollIntoViewIfNeeded();
      assert.equal(
        await page.locator(".footer-credit").getAttribute("href"),
        "https://www.instagram.com/viltrumtek/",
      );
      await shot("footer-mobile");
    },
  );
  await check("critical accessibility: filters and comparison", async () => {
    await go("/proyectos/?lang=es");
    await page
      .getByRole("button", { name: "Filtros avanzados", exact: true })
      .click();
    const filter = await new AxeBuilder({ page })
      .include(".catalog-filter-modal")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      filter.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
    );
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Comparativa de Proyectos", exact: true })
      .click();
    const comparison = await new AxeBuilder({ page })
      .include(".compare-modal")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      comparison.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
    );
  });
} finally {
  await writeFile(new URL("report.json", out), JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(
  JSON.stringify(
    {
      passed: report.passed.length,
      errors: report.errors,
      pageErrors: report.pageErrors,
    },
    null,
    2,
  ),
);
if (report.errors.length || report.pageErrors.length) process.exitCode = 1;
