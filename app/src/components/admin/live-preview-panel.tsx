"use client";

import { useMemo } from "react";
import { PropertyCard } from "../property-card";
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

/**
 * Mapea los valores del borrador en el formato que espera PropertyCard.
 */
function draftToProject(draft: DraftPreview): PropertyProject {
  const images = [];
  if (draft.heroImg) images.push({ src: draft.heroImg, alt: { es: "", en: "", fr: "" } });
  if (draft.gallery1) images.push({ src: draft.gallery1, alt: { es: "", en: "", fr: "" } });
  
  // Relleno seguro para la vista previa
  if (images.length === 0) {
    images.push({ src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", alt: { es: "Preview", en: "Preview", fr: "Preview" } });
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
      // Mantener el SSR determinista: la vista previa no debe cambiar entre
      // servidor y navegador por depender de la fecha actual.
      year: draft.deliveryYear || 2028,
      status: "pending",
    },
    reservation: {
      amount: draft.reservation || null,
      currency: "USD",
      note: null,
    },
    productTypes: draft.productTypes?.map((t: string) => ({ es: t, en: t, fr: t })) || [],
    typologies: draft.typologies?.map((t: string) => ({ es: t, en: t, fr: t })) || [],
    includesAppliances: draft.includesAppliances || false,
    investmentBenefits: draft.investmentBenefits?.map((t: string) => ({ es: t, en: t, fr: t })) || [],
    nearby: draft.nearby?.map((t: string) => ({ es: t, en: t, fr: t })) || [],
    price: {
      from: draft.priceFrom || null,
      to: draft.priceTo || null,
      currency: "USD",
      status: "pending",
    },
    hero: images[0].src,
    gallery: images,
    amenities: draft.amenities?.map((t: string) => ({ es: t, en: t, fr: t })) || [],
    map: {
      url: draft.mapUrl || "",
      coordinates: draft.mapCoords ? draft.mapCoords.split(",").map(Number) as [number, number] : null,
      precision: "exact",
    },
    paymentReference: {
      signing: draft.signing || 10,
      construction: draft.construction || 30,
      delivery: draft.onDelivery || 60,
      commercialStatus: "active",
    },
    source: "",
  };
}

export function LivePreviewPanel({ activeTab, draft }: { activeTab: string, draft: DraftPreview }) {
  const project = useMemo(() => draftToProject(draft), [draft]);
  
  const hasCoords = !!project.map.coordinates && project.map.coordinates.length === 2 && !isNaN(project.map.coordinates[0]);

  return (
    <div className="admin-preview-panel">
      <div className="admin-preview-header">
        <h3>Vista Previa en Vivo</h3>
        <span className="admin-preview-badge">Reactiva</span>
      </div>
      
      <div className="admin-preview-content">
        {activeTab === "mapa" ? (
          <div className="admin-preview-map">
            {hasCoords ? (
              <div className="admin-preview-iframe-wrapper">
                 <iframe 
                   src={`https://maps.google.com/maps?q=${project.map.coordinates![0]},${project.map.coordinates![1]}&t=k&z=17&output=embed`}
                   width="100%" 
                   height="100%" 
                   style={{ border: 0, borderRadius: '12px' }} 
                   allowFullScreen 
                   loading="lazy" 
                   referrerPolicy="no-referrer-when-downgrade"
                 />
              </div>
            ) : (
              <div className="admin-preview-empty-map">
                <p>Ingresa un enlace de Google Maps o coordenadas para previsualizar el mapa.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="admin-preview-card-wrapper">
            <div style={{ pointerEvents: "none" }}>
               <PropertyCard project={project} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
