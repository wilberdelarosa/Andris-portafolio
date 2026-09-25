"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Heart,
  MapPin,
  MagnifyingGlass,
  Scales,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";
import { journeyCopy } from "@/content/journey-copy";
import { catalogCopy } from "@/content/catalog-copy";
import {
  discoveryCopy,
  discoveryFeatures,
  type DiscoveryFeature,
} from "@/content/project-discovery";
import {
  emptyCatalogFilters,
  matchesCatalog,
  type CatalogFilters,
} from "@/lib/catalog-filtering";
import { resolveAmenity } from "@/lib/amenities";
import { useExperience } from "./experience-provider";
import { useProjects } from "./projects-provider";
import { PropertyCard } from "./property-card";
import { ProjectTourButton } from "./project-media";
import { Modal } from "./ui";
import { EditorialTitle, DecorativeLayer } from "./premium-motion";
import {
  ProjectComparisonDock,
  ProjectComparisonModal,
} from "./project-comparison";

export function ProjectCatalog() {
  const { locale, isSaved, savedSlugs } = useExperience();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const j = journeyCopy[locale],
    c = catalogCopy[locale],
    d = discoveryCopy[locale];
  const reduced = useReducedMotion();
  const [onlySaved, setOnlySaved] = useState(false);
  const [filters, setFilters] = useState<CatalogFilters>(emptyCatalogFilters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [comparisonSlugs, setComparisonSlugs] = useState<string[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const zones = [
    ...new Set(projects.map((p) => p.location.split("·")[0].trim())),
  ];
  const bedrooms = [...new Set(projects.flatMap((p) => p.bedrooms))].sort();
  /** Categorías reales (`property_categories`) presentes en el catálogo, no texto libre. */
  const types = [
    ...new Map(
      projects
        .map((p) => p.propertyCategory)
        .filter((category): category is NonNullable<typeof category> => category !== null)
        .map((category) => [category.key, category]),
    ).values(),
  ];
  /**
   * `value` es siempre el nombre en español: es el idioma contra el que
   * `matchesCatalog` compara `filters.amenity` (ver `catalog-filtering.ts`).
   * `label` respeta el idioma activo para mostrarlo en el combo box.
   */
  const amenities = [
    ...new Map(
      projects
        .flatMap((p) => p.amenities)
        .map((item, index) => ({
          value: resolveAmenity(item, "es", index).name,
          label: resolveAmenity(item, locale, index).name,
        }))
        .filter((item) => item.value)
        .map((item) => [item.value, item]),
    ).values(),
  ];
  const matches = (
    project: (typeof projects)[number],
    current: CatalogFilters,
  ) =>
    (!onlySaved || isSaved(project.slug)) && matchesCatalog(project, current);
  const visible = projects.filter((project) => matches(project, filters));
  const countFor = (patch: Partial<CatalogFilters>) =>
    projects.filter((p) => matches(p, { ...filters, ...patch })).length;
  const activeFiltersCount = Object.entries(filters).reduce(
    (n, [key, value]) =>
      n +
      (key === "features"
        ? filters.features.length
        : value !== null && value !== ""
          ? 1
          : 0),
    0,
  );
  const update = (patch: Partial<CatalogFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));
  const clearFilters = () => {
    setFilters(emptyCatalogFilters);
    setOnlySaved(false);
  };
  const toggleFeature = (feature: DiscoveryFeature) =>
    update({
      features: filters.features.includes(feature)
        ? filters.features.filter((value) => value !== feature)
        : [...filters.features, feature],
    });
  const toggleCompareSlug = (slug: string) =>
    setComparisonSlugs((prev) =>
      prev.includes(slug)
        ? prev.filter((value) => value !== slug)
        : [...prev, slug],
    );
  const selectAllForComparison = () =>
    setComparisonSlugs(projects.map((p) => p.slug));
  const openComparisonWithAll = () => {
    if (!comparisonSlugs.length) selectAllForComparison();
    setIsComparisonOpen(true);
  };
  const priceOptions = [
    { value: "", label: c.anyPrice },
    { value: "under150", label: c.upTo("US$150,000") },
    { value: "under200", label: c.upTo("US$200,000") },
    { value: "confirmed", label: c.confirmedPrice },
    { value: "pending", label: c.pendingPrice },
  ];
  const activeTags = [
    ...(filters.zone
      ? [{ label: filters.zone, clear: () => update({ zone: null }) }]
      : []),
    ...(filters.price
      ? [
          {
            label: priceOptions.find((o) => o.value === filters.price)!.label,
            clear: () => update({ price: null }),
          },
        ]
      : []),
    ...(filters.delivery
      ? [
          {
            label:
              filters.delivery === "ready"
                ? d.ready
                : d.years + ": " + filters.delivery,
            clear: () => update({ delivery: null }),
          },
        ]
      : []),
    ...(filters.bedroom !== null
      ? [
          {
            label: filters.bedroom + " " + c.bedroomsShort,
            clear: () => update({ bedroom: null }),
          },
        ]
      : []),
    ...(filters.productType
      ? [
          {
            label:
              types.find((type) => type.key === filters.productType)?.label[locale] ??
              filters.productType,
            clear: () => update({ productType: null }),
          },
        ]
      : []),
    ...(filters.amenity
      ? [
          {
            label:
              amenities.find((a) => a.value === filters.amenity)?.label ?? filters.amenity,
            clear: () => update({ amenity: null }),
          },
        ]
      : []),
    ...filters.features.map((feature) => ({
      label: discoveryFeatures.find((item) => item.id === feature)!.label[
        locale
      ],
      clear: () => toggleFeature(feature),
    })),
  ];
  const searchLabel =
    locale === "es"
      ? "Buscar por nombre o zona"
      : locale === "fr"
        ? "Rechercher un nom ou un secteur"
        : "Search by name or area";
  /* Un nombre de proyecto a secas como placeholder parecía un valor ya
     escrito; con el prefijo «Ej.» se lee como ejemplo. */
  const searchPlaceholder =
    locale === "es"
      ? "Ej.: Terra Serena"
      : locale === "fr"
        ? "Ex. : Terra Serena"
        : "E.g.: Terra Serena";
  return (
    <div className="catalog">
      <DecorativeLayer variant="plan" />
      <header className="catalog-head">
        {projectsLoading ? (
          <h1 className="catalog-title">
            {locale === "es" ? "Cargando el catálogo…" : locale === "fr" ? "Chargement du catalogue…" : "Loading the catalog…"}
          </h1>
        ) : (
          <EditorialTitle
            as="h1"
            className="catalog-title"
            text={c.title(projects.length).join(" ")}
            accent={c.title(projects.length)[1]}
          />
        )}
        <p className="catalog-intro">{c.intro}</p>
      </header>
      <div className="catalog-view-controls">
        <div
          className="catalog-view-pills"
          role="group"
          aria-label={c.filtersLabel}
        >
          <button
            type="button"
            className={"catalog-view-btn " + (!onlySaved ? "is-active" : "")}
            aria-pressed={!onlySaved}
            onClick={() => setOnlySaved(false)}
          >
            {j.viewAll}
            <span className="catalog-view-badge">{projects.length}</span>
          </button>
          <button
            type="button"
            className={"catalog-view-btn " + (onlySaved ? "is-active" : "")}
            aria-pressed={onlySaved}
            onClick={() => setOnlySaved(true)}
          >
            <Heart size={16} weight={onlySaved ? "fill" : "regular"} />
            {j.saved}
            <span className="catalog-view-badge">{savedSlugs.length}</span>
          </button>
        </div>
        <div className="catalog-action-group">
          <button
            type="button"
            className="catalog-compare-trigger"
            onClick={openComparisonWithAll}
            aria-label={c.compareTitle}
          >
            <Scales size={18} />
            {comparisonSlugs.length
              ? c.compareSelected(comparisonSlugs.length)
              : c.compareAll(projects.length)}
          </button>
          <Link
            className="catalog-map-link text-link"
            href={"/mapa?lang=" + locale}
            prefetch={false}
          >
            <MapPin size={17} />
            {j.map}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <section className="catalog-filters" aria-label={c.filtersLabel}>
        <div className="catalog-search-row">
          <label className="catalog-search-field">
            <span>{searchLabel}</span>
            <div>
              <MagnifyingGlass size={19} aria-hidden="true" />
              <input
                type="search"
                value={filters.query}
                maxLength={100}
                onChange={(e) => update({ query: e.target.value })}
                placeholder={searchPlaceholder}
              />
            </div>
          </label>
          <label className="catalog-budget-field">
            <span>{locale === "es" ? "Presupuesto" : "Budget"} (USD)</span>
            <select
              value={filters.price ?? ""}
              onChange={(e) =>
                update({
                  price: (e.target.value || null) as CatalogFilters["price"],
                })
              }
            >
              {priceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="button button-outline catalog-filter-launch"
            onClick={() => setIsAdvancedOpen(true)}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal size={18} />
            {c.filterAdvanced}
            {activeFiltersCount > 0 && (
              <span className="catalog-filter-number">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
        <div
          className="catalog-segmented-chips catalog-zones"
          role="group"
          aria-label={c.zone}
        >
          <button
            type="button"
            className={
              "catalog-segment-chip " +
              (filters.zone === null ? "is-active" : "")
            }
            aria-pressed={filters.zone === null}
            onClick={() => update({ zone: null })}
          >
            {c.all}
            <span className="catalog-chip-num">{countFor({ zone: null })}</span>
          </button>
          {zones.map((zone) => (
            <button
              key={zone}
              type="button"
              className={
                "catalog-segment-chip " +
                (filters.zone === zone ? "is-active" : "")
              }
              aria-pressed={filters.zone === zone}
              onClick={() =>
                update({ zone: filters.zone === zone ? null : zone })
              }
            >
              {zone}
              <span className="catalog-chip-num">{countFor({ zone })}</span>
            </button>
          ))}
        </div>
        <div className="catalog-status-bar">
          <div
            className="catalog-active-tags"
            role="region"
            aria-label={c.activeFiltersLabel}
          >
            <span
              aria-live="polite"
              aria-atomic="true"
              className="catalog-count-badge"
            >
              {c.results(visible.length)}
            </span>
            {activeTags.map((tag) => (
              <button
                type="button"
                key={tag.label}
                className="catalog-active-pill"
                onClick={tag.clear}
                aria-label={c.clear + ": " + tag.label}
              >
                {tag.label}
                <X size={14} />
              </button>
            ))}
            {(activeFiltersCount > 0 || onlySaved) && (
              <button
                type="button"
                className="catalog-clear-action"
                onClick={clearFilters}
              >
                {c.clearAll}
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </section>
      <Modal
        open={isAdvancedOpen}
        onOpenChange={setIsAdvancedOpen}
        title={c.filtersLabel}
        className="catalog-filter-modal"
      >
        <div className="catalog-filter-body" data-lenis-prevent>
          <fieldset className="catalog-filter-group">
            <legend>{d.years}</legend>
            <div className="catalog-pills-row">
              {[null, "2026", "2027", "2028", "2029", "2030", "ready"].map(
                (year) => (
                  <button
                    type="button"
                    key={year ?? "all"}
                    className={
                      "catalog-pill-btn " +
                      (filters.delivery === year ? "is-active" : "")
                    }
                    aria-pressed={filters.delivery === year}
                    onClick={() =>
                      update({
                        delivery: filters.delivery === year ? null : year,
                      })
                    }
                  >
                    {year === "ready" ? d.ready : (year ?? c.all)}
                    <span className="catalog-pill-sub">
                      {countFor({ delivery: year })}
                    </span>
                  </button>
                ),
              )}
            </div>
          </fieldset>
          <fieldset className="catalog-filter-group">
            <legend>{d.features}</legend>
            <div className="catalog-feature-grid">
              {discoveryFeatures.map((feature) => {
                const active = filters.features.includes(feature.id);
                return (
                  <button
                    type="button"
                    key={feature.id}
                    className="catalog-feature-option"
                    aria-pressed={active}
                    onClick={() => toggleFeature(feature.id)}
                  >
                    <span className="catalog-feature-check">
                      {active && <Check size={15} weight="bold" />}
                    </span>
                    <span>{feature.label[locale]}</span>
                    <small>
                      {countFor({
                        features: active
                          ? filters.features
                          : [...filters.features, feature.id],
                      })}
                    </small>
                  </button>
                );
              })}
            </div>
            <p className="field-hint">{d.note}</p>
          </fieldset>
          <fieldset className="catalog-filter-group">
            <legend>{c.bedrooms}</legend>
            <div className="catalog-pills-row">
              {[null, ...bedrooms].map((bedroom) => (
                <button
                  type="button"
                  key={bedroom ?? "all"}
                  className={
                    "catalog-pill-btn " +
                    (filters.bedroom === bedroom ? "is-active" : "")
                  }
                  aria-pressed={filters.bedroom === bedroom}
                  onClick={() =>
                    update({
                      bedroom: filters.bedroom === bedroom ? null : bedroom,
                    })
                  }
                >
                  {bedroom === null ? c.all : bedroom + " " + c.bedroomsShort}
                  <span className="catalog-pill-sub">
                    {countFor({ bedroom })}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="catalog-extra-selects">
            <label>
              {c.productType}
              <select
                value={filters.productType ?? ""}
                onChange={(e) =>
                  update({ productType: e.target.value || null })
                }
              >
                <option value="">{c.all}</option>
                {types.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label[locale]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {c.amenities}
              <select
                value={filters.amenity ?? ""}
                onChange={(e) => update({ amenity: e.target.value || null })}
              >
                <option value="">{c.all}</option>
                {amenities.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="catalog-filter-footer">
          <button type="button" className="text-link" onClick={clearFilters}>
            {c.clearAll}
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => setIsAdvancedOpen(false)}
          >
            <span aria-live="polite">
              {(locale === "es"
                ? "Ver "
                : locale === "fr"
                  ? "Voir "
                  : "Show ") + c.results(visible.length)}
            </span>
            <ArrowRight size={18} />
          </button>
        </div>
      </Modal>
      {projectsLoading ? (
        <div className="catalog-empty" role="status" aria-live="polite">
          <p>
            {locale === "es"
              ? "Cargando el catálogo de proyectos…"
              : locale === "fr"
                ? "Chargement du catalogue de projets…"
                : "Loading the project catalog…"}
          </p>
        </div>
      ) : projectsError ? (
        <div className="catalog-empty" role="alert">
          <p>
            {locale === "es"
              ? "No se pudo cargar el catálogo de proyectos."
              : locale === "fr"
                ? "Impossible de charger le catalogue de projets."
                : "The project catalog could not be loaded."}
          </p>
          <p className="field-hint">{projectsError}</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="catalog-empty">
          <p>{onlySaved && !savedSlugs.length ? j.noSaved : c.empty}</p>
          <p className="field-hint">{d.note}</p>
          <button
            type="button"
            className="button button-primary"
            onClick={clearFilters}
          >
            {c.emptyAction}
            <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <motion.ul className="catalog-grid" layout={!reduced}>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project) => (
              <motion.li
                key={project.slug}
                className="catalog-card"
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.2 }}
              >
                <PropertyCard
                  project={project}
                  displayIndex={projects.findIndex((item) => item.slug === project.slug)}
                  isComparing={comparisonSlugs.includes(project.slug)}
                  onToggleCompare={() => toggleCompareSlug(project.slug)}
                />
                <ProjectTourButton project={project} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
      <p className="catalog-note">{c.note}</p>
      <ProjectComparisonDock
        selectedSlugs={comparisonSlugs}
        onOpenModal={() => setIsComparisonOpen(true)}
        onToggleSlug={toggleCompareSlug}
        onSelectAll={selectAllForComparison}
        onClearAll={() => setComparisonSlugs([])}
      />
      <ProjectComparisonModal
        selectedSlugs={comparisonSlugs}
        isOpen={isComparisonOpen}
        onOpenChange={setIsComparisonOpen}
        onToggleSlug={toggleCompareSlug}
        onSelectAll={selectAllForComparison}
        onClearAll={() => setComparisonSlugs([])}
      />
    </div>
  );
}
