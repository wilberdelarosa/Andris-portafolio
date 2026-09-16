import type { Localized, PropertyProject } from "./projects";

/** Only positive, documented matches. Missing evidence never means “included”. */
export const discoveryFeatures = [
  {
    id: "tennis",
    label: { es: "Cancha de tenis", en: "Tennis court", fr: "Court de tennis" },
  },
  {
    id: "golf",
    label: {
      es: "Acceso a campo de golf",
      en: "Golf course access",
      fr: "Accès au golf",
    },
  },
  {
    id: "near-beach",
    label: {
      es: "Cerca de playa",
      en: "Near the beach",
      fr: "Proche de la plage",
    },
  },
  {
    id: "beachfront",
    label: {
      es: "Primera línea de playa",
      en: "Ocean beachfront",
      fr: "En front de mer",
    },
  },
  {
    id: "artificial-beach",
    label: {
      es: "Playa artificial",
      en: "Artificial beach",
      fr: "Plage artificielle",
    },
  },
  {
    id: "padel",
    label: { es: "Cancha de pádel", en: "Padel court", fr: "Terrain de padel" },
  },
] as const;
export type DiscoveryFeature = (typeof discoveryFeatures)[number]["id"];

export const projectDiscovery: Record<
  string,
  { features: DiscoveryFeature[]; ready: boolean }
> = {
  "melcon-paradise": {
    features: ["golf", "near-beach", "artificial-beach", "padel"],
    ready: false,
  },
  "terra-serena": { features: ["near-beach"], ready: false },
  "the-beach-at-punta-cana-city-place": {
    features: ["tennis", "near-beach", "artificial-beach", "padel"],
    ready: true,
  },
};

export function matchesDiscovery(
  project: PropertyProject,
  delivery: string | null,
  features: DiscoveryFeature[],
) {
  const evidence = projectDiscovery[project.slug];
  const deliveryMatches =
    delivery === null ||
    (delivery === "ready"
      ? evidence?.ready === true
      : delivery === "varies"
        ? project.delivery.status === "varies"
        : String(project.delivery.year) === delivery);
  return (
    deliveryMatches &&
    features.every((feature) => evidence?.features.includes(feature))
  );
}

export interface ProjectTour {
  url: string;
  collection: string;
  scenes: { id: string; title: Localized; sourceTitle: string }[];
}

/** User supplied collection, all six views verified in Kuula on 2026-09-14. */
export const projectTours: Record<string, ProjectTour> = {
  "terra-serena": {
    url: "https://kuula.co/share/collection/7HsBR",
    collection: "7HsBR",
    scenes: [
      {
        id: "htQc3",
        title: { es: "Jardines", en: "Gardens", fr: "Jardins" },
        sourceTitle: "360 EXT 1.jpg",
      },
      {
        id: "L4pDD",
        title: { es: "Piscina", en: "Pool", fr: "Piscine" },
        sourceTitle: "360 EXT 2-AJUSTE",
      },
      {
        id: "htQcQ",
        title: {
          es: "Exterior residencial",
          en: "Residential exterior",
          fr: "Extérieur résidentiel",
        },
        sourceTitle: "360 EXT 3.jpg",
      },
      {
        id: "htQcB",
        title: { es: "Acceso", en: "Entrance", fr: "Entrée" },
        sourceTitle: "360 EXT 4.jpg",
      },
      {
        id: "L4pDW",
        title: { es: "Sala", en: "Living room", fr: "Salon" },
        sourceTitle: "360 INT SALA-AJUSTES",
      },
      {
        id: "L4pD3",
        title: { es: "Dormitorio", en: "Bedroom", fr: "Chambre" },
        sourceTitle: "360 INT DORMITORIO-AJUSTE",
      },
    ],
  },
};

export const discoveryCopy = {
  es: {
    ready: "Unidades listas",
    years: "Año de entrega",
    note: "Solo se incluyen coincidencias documentadas. Golf significa acceso dentro del complejo, no solo cercanía. La playa artificial no equivale a primera línea de mar. La disponibilidad se confirma por unidad.",
    features: "Tu estilo de vida",
    photos: "Imágenes",
    tour: "Recorrido 360°",
    openTour: "Explorar en 360°",
    openPhotos: "Ver imágenes",
    tourHelp:
      "Arrastra para mirar a tu alrededor. Elige un espacio para continuar.",
    scenes: "Ir a un espacio",
    loading: "Conectando con Kuula…",
    unavailable:
      "¿No carga el recorrido? Reintenta o ábrelo directamente en Kuula.",
    retry: "Reintentar",
    external: "Abrir en Kuula",
    offline:
      "El recorrido necesita conexión a internet. Puedes consultar las imágenes del proyecto.",
    renders:
      "Visualización del proyecto. Las imágenes y el recorrido son renders de referencia.",
    next: "Siguiente imagen",
    previous: "Imagen anterior",
    fit: "Ver todos los proyectos",
    terrain: "Relieve",
    terrainNote:
      "Relieve real, sin exageración. Edificios según cobertura de OpenStreetMap.",
    estimated: "Entrega estimada",
  },
  en: {
    ready: "Ready units",
    years: "Delivery year",
    note: "Only documented matches are included. Golf means access within the community, not just proximity. An artificial beach is not ocean beachfront. Confirm availability per unit.",
    features: "Your lifestyle",
    photos: "Images",
    tour: "360° tour",
    openTour: "Explore in 360°",
    openPhotos: "View images",
    tourHelp: "Drag to look around. Choose a space to continue.",
    scenes: "Go to a space",
    loading: "Connecting to Kuula…",
    unavailable: "Tour not loading? Retry or open it directly in Kuula.",
    retry: "Retry",
    external: "Open in Kuula",
    offline:
      "The tour needs an internet connection. You can still view the project images.",
    renders: "Project visualization. Images and tour are reference renderings.",
    next: "Next image",
    previous: "Previous image",
    fit: "Show all projects",
    terrain: "Terrain",
    terrainNote:
      "Real terrain, without exaggeration. Buildings depend on OpenStreetMap coverage.",
    estimated: "Estimated delivery",
  },
  fr: {
    ready: "Unités disponibles",
    years: "Année de livraison",
    note: "Seules les correspondances documentées sont incluses. Golf signifie un accès dans la résidence, pas seulement la proximité. Une plage artificielle n’est pas un front de mer. Disponibilité à confirmer par unité.",
    features: "Votre style de vie",
    photos: "Images",
    tour: "Visite à 360°",
    openTour: "Explorer à 360°",
    openPhotos: "Voir les images",
    tourHelp:
      "Faites glisser pour regarder autour de vous. Choisissez un espace.",
    scenes: "Aller à un espace",
    loading: "Connexion à Kuula…",
    unavailable: "La visite ne charge pas ? Réessayez ou ouvrez-la sur Kuula.",
    retry: "Réessayer",
    external: "Ouvrir sur Kuula",
    offline:
      "La visite nécessite une connexion internet. Les images du projet restent accessibles.",
    renders:
      "Visualisation du projet. Les images et la visite sont des rendus de référence.",
    next: "Image suivante",
    previous: "Image précédente",
    fit: "Voir tous les projets",
    terrain: "Relief",
    terrainNote:
      "Relief réel, sans exagération. Bâtiments selon la couverture OpenStreetMap.",
    estimated: "Livraison estimée",
  },
};
