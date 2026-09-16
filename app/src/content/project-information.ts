import type { Localized } from "./projects";

/**
 * Canonical information contract for a project profile.
 *
 * Every field is present for every project. A null value is intentional: it
 * means that the developer has not supplied evidence yet, never that a feature
 * is absent. This lets the catalogue, the detail page and the comparison share
 * one truthful vocabulary while commercial data is still being collected.
 */
export type ProjectInformationStatus =
  | "documented"
  | "pending"
  | "varies"
  | "not-applicable";

export interface ProjectInformationValue {
  value: Localized | null;
  status: ProjectInformationStatus;
}

const l = (es: string, en = es, fr = es): Localized => ({ es, en, fr });
const documented = (value: Localized): ProjectInformationValue => ({ value, status: "documented" });
const pending = (): ProjectInformationValue => ({ value: null, status: "pending" });
const varies = (value: Localized): ProjectInformationValue => ({ value, status: "varies" });

export const projectInformationFields = [
  { id: "price", category: "categoryInvestment", label: l("Precio desde", "Starting price", "Prix à partir de") },
  { id: "reservation", category: "categoryInvestment", label: l("Reserva", "Reservation", "Réservation") },
  { id: "paymentPlan", category: "categoryInvestment", label: l("Plan de pago", "Payment plan", "Plan de paiement") },
  { id: "roi", category: "categoryInvestment", label: l("ROI estimado", "Estimated ROI", "ROI estimé") },
  { id: "appreciation", category: "categoryInvestment", label: l("Potencial de revalorización", "Appreciation potential", "Potentiel de valorisation") },
  { id: "propertyType", category: "categorySpace", label: l("Tipo de propiedad", "Property type", "Type de bien") },
  { id: "bedrooms", category: "categorySpace", label: l("Habitaciones", "Bedrooms", "Chambres") },
  { id: "bathrooms", category: "categorySpace", label: l("Baños", "Bathrooms", "Salles de bain") },
  { id: "area", category: "categorySpace", label: l("Metraje", "Floor area", "Surface") },
  { id: "parking", category: "categorySpace", label: l("Parqueo", "Parking", "Stationnement") },
  { id: "furnished", category: "categorySpace", label: l("Amueblado", "Furnished", "Meublé") },
  { id: "location", category: "categoryLocation", label: l("Ubicación", "Location", "Localisation") },
  { id: "beachDistance", category: "categoryLocation", label: l("Distancia a la playa", "Distance to beach", "Distance de la plage") },
  { id: "airportDistance", category: "categoryLocation", label: l("Distancia al aeropuerto", "Distance to airport", "Distance de l’aéroport") },
  { id: "delivery", category: "categoryLocation", label: l("Fecha de entrega", "Delivery date", "Date de livraison") },
  { id: "projectState", category: "categoryLocation", label: l("Estado del proyecto", "Project status", "État du projet") },
  { id: "vacationRental", category: "categoryTax", label: l("Renta vacacional", "Vacation rental", "Location saisonnière") },
  { id: "rentalManagement", category: "categoryTax", label: l("Administración de renta", "Rental management", "Gestion locative") },
  { id: "energyEfficiency", category: "categoryTax", label: l("Eficiencia energética", "Energy efficiency", "Efficacité énergétique") },
  { id: "maintenanceFee", category: "categoryTax", label: l("Cuota de mantenimiento", "Maintenance fee", "Frais d’entretien") },
  { id: "developer", category: "categoryTax", label: l("Desarrollador", "Developer", "Promoteur") },
  { id: "financing", category: "categoryTax", label: l("Financiamiento", "Financing", "Financement") },
  { id: "idealFor", category: "categoryTax", label: l("Ideal para", "Ideal for", "Idéal pour") },
  { id: "smartHome", category: "categoryAmenities", label: l("Domótica / Smart Home", "Smart home", "Domotique / Smart Home") },
  { id: "tennis", category: "categoryAmenities", label: l("Cancha de tenis", "Tennis court", "Court de tennis") },
  { id: "golf", category: "categoryAmenities", label: l("Acceso a golf", "Golf access", "Accès au golf") },
  { id: "nearBeach", category: "categoryAmenities", label: l("Cerca de playa", "Near the beach", "Proche de la plage") },
  { id: "beachfront", category: "categoryAmenities", label: l("Primera línea de playa", "Ocean beachfront", "En front de mer") },
  { id: "artificialBeach", category: "categoryAmenities", label: l("Playa artificial", "Artificial beach", "Plage artificielle") },
  { id: "padel", category: "categoryAmenities", label: l("Cancha de pádel", "Padel court", "Terrain de padel") },
] as const;

export type ProjectInformationField = (typeof projectInformationFields)[number];
export type ProjectInformationFieldId = ProjectInformationField["id"];
export type ProjectInformationProfile = Record<
  ProjectInformationFieldId,
  ProjectInformationValue
>;

/**
 * Source-of-truth layer for long-form project facts and comparisons.
 * Values are transcribed only from the supplied project records. Pending is
 * deliberately explicit so future data entry can be completed field by field.
 */
export const projectInformation: Record<string, ProjectInformationProfile> = {
  "melcon-paradise": {
    price: varies(l("Referencia por tipología: US$113,900–US$194,000", "Reference by unit type: US$113,900–US$194,000", "Référence par typologie : 113 900–194 000 $US")),
    reservation: documented(l("US$2,000", "US$2,000", "2 000 $US")),
    paymentPlan: varies(l("10% inicial · 40% en obra · 50% a la entrega", "10% signing · 40% during construction · 50% at delivery", "10 % à la signature · 40 % pendant les travaux · 50 % à la livraison")),
    roi: pending(), appreciation: pending(),
    propertyType: documented(l("Apartamento", "Apartment", "Appartement")),
    bedrooms: documented(l("1, 2 y 3 habitaciones", "1, 2 and 3 bedrooms", "1, 2 et 3 chambres")),
    bathrooms: pending(), area: documented(l("52–108 m²", "52–108 m²", "52–108 m²")), parking: pending(), furnished: pending(),
    location: documented(l("Vista Cana · Punta Cana", "Vista Cana · Punta Cana", "Vista Cana · Punta Cana")),
    beachDistance: documented(l("Acceso dentro de Vista Cana", "Access within Vista Cana", "Accès au sein de Vista Cana")),
    airportDistance: documented(l("Aproximadamente 10 minutos", "About 10 minutes", "Environ 10 minutes")),
    delivery: documented(l("Febrero de 2028", "February 2028", "Février 2028")),
    projectState: varies(l("En desarrollo, sujeto a unidad", "In development, subject to unit", "En développement, selon l’unité")),
    vacationRental: pending(), rentalManagement: pending(), energyEfficiency: pending(), maintenanceFee: pending(), developer: pending(), financing: pending(),
    idealFor: documented(l("Vivir en un entorno tipo resort", "Living in a resort-style setting", "Vivre dans un environnement de type resort")), smartHome: pending(),
    tennis: pending(), golf: documented(l("Acceso dentro de Vista Cana", "Access within Vista Cana", "Accès au sein de Vista Cana")),
    nearBeach: documented(l("Acceso dentro de Vista Cana", "Access within Vista Cana", "Accès au sein de Vista Cana")), beachfront: pending(),
    artificialBeach: documented(l("Acceso dentro de Vista Cana", "Access within Vista Cana", "Accès au sein de Vista Cana")),
    padel: documented(l("Documentado en la ficha", "Documented in the profile", "Documenté dans la fiche")),
  },
  "terra-serena": {
    price: documented(l("Desde US$120,000", "From US$120,000", "À partir de 120 000 $US")),
    reservation: documented(l("US$2,000", "US$2,000", "2 000 $US")),
    paymentPlan: documented(l("20% inicial · 30% en obra · 50% a la entrega", "20% signing · 30% during construction · 50% at delivery", "20 % à la signature · 30 % pendant les travaux · 50 % à la livraison")),
    roi: pending(), appreciation: pending(),
    propertyType: documented(l("Apartamento y penthouse", "Apartment and penthouse", "Appartement et penthouse")),
    bedrooms: documented(l("1 habitación + den", "1 bedroom + den", "1 chambre + den")),
    bathrooms: pending(), area: documented(l("74–134 m²", "74–134 m²", "74–134 m²")), parking: pending(), furnished: pending(),
    location: documented(l("Verón–Bávaro · Punta Cana", "Verón–Bávaro · Punta Cana", "Verón–Bávaro · Punta Cana")),
    beachDistance: documented(l("Playa Bávaro y El Cortecito a 15 min; Playa Blanca a 22 min; Macao a 25 min", "Bávaro and El Cortecito beaches 15 min; Playa Blanca 22 min; Macao 25 min", "Plages de Bávaro et El Cortecito à 15 min ; Playa Blanca à 22 min ; Macao à 25 min")),
    airportDistance: documented(l("Aproximadamente 20 minutos", "About 20 minutes", "Environ 20 minutes")),
    delivery: documented(l("Noviembre de 2028", "November 2028", "Novembre 2028")),
    projectState: varies(l("En desarrollo, sujeto a unidad", "In development, subject to unit", "En développement, selon l’unité")),
    vacationRental: pending(), rentalManagement: pending(), energyEfficiency: pending(), maintenanceFee: pending(), developer: pending(), financing: pending(),
    idealFor: documented(l("Vivir en residencial de baja altura", "Living in a low-rise residential community", "Vivre dans une résidence de faible hauteur")), smartHome: pending(),
    tennis: pending(), golf: pending(), nearBeach: documented(l("Playas documentadas a 15–25 min", "Documented beaches 15–25 min away", "Plages documentées à 15–25 min")), beachfront: pending(), artificialBeach: pending(), padel: pending(),
  },
  "the-beach-at-punta-cana-city-place": {
    price: pending(),
    reservation: documented(l("US$3,000; incluye gastos legales", "US$3,000; includes legal expenses", "3 000 $US ; inclut les frais juridiques")),
    paymentPlan: documented(l("20/30/50%, 30/25/45% o 50/25/25%; este último con 2% de descuento en planes mayores a 12 meses", "20/30/50%, 30/25/45% or 50/25/25%; the latter has a 2% discount for plans over 12 months", "20/30/50 %, 30/25/45 % ou 50/25/25 % ; ce dernier offre 2 % de remise au-delà de 12 mois")),
    roi: pending(), appreciation: pending(),
    propertyType: documented(l("Estudio, apartamento y penthouse", "Studio, apartment and penthouse", "Studio, appartement et penthouse")),
    bedrooms: documented(l("Estudios; 1, 2, 3 y 4 habitaciones", "Studios; 1, 2, 3 and 4 bedrooms", "Studios ; 1, 2, 3 et 4 chambres")),
    bathrooms: pending(), area: pending(), parking: pending(), furnished: pending(),
    location: documented(l("Punta Cana City Place · Punta Cana", "Punta Cana City Place · Punta Cana", "Punta Cana City Place · Punta Cana")),
    beachDistance: documented(l("Playa a 5 minutos", "Beach 5 minutes away", "Plage à 5 minutes")),
    airportDistance: documented(l("7–10 minutos", "7–10 minutes", "7–10 minutes")),
    delivery: varies(l("Entrega inmediata o en construcción según fase", "Immediate delivery or under construction depending on phase", "Livraison immédiate ou en construction selon la phase")),
    projectState: varies(l("Entrega inmediata o en construcción según fase", "Immediate delivery or under construction depending on phase", "Livraison immédiate ou en construction selon la phase")),
    vacationRental: documented(l("Permitida según condiciones de unidad", "Allowed depending on unit terms", "Autorisée selon les conditions de l’unité")),
    rentalManagement: documented(l("Administración de propiedades para alquiler vacacional", "Property management for vacation rentals", "Gestion immobilière pour locations saisonnières")),
    energyEfficiency: pending(), maintenanceFee: pending(), developer: pending(), financing: pending(),
    idealFor: documented(l("Vivir o invertir en renta vacacional", "Living or investing in vacation rentals", "Vivre ou investir en location saisonnière")), smartHome: pending(),
    tennis: documented(l("Tenis, pádel y pickleball documentados", "Tennis, padel and pickleball documented", "Tennis, padel et pickleball documentés")), golf: pending(),
    nearBeach: documented(l("Playa a 5 minutos", "Beach 5 minutes away", "Plage à 5 minutes")), beachfront: pending(),
    artificialBeach: documented(l("Crystal Lagoons® privada con playa", "Private Crystal Lagoons® with beach", "Crystal Lagoons® privée avec plage")),
    padel: documented(l("Tenis, pádel y pickleball documentados", "Tennis, padel and pickleball documented", "Tennis, padel et pickleball documentés")),
  },
};

export function getProjectInformation(
  slug: string,
  field: ProjectInformationFieldId,
): ProjectInformationValue {
  return projectInformation[slug]?.[field] ?? pending();
}
