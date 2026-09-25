export type BedroomLocale = "es" | "en" | "fr";

/** Expande rangos heredados del CMS sin convertir opciones discontinuas en rangos. */
export function expandBedroomRange(min: number | null, max: number | null): number[] {
  const start = min ?? max;
  const end = max ?? min;
  if (start === null || end === null || !Number.isFinite(start) || !Number.isFinite(end)) return [];

  const lower = Math.min(10, Math.max(0, Math.ceil(Math.min(start, end))));
  const upper = Math.min(10, Math.max(lower, Math.floor(Math.max(start, end))));
  return Array.from({ length: upper - lower + 1 }, (_, index) => lower + index);
}

export function normalizeBedroomOptions(values: number[]): number[] {
  return [...new Set(values.filter((value) => Number.isInteger(value) && value >= 0 && value <= 10))]
    .sort((a, b) => a - b);
}

export function formatBedroomOptions(values: number[], locale: BedroomLocale): string {
  const normalized = normalizeBedroomOptions(values);
  if (normalized.length === 0) return "";

  const studio = normalized.includes(0)
    ? locale === "es" ? "Estudio" : "Studio"
    : "";
  const rooms = normalized.filter((value) => value > 0);
  const noun = locale === "es"
    ? rooms.length === 1 && rooms[0] === 1 ? "habitación" : "habitaciones"
    : locale === "fr"
      ? rooms.length === 1 && rooms[0] === 1 ? "chambre" : "chambres"
      : rooms.length === 1 && rooms[0] === 1 ? "bedroom" : "bedrooms";
  const contiguous = rooms.length > 1 && rooms.every(
    (value, index) => index === 0 || value === rooms[index - 1] + 1,
  );
  const roomCounts = contiguous
    ? `${rooms[0]}–${rooms[rooms.length - 1]}`
    : rooms.join(", ");
  const roomText = rooms.length > 0 ? `${roomCounts} ${noun}` : "";

  return [studio, roomText].filter(Boolean).join(locale === "fr" ? " · " : "; ");
}
