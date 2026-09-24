import test from "node:test";
import assert from "node:assert/strict";
import { testProjects } from "./fixtures/projects.ts";
import {
  toApiProjectDetail,
  toApiProjectSummary,
} from "../src/lib/cms/mappers.ts";
import { getContentRepository } from "../src/lib/cms/repository.ts";

test("el API v1 expone un resumen por proyecto publicado", () => {
  const summaries = testProjects.map(toApiProjectSummary);
  assert.equal(summaries.length, 3);
  for (const summary of summaries) {
    assert.ok(summary.slug);
    assert.ok(summary.name);
    assert.equal(summary.links.web, `/proyectos/${summary.slug}/`);
    assert.equal(summary.links.api, `/api/v1/projects/${summary.slug}.json`);
    assert.equal(summary.price.currency, "USD");
  }
});

test("el detalle del API conserva evidencia y nunca inventa precios", () => {
  const melcon = testProjects.find((p) => p.slug === "melcon-paradise");
  assert.ok(melcon);
  const detail = toApiProjectDetail(melcon);
  assert.equal(detail.price.status, "pending");
  assert.equal(detail.price.from, null);
  assert.ok(detail.gallery.length >= 6);
  assert.ok(detail.source.includes("ASSETS/projects"));
  // El detalle no incluye los enlaces de navegación del resumen.
  assert.equal("links" in detail, false);
});

test("el repositorio de contenido activo expone la interfaz completa", () => {
  const repository = getContentRepository();
  assert.equal(repository.provider, "supabase");
  assert.equal(typeof repository.listProjects, "function");
  assert.equal(typeof repository.getProject, "function");
  assert.equal(typeof repository.health, "function");
  const connection = repository.connection();
  assert.equal(connection.provider, "supabase");
  assert.equal(typeof connection.ready, "boolean");
});
