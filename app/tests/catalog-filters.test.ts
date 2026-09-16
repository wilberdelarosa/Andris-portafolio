import test from "node:test";
import assert from "node:assert/strict";
import { getPublishedProjects, type PropertyProject } from "../src/content/projects.ts";

test("published projects contain exactly the 3 verified real estate developments", () => {
  const projects = getPublishedProjects();
  assert.equal(projects.length, 3);
  const slugs = projects.map((p) => p.slug);
  assert.ok(slugs.includes("melcon-paradise"));
  assert.ok(slugs.includes("terra-serena"));
  assert.ok(slugs.includes("the-beach-at-punta-cana-city-place"));
});

test("data audit: no fabricated prices, and pending prices are strictly marked pending", () => {
  const projects = getPublishedProjects();
  const melcon = projects.find((p) => p.slug === "melcon-paradise")!;
  const terra = projects.find((p) => p.slug === "terra-serena")!;
  const beach = projects.find((p) => p.slug === "the-beach-at-punta-cana-city-place")!;

  // Melcon Paradise
  assert.equal(melcon.price.status, "pending");
  assert.equal(melcon.price.from, null);

  // Terra Serena: Confirmed active price
  assert.equal(terra.price.status, "confirmed");
  assert.equal(terra.price.from, 120000);

  // The Beach: Pending official table
  assert.equal(beach.price.status, "pending");
  assert.equal(beach.price.from, null);
  assert.equal(beach.area.min, 0);
  assert.equal(beach.area.max, 0);
});

test("data audit: bathrooms and parking are unconfirmed across all 3 projects", () => {
  const projects = getPublishedProjects();
  for (const project of projects) {
    assert.deepEqual(project.bathrooms, [], `${project.slug} must not have fabricated bathrooms`);
    assert.equal(project.parking, null, `${project.slug} must not have fabricated parking`);
  }
});

test("CONFOTUR benefit is present exclusively in The Beach as verified", () => {
  const projects = getPublishedProjects();
  const beach = projects.find((p) => p.slug === "the-beach-at-punta-cana-city-place")!;
  const melcon = projects.find((p) => p.slug === "melcon-paradise")!;
  const terra = projects.find((p) => p.slug === "terra-serena")!;

  const hasConfotur = (p: PropertyProject) =>
    p.investmentBenefits.some((b) => b.es.includes("CONFOTUR"));

  assert.ok(hasConfotur(beach));
  assert.ok(!hasConfotur(melcon));
  assert.ok(!hasConfotur(terra));
});

test("pricing filter correctly filters between confirmed, pending and price brackets", () => {
  const projects = getPublishedProjects();

  const confirmedProjects = projects.filter(
    (p) => p.price.status === "confirmed" && p.price.from !== null,
  );
  assert.equal(confirmedProjects.length, 1);
  assert.equal(confirmedProjects[0].slug, "terra-serena");

  const pendingProjects = projects.filter((p) => p.price.status === "pending");
  assert.equal(pendingProjects.length, 2);

  const under150Projects = projects.filter(
    (p) => p.price.status === "confirmed" && p.price.from !== null && p.price.from <= 150000,
  );
  assert.equal(under150Projects.length, 1);
  assert.equal(under150Projects[0].slug, "terra-serena");
});

test("bedroom filter matches available project typologies accurately", () => {
  const projects = getPublishedProjects();
  const oneBedProjects = projects.filter((p) => p.bedrooms.includes(1));
  assert.equal(oneBedProjects.length, 3); // All 3 offer 1 bedroom

  const threeBedProjects = projects.filter((p) => p.bedrooms.includes(3));
  assert.equal(threeBedProjects.length, 2); // Melcon and The Beach
  assert.ok(threeBedProjects.some((p) => p.slug === "melcon-paradise"));
  assert.ok(threeBedProjects.some((p) => p.slug === "the-beach-at-punta-cana-city-place"));
});
