/**
 * Repositorio centralizado de contenido.
 *
 * Toda lectura de proyectos para API, estudio CMS o vistas pasa por esta
 * interfaz. El proveedor activo es Supabase mediante PostgREST.
 * Requiere las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *
 * No usar alias `@/` aquí.
 */
import type {
  ApiHealth,
  ApiProjectDetail,
  ApiProjectSummary,
  CmsConnection,
} from "./types.ts";
import { supabaseRepository } from "./supabase-repository.ts";

export interface ContentRepository {
  readonly provider: "static" | "supabase";
  listProjects(): Promise<ApiProjectSummary[]>;
  getProject(slug: string): Promise<ApiProjectDetail | null>;
  health(): Promise<ApiHealth>;
  connection(): CmsConnection;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getContentRepository(): ContentRepository {
  if (!isSupabaseConfigured()) {
    console.warn("ADVERTENCIA: Las variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY) no están configuradas. El sistema no podrá obtener contenido.");
  }
  return supabaseRepository;
}
