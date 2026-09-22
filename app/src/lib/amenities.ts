/**
 * Utilidades compartidas para resolver y agrupar amenidades.
 *
 * `PropertyProject.amenities` mezcla dos formas válidas (`AmenityEntry`):
 *  - `Localized` a secas: amenidad heredada, solo nombre, sin imagen ni
 *    viñetas (así están escritas varias amenidades reales hoy).
 *  - `RichAmenity`: `{ name, image?, features?, group? }`, la forma que
 *    escribe `RichAmenityBuilder` en el admin y que expone la vista
 *    `api_projects_v1` una vez aplicada la migración 0009.
 *
 * Este módulo es el único lugar que decide cómo leer esa unión, para no
 * repetir `"name" in amenity ? … : …` en cada componente que la consume.
 */
import type { AmenityEntry, Locale, RichAmenity } from "@/content/projects";

export interface ResolvedAmenity {
  id: string;
  name: string;
  image: string | null;
  features: string[];
  groupKey: string | null;
  groupLabel: string | null;
}

export interface AmenityGroupBucket {
  key: string | null;
  label: string | null;
  items: ResolvedAmenity[];
}

function isRichAmenity(entry: AmenityEntry): entry is RichAmenity {
  return typeof entry === "object" && entry !== null && "name" in entry;
}

function pick(localized: Record<string, string | undefined> | undefined, locale: Locale): string {
  if (!localized) return "";
  return localized[locale] || localized.es || "";
}

/** Nombre localizado de una amenidad, sin importar cuál de las dos formas sea. */
export function amenityLabel(entry: AmenityEntry, locale: Locale): string {
  if (isRichAmenity(entry)) return pick(entry.name, locale);
  return pick(entry, locale);
}

/** Resuelve una entrada de amenidad al idioma activo, con valores por defecto explícitos. */
export function resolveAmenity(entry: AmenityEntry, locale: Locale, index: number): ResolvedAmenity {
  if (isRichAmenity(entry)) {
    return {
      id: entry.key || `amenity-${index}`,
      name: pick(entry.name, locale),
      image: entry.image ?? null,
      features: entry.features?.[locale] ?? entry.features?.es ?? [],
      groupKey: entry.group?.key ?? null,
      groupLabel: entry.group ? pick(entry.group.label, locale) : null,
    };
  }
  return {
    id: `amenity-${index}`,
    name: pick(entry, locale),
    image: null,
    features: [],
    groupKey: null,
    groupLabel: null,
  };
}

/**
 * Agrupa amenidades ya resueltas por `group.key`, preservando el orden de
 * aparición. La vista `api_projects_v1` (migración 0009) ya entrega el
 * arreglo ordenado por `amenity_groups.sort_order`, así que el primer grupo
 * que aparece es el de menor `sort_order`: no hace falta otra consulta para
 * ordenar los grupos aquí.
 */
export function groupAmenities(entries: AmenityEntry[], locale: Locale): AmenityGroupBucket[] {
  const buckets = new Map<string, AmenityGroupBucket>();
  entries.forEach((entry, index) => {
    const resolved = resolveAmenity(entry, locale, index);
    const bucketKey = resolved.groupKey ?? "__ungrouped__";
    let bucket = buckets.get(bucketKey);
    if (!bucket) {
      bucket = { key: resolved.groupKey, label: resolved.groupLabel, items: [] };
      buckets.set(bucketKey, bucket);
    }
    bucket.items.push(resolved);
  });
  return Array.from(buckets.values());
}
