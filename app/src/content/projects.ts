export type Locale = "es" | "en" | "fr";
export type Localized = Record<Locale, string>;

/** Viñetas de una amenidad, una lista de texto por idioma. */
export interface AmenityFeatureSet {
  es?: string[];
  en?: string[];
  fr?: string[];
}

/** Grupo de amenidades (`public.amenity_groups`): playa, bienestar, deportes… */
export interface AmenityGroupRef {
  key: string;
  label: Localized;
}

/**
 * Amenidad con imagen y viñetas propias del proyecto (patrón "scrollytelling"
 * de `/proyectos/[slug]`). `image`/`features`/`group` son opcionales porque el
 * catálogo compartido (`public.amenities`) no obliga a rellenarlos.
 */
export interface RichAmenity {
  /** Clave estable del catálogo compartido (`amenities.amenity_key`). */
  key?: string;
  name: Localized;
  /** `null`/`undefined` = sin imagen propia ni de catálogo. */
  image?: string | null;
  features?: AmenityFeatureSet;
  group?: AmenityGroupRef | null;
}

/**
 * Amenidad "plana" heredada: solo el nombre localizado, sin imagen ni
 * viñetas. Sigue siendo válida porque varios proyectos reales la usan así.
 */
export type AmenityEntry = RichAmenity | Localized;

export interface PropertyProject {
  id: string;
  slug: string;
  name: string;
  status: "reviewed" | "draft";
  location: string;
  description: Localized;
  bedrooms: number[];
  /** Vacio mientras no este confirmado por el desarrollador. */
  bathrooms: number[];
  /** `null` mientras no este confirmado. */
  parking: number | null;
  area: { min: number; max: number; unit: string };
  greenArea: number;
  delivery: {
    label: Localized;
    year: number | null;
    status: "confirmed" | "varies" | "pending";
  };
  reservation: {
    amount: number | null;
    currency: "USD";
    note: Localized | null;
  };
  /**
   * Categoría cerrada de `public.property_categories` (apartamento, villa,
   * townhouse, penthouse, mixto, otro). `null` mientras no esté asignada.
   */
  propertyCategory: { key: string; label: Localized } | null;
  productTypes: Localized[];
  typologies: Localized[];
  includesAppliances: boolean | null;
  investmentBenefits: Localized[];
  nearby: Localized[];
  /**
   * Rango de precio.
   *
   * `from`/`to` en `null` significa sin confirmar, y la interfaz lo muestra
   * como "por confirmar" en lugar de inventar una cifra. Para publicar un
   * precio basta rellenar los numeros y poner `status: "confirmed"`.
   */
  price: {
    from: number | null;
    to: number | null;
    currency: "USD";
    status: "confirmed" | "pending";
  };
  hero: string;
  gallery: { src: string; alt: Localized }[];
  amenities: AmenityEntry[];
  map: {
    url: string;
    coordinates: [number, number] | null;
    precision: "exact" | "area" | "unverified";
  };
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
  source: string;
}

