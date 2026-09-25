import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const reportDir = path.join(root, "output", "lighthouse", "ci");
const manifest = JSON.parse(await readFile(path.join(reportDir, "manifest.json"), "utf8"));
const reports = manifest.filter((item) => item.isRepresentativeRun);
const maxImageWaste = 200 * 1024;
let failures = 0;

if (reports.length !== 2) {
  throw new Error(`Se esperaban 2 informes Lighthouse y llegaron ${reports.length}.`);
}

for (const item of reports) {
  const report = JSON.parse(await readFile(item.jsonPath, "utf8"));
  const imageWaste = report.audits["uses-responsive-images"].details?.overallSavingsBytes ?? 0;
  const modernFormats = report.audits["modern-image-formats"].score;
  const score = Math.round(report.categories.performance.score * 100);
  const lcp = Math.round(report.audits["largest-contentful-paint"].numericValue);
  console.log(`${new URL(item.url).pathname}: rendimiento ${score}, LCP ${lcp} ms, imágenes sobrantes ${Math.round(imageWaste / 1024)} KiB`);
  if (modernFormats !== 1 || imageWaste > maxImageWaste) {
    failures += 1;
    console.error(`Presupuesto de imágenes incumplido en ${item.url}: WebP=${modernFormats}, límite=${maxImageWaste / 1024} KiB.`);
  }
}

if (failures) process.exitCode = 1;
