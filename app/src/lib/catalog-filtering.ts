import type { PropertyProject } from "../content/projects";
import type { DiscoveryFeature } from "../content/project-discovery";
import { matchesDiscovery } from "../content/project-discovery.ts";

export interface CatalogFilters {
  query: string;
  zone: string | null;
  bedroom: number | null;
  price: "under150" | "under200" | "confirmed" | "pending" | null;
  delivery: string | null;
  productType: string | null;
  amenity: string | null;
  features: DiscoveryFeature[];
}
export const emptyCatalogFilters: CatalogFilters = {
  query: "",
  zone: null,
  bedroom: null,
  price: null,
  delivery: null,
  productType: null,
  amenity: null,
  features: [],
};
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function matchesCatalog(
  project: PropertyProject,
  filters: CatalogFilters,
) {
  const from = project?.price?.from ?? null;
  const priceKnown = project?.price?.status === "confirmed" && from !== null;
  const priceMatches =
    filters.price === null ||
    (filters.price === "pending"
      ? !priceKnown
      : filters.price === "confirmed"
        ? priceKnown
        : priceKnown &&
          from <= (filters.price === "under150" ? 150000 : 200000));
  return (
    priceMatches &&
    (!filters.query ||
      normalize(`${project.name} ${project.location}`).includes(
        normalize(filters.query),
      )) &&
    (filters.zone === null ||
      project.location.split("·")[0].trim() === filters.zone) &&
    (filters.bedroom === null || project.bedrooms.includes(filters.bedroom)) &&
    (filters.productType === null ||
      project.productTypes.some((type) => type.es === filters.productType)) &&
    (filters.amenity === null ||
      project.amenities.some((amenity) => amenity.es === filters.amenity)) &&
    matchesDiscovery(project, filters.delivery, filters.features)
  );
}
