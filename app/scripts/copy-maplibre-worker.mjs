import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const source = new URL("../node_modules/maplibre-gl/dist/", import.meta.url);
const destination = new URL("../public/vendor/maplibre/", import.meta.url);

await mkdir(fileURLToPath(destination), { recursive: true });
await Promise.all(
  ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"].map((file) =>
    copyFile(fileURLToPath(new URL(file, source)), fileURLToPath(new URL(file, destination))),
  ),
);
