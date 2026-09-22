/**
 * Proveedor Supabase del repositorio de contenido.
 *
 * Se activa cuando existen `NEXT_PUBLIC_SUPABASE_URL` y
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Usa unicamente `fetch` contra PostgREST,
 * sin dependencias nuevas. Consulta la vista `api_projects_v1` creada por la
 * migracion `supabase/migrations/0001_cms_core.sql`.
 *
 * Esa vista publica dos columnas, `summary` y `detail_extra`; el codigo
 * anterior pedia una columna `detail` que no existe, de modo que
 * `getProject()` respondia 400 contra la base real. Aqui se leen las dos
 * columnas de verdad y se componen en el DTO.
 *
 * `detail_extra` todavia no incluye banos, parqueos, area verde, reserva,
 * tipologias, beneficios ni cercanias: esos campos salen en su forma "sin
 * confirmar" hasta que la vista los exponga. Nunca se inventan valores.
 *
 * No usar alias `@/` aqui.
 */
import type {
  AmenityEntry,
  ApiHealth,
  ApiProjectDetail,
  ApiProjectSummary,
  CmsConnection,
  Localized,
} from "./types.ts";
import { API_VERSION, CMS_SCHEMA_VERSION } from "./types.ts";
import type { ContentRepository } from "./repository.ts";

/**
 * Parte del DTO que la vista compone hoy. `amenities` llega sin tipar porque
 * su forma depende de qué migración esté aplicada en el proyecto Supabase
 * que responde (ver `normalizeApiAmenities` más abajo).
 */
interface ApiDetailExtra {
  description?: Localized;
  gallery?: ApiProjectDetail["gallery"];
  amenities?: unknown[];
  paymentReference?: ApiProjectDetail["paymentReference"];
  source?: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toLocalized(value: unknown): Localized | null {
  if (!isRecord(value) || typeof value.es !== "string") return null;
  return {
    es: value.es,
    en: typeof value.en === "string" ? value.en : value.es,
    fr: typeof value.fr === "string" ? value.fr : value.es,
  };
}

function toFeatureList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/**
 * Normaliza una fila cruda de `detail_extra.amenities` a `AmenityEntry`.
 * Tolera dos formas, según si la migración 0009 ya está aplicada en el
 * proyecto Supabase que responde:
 *  - Vieja (antes de 0009): la fila ES el objeto `{es,en,fr}` directamente.
 *  - Nueva (0009): `{ key, name: {es,en,fr}, image, features: {es,en,fr}, group }`.
 * Una fila que no coincide con ninguna forma se descarta en vez de inventar
 * un nombre vacío que apareciera como una amenidad fantasma en la interfaz.
 */
function normalizeApiAmenity(raw: unknown): AmenityEntry | null {
  if (!isRecord(raw)) return null;

  if ("name" in raw) {
    const name = toLocalized(raw.name);
    if (!name) return null;
    const featuresRaw = raw.features;
    const groupRaw = raw.group;
    const groupLabel = isRecord(groupRaw) ? toLocalized(groupRaw.label) : null;
    return {
      key: typeof raw.key === "string" ? raw.key : undefined,
      name,
      image: typeof raw.image === "string" ? raw.image : null,
      features: isRecord(featuresRaw)
        ? {
            es: toFeatureList(featuresRaw.es),
            en: toFeatureList(featuresRaw.en),
            fr: toFeatureList(featuresRaw.fr),
          }
        : undefined,
      group:
        isRecord(groupRaw) && typeof groupRaw.key === "string" && groupLabel
          ? { key: groupRaw.key, label: groupLabel }
          : null,
    };
  }

  // Forma vieja: la fila entera es el `Localized` de la amenidad.
  return toLocalized(raw);
}

function normalizeApiAmenities(raw: unknown[] | undefined): AmenityEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeApiAmenity)
    .filter((entry): entry is AmenityEntry => entry !== null);
}

interface ApiProjectRow {
  slug: string;
  summary?: ApiProjectSummary;
  detail_extra?: ApiDetailExtra;
}

const EMPTY_LOCALIZED: Localized = { es: "", en: "", fr: "" };

function endpoint(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
  return `${base}/rest/v1/${path}`;
}

function headers(): HeadersInit {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
  };
}

/**
 * `cache: "no-store"` marca el fetch como dinámico para el App Router de
 * Next. Con `output: "export"` (exportación estática) eso hace fallar el
 * build: `generateStaticParams`/las páginas de servidor corren en build
 * time, donde no existe revalidación posible, así que Next exige que todo
 * fetch de servidor sea estático (`cache` por defecto). En el navegador
 * (`ProjectsProvider`) ese límite no aplica y sí queremos evitar respuestas
 * cacheadas al recargar el estudio CMS tras publicar un cambio.
 */
async function fetchRows(query: string): Promise<ApiProjectRow[]> {
  const isBrowser = typeof window !== "undefined";
  const response = await fetch(endpoint(`api_projects_v1?${query}`), {
    headers: headers(),
    ...(isBrowser ? { cache: "no-store" as const } : {}),
  });
  if (!response.ok) {
    throw new Error(`Supabase respondió ${response.status}`);
  }
  return (await response.json()) as ApiProjectRow[];
}

/**
 * `propertyCategory` lo agrega la migración 0008. Mientras esa migración no
 * se haya aplicado en el proyecto que responde, PostgREST simplemente omite
 * la clave del JSON: se normaliza a `null` en vez de dejarla `undefined`,
 * que rompería el contrato de `ApiProjectSummary`.
 */
function normalizeSummary(summary: ApiProjectSummary): ApiProjectSummary {
  return {
    ...summary,
    propertyCategory: summary.propertyCategory ?? null,
  };
}

function toDetail(row: ApiProjectRow): ApiProjectDetail | null {
  const summary = row.summary;
  if (!summary) return null;
  const extra = row.detail_extra ?? {};
  // `links` solo existe en el resumen; el detalle no lo lleva.
  const { links: _links, ...base } = normalizeSummary(summary);
  void _links;

  return {
    ...base,
    description: extra.description ?? EMPTY_LOCALIZED,
    gallery: extra.gallery ?? [],
    amenities: normalizeApiAmenities(extra.amenities),
    paymentReference:
      extra.paymentReference ?? {
        signing: 0,
        construction: 0,
        delivery: 0,
        commercialStatus: "pending",
      },
    source: extra.source ?? "",
    // Sin exponer todavía en la vista: se declaran como pendientes.
    bathrooms: [],
    parking: null,
    greenArea: 0,
    reservation: { amount: null, currency: "USD", note: null },
    productTypes: [],
    typologies: [],
    includesAppliances: null,
    investmentBenefits: [],
    nearby: [],
    mapUrl: "",
  };
}

export const supabaseRepository: ContentRepository = {
  provider: "supabase",
  async listProjects() {
    const rows = await fetchRows("select=slug,summary&order=summary->>name.asc");
    return rows
      .map((row) => row.summary)
      .filter((summary): summary is ApiProjectSummary => Boolean(summary))
      .map(normalizeSummary);
  },
  async getProject(slug: string) {
    const rows = await fetchRows(
      `select=slug,summary,detail_extra&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    );
    return rows[0] ? toDetail(rows[0]) : null;
  },
  async health(): Promise<ApiHealth> {
    const rows = await fetchRows("select=slug");
    return {
      status: "ok",
      apiVersion: API_VERSION,
      schemaVersion: CMS_SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      locales: ["es", "en", "fr"],
      projectCount: rows.length,
      provider: "supabase",
    };
  },
  connection(): CmsConnection {
    return {
      provider: "supabase",
      ready: true,
      detail: "Conectado a Supabase mediante PostgREST con clave anónima.",
    };
  },
};
