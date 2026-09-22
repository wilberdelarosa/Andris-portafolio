/**
 * Combo box de grupo de amenidad, contra `public.amenity_groups`.
 *
 * Mismo patrón que `PropertyCategorySelect`, pero opcional: una amenidad sin
 * grupo elegido no queda "mal" porque `createProject` (`project-writer.ts`)
 * cae al grupo "general" del catálogo cuando `groupId` llega vacío. Por eso
 * este select no lleva `required` y su primera opción es "Sin elegir…".
 */
"use client";

import { useEffect, useState } from "react";
import { cmsFetch, isSupabaseConfigured } from "@/lib/cms/session";

export interface AmenityGroupOption {
  id: string;
  key: string;
  label: string;
}

interface AmenityGroupSelectProps {
  /** `amenity_groups.id` elegido, o `""` para dejar que el escritor use "general". */
  value: string;
  onChange: (groupId: string) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toOption(row: unknown): AmenityGroupOption | null {
  if (!isRecord(row)) return null;
  const { id, key, label_es } = row;
  if (typeof id !== "string" || typeof key !== "string" || typeof label_es !== "string") {
    return null;
  }
  return { id, key, label: label_es };
}

type LoadStatus = "loading" | "ready" | "error";

export function AmenityGroupSelect({ value, onChange }: AmenityGroupSelectProps) {
  const [options, setOptions] = useState<AmenityGroupOption[]>([]);
  const [status, setStatus] = useState<LoadStatus>(() =>
    isSupabaseConfigured() ? "loading" : "error",
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const controller = new AbortController();
    cmsFetch("rest/v1/amenity_groups?select=id,key,label_es&order=sort_order.asc", {
      allowAnonymous: true,
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Respuesta inesperada de Supabase.");
        return data.map(toOption).filter((option): option is AmenityGroupOption => option !== null);
      })
      .then((next) => {
        if (controller.signal.aborted) return;
        setOptions(next);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, []);

  return (
    <label className="admin-field">
      Grupo de la amenidad (opcional)
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={status !== "ready"}>
        <option value="">
          {status === "loading" ? "Cargando grupos…" : "Sin elegir (se usa «General»)"}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {status === "error" && (
        <small className="admin-field-help admin-error-text">
          No se pudieron cargar los grupos desde Supabase. La amenidad se guardará en «General».
        </small>
      )}
    </label>
  );
}
