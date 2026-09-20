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
  ApiHealth,
  ApiProjectDetail,
  ApiProjectSummary,
  CmsConnection,
  Localized,
} from "./types.ts";
import { API_VERSION, CMS_SCHEMA_VERSION } from "./types.ts";
import type { ContentRepository } from "./repository.ts";

/** Parte del DTO que la vista compone hoy. */
interface ApiDetailExtra {
  description?: Localized;
  gallery?: ApiProjectDetail["gallery"];
  amenities?: Localized[];
  paymentReference?: ApiProjectDetail["paymentReference"];
  source?: string | null;
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

async function fetchRows(query: string): Promise<ApiProjectRow[]> {
  const response = await fetch(endpoint(`api_projects_v1?${query}`), {
    headers: headers(),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Supabase respondió ${response.status}`);
  }
  return (await response.json()) as ApiProjectRow[];
}

function toDetail(row: ApiProjectRow): ApiProjectDetail | null {
  const summary = row.summary;
  if (!summary) return null;
  const extra = row.detail_extra ?? {};
  // `links` solo existe en el resumen; el detalle no lo lleva.
  const { links: _links, ...base } = summary;
  void _links;

  return {
    ...base,
    description: extra.description ?? EMPTY_LOCALIZED,
    gallery: extra.gallery ?? [],
    amenities: extra.amenities ?? [],
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
      .filter((summary): summary is ApiProjectSummary => Boolean(summary));
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
