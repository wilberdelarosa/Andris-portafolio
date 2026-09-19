import test from "node:test";
import assert from "node:assert/strict";
import { getPublishedProjects } from "../src/content/projects.ts";
import {
  toApiProjectDetail,
  toApiProjectSummary,
} from "../src/lib/cms/mappers.ts";
import { staticRepository } from "../src/lib/cms/repository.ts";

test("el API v1 expone un resumen por proyecto publicado", () => {
  const summaries = getPublishedProjects().map(toApiProjectSummary);
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
  const melcon = getPublishedProjects().find((p) => p.slug === "melcon-paradise");
  assert.ok(melcon);
  const detail = toApiProjectDetail(melcon);
  assert.equal(detail.price.status, "pending");
  assert.equal(detail.price.from, null);
  assert.ok(detail.gallery.length >= 6);
  assert.ok(detail.source.includes("ASSETS/projects"));
  // El detalle no incluye los enlaces de navegación del resumen.
  assert.equal("links" in detail, false);
});

test("el repositorio estático sirve listado, detalle y salud", async () => {
  const list = await staticRepository.listProjects();
  assert.equal(list.length, 3);
  const detail = await staticRepository.getProject("terra-serena");
  assert.equal(detail?.name, "Terra Serena");
  assert.equal(detail?.price.from, 120000);
  assert.equal(await staticRepository.getProject("no-existe"), null);
  const health = await staticRepository.health();
  assert.equal(health.status, "ok");
  assert.equal(health.provider, "static");
  assert.deepEqual(health.locales, ["es", "en", "fr"]);
});
