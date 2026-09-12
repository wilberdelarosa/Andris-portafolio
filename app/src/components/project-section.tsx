"use client";
import Link from "next/link";
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
  ShareNetwork,
} from "@phosphor-icons/react";
import { designCopy } from "@/content/design-copy";
import { melcon } from "@/content/projects";
import { useExperience } from "./experience-provider";
import { Photo, Reveal, SectionTitle, Modal } from "./ui";

export function ProjectFacts() {
  const { t } = useExperience();
  return (
    <div className="project-facts">
      <div>
        <Bed size={20} />
        <span>
          <strong>1, 2 & 3</strong>
          <small>{t.bedrooms}</small>
        </span>
      </div>
      <div>
        <CornersOut size={20} />
        <span>
          <strong>52–108 m²</strong>
          <small>{t.area}</small>
        </span>
      </div>
      <div>
        <Tree size={20} />
        <span>
          <strong>20,000+ m²</strong>
          <small>{t.green}</small>
        </span>
      </div>
    </div>
  );
}
export function Gallery({
  open,
  onOpenChange,
  start = 0,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  start?: number;
}) {
  const { t, locale } = useExperience();
  const [index, setIndex] = useState(start);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const photos = melcon.gallery;
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Melcon Paradise"
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
export function SaveButton() {
  const { saved, toggleSaved, t } = useExperience();
  return (
    <button
      className={`icon-button save-button ${saved ? "is-saved" : ""}`}
      onClick={toggleSaved}
      aria-label={saved ? t.removeSaved : t.save}
      aria-pressed={saved}
    >
      <Heart size={22} weight={saved ? "fill" : "regular"} />
    </button>
  );
}
export function ProjectSection() {
  const { t, locale } = useExperience();
  const d = designCopy[locale];
  const [gallery, setGallery] = useState(false);
  const [start, setStart] = useState(0);
  const showGallery = (index: number) => {
    setStart(index);
    setGallery(true);
  };
  return (
    <section id="proyectos" className="section projects-section">
      <SectionTitle
        title={d.projectsTitle}
        description={d.projectsDescription}
      />
      <Reveal className="featured-project">
        <Link
          href={`/proyectos/${melcon.slug}?lang=${locale}`}
          className="featured-image-link"
          aria-label={`${t.viewProject}: ${melcon.name}`}
        >
          <Photo
            className="featured-image"
            src={melcon.hero}
            alt={melcon.gallery[0].alt[locale]}
          />
          <span className="image-view-circle">
            <ArrowUpRight size={29} />
          </span>
        </Link>
        <div className="featured-content">
          <div className="project-heading">
            <span className="project-location">
              <MapPin size={17} />
              {melcon.location}
            </span>
            <SaveButton />
          </div>
          <h3>
            Melcon <br />
            Paradise
          </h3>
          <p className="project-summary">{d.projectSummary}</p>
          <ProjectFacts />
          <Link
            className="button button-sand"
            href={`/proyectos/${melcon.slug}?lang=${locale}`}
          >
            {t.viewProject}
            <ArrowUpRight size={20} />
          </Link>
          <button
            className="featured-gallery-link"
            onClick={() => showGallery(0)}
          >
            <SquaresFour size={18} />
            {t.gallery}
          </button>
        </div>
      </Reveal>
      <div className="spaces-heading">
        <h3>{d.spaces}</h3>
        <button className="text-link" onClick={() => showGallery(0)}>
          {t.allPhotos}
          <ArrowRight size={18} />
        </button>
      </div>
      <div className="project-facets">
        {[
          { src: "/derived/melcon-gardens.webp", i: 0 },
          { src: "/derived/melcon-pool.webp", i: 1 },
          { src: "/derived/melcon-living.webp", i: 2 },
        ].map(({ src, i }) => (
          <button
            key={src}
            className="facet"
            onClick={() => showGallery(i === 0 ? 5 : i)}
          >
            <div className="facet-image">
              <Photo
                src={src}
                alt={d.spaceLabels[i]}
                sizes="(max-width: 760px) 85vw, 33vw"
              />
              <span className="facet-open">
                <ArrowUpRight size={23} />
              </span>
            </div>
            <div className="facet-caption">
              <h4>{d.spaceLabels[i]}</h4>
              <p>{d.spaceDescriptions[i]}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="render-caption">{t.renders}</p>
      <Gallery
        key={start + String(gallery)}
        open={gallery}
        onOpenChange={setGallery}
        start={start}
      />
    </section>
  );
}
export function ProjectDetail() {
  const { t, locale } = useExperience();
  const [gallery, setGallery] = useState(false);
  const [shared, setShared] = useState(false);
  const [start, setStart] = useState(0);
  const showGallery = (index: number) => {
    setStart(index);
    setGallery(true);
  };
  return (
    <section className="section project-detail" id="proyectos">
      <Link
        className="text-link detail-back"
        href={`/?lang=${locale}#proyectos`}
      >
        <ArrowLeft size={18} />
        {t.back}
      </Link>
      <div className="detail-heading">
        <div>
          <h1>
            Melcon <em>Paradise.</em>
          </h1>
          <span className="project-location">
            <MapPin size={16} />
            {melcon.location}
          </span>
        </div>
        <div className="detail-actions">
          <SaveButton />
          <button
            className="icon-button"
            aria-label={shared ? t.shared : t.share}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(location.href);
                setShared(true);
              } catch {
                setShared(false);
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
            src={melcon.hero}
            alt={melcon.gallery[0].alt[locale]}
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
              src="/derived/melcon-pool.webp"
              alt={melcon.gallery[1].alt[locale]}
            />
          </button>
          <button onClick={() => showGallery(2)} aria-label={t.gallery}>
            <Photo
              src="/derived/melcon-living.webp"
              alt={melcon.gallery[2].alt[locale]}
            />
          </button>
        </div>
      </div>
      <p className="render-caption">{t.renders}</p>
      <ProjectFacts />
      <div className="detail-description">
        <div>
          <h2>{t.detail}</h2>
          <p>{melcon.description[locale]}</p>
        </div>
        <a className="button button-primary" href="#contacto">
          {t.consultAvailability}
          <ArrowUpRight size={21} />
        </a>
      </div>
      <h3 className="amenities-heading">{t.amenities}</h3>
      <div className="amenities-list">
        {melcon.amenities.map((amenity, index) => (
          <div key={index}>{amenity[locale]}</div>
        ))}
      </div>
      <p className="field-hint">{t.availabilityNote}</p>
      <Gallery
        key={String(gallery) + start}
        open={gallery}
        onOpenChange={setGallery}
        start={start}
      />
    </section>
  );
}
