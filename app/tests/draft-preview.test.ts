import test from "node:test";
import assert from "node:assert/strict";
import { draftToProject } from "../src/lib/cms/draft-preview.ts";

test("la vista previa convierte un borrador en una ficha segura para la tarjeta", () => {
  const project = draftToProject({
    name: "Proyecto de prueba",
    location: "Punta Cana",
    heroImg: "/hero.webp",
    gallery1: "/gallery.webp",
    bedrooms: 2,
    areaMin: 80,
    areaMax: 105,
    mapCoords: "18.6201, -68.4562",
  });

  assert.equal(project.status, "draft");
  assert.equal(project.name, "Proyecto de prueba");
  assert.deepEqual(project.bedrooms, [2]);
  assert.equal(project.gallery.length, 2);
  assert.deepEqual(project.map.coordinates, [18.6201, -68.4562]);
});

test("la vista previa conserva un contrato válido ante datos incompletos o coordenadas inválidas", () => {
  const project = draftToProject({ mapCoords: "no-es-una-coordenada" });

  assert.equal(project.name, "Nombre del Proyecto");
  assert.equal(project.gallery.length, 1);
  assert.equal(project.map.coordinates, null);
  assert.equal(project.price.from, null);
  assert.equal(project.price.status, "pending");
});
