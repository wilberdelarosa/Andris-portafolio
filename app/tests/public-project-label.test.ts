import test from "node:test";
import assert from "node:assert/strict";
import { getPublicProjectLabel, getPublicProjectName } from "../src/lib/public-project-label.ts";
import { testProjects } from "./fixtures/projects.ts";

test("public project labels are stable and localized", () => {
  assert.equal(getPublicProjectLabel(0, "es"), "Proyecto 01");
  assert.equal(getPublicProjectLabel(9, "en"), "Project 10");
  assert.equal(getPublicProjectLabel(1, "fr"), "Projet 02");
});

test("private mode hides the real name without changing the project identity", () => {
  const project = testProjects[0];
  assert.equal(getPublicProjectName(project, 2, true, "es"), "Proyecto 03");
  assert.equal(getPublicProjectName(project, 2, false, "es"), project.name);
  assert.equal(project.slug, "melcon-paradise");
});
