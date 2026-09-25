import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

// Standalone browser checks: no test runner, production data writes or messages.
const baseURL = new URL(process.env.BASE_URL || "http://localhost:3000");
const appRoot = fileURLToPath(new URL("../", import.meta.url));
const output = path.resolve(appRoot, "../output/playwright/browser-checks");
const widths = [320, 375, 768, 1440];
const routes = [
  { name: "home", pathname: "/" },
  { name: "melcon", pathname: "/proyectos/melcon-paradise" },
  { name: "projects", pathname: "/proyectos" },
  { name: "map", pathname: "/mapa" },
  { name: "about", pathname: "/sobre-mi" },
  { name: "contact", pathname: "/contacto" },
  { name: "calculator", pathname: "/calculadora" },
  { name: "terra", pathname: "/proyectos/terra-serena" },
  { name: "beach", pathname: "/proyectos/the-beach-at-punta-cana-city-place" },
];
const report = {
  baseURL: baseURL.href,
  startedAt: new Date().toISOString(),
  checks: [],
  screenshots: [],
  consoleErrors: [],
  resourceErrors: [],
  pageErrors: [],
};
let browser;
let page;
let expected404 = false;

async function capture(name) {
  const filename = `${name}.png`;
  await page.evaluate(async () => {
    for (const animation of document.getAnimations()) {
      if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) {
        try {
          animation.finish();
        } catch {
          /* An idle animation has nothing to finish. */
        }
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  // Chrome can freeze a full-page rasterization when a live WebGL map is part
  // of the document. The viewport still verifies the rendered map; pages
  // without it retain the full-page evidence used by the visual audit.
  const hasLiveMap = (await page.locator(".maplibregl-canvas").count()) > 0;
  await page.screenshot({
    path: path.join(output, filename),
    fullPage: !hasLiveMap,
    caret: "initial",
  });
  report.screenshots.push(filename);
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
    if (page && !page.isClosed()) {
      await capture(`error-${report.checks.length}`).catch(() => {});
      await page.keyboard.press("Escape").catch(() => {});
    }
  }
}

async function navigate(pathname, locale = "es") {
  const url = new URL(pathname, baseURL);
  url.searchParams.set("lang", locale);
  const response = await page.goto(url.href, { waitUntil: "domcontentloaded" });
  assert.ok(response?.ok(), `HTTP ${response?.status()} en ${url.pathname}`);
  await page.locator("main h1").waitFor();
  await page.waitForFunction(
    (lang) => document.documentElement.lang === lang,
    locale,
  );
  await page.waitForFunction(
    () => document.documentElement.dataset.experienceReady === "true",
  );
  await page.evaluate(() => document.fonts.ready);
  return response;
}

async function revealAndCheckImages() {
  // Scroll through the actual page so native lazy-loading and reveals run.
  await page.evaluate(async () => {
    const step = Math.max(250, Math.floor(innerHeight * 0.75));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    }
  });
  await page.waitForFunction(
    () => {
      const rendered = [...document.images].filter((image) => {
        const style = getComputedStyle(image);
        return (
          image.currentSrc &&
          image.getClientRects().length &&
          style.visibility !== "hidden"
        );
      });
      return (
        rendered.length > 0 &&
        rendered.every((image) => image.naturalWidth > 0 && image.naturalHeight > 0)
      );
    },
    undefined,
    { timeout: 20000 },
  );
  const images = await page.evaluate(() =>
    [...document.images]
      .filter(
        (image) =>
          image.currentSrc &&
          image.getClientRects().length &&
          getComputedStyle(image).visibility !== "hidden",
      )
      .map((image) => ({
        src: image.currentSrc,
        width: image.naturalWidth,
        height: image.naturalHeight,
      })),
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  return images;
}

async function layoutDetails() {
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    h1: document.querySelectorAll("main h1").length,
    main: document.querySelectorAll("main").length,
    overflow: [...document.querySelectorAll("body *")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1)
        );
      })
      .slice(0, 12)
      .map(
        (element) => `${element.tagName.toLowerCase()}.${element.className}`,
      ),
  }));
  assert.equal(layout.main, 1, "Debe haber un único main");
  assert.equal(layout.h1, 1, "Debe haber un único h1 principal");
  assert.ok(
    layout.documentWidth <= layout.viewport + 1,
    `Overflow ${layout.documentWidth}px / ${layout.viewport}px: ${layout.overflow.join(", ")}`,
  );
  return layout;
}

async function checkGallery(route) {
  await navigate(route.pathname);
  const opener =
    route.name === "home"
      ? page.locator(".featured-gallery-link")
      : page.locator(".detail-gallery > button").first();
  await opener.click();
  // Public project names can be globally hidden by the owner, so assert the
  // accessible gallery dialog itself instead of its private project label.
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await dialog.getByRole("heading").waitFor();
  const stage = dialog.locator(".gallery-stage");
  const initialSource = await stage.locator("img").getAttribute("src");
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction((previous) => {
    const image = document.querySelector(".gallery-stage img");
    return (
      image?.getAttribute("src") !== previous &&
      image?.complete &&
      image?.naturalWidth > 0
    );
  }, initialSource);
  const nextSource = await stage.locator("img").getAttribute("src");
  assert.notEqual(
    nextSource,
    initialSource,
    "La flecha debe cambiar la imagen real",
  );
  await capture(`gallery-${route.name}-375`);
  await page.keyboard.press("ArrowLeft");
  await page.waitForFunction(
    (source) =>
      document.querySelector(".gallery-stage img")?.getAttribute("src") ===
      source,
    initialSource,
  );
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  return { keyboard: "ArrowRight / ArrowLeft / Escape", imagesChanged: true };
}

async function checkCalculator() {
  await navigate("/calculadora");
  const calculator = page.locator("#inversion");
  await calculator.locator("#property-price").fill("180000");
  await calculator.locator("#months-value").fill("36");
  await calculator.locator(".percentage-controls input").nth(0).fill("20");
  await calculator.locator(".percentage-controls input").nth(1).fill("30");
  const expected = new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(1500);
  await page.waitForFunction(
    (amount) =>
      document.querySelector(".monthly-amount")?.textContent === amount,
    expected,
  );
  const values = await calculator
    .locator(".payment-breakdown strong")
    .allTextContents();
  assert.equal(
    values.length,
    3,
    "Deben existir pagos a firma, construcción y entrega",
  );
  const actualValues = values.map((value) =>
    Number(value.replace(/[^0-9.]/g, "")),
  );
  assert.deepEqual(
    actualValues,
    [36000, 54000, 90000],
    "La distribución debe sumar el valor de la propiedad",
  );
  await calculator.locator(".percentage-controls input").nth(0).fill("90");
  await calculator.locator(".calculator-error").waitFor();
  assert.equal(
    await calculator.locator(".monthly-amount").count(),
    0,
    "Un plan inválido no debe conservar resultados previos",
  );
  await calculator
    .getByRole("button", { name: "Restablecer", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector("#property-price")?.value === "150000" &&
      !document.querySelector(".calculator-error"),
  );
  return {
    monthly: expected,
    breakdown: actualValues,
    invalidPercentagesRejected: true,
    reset: true,
  };
}

async function checkContactPreview() {
  await navigate("/contacto?proyecto=terra-serena");
  const form = page.locator(".contact-form");
  assert.equal(await form.locator('button[type="submit"]').isDisabled(), true);
  assert.equal(
    await form.evaluate((element) => element.checkValidity()),
    false,
    "El formulario vacío debe ser inválido",
  );
  assert.equal(await page.getByRole("dialog").count(), 0);
  await form.locator('select[name="project"] option').nth(1).waitFor({ state: "attached" });
  await page.waitForFunction(
    () => {
      const select = document.querySelector('select[name="project"]');
      return Boolean(select?.value && [...select.options].some((option) => option.value === select.value));
    },
  );
  const selectedProjectLabel = await form.locator('select[name="project"]').inputValue();
  assert.ok(selectedProjectLabel, "La ficha solicitada debe estar preseleccionada");
  await form.locator('input[name="name"]').fill("Prueba navegador");
  await form.locator("details.contact-more summary").click();
  await form.locator('input[name="email"]').fill("qa@example.com");
  await form.locator('input[name="phone"]').fill("+1 809 000 0000");
  const country = form.getByRole("combobox", { name: /País de residencia/i });
  await country.fill("República Dominicana");
  await form.getByRole("option", { name: "República Dominicana" }).click();
  assert.equal(await form.locator('input[type="hidden"][name="country"]').inputValue(), "República Dominicana");
  await form.locator('select[name="budget"]').selectOption({ index: 1 });
  await form.locator('select[name="timeframe"]').selectOption({ index: 1 });
  await form
    .locator('textarea[name="message"]')
    .fill("Consulta automatizada local. No enviar.");
  await form.locator('input[type="checkbox"]').check();
  const interceptedLeadWrites = [];
  const blockExternalMutations = async (route) => {
    const request = route.request();
    if (["GET", "HEAD", "OPTIONS"].includes(request.method())) {
      await route.continue();
      return;
    }
    const url = new URL(request.url());
    if (request.method() === "POST" && url.pathname.endsWith("/rest/v1/leads")) {
      interceptedLeadWrites.push(JSON.parse(request.postData() || "{}"));
      await route.fulfill({ status: 201, body: "" });
      return;
    }
    await route.abort("blockedbyclient");
  };
  await page.route("**/*", blockExternalMutations);
  try {
    await form.locator('button[type="submit"]').click();
    const dialog = page.getByRole("dialog", {
      name: "Tu consulta está preparada",
      exact: true,
    });
    await dialog.waitFor();
    const summary = await dialog.locator("pre").textContent();
    assert.ok(
      summary.includes("Prueba navegador") &&
        summary.includes("qa@example.com") && summary.includes(selectedProjectLabel),
    );
    assert.ok((await dialog.textContent()).includes("Aún no se ha enviado"));
    const whatsapp = await dialog
      .locator('a[href^="https://wa.me/"]')
      .getAttribute("href");
    const email = await dialog
      .locator('a[href^="mailto:"]')
      .getAttribute("href");
    assert.ok(
      new URL(whatsapp).searchParams
        .get("text")
        .includes("Consulta automatizada local"),
    );
    assert.ok(email.includes("body=") && email.includes("subject="));
    await capture("contact-preview-375");
    assert.equal(interceptedLeadWrites.length, 1, "El lead debe guardarse en el CMS");
    assert.equal(interceptedLeadWrites[0].email, "qa@example.com");
    assert.match(
      interceptedLeadWrites[0].project_id,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    return {
      nativeValidation: true,
      preview: true,
      externalChannelsNotOpened: true,
      leadStoredByLocalStub: true,
      externalMutationsBlocked: true,
    };
  } finally {
    await page.unroute("**/*", blockExternalMutations);
  }
}

async function checkLanguages() {
  await navigate("/");
  const roles = {
    en: "Real estate advisor",
    fr: "Conseiller immobilier",
    es: "Asesor inmobiliario",
  };
  const languageNames = { en: "English", fr: "Français", es: "Español" };
  for (const [locale, role] of Object.entries(roles)) {
    await page.locator(".language-switch-trigger").click();
    await page
      .locator(".language-switch-flyout")
      .getByRole("button", { name: new RegExp(languageNames[locale]) })
      .click();
    await page.waitForFunction(
      (lang) => document.documentElement.lang === lang,
      locale,
    );
    assert.equal(
      (await page.locator(".brand-copy small").textContent()).trim(),
      role,
    );
    assert.equal(new URL(page.url()).searchParams.get("lang"), locale);
  }
  return {
    languages: ["es", "en", "fr"],
    changedThroughUI: true,
    urlAndDocumentLanguage: true,
  };
}

await mkdir(output, { recursive: true });
try {
  browser = await chromium.launch({
    headless: process.env.HEADED !== "1",
    channel: process.env.BROWSER_CHANNEL || "chrome",
    ...(process.env.BROWSER_EXECUTABLE
      ? { executablePath: process.env.BROWSER_EXECUTABLE }
      : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
    colorScheme: "light",
    locale: "es-DO",
    serviceWorkers: "allow",
  });
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(45000);
  page.on("pageerror", (error) => report.pageErrors.push(error.message));
  page.on("response", (response) => {
    const url = response.url();
    const resourceUrl = new URL(url);
    const isExpectedNotFoundDocument =
      response.status() === 404 &&
      resourceUrl.origin === baseURL.origin &&
      resourceUrl.pathname.replace(/\/$/, "") === "/proyectos/no-existe";
    if (response.status() === 404 && !isExpectedNotFoundDocument)
      report.resourceErrors.push(`404 ${url}`);
  });
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !(expected404 && message.text().includes("404")) &&
      !message.text().includes("Failed to load resource: the server responded with a status of 404")
    )
      report.consoleErrors.push(message.text());
  });
  for (const route of routes) {
    for (const width of widths) {
      await check(`${route.pathname} @ ${width}px`, async () => {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
        await navigate(route.pathname);
        const images = await revealAndCheckImages();
        const layout = await layoutDetails();
        await capture(`${route.name}-${width}`);
        return { layout, loadedImages: images.length };
      });
    }
  }
  await page.setViewportSize({ width: 375, height: 844 });
  await check("Galería Melcon", () => checkGallery(routes[1]));
  await check(
    "Simulador: importes, estado inválido y recuperación",
    checkCalculator,
  );
  await check(
    "Formulario: validación y resumen sin envío",
    checkContactPreview,
  );
  await check("Idiomas ES / EN / FR desde la interfaz", checkLanguages);
  await check("Hero solicita solo el WebP del dispositivo", async () => {
    const selected = {};
    for (const [name, width, expected, excluded] of [
      ["mobile", 375, "portrait", "wide"],
      ["desktop", 1440, "wide", "portrait"],
    ]) {
      const testContext = await browser.newContext({ viewport: { width, height: 900 } });
      const testPage = await testContext.newPage();
      const requested = [];
      testPage.on("request", (request) => {
        if (request.url().includes("/derived/hero-coast-")) requested.push(request.url());
      });
      try {
        await testPage.goto(new URL("/", baseURL).href, { waitUntil: "load" });
        const source = await testPage.locator('picture img[src*="hero-coast"]').evaluate((image) => image.currentSrc);
        assert.match(source, new RegExp(`hero-coast-${expected}.*\\.webp$`));
        assert.equal(requested.some((url) => url.includes(`hero-coast-${excluded}`)), false);
        selected[name] = new URL(source).pathname;
      } finally {
        await testContext.close();
      }
    }
    return selected;
  });
  await check("Ruta inexistente devuelve 404", async () => {
    expected404 = true;
    try {
      const response = await page.goto(
        new URL("/proyectos/no-existe", baseURL).href,
        { waitUntil: "domcontentloaded" },
      );
      assert.equal(response?.status(), 404);
      // El export estático solo contiene fichas de slugs conocidos. Para un
      // slug dinámico inexistente, GPT Sites entrega su 404 HTTP sin ejecutar
      // la página not-found de Next; el código de estado es el contrato que
      // importa y evita aceptar por error una ficha vacía con estado 200.
      return { status: 404 };
    } finally {
      expected404 = false;
    }
  });
  await check("Consola y errores de ejecución", async () => {
    assert.deepEqual(report.pageErrors, [], "Hay excepciones de JavaScript");
    assert.deepEqual(report.consoleErrors, [], "Hay errores de consola");
    assert.deepEqual(report.resourceErrors, [], "Hay recursos 404 inesperados");
    return { errors: 0 };
  });
} catch (error) {
  report.checks.push({
    name: "Preparación del navegador",
    passed: false,
    error: error.message,
  });
  console.error(`No se pudo completar la verificación: ${error.message}`);
  console.error(
    "Inicia la app, comprueba BASE_URL y usa Chrome instalado o BROWSER_CHANNEL=chromium con su navegador instalado.",
  );
} finally {
  await browser?.close();
  report.finishedAt = new Date().toISOString();
  report.passed =
    report.checks.length > 0 && report.checks.every((item) => item.passed);
  await writeFile(
    path.join(output, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(
    `${report.passed ? "PASS" : "FAIL"}: ${report.checks.filter((item) => item.passed).length}/${report.checks.length} comprobaciones. ${output}`,
  );
  if (!report.passed) process.exitCode = 1;
}
