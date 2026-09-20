/**
 * Regla de mantenimiento: un cambio de lógica o de pantalla debe traer una
 * prueba automatizada, una verificación de navegador o una actualización del
 * plan de calidad. Se ejecuta en CI cuando GitHub conoce el commit base.
 */
import { execFileSync } from "node:child_process";

const baseRef = process.argv[2] || process.env.TEST_BASE_SHA;
if (!baseRef || /^0+$/.test(baseRef)) {
  console.log("SKIP test-update guard: no hay commit base para comparar.");
  process.exit(0);
}

let files;
try {
  files = execFileSync("git", ["diff", "--name-only", `${baseRef}...HEAD`], {
    encoding: "utf8",
  })
    .split(/\r?\n/)
    .filter(Boolean)
    .map((file) => file.replace(/\\/g, "/"));
} catch (error) {
  console.error("No se pudo comparar el cambio con el commit base.");
  throw error;
}

const productionChange = files.some((file) =>
  /(^|\/)src\/.*\.(?:ts|tsx)$/.test(file) &&
  !/\.d\.ts$/.test(file),
);
const testEvidence = files.some((file) =>
  /(^|\/)(tests\/.*\.test\.ts|scripts\/verify-.*\.mjs|docs\/quality\/|\.github\/workflows\/)/.test(file),
);

if (productionChange && !testEvidence) {
  console.error("Cambiaste código de producción sin actualizar una prueba o el plan de calidad.");
  console.error("Añade o modifica tests/*.test.ts, scripts/verify-*.mjs o docs/quality/.");
  process.exit(1);
}

console.log(
  productionChange
    ? "PASS test-update guard: el cambio de producción incluye evidencia de calidad."
    : "PASS test-update guard: no hay cambios de producción que requieran pruebas.",
);
