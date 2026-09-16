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
import {
  getProjectInformation,
  projectInformationFields,
  type ProjectInformationFieldId,
  type ProjectInformationStatus,
} from "@/content/project-information";
import { useExperience } from "./experience-provider";
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

const infoIcons: Record<ProjectInformationFieldId, SpecRow["icon"]> = {
  price: CurrencyDollar,
  reservation: CurrencyDollar,
  paymentPlan: CurrencyDollar,
  roi: CurrencyDollar,
  appreciation: CurrencyDollar,
  propertyType: HouseLine,
  bedrooms: HouseLine,
  bathrooms: HouseLine,
  area: HouseLine,
  parking: HouseLine,
  furnished: HouseLine,
  location: MapPin,
  beachDistance: MapPin,
  airportDistance: MapPin,
  delivery: ShieldCheck,
  projectState: ShieldCheck,
  vacationRental: HouseLine,
  rentalManagement: HouseLine,
  energyEfficiency: Tree,
  maintenanceFee: CurrencyDollar,
  developer: Info,
  financing: CurrencyDollar,
  idealFor: Sparkle,
  smartHome: Sparkle,
  tennis: CheckCircle,
  golf: CheckCircle,
  nearBeach: CheckCircle,
  beachfront: CheckCircle,
  artificialBeach: CheckCircle,
  padel: CheckCircle,
};

const pendingText = (locale: "es" | "en" | "fr", state: ProjectInformationStatus) => {
  if (state === "not-applicable") {
    return locale === "es" ? "No aplica" : locale === "fr" ? "Non applicable" : "Not applicable";
  }
  return locale === "es" ? "Por confirmar" : locale === "fr" ? "À confirmer" : "To confirm";
};

const SPEC_ROWS: SpecRow[] = projectInformationFields.map((field) => ({
  ...field,
  icon: infoIcons[field.id],
  getValue: (project, locale) => {
    const information = getProjectInformation(project.slug, field.id);
    const isPending = information.status === "pending" || information.status === "varies";
    return {
      text: information.value?.[locale] ?? pendingText(locale, information.status),
      isPending,
      isHighlight: information.status === "documented" && ["price", "delivery", "artificialBeach"].includes(field.id),
      badge: information.status === "documented"
        ? catalogCopy[locale].verifiedStatus
        : information.status === "varies"
          ? (locale === "es" ? "Según fase o unidad" : locale === "fr" ? "Selon la phase ou l’unité" : "By phase or unit")
          : undefined,
    };
  },
  isDifferent: (projects) => new Set(projects.map((project) => {
    const information = getProjectInformation(project.slug, field.id);
    return `${information.status}:${information.value?.es ?? ""}`;
  })).size > 1,
}));

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
    return SPEC_ROWS.filter((row) => row.isDifferent(activeProjects));
  }, [onlyDiffs, activeProjects]);

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
