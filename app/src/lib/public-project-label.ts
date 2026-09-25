import type { Locale, PropertyProject } from "@/content/projects";

/**
 * Etiqueta pública estable cuando el propietario activa el catálogo privado.
 * El índice procede del orden del catálogo, mientras que el slug y el nombre
 * real siguen siendo internos para el CMS y las URL.
 */
export function getPublicProjectLabel(index: number, locale: Locale): string {
  const number = String(Math.max(0, index) + 1).padStart(2, "0");
  if (locale === "en") return `Project ${number}`;
  if (locale === "fr") return `Projet ${number}`;
  return `Proyecto ${number}`;
}

export function getPublicProjectName(
  project: PropertyProject,
  index: number,
  hideRealName: boolean,
  locale: Locale,
): string {
  return hideRealName ? getPublicProjectLabel(index, locale) : project.name;
}
