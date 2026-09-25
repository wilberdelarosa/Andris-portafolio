import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeAmenityImage } from "../src/lib/cms/amenity-media.ts";

test("prototype amenity image hosts are hidden from the public carousel", () => {
  assert.equal(sanitizeAmenityImage("https://picsum.photos/seed/melcon-spa/1200/900"), null);
  assert.equal(sanitizeAmenityImage("https://source.unsplash.com/1200x900/?pool"), null);
});

test("CMS-owned local and storage images remain available", () => {
  assert.equal(sanitizeAmenityImage("/derived/terra-serena-pool.webp"), "/derived/terra-serena-pool.webp");
  assert.equal(
    sanitizeAmenityImage("https://example.supabase.co/storage/v1/object/public/projects/pool.jpg"),
    "https://example.supabase.co/storage/v1/object/public/projects/pool.jpg",
  );
  assert.equal(sanitizeAmenityImage("  "), null);
});
