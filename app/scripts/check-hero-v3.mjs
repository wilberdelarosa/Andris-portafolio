import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";

// Focused, standalone verification. Opens local pages and never sends a message.
const baseURL = process.env.BASE_URL || "http://localhost:3001";
const checkFilter = process.env.HERO_CHECK || "";
const output = fileURLToPath(
  new URL("../../output/playwright/hero-v3/", import.meta.url),
);
const report = {
  baseURL,
  startedAt: new Date().toISOString(),
  checks: [],
  screenshots: [],
};
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "chrome",
  headless: true,
});

async function verify(name, action) {
  if (checkFilter && !name.toLowerCase().includes(checkFilter.toLowerCase()))
    return;
  process.stdout.write(`${name} ... `);
  try {
    report.checks.push({ name, passed: true, details: await action() });
    process.stdout.write("OK\n");
  } catch (error) {
    report.checks.push({ name, passed: false, error: error.message });
    process.stdout.write(`FAIL: ${error.message}\n`);
  }
}

async function openHero({
  width = 1440,
  locale = "es",
  theme = "light",
  reduced = false,
} = {}) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    colorScheme: theme,
    reducedMotion: reduced ? "reduce" : "no-preference",
    serviceWorkers: "allow",
  });
  await context.addInitScript(
    (appearance) => localStorage.setItem("ap-theme", appearance),
    theme,
  );
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const response = await page.goto(`${baseURL}/?lang=${locale}`, {
    waitUntil: "domcontentloaded",
  });
  assert.equal(response.status(), 200);
  await page.locator("#hero-name").waitFor();
  await page.waitForFunction(
    ({ locale, theme }) =>
      document.documentElement.lang === locale &&
      document.documentElement.dataset.theme === theme,
    { locale, theme },
  );
  await settleHero(page);
  return { context, page, errors };
}

async function settleHero(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const hero = document.querySelector("#inicio");
    await Promise.all(
      [...hero.querySelectorAll("img")].map(async (image) => {
        image.loading = "eager";
        await image.decode();
      }),
    );
    await Promise.all(
      hero
        .getAnimations({ subtree: true })
        .filter((animation) =>
          Number.isFinite(animation.effect?.getComputedTiming().endTime),
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
}

async function capture(page, filename) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await settleHero(page);
  await page.screenshot({
    path: path.join(output, filename),
    caret: "initial",
  });
  report.screenshots.push(filename);
}

async function layout(page) {
  const details = await page.evaluate(() => {
    const hero = document.querySelector("#inicio");
    const portrait = hero.querySelector('img[src*="andris-suit"]');
    const canvas = document.createElement("canvas");
    canvas.width = portrait.naturalWidth;
    canvas.height = portrait.naturalHeight;
    const context = canvas.getContext("2d");
    context.drawImage(portrait, 0, 0);
    return {
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      h1: hero.querySelectorAll("h1").length,
      images: [...hero.querySelectorAll("img")].map((image) => ({
        source: image.currentSrc,
        loaded: image.complete && image.naturalWidth > 0,
        width: image.naturalWidth,
        height: image.naturalHeight,
      })),
      portraitCornerAlpha: context.getImageData(0, 0, 1, 1).data[3],
      anchors: [...hero.querySelectorAll('a[href^="#"]')].map((link) => ({
        href: link.getAttribute("href"),
        targetExists: Boolean(document.getElementById(link.hash.slice(1))),
        text: link.textContent.trim() || link.getAttribute("aria-label"),
      })),
      nameText: document.querySelector("#hero-name").textContent,
    };
  });
  assert.ok(
    details.documentWidth <= details.viewport,
    `Horizontal overflow: ${details.documentWidth} / ${details.viewport}`,
  );
  assert.equal(details.h1, 1);
  assert.ok(
    details.images.every((image) => image.loaded),
    "A hero image has not loaded",
  );
  assert.equal(
    details.portraitCornerAlpha,
    0,
    "The portrait must retain real transparency",
  );
  assert.ok(
    details.anchors.every((anchor) => anchor.targetExists),
    "A hero CTA targets a missing section",
  );
  return details;
}

async function portraitTranslation(page) {
  return page.locator('#inicio img[src*="andris-suit"]').evaluate((image) => {
    const matrix = new DOMMatrixReadOnly(
      getComputedStyle(image.parentElement.parentElement).transform,
    );
    return { x: matrix.m41, y: matrix.m42 };
  });
}

try {
  // Short bounded startup retries permit the production server to finish opening.
  for (let attempt = 0; attempt < 12; attempt++) {
    try {
      const response = await fetch(`${baseURL}/api/v1/health`, {
        signal: AbortSignal.timeout(2500),
      });
      if (response.ok) break;
    } catch {
      /* Server can still be starting. */
    }
    if (attempt === 11)
      throw new Error("Production server unavailable after bounded retries");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const variants = [
    { width: 1440 },
    { width: 375 },
    { width: 768 },
    { width: 320 },
    { width: 375, locale: "fr" },
    { width: 1440, theme: "dark" },
    { width: 375, theme: "dark" },
  ];
  for (const variant of variants) {
    const name = `${variant.locale || "es"}-${variant.theme || "light"}-${variant.width}`;
    await verify(`Hero ${name}`, async () => {
      const { context, page, errors } = await openHero(variant);
      try {
        const details = await layout(page);
        await capture(page, `${name}.png`);
        assert.deepEqual(errors, [], "Browser console or execution errors");
        return details;
      } finally {
        await context.close();
      }
    });
  }

  for (const theme of ["light", "dark"]) {
    await verify(`Axe hero ${theme}`, async () => {
      const { context, page } = await openHero({ theme });
      try {
        const results = await new AxeBuilder({ page })
          .include("#inicio")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        const violations = results.violations.map(
          ({ id, impact, description, nodes }) => ({
            id,
            impact,
            description,
            nodes: nodes.map(({ target, failureSummary }) => ({
              target,
              failureSummary,
            })),
          }),
        );
        assert.deepEqual(violations, [], JSON.stringify(violations));
        return {
          violations,
          passes: results.passes.length,
          incompleteRules: results.incomplete.map(({ id }) => id),
        };
      } finally {
        await context.close();
      }
    });
  }

  await verify("Desktop pointer parallax and reset", async () => {
    const { context, page } = await openHero();
    try {
      const before = await portraitTranslation(page);
      await page.mouse.move(120, 430);
      await page.waitForFunction(() => {
        const image = document.querySelector('#inicio img[src*="andris-suit"]');
        return (
          Math.abs(
            new DOMMatrixReadOnly(
              getComputedStyle(image.parentElement.parentElement).transform,
            ).m41,
          ) > 1
        );
      });
      const moved = await portraitTranslation(page);
      await page.mouse.move(0, 0);
      await page.waitForFunction(() => {
        const image = document.querySelector('#inicio img[src*="andris-suit"]');
        const matrix = new DOMMatrixReadOnly(
          getComputedStyle(image.parentElement.parentElement).transform,
        );
        return Math.abs(matrix.m41) < 0.05 && Math.abs(matrix.m42) < 0.05;
      });
      return { before, moved, reset: await portraitTranslation(page) };
    } finally {
      await context.close();
    }
  });

  await verify(
    "Reduced motion disables entrance and pointer movement",
    async () => {
      const { context, page } = await openHero({ reduced: true });
      try {
        const animations = await page.locator("#inicio").evaluate((hero) =>
          [...hero.querySelectorAll("*")]
            .map((element) => ({
              name: getComputedStyle(element).animationName,
              duration: getComputedStyle(element).animationDuration,
            }))
            .filter(
              (animation) =>
                animation.name !== "none" &&
                parseFloat(animation.duration) > 0.001,
            ),
        );
        assert.deepEqual(
          animations,
          [],
          "Motion reduction leaves entrance animations active",
        );
        await page.mouse.move(120, 430);
        await page.waitForTimeout(400);
        const translation = await portraitTranslation(page);
        assert.deepEqual(translation, { x: 0, y: 0 });
        await capture(page, "es-light-reduced-motion-1440.png");
        return {
          activeAnimations: animations,
          pointerTranslation: translation,
        };
      } finally {
        await context.close();
      }
    },
  );

  await verify(
    "PWA warm reload offline keeps hero and transparent portrait",
    async () => {
      const { context, page } = await openHero({ width: 375 });
      try {
        await page.evaluate(() => navigator.serviceWorker.ready);
        await page.waitForFunction(() =>
          Boolean(navigator.serviceWorker.controller),
        );
        await page.reload({ waitUntil: "domcontentloaded" });
        await settleHero(page);
        // Observe real cache population; do not write or fake offline resources.
        await page.waitForFunction(async () => {
          const cacheNames = await caches.keys();
          const pageCached = await caches.match(location.href, {
            ignoreVary: true,
          });
          const portraitCached = await caches.match(
            new URL("/derived/andris-suit.webp", location.origin).href,
          );
          return cacheNames.length > 0 && pageCached && portraitCached;
        });
        await context.setOffline(true);
        const response = await page.reload({ waitUntil: "domcontentloaded" });
        await page.locator("#hero-name").waitFor();
        await settleHero(page);
        const details = await layout(page);
        // Chromium can reset navigator.onLine after a SW navigation despite
        // Playwright offline emulation. Verify real network failure instead.
        const network = await page.evaluate(async () => {
          try {
            await fetch("/api/v1/health", { cache: "no-store" });
            return { requestFailed: false, navigatorOnline: navigator.onLine };
          } catch {
            return { requestFailed: true, navigatorOnline: navigator.onLine };
          }
        });
        assert.ok(
          network.requestFailed,
          "The uncached health request must fail offline",
        );
        assert.ok(
          response.fromServiceWorker(),
          "The offline document must come from the service worker",
        );
        await capture(page, "es-light-offline-375.png");
        return {
          offline: true,
          network,
          documentFromServiceWorker: response.fromServiceWorker(),
          ...details,
          caches: await page.evaluate(() => caches.keys()),
        };
      } finally {
        await context.setOffline(false);
        await context.close();
      }
    },
  );
} catch (error) {
  report.checks.push({
    name: "Browser setup",
    passed: false,
    error: error.message,
  });
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  report.passed =
    report.checks.length > 0 && report.checks.every((check) => check.passed);
  await writeFile(
    path.join(
      output,
      checkFilter
        ? `report-${checkFilter.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}.json`
        : "report.json",
    ),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(
    `${report.passed ? "PASS" : "FAIL"} ${report.checks.filter((check) => check.passed).length}/${report.checks.length}: ${output}`,
  );
  if (!report.passed) process.exitCode = 1;
}
