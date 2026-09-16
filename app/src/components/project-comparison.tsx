"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  CheckCircle,
  CurrencyDollar,
  Eye,
  EyeSlash,
  HouseLine,
  Info,
  MapPin,
  Scales,
  ShieldCheck,
  Sparkle,
  Tree,
  WhatsappLogo,
  X,
  CaretUp,
} from "@phosphor-icons/react";
import { catalogCopy } from "@/content/catalog-copy";
import { advisor } from "@/content/advisor";
import { getPublishedProjects, type PropertyProject } from "@/content/projects";
import { useExperience } from "./experience-provider";
import { discoveryCopy, discoveryFeatures, projectDiscovery } from "@/content/project-discovery";
import "./project-comparison.css";

interface ComparisonProps {
  selectedSlugs: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleSlug: (slug: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

interface SpecRow {
  id: string;
  category: string;
  label: { es: string; en: string; fr: string };
  icon: React.ComponentType<{ size?: number; className?: string; weight?: "fill" | "bold" | "regular" }>;
  getValue: (p: PropertyProject, locale: "es" | "en" | "fr") => {
    text: string;
    isPending?: boolean;
    isHighlight?: boolean;
    badge?: string;
  };
  isDifferent: (projects: PropertyProject[]) => boolean;
}

const SPEC_ROWS: SpecRow[] = [
  ...discoveryFeatures.map((feature): SpecRow => ({
    id: feature.id,
    category: "categoryAmenities",
    label: feature.label,
    icon: CheckCircle,
    getValue: (project, locale) => ({
      text: projectDiscovery[project.slug]?.features.includes(feature.id)
        ? feature.id === "golf" || (feature.id === "artificial-beach" && project.slug === "melcon-paradise")
          ? (locale === "es" ? "Acceso dentro de Vista Cana" : locale === "fr" ? "Accès dans Vista Cana" : "Access within Vista Cana")
          : (locale === "es" ? "Documentado en la ficha" : locale === "fr" ? "Documenté dans la fiche" : "Documented in the profile")
        : (locale === "es" ? "No documentado" : locale === "fr" ? "Non documenté" : "Not documented"),
      isPending: !projectDiscovery[project.slug]?.features.includes(feature.id),
    }),
    isDifferent: (projects) => new Set(projects.map((project) => projectDiscovery[project.slug]?.features.includes(feature.id))).size > 1,
  })),
  // 1. Inversión y Pagos
  {
    id: "price",
    category: "categoryInvestment",
    label: { es: "Precio base", en: "Base price", fr: "Prix de base" },
    icon: CurrencyDollar,
    getValue: (p, locale) => {
      const c = catalogCopy[locale];
      if (p.price.status === "confirmed" && p.price.from !== null) {
        return {
          text: `${c.priceFrom} ${new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p.price.from)}`,
          isPending: false,
          badge: c.confirmedPrice,
        };
      }
      return {
        text: p.slug === "melcon-paradise"
          ? (locale === "es" ? "Por confirmar (Ref. $113.9k – $194k según tipología)" : locale === "en" ? "To confirm (Ref. $113.9k – $194k by unit type)" : "À confirmer (Réf. 113,9k – 194k $ selon typologie)")
          : (locale === "es" ? "Por confirmar (Consultar según fase comercial)" : locale === "en" ? "To confirm (Consult per commercial phase)" : "À confirmer (Consulter selon la phase)"),
        isPending: true,
        badge: c.pendingPrice,
      };
    },
    isDifferent: (projects) => {
      const keys = projects.map((p) => `${p.price.status}-${p.price.from}`);
      return new Set(keys).size > 1;
    },
  },
  {
    id: "reservation",
    category: "categoryInvestment",
    label: { es: "Monto de reserva", en: "Reservation fee", fr: "Montant de réservation" },
    icon: CurrencyDollar,
    getValue: (p, locale) => {
      const amount = p.reservation.amount ? `$${p.reservation.amount.toLocaleString()} USD` : "—";
      const note = p.reservation.note ? ` (${p.reservation.note[locale]})` : "";
      return { text: `${amount}${note}`, isPending: !p.reservation.amount };
    },
    isDifferent: (projects) => {
      const keys = projects.map((p) => `${p.reservation.amount}-${p.reservation.note?.es}`);
      return new Set(keys).size > 1;
    },
  },
  {
    id: "paymentPlan",
    category: "categoryInvestment",
    label: { es: "Estructura de pago", en: "Payment structure", fr: "Structure de paiement" },
    icon: CurrencyDollar,
    getValue: (p, locale) => {
      const ref = p.paymentReference;
      if (p.slug === "the-beach-at-punta-cana-city-place") {
        return {
          text: locale === "es"
            ? "Inicial / obra / entrega: 20/30/50%, 30/25/45% o 50/25/25%. El último tiene 2% de descuento en planes mayores a 12 meses."
            : locale === "en"
            ? "Signing / construction / delivery: 20/30/50%, 30/25/45% or 50/25/25%. The last includes a 2% discount for plans longer than 12 months."
            : "Signature / travaux / livraison : 20/30/50 %, 30/25/45 % ou 50/25/25 %. Le dernier offre 2 % de remise pour les plans de plus de 12 mois.",
        };
      }
      return {
        text: locale === "es"
          ? `${ref.signing}% inicial · ${ref.construction}% en obra · ${ref.delivery}% a la entrega`
          : locale === "en"
          ? `${ref.signing}% signing · ${ref.construction}% in build · ${ref.delivery}% on delivery`
          : `${ref.signing}% signature · ${ref.construction}% travaux · ${ref.delivery}% livraison`,
      };
    },
    isDifferent: (projects) => {
      const keys = projects.map((p) => `${p.paymentReference.signing}/${p.paymentReference.construction}/${p.paymentReference.delivery}`);
      return new Set(keys).size > 1;
    },
  },

  // 2. Fiscalidad y Beneficios
  {
    id: "confotur",
    category: "categoryTax",
    label: { es: "Incentivo CONFOTUR", en: "CONFOTUR Tax Incentive", fr: "Incitation fiscale CONFOTUR" },
    icon: Sparkle,
    getValue: (p, locale) => {
      const isConfotur = p.slug === "the-beach-at-punta-cana-city-place";
      if (isConfotur) {
        return {
          text: locale === "es"
            ? "Beneficio de 15 años indicado en la ficha. Alcance, clasificación y condiciones sujetos a validación documental antes de reservar."
            : locale === "en"
            ? "A 15-year benefit is stated in the supplied profile. Scope, classification and eligibility require documentary verification before reserving."
            : "Un avantage de 15 ans est indiqué dans la fiche. Portée, classement et conditions à vérifier avant réservation.",
          isHighlight: true,
          badge: "CONFOTUR",
        };
      }
      return {
        text: locale === "es" ? "Por confirmar con el desarrollador" : locale === "en" ? "To confirm with the developer" : "À confirmer avec le promoteur",
        isPending: true,
      };
    },
    isDifferent: (projects) => {
      const hasConfotur = projects.map((p) => p.slug === "the-beach-at-punta-cana-city-place");
      return new Set(hasConfotur).size > 1;
    },
  },
  {
    id: "rental",
    category: "categoryTax",
    label: { es: "Renta vacacional", en: "Vacation rental", fr: "Location saisonnière" },
    icon: HouseLine,
    getValue: (p, locale) => {
      if (p.slug === "the-beach-at-punta-cana-city-place") {
        return {
          text: locale === "es"
            ? "Gestión de alquiler vacacional integrada y optimizada"
            : locale === "en"
            ? "Integrated vacation rental property management"
            : "Gestion locative saisonnière intégrée",
        };
      }
      if (p.slug === "melcon-paradise") {
        return {
          text: locale === "es"
            ? "Comunidad con amenidades resort dentro de Vista Cana"
            : locale === "en"
            ? "Resort amenities community inside Vista Cana"
            : "Résidence type resort au sein de Vista Cana",
        };
      }
      return {
        text: locale === "es"
          ? "Residencial contemporáneo de baja altura"
          : locale === "en"
          ? "Low-rise contemporary residential community"
          : "Résidence contemporaine à faible hauteur",
      };
    },
    isDifferent: () => true,
  },

  // 3. Espacios y Metrajes
  {
    id: "bedrooms",
    category: "categorySpace",
    label: { es: "Habitaciones", en: "Bedrooms", fr: "Chambres" },
    icon: HouseLine,
    getValue: (p, locale) => {
      if (p.slug === "the-beach-at-punta-cana-city-place") {
        return {
          text: locale === "es" ? "Estudios, 1, 2, 3 y 4 habs." : locale === "en" ? "Studios, 1, 2, 3 & 4 beds" : "Studios, 1, 2, 3 et 4 ch.",
        };
      }
      if (p.slug === "terra-serena") {
        return {
          text: locale === "es" ? "1 habitación + den" : locale === "en" ? "1 bedroom + den" : "1 chambre + den",
        };
      }
      return {
        text: locale === "es" ? "1, 2 y 3 habitaciones" : locale === "en" ? "1, 2 & 3 bedrooms" : "1, 2 et 3 chambres",
      };
    },
    isDifferent: (projects) => {
      const keys = projects.map((p) => p.bedrooms.join(","));
      return new Set(keys).size > 1;
    },
  },
  {
    id: "area",
    category: "categorySpace",
    label: { es: "Superficie construida", en: "Floor area", fr: "Surface construite" },
    icon: HouseLine,
    getValue: (p, locale) => {
      if (p.area.min > 0) {
        return {
          text: `${p.area.min} a ${p.area.max} ${p.area.unit}`,
        };
      }
      return {
        text: locale === "es" ? "Por confirmar según tipología" : locale === "en" ? "To confirm by typology" : "À confirmer selon typologie",
        isPending: true,
      };
    },
    isDifferent: (projects) => {
      const keys = projects.map((p) => `${p.area.min}-${p.area.max}`);
      return new Set(keys).size > 1;
    },
  },
  {
    id: "greenArea",
    category: "categorySpace",
    label: { es: "Áreas verdes y entorno", en: "Greenery & water feature", fr: "Espaces verts et eau" },
    icon: Tree,
    getValue: (p, locale) => {
      if (p.slug === "the-beach-at-punta-cana-city-place") {
        return {
          text: locale === "es"
            ? "30,000 m² Crystal Lagoons® privada con playa"
            : locale === "en"
            ? "30,000 m² Crystal Lagoons® private beach lagoon"
            : "Lagon privé Crystal Lagoons® de 30 000 m²",
          isHighlight: true,
        };
      }
      if (p.greenArea > 0) {
        return {
          text: locale === "es"
            ? `Más de ${p.greenArea.toLocaleString()} m² de áreas verdes privadas`
            : locale === "en"
            ? `More than ${p.greenArea.toLocaleString()} m² private green areas`
            : `Plus de ${p.greenArea.toLocaleString()} m² d'espaces verts privés`,
        };
      }
      return {
        text: locale === "es" ? "Jardines y áreas verdes residenciales" : locale === "en" ? "Residential gardens & green areas" : "Jardins et espaces verts résidentiels",
      };
    },
    isDifferent: (projects) => {
      const keys = projects.map((p) => p.slug === "the-beach-at-punta-cana-city-place" ? "beach" : String(p.greenArea));
      return new Set(keys).size > 1;
    },
  },
  {
    id: "bathroomsParking",
    category: "categorySpace",
    label: { es: "Baños y parqueos", en: "Bathrooms & parking", fr: "Salles de bain & parking" },
    icon: Info,
    getValue: (_p, locale) => ({
      text: locale === "es" ? "Asignación según plano de unidad" : locale === "en" ? "Allocated per unit plan" : "Attribué selon plan d'unité",
      isPending: true,
    }),
    isDifferent: () => false,
  },

  // 4. Ubicación y Conectividad
  {
    id: "zone",
    category: "categoryLocation",
    label: { es: "Ubicación exacta", en: "Precise location", fr: "Localisation exacte" },
    icon: MapPin,
    getValue: (p) => ({
      text: p.location,
    }),
    isDifferent: (projects) => {
      const keys = projects.map((p) => p.location);
      return new Set(keys).size > 1;
    },
  },
  {
    id: "airport",
    category: "categoryLocation",
    label: { es: "Aeropuerto PUJ", en: "PUJ Airport", fr: "Aéroport PUJ" },
    icon: MapPin,
    getValue: (p) => {
      if (p.slug === "the-beach-at-punta-cana-city-place") return { text: "7–10 min" };
      if (p.slug === "melcon-paradise") return { text: "10 min" };
      return { text: "20 min" };
    },
    isDifferent: (projects) => {
      const keys = projects.map((p) => p.slug);
      return new Set(keys).size > 1;
    },
  },

  // 5. Equipamiento y Amenidades
  {
    id: "delivery",
    category: "categoryAmenities",
    label: { es: "Fecha de entrega", en: "Handover date", fr: "Date de livraison" },
    icon: ShieldCheck,
    getValue: (p, locale) => {
      return {
        text: p.delivery.label[locale],
        badge: p.delivery.status === "confirmed" ? discoveryCopy[locale].estimated : (locale === "es" ? "Por fases" : locale === "fr" ? "Par phases" : "Phased"),
      };
    },
    isDifferent: (projects) => {
      const keys = projects.map((p) => p.delivery.label.es);
      return new Set(keys).size > 1;
    },
  },
  {
    id: "appliances",
    category: "categoryAmenities",
    label: { es: "Línea blanca", en: "Home appliances", fr: "Électroménagers" },
    icon: CheckCircle,
    getValue: (p, locale) => {
      if (p.includesAppliances === true) {
        return {
          text: locale === "es" ? "Incluida en la unidad" : locale === "en" ? "Included with unit" : "Inclus dans l'unité",
          isHighlight: true,
        };
      }
      return {
        text: locale === "es" ? "Por confirmar con desarrollador" : locale === "en" ? "To confirm with developer" : "À confirmer avec le promoteur",
        isPending: true,
      };
    },
    isDifferent: (projects) => {
      const keys = projects.map((p) => String(p.includesAppliances));
      return new Set(keys).size > 1;
    },
  },
  {
    id: "signatureAmenities",
    category: "categoryAmenities",
    label: { es: "Amenidades insignia", en: "Signature amenities", fr: "Prestations phares" },
    icon: Sparkle,
    getValue: (p, locale) => {
      if (p.slug === "the-beach-at-punta-cana-city-place") {
        return {
          text: locale === "es"
            ? "Crystal Lagoons® 30,000 m², playa privada, kayaks, pádel, tenis, minimarket"
            : locale === "en"
            ? "Crystal Lagoons® 30,000 m², private beach, kayaks, padel, tennis, minimarket"
            : "Crystal Lagoons® 30 000 m², plage privée, kayaks, padel, tennis, supérette",
        };
      }
      if (p.slug === "melcon-paradise") {
        return {
          text: locale === "es"
            ? "Summer Gardens, Owners Club, piscinas, río artificial, pádel, spa"
            : locale === "en"
            ? "Summer Gardens, Owners Club, pools, artificial river, padel, spa"
            : "Summer Gardens, Owners Club, piscines, rivière artificielle, padel, spa",
        };
      }
      return {
        text: locale === "es"
          ? "2 piscinas, gimnasio, áreas verdes, parque infantil, parque canino"
          : locale === "en"
          ? "2 pools, gym, green areas, kids play area, pet zone"
          : "2 piscines, salle de sport, espaces verts, aire de jeux, espace canin",
      };
    },
    isDifferent: () => true,
  },
  {
    id: "security",
    category: "categoryAmenities",
    label: { es: "Seguridad y acceso", en: "Security & access", fr: "Sécurité & accès" },
    icon: ShieldCheck,
    getValue: (_p, locale) => ({
      text: locale === "es" ? "Acceso controlado y seguridad 24/7" : locale === "en" ? "Controlled access & 24/7 security" : "Accès contrôlé et sécurité 24 h/24",
    }),
    isDifferent: () => false,
  },
];

export function ProjectComparisonDock({
  selectedSlugs,
  onOpenModal,
  onToggleSlug,
  onSelectAll,
  onClearAll,
}: {
  selectedSlugs: string[];
  onOpenModal: () => void;
  onToggleSlug: (slug: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
  const { locale } = useExperience();
  const reduced = useReducedMotion();
  const c = catalogCopy[locale];
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const allProjects = useMemo(() => getPublishedProjects(), []);
  const selectedProjects = useMemo(
    () => allProjects.filter((p) => selectedSlugs.includes(p.slug)),
    [allProjects, selectedSlugs],
  );
  const mobileTrayId = "compare-mobile-action-tray";

  return (
    <AnimatePresence>
      {selectedSlugs.length > 0 && (
        <motion.aside
          className="compare-dock"
          data-open={isTrayOpen}
          role="region"
          aria-label={c.compareTitle}
          initial={reduced ? { x: "-50%" } : { x: "-50%", y: 90, opacity: 0 }}
          animate={{ x: "-50%", y: 0, opacity: 1 }}
          exit={reduced ? { x: "-50%" } : { x: "-50%", y: 90, opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="compare-dock-inner" id={mobileTrayId}>
            <div className="compare-dock-info">
              <span className="compare-dock-badge">
                <Scales size={15} weight="fill" aria-hidden="true" />
                {c.selectedCount(selectedSlugs.length, allProjects.length)}
              </span>
              <p className="compare-dock-prompt">{c.dockPrompt}</p>
            </div>

            <div className="compare-dock-chips" role="group" aria-label={c.compareTitle}>
              {selectedProjects.map((p) => (
                <div key={p.slug} className="compare-dock-chip">
                  <span className="compare-dock-chip-thumb">
                    <Image
                      src={p.hero}
                      alt=""
                      width={28}
                      height={28}
                      className="compare-dock-thumb-img"
                    />
                  </span>
                  <span className="compare-dock-chip-name">{p.name}</span>
                  <button
                    type="button"
                    className="compare-dock-chip-remove"
                    aria-label={c.removeFromCompare(p.name)}
                    onClick={() => onToggleSlug(p.slug)}
                  >
                    <X size={13} weight="bold" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <div className="compare-dock-actions">
              {selectedSlugs.length < allProjects.length && (
                <button
                  type="button"
                  className="compare-dock-btn-secondary"
                  onClick={onSelectAll}
                >
                  {c.compareAll}
                </button>
              )}

              <button
                type="button"
                className="compare-dock-btn-primary"
                onClick={onOpenModal}
              >
                <Scales size={17} weight="bold" aria-hidden="true" />
                <span>{c.compareSelected(selectedSlugs.length)}</span>
              </button>

              <button
                type="button"
                className="compare-dock-btn-clear"
                onClick={onClearAll}
                aria-label={c.clearComparison}
                title={c.clearComparison}
              >
                <X size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>
          </div>
          <button
            type="button"
            className="compare-dock-mobile-toggle"
            aria-expanded={isTrayOpen}
            aria-controls={mobileTrayId}
            aria-label={isTrayOpen ? c.compareTrayClose : c.compareTrayLabel}
            onClick={() => setIsTrayOpen((open) => !open)}
          >
            <span className="compare-mobile-toggle-icon">
              <Scales size={18} weight="bold" aria-hidden="true" />
            </span>
            <span className="compare-mobile-toggle-copy">
              <strong>{c.compareSelected(selectedSlugs.length)}</strong>
              <small>{c.compareTrayHint}</small>
            </span>
            <CaretUp size={18} weight="bold" aria-hidden="true" />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function ProjectComparisonModal({
  selectedSlugs,
  isOpen,
  onOpenChange,
  onToggleSlug,
  onSelectAll,
  onClearAll,
}: ComparisonProps) {
  const { locale } = useExperience();
  const c = catalogCopy[locale];
  const [onlyDiffs, setOnlyDiffs] = useState(false);

  const allProjects = useMemo(() => getPublishedProjects(), []);
  const activeProjects = useMemo(
    () => allProjects.filter((p) => selectedSlugs.includes(p.slug)),
    [allProjects, selectedSlugs],
  );

  const whatsappPhone =
    process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "") || advisor.whatsapp;
  const whatsappNames = activeProjects.map((p) => p.name).join(", ");
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    c.whatsappCompare(whatsappNames),
  )}`;

  const visibleRows = useMemo(() => {
    if (!onlyDiffs || activeProjects.length < 2) return SPEC_ROWS;
    return SPEC_ROWS.filter((row) => new Set(activeProjects.map((project) => row.getValue(project, locale).text)).size > 1);
  }, [onlyDiffs, activeProjects, locale]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="compare-overlay" />
        <Dialog.Content
          className="compare-modal"
          aria-describedby="compare-description"
        >
          {/* Header */}
          <header className="compare-head">
            <div className="compare-head-text">
              <Dialog.Title className="compare-title">
                {c.compareTitle}
              </Dialog.Title>
              <Dialog.Description
                id="compare-description"
                className="compare-description"
              >
                {c.compareSubtitle}
              </Dialog.Description>
            </div>

            <div className="compare-head-controls">
              <button
                type="button"
                className={`compare-filter-toggle ${onlyDiffs ? "is-active" : ""}`}
                aria-pressed={onlyDiffs}
                onClick={() => setOnlyDiffs(!onlyDiffs)}
              >
                {onlyDiffs ? <EyeSlash size={17} weight="bold" /> : <Eye size={17} weight="bold" />}
                <span>{c.onlyDifferences}</span>
                <span className="compare-diff-count">
                  {visibleRows.length} / {SPEC_ROWS.length}
                </span>
              </button>

              {activeProjects.length < allProjects.length && (
                <button
                  type="button"
                  className="compare-btn-add-all"
                  onClick={onSelectAll}
                >
                  {c.compareAll}
                </button>
              )}

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="compare-close-btn"
                  aria-label={c.closeComparison}
                >
                  <X size={20} weight="bold" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>
          </header>

          {/* Body Matrix */}
          <div className="compare-scroll-area" data-lenis-prevent tabIndex={0} role="region" aria-label={c.compareSubtitle}>
            <div className="compare-matrix" role="table" aria-label={c.compareTitle} style={{ "--project-count": activeProjects.length } as React.CSSProperties}>
              {/* Top Row: Project Headers */}
              <div className="compare-row compare-header-row" role="row">
                <div className="compare-cell compare-corner-cell" role="columnheader">
                  <span className="compare-corner-label">{c.filtersLabel}</span>
                  <p className="compare-corner-hint">{c.dockPrompt}</p>
                </div>

                {activeProjects.map((project) => (
                  <div key={project.slug} className="compare-cell compare-card-cell" role="columnheader">
                    <div className="compare-card">
                      <div className="compare-card-image-wrap">
                        <Image
                          src={project.hero}
                          alt={project.name}
                          fill
                          sizes="(max-width: 760px) 260px, 320px"
                          className="compare-card-img"
                        />
                        <button
                          type="button"
                          className="compare-card-remove"
                          onClick={() => {
                            if (activeProjects.length > 1) {
                              onToggleSlug(project.slug);
                            } else {
                              onClearAll();
                              onOpenChange(false);
                            }
                          }}
                          aria-label={c.removeFromCompare(project.name)}
                          title={c.removeFromCompare(project.name)}
                        >
                          <X size={14} weight="bold" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="compare-card-body">
                        <span className="compare-card-zone">
                          <MapPin size={13} aria-hidden="true" />
                          {project.location}
                        </span>
                        <h3 className="compare-card-title">{project.name}</h3>

                        <div className="compare-card-actions">
                          <Link
                            href={`/proyectos/${project.slug}?lang=${locale}`}
                            className="compare-card-link"
                            prefetch={false}
                          >
                            <span>{c.open}</span>
                            <ArrowUpRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              {visibleRows.map((row) => {
                const Icon = row.icon;
                const categoryKey = row.category as keyof typeof c;
                const categoryLabel = typeof c[categoryKey] === "string" ? (c[categoryKey] as string) : "";

                return (
                  <div key={row.id} className="compare-row compare-data-row" role="row">
                    <div className="compare-cell compare-label-cell" role="rowheader">
                      <div className="compare-label-content">
                        <span className="compare-label-icon">
                          <Icon size={16} aria-hidden="true" />
                        </span>
                        <div>
                          <span className="compare-row-category">{categoryLabel}</span>
                          <span className="compare-row-title">{row.label[locale]}</span>
                        </div>
                      </div>
                    </div>

                    {activeProjects.map((project) => {
                      const value = row.getValue(project, locale);
                      return (
                        <div
                          key={project.slug}
                          role="cell"
                          className={`compare-cell compare-val-cell ${value.isHighlight ? "is-highlight" : ""} ${value.isPending ? "is-pending" : ""}`}
                        >
                          {value.badge && (
                            <span className={`compare-val-badge ${value.isPending ? "badge-pending" : "badge-confirmed"}`}>
                              {value.badge}
                            </span>
                          )}
                          <p className="compare-val-text">{value.text}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="compare-mobile-list" aria-label={c.compareTitle}>
              <div className="compare-mobile-projects">
                {activeProjects.map((project) => (
                  <article key={project.slug} className="compare-mobile-project">
                    <div className="compare-mobile-project-image">
                      <Image
                        src={project.hero}
                        alt=""
                        fill
                        sizes="96px"
                        className="compare-card-img"
                      />
                    </div>
                    <div>
                      <span>{project.location}</span>
                      <h3>{project.name}</h3>
                    </div>
                    <button
                      type="button"
                      className="compare-card-remove"
                      onClick={() => {
                        if (activeProjects.length > 1) {
                          onToggleSlug(project.slug);
                        } else {
                          onClearAll();
                          onOpenChange(false);
                        }
                      }}
                      aria-label={c.removeFromCompare(project.name)}
                      title={c.removeFromCompare(project.name)}
                    >
                      <X size={14} weight="bold" aria-hidden="true" />
                    </button>
                  </article>
                ))}
              </div>

              {visibleRows.map((row) => {
                const Icon = row.icon;
                const categoryKey = row.category as keyof typeof c;
                const categoryLabel = typeof c[categoryKey] === "string" ? (c[categoryKey] as string) : "";

                return (
                  <section key={row.id} className="compare-mobile-row">
                    <div className="compare-mobile-row-head">
                      <Icon size={16} aria-hidden="true" />
                      <div>
                        <span>{categoryLabel}</span>
                        <h4>{row.label[locale]}</h4>
                      </div>
                    </div>

                    <div className="compare-mobile-values">
                      {activeProjects.map((project) => {
                        const value = row.getValue(project, locale);
                        return (
                          <div
                            key={project.slug}
                            className={`compare-mobile-value ${value.isHighlight ? "is-highlight" : ""} ${value.isPending ? "is-pending" : ""}`}
                          >
                            <strong>{project.name}</strong>
                            {value.badge && (
                              <span className={`compare-val-badge ${value.isPending ? "badge-pending" : "badge-confirmed"}`}>
                                {value.badge}
                              </span>
                            )}
                            <p>{value.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>

          {/* Footer CTA */}
          <footer className="compare-footer">
            <div className="compare-footer-notice">
              <Info size={18} weight="bold" aria-hidden="true" />
              <p>{c.note}</p>
            </div>

            <div className="compare-footer-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="compare-whatsapp-btn"
              >
                <WhatsappLogo size={20} weight="fill" aria-hidden="true" />
                <span>{c.contactAdvisor}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
