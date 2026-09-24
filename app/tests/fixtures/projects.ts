/**
 * Fixture de pruebas con los tres proyectos verificados.
 *
 * El contenido real vive en Supabase desde la consolidación del CMS; estos
 * objetos replican los datos verificados que antes residían en
 * `src/content/projects.ts` para que los tests de lógica (mappers, filtros
 * de catálogo, discovery) sigan ejercitando formas de datos realistas sin
 * depender de red ni de variables de entorno.
 */
import type { Localized, PropertyProject } from "../../src/content/projects.ts";

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
  delivery: {
    label: l("Febrero de 2028", "February 2028", "Février 2028"),
    year: 2028,
    status: "confirmed",
  },
  reservation: {
    amount: 2000,
    currency: "USD",
    note: null,
  },
  propertyCategory: { key: "apartamento", label: l("Apartamento", "Apartment", "Appartement") },
  productTypes: [
    l("Apartamento", "Apartment", "Appartement"),
  ],
  typologies: [
    l("Apartamentos de 1, 2 y 3 habitaciones", "One, two and three-bedroom apartments", "Appartements de 1, 2 et 3 chambres"),
  ],
  includesAppliances: true,
  investmentBenefits: [
    l("Estilo de vida tipo resort dentro de Vista Cana", "Resort-style living inside Vista Cana", "Style de vie type resort à Vista Cana"),
    l("Más de 20,000 m² de áreas verdes privadas", "More than 20,000 m² of private green areas", "Plus de 20 000 m² d'espaces verts privés"),
  ],
  nearby: [
    l("Aeropuerto Internacional de Punta Cana a unos 10 minutos", "Punta Cana International Airport about 10 minutes away", "Aéroport international de Punta Cana à environ 10 minutes"),
    l("BlueMall Punta Cana a unos 5 minutos", "BlueMall Punta Cana about 5 minutes away", "BlueMall Punta Cana à environ 5 minutes"),
  ],
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
    { name: l("Piscinas y jacuzzi", "Pools & jacuzzi", "Piscines et jacuzzi"), image: "/derived/melcon-pool.webp" },
    { name: l("Gimnasio y spa", "Gym & spa", "Salle de sport et spa"), image: null },
    { name: l("Coworking", "Coworking", "Coworking"), image: null },
    { name: l("Pádel", "Padel court", "Terrain de padel"), image: null },
    l("Pet friendly", "Pet friendly", "Animaux bienvenus"),
    l("Conserjería 24/7", "24/7 concierge", "Conciergerie 24 h/24"),
    { name: l("Summer Gardens", "Summer Gardens", "Summer Gardens"), image: "/derived/melcon-gardens.webp" },
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
  bedrooms: [1],
  bathrooms: [],
  parking: null,
  area: { min: 74, max: 134, unit: "m²" },
  greenArea: 0,
  price: { from: 120000, to: null, currency: "USD", status: "confirmed" },
  delivery: {
    label: l("Noviembre de 2028", "November 2028", "Novembre 2028"),
    year: 2028,
    status: "confirmed",
  },
  reservation: {
    amount: 2000,
    currency: "USD",
    note: null,
  },
  propertyCategory: { key: "mixto", label: l("Mixto", "Mixed", "Mixte") },
  productTypes: [
    l("Apartamento", "Apartment", "Appartement"),
    l("Penthouse", "Penthouse", "Penthouse"),
  ],
  typologies: [
    l("Apartamentos de 1 dormitorio + den", "One-bedroom apartments + den", "Appartements 1 chambre + den"),
    l("Penthouses con terrazas privadas", "Penthouses with private terraces", "Penthouses avec terrasses privées"),
  ],
  includesAppliances: null,
  investmentBenefits: [
    l("108 unidades en un residencial contemporáneo", "108 units in a contemporary residential community", "108 unités dans une résidence contemporaine"),
    l("Ubicación próxima a playas, golf, comercios y servicios", "Close to beaches, golf, shops and services", "Proche des plages, du golf, des commerces et des services"),
  ],
  nearby: [
    l("Playa Bávaro a 15 minutos", "Bavaro Beach 15 minutes away", "Playa Bávaro à 15 minutes"),
    l("Playa del Cortecito a 15 minutos", "El Cortecito Beach 15 minutes away", "Playa del Cortecito à 15 minutes"),
    l("Playa Blanca a 22 minutos", "Playa Blanca 22 minutes away", "Playa Blanca à 22 minutes"),
    l("Playa Macao a 25 minutos", "Macao Beach 25 minutes away", "Playa Macao à 25 minutes"),
    l("Aeropuerto Internacional de Punta Cana a unos 20 minutos", "Punta Cana International Airport about 20 minutes away", "Aéroport international de Punta Cana à environ 20 minutes"),
  ],
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
    l("2 piscinas", "2 pools", "2 piscines"),
    l("Gimnasio", "Gym", "Salle de sport"),
    l("Parque infantil", "Children's play area", "Aire de jeux"),
    l("Área para mascotas", "Pet area", "Espace pour animaux"),
    l("CCTV y seguridad 24/7", "CCTV and 24/7 security", "CCTV et sécurité 24 h/24"),
  ],
  map: {
    url: "https://maps.app.goo.gl/6AVZ98JtS5XG9Yhy7",
    coordinates: [18.6486529, -68.4372208],
    precision: "exact",
  },
  paymentReference: { signing: 20, construction: 30, delivery: 50, commercialStatus: "confirmed" },
  source: "ASSETS/projects/project-01-unidentified/ · docs/design/project-location-evidence.json",
};

export const theBeach: PropertyProject = {
  id: "the-beach-at-punta-cana-city-place",
  slug: "the-beach-at-punta-cana-city-place",
  name: "The Beach at Punta Cana City Place",
  status: "reviewed",
  location: "Punta Cana City Place · Punta Cana",
  description: l(
    "Un desarrollo residencial en Punta Cana City Place con vista y acceso directo a Crystal Lagoons®, pensado para vivir o invertir en alquiler vacacional.",
    "A residential development in Punta Cana City Place with views and direct access to Crystal Lagoons®, designed for living or vacation-rental investment.",
    "Un développement résidentiel à Punta Cana City Place avec vue et accès direct à Crystal Lagoons®, pensé pour vivre ou investir en location saisonnière.",
  ),
  bedrooms: [1, 2, 3, 4],
  bathrooms: [],
  parking: null,
  area: { min: 0, max: 0, unit: "m²" },
  greenArea: 0,
  price: { from: null, to: null, currency: "USD", status: "pending" },
  delivery: {
    label: l("Entrega inmediata o en construcción según fase", "Immediate delivery or under construction depending on phase", "Livraison immédiate ou en construction selon la phase"),
    year: null,
    status: "varies",
  },
  reservation: {
    amount: 3000,
    currency: "USD",
    note: l("Incluye gastos legales", "Includes legal expenses", "Inclut les frais juridiques"),
  },
  propertyCategory: { key: "mixto", label: l("Mixto", "Mixed", "Mixte") },
  productTypes: [
    l("Estudio", "Studio", "Studio"),
    l("Apartamento", "Apartment", "Appartement"),
    l("Penthouse", "Penthouse", "Penthouse"),
  ],
  typologies: [
    l("Mare: apartamentos de 1 y 2 habitaciones con vista al Crystal Lagoon", "Mare: one and two-bedroom apartments with Crystal Lagoon views", "Mare : appartements de 1 et 2 chambres avec vue sur Crystal Lagoon"),
    l("Sole: estudios, apartamentos de 2 a 4 habitaciones y penthouses limitados", "Sole: studios, two to four-bedroom apartments and limited penthouses", "Sole : studios, appartements de 2 à 4 chambres et penthouses limités"),
    l("Arena: estudios y apartamentos de 1 a 3 habitaciones con vista a piscina", "Arena: studios and one to three-bedroom apartments with pool views", "Arena : studios et appartements de 1 à 3 chambres avec vue piscine"),
  ],
  includesAppliances: true,
  investmentBenefits: [
    l("Crystal Lagoons® de 30,000 m² con actividades acuáticas", "30,000 m² Crystal Lagoons® with water activities", "Crystal Lagoons® de 30 000 m² avec activités aquatiques"),
    l("CONFOTUR con exoneración de impuestos por 15 años según condiciones del proyecto", "CONFOTUR tax exemption for 15 years subject to project conditions", "CONFOTUR avec exonération fiscale de 15 ans selon les conditions du projet"),
    l("Administración de propiedades para alquiler vacacional", "Property management for vacation rentals", "Gestion immobilière pour locations saisonnières"),
  ],
  nearby: [
    l("Aeropuerto Internacional de Punta Cana a 7–10 minutos", "Punta Cana International Airport 7–10 minutes away", "Aéroport international de Punta Cana à 7–10 minutes"),
    l("Playa a 5 minutos", "Beach 5 minutes away", "Plage à 5 minutes"),
  ],
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
    l("Playa privada", "Private beach", "Plage privée"),
    l("Piscinas", "Pools", "Piscines"),
    l("Tenis, pádel y pickleball", "Tennis, padel and pickleball", "Tennis, padel et pickleball"),
    l("Kayaks", "Kayaks", "Kayaks"),
    l("Spa y gimnasio", "Spa and gym", "Spa et salle de sport"),
    l("Minimercado y lavandería", "Minimarket and laundry", "Supérette et buanderie"),
    l("Seguridad 24/7", "24/7 security", "Sécurité 24 h/24"),
  ],
  map: {
    url: "https://maps.app.goo.gl/fFaGb7cYhyBHwNJY8",
    coordinates: [18.6337522, -68.3834561],
    precision: "exact",
  },
  paymentReference: {
    signing: 20,
    construction: 30,
    delivery: 50,
    commercialStatus: "confirmed",
    plans: [
      { signing: 20, construction: 30, delivery: 50 },
      { signing: 30, construction: 25, delivery: 45 },
      { signing: 50, construction: 25, delivery: 25, discount: "2%" },
    ],
  },
  source: "ASSETS/projects/project-03-unidentified/ · docs/design/project-location-evidence.json",
};

export const testProjects: PropertyProject[] = [melcon, terraSerena, theBeach];
