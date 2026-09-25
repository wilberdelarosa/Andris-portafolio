import type { AmenityEntry, RichAmenity } from "../../content/projects.ts";

/**
 * Placeholder images were used while the amenity CMS was being prototyped.
 * They must never become public project media: an amenity without a CMS image
 * is rendered as text and does not create a carousel card.
 */
export function sanitizeAmenityImage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed, "https://andrispenarealty.com");
    if (url.hostname === "picsum.photos" || url.hostname === "source.unsplash.com") return null;
  } catch {
    return null;
  }

  return trimmed;
}

export function sanitizeAmenityEntry(entry: AmenityEntry): AmenityEntry {
  if (typeof entry !== "object" || entry === null || !("name" in entry)) return entry;
  const rich = entry as RichAmenity;
  return { ...rich, image: sanitizeAmenityImage(rich.image) };
}
