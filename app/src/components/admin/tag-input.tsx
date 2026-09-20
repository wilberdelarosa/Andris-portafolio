/**
 * Campo de etiquetas con sugerencias del catalogo `public.categories`.
 *
 * Las sugerencias se consultan con `ilike` (la version anterior escribia
 * `ilice`, que PostgREST rechaza, asi que el desplegable nunca aparecia) y se
 * filtran contra lo ya elegido en el render, no dentro del efecto: de lo
 * contrario cada etiqueta anadida relanzaba la busqueda.
 *
 * Al crear una etiqueta nueva se registra en el catalogo para que quede
 * disponible en los siguientes proyectos; si esa escritura falla, la etiqueta
 * sigue anadiendose al formulario, porque no es imprescindible para guardar.
 */
"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CircleNotch, MagnifyingGlass, Plus, X } from "@phosphor-icons/react";
import { cmsFetch, isSupabaseConfigured } from "@/lib/cms/session";

const DEBOUNCE_MS = 300;

interface TagInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  /** Tipo de `public.category_type`: amenity, typology, product_type… */
  categoryType?: string;
}

interface CategoryRow {
  name?: unknown;
}

export function TagInput({
  label,
  values = [],
  onChange,
  placeholder,
  categoryType,
}: TagInputProps) {
  const [input, setInput] = useState("");
  /**
   * El resultado guarda la busqueda que lo produjo, de modo que uno viejo se
   * descarta al pintar. Asi el efecto no necesita limpiar estado de forma
   * sincrona, que es lo que encadena renders.
   */
  const [result, setResult] = useState<{ query: string; names: string[] }>({
    query: "",
    names: [],
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = input.trim();

  useEffect(() => {
    if (!categoryType || !query || !isSupabaseConfigured()) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      const term = encodeURIComponent(`*${query}*`);
      cmsFetch(
        `rest/v1/categories?select=name&type=eq.${encodeURIComponent(categoryType)}&name=ilike.${term}&limit=8`,
        { allowAnonymous: true, signal: controller.signal },
      )
        .then(async (response) => {
          if (!response.ok) return [];
          const data: unknown = await response.json();
          if (!Array.isArray(data)) return [];
          return (data as CategoryRow[])
            .map((row) => row.name)
            .filter((name): name is string => typeof name === "string");
        })
        .then((names) => {
          if (!controller.signal.aborted) setResult({ query, names });
        })
        .catch(() => {
          if (!controller.signal.aborted) setResult({ query, names: [] });
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, categoryType]);

  /** El catalogo crece con lo que se escribe; los duplicados los ignora la base. */
  const rememberCategory = async (name: string) => {
    if (!categoryType || !isSupabaseConfigured()) return;
    try {
      await cmsFetch("rest/v1/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify({ type: categoryType, name }),
      });
    } catch {
      /* El catalogo es una ayuda: su fallo no bloquea el formulario. */
    }
  };

  const addTag = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    // Al vaciar la busqueda, las sugerencias derivadas desaparecen solas.
    setInput("");
    inputRef.current?.focus();
    void rememberCategory(trimmed);
  };

  const removeTag = (index: number) => {
    onChange(values.filter((_, position) => position !== index));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (query) addTag(query);
    } else if (event.key === "Backspace" && !input && values.length > 0) {
      removeTag(values.length - 1);
    } else if (event.key === "Escape") {
      setInput("");
    }
  };

  const matches = result.query === query ? result.names : [];
  const suggestions = matches.filter((name) => !values.includes(name));
  const canCreate =
    query.length > 0 &&
    !values.includes(query) &&
    !suggestions.some((name) => name.toLowerCase() === query.toLowerCase());

  return (
    <div className="admin-field admin-tag-field">
      <span className="admin-field-label">{label}</span>
      <div className="admin-tags-container">
        {values.map((value, index) => (
          <span key={`${value}-${index}`} className="admin-tag">
            <span>{value}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              aria-label={`Quitar ${value}`}
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={values.length > 0 ? "Añadir otro…" : placeholder}
          className="admin-tag-input"
          aria-label={label}
          autoComplete="off"
        />
      </div>
      {query && (
        <div className="admin-tag-suggestions">
          {loading && (
            <span className="tag-suggestion-item muted">
              <CircleNotch size={14} className="spin" /> Buscando…
            </span>
          )}
          {suggestions.map((name) => (
            <button
              key={name}
              type="button"
              className="tag-suggestion-item"
              onClick={() => addTag(name)}
            >
              <MagnifyingGlass size={14} /> {name}
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              className="tag-suggestion-item is-new"
              onClick={() => addTag(query)}
            >
              <Plus size={14} /> Crear «{query}»
            </button>
          )}
        </div>
      )}
    </div>
  );
}
