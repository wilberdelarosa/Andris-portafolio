import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const imageDir = path.join(appRoot, "public", "derived");
const manifestPath = path.join(appRoot, "src", "lib", "generated-responsive-images.json");
const widths = [48, 96, 256, 320, 480, 640, 750, 960, 1440];
const manifest = {};
let generated = 0;
const allowedPng = new Set([
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
]);

for (const name of (await readdir(imageDir)).sort()) {
  if (/\.(?:jpe?g|png)$/i.test(name) && !allowedPng.has(name)) {
    throw new Error(`Publica ${name} como WebP; solo los iconos de instalación conservan PNG.`);
  }
  if (!name.endsWith(".webp") || /-w\d+\.webp$/.test(name)) continue;

  const sourcePath = path.join(imageDir, name);
  const sourceStats = await stat(sourcePath);
  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width) continue;

  const sourceUrl = `/derived/${name}`;
  const variants = [];
  for (const width of widths) {
    if (width >= metadata.width) break;
    const variantName = name.replace(/\.webp$/, `-w${width}.webp`);
    const variantPath = path.join(imageDir, variantName);
    let current = false;
    try {
      current = (await stat(variantPath)).mtimeMs >= sourceStats.mtimeMs;
    } catch {
      // The first build creates this derivative.
    }
    if (!current) {
      await sharp(sourcePath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(variantPath);
      generated += 1;
    }
    variants.push({ width, src: `/derived/${variantName}` });
  }
  manifest[sourceUrl] = { width: metadata.width, variants };
}

const output = `${JSON.stringify(manifest, null, 2)}\n`;
let existing = "";
try {
  existing = await readFile(manifestPath, "utf8");
} catch {
  // The initial preparation has not written a manifest yet.
}
if (existing !== output) await writeFile(manifestPath, output);
console.log(`Responsive WebP: ${Object.keys(manifest).length} sources, ${generated} derivatives generated.`);
