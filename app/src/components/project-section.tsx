"use client";
import { AmenitiesCarousel } from "./amenities-carousel";
import { resolveAmenity } from "@/lib/amenities";
import Link from "next/link";
import { ProjectTourButton } from "./project-media";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import {
  Heart,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  SquaresFour,
  MapPin,
  Bed,
  CornersOut,
  Tree,
  HouseLine,
  ShareNetwork,
} from "@phosphor-icons/react";
import { journeyCopy } from "@/content/journey-copy";
import { motion, useReducedMotion } from "motion/react";
import "./project-showcase.css";
import {
  EditorialTitle,
  DecorativeLayer,
  DepthPanel,
  Stagger,
  StaggerItem,
  Magnetic,
  CharacterKicker,
  ArchitecturalCrosshair,
  TechnicalRuler,
  MetricTicker,
} from "./premium-motion";
import { editorialAccents } from "@/content/editorial-accents";
import { type PropertyProject } from "@/content/projects";
import { useExperience } from "./experience-provider";
import { formatBedroomOptions } from "@/lib/project-bedrooms";
import { useProjects } from "./projects-provider";
import { Photo, Modal } from "./ui";
import { PropertyCard } from "./property-card";
import { formatProjectRange } from "@/content/project-information";
import { ActionToast } from "./action-toast";
import { shareOrCopy } from "@/lib/share";
import { getPublicProjectName } from "@/lib/public-project-label";

export function ProjectFacts({ project }: { project: PropertyProject }) {
  const { t, locale } = useExperience();
  if (!project.bedrooms.length && !project.bathrooms.length && !project.area.max && !project.greenArea)
    return null;
  return (
    <div className="project-facts-wrapper" style={{ position: "relative" }}>
      <ArchitecturalCrosshair position="top-right" />
      <div className="project-facts">
        {project.bedrooms.length > 0 && <div><Bed size={20} /><span><strong>{formatBedroomOptions(project.bedrooms, locale)}</strong><small>{t.bedrooms}</small></span></div>}
        {project.bathrooms.length > 0 && <div><HouseLine size={20} /><span><strong>{formatProjectRange(project.bathrooms)}</strong><small>{locale === "fr" ? "Salles de bain" : locale === "en" ? "Bathrooms" : "Baños"}</small></span></div>}
        {project.area.max > 0 && <div><CornersOut size={20} /><span><strong>{project.area.min}–{project.area.max} {project.area.unit}</strong><small>{t.area}</small></span></div>}
        {project.greenArea > 0 && (
          <div>
            <Tree size={20} />
            <span>
              <strong><MetricTicker value={project.greenArea} suffix="+ m²" /></strong>
              <small>{t.green}</small>
            </span>
          </div>
        )}
      </div>
      <TechnicalRuler ticks={7} />
    </div>
  );
}
export function Gallery({
  open,
  onOpenChange,
  start = 0,
  project,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  start?: number;
  project: PropertyProject;
}) {
  const { t, locale, hideProjectNames } = useExperience();
  const [index, setIndex] = useState(start);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const photos = project.gallery;
  const projectIndex = useProjects().projects.findIndex((item) => item.slug === project.slug);
  const displayName = getPublicProjectName(project, projectIndex, hideProjectNames, locale);
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={displayName}
      description={t.renders}
      className="gallery-modal"
    >
      <div
        className="gallery-stage"
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          if (!touchStart.current) return;
          const touch = event.changedTouches[0];
          const dx = touch.clientX - touchStart.current.x;
          const dy = touch.clientY - touchStart.current.y;
          if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy))
            setIndex(
              (index + (dx < 0 ? 1 : -1) + photos.length) % photos.length,
            );
          touchStart.current = null;
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") setIndex((index + 1) % photos.length);
          if (event.key === "ArrowLeft")
            setIndex((index - 1 + photos.length) % photos.length);
        }}
        tabIndex={0}
      >
        <Photo
          key={photos[index].src}
          retryable
          src={photos[index].src}
          alt={photos[index].alt[locale]}
        />
        <button
          className="gallery-arrow prev"
          onClick={() => setIndex((index - 1 + photos.length) % photos.length)}
          aria-label={t.previous}
        >
          <ArrowLeft size={23} />
        </button>
        <button
          className="gallery-arrow next"
          onClick={() => setIndex((index + 1) % photos.length)}
          aria-label={t.next}
        >
          <ArrowRight size={23} />
        </button>
        <span className="gallery-counter" aria-live="polite">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(photos.length).padStart(2, "0")}
        </span>
      </div>
      <div className="gallery-thumbnails">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            aria-label={photo.alt[locale]}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            <Photo src={photo.src} alt="" sizes="120px" />
          </button>
        ))}
      </div>
    </Modal>
  );
}
export function SaveButton({ project }: { project: PropertyProject }) {
  const { isSaved, toggleSlug, t, locale, hideProjectNames } = useExperience();
  const { projects } = useProjects();
  const saved = isSaved(project.slug);
  const displayName = getPublicProjectName(project, projects.findIndex((item) => item.slug === project.slug), hideProjectNames, locale);
  return (
    <button
      className={`icon-button save-button ${saved ? "is-saved" : ""}`}
      onClick={() => toggleSlug(project.slug)}
      aria-label={`${saved ? t.removeSaved : t.save}: ${displayName}`}
      aria-pressed={saved}
    >
      <Heart size={22} weight={saved ? "fill" : "regular"} />
    </button>
  );
}
export function ProjectSection() {
  const { locale, t, hideProjectNames } = useExperience();
  const j = journeyCopy[locale];
  const { projects, loading, error } = useProjects();
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  const project = projects[selected];
  return (
    <section id="proyectos" className="section project-showcase" aria-labelledby="showcase-title">
      <DecorativeLayer/>
      <div className="showcase-heading">
        <div>
          <CharacterKicker text={`01 / ${j.projects}`} delay={0.06} />
          <EditorialTitle id="showcase-title" text={j.projects} accent={editorialAccents[locale].projects}/>
          <p>{j.projectsIntro}</p>
        </div>
        <Link className="text-link" href={`/proyectos?lang=${locale}`} prefetch={false}>{j.all}<ArrowUpRight size={20} /></Link>
      </div>
      {loading ? (
        <p className="field-hint" role="status">
          {locale === "es" ? "Cargando proyectos…" : locale === "fr" ? "Chargement des projets…" : "Loading projects…"}
        </p>
      ) : error ? (
        <p className="field-hint" role="alert">
          {locale === "es"
            ? "No se pudieron cargar los proyectos."
            : locale === "fr"
              ? "Impossible de charger les projets."
              : "Projects could not be loaded."}
        </p>
      ) : !project ? null : (
      <>
      <div className="showcase-layout">
        <DepthPanel className="showcase-stage">
          <ArchitecturalCrosshair position="top-right" />
            <motion.div
              key={project.slug}
              initial={reduced ? false : { opacity: 0.94, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              <PropertyCard project={project} displayIndex={selected} featured />
            </motion.div>
        </DepthPanel>
        <div className="showcase-picker">
          <div className="showcase-picker-head">
            <span>{j.select}</span>
            <span aria-live="polite">{String(selected + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
          </div>
          <Stagger className="showcase-options" role="group" aria-label={j.select} gap={0.07} delay={0.08}>
            {projects.map((item, i) => (
              <StaggerItem key={item.slug} distance={14}>
                <motion.button
                  type="button"
                  aria-pressed={i === selected}
                  onClick={() => setSelected(i)}
                  className="showcase-option"
                  whileHover={reduced ? undefined : { scale: 1.02, x: 4 }}
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Photo src={item.hero} alt="" sizes="110px" />
                  <span><small>{item.location.split("·")[0].trim()}</small><strong>{getPublicProjectName(item, i, hideProjectNames, locale)}</strong></span>
                  <ArrowUpRight size={19} aria-hidden="true" />
                </motion.button>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="showcase-navigation">
            <Magnetic strength={0.22}>
              <button className="icon-button" type="button" aria-label={j.previous} onClick={() => setSelected((selected - 1 + projects.length) % projects.length)}>
                <ArrowLeft size={21}/>
              </button>
            </Magnetic>
            <div className="showcase-progress" aria-hidden="true">
              {projects.map((p, i) => <span key={p.slug} className={i === selected ? "is-active" : ""}/>)}
            </div>
            <Magnetic strength={0.22}>
              <button className="icon-button" type="button" aria-label={j.next} onClick={() => setSelected((selected + 1) % projects.length)}>
                <ArrowRight size={21}/>
              </button>
            </Magnetic>
          </div>
          <Magnetic strength={0.16}>
            <Link className="showcase-map-link" href={`/mapa?lang=${locale}`} prefetch={false}>
              <MapPin size={22}/>
              <span>{j.map}</span>
              <ArrowUpRight size={20}/>
            </Link>
          </Magnetic>
        </div>
      </div>
      <p className="render-caption">{t.renders}</p>
      </>
      )}
    </section>
  );
}
export function ProjectDetail({ project: initialProject }: { project?: PropertyProject }) {
  const { t, locale, hideProjectNames } = useExperience();
  const params = useParams<{ slug?: string }>();
  const { projects } = useProjects();
  // El HTML inicial sirve de fallback para el export estático; cuando Supabase
  // tiene una versión nueva, la carga de cliente gana para que el detalle y
  // sus amenidades reflejen el último cambio del CMS sin esperar otro build.
  const project =
    (params.slug ? projects.find((item) => item.slug === params.slug) : undefined) ??
    initialProject;
  const [gallery, setGallery] = useState(false);
  const [shared, setShared] = useState(false);
  const [shareToast, setShareToast] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [start, setStart] = useState(0);
  const showGallery = (index: number) => {
    setStart(index);
    setGallery(true);
  };
  if (!project) return null;
  const projectIndex = projects.findIndex((item) => item.slug === project.slug);
  const displayName = getPublicProjectName(project, projectIndex < 0 ? 0 : projectIndex, hideProjectNames, locale);
  return (
    <section className="section project-detail" id="proyectos">
      <Link
        className="text-link detail-back"
        href={`/proyectos?lang=${locale}`}
        prefetch={false}
      >
        <ArrowLeft size={18} />
        {journeyCopy[locale].back}
      </Link>
      <div className="detail-heading">
        <div>
          <h1>
            {displayName}
          </h1>
          <span className="project-location">
            <MapPin size={16} />
            {project.location}
          </span>
        </div>
        <div className="detail-actions">
          <SaveButton project={project} />
          <button
            className="icon-button"
            aria-label={shared ? t.shared : t.share}
            onClick={async () => {
              const outcome = await shareOrCopy({
                title: displayName,
                text: `${displayName} · ${project.location}`,
                url: window.location.href,
              });
              if (outcome === "shared") {
                setShared(true);
                setShareToast({ tone: "success", message: locale === "es" ? "Proyecto compartido." : locale === "fr" ? "Projet partagé." : "Project shared." });
              } else if (outcome === "copied") {
                setShared(true);
                setShareToast({ tone: "success", message: locale === "es" ? "Enlace copiado." : locale === "fr" ? "Lien copié." : "Link copied." });
              } else if (outcome === "failed") {
                setShared(false);
                setShareToast({ tone: "error", message: locale === "es" ? "No se pudo compartir el proyecto." : locale === "fr" ? "Impossible de partager le projet." : "The project could not be shared." });
              }
            }}
          >
            <ShareNetwork size={22} />
          </button>
          {shared && <span role="status">{t.shared}</span>}
        </div>
      </div>
      <div className="detail-gallery">
        <button onClick={() => showGallery(0)} aria-label={t.gallery}>
          <Photo
            src={project.hero}
            alt={project.gallery[0].alt[locale]}
            priority
          />
          <span className="button button-light">
            <SquaresFour size={18} />
            {t.gallery}
          </span>
        </button>
        <div>
          <button onClick={() => showGallery(1)} aria-label={t.gallery}>
            <Photo
              src={(project.gallery[1]?.src || project.gallery[0]?.src || '')}
              alt={(project.gallery[1]?.alt?.[locale] || project.gallery[0]?.alt?.[locale] || '')}
            />
          </button>
          <button onClick={() => showGallery(2)} aria-label={t.gallery}>
            <Photo
              src={(project.gallery[2]?.src || project.gallery[0]?.src || '')}
              alt={(project.gallery[2]?.alt?.[locale] || project.gallery[0]?.alt?.[locale] || '')}
            />
          </button>
        </div>
      </div>
      <p className="render-caption">{t.renders}</p>
      <ProjectTourButton project={project} />
      <ProjectFacts project={project} />
      <div className="detail-description">
        <div>
          <h2>{t.detail}</h2>
          <p>{project.description[locale]}</p>
        </div>
        <Link className="button button-primary" href={`/contacto?lang=${locale}&proyecto=${project.slug}`} prefetch={false}>
          {t.consultAvailability}
          <ArrowUpRight size={21} />
        </Link>
      </div>
      {project.amenities.length > 0 && (
        <>
          <h3 className="amenities-heading">{t.amenities}</h3>
          {project.amenities.some((a) => resolveAmenity(a, locale, 0).image) ? (
            // Carrusel de fotos tipo "coverflow" (patrón vistacana): único
            // componente en todos los tamaños de pantalla, arrastrable con
            // el mouse/touch y con autoplay pausable.
            <AmenitiesCarousel
              items={project.amenities.map((amenity, index) => resolveAmenity(amenity, locale, index))}
              locale={locale}
            />
          ) : (
            <div className="amenities-list">
              {project.amenities.map((amenity, index) => (
                <div key={index}>{resolveAmenity(amenity, locale, index).name}</div>
              ))}
            </div>
          )}
        </>
      )}
      <p className="field-hint">{t.availabilityNote}</p>
      <Gallery
        key={String(gallery) + start}
        open={gallery}
        onOpenChange={setGallery}
        start={start}
        project={project}
      />
      {shareToast && (
        <ActionToast tone={shareToast.tone} message={shareToast.message} onDismiss={() => setShareToast(null)} />
      )}
    </section>
  );
}
