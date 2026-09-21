import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'app/src/components/admin/diagnostics-panel.tsx');
let content = fs.readFileSync(file, 'utf8');

const newCheck = `
  // --- Amenities (migracion 0001 actualizada) -------------------------------
  try {
    const response = await cmsFetch("rest/v1/amenities?select=id,image_url,is_template&limit=1");
    if (response.ok) {
      checks.push({
        id: "amenities_schema",
        label: "Esquema de Amenidades (Plantillas)",
        state: "ok",
        detail: "La tabla 'amenities' existe y cuenta con los campos para imágenes y plantillas interactivas.",
      });
    } else {
      checks.push({
        id: "amenities_schema",
        label: "Esquema de Amenidades (Plantillas)",
        state: "fail",
        detail: \`Supabase respondió \${response.status}. Faltan las columnas image_url o is_template.\`,
        fix: "Aplica las modificaciones recientes en 0001_cms_core.sql relacionadas con amenidades.",
      });
    }
  } catch (error) {
    checks.push({
      id: "amenities_schema",
      label: "Esquema de Amenidades",
      state: "fail",
      detail: describeError(error),
    });
  }

  // --- MapLibre / OpenFreeMap -------------------------------
  try {
    const start = performance.now();
    const resp = await fetch("https://tiles.openfreemap.org/planet");
    const ms = Math.round(performance.now() - start);
    checks.push({
      id: "maps_api",
      label: "Servidor de Mapas (OpenFreeMap)",
      state: resp.ok ? "ok" : "warn",
      detail: resp.ok ? \`Conexión establecida exitosamente (\${ms}ms).\` : \`El servidor respondió con \${resp.status}.\`,
    });
  } catch (error) {
    checks.push({
      id: "maps_api",
      label: "Servidor de Mapas (OpenFreeMap)",
      state: "warn",
      detail: "No se pudo conectar a OpenFreeMap. Los mapas podrían no renderizarse correctamente.",
    });
  }
`;

content = content.replace('// --- Permiso de edicion', newCheck + '\n  // --- Permiso de edicion');

fs.writeFileSync(file, content, 'utf8');
console.log("Updated diagnostics-panel.tsx");
