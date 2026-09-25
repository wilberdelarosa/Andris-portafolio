/**
 * Módulo de administración de categorías (`property_categories` y
 * `amenity_groups`).
 *
 * Antes no existía ningún lugar donde gestionar estas dos tablas: la
 * categoría de propiedad se hardcodeaba a `'otro'` al crear un proyecto y las
 * amenidades usaban una columna de texto libre (`amenities.category`) sin
 * catálogo cerrado. Este panel deja ver, crear, editar y desactivar ambas
 * listas sin tocar el editor SQL.
 *
 * No hay borrado físico: `property_categories.is_active` se apaga en vez de
 * borrar la fila, porque un proyecto ya puede estar referenciándola por FK.
 * `amenity_groups` no tiene columna `is_active` en el esquema actual (0007),
 * así que aquí solo se puede crear y editar sus etiquetas/orden; no se ofrece
 * ningún botón de borrado tampoco, para no dejar amenidades con `group_id`
 * huérfano.
 *
 * Presentación: la lista se pinta como tarjetas (`.admin-category-card`), no
 * como tabla. Antes era una `<table>` envuelta en `.admin-table-wrap`, que es
 * la misma clase que usan Leads y Cotizaciones — pero esas dos pestañas
 * además duplican su contenido en `.admin-list-cards` para móvil, y esta no
 * lo hacía. Por debajo de 1100px `.admin-table-wrap` se oculta (ver esa regla
 * en `admin.css`) y aquí no había nada detrás: la lista de categorías
 * desaparecía por completo en el teléfono. Una sola lista de tarjetas, sin
 * marcado paralelo, evita esa clase de bug de raíz y de paso deja "editar"
 * como una acción explícita (abre un modal) en vez de una celda editable
 * inline, que es lo que pidió el dueño.
 */
"use client";

import { useMemo, useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  CheckCircle,
  CircleNotch,
  ListChecks,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Tag,
  Warning,
  X,
} from "@phosphor-icons/react";
import { cmsFetch, describeError, readErrorMessage } from "@/lib/cms/session";
import { useAdminToast } from "./admin-toast";

interface PropertyCategoryRow {
  id: string;
  key: string;
  label_es: string;
  label_en: string | null;
  label_fr: string | null;
  sort_order: number;
  is_active: boolean;
}

interface AmenityGroupRow {
  id: string;
  key: string;
  label_es: string;
  label_en: string | null;
  label_fr: string | null;
  sort_order: number;
}

type LoadState = "loading" | "ready" | "error";
type Feedback = { tone: "ok" | "error"; message: string } | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toPropertyCategoryRow(value: unknown): PropertyCategoryRow | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const key = asString(value.key);
  const label_es = asString(value.label_es);
  if (!id || !key || !label_es) return null;
  return {
    id,
    key,
    label_es,
    label_en: asNullableString(value.label_en),
    label_fr: asNullableString(value.label_fr),
    sort_order: asNumber(value.sort_order, 0),
    is_active: value.is_active !== false,
  };
}

function toAmenityGroupRow(value: unknown): AmenityGroupRow | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const key = asString(value.key);
  const label_es = asString(value.label_es);
  if (!id || !key || !label_es) return null;
  return {
    id,
    key,
    label_es,
    label_en: asNullableString(value.label_en),
    label_fr: asNullableString(value.label_fr),
    sort_order: asNumber(value.sort_order, 0),
  };
}

/** Misma normalización que `toKey` en `project-writer.ts`, para llaves consistentes. */
function slugifyKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

/** Coincide por nombre (en cualquier idioma) o por clave interna. */
function matchesQuery(
  row: { key: string; label_es: string; label_en: string | null; label_fr: string | null },
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    row.label_es.toLowerCase().includes(q) ||
    (row.label_en ?? "").toLowerCase().includes(q) ||
    (row.label_fr ?? "").toLowerCase().includes(q) ||
    row.key.toLowerCase().includes(q)
  );
}

export function CategoryManager() {
  const [section, setSection] = useState<"propiedad" | "amenidades">("propiedad");

  return (
    <>
      <div className="admin-page-head">
        <p className="kicker">Taxonomía</p>
        <h1>Categorías</h1>
        <p>
          Categoría real de propiedad y grupos de amenidades: lo que elijas
          aquí es lo que aparece en el combo box de «Añadir proyecto» y en el
          filtro público del catálogo. No hay texto libre.
        </p>
      </div>

      {/*
        Misma tira de pestañas que el asistente de alta (`.npf-tabs`), con
        icono incluido: sin él estas dos pestañas se quedaban sin nada visible
        en móvil, porque la hoja del asistente ocultaba la etiqueta contando
        con que hubiera un icono detrás.
      */}
      <nav className="npf-tabs npf-tabs--section" role="tablist" aria-label="Sección de categorías">
        <button
          type="button"
          role="tab"
          aria-selected={section === "propiedad"}
          className={`npf-tab${section === "propiedad" ? " is-active" : ""}`}
          onClick={() => setSection("propiedad")}
        >
          <Tag size={17} weight={section === "propiedad" ? "fill" : "regular"} />
          <span className="npf-tab-label">Categorías de propiedad</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={section === "amenidades"}
          className={`npf-tab${section === "amenidades" ? " is-active" : ""}`}
          onClick={() => setSection("amenidades")}
        >
          <ListChecks size={17} weight={section === "amenidades" ? "fill" : "regular"} />
          <span className="npf-tab-label">Grupos de amenidades</span>
        </button>
      </nav>

      {section === "propiedad" ? <PropertyCategoriesSection /> : <AmenityGroupsSection />}
    </>
  );
}

/* ---------------------------------------------------------------------------
   Buscador — mismo patrón visual que `.admin-search` en Proyectos.
--------------------------------------------------------------------------- */
function CategorySearchField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="admin-search admin-category-search">
      <MagnifyingGlass size={17} aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por nombre o clave…"
        aria-label={label}
      />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Tarjeta de categoría — reemplaza la fila de tabla.
--------------------------------------------------------------------------- */
function CategoryCard({
  label,
  keySlug,
  sortOrder,
  statusChip,
  onEdit,
}: {
  label: string;
  keySlug: string;
  sortOrder: number;
  statusChip?: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <article className="admin-category-card">
      <div className="meta">
        <div className="row">
          <strong>{label}</strong>
          {statusChip}
        </div>
        <div className="row">
          <code className="admin-category-key">{keySlug}</code>
          <span className="admin-category-order">Orden {sortOrder}</span>
        </div>
      </div>
      <div className="admin-row-actions">
        <button type="button" className="button button-outline" onClick={onEdit}>
          <PencilSimple size={15} /> Editar
        </button>
      </div>
    </article>
  );
}

function CategoryListEmptyState({
  hasAny,
  search,
  emptyLabel,
}: {
  hasAny: boolean;
  search: string;
  emptyLabel: string;
}) {
  if (!hasAny) return <p className="admin-empty">{emptyLabel}</p>;
  return <p className="admin-empty">Ninguna coincide con «{search.trim()}».</p>;
}

/* ---------------------------------------------------------------------------
   Modal de edición — reutiliza el patrón de diálogo del sitio
   (`Dialog` de Radix + las clases `.dialog-overlay`/`.dialog-content` que ya
   define `globals.css`, incluida su transformación a hoja inferior en
   móvil). El `Modal` compartido de `src/components/ui.tsx` usa esas mismas
   clases pero exige `ExperienceProvider` (idioma/tema del sitio público, que
   `/admin` no monta en ningún otro punto); envolverlo aquí solo para
   reutilizar una etiqueta de botón habría arrastrado ese contexto entero a
   una pantalla de administración. Este wrapper es el mismo patrón (Radix +
   las clases ya existentes), sin esa dependencia de más.
--------------------------------------------------------------------------- */
function CategoryEditModal({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content admin-edit-modal">
          <div className="dialog-header">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-action" aria-label="Cerrar">
              <X size={20} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Formulario para editar los campos de esta categoría.
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ---------------------------------------------------------------------------
   Categorías de propiedad
--------------------------------------------------------------------------- */
function PropertyCategoriesSection() {
  const { notify } = useAdminToast();
  const [rows, setRows] = useState<PropertyCategoryRow[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<PropertyCategoryRow | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    cmsFetch(
      "rest/v1/property_categories?select=id,key,label_es,label_en,label_fr,sort_order,is_active&order=sort_order.asc",
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(await readErrorMessage(response));
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Supabase devolvió una respuesta inesperada.");
        return data.map(toPropertyCategoryRow).filter((row): row is PropertyCategoryRow => row !== null);
      })
      .then((next) => {
        if (controller.signal.aborted) return;
        setRows(next);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState("error");
        const message = describeError(error);
        setFeedback({ tone: "error", message });
        notify({ tone: "error", message: `No se pudieron cargar las categorías: ${message}` });
      });
    return () => controller.abort();
  }, [notify, reloadToken]);

  const reload = () => setReloadToken((n) => n + 1);

  const filtered = useMemo(
    () => rows.filter((row) => matchesQuery(row, search)),
    [rows, search],
  );

  /**
   * Devuelve si la escritura tuvo éxito: el modal de alta la usa para
   * cerrarse solo cuando la categoría quedó creada, igual que el de edición.
   */
  const createRow = async (input: {
    key: string;
    label_es: string;
    label_en: string;
    label_fr: string;
    sort_order: number;
  }): Promise<boolean> => {
    try {
      const response = await cmsFetch("rest/v1/property_categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          key: input.key,
          label_es: input.label_es,
          label_en: input.label_en || null,
          label_fr: input.label_fr || null,
          sort_order: input.sort_order,
        }),
      });
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const message = `Categoría «${input.label_es}» creada.`;
      setFeedback({ tone: "ok", message });
      notify({ tone: "success", message });
      reload();
      return true;
    } catch (error) {
      const message = describeError(error);
      setFeedback({ tone: "error", message });
      notify({ tone: "error", message: `No se pudo crear la categoría: ${message}` });
      return false;
    }
  };

  /**
   * Devuelve si la escritura tuvo éxito: el modal la usa para decidir si se
   * cierra solo (éxito) o se queda abierto con el borrador intacto para
   * reintentar (fallo) — la propia llamada a Supabase, cabeceras y payload
   * son exactamente los mismos que antes.
   */
  const saveRow = async (row: PropertyCategoryRow): Promise<boolean> => {
    try {
      const response = await cmsFetch(`rest/v1/property_categories?id=eq.${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          key: row.key,
          label_es: row.label_es,
          label_en: row.label_en || null,
          label_fr: row.label_fr || null,
          sort_order: row.sort_order,
          is_active: row.is_active,
        }),
      });
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const message = `Categoría «${row.label_es}» actualizada.`;
      setFeedback({ tone: "ok", message });
      notify({ tone: "success", message });
      reload();
      return true;
    } catch (error) {
      const message = describeError(error);
      setFeedback({ tone: "error", message });
      notify({ tone: "error", message: `No se pudo actualizar la categoría: ${message}` });
      return false;
    }
  };

  return (
    <div className="admin-card pad-lg">
      {feedback && (
        <div
          className={`admin-notification is-${feedback.tone === "ok" ? "success" : "error"}`}
          role="status"
        >
          {feedback.tone === "ok" ? <CheckCircle size={16} weight="fill" /> : <Warning size={16} weight="fill" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {state === "loading" && (
        <p className="admin-field-help"><CircleNotch size={14} className="spin" /> Cargando categorías…</p>
      )}

      {state !== "loading" && (
        <>
          {/*
            Cabecera con el total y el alta en modal: antes el formulario de
            «Nueva categoría» ocupaba siempre la parte baja de la tarjeta, y
            en móvil empujaba la lista fuera de la primera pantalla. Ahora la
            lista manda y el alta vive en el mismo diálogo que la edición.
          */}
          <div className="admin-section-head">
            <h2>
              {rows.length === 1 ? "1 categoría" : `${rows.length} categorías`}
            </h2>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setCreating(true)}
            >
              <Plus size={16} /> Añadir categoría
            </button>
          </div>

          <CategorySearchField
            value={search}
            onChange={setSearch}
            label="Buscar categorías de propiedad"
          />

          {filtered.length === 0 ? (
            <CategoryListEmptyState
              hasAny={rows.length > 0}
              search={search}
              emptyLabel="Todavía no hay categorías de propiedad. Empieza por «Añadir categoría»."
            />
          ) : (
            <div className="admin-category-list">
              {filtered.map((row) => (
                <CategoryCard
                  key={row.id}
                  label={row.label_es}
                  keySlug={row.key}
                  sortOrder={row.sort_order}
                  statusChip={
                    <span className={`chip ${row.is_active ? "ok" : "neutral"}`}>
                      <i />
                      {row.is_active ? "Activa" : "Inactiva"}
                    </span>
                  }
                  onEdit={() => setEditing(row)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {creating && (
        <CategoryEditModal
          open
          onOpenChange={(next) => !next && setCreating(false)}
          title="Nueva categoría de propiedad"
        >
          <NewCategoryForm
            onCreate={createRow}
            existingKeys={rows.map((r) => r.key)}
            onDone={() => setCreating(false)}
          />
        </CategoryEditModal>
      )}

      {editing && (
        <PropertyCategoryEditModal
          row={editing}
          existingKeys={rows.filter((r) => r.id !== editing.id).map((r) => r.key)}
          onSave={saveRow}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function PropertyCategoryEditModal({
  row,
  existingKeys,
  onSave,
  onClose,
}: {
  row: PropertyCategoryRow;
  existingKeys: string[];
  onSave: (row: PropertyCategoryRow) => Promise<boolean>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(row);
  const [saving, setSaving] = useState(false);
  const patch = (changes: Partial<PropertyCategoryRow>) =>
    setDraft((current) => ({ ...current, ...changes }));

  const effectiveKey = slugifyKey(draft.key);
  const duplicate = effectiveKey.length > 0 && existingKeys.includes(effectiveKey);
  const canSubmit = draft.label_es.trim().length > 0 && effectiveKey.length > 0 && !duplicate && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const ok = await onSave({ ...draft, key: effectiveKey, label_es: draft.label_es.trim() });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <CategoryEditModal open onOpenChange={(next) => !next && onClose()} title={`Editar «${row.label_es}»`}>
      <div className="npf-fieldset">
        <div className="admin-field-row admin-field-row--triple">
          <label className="admin-field">
            Español (obligatorio)
            <input type="text" value={draft.label_es} onChange={(e) => patch({ label_es: e.target.value })} />
          </label>
          <label className="admin-field">
            Inglés (opcional)
            <input
              type="text"
              value={draft.label_en ?? ""}
              onChange={(e) => patch({ label_en: e.target.value })}
              placeholder="—"
            />
          </label>
          <label className="admin-field">
            Francés (opcional)
            <input
              type="text"
              value={draft.label_fr ?? ""}
              onChange={(e) => patch({ label_fr: e.target.value })}
              placeholder="—"
            />
          </label>
        </div>
        <div className="admin-field-row">
          <label className="admin-field">
            Clave interna
            <input type="text" value={draft.key} onChange={(e) => patch({ key: slugifyKey(e.target.value) })} />
          </label>
          <label className="admin-field">
            Orden
            <input
              type="number"
              value={draft.sort_order}
              onChange={(e) => patch({ sort_order: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
        <label className="npf-check">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(e) => patch({ is_active: e.target.checked })}
          />
          Categoría activa (visible en el catálogo y en «Añadir proyecto»)
        </label>
        {duplicate && (
          <p className="admin-error-text">
            <Warning size={15} weight="fill" /> Ya existe otra categoría con la clave «{effectiveKey}».
          </p>
        )}
      </div>
      <div className="admin-actions" style={{ marginTop: 18 }}>
        <button type="button" className="button button-primary" disabled={!canSubmit} onClick={() => void submit()}>
          {saving ? <CircleNotch size={16} className="spin" /> : <CheckCircle size={16} />}
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <button type="button" className="button button-outline" disabled={saving} onClick={onClose}>
          <X size={16} /> Cancelar
        </button>
      </div>
    </CategoryEditModal>
  );
}

function NewCategoryForm({
  onCreate,
  existingKeys,
  onDone,
}: {
  onCreate: (input: { key: string; label_es: string; label_en: string; label_fr: string; sort_order: number }) => Promise<boolean>;
  existingKeys: string[];
  /** Se llama tras crear con éxito: el modal que lo aloja se cierra solo. */
  onDone: () => void;
}) {
  const [labelEs, setLabelEs] = useState("");
  const [key, setKey] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [labelFr, setLabelFr] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const effectiveKey = key.trim() ? slugifyKey(key) : slugifyKey(labelEs);
  const duplicate = effectiveKey.length > 0 && existingKeys.includes(effectiveKey);
  const canSubmit = labelEs.trim().length > 0 && effectiveKey.length > 0 && !duplicate && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const ok = await onCreate({
      key: effectiveKey,
      label_es: labelEs.trim(),
      label_en: labelEn.trim(),
      label_fr: labelFr.trim(),
      sort_order: sortOrder,
    });
    setSaving(false);
    if (ok) onDone();
  };

  return (
    <fieldset className="npf-fieldset">
      <legend className="sr-only">Datos de la nueva categoría</legend>
      <div className="admin-field-row admin-field-row--triple">
        <label className="admin-field">
          Español (obligatorio)
          <input type="text" value={labelEs} onChange={(e) => setLabelEs(e.target.value)} placeholder="Ej. Villa de lujo" autoFocus />
        </label>
        <label className="admin-field">
          Inglés (opcional)
          <input type="text" value={labelEn} onChange={(e) => setLabelEn(e.target.value)} />
        </label>
        <label className="admin-field">
          Francés (opcional)
          <input type="text" value={labelFr} onChange={(e) => setLabelFr(e.target.value)} />
        </label>
      </div>
      <div className="admin-field-row">
        <label className="admin-field">
          Clave interna
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={effectiveKey || "se genera del nombre en español"}
          />
        </label>
        <label className="admin-field">
          Orden
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} />
        </label>
      </div>
      {duplicate && (
        <p className="admin-error-text">
          <Warning size={15} weight="fill" /> Ya existe una categoría con la clave «{effectiveKey}».
        </p>
      )}
      <div className="admin-actions" style={{ marginTop: 4 }}>
        <button type="button" className="button button-primary" disabled={!canSubmit} onClick={() => void submit()}>
          <Plus size={16} /> {saving ? "Creando…" : "Crear categoría"}
        </button>
        <button type="button" className="button button-outline" disabled={saving} onClick={onDone}>
          <X size={16} /> Cancelar
        </button>
      </div>
    </fieldset>
  );
}

/* ---------------------------------------------------------------------------
   Grupos de amenidades
--------------------------------------------------------------------------- */
function AmenityGroupsSection() {
  const { notify } = useAdminToast();
  const [rows, setRows] = useState<AmenityGroupRow[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AmenityGroupRow | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    cmsFetch(
      "rest/v1/amenity_groups?select=id,key,label_es,label_en,label_fr,sort_order&order=sort_order.asc",
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(await readErrorMessage(response));
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Supabase devolvió una respuesta inesperada.");
        return data.map(toAmenityGroupRow).filter((row): row is AmenityGroupRow => row !== null);
      })
      .then((next) => {
        if (controller.signal.aborted) return;
        setRows(next);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState("error");
        const message = describeError(error);
        setFeedback({ tone: "error", message });
        notify({ tone: "error", message: `No se pudieron cargar los grupos: ${message}` });
      });
    return () => controller.abort();
  }, [notify, reloadToken]);

  const reload = () => setReloadToken((n) => n + 1);

  const filtered = useMemo(
    () => rows.filter((row) => matchesQuery(row, search)),
    [rows, search],
  );

  const saveRow = async (row: AmenityGroupRow): Promise<boolean> => {
    try {
      const response = await cmsFetch(`rest/v1/amenity_groups?id=eq.${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          key: row.key,
          label_es: row.label_es,
          label_en: row.label_en || null,
          label_fr: row.label_fr || null,
          sort_order: row.sort_order,
        }),
      });
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const message = `Grupo «${row.label_es}» actualizado.`;
      setFeedback({ tone: "ok", message });
      notify({ tone: "success", message });
      reload();
      return true;
    } catch (error) {
      const message = describeError(error);
      setFeedback({ tone: "error", message });
      notify({ tone: "error", message: `No se pudo actualizar el grupo: ${message}` });
      return false;
    }
  };

  const [labelEs, setLabelEs] = useState("");
  const [key, setKey] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [labelFr, setLabelFr] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [creating, setCreating] = useState(false);
  const effectiveKey = key.trim() ? slugifyKey(key) : slugifyKey(labelEs);
  const duplicate = effectiveKey.length > 0 && rows.some((r) => r.key === effectiveKey);
  const canSubmit = labelEs.trim().length > 0 && effectiveKey.length > 0 && !duplicate && !creating;

  const createRow = async () => {
    if (!canSubmit) return;
    setCreating(true);
    try {
      const response = await cmsFetch("rest/v1/amenity_groups", {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          key: effectiveKey,
          label_es: labelEs.trim(),
          label_en: labelEn.trim() || null,
          label_fr: labelFr.trim() || null,
          sort_order: sortOrder,
        }),
      });
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const message = `Grupo «${labelEs.trim()}» creado.`;
      setFeedback({ tone: "ok", message });
      notify({ tone: "success", message });
      setLabelEs("");
      setKey("");
      setLabelEn("");
      setLabelFr("");
      setSortOrder(0);
      setCreatingGroup(false);
      reload();
    } catch (error) {
      const message = describeError(error);
      setFeedback({ tone: "error", message });
      notify({ tone: "error", message: `No se pudo crear el grupo: ${message}` });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-card pad-lg">
      {feedback && (
        <div
          className={`admin-notification is-${feedback.tone === "ok" ? "success" : "error"}`}
          role="status"
        >
          {feedback.tone === "ok" ? <CheckCircle size={16} weight="fill" /> : <Warning size={16} weight="fill" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {state === "loading" && (
        <p className="admin-field-help"><CircleNotch size={14} className="spin" /> Cargando grupos de amenidades…</p>
      )}

      {state !== "loading" && (
        <>
          <div className="admin-section-head">
            <h2>{rows.length === 1 ? "1 grupo" : `${rows.length} grupos`}</h2>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setCreatingGroup(true)}
            >
              <Plus size={16} /> Añadir grupo
            </button>
          </div>

          <CategorySearchField
            value={search}
            onChange={setSearch}
            label="Buscar grupos de amenidades"
          />

          {filtered.length === 0 ? (
            <CategoryListEmptyState
              hasAny={rows.length > 0}
              search={search}
              emptyLabel="Todavía no hay grupos de amenidades. Empieza por «Añadir grupo»."
            />
          ) : (
            <div className="admin-category-list">
              {filtered.map((row) => (
                <CategoryCard
                  key={row.id}
                  label={row.label_es}
                  keySlug={row.key}
                  sortOrder={row.sort_order}
                  onEdit={() => setEditing(row)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {creatingGroup && (
        <CategoryEditModal
          open
          onOpenChange={(next) => !next && setCreatingGroup(false)}
          title="Nuevo grupo de amenidades"
        >
          <fieldset className="npf-fieldset">
            <legend className="sr-only">Datos del nuevo grupo</legend>
            <div className="admin-field-row admin-field-row--triple">
              <label className="admin-field">
                Español (obligatorio)
                <input type="text" value={labelEs} onChange={(e) => setLabelEs(e.target.value)} placeholder="Ej. Seguridad" autoFocus />
              </label>
              <label className="admin-field">
                Inglés (opcional)
                <input type="text" value={labelEn} onChange={(e) => setLabelEn(e.target.value)} />
              </label>
              <label className="admin-field">
                Francés (opcional)
                <input type="text" value={labelFr} onChange={(e) => setLabelFr(e.target.value)} />
              </label>
            </div>
            <div className="admin-field-row">
              <label className="admin-field">
                Clave interna
                <input type="text" value={key} onChange={(e) => setKey(e.target.value)} placeholder={effectiveKey || "se genera del nombre en español"} />
              </label>
              <label className="admin-field">
                Orden
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} />
              </label>
            </div>
            {duplicate && (
              <p className="admin-error-text">
                <Warning size={15} weight="fill" /> Ya existe un grupo con la clave «{effectiveKey}».
              </p>
            )}
            <div className="admin-actions" style={{ marginTop: 4 }}>
              <button type="button" className="button button-primary" disabled={!canSubmit} onClick={() => void createRow()}>
                <Plus size={16} /> {creating ? "Creando…" : "Crear grupo"}
              </button>
              <button type="button" className="button button-outline" disabled={creating} onClick={() => setCreatingGroup(false)}>
                <X size={16} /> Cancelar
              </button>
            </div>
          </fieldset>
        </CategoryEditModal>
      )}

      {editing && (
        <AmenityGroupEditModal
          row={editing}
          existingKeys={rows.filter((r) => r.id !== editing.id).map((r) => r.key)}
          onSave={saveRow}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function AmenityGroupEditModal({
  row,
  existingKeys,
  onSave,
  onClose,
}: {
  row: AmenityGroupRow;
  existingKeys: string[];
  onSave: (row: AmenityGroupRow) => Promise<boolean>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(row);
  const [saving, setSaving] = useState(false);
  const patch = (changes: Partial<AmenityGroupRow>) =>
    setDraft((current) => ({ ...current, ...changes }));

  const effectiveKey = slugifyKey(draft.key);
  const duplicate = effectiveKey.length > 0 && existingKeys.includes(effectiveKey);
  const canSubmit = draft.label_es.trim().length > 0 && effectiveKey.length > 0 && !duplicate && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const ok = await onSave({ ...draft, key: effectiveKey, label_es: draft.label_es.trim() });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <CategoryEditModal open onOpenChange={(next) => !next && onClose()} title={`Editar «${row.label_es}»`}>
      <div className="npf-fieldset">
        <div className="admin-field-row admin-field-row--triple">
          <label className="admin-field">
            Español (obligatorio)
            <input type="text" value={draft.label_es} onChange={(e) => patch({ label_es: e.target.value })} />
          </label>
          <label className="admin-field">
            Inglés (opcional)
            <input
              type="text"
              value={draft.label_en ?? ""}
              onChange={(e) => patch({ label_en: e.target.value })}
              placeholder="—"
            />
          </label>
          <label className="admin-field">
            Francés (opcional)
            <input
              type="text"
              value={draft.label_fr ?? ""}
              onChange={(e) => patch({ label_fr: e.target.value })}
              placeholder="—"
            />
          </label>
        </div>
        <div className="admin-field-row">
          <label className="admin-field">
            Clave interna
            <input type="text" value={draft.key} onChange={(e) => patch({ key: slugifyKey(e.target.value) })} />
          </label>
          <label className="admin-field">
            Orden
            <input
              type="number"
              value={draft.sort_order}
              onChange={(e) => patch({ sort_order: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
        {duplicate && (
          <p className="admin-error-text">
            <Warning size={15} weight="fill" /> Ya existe otro grupo con la clave «{effectiveKey}».
          </p>
        )}
      </div>
      <div className="admin-actions" style={{ marginTop: 18 }}>
        <button type="button" className="button button-primary" disabled={!canSubmit} onClick={() => void submit()}>
          {saving ? <CircleNotch size={16} className="spin" /> : <CheckCircle size={16} />}
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <button type="button" className="button button-outline" disabled={saving} onClick={onClose}>
          <X size={16} /> Cancelar
        </button>
      </div>
    </CategoryEditModal>
  );
}
