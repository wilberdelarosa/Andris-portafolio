/**
 * Alta de un proyecto en el esquema normalizado de Supabase.
 *
 * El formulario de `/admin` guardaba solo un borrador en `localStorage` y
 * anunciaba que el proyecto "aparecera en el catalogo automaticamente", cosa
 * que no ocurria. Este modulo escribe de verdad en las tablas que alimentan la
 * vista `api_projects_v1`.
 *
 * PostgREST no ofrece transacciones entre peticiones, asi que si un paso falla
 * se borra la fila de `projects` y el borrado en cascada limpia el resto: es
 * preferible no dejar nada a dejar un proyecto a medias en el catalogo.
 */
"use client";

import { cmsFetch, readErrorMessage } from "./session.ts";

export interface NewProjectInput {
  slug: string;
  name: string;
  /** `true` publica en el catalogo; `false` lo deja en borrador editorial. */
  publish: boolean;
  sector: string;
  city: string;
  province: string;
  description: string;
  deliveryLabel: string;
  deliveryYear: number | null;
  /**
   * Evidencia declarada a mano en el formulario. El ano de entrega llega
   * prerrellenado, asi que darlo por documentado publicaria una fecha que
   * nadie confirmo.
   */
  deliveryConfirmed: boolean;
  priceConfirmed: boolean;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  areaMin: number;
  areaMax: number;
  greenArea: number;
  priceFrom: number | null;
  priceTo: number | null;
  reservation: number | null;
  productTypes: string[];
  typologies: string[];
  amenities: string[];
  investmentBenefits: string[];
  nearby: string[];
  includesAppliances: boolean;
  mapUrl: string;
  coordinates: [number, number] | null;
  hero: string;
  gallery: string[];
  payment: { signing: number; construction: number; delivery: number };
}

export class WriteDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WriteDeniedError";
  }
}

/** Clave estable para `amenity_key` y `field_key`. */
function toKey(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

async function send<T>(
  path: string,
  body: unknown,
  options: { upsertOn?: string; expectRows?: boolean } = {},
): Promise<T> {
  const query = options.upsertOn ? `?on_conflict=${options.upsertOn}` : "";
  const prefer = [
    options.upsertOn ? "resolution=merge-duplicates" : null,
    options.expectRows ? "return=representation" : "return=minimal",
  ]
    .filter(Boolean)
    .join(",");

  const response = await cmsFetch(`rest/v1/${path}${query}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: prefer },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await readErrorMessage(response);
    if (response.status === 401 || response.status === 403) {
      throw new WriteDeniedError(detail);
    }
    // PostgREST devuelve 404 cuando RLS oculta la tabla por completo.
    if (response.status === 404 && /not find the table/i.test(detail)) {
      throw new Error(`Falta una tabla del esquema CMS: ${detail}`);
    }
    throw new Error(detail);
  }
  return options.expectRows ? ((await response.json()) as T) : (undefined as T);
}

interface IdRow {
  id: string;
}

/** Idioma unico por ahora: el formulario recoge el texto en espanol. */
function translationRows(projectId: string, input: NewProjectInput) {
  return (["es", "en", "fr"] as const).map((locale) => ({
    project_id: projectId,
    locale,
    headline: input.deliveryLabel || null,
    description: input.description || null,
  }));
}

function specRows(
  projectId: string,
  fieldIds: Record<string, string>,
  input: NewProjectInput,
) {
  const rows: Record<string, unknown>[] = [];
  const push = (key: string, value: Record<string, unknown>) => {
    const fieldId = fieldIds[key];
    if (fieldId) rows.push({ project_id: projectId, field_id: fieldId, ...value });
  };
  const list = (key: string, values: string[]) => {
    if (values.length > 0) push(key, { value_json: values, source_status: "documented" });
  };

  list("product_types", input.productTypes);
  list("typologies", input.typologies);
  list("investment_benefits", input.investmentBenefits);
  list("nearby_places", input.nearby);
  if (input.greenArea > 0) {
    push("green_area_m2", { value_number: input.greenArea, source_status: "documented" });
  }
  push("includes_appliances", {
    value_boolean: input.includesAppliances,
    source_status: input.includesAppliances ? "documented" : "pending",
  });
  return rows;
}

const SPEC_FIELDS = [
  { field_key: "product_types", label_es: "Tipos de producto", group_key: "space", data_type: "text", display_order: 10 },
  { field_key: "typologies", label_es: "Tipologías", group_key: "space", data_type: "text", display_order: 20 },
  { field_key: "investment_benefits", label_es: "Beneficios de inversión", group_key: "investment", data_type: "text", display_order: 30 },
  { field_key: "nearby_places", label_es: "Lugares cercanos", group_key: "location", data_type: "text", display_order: 40 },
  { field_key: "green_area_m2", label_es: "Área verde", group_key: "space", data_type: "number", unit: "m²", display_order: 50 },
  { field_key: "includes_appliances", label_es: "Incluye línea blanca", group_key: "operation", data_type: "boolean", display_order: 60 },
];

/**
 * Crea el proyecto y todas sus filas asociadas. Devuelve el id creado.
 * Lanza `WriteDeniedError` cuando RLS bloquea la escritura, para que la
 * interfaz pueda ofrecer la alternativa local en vez de un error crudo.
 */
export async function createProject(input: NewProjectInput): Promise<string> {
  const evidence = (value: unknown) => (value ? "documented" : "pending");
  const confirmed = (flag: boolean) => (flag ? "documented" : "pending");

  const created = await send<IdRow[]>(
    "projects",
    {
      slug: input.slug,
      name: input.name,
      public_status: input.publish ? "published" : "draft",
      sales_status: "consultar",
      property_category: "otro",
      sector: input.sector || null,
      city: input.city || null,
      province: input.province || null,
      published_at: input.publish ? new Date().toISOString() : null,
    },
    { expectRows: true },
  );

  const projectId = created[0]?.id;
  if (!projectId) throw new Error("Supabase no devolvió el proyecto creado.");

  try {
    await send("project_translations", translationRows(projectId, input), {
      upsertOn: "project_id,locale",
    });

    await send("project_locations", {
      project_id: projectId,
      latitude: input.coordinates?.[0] ?? null,
      longitude: input.coordinates?.[1] ?? null,
      map_label: input.mapUrl || null,
      sector: input.sector || null,
      city: input.city || null,
      province: input.province || null,
      source_status: evidence(input.coordinates),
    });

    await send("project_phases", {
      project_id: projectId,
      name: input.deliveryLabel || "Entrega",
      delivery_year: input.deliveryYear,
      status: "consultar",
      source_status: confirmed(input.deliveryConfirmed),
    });

    await send("project_unit_types", {
      project_id: projectId,
      name: input.typologies[0] ?? "Tipología única",
      property_type: "otro",
      bedrooms_min: input.bedrooms || null,
      bedrooms_max: input.bedrooms || null,
      bathrooms_min: input.bathrooms || null,
      bathrooms_max: input.bathrooms || null,
      area_min_m2: input.areaMin || null,
      area_max_m2: input.areaMax || input.areaMin || null,
      parking_min: input.parking || null,
      parking_max: input.parking || null,
      furnished_status: input.includesAppliances ? "yes" : "unknown",
      source_status: evidence(input.areaMin),
    });

    // Los precios son historicos: se anade una foto nueva, nunca se sobrescribe.
    if (input.priceFrom !== null || input.priceTo !== null || input.reservation !== null) {
      await send("project_price_snapshots", {
        project_id: projectId,
        currency: "USD",
        price_from: input.priceFrom,
        price_to: input.priceTo,
        reservation_amount: input.reservation,
        effective_from: new Date().toISOString().slice(0, 10),
        source_status: confirmed(input.priceConfirmed),
        notes: "Registrado desde el estudio CMS.",
      });
    }

    await send("project_payment_plans", {
      project_id: projectId,
      initial_percent: input.payment.signing,
      during_construction_percent: input.payment.construction,
      on_delivery_percent: input.payment.delivery,
      reservation_amount: input.reservation,
      currency: "USD",
      source_status: "pending",
    });

    const media = [
      input.hero
        ? {
            project_id: projectId,
            media_type: "hero",
            url: input.hero,
            alt_es: `Vista principal de ${input.name}`,
            rights_status: "developer_provided",
            sort_order: 0,
          }
        : null,
      ...input.gallery.filter(Boolean).map((url, index) => ({
        project_id: projectId,
        media_type: "gallery",
        url,
        alt_es: `${input.name}, imagen ${index + 1}`,
        rights_status: "developer_provided",
        sort_order: index + 1,
      })),
    ].filter(Boolean);
    if (media.length > 0) await send("project_media", media);

    if (input.amenities.length > 0) {
      const rows = await send<IdRow[]>(
        "amenities",
        input.amenities.map((label, index) => ({
          amenity_key: toKey(label),
          label_es: label,
          display_order: index,
        })),
        { upsertOn: "amenity_key", expectRows: true },
      );
      if (rows.length > 0) {
        await send(
          "project_amenities",
          rows.map((row) => ({
            project_id: projectId,
            amenity_id: row.id,
            availability: "included",
            source_status: "documented",
          })),
          { upsertOn: "project_id,amenity_id,phase_id" },
        );
      }
    }

    // Las listas sueltas viven en `project_spec_values`, que es la tabla
    // pensada para atributos variables sin tocar el esquema.
    const fields = await send<{ id: string; field_key: string }[]>(
      "specification_fields",
      SPEC_FIELDS,
      { upsertOn: "field_key", expectRows: true },
    );
    const fieldIds = Object.fromEntries(
      fields.map((field) => [field.field_key, field.id]),
    );
    const specs = specRows(projectId, fieldIds, input);
    if (specs.length > 0) {
      await send("project_spec_values", specs, {
        upsertOn: "project_id,field_id,phase_id,unit_type_id",
      });
    }

    return projectId;
  } catch (error) {
    // Cascada: al borrar el proyecto desaparecen sus filas hijas.
    try {
      await cmsFetch(`rest/v1/projects?id=eq.${projectId}`, { method: "DELETE" });
    } catch {
      /* Si tampoco se puede borrar, el error original sigue siendo el relevante. */
    }
    throw error;
  }
}

export interface EditorProfile {
  id: string;
  role: "admin" | "editor";
  fullName: string | null;
}

/**
 * Perfil editorial de la sesion actual.
 *
 * `cms_profiles` solo deja ver la fila propia, asi que una respuesta vacia
 * significa que el usuario existe en Auth pero nadie lo dio de alta como
 * editor: es exactamente la condicion que impide escribir en el catalogo.
 * Se comprueba leyendo, nunca con una escritura de prueba.
 */
export async function getEditorProfile(): Promise<EditorProfile | null> {
  try {
    const response = await cmsFetch(
      "rest/v1/cms_profiles?select=id,role,full_name&limit=1",
    );
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const row = data[0] as Record<string, unknown>;
    return {
      id: String(row.id ?? ""),
      role: row.role === "admin" ? "admin" : "editor",
      fullName: typeof row.full_name === "string" ? row.full_name : null,
    };
  } catch {
    return null;
  }
}
