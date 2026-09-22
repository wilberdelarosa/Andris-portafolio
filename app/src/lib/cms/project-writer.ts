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
import type { Localized } from "../../content/projects.ts";

/**
 * Amenidad tal como la arma `RichAmenityBuilder` en `new-project-form.tsx`:
 * nombre localizado, imagen propia opcional, viñetas ya localizadas
 * (`{es,en,fr}` por cada una) y el grupo elegido en el combo box. `groupId`
 * viaja vacío cuando el editor no elige grupo; `createProject` resuelve el
 * `amenity_groups` "general" como respaldo, nunca lo deja sin catalogar.
 */
export interface AmenityInput {
  name: Localized;
  image?: string;
  features?: Localized[];
  groupId?: string;
}

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
  /** `property_categories.id` elegido en el combo box del formulario. */
  propertyCategoryId: string;
  /**
   * `property_categories.key` de esa misma fila. Se usa para sincronizar la
   * columna de texto vieja (`property_category` / `property_type`) mientras
   * esas columnas sigan existiendo (se retiran en una migración posterior).
   */
  propertyCategoryKey: string;
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
  amenities: AmenityInput[];
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

/** Lectura simple contra PostgREST, para resolver ids antes de escribir. */
async function fetchRows<T>(query: string): Promise<T> {
  const response = await cmsFetch(`rest/v1/${query}`);
  if (!response.ok) throw new Error(await readErrorMessage(response));
  return (await response.json()) as T;
}

interface IdRow {
  id: string;
}

/** Fila de `amenities` tal como la devuelve el upsert con `return=representation`. */
interface AmenityRow {
  id: string;
  amenity_key: string;
  image_url: string | null;
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
  /**
   * Mismo bug que en `SPEC_FIELDS`: cada fila solo llevaba UNA de
   * `value_json`/`value_number`/`value_boolean` según el tipo de dato, así
   * que en cuanto un proyecto tenía más de un tipo de spec (lo normal: casi
   * todos tienen `product_types` y `includes_appliances` a la vez) PostgREST
   * rechazaba el upsert entero con "All object keys must match" (PGRST102) y
   * el `catch` de `createProject` borraba el proyecto recién creado. Las tres
   * columnas van siempre presentes; la que no aplica queda en `null`, no
   * ausente.
   */
  const push = (
    key: string,
    value: {
      value_json?: unknown;
      value_number?: number | null;
      value_boolean?: boolean | null;
      source_status: string;
    },
  ) => {
    const fieldId = fieldIds[key];
    if (!fieldId) return;
    rows.push({
      project_id: projectId,
      field_id: fieldId,
      value_json: value.value_json ?? null,
      value_number: value.value_number ?? null,
      value_boolean: value.value_boolean ?? null,
      source_status: value.source_status,
    });
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

/**
 * PostgREST rechaza un upsert masivo si las filas no comparten exactamente
 * las mismas claves ("All object keys must match", PGRST102): `unit` solo
 * aplicaba a `green_area_m2`, así que cualquier alta de proyecto con
 * amenidades fallaba aquí y se revertía completa (incluida la amenidad ya
 * escrita) por el borrado en cascada del `catch` de abajo. `unit: null` en
 * el resto iguala las claves sin inventar una unidad que no tienen.
 */
const SPEC_FIELDS = [
  { field_key: "product_types", label_es: "Tipos de producto", group_key: "space", data_type: "text", unit: null, display_order: 10 },
  { field_key: "typologies", label_es: "Tipologías", group_key: "space", data_type: "text", unit: null, display_order: 20 },
  { field_key: "investment_benefits", label_es: "Beneficios de inversión", group_key: "investment", data_type: "text", unit: null, display_order: 30 },
  { field_key: "nearby_places", label_es: "Lugares cercanos", group_key: "location", data_type: "text", unit: null, display_order: 40 },
  { field_key: "green_area_m2", label_es: "Área verde", group_key: "space", data_type: "number", unit: "m²", display_order: 50 },
  { field_key: "includes_appliances", label_es: "Incluye línea blanca", group_key: "operation", data_type: "boolean", unit: null, display_order: 60 },
];

/**
 * Crea el proyecto y todas sus filas asociadas. Devuelve el id creado.
 * Lanza `WriteDeniedError` cuando RLS bloquea la escritura, para que la
 * interfaz pueda ofrecer la alternativa local en vez de un error crudo.
 */
export async function createProject(input: NewProjectInput): Promise<string> {
  const evidence = (value: unknown) => (value ? "documented" : "pending");
  const confirmed = (flag: boolean) => (flag ? "documented" : "pending");

  if (!input.propertyCategoryId || !input.propertyCategoryKey) {
    throw new Error("Falta elegir la categoría de propiedad.");
  }

  const created = await send<IdRow[]>(
    "projects",
    {
      slug: input.slug,
      name: input.name,
      public_status: input.publish ? "published" : "draft",
      sales_status: "consultar",
      property_category_id: input.propertyCategoryId,
      // Columna de texto vieja: se mantiene sincronizada con la categoría
      // real elegida hasta que se retire (migración posterior al cutover).
      property_category: input.propertyCategoryKey,
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
      property_category_id: input.propertyCategoryId,
      // Columna de texto vieja: mismo criterio que en `projects` arriba.
      property_type: input.propertyCategoryKey,
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
      // `group_id`: el editor elige un grupo opcional por amenidad; sin
      // elección cae al grupo "general" del catálogo (nunca queda sin
      // catalogar). Solo se consulta si de verdad hace falta el respaldo.
      let fallbackGroupId: string | null = null;
      if (input.amenities.some((amenity) => !amenity.groupId)) {
        const generalGroup = await fetchRows<{ id: string }[]>(
          "amenity_groups?select=id&key=eq.general&limit=1",
        );
        fallbackGroupId = generalGroup[0]?.id ?? null;
      }
      const groupIdFor = (amenity: AmenityInput) => amenity.groupId || fallbackGroupId || null;

      const amenityKeys = input.amenities.map((amenity) => toKey(amenity.name.es));

      // Sin `image_url` en este upsert: si se manda, `merge-duplicates`
      // sobrescribiría con lo que traiga este formulario la imagen que el
      // catálogo compartido ya tuviera para una amenidad reutilizada (p. ej.
      // "Piscinas y jacuzzi" citada de nuevo sin foto esta vez).
      const rows = await send<AmenityRow[]>(
        "amenities",
        input.amenities.map((amenity, index) => ({
          amenity_key: amenityKeys[index],
          label_es: amenity.name.es,
          label_en: amenity.name.en || null,
          label_fr: amenity.name.fr || null,
          group_id: groupIdFor(amenity),
          display_order: index,
        })),
        { upsertOn: "amenity_key", expectRows: true },
      );
      const rowByKey = new Map(rows.map((row) => [row.amenity_key, row]));

      const projectAmenityRows = input.amenities
        .map((amenity, index) => {
          const row = rowByKey.get(amenityKeys[index]);
          if (!row) return null;
          const featuresByLocale = (locale: "es" | "en" | "fr") => {
            const values = (amenity.features ?? [])
              .map((feature) => feature[locale])
              .filter((value): value is string => Boolean(value && value.trim()));
            return values.length > 0 ? values : null;
          };
          return {
            project_id: projectId,
            amenity_id: row.id,
            availability: "included",
            source_status: "documented",
            // Imagen y viñetas propias de ESTE proyecto para esta amenidad:
            // es justo lo que `RichAmenityBuilder` capturaba y se perdía
            // antes de esta corrección (nunca llegaba a `project_amenities`).
            custom_image_url: amenity.image || null,
            features_es: featuresByLocale("es"),
            features_en: featuresByLocale("en"),
            features_fr: featuresByLocale("fr"),
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (projectAmenityRows.length > 0) {
        await send("project_amenities", projectAmenityRows, {
          upsertOn: "project_id,amenity_id,phase_id",
        });
      }

      // Imagen por defecto del catálogo compartido: opcional y solo para
      // amenidades que todavía no tienen ninguna (nunca pisa la de otro
      // proyecto). Un fallo aquí no debe tirar abajo la creación completa:
      // la imagen específica de este proyecto ya quedó escrita arriba.
      for (const [index, amenity] of input.amenities.entries()) {
        const row = rowByKey.get(amenityKeys[index]);
        if (!row || !amenity.image || row.image_url) continue;
        try {
          await cmsFetch(`rest/v1/amenities?id=eq.${row.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify({ image_url: amenity.image }),
          });
        } catch {
          /* Foto de respaldo del catálogo: opcional, no bloquea la creación. */
        }
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
