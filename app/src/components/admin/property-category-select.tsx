/**
 * Combo box de categoría de propiedad, contra `public.property_categories`.
 *
 * Antes el formulario de alta no tenía un selector real: escribía siempre
 * `property_category: 'otro'` sin preguntarle nada al usuario, y el filtro
 * público usaba en su lugar un campo de texto libre ("Tipos de producto")
 * autocompletado contra la tabla genérica `categories`. Este componente es el
 * selector real de categoría cerrada que reemplaza ese texto libre.
 *
 * Selección única: guarda el `id` (para la FK `property_category_id`) y
 * expone también el `key` elegido, porque el escritor (`project-writer.ts`)
 * todavía debe sincronizar la columna de texto vieja mientras no se haga el
 * cutover completo (migración 0008 pendiente).
 */
"use client";

import { useEffect, useState } from "react";
import { cmsFetch, isSupabaseConfigured } from "@/lib/cms/session";

export interface PropertyCategoryOption {
  id: string;
  key: string;
  label: string;
}

interface PropertyCategorySelectProps {
  /** `property_category_id` elegido, o `""` si todavía no se ha elegido. */
  value: string;
  onChange: (categoryId: string, categoryKey: string, categoryLabel: string) => void;
  label?: string;
  /** Texto de la opción vacía. «Todas» cuando se usa como filtro. */
  placeholder?: string;
  /** El filtro del listado admite vacío (=todas); el alta de proyecto no. */
  required?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Convierte una fila de `property_categories` en una opción, o `null` si le falta algo imprescindible. */
function toOption(row: unknown): PropertyCategoryOption | null {
  if (!isRecord(row)) return null;
  const { id, key, label_es } = row;
  if (typeof id !== "string" || typeof key !== "string" || typeof label_es !== "string") {
    return null;
  }
  return { id, key, label: label_es };
}

type LoadStatus = "loading" | "ready" | "error";

export function PropertyCategorySelect({
  value,
  onChange,
  label = "Categoría de propiedad",
  placeholder = "Selecciona una categoría",
  required = true,
}: PropertyCategorySelectProps) {
  const [options, setOptions] = useState<PropertyCategoryOption[]>([]);
  // Instantánea estable calculada en el primer render: evita un setState
  // síncrono dentro del efecto solo para declarar "sin Supabase configurado".
  const [status, setStatus] = useState<LoadStatus>(() =>
    isSupabaseConfigured() ? "loading" : "error",
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const controller = new AbortController();
    cmsFetch(
      "rest/v1/property_categories?select=id,key,label_es&is_active=eq.true&order=sort_order.asc",
      { allowAnonymous: true, signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Respuesta inesperada de Supabase.");
        return data
          .map(toOption)
          .filter((option): option is PropertyCategoryOption => option !== null);
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
      {label}
      <select
        value={value}
        onChange={(event) => {
          const selectedId = event.target.value;
          const selected = options.find((option) => option.id === selectedId);
          onChange(selectedId, selected?.key ?? "", selected?.label ?? "");
        }}
        disabled={status !== "ready"}
        required={required}
      >
        <option value="">
          {status === "loading" ? "Cargando categorías…" : placeholder}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {status === "error" && (
        <small className="admin-field-help admin-error-text">
          No se pudieron cargar las categorías desde Supabase. Revisa la
          conexión o crea categorías en la pestaña «Categorías».
        </small>
      )}
    </label>
  );
}
