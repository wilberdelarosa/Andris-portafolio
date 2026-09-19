/**
 * Proveedor Supabase del repositorio de contenido.
 *
 * Se activa cuando existen `NEXT_PUBLIC_SUPABASE_URL` y
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Usa únicamente `fetch` contra PostgREST,
 * sin dependencias nuevas. Consulta la vista `api_projects_v1` creada por la
 * migración `supabase/migrations/0001_cms_core.sql`, que devuelve el DTO
 * público ya armado como `jsonb`.
 *
 * No usar alias `@/` aquí.
 */
import type {
  ApiHealth,
  ApiProjectDetail,
  ApiProjectSummary,
  CmsConnection,
} from "./types.ts";
import { API_VERSION, CMS_SCHEMA_VERSION } from "./types.ts";
import type { ContentRepository } from "./repository.ts";

interface ApiProjectRow {
  slug: string;
  summary: ApiProjectSummary;
  detail: ApiProjectDetail;
}

function endpoint(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
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

export const supabaseRepository: ContentRepository = {
  provider: "supabase",
  async listProjects() {
    const rows = await fetchRows(
      "select=slug,summary&order=summary->>name.asc",
    );
    return rows.map((row) => row.summary);
  },
  async getProject(slug: string) {
    const rows = await fetchRows(
      `select=slug,detail&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    );
    return rows[0]?.detail ?? null;
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
