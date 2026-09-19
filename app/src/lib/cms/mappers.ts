/**
 * Mapeadores del contenido interno (`PropertyProject`) a los DTO públicos
 * del API v1. Son funciones puras para poder ejecutarlas tanto en la app
 * como en el generador estático del API (`scripts/generate-static-api.mjs`).
 *
 * No usar alias `@/` aquí.
 */
import type { PropertyProject } from "../../content/projects.ts";
import type { ApiProjectDetail, ApiProjectSummary } from "./types.ts";

export function toApiProjectSummary(
  project: PropertyProject,
): ApiProjectSummary {
  return {
    ...toApiProjectBase(project),
    links: {
      web: `/proyectos/${project.slug}/`,
      api: `/api/v1/projects/${project.slug}.json`,
    },
  };
}

function toApiProjectBase(project: PropertyProject) {
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    status: project.status,
    location: project.location,
    hero: project.hero,
    bedrooms: project.bedrooms,
    area: project.area,
    price: project.price,
    delivery: project.delivery,
    map: {
      coordinates: project.map.coordinates,
      precision: project.map.precision,
    },
  };
}

export function toApiProjectDetail(project: PropertyProject): ApiProjectDetail {
  return {
    ...toApiProjectBase(project),
    description: project.description,
    bathrooms: project.bathrooms,
    parking: project.parking,
    greenArea: project.greenArea,
    reservation: project.reservation,
    productTypes: project.productTypes,
    typologies: project.typologies,
    includesAppliances: project.includesAppliances,
    investmentBenefits: project.investmentBenefits,
    nearby: project.nearby,
    gallery: project.gallery,
    amenities: project.amenities,
    mapUrl: project.map.url,
    paymentReference: project.paymentReference,
    source: project.source,
  };
}
