/* eslint-disable @typescript-eslint/no-require-imports -- Lighthouse loads this CJS config directly. */
const fs = require("node:fs");

const chromePath = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
].find((candidate) => candidate && fs.existsSync(candidate));

module.exports = {
  ci: {
    collect: {
      url: [
        "http://127.0.0.1:3012/?lang=es",
        "http://127.0.0.1:3012/proyectos/?lang=es",
      ],
      startServerCommand: "node scripts/serve-for-test.mjs",
      startServerReadyPattern: "Static test server running",
      puppeteerScript: "scripts/lhci-browser.cjs",
      chromePath,
      puppeteerLaunchOptions: {
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      },
      numberOfRuns: 2,
      settings: { onlyCategories: ["performance"] },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.55 }],
        "modern-image-formats": ["error", { minScore: 1 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "../output/lighthouse/ci",
    },
  },
};
