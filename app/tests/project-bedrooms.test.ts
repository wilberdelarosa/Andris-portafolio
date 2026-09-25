import assert from "node:assert/strict";
import test from "node:test";
import type { PropertyProject } from "../src/content/projects.ts";
import { getProjectInformation } from "../src/content/project-information.ts";
import {
  expandBedroomRange,
  formatBedroomOptions,
  normalizeBedroomOptions,
} from "../src/lib/project-bedrooms.ts";

test("expands legacy ranges and keeps exact configurations discrete", () => {
  assert.deepEqual(expandBedroomRange(1, 4), [1, 2, 3, 4]);
  assert.deepEqual(normalizeBedroomOptions([4, 2, 4, 1]), [1, 2, 4]);
  assert.deepEqual(
    normalizeBedroomOptions([
      ...expandBedroomRange(1, 2),
      ...expandBedroomRange(4, 4),
    ]),
    [1, 2, 4],
  );
});

test("formats rooms without implying options that are not selected", () => {
  assert.equal(formatBedroomOptions([2, 4], "es"), "2, 4 habitaciones");
  assert.equal(formatBedroomOptions([1, 2, 4], "es"), "1, 2, 4 habitaciones");
  assert.equal(formatBedroomOptions([1, 2, 3, 4], "es"), "1–4 habitaciones");
  assert.equal(formatBedroomOptions([1], "es"), "1 habitación");
  assert.equal(formatBedroomOptions([0, 1, 2], "en"), "Studio; 1–2 bedrooms");
  assert.equal(formatBedroomOptions([0], "fr"), "Studio");
  assert.equal(formatBedroomOptions([], "es"), "");
});

test("the comparison information uses the live project's exact room options", () => {
  const project = {
    slug: "new-cms-project",
    bedrooms: [1, 2, 4],
    bathrooms: [],
  } as unknown as PropertyProject;

  const information = getProjectInformation("new-cms-project", "bedrooms", project);
  assert.equal(information.status, "documented");
  assert.equal(information.value?.es, "1, 2, 4 habitaciones");
  assert.equal(information.value?.en, "1, 2, 4 bedrooms");
});
