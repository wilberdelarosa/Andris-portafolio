/**
 * Adaptador puro para la vista previa del estudio CMS.
 *
 * Mantiene la tarjeta de previsualización desacoplada del formulario y permite
 * comprobar su contrato sin montar React ni depender de una sesión real.
 */
import type { PropertyProject } from "@/content/projects";

export type DraftPreview = {
  name?: string;
  location?: string;
  desc?: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  areaMin?: number;
  areaMax?: number;
  greenArea?: number;
  deliveryLabel?: string;
  deliveryYear?: number;
  reservation?: number;
  productTypes?: string[];
  typologies?: string[];
  includesAppliances?: boolean;
  investmentBenefits?: string[];
  nearby?: string[];
  priceFrom?: number;
  priceTo?: number;
  heroImg?: string;
  gallery1?: string;
  mapUrl?: string;
  mapCoords?: string;
  amenities?: string[];
  signing?: number;
  construction?: number;
  onDelivery?: number;
};

const previewImage =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";

function parseCoordinates(value?: string): [number, number] | null {
  if (!value) return null;
  const values = value.split(",").map((item) => Number(item.trim()));
  return values.length === 2 && values.every(Number.isFinite)
    ? [values[0], values[1]]
    : null;
}

/** Mapea valores del borrador al contrato que consume PropertyCard. */
export function draftToProject(draft: DraftPreview): PropertyProject {
  const images = [];
  if (draft.heroImg) images.push({ src: draft.heroImg, alt: { es: "", en: "", fr: "" } });
  if (draft.gallery1) images.push({ src: draft.gallery1, alt: { es: "", en: "", fr: "" } });
  if (images.length === 0) {
    images.push({ src: previewImage, alt: { es: "Vista previa", en: "Preview", fr: "Aperçu" } });
  }

  return {
    id: "preview-id",
    slug: "preview-slug",
    name: draft.name || "Nombre del Proyecto",
    status: "draft",
    location: draft.location || "Sector · Ciudad",
    description: { es: draft.desc || "Descripción del proyecto...", en: "", fr: "" },
    bedrooms: draft.bedrooms ? [draft.bedrooms] : [1],
    bathrooms: draft.bathrooms ? [draft.bathrooms] : [1],
    parking: draft.parking || 1,
    area: { min: draft.areaMin || 0, max: draft.areaMax || 0, unit: "m²" },
    greenArea: draft.greenArea || 0,
    delivery: {
      label: { es: draft.deliveryLabel || "Entrega", en: "", fr: "" },
      year: draft.deliveryYear || 2028,
      status: "pending",
    },
    reservation: { amount: draft.reservation || null, currency: "USD", note: null },
    // La vista previa local todavía no conoce la categoría real elegida en
    // el combo box del formulario: se declara sin asignar, no inventada.
    propertyCategory: null,
    productTypes: draft.productTypes?.map((item) => ({ es: item, en: item, fr: item })) || [],
    typologies: draft.typologies?.map((item) => ({ es: item, en: item, fr: item })) || [],
    includesAppliances: draft.includesAppliances || false,
    investmentBenefits:
      draft.investmentBenefits?.map((item) => ({ es: item, en: item, fr: item })) || [],
    nearby: draft.nearby?.map((item) => ({ es: item, en: item, fr: item })) || [],
    price: { from: draft.priceFrom || null, to: draft.priceTo || null, currency: "USD", status: "pending" },
    hero: images[0].src,
    gallery: images,
    amenities: draft.amenities?.map((item) => ({ es: item, en: item, fr: item })) || [],
    map: { url: draft.mapUrl || "", coordinates: parseCoordinates(draft.mapCoords), precision: "exact" },
    paymentReference: {
      signing: draft.signing || 10,
      construction: draft.construction || 30,
      delivery: draft.onDelivery || 60,
      commercialStatus: "active",
    },
    source: "",
  };
}
