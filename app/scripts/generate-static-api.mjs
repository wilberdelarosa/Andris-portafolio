/**
 * Genera el API estática v1 del portafolio en `public/api/v1/`.
 *
 * El sitio se publica como exportación estática (next.config.ts →
 * `output: "export"`), así que el API se materializa como JSON versionado en
 * el propio despliegue. El contenido vive en Supabase: este script carga
 * `.env.local`/`.env` (Next lo hace por sí mismo, pero el prebuild corre como
 * proceso node independiente) y, si hay credenciales, vuelca el catálogo real
 * mediante el repositorio de contenido (`src/lib/cms/repository.ts`).
 * Sin credenciales o sin red se emite un API vacía pero válida (count 0), de
 * modo que el build nunca falle por causa externa; la interfaz pública lee
 * Supabase en el navegador y no depende de estos archivos.
 *
 * También copia las migraciones SQL de `supabase/migrations/` a
 * `public/cms/migrations/` para que el estudio `/admin` pueda descargarlas.
 *
 * Ejecutar con: node --experimental-strip-types scripts/generate-static-api.mjs
 */
import { mkdir, readdir, readFile, copyFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getContentRepository,
  isSupabaseConfigured,
} from "../src/lib/cms/repository.ts";
import {
  API_VERSION,
  CMS_SCHEMA_VERSION,
} from "../src/lib/cms/types.ts";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(appRoot, "public", "api", "v1");
const projectsDir = path.join(apiDir, "projects");
const migrationsSource = path.join(appRoot, "supabase", "migrations");
const migrationsTarget = path.join(appRoot, "public", "cms", "migrations");

const generatedAt = new Date().toISOString();

/**
 * Carga `KEY=VALUE` de un archivo .env sin pisar variables ya definidas en el
 * entorno del proceso. Tolera comillas, comentarios y espacios laterales.
 */
async function loadEnvFile(file) {
  let raw;
  try {
    raw = await readFile(file, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || line.trim().startsWith("#")) continue;
    const [, key, valueRaw] = match;
    if (process.env[key] !== undefined) continue;
    const value = valueRaw.trim().replace(/^(['"])(.*)\1$/, "$2");
    process.env[key] = value;
  }
}

await loadEnvFile(path.join(appRoot, ".env.local"));
await loadEnvFile(path.join(appRoot, ".env"));

async function writeJson(file, data) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/** @type {import("../src/lib/cms/types.ts").ApiProjectSummary[]} */
let summaries = [];
/** @type {import("../src/lib/cms/types.ts").ApiProjectDetail[]} */
let details = [];

if (isSupabaseConfigured()) {
  try {
    const repository = getContentRepository();
    summaries = await repository.listProjects();
    const fetched = await Promise.all(
      summaries.map((summary) => repository.getProject(summary.slug)),
    );
    details = fetched.filter((detail) => detail !== null);
  } catch (error) {
    console.warn(
      `ADVERTENCIA: no se pudo leer el catálogo desde Supabase (${error instanceof Error ? error.message : error}). Se genera el API vacía.`,
    );
    summaries = [];
    details = [];
  }
} else {
  console.warn(
    "ADVERTENCIA: sin credenciales de Supabase en el entorno de build; se genera el API vacía.",
  );
}

await writeJson(path.join(apiDir, "health.json"), {
  status: "ok",
  apiVersion: API_VERSION,
  schemaVersion: CMS_SCHEMA_VERSION,
  generatedAt,
  locales: ["es", "en", "fr"],
  projectCount: summaries.length,
  provider: "supabase",
});

await writeJson(path.join(apiDir, "projects.json"), {
  apiVersion: API_VERSION,
  generatedAt,
  count: summaries.length,
  projects: summaries,
});

// Limpia fichas de proyectos anteriores para no servir slugs obsoletos.
await rm(projectsDir, { recursive: true, force: true });
for (const detail of details) {
  await writeJson(path.join(projectsDir, `${detail.slug}.json`), detail);
}

// Migraciones SQL descargables desde el estudio CMS.
try {
  const files = (await readdir(migrationsSource)).filter((name) =>
    name.endsWith(".sql"),
  );
  await mkdir(migrationsTarget, { recursive: true });
  for (const file of files) {
    await copyFile(
      path.join(migrationsSource, file),
      path.join(migrationsTarget, file),
    );
  }
  if (files.length) {
    console.log(`Migraciones copiadas a public/cms/migrations: ${files.join(", ")}`);
  }
  await copyFile(
    path.join(appRoot, "supabase", "seed.sql"),
    path.join(appRoot, "public", "cms", "seed.sql"),
  );
  console.log("Seed copiado a public/cms/seed.sql");
} catch {
  console.log("Sin carpeta supabase/migrations todavía; se omite la copia.");
}

console.log(
  `API v1 generada: health.json, projects.json y ${details.length} fichas en public/api/v1/`,
);
