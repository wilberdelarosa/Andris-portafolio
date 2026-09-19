/**
 * Repositorio centralizado de contenido.
 *
 * Toda lectura de proyectos para API, estudio CMS o vistas pasa por esta
 * interfaz. Hoy el proveedor activo es el contenido estático de
 * `src/content/projects.ts`; cuando existan credenciales de Supabase
 * (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`) el mismo
 * contrato se sirve desde PostgREST sin tocar las vistas.
 *
 * No usar alias `@/` aquí.
 */
import {
  getProject,
  getPublishedProjects,
} from "../../content/projects.ts";
import { toApiProjectDetail, toApiProjectSummary } from "./mappers.ts";
import type {
  ApiHealth,
  ApiProjectDetail,
  ApiProjectSummary,
  CmsConnection,
} from "./types.ts";
import { API_VERSION, CMS_SCHEMA_VERSION } from "./types.ts";

export interface ContentRepository {
  readonly provider: "static" | "supabase";
  listProjects(): Promise<ApiProjectSummary[]>;
  getProject(slug: string): Promise<ApiProjectDetail | null>;
  health(): Promise<ApiHealth>;
  connection(): CmsConnection;
}

/** Proveedor actual: contenido estático verificado del repositorio. */
export const staticRepository: ContentRepository = {
  provider: "static",
  async listProjects() {
    return getPublishedProjects().map(toApiProjectSummary);
  },
  async getProject(slug: string) {
    const project = getProject(slug);
    return project ? toApiProjectDetail(project) : null;
  },
  async health() {
    return {
      status: "ok",
      apiVersion: API_VERSION,
      schemaVersion: CMS_SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      locales: ["es", "en", "fr"],
      projectCount: getPublishedProjects().length,
      provider: "static",
    };
  },
  connection() {
    return {
      provider: "static",
      ready: true,
      detail:
        "Contenido estático versionado en el repositorio. Supabase se activa al configurar sus credenciales.",
    };
  },
};

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Punto de intercambio de proveedor. La implementación de Supabase vive en
 * `supabase-repository.ts` y usa únicamente `fetch` contra PostgREST, sin
 * dependencias nuevas.
 */
import { supabaseRepository } from "./supabase-repository.ts";

export function getContentRepository(): ContentRepository {
  return isSupabaseConfigured() ? supabaseRepository : staticRepository;
}
