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
 */
"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  CircleNotch,
  Plus,
  Warning,
} from "@phosphor-icons/react";
import { cmsFetch, describeError, readErrorMessage } from "@/lib/cms/session";

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

      <nav className="npf-tabs" role="tablist" aria-label="Sección de categorías" style={{ marginBottom: 20 }}>
        <button
          type="button"
          role="tab"
          aria-selected={section === "propiedad"}
          className={`npf-tab${section === "propiedad" ? " is-active" : ""}`}
          onClick={() => setSection("propiedad")}
        >
          <span className="npf-tab-label">Categorías de propiedad</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={section === "amenidades"}
          className={`npf-tab${section === "amenidades" ? " is-active" : ""}`}
          onClick={() => setSection("amenidades")}
        >
          <span className="npf-tab-label">Grupos de amenidades</span>
        </button>
      </nav>

      {section === "propiedad" ? <PropertyCategoriesSection /> : <AmenityGroupsSection />}
    </>
  );
}

function PropertyCategoriesSection() {
  const [rows, setRows] = useState<PropertyCategoryRow[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [reloadToken, setReloadToken] = useState(0);

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
        setFeedback({ tone: "error", message: describeError(error) });
      });
    return () => controller.abort();
  }, [reloadToken]);

  const reload = () => setReloadToken((n) => n + 1);

  const createRow = async (input: {
    key: string;
    label_es: string;
    label_en: string;
    label_fr: string;
    sort_order: number;
  }) => {
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
      setFeedback({ tone: "ok", message: `Categoría «${input.label_es}» creada.` });
      reload();
    } catch (error) {
      setFeedback({ tone: "error", message: describeError(error) });
    }
  };

  const saveRow = async (row: PropertyCategoryRow) => {
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
      setFeedback({ tone: "ok", message: `Categoría «${row.label_es}» actualizada.` });
      reload();
    } catch (error) {
      setFeedback({ tone: "error", message: describeError(error) });
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
          <CategoryTable rows={rows} onSave={saveRow} />
          <NewCategoryForm onCreate={createRow} existingKeys={rows.map((r) => r.key)} />
        </>
      )}
    </div>
  );
}

function CategoryTable({
  rows,
  onSave,
}: {
  rows: PropertyCategoryRow[];
  onSave: (row: PropertyCategoryRow) => Promise<void>;
}) {
  if (rows.length === 0) {
    return <p className="admin-empty">Todavía no hay categorías de propiedad.</p>;
  }

  return (
    <div className="admin-table-wrap" style={{ marginBottom: 20 }}>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Orden</th>
            <th>Clave</th>
            <th>Español</th>
            <th>Inglés</th>
            <th>Francés</th>
            <th>Activa</th>
            <th style={{ textAlign: "right" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <PropertyCategoryTableRow key={row.id} row={row} onSave={onSave} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Fila editable con su propio borrador local, inicializado desde `row` solo
 * en el montaje (React lo reinicia únicamente si cambia la `key`, es decir,
 * el id): así no hace falta sincronizar el borrador con un efecto.
 */
function PropertyCategoryTableRow({
  row,
  onSave,
}: {
  row: PropertyCategoryRow;
  onSave: (row: PropertyCategoryRow) => Promise<void>;
}) {
  const [draft, setDraft] = useState(row);
  const [saving, setSaving] = useState(false);
  const dirty =
    draft.key !== row.key ||
    draft.label_es !== row.label_es ||
    (draft.label_en ?? "") !== (row.label_en ?? "") ||
    (draft.label_fr ?? "") !== (row.label_fr ?? "") ||
    draft.sort_order !== row.sort_order ||
    draft.is_active !== row.is_active;
  const patch = (changes: Partial<PropertyCategoryRow>) =>
    setDraft((current) => ({ ...current, ...changes }));

  return (
    <tr>
      <td>
        <input
          type="number"
          value={draft.sort_order}
          onChange={(e) => patch({ sort_order: Number(e.target.value) || 0 })}
          style={{ width: 64 }}
        />
      </td>
      <td>
        <input
          type="text"
          value={draft.key}
          onChange={(e) => patch({ key: slugifyKey(e.target.value) })}
          style={{ width: 120 }}
        />
      </td>
      <td>
        <input type="text" value={draft.label_es} onChange={(e) => patch({ label_es: e.target.value })} />
      </td>
      <td>
        <input
          type="text"
          value={draft.label_en ?? ""}
          onChange={(e) => patch({ label_en: e.target.value })}
          placeholder="—"
        />
      </td>
      <td>
        <input
          type="text"
          value={draft.label_fr ?? ""}
          onChange={(e) => patch({ label_fr: e.target.value })}
          placeholder="—"
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={draft.is_active}
          onChange={(e) => patch({ is_active: e.target.checked })}
          aria-label={`${row.label_es} activa`}
        />
      </td>
      <td>
        <div className="admin-row-actions">
          <button
            type="button"
            className="button button-outline"
            disabled={!dirty || saving}
            onClick={async () => {
              setSaving(true);
              await onSave(draft);
              setSaving(false);
            }}
          >
            {saving ? <CircleNotch size={14} className="spin" /> : "Guardar"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function NewCategoryForm({
  onCreate,
  existingKeys,
}: {
  onCreate: (input: { key: string; label_es: string; label_en: string; label_fr: string; sort_order: number }) => Promise<void>;
  existingKeys: string[];
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
    await onCreate({
      key: effectiveKey,
      label_es: labelEs.trim(),
      label_en: labelEn.trim(),
      label_fr: labelFr.trim(),
      sort_order: sortOrder,
    });
    setSaving(false);
    setLabelEs("");
    setKey("");
    setLabelEn("");
    setLabelFr("");
    setSortOrder(0);
  };

  return (
    <fieldset className="npf-fieldset">
      <legend>Nueva categoría de propiedad</legend>
      <div className="admin-field-row admin-field-row--triple">
        <label className="admin-field">
          Español (obligatorio)
          <input type="text" value={labelEs} onChange={(e) => setLabelEs(e.target.value)} placeholder="Ej. Villa de lujo" />
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
      <div className="admin-actions">
        <button type="button" className="button button-primary" disabled={!canSubmit} onClick={() => void submit()}>
          <Plus size={16} /> {saving ? "Creando…" : "Crear categoría"}
        </button>
      </div>
    </fieldset>
  );
}

function AmenityGroupsSection() {
  const [rows, setRows] = useState<AmenityGroupRow[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [reloadToken, setReloadToken] = useState(0);

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
        setFeedback({ tone: "error", message: describeError(error) });
      });
    return () => controller.abort();
  }, [reloadToken]);

  const reload = () => setReloadToken((n) => n + 1);

  const saveRow = async (row: AmenityGroupRow) => {
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
      setFeedback({ tone: "ok", message: `Grupo «${row.label_es}» actualizado.` });
      reload();
    } catch (error) {
      setFeedback({ tone: "error", message: describeError(error) });
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
      setFeedback({ tone: "ok", message: `Grupo «${labelEs.trim()}» creado.` });
      setLabelEs("");
      setKey("");
      setLabelEn("");
      setLabelFr("");
      setSortOrder(0);
      reload();
    } catch (error) {
      setFeedback({ tone: "error", message: describeError(error) });
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

      {state !== "loading" && rows.length === 0 && (
        <p className="admin-empty">Todavía no hay grupos de amenidades.</p>
      )}

      {state !== "loading" && rows.length > 0 && (
        <div className="admin-table-wrap" style={{ marginBottom: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Clave</th>
                <th>Español</th>
                <th>Inglés</th>
                <th>Francés</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <AmenityGroupTableRow key={row.id} row={row} onSave={saveRow} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <fieldset className="npf-fieldset">
        <legend>Nuevo grupo de amenidades</legend>
        <div className="admin-field-row admin-field-row--triple">
          <label className="admin-field">
            Español (obligatorio)
            <input type="text" value={labelEs} onChange={(e) => setLabelEs(e.target.value)} placeholder="Ej. Seguridad" />
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
        <div className="admin-actions">
          <button type="button" className="button button-primary" disabled={!canSubmit} onClick={() => void createRow()}>
            <Plus size={16} /> {creating ? "Creando…" : "Crear grupo"}
          </button>
        </div>
      </fieldset>
    </div>
  );
}

/** Misma idea que `PropertyCategoryTableRow`: borrador local sin efecto. */
function AmenityGroupTableRow({
  row,
  onSave,
}: {
  row: AmenityGroupRow;
  onSave: (row: AmenityGroupRow) => Promise<void>;
}) {
  const [draft, setDraft] = useState(row);
  const [saving, setSaving] = useState(false);
  const dirty =
    draft.key !== row.key ||
    draft.label_es !== row.label_es ||
    (draft.label_en ?? "") !== (row.label_en ?? "") ||
    (draft.label_fr ?? "") !== (row.label_fr ?? "") ||
    draft.sort_order !== row.sort_order;
  const patch = (changes: Partial<AmenityGroupRow>) =>
    setDraft((current) => ({ ...current, ...changes }));

  return (
    <tr>
      <td>
        <input
          type="number"
          value={draft.sort_order}
          onChange={(e) => patch({ sort_order: Number(e.target.value) || 0 })}
          style={{ width: 64 }}
        />
      </td>
      <td>
        <input
          type="text"
          value={draft.key}
          onChange={(e) => patch({ key: slugifyKey(e.target.value) })}
          style={{ width: 120 }}
        />
      </td>
      <td>
        <input type="text" value={draft.label_es} onChange={(e) => patch({ label_es: e.target.value })} />
      </td>
      <td>
        <input type="text" value={draft.label_en ?? ""} onChange={(e) => patch({ label_en: e.target.value })} placeholder="—" />
      </td>
      <td>
        <input type="text" value={draft.label_fr ?? ""} onChange={(e) => patch({ label_fr: e.target.value })} placeholder="—" />
      </td>
      <td>
        <div className="admin-row-actions">
          <button
            type="button"
            className="button button-outline"
            disabled={!dirty || saving}
            onClick={async () => {
              setSaving(true);
              await onSave(draft);
              setSaving(false);
            }}
          >
            {saving ? <CircleNotch size={14} className="spin" /> : "Guardar"}
          </button>
        </div>
      </td>
    </tr>
  );
}
