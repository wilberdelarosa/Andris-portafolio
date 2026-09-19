/**
 * Contratos públicos de la capa CMS y del API v1 del portafolio.
 *
 * Estos DTO son el punto único de verdad entre:
 *  - el contenido estático actual (`src/content/*`),
 *  - el API estática generada en `public/api/v1/`,
 *  - el estudio CMS local de `/admin`,
 *  - y la futura migración a Supabase (mismo contrato, otro proveedor).
 *
 * No usar alias `@/` aquí: el generador del API se ejecuta con Node puro.
 */
import type { Locale, Localized } from "../../content/projects.ts";

export type { Locale, Localized };

export const API_VERSION = "v1";
export const CMS_SCHEMA_VERSION = "1.0.0";

/** Estados de evidencia del estándar de datos (docs/organization/PROJECT-DATA-STANDARD.md). */
export type EvidenceStatus =
  | "documented"
  | "pending"
  | "varies"
  | "not_applicable"
  | "archived";

export interface ApiHealth {
  status: "ok";
  apiVersion: typeof API_VERSION;
  schemaVersion: typeof CMS_SCHEMA_VERSION;
  generatedAt: string;
  locales: Locale[];
  projectCount: number;
  /** Proveedor activo de contenido: estático hoy, supabase al migrar. */
  provider: "static" | "supabase";
}

export interface ApiMoney {
  amount: number | null;
  currency: "USD";
}

export interface ApiProjectSummary {
  id: string;
  slug: string;
  name: string;
  status: "reviewed" | "draft";
  location: string;
  hero: string;
  bedrooms: number[];
  area: { min: number; max: number; unit: string };
  price: {
    from: number | null;
    to: number | null;
    currency: "USD";
    status: "confirmed" | "pending";
  };
  delivery: {
    label: Localized;
    year: number | null;
    status: "confirmed" | "varies" | "pending";
  };
  map: {
    coordinates: [number, number] | null;
    precision: "exact" | "area" | "unverified";
  };
  links: {
    web: string;
    api: string;
  };
}

export interface ApiProjectDetail extends Omit<ApiProjectSummary, "links"> {
  description: Localized;
  bathrooms: number[];
  parking: number | null;
  greenArea: number;
  reservation: {
    amount: number | null;
    currency: "USD";
    note: Localized | null;
  };
  productTypes: Localized[];
  typologies: Localized[];
  includesAppliances: boolean | null;
  investmentBenefits: Localized[];
  nearby: Localized[];
  gallery: { src: string; alt: Localized }[];
  amenities: Localized[];
  mapUrl: string;
  paymentReference: {
    signing: number;
    construction: number;
    delivery: number;
    commercialStatus: string;
    plans?: {
      signing: number;
      construction: number;
      delivery: number;
      discount?: string;
    }[];
  };
  /** Documento fuente que respalda la ficha. */
  source: string;
}

export interface ApiProjectIndex {
  apiVersion: typeof API_VERSION;
  generatedAt: string;
  count: number;
  projects: ApiProjectSummary[];
}

/** Lead de contacto registrado por el estudio CMS (local hoy, Supabase después). */
export interface CmsLead {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  budget: string;
  timeframe: string;
  project: string;
  interest: string;
  message: string;
  locale: Locale;
  pageUrl?: string;
  channel: "email" | "whatsapp" | "summary";
  status: "prepared" | "sent" | "failed";
}

/** Cotización generada por la calculadora (descarga de PDF). */
export interface CalculatorQuote {
  id: string;
  createdAt: string;
  locale: Locale;
  projectSlug: string | null;
  price: number;
  signingPercent: number;
  constructionPercent: number;
  months: number;
  monthly: number;
  deliveryPercent: number;
  format: "pdf";
}

/** Borrador editorial de un proyecto dentro del estudio CMS. */
export interface ProjectDraft {
  projectId: string;
  updatedAt: string;
  /** Campos comerciales editables; solo se guardan cambios explícitos. */
  fields: {
    priceFrom?: number | null;
    priceTo?: number | null;
    priceStatus?: "confirmed" | "pending";
    reservationAmount?: number | null;
    deliveryLabelEs?: string;
    deliveryYear?: number | null;
    status?: "reviewed" | "draft";
  };
  notes: string;
}

/** Estado de conexión del CMS mostrado en el estudio. */
export interface CmsConnection {
  provider: "static" | "supabase";
  ready: boolean;
  detail: string;
}
