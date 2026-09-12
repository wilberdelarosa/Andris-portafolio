export type Locale = "es" | "en" | "fr";
export type Localized = Record<Locale, string>;
export interface PropertyProject {
  id: string;
  slug: string;
  name: string;
  status: "reviewed" | "draft";
  location: string;
  description: Localized;
  bedrooms: number[];
  area: { min: number; max: number; unit: string };
  greenArea: number;
  hero: string;
  gallery: { src: string; alt: Localized }[];
  amenities: Localized[];
  map: {
    url: string;
    coordinates: [number, number] | null;
    precision: "exact" | "area" | "unverified";
  };
  paymentReference: {
    signing: number;
    construction: number;
    delivery: number;
    commercialStatus: string;
  };
  source: string;
}
const l = (es: string, en: string, fr: string): Localized => ({ es, en, fr });
export const melcon: PropertyProject = {
  id: "melcon-paradise",
  slug: "melcon-paradise",
  name: "Melcon Paradise",
  status: "reviewed",
  location: "Vista Cana · Punta Cana",
  description: l(
    "Un entorno donde la naturaleza es parte de tu día a día. Apartamentos de 1, 2 y 3 habitaciones, rodeados de jardines y espacios para disfrutar a tu ritmo.",
    "A place where nature is part of everyday life. One, two and three-bedroom apartments surrounded by gardens and spaces to enjoy at your own pace.",
    "Un cadre où la nature fait partie du quotidien. Des appartements de 1, 2 et 3 chambres, entourés de jardins et d’espaces à vivre à votre rythme.",
  ),
  bedrooms: [1, 2, 3],
  area: { min: 52, max: 108, unit: "m²" },
  greenArea: 20000,
  hero: "/derived/melcon-hero.webp",
  gallery: [
    {
      src: "/derived/melcon-hero.webp",
      alt: l(
        "Render de los jardines y río artificial de Melcon Paradise",
        "Rendering of the gardens and artificial river at Melcon Paradise",
        "Vue de synthèse des jardins et de la rivière artificielle de Melcon Paradise",
      ),
    },
    {
      src: "/derived/melcon-pool.webp",
      alt: l(
        "Render de la piscina de Melcon Paradise",
        "Rendering of the Melcon Paradise swimming pool",
        "Vue de synthèse de la piscine de Melcon Paradise",
      ),
    },
    {
      src: "/derived/melcon-living.webp",
      alt: l(
        "Render interior de un apartamento de Melcon Paradise",
        "Interior rendering of a Melcon Paradise apartment",
        "Vue de synthèse de l’intérieur d’un appartement Melcon Paradise",
      ),
    },
    {
      src: "/derived/melcon-bedroom.webp",
      alt: l(
        "Render de una habitación de Melcon Paradise",
        "Bedroom rendering at Melcon Paradise",
        "Vue de synthèse d’une chambre de Melcon Paradise",
      ),
    },
    {
      src: "/derived/melcon-aerial.webp",
      alt: l(
        "Render de la vista aérea de Melcon Paradise",
        "Aerial rendering of Melcon Paradise",
        "Vue aérienne de synthèse de Melcon Paradise",
      ),
    },
    {
      src: "/derived/melcon-gardens.webp",
      alt: l(
        "Render de Summer Gardens en Melcon Paradise",
        "Rendering of Summer Gardens at Melcon Paradise",
        "Vue de synthèse de Summer Gardens à Melcon Paradise",
      ),
    },
  ],
  amenities: [
    l("Piscinas y jacuzzi", "Pools & jacuzzi", "Piscines et jacuzzi"),
    l("Gimnasio y spa", "Gym & spa", "Salle de sport et spa"),
    l("Coworking", "Coworking", "Coworking"),
    l("Pádel", "Padel court", "Terrain de padel"),
    l("Pet friendly", "Pet friendly", "Animaux bienvenus"),
    l("Conserjería 24/7", "24/7 concierge", "Conciergerie 24 h/24"),
    l("Summer Gardens", "Summer Gardens", "Summer Gardens"),
    l("Owners Club", "Owners Club", "Owners Club"),
  ],
  map: {
    url: "https://maps.app.goo.gl/htoJVFhZERHas7Kw7",
    coordinates: [18.637918, -68.444033],
    precision: "exact",
  },
  paymentReference: {
    signing: 10,
    construction: 40,
    delivery: 50,
    commercialStatus: "reconfirm",
  },
  source: "ASSETS/projects/melcon-paradise/DESCRIPCION.txt",
};
// Drafts are deliberately kept out of public queries and APIs until their full dossiers are approved.
export const projectDrafts = [
  "project-01-unidentified",
  "project-03-unidentified",
] as const;
export const getPublishedProjects = (): PropertyProject[] => [melcon];
export const getProject = (slug: string) =>
  getPublishedProjects().find((project) => project.slug === slug);
export const toPublicProject = (project: PropertyProject) => ({
  id: project.id,
  slug: project.slug,
  name: project.name,
  location: project.location,
  description: project.description,
  bedrooms: project.bedrooms,
  area: project.area,
  greenArea: project.greenArea,
  hero: project.hero,
  gallery: project.gallery,
  amenities: project.amenities,
  map: project.map,
  paymentReference: project.paymentReference,
});
