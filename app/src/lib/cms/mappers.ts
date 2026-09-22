/**
 * Mapeadores del contenido interno (`PropertyProject`) a los DTO públicos
 * del API v1. Son funciones puras para poder ejecutarlas tanto en la app
 * como en el generador estático del API (`scripts/generate-static-api.mjs`).
 *
 * `fromApiProjectDetail` hace el camino inverso: convierte lo que devuelve
 * `ContentRepository.getProject()` (estático o Supabase) a la forma
 * `PropertyProject` que ya consumen los componentes del sitio público. Es la
 * pieza que permite que `ProjectsProvider` sirva un mismo tipo sin importar
 * qué proveedor esté activo.
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
    propertyCategory: project.propertyCategory,
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

/**
 * Convierte el DTO del API v1 (`ContentRepository.getProject()`) a la forma
 * `PropertyProject` que consumen los componentes del sitio público. Único
 * lugar donde se recompone `map.url` a partir de `mapUrl`: el resto de
 * campos coincide 1 a 1 entre ambos contratos.
 */
export function fromApiProjectDetail(detail: ApiProjectDetail): PropertyProject {
  return {
    id: detail.id,
    slug: detail.slug,
    name: detail.name,
    status: detail.status,
    location: detail.location,
    description: detail.description,
    bedrooms: detail.bedrooms,
    bathrooms: detail.bathrooms,
    parking: detail.parking,
    area: detail.area,
    greenArea: detail.greenArea,
    delivery: detail.delivery,
    reservation: detail.reservation,
    propertyCategory: detail.propertyCategory,
    productTypes: detail.productTypes,
    typologies: detail.typologies,
    includesAppliances: detail.includesAppliances,
    investmentBenefits: detail.investmentBenefits,
    nearby: detail.nearby,
    price: detail.price,
    hero: detail.hero,
    gallery: detail.gallery,
    amenities: detail.amenities,
    map: {
      url: detail.mapUrl,
      coordinates: detail.map.coordinates,
      precision: detail.map.precision,
    },
    paymentReference: detail.paymentReference,
    source: detail.source,
  };
}
