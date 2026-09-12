import type { Metadata } from "next";
import type { Locale } from "@/content/projects";
const titles = {
  es: "Tu próximo capítulo en Punta Cana",
  en: "Your next chapter in Punta Cana",
  fr: "Votre prochain chapitre à Punta Cana",
};
const descriptions = {
  es: "Portafolio independiente de Andris Peña, asesor inmobiliario. Descubre Melcon Paradise en Vista Cana y prepara tu próximo paso.",
  en: "The independent portfolio of real estate advisor Andris Peña. Discover Melcon Paradise in Vista Cana and prepare your next step.",
  fr: "Le portfolio indépendant du conseiller immobilier Andris Peña. Découvrez Melcon Paradise à Vista Cana et préparez votre prochaine étape.",
};
export const parseLocale = (value?: string): Locale =>
  value === "en" || value === "fr" ? value : "es";
export function pageMetadata(locale: Locale, project?: string): Metadata {
  const title = project ? `${project} · Vista Cana` : titles[locale];
  return {
    title: { absolute: `${title} | Andris Peña` },
    description: descriptions[locale],
    openGraph: {
      title: `${title} | Andris Peña`,
      description: descriptions[locale],
      locale: { es: "es_DO", en: "en_US", fr: "fr_FR" }[locale],
      type: "website",
      images: [
        {
          url: "/derived/melcon-hero.webp",
          width: 1183,
          height: 785,
          alt: "Melcon Paradise · Vista Cana",
        },
      ],
    },
  };
}
