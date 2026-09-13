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
  /** Vacio mientras no este confirmado por el desarrollador. */
  bathrooms: number[];
  /** `null` mientras no este confirmado. */
  parking: number | null;
  area: { min: number; max: number; unit: string };
  greenArea: number;
  /**
   * Rango de precio.
   *
   * `from`/`to` en `null` significa sin confirmar, y la interfaz lo muestra
   * como "por confirmar" en lugar de inventar una cifra. Para publicar un
   * precio basta rellenar los numeros y poner `status: "confirmed"`.
   */
  price: {
    from: number | null;
    to: number | null;
    currency: "USD";
    status: "confirmed" | "pending";
  };
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
  bathrooms: [],
  parking: null,
  area: { min: 52, max: 108, unit: "m²" },
  greenArea: 20000,
  /*
   * La ficha del desarrollador registra precios de referencia por tipologia
   * (1 hab. 113900, 2 hab. 149000, 3 hab. 194000 USD), pero su canal comercial
   * publica cifras distintas segun la etapa. Hasta recibir la tabla vigente se
   * queda sin confirmar: rellena `from`/`to` y pon `status: "confirmed"`.
   */
  price: { from: null, to: null, currency: "USD", status: "pending" },
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
export const terraSerena: PropertyProject = {
  id: "terra-serena",
  slug: "terra-serena",
  name: "Terra Serena",
  status: "reviewed",
  location: "Verón–Bávaro · Punta Cana",
  description: l(
    "Un residencial de baja altura con áreas verdes y espacios pensados para la vida diaria.",
    "A low-rise residential community with green areas and spaces designed for everyday life.",
    "Une résidence de faible hauteur avec des espaces verts et des lieux pensés pour le quotidien.",
  ),
  bedrooms: [],
  bathrooms: [],
  parking: null,
  area: { min: 0, max: 0, unit: "m²" },
  greenArea: 0,
  // Sin datos comerciales todavia. Rellena aqui cuando lleguen.
  price: { from: null, to: null, currency: "USD", status: "pending" },
  hero: "/derived/terra-serena-hero.webp",
  gallery: [
    { src: "/derived/terra-serena-hero.webp", alt: l("Render de las áreas verdes de Terra Serena", "Rendering of Terra Serena's green areas", "Vue de synthèse des espaces verts de Terra Serena") },
    { src: "/derived/terra-serena-pool.webp", alt: l("Render de la piscina de Terra Serena", "Rendering of Terra Serena's pool", "Vue de synthèse de la piscine de Terra Serena") },
    { src: "/derived/terra-serena-aerial.webp", alt: l("Render aéreo de Terra Serena", "Aerial rendering of Terra Serena", "Vue aérienne de synthèse de Terra Serena") },
    { src: "/derived/terra-serena-living.webp", alt: l("Render interior de Terra Serena", "Interior rendering of Terra Serena", "Vue de synthèse intérieure de Terra Serena") },
    { src: "/derived/terra-serena-bedroom.webp", alt: l("Render de habitación de Terra Serena", "Bedroom rendering of Terra Serena", "Vue de synthèse d'une chambre de Terra Serena") },
  ],
  amenities: [
    l("Áreas verdes", "Green areas", "Espaces verts"),
    l("Piscinas", "Pools", "Piscines"),
    l("Parque infantil", "Children's play area", "Aire de jeux"),
    l("Área para mascotas", "Pet area", "Espace pour animaux"),
  ],
  map: {
    url: "https://maps.app.goo.gl/6AVZ98JtS5XG9Yhy7",
    coordinates: [18.6486529, -68.4372208],
    precision: "exact",
  },
  paymentReference: { signing: 0, construction: 0, delivery: 0, commercialStatus: "reconfirm" },
  source: "ASSETS/projects/project-01-unidentified/ · docs/design/project-location-evidence.json",
};
export const theBeach: PropertyProject = {
  id: "the-beach-at-punta-cana-city-place",
  slug: "the-beach-at-punta-cana-city-place",
  name: "The Beach at Punta Cana City Place",
  status: "reviewed",
  location: "Punta Cana City Place · Punta Cana",
  description: l(
    "Una comunidad residencial alrededor de una laguna cristalina y espacios al aire libre.",
    "A residential community around a crystal lagoon and outdoor spaces.",
    "Une communauté résidentielle autour d'un lagon cristallin et d'espaces extérieurs.",
  ),
  bedrooms: [],
  bathrooms: [],
  parking: null,
  area: { min: 0, max: 0, unit: "m²" },
  greenArea: 0,
  // Sin datos comerciales todavia. Rellena aqui cuando lleguen.
  price: { from: null, to: null, currency: "USD", status: "pending" },
  hero: "/derived/the-beach-hero.webp",
  gallery: [
    { src: "/derived/the-beach-hero.webp", alt: l("Render de la laguna de The Beach at Punta Cana City Place", "Rendering of The Beach at Punta Cana City Place lagoon", "Vue de synthèse du lagon de The Beach at Punta Cana City Place") },
    { src: "/derived/the-beach-pool.webp", alt: l("Render de la piscina de The Beach at Punta Cana City Place", "Rendering of The Beach at Punta Cana City Place pool", "Vue de synthèse de la piscine de The Beach at Punta Cana City Place") },
    { src: "/derived/the-beach-terrace.webp", alt: l("Render de las terrazas de The Beach at Punta Cana City Place", "Rendering of The Beach at Punta Cana City Place terraces", "Vue de synthèse des terrasses de The Beach at Punta Cana City Place") },
    { src: "/derived/the-beach-living.webp", alt: l("Render interior de The Beach at Punta Cana City Place", "Interior rendering of The Beach at Punta Cana City Place", "Vue de synthèse intérieure de The Beach at Punta Cana City Place") },
    { src: "/derived/the-beach-bedroom.webp", alt: l("Render de habitación de The Beach at Punta Cana City Place", "Bedroom rendering of The Beach at Punta Cana City Place", "Vue de synthèse d'une chambre de The Beach at Punta Cana City Place") },
  ],
  amenities: [
    l("Laguna cristalina", "Crystal lagoon", "Lagon cristallin"),
    l("Piscinas", "Pools", "Piscines"),
    l("Espacios al aire libre", "Outdoor spaces", "Espaces extérieurs"),
  ],
  map: {
    url: "https://maps.app.goo.gl/fFaGb7cYhyBHwNJY8",
    coordinates: [18.6337522, -68.3834561],
    precision: "exact",
  },
  paymentReference: { signing: 0, construction: 0, delivery: 0, commercialStatus: "reconfirm" },
  source: "ASSETS/projects/project-03-unidentified/ · docs/design/project-location-evidence.json",
};
export const getPublishedProjects = (): PropertyProject[] => [
  melcon,
  terraSerena,
  theBeach,
];
export const getProject = (slug: string) =>
  getPublishedProjects().find((project) => project.slug === slug);
export const toPublicProject = (project: PropertyProject) => ({
  id: project.id,
  slug: project.slug,
  name: project.name,
  location: project.location,
  description: project.description,
  bedrooms: project.bedrooms,
  bathrooms: project.bathrooms,
  parking: project.parking,
  price: project.price,
  area: project.area,
  greenArea: project.greenArea,
  hero: project.hero,
  gallery: project.gallery,
  amenities: project.amenities,
  map: project.map,
  paymentReference: project.paymentReference,
});
