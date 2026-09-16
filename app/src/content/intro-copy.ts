import type { Locale } from "./projects";

/**
 * Rotulo de la cortina de entrada.
 * Anuncia a que parte del sitio estas entrando, de modo que la animacion
 * cumple la funcion de una transicion y no solo la de una espera.
 */
const labels = {
  home: { es: "Portafolio", en: "Portfolio", fr: "Portfolio" },
  projects: { es: "Proyectos", en: "Projects", fr: "Projets" },
  project: { es: "El proyecto", en: "The project", fr: "Le projet" },
  map: { es: "Ubicaciones", en: "Locations", fr: "Localisations" },
  calculator: { es: "Tu inversión", en: "Your investment", fr: "Votre investissement" },
} as const;

/** Traduce una ruta al rotulo que le corresponde. */
export function introLabel(pathname: string, locale: Locale) {
  const normalized = pathname.replace(/\/$/, "");
  if (normalized === "/proyectos") return labels.projects[locale];
  if (normalized.startsWith("/proyectos/")) return labels.project[locale];
  if (normalized.startsWith("/mapa")) return labels.map[locale];
  if (normalized.startsWith("/calculadora")) return labels.calculator[locale];
  return labels.home[locale];
}

export const introSkip = {
  es: "Saltar la introducción",
  en: "Skip the intro",
  fr: "Passer l'introduction",
} as const;
