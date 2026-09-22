"use client";

/**
 * Fuente única de proyectos para el sitio público del lado del cliente.
 *
 * Antes, cada componente cliente leía `getPublishedProjects()` de
 * `src/content/projects.ts` de forma síncrona, ignorando por completo el
 * repositorio de contenido (`getContentRepository()`), que ya sabe elegir
 * entre Supabase y el contenido estático según haya credenciales
 * configuradas. Este provider hace la única llamada real —
 * `getContentRepository().listProjects()` seguida de un `getProject(slug)`
 * por cada proyecto para recomponer la forma completa `PropertyProject` que
 * ya esperan las vistas— y la comparte vía contexto para que ningún
 * componente dispare su propio fetch redundante.
 *
 * Se monta una sola vez en `app/layout.tsx`, así que el listado persiste
 * mientras el usuario navega entre rutas del App Router (el layout no se
 * desmonta) y no hay una nueva petición por cada página visitada.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getContentRepository } from "@/lib/cms/repository";
import { fromApiProjectDetail } from "@/lib/cms/mappers";
import type { PropertyProject } from "@/content/projects";

interface ProjectsContextValue {
  /** Proyectos ya en forma `PropertyProject`, listos para las vistas. */
  projects: PropertyProject[];
  /** `true` mientras se resuelve la primera carga. */
  loading: boolean;
  /** Mensaje de error traducible, o `null` si la carga fue bien. */
  error: string | null;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function describeError(cause: unknown): string {
  if (cause instanceof Error && cause.message) return cause.message;
  return "No se pudo cargar el catálogo de proyectos desde el servidor.";
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const repository = getContentRepository();

    async function load() {
      try {
        const summaries = await repository.listProjects();
        const details = await Promise.all(
          summaries.map((summary) => repository.getProject(summary.slug)),
        );
        if (cancelled) return;
        const loaded = details
          .filter((detail): detail is NonNullable<typeof detail> => detail !== null)
          .map(fromApiProjectDetail);
        setProjects(loaded);
        setError(null);
      } catch (cause) {
        if (cancelled) return;
        setProjects([]);
        setError(describeError(cause));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects, loading, error }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects(): ProjectsContextValue {
  const value = useContext(ProjectsContext);
  if (!value) throw new Error("useProjects debe usarse dentro de ProjectsProvider");
  return value;
}
