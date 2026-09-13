"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Bed, Heart, MapPin, Ruler, Tree } from "@phosphor-icons/react";
import { useSurfaceMotion } from "./premium-motion";
import { useExperience } from "./experience-provider";
import { Photo } from "./ui";
import { catalogCopy } from "@/content/catalog-copy";
import { journeyCopy } from "@/content/journey-copy";
import type { PropertyProject } from "@/content/projects";
import "./property-card.css";

/** Gestures change images; the explicit CTA opens the profile. */
export function PropertyCard({ project, featured = false }: { project: PropertyProject; featured?: boolean }) {
  const { locale, t, isSaved, toggleSlug } = useExperience();
  const c = catalogCopy[locale];
  const j = journeyCopy[locale];
  const reduced = useReducedMotion();
  const surface = useSurfaceMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const saved = isSaved(project.slug);
  const slides = project.gallery;
  const slide = slides[index];
  const changeImage = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex((next + slides.length) % slides.length);
  };
  return (
    <motion.article {...surface.bindings} className={`pcard ${featured ? "pcard-featured" : ""}`} aria-label={project.name}>
      <div className="pcard-media"
        onTouchStart={(event) => { const p = event.touches[0]; touch.current = { x: p.clientX, y: p.clientY }; }}
        onTouchCancel={() => { touch.current = null; }}
        onTouchEnd={(event) => {
          if (!touch.current) return;
          const p = event.changedTouches[0];
          const dx = p.clientX - touch.current.x;
          const dy = p.clientY - touch.current.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) changeImage(index + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div key={slide.src} className="pcard-image" custom={direction}
            initial={reduced ? false : { opacity: 0, x: direction * 28, scale: 1.025 }}
            animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}>
            <Photo src={slide.src} alt={slide.alt[locale]} sizes={featured ? "(max-width: 760px) 95vw, 75vw" : "(max-width: 760px) 90vw, 33vw"} />
          </motion.div>
        </AnimatePresence>
        <div className="pcard-topline">
          <span className="pcard-label">{j.render}</span>
          <button type="button" className="pcard-heart" aria-pressed={saved}
            aria-label={saved ? c.unsave(project.name) : c.save(project.name)} onClick={() => toggleSlug(project.slug)}>
            <motion.span animate={reduced ? undefined : { scale: saved ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.25 }}>
              <Heart size={22} weight={saved ? "fill" : "regular"} aria-hidden="true" />
            </motion.span>
          </button>
        </div>
        {slides.length > 1 && <div className="pcard-image-controls" role="group" aria-label={`${j.photos}: ${project.name}`}>
          <button type="button" onClick={() => changeImage(index - 1)} aria-label={`${t.previous}: ${project.name}`}><ArrowLeft size={18} /></button>
          <span aria-live="polite" aria-atomic="true" aria-label={c.image(index + 1, slides.length)}>{String(index + 1).padStart(2, "0")} <i>/</i> {String(slides.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => changeImage(index + 1)} aria-label={`${t.next}: ${project.name}`}><ArrowRight size={18} /></button>
        </div>}
      </div>
      <div className="pcard-glass">
        <div className="pcard-info">
          <p className="pcard-location"><MapPin size={15} aria-hidden="true" />{project.location}</p>
          <h3 className="pcard-name"><Link href={`/proyectos/${project.slug}?lang=${locale}`}>{project.name}</Link></h3>
          {project.bedrooms.length > 0 ? <ul className="pcard-specs">
            <li><Bed size={18} /><span>{project.bedrooms.join(", ")} {c.bedroomsShort}</span></li>
            <li><Ruler size={18} /><span>{project.area.min}–{project.area.max} {project.area.unit}</span></li>
            {featured && project.greenArea > 0 && <li><Tree size={18} /><span>{project.greenArea.toLocaleString("en-US")}+ m²</span></li>}
          </ul> : <p className="pcard-pending">{c.pending}</p>}
        </div>
        <div className="pcard-actions">
          <Link className="pcard-action" href={`/proyectos/${project.slug}?lang=${locale}`}>{c.open}<ArrowUpRight size={20} /></Link>
          <Link className="pcard-map" href={`/mapa?lang=${locale}&proyecto=${project.slug}`}><MapPin size={17} />{c.location}</Link>
        </div>
      </div>
      <motion.span className="surface-light" style={surface.glowStyle} aria-hidden="true"/>
    </motion.article>
  );
}
