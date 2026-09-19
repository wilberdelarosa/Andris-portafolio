/**
 * Persistencia local del estudio CMS.
 *
 * Mientras no existan credenciales de Supabase, los leads preparados desde
 * `/contacto`, las cotizaciones PDF de la calculadora y los borradores de
 * proyectos del estudio `/admin` se guardan en `localStorage`. Los nombres
 * de clave y los DTO son los mismos que usará la tabla destino, de modo que
 * la migración consiste en cambiar el adaptador, no la interfaz.
 */
"use client";

import type {
  CalculatorQuote,
  CmsLead,
  ProjectDraft,
} from "./types.ts";

const LEADS_KEY = "ap-cms-leads";
const QUOTES_KEY = "ap-cms-quotes";
const DRAFTS_KEY = "ap-cms-drafts";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, rows: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(rows));
    window.dispatchEvent(new CustomEvent("ap-cms-change", { detail: key }));
  } catch {
    /* El almacenamiento puede no estar disponible en navegación privada. */
  }
}

function createId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

export const leadsStore = {
  list: () => read<CmsLead>(LEADS_KEY),
  add(lead: Omit<CmsLead, "id" | "createdAt">): CmsLead {
    const record: CmsLead = {
      ...lead,
      id: createId("lead"),
      createdAt: new Date().toISOString(),
    };
    write(LEADS_KEY, [record, ...read<CmsLead>(LEADS_KEY)]);
    return record;
  },
  update(id: string, patch: Partial<CmsLead>) {
    write(
      LEADS_KEY,
      read<CmsLead>(LEADS_KEY).map((lead) =>
        lead.id === id ? { ...lead, ...patch } : lead,
      ),
    );
  },
  remove(id: string) {
    write(
      LEADS_KEY,
      read<CmsLead>(LEADS_KEY).filter((lead) => lead.id !== id),
    );
  },
  clear() {
    write(LEADS_KEY, []);
  },
};

export const quotesStore = {
  list: () => read<CalculatorQuote>(QUOTES_KEY),
  add(quote: Omit<CalculatorQuote, "id" | "createdAt">): CalculatorQuote {
    const record: CalculatorQuote = {
      ...quote,
      id: createId("quote"),
      createdAt: new Date().toISOString(),
    };
    write(QUOTES_KEY, [record, ...read<CalculatorQuote>(QUOTES_KEY)]);
    return record;
  },
  clear() {
    write(QUOTES_KEY, []);
  },
};

export const draftsStore = {
  list: () => read<ProjectDraft>(DRAFTS_KEY),
  get(projectId: string): ProjectDraft | null {
    return (
      read<ProjectDraft>(DRAFTS_KEY).find(
        (draft) => draft.projectId === projectId,
      ) ?? null
    );
  },
  save(draft: Omit<ProjectDraft, "updatedAt">): ProjectDraft {
    const record: ProjectDraft = { ...draft, updatedAt: new Date().toISOString() };
    const rest = read<ProjectDraft>(DRAFTS_KEY).filter(
      (item) => item.projectId !== draft.projectId,
    );
    write(DRAFTS_KEY, [record, ...rest]);
    return record;
  },
  remove(projectId: string) {
    write(
      DRAFTS_KEY,
      read<ProjectDraft>(DRAFTS_KEY).filter(
        (draft) => draft.projectId !== projectId,
      ),
    );
  },
};

/** Suscribe a cambios de cualquier colección del estudio (misma pestaña). */
export function onCmsChange(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener("ap-cms-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("ap-cms-change", handler);
    window.removeEventListener("storage", handler);
  };
}
