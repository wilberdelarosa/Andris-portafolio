/**
 * Genera el API estática v1 del portafolio en `public/api/v1/`.
 *
 * El sitio se publica como exportación estática (next.config.ts →
 * `output: "export"`), así que el API se materializa como JSON versionado en
 * el propio despliegue. Cuando existan credenciales de Supabase, las mismas
 * rutas podrán servirse dinámicamente desde el repositorio remoto sin cambiar
 * el contrato (`src/lib/cms/types.ts`).
 *
 * También copia las migraciones SQL de `supabase/migrations/` a
 * `public/cms/migrations/` para que el estudio `/admin` pueda descargarlas.
 *
 * Ejecutar con: node --experimental-strip-types scripts/generate-static-api.mjs
 */
import { mkdir, readdir, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPublishedProjects } from "../src/content/projects.ts";
import {
  toApiProjectDetail,
  toApiProjectSummary,
} from "../src/lib/cms/mappers.ts";
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

async function writeJson(file, data) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

const projects = getPublishedProjects();
const summaries = projects.map(toApiProjectSummary);

await writeJson(path.join(apiDir, "health.json"), {
  status: "ok",
  apiVersion: API_VERSION,
  schemaVersion: CMS_SCHEMA_VERSION,
  generatedAt,
  locales: ["es", "en", "fr"],
  projectCount: summaries.length,
  provider: "static",
});

await writeJson(path.join(apiDir, "projects.json"), {
  apiVersion: API_VERSION,
  generatedAt,
  count: summaries.length,
  projects: summaries,
});

for (const project of projects) {
  await writeJson(
    path.join(projectsDir, `${project.slug}.json`),
    toApiProjectDetail(project),
  );
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
  `API v1 generada: health.json, projects.json y ${projects.length} fichas en public/api/v1/`,
);
