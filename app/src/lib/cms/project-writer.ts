/**
 * CRUD de proyectos sobre el esquema normalizado de Supabase.
 *
 * El formulario de `/admin` guardaba solo un borrador en `localStorage` y
 * anunciaba que el proyecto "aparecera en el catalogo automaticamente", cosa
 * que no ocurria. Este modulo escribe de verdad en las tablas que alimentan la
 * vista `api_projects_v1`, y ahora cubre el ciclo completo:
 * `createProject`, `loadProjectForEdit`, `updateProject` y `deleteProject`,
 * mas el listado paginado que consume la pestana Proyectos
 * (`listEditorProjects`).
 *
 * PostgREST no ofrece transacciones entre peticiones, asi que si un paso del
 * ALTA falla se borra la fila de `projects` y el borrado en cascada limpia el
 * resto: es preferible no dejar nada a dejar un proyecto a medias en el
 * catalogo. La EDICION no puede usar esa misma compensacion —borrar el
 * proyecto destruiria datos que ya estaban bien— asi que cada paso se etiqueta
 * y el error dice exactamente que tabla quedo sin escribir.
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

/** Estados de publicacion admitidos por `projects.public_status`. */
export type ProjectPublicStatus = "draft" | "review" | "published" | "archived";

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

/** `numeric` de Postgres viaja como cadena en JSON; aquí se normaliza. */
function numberOrNull(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

/**
 * DELETE con el mismo tratamiento de errores que `send`. PostgREST exige un
 * filtro en todo borrado, asi que `query` siempre lo lleva.
 */
async function remove(query: string): Promise<void> {
  const response = await cmsFetch(`rest/v1/${query}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  if (!response.ok) {
    const detail = await readErrorMessage(response);
    if (response.status === 401 || response.status === 403) {
      throw new WriteDeniedError(detail);
    }
    throw new Error(detail);
  }
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
 * Etiqueta el paso que falló para que el mensaje diga qué quedó sin escribir
 * en vez de un "Supabase respondió 400" sin contexto.
 */
export class ProjectStepError extends Error {
  readonly step: string;
  constructor(step: string, cause: unknown) {
    super(
      cause instanceof Error ? cause.message : "Supabase rechazó la escritura.",
    );
    this.name = "ProjectStepError";
    this.step = step;
  }
}

async function step<T>(label: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    // Un permiso denegado se propaga tal cual: la interfaz lo distingue para
    // explicar que falta dar de alta al usuario en `cms_profiles`.
    if (error instanceof WriteDeniedError) throw error;
    throw new ProjectStepError(label, error);
  }
}

/**
 * Filas de todas las tablas hijas salvo los precios (que son históricos y se
 * tratan aparte). Es el cuerpo común de `createProject` y `updateProject`:
 * antes solo existía dentro del alta, así que una edición habría tenido que
 * duplicar diez inserciones y habrían divergido a la primera corrección.
 */
async function writeProjectChildren(
  projectId: string,
  input: NewProjectInput,
): Promise<void> {
  const evidence = (value: unknown) => (value ? "documented" : "pending");
  const confirmed = (flag: boolean) => (flag ? "documented" : "pending");

  await step("traducciones", () =>
    send("project_translations", translationRows(projectId, input), {
      upsertOn: "project_id,locale",
    }),
  );

  await step("ubicación", () =>
    send("project_locations", {
      project_id: projectId,
      latitude: input.coordinates?.[0] ?? null,
      longitude: input.coordinates?.[1] ?? null,
      map_label: input.mapUrl || null,
      sector: input.sector || null,
      city: input.city || null,
      province: input.province || null,
      source_status: evidence(input.coordinates),
    }),
  );

  await step("fase de entrega", () =>
    send("project_phases", {
      project_id: projectId,
      name: input.deliveryLabel || "Entrega",
      delivery_year: input.deliveryYear,
      status: "consultar",
      source_status: confirmed(input.deliveryConfirmed),
    }),
  );

  await step("tipología", () =>
    send("project_unit_types", {
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
    }),
  );

  await step("plan de pago", () =>
    send("project_payment_plans", {
      project_id: projectId,
      initial_percent: input.payment.signing,
      during_construction_percent: input.payment.construction,
      on_delivery_percent: input.payment.delivery,
      reservation_amount: input.reservation,
      currency: "USD",
      source_status: "pending",
    }),
  );

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
  if (media.length > 0) {
    await step("galería", () => send("project_media", media));
  }

  if (input.amenities.length > 0) {
    await step("amenidades", async () => {
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
      // proyecto). Un fallo aquí no debe tirar abajo la escritura completa:
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
          /* Foto de respaldo del catálogo: opcional, no bloquea la escritura. */
        }
      }
    });
  }

  // Las listas sueltas viven en `project_spec_values`, que es la tabla
  // pensada para atributos variables sin tocar el esquema.
  await step("especificaciones", async () => {
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
  });
}

/** Columnas de `projects` que se escriben igual al crear y al editar. */
function projectRow(input: NewProjectInput) {
  return {
    slug: input.slug,
    name: input.name,
    public_status: input.publish ? "published" : "draft",
    property_category_id: input.propertyCategoryId,
    // Columna de texto vieja: se mantiene sincronizada con la categoría
    // real elegida hasta que se retire (migración posterior al cutover).
    property_category: input.propertyCategoryKey,
    sector: input.sector || null,
    city: input.city || null,
    province: input.province || null,
  };
}

/**
 * Crea el proyecto y todas sus filas asociadas. Devuelve el id creado.
 * Lanza `WriteDeniedError` cuando RLS bloquea la escritura, para que la
 * interfaz pueda explicar qué permiso falta en vez de un error crudo.
 */
export async function createProject(input: NewProjectInput): Promise<string> {
  if (!input.propertyCategoryId || !input.propertyCategoryKey) {
    throw new Error("Falta elegir la categoría de propiedad.");
  }

  const created = await send<IdRow[]>(
    "projects",
    {
      ...projectRow(input),
      sales_status: "consultar",
      published_at: input.publish ? new Date().toISOString() : null,
    },
    { expectRows: true },
  );

  const projectId = created[0]?.id;
  if (!projectId) throw new Error("Supabase no devolvió el proyecto creado.");

  try {
    await writeProjectChildren(projectId, input);
    await writePriceSnapshot(projectId, input);
    return projectId;
  } catch (error) {
    // Cascada: al borrar el proyecto desaparecen sus filas hijas (todas las
    // FK a `projects.id` son ON DELETE CASCADE salvo `leads` y
    // `calculator_quotes`, que son SET NULL y aquí no aplican).
    try {
      await remove(`projects?id=eq.${projectId}`);
    } catch (rollbackError) {
      /*
       * Antes esto era un `catch {}` vacío: si la compensación fallaba, el
       * proyecto quedaba a medias en el catálogo y nadie se enteraba nunca.
       * El error original sigue siendo el que se propaga —es la causa—, pero
       * el fallo del rollback deja rastro con el id concreto que hay que
       * limpiar a mano.
       */
      console.error(
        `[cms] No se pudo revertir el proyecto ${projectId} tras un alta fallida. ` +
          `Quedó una fila huérfana en «projects» que hay que borrar a mano.`,
        rollbackError,
      );
    }
    throw error;
  }
}

/**
 * Los precios son históricos: se añade una foto nueva, nunca se sobrescribe.
 * Al editar solo se añade si de verdad cambió algo respecto a la última foto,
 * porque si no cada pulsación de «Guardar» inflaría la serie con filas
 * idénticas y el historial dejaría de significar nada.
 */
async function writePriceSnapshot(
  projectId: string,
  input: NewProjectInput,
): Promise<void> {
  const hasValue =
    input.priceFrom !== null ||
    input.priceTo !== null ||
    input.reservation !== null;
  const sourceStatus = input.priceConfirmed ? "documented" : "pending";

  const latest = await fetchRows<
    {
      price_from: number | string | null;
      price_to: number | string | null;
      reservation_amount: number | string | null;
      source_status: string;
    }[]
  >(
    `project_price_snapshots?select=price_from,price_to,reservation_amount,source_status&project_id=eq.${projectId}&order=created_at.desc&limit=1`,
  );

  const previous = latest[0];
  const same =
    previous !== undefined &&
    numberOrNull(previous.price_from) === input.priceFrom &&
    numberOrNull(previous.price_to) === input.priceTo &&
    numberOrNull(previous.reservation_amount) === input.reservation &&
    previous.source_status === sourceStatus;

  if (!hasValue || same) return;

  await step("precios", () =>
    send("project_price_snapshots", {
      project_id: projectId,
      currency: "USD",
      price_from: input.priceFrom,
      price_to: input.priceTo,
      reservation_amount: input.reservation,
      effective_from: new Date().toISOString().slice(0, 10),
      source_status: sourceStatus,
      notes: "Registrado desde el estudio CMS.",
    }),
  );
}

/**
 * Tablas hijas que se reemplazan por completo al editar, en el orden en que
 * hay que vaciarlas: primero las que apuntan a fases y tipologías, después
 * esas dos. `project_price_snapshots` NO está aquí a propósito: es la serie
 * histórica de precios y borrarla perdería el dato que justifica la cifra
 * publicada hoy.
 */
const REPLACED_CHILD_TABLES = [
  "project_spec_values",
  "project_payment_plans",
  "project_amenities",
  "project_media",
  "project_translations",
  "project_locations",
  "project_unit_types",
  "project_phases",
] as const;

/**
 * Edita un proyecto existente y todo su grafo.
 *
 * ESTRATEGIA: se borran las filas hijas del proyecto y se reinsertan, en vez
 * de hacer upserts fila a fila. El motivo es que el formulario es la fuente
 * completa de esas tablas: un upsert por clave sabe añadir y modificar, pero
 * no sabe QUITAR lo que el editor borró (una foto de galería retirada, una
 * amenidad eliminada, una tipología que ya no existe), así que esas filas
 * sobrevivirían para siempre y el catálogo mostraría datos que el dueño creía
 * haber borrado. Reemplazar es la única forma de que lo que se ve en el
 * formulario sea exactamente lo que queda en la base. El volumen lo permite
 * de sobra: son decenas de filas por proyecto, no miles.
 *
 * COMPENSACIÓN: a diferencia del alta, aquí NO se borra el proyecto si algo
 * falla —eso destruiría datos válidos que ya estaban publicados—. Cada paso
 * va etiquetado (`ProjectStepError.step`) para que el mensaje diga qué tabla
 * quedó sin escribir y el editor pueda volver a guardar.
 */
export async function updateProject(
  projectId: string,
  input: NewProjectInput,
): Promise<void> {
  if (!input.propertyCategoryId || !input.propertyCategoryKey) {
    throw new Error("Falta elegir la categoría de propiedad.");
  }

  const current = await fetchRows<{ published_at: string | null }[]>(
    `projects?select=published_at&id=eq.${projectId}&limit=1`,
  );
  if (current.length === 0) {
    throw new Error("El proyecto ya no existe en Supabase.");
  }

  await step("datos del proyecto", async () => {
    const response = await cmsFetch(`rest/v1/projects?id=eq.${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        ...projectRow(input),
        // La primera publicación fija la fecha; despublicar y volver a
        // publicar no la reescribe, porque sigue siendo el mismo proyecto.
        published_at:
          input.publish && !current[0].published_at
            ? new Date().toISOString()
            : current[0].published_at,
      }),
    });
    if (!response.ok) {
      const detail = await readErrorMessage(response);
      if (response.status === 401 || response.status === 403) {
        throw new WriteDeniedError(detail);
      }
      throw new Error(detail);
    }
  });

  for (const table of REPLACED_CHILD_TABLES) {
    await step(`limpieza de ${table}`, () =>
      remove(`${table}?project_id=eq.${projectId}`),
    );
  }

  await writeProjectChildren(projectId, input);
  await writePriceSnapshot(projectId, input);
}

/**
 * Borra el proyecto. Las trece FK que apuntan a `projects.id` son ON DELETE
 * CASCADE salvo `leads.project_id` y `calculator_quotes.project_id`, que son
 * SET NULL: un lead o una cotización no desaparecen porque se retire el
 * proyecto, solo se quedan sin proyecto asociado. Verificado contra
 * `information_schema.referential_constraints`, no asumido.
 */
export async function deleteProject(projectId: string): Promise<void> {
  await remove(`projects?id=eq.${projectId}`);
}

/* ---------------------------------------------------------------------------
   Lectura para el panel: listado paginado y carga completa para editar.

   El catálogo público (`api_projects_v1`, vía `useProjects`) NO sirve para
   esto: lo lee la clave anónima, y la RLS de `projects` solo deja ver
   `public_status = 'published'`. Un borrador creado desde el panel era
   invisible EN EL PROPIO PANEL. Estas consultas van firmadas con la sesión
   del editor, así que devuelven también borradores, revisiones y archivados.
--------------------------------------------------------------------------- */

export interface EditorProjectRow {
  id: string;
  slug: string;
  name: string;
  status: ProjectPublicStatus;
  /** "Sector · Ciudad", el mismo formato que publica el catálogo. */
  location: string;
  hero: string | null;
  categoryId: string | null;
  categoryLabel: string | null;
  priceFrom: number | null;
  priceStatus: "confirmed" | "pending";
  updatedAt: string;
}

export interface EditorProjectQuery {
  /** Texto libre; filtra por nombre o slug con `ilike`, del lado del servidor. */
  search?: string;
  status?: ProjectPublicStatus | "";
  categoryId?: string;
  limit: number;
  offset: number;
}

export interface EditorProjectPage {
  rows: EditorProjectRow[];
  /** Total que cumple el filtro, no solo los de esta página. */
  total: number;
}

const PUBLIC_STATUSES: readonly ProjectPublicStatus[] = [
  "draft",
  "review",
  "published",
  "archived",
];

function toPublicStatus(value: unknown): ProjectPublicStatus {
  return PUBLIC_STATUSES.includes(value as ProjectPublicStatus)
    ? (value as ProjectPublicStatus)
    : "draft";
}

interface ListRow {
  id: string;
  slug: string;
  name: string;
  public_status: string;
  sector: string | null;
  city: string | null;
  updated_at: string;
  property_category_id: string | null;
  property_categories: { label_es: string } | null;
  project_media: { url: string }[];
  project_price_snapshots: { price_from: number | string | null; source_status: string }[];
}

function joinLocation(sector: string | null, city: string | null): string {
  return [sector, city].filter((part): part is string => Boolean(part && part.trim())).join(" · ");
}

/** Escapa los comodines de `ilike` para que una búsqueda con `%` no barra todo. */
function likeTerm(value: string): string {
  return encodeURIComponent(`*${value.trim().replace(/[%_*]/g, "")}*`);
}

/**
 * Página del listado de proyectos del panel, con búsqueda y filtros resueltos
 * en el servidor. Se pagina en PostgREST en vez de traerlo todo y filtrar en
 * el navegador porque el panel tiene que aguantar decenas de proyectos con
 * su galería y sus amenidades sin volverse lento.
 */
export async function listEditorProjects(
  query: EditorProjectQuery,
): Promise<EditorProjectPage> {
  const filters = [
    "select=id,slug,name,public_status,sector,city,updated_at,property_category_id," +
      "property_categories(label_es)," +
      "project_media(url)," +
      "project_price_snapshots(price_from,source_status)",
    // Solo el hero y solo la última foto de precio: sin estos filtros cada
    // fila del listado arrastraría la galería entera y todo el histórico.
    "project_media.media_type=eq.hero",
    "project_media.limit=1",
    "project_price_snapshots.order=created_at.desc",
    "project_price_snapshots.limit=1",
    "order=updated_at.desc",
    `limit=${query.limit}`,
    `offset=${query.offset}`,
  ];
  if (query.search?.trim()) {
    const term = likeTerm(query.search);
    filters.push(`or=(name.ilike.${term},slug.ilike.${term})`);
  }
  if (query.status) filters.push(`public_status=eq.${query.status}`);
  if (query.categoryId) filters.push(`property_category_id=eq.${query.categoryId}`);

  const response = await cmsFetch(`rest/v1/projects?${filters.join("&")}`, {
    // `count=exact` devuelve el total en `Content-Range`, que es lo que
    // necesita el paginador para saber cuántas páginas hay.
    headers: { Prefer: "count=exact" },
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));

  const rows = (await response.json()) as ListRow[];
  const range = response.headers.get("content-range") ?? "";
  const totalFromHeader = Number(range.split("/")[1]);

  return {
    total: Number.isFinite(totalFromHeader) ? totalFromHeader : rows.length,
    rows: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: toPublicStatus(row.public_status),
      location: joinLocation(row.sector, row.city),
      hero: row.project_media[0]?.url ?? null,
      categoryId: row.property_category_id,
      categoryLabel: row.property_categories?.label_es ?? null,
      priceFrom: numberOrNull(row.project_price_snapshots[0]?.price_from),
      priceStatus:
        row.project_price_snapshots[0]?.source_status === "documented"
          ? "confirmed"
          : "pending",
      updatedAt: row.updated_at,
    })),
  };
}

export interface ProjectStats {
  total: number;
  drafts: number;
  published: number;
  /** Proyectos cuya última foto de precio no está documentada. */
  pendingPrice: number;
}

/**
 * Cifras del resumen. Se leen con la sesión del editor, así que cuentan
 * también los borradores; el catálogo público no los ve y por eso el resumen
 * mostraba «0 borradores» justo después de crear uno.
 *
 * Dos columnas por proyecto: el payload es pequeño aunque haya cientos.
 */
export async function getProjectStats(): Promise<ProjectStats> {
  const rows = await fetchRows<
    {
      public_status: string;
      project_price_snapshots: { source_status: string }[];
    }[]
  >(
    "projects?select=public_status,project_price_snapshots(source_status)" +
      "&project_price_snapshots.order=created_at.desc&project_price_snapshots.limit=1",
  );
  return {
    total: rows.length,
    drafts: rows.filter((row) => row.public_status === "draft").length,
    published: rows.filter((row) => row.public_status === "published").length,
    pendingPrice: rows.filter(
      (row) => row.project_price_snapshots[0]?.source_status !== "documented",
    ).length,
  };
}

/** Lo que el formulario necesita para editar: el input más lo que no viaja en él. */
export interface ProjectFormValues extends NewProjectInput {
  /** `projects.id`. Su presencia es lo que convierte el alta en edición. */
  id: string;
  /** "Sector · Ciudad", tal como lo compone `LocationInput`. */
  location: string;
  /** Etiqueta en español de la categoría, para el spec legado `product_types`. */
  propertyCategoryLabel: string;
}

interface EditRow {
  id: string;
  slug: string;
  name: string;
  public_status: string;
  sector: string | null;
  city: string | null;
  province: string | null;
  property_category_id: string | null;
  property_categories: { key: string; label_es: string } | null;
  project_translations: { locale: string; description: string | null }[];
  project_locations: {
    latitude: number | null;
    longitude: number | null;
    map_label: string | null;
  }[];
  project_phases: {
    name: string;
    delivery_year: number | null;
    source_status: string;
  }[];
  project_unit_types: {
    bedrooms_max: number | string | null;
    bathrooms_max: number | string | null;
    parking_max: number | string | null;
    area_min_m2: number | string | null;
    area_max_m2: number | string | null;
  }[];
  project_price_snapshots: {
    price_from: number | string | null;
    price_to: number | string | null;
    reservation_amount: number | string | null;
    source_status: string;
  }[];
  project_payment_plans: {
    initial_percent: number | string | null;
    during_construction_percent: number | string | null;
    on_delivery_percent: number | string | null;
  }[];
  project_media: { media_type: string; url: string }[];
  project_amenities: {
    custom_image_url: string | null;
    features_es: string[] | null;
    features_en: string[] | null;
    features_fr: string[] | null;
    amenities: {
      label_es: string;
      label_en: string | null;
      label_fr: string | null;
      group_id: string | null;
    } | null;
  }[];
  project_spec_values: {
    value_json: unknown;
    value_number: number | string | null;
    value_boolean: boolean | null;
    specification_fields: { field_key: string } | null;
  }[];
}

const EDIT_SELECT =
  "id,slug,name,public_status,sector,city,province,property_category_id," +
  "property_categories(key,label_es)," +
  "project_translations(locale,description)," +
  "project_locations(latitude,longitude,map_label)," +
  "project_phases(name,delivery_year,source_status)," +
  "project_unit_types(bedrooms_max,bathrooms_max,parking_max,area_min_m2,area_max_m2)," +
  "project_price_snapshots(price_from,price_to,reservation_amount,source_status)," +
  "project_payment_plans(initial_percent,during_construction_percent,on_delivery_percent)," +
  "project_media(media_type,url)," +
  "project_amenities(custom_image_url,features_es,features_en,features_fr," +
  "amenities(label_es,label_en,label_fr,group_id))," +
  "project_spec_values(value_json,value_number,value_boolean,specification_fields(field_key))";

/** Lista de textos de un spec `value_json`, descartando lo que no sea cadena. */
function specList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

/**
 * Recompone las viñetas de una amenidad. Se guardan como tres arreglos
 * paralelos (`features_es/en/fr`); el formulario las maneja como una lista de
 * `Localized`. Cuando falta la traducción se reutiliza el español en vez de
 * dejar el hueco vacío, que es lo que acabaría publicándose.
 */
function toLocalizedFeatures(
  es: string[] | null,
  en: string[] | null,
  fr: string[] | null,
): Localized[] {
  const length = Math.max(es?.length ?? 0, en?.length ?? 0, fr?.length ?? 0);
  const out: Localized[] = [];
  for (let index = 0; index < length; index += 1) {
    const base = es?.[index] ?? en?.[index] ?? fr?.[index] ?? "";
    if (!base) continue;
    out.push({
      es: es?.[index] ?? base,
      en: en?.[index] ?? base,
      fr: fr?.[index] ?? base,
    });
  }
  return out;
}

/**
 * Trae TODO el proyecto en una sola petición y lo devuelve con la forma que
 * consume el formulario. Una petición por tabla habría sido once viajes de
 * ida y vuelta antes de poder pintar nada.
 */
export async function loadProjectForEdit(
  projectId: string,
): Promise<ProjectFormValues> {
  const rows = await fetchRows<EditRow[]>(
    `projects?id=eq.${encodeURIComponent(projectId)}&limit=1&select=${EDIT_SELECT}`,
  );
  const row = rows[0];
  if (!row) throw new Error("El proyecto ya no existe en Supabase.");

  const specByKey = new Map(
    row.project_spec_values
      .filter((spec) => spec.specification_fields?.field_key)
      .map((spec) => [spec.specification_fields!.field_key, spec]),
  );

  const location = row.project_locations[0];
  const phase = row.project_phases[0];
  const unit = row.project_unit_types[0];
  const price = row.project_price_snapshots[0];
  const plan = row.project_payment_plans[0];

  const hero = row.project_media.find((item) => item.media_type === "hero")?.url ?? "";
  const gallery = row.project_media
    .filter((item) => item.media_type === "gallery")
    .map((item) => item.url);

  const coordinates: [number, number] | null =
    typeof location?.latitude === "number" && typeof location?.longitude === "number"
      ? [location.latitude, location.longitude]
      : null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    publish: row.public_status === "published",
    location: joinLocation(row.sector, row.city),
    sector: row.sector ?? "",
    city: row.city ?? "",
    province: row.province ?? "La Altagracia",
    description:
      row.project_translations.find((item) => item.locale === "es")?.description ?? "",
    deliveryLabel: phase?.name ?? "",
    deliveryYear: phase?.delivery_year ?? null,
    deliveryConfirmed: phase?.source_status === "documented",
    priceConfirmed: price?.source_status === "documented",
    propertyCategoryId: row.property_category_id ?? "",
    propertyCategoryKey: row.property_categories?.key ?? "",
    propertyCategoryLabel: row.property_categories?.label_es ?? "",
    bedrooms: numberOrNull(unit?.bedrooms_max) ?? 0,
    bathrooms: numberOrNull(unit?.bathrooms_max) ?? 0,
    parking: numberOrNull(unit?.parking_max) ?? 0,
    areaMin: numberOrNull(unit?.area_min_m2) ?? 0,
    areaMax: numberOrNull(unit?.area_max_m2) ?? 0,
    greenArea: numberOrNull(specByKey.get("green_area_m2")?.value_number) ?? 0,
    priceFrom: numberOrNull(price?.price_from),
    priceTo: numberOrNull(price?.price_to),
    reservation: numberOrNull(price?.reservation_amount),
    productTypes: specList(specByKey.get("product_types")?.value_json),
    typologies: specList(specByKey.get("typologies")?.value_json),
    investmentBenefits: specList(specByKey.get("investment_benefits")?.value_json),
    nearby: specList(specByKey.get("nearby_places")?.value_json),
    includesAppliances: specByKey.get("includes_appliances")?.value_boolean === true,
    amenities: row.project_amenities
      .filter((item) => item.amenities !== null)
      .map((item) => ({
        name: {
          es: item.amenities!.label_es,
          en: item.amenities!.label_en ?? item.amenities!.label_es,
          fr: item.amenities!.label_fr ?? item.amenities!.label_es,
        },
        image: item.custom_image_url ?? undefined,
        features: toLocalizedFeatures(
          item.features_es,
          item.features_en,
          item.features_fr,
        ),
        groupId: item.amenities!.group_id ?? undefined,
      })),
    mapUrl: location?.map_label ?? "",
    coordinates,
    hero,
    gallery,
    payment: {
      signing: numberOrNull(plan?.initial_percent) ?? 0,
      construction: numberOrNull(plan?.during_construction_percent) ?? 0,
      delivery: numberOrNull(plan?.on_delivery_percent) ?? 0,
    },
  };
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
