"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { journeyCopy } from "@/content/journey-copy";
import { ArrowRight, MapPin, Heart, SlidersHorizontal, X } from "@phosphor-icons/react";
import { useExperience } from "./experience-provider";
import { catalogCopy } from "@/content/catalog-copy";
import { getPublishedProjects, type PropertyProject } from "@/content/projects";
import { Rise } from "./motion-text";
import { PropertyCard } from "./property-card";
import { EditorialTitle, DecorativeLayer } from "./premium-motion";

/** La zona es la primera parte de `location`: "Vista Cana · Punta Cana". */
const zoneOf = (project: PropertyProject) => project.location.split("·")[0]?.trim() ?? project.location;

type Filters = { zone: string | null; bedroom: number | null; amenity: string | null };
const emptyFilters: Filters = { zone: null, bedroom: null, amenity: null };

export function ProjectCatalog() {
  const { locale, isSaved, savedSlugs } = useExperience();
  const j = journeyCopy[locale];
  const [onlySaved, setOnlySaved] = useState(false);
  const c = catalogCopy[locale];
  const reduced = useReducedMotion();
  const projects = useMemo(() => getPublishedProjects(), []);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  // Las opciones salen de los propios proyectos: si un dato no existe, no
  // aparece como filtro. Evita ofrecer una busqueda que no lleva a ninguna parte.
  const zones = useMemo(
    () => [...new Set(projects.map(zoneOf))],
    [projects],
  );
  const bedrooms = useMemo(
    () => [...new Set(projects.flatMap((p) => p.bedrooms))].sort((a, b) => a - b),
    [projects],
  );
  const amenities = useMemo(
    () => [...new Set(projects.flatMap((p) => p.amenities.map((a) => a.es)))].sort(),
    [projects],
  );

  const matches = (project: PropertyProject, f: Filters) =>
    (!onlySaved || isSaved(project.slug)) &&
    (f.zone === null || zoneOf(project) === f.zone) &&
    (f.bedroom === null || project.bedrooms.includes(f.bedroom)) &&
    (f.amenity === null || project.amenities.some((a) => a.es === f.amenity));

  const visible = projects.filter((project) => matches(project, filters));
  const active = filters.zone !== null || filters.bedroom !== null || filters.amenity !== null;

  /** Cuantos proyectos quedarian si se aplicara solo este cambio. */
  const countFor = (patch: Partial<Filters>) =>
    projects.filter((project) => matches(project, { ...filters, ...patch })).length;

  return (
    <div className="catalog">
      <DecorativeLayer variant="plan"/>
      <header className="catalog-head">
        
        <EditorialTitle as="h1" className="catalog-title" text={c.title.join(" ")} accent={c.title[1]}/>
        <Rise as="p" className="catalog-intro" delay={0.35}>
          {c.intro}
        </Rise>
      </header>

      <div className="catalog-view-controls">
        <div className="catalog-saved-toggle" role="group" aria-label={c.filtersLabel}>
          <button type="button" aria-pressed={!onlySaved} onClick={() => setOnlySaved(false)}>{j.viewAll}</button>
          <button type="button" aria-pressed={onlySaved} onClick={() => setOnlySaved(true)}><Heart size={17}/>{j.saved}<span>{projects.filter((p) => savedSlugs.includes(p.slug)).length}</span></button>
        </div>
        <Link className="text-link" href={`/mapa?lang=${locale}`}><MapPin size={18}/>{j.map}<ArrowRight size={18}/></Link>
      </div>
      <Rise className="catalog-filters" delay={0.15}>
        <div className="catalog-filter-rows" role="group" aria-label={c.filtersLabel}>
          <FilterRow
            label={c.zone}
            allLabel={c.all}
            allCount={countFor({ zone: null })}
            options={zones.map((zone) => ({
              key: zone,
              label: zone,
              count: countFor({ zone }),
              selected: filters.zone === zone,
            }))}
            selectedNone={filters.zone === null}
            onAll={() => setFilters((f) => ({ ...f, zone: null }))}
            onPick={(key) => setFilters((f) => ({ ...f, zone: f.zone === key ? null : key }))}
          />

          <details className="catalog-advanced"><summary><SlidersHorizontal size={17}/>{j.filter}</summary>
          {bedrooms.length > 0 ? (
            <FilterRow
              label={c.bedrooms}
              allLabel={c.all}
              allCount={countFor({ bedroom: null })}
              options={bedrooms.map((bedroom) => ({
                key: String(bedroom),
                label: String(bedroom),
                count: countFor({ bedroom }),
                selected: filters.bedroom === bedroom,
              }))}
              selectedNone={filters.bedroom === null}
              onAll={() => setFilters((f) => ({ ...f, bedroom: null }))}
              onPick={(key) =>
                setFilters((f) => ({ ...f, bedroom: f.bedroom === Number(key) ? null : Number(key) }))
              }
            />
          ) : null}

          <FilterRow
            label={c.amenities}
            allLabel={c.all}
            allCount={countFor({ amenity: null })}
            options={amenities.map((amenity) => ({
              key: amenity,
              label: projects.flatMap((p) => p.amenities).find((a) => a.es === amenity)?.[locale] ?? amenity,
              count: countFor({ amenity }),
              selected: filters.amenity === amenity,
            }))}
            selectedNone={filters.amenity === null}
            onAll={() => setFilters((f) => ({ ...f, amenity: null }))}
            onPick={(key) => setFilters((f) => ({ ...f, amenity: f.amenity === key ? null : key }))}
          />
          </details>
        </div>

        <div className="catalog-status">
          <p aria-live="polite" className="catalog-count">
            {c.results(visible.length)}
          </p>
          {active ? (
            <button type="button" className="catalog-clear" onClick={() => { setFilters(emptyFilters); setOnlySaved(false); }}>
              <X size={13} weight="bold" aria-hidden="true" />
              {c.clear}
            </button>
          ) : null}
        </div>
      </Rise>

      {visible.length === 0 ? (
        <div className="catalog-empty">
          <p>{onlySaved && !savedSlugs.length ? j.noSaved : c.empty}</p>
          <button type="button" className="button button-primary" onClick={() => { setFilters(emptyFilters); setOnlySaved(false); }}>
            {c.emptyAction}
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <motion.ul className="catalog-grid" layout={!reduced}>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project, index) => (
              <motion.li
                key={project.slug}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: 38, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.97 }}
                transition={{
                  duration: 0.25,
                  delay: reduced ? 0 : index * 0.035,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="catalog-card"
              >
                <PropertyCard project={project} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <p className="catalog-note">{c.note}</p>
    </div>
  );
}

function FilterRow({
  label,
  allLabel,
  allCount,
  options,
  selectedNone,
  onAll,
  onPick,
}: {
  label: string;
  allLabel: string;
  allCount: number;
  options: { key: string; label: string; count: number; selected: boolean }[];
  selectedNone: boolean;
  onAll: () => void;
  onPick: (key: string) => void;
}) {
  return (
    <div className="catalog-filter-row">
      <span className="catalog-filter-label">{label}</span>
      {/* Scroll horizontal en movil: la fila no se parte en varias lineas. */}
      <div className="catalog-chips" role="group" aria-label={label}>
        <button
          type="button"
          className={`catalog-chip ${selectedNone ? "is-active" : ""}`}
          aria-pressed={selectedNone}
          onClick={onAll}
        >
          {allLabel}
          <span className="catalog-chip-count">{allCount}</span>
        </button>
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`catalog-chip ${option.selected ? "is-active" : ""}`}
            aria-pressed={option.selected}
            // Un filtro que dejaria la rejilla vacia se marca, no se oculta:
            // esconderlo haria que las opciones bailaran en cada clic.
            data-empty={option.count === 0 ? "true" : undefined}
            onClick={() => onPick(option.key)}
          >
            {option.label}
            <span className="catalog-chip-count">{option.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
