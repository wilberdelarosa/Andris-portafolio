import test from "node:test";
import assert from "node:assert/strict";
import { getPublishedProjects } from "../src/content/projects.ts";
import {
  emptyCatalogFilters,
  matchesCatalog,
  type CatalogFilters,
} from "../src/lib/catalog-filtering.ts";
import { projectTours } from "../src/content/project-discovery.ts";

const projects = getPublishedProjects();
const matching = (patch: Partial<CatalogFilters>) =>
  projects
    .filter((p) => matchesCatalog(p, { ...emptyCatalogFilters, ...patch }))
    .map((p) => p.slug);
test("only documented 2028 deliveries match; unsupported years stay empty", () => {
  assert.deepEqual(matching({ delivery: "2028" }), [
    "melcon-paradise",
    "terra-serena",
  ]);
  for (const delivery of ["2026", "2027", "2029", "2030"])
    assert.deepEqual(matching({ delivery }), []);
});
test("ready units match The Beach without inventing an exact delivery year", () => {
  assert.deepEqual(matching({ delivery: "ready" }), [
    "the-beach-at-punta-cana-city-place",
  ]);
  assert.deepEqual(matching({ delivery: "2028", features: ["tennis"] }), []);
});
test("golf access is not golf proximity; lagoons are not ocean beachfront", () => {
  assert.deepEqual(matching({ features: ["golf"] }), ["melcon-paradise"]);
  assert.deepEqual(matching({ features: ["beachfront"] }), []);
  assert.equal(matching({ features: ["artificial-beach"] }).length, 2);
  assert.equal(matching({ features: ["near-beach"] }).length, 3);
});
test("all features and filters combine with AND semantics", () => {
  assert.deepEqual(matching({ features: ["tennis", "padel"] }), [
    "the-beach-at-punta-cana-city-place",
  ]);
  assert.deepEqual(matching({ features: ["tennis", "golf"] }), []);
  assert.deepEqual(
    matching({
      query: "terra",
      price: "under150",
      delivery: "2028",
      bedroom: 1,
    }),
    ["terra-serena"],
  );
  assert.deepEqual(matching({ query: "terra", bedroom: 3 }), []);
});
test("search handles diacritics and pending prices are not silently budget matches", () => {
  assert.deepEqual(matching({ query: "veron" }), ["terra-serena"]);
  assert.equal(matching({ price: "pending" }).length, 2);
  assert.deepEqual(matching({ price: "under200" }), ["terra-serena"]);
});
test("Terra Serena exposes all six verified Kuula scenes and no invented tours", () => {
  assert.deepEqual(Object.keys(projectTours), ["terra-serena"]);
  const tour = projectTours["terra-serena"];
  assert.equal(tour.collection, "7HsBR");
  assert.equal(new Set(tour.scenes.map((scene) => scene.id)).size, 6);
  assert.equal(tour.scenes[5].id, "L4pD3");
});
