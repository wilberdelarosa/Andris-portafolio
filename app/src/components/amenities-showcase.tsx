/**
 * Variante de escritorio del carrusel de amenidades ("scrollytelling"),
 * inspirada en la sección "Amenities" de vistacana.com: una imagen fija
 * (columna pegajosa) cambia según la amenidad activa mientras se hace scroll
 * por una lista de texto (título + viñetas) a su lado.
 *
 * La amenidad activa se decide con `IntersectionObserver` sobre cada bloque
 * de texto (no con `useScroll`/`scrollYProgress` de Framer Motion): con
 * varios grupos apilados en la misma página, cada grupo necesita su propio
 * "centro de scroll" independiente, y `IntersectionObserver` da eso gratis
 * por elemento sin tener que calcular offsets acumulados entre grupos.
 * El cambio de imagen sí usa Framer Motion (ya es dependencia del proyecto)
 * para el fundido cruzado.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { AmenityEntry, Locale } from "@/content/projects";
import { groupAmenities, type ResolvedAmenity } from "@/lib/amenities";
import "./amenities-showcase.css";

export interface AmenitiesShowcaseProps {
  entries: AmenityEntry[];
  locale: Locale;
}

function AmenityGroupShowcase({
  label,
  items,
}: {
  label: string | null;
  items: ResolvedAmenity[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (items.length <= 1) return;
    const observer = new IntersectionObserver(
      (observed) => {
        // Varios bloques pueden cruzar el umbral a la vez en scroll rápido:
        // gana el más cercano al centro de la ventana, no el primero visto.
        let closest: { index: number; distance: number } | null = null;
        for (const entry of observed) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (Number.isNaN(index)) continue;
          const center = entry.boundingClientRect.top + entry.boundingClientRect.height / 2;
          const distance = Math.abs(center - window.innerHeight / 2);
          if (!closest || distance < closest.distance) closest = { index, distance };
        }
        if (closest) setActiveIndex(closest.index);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items.length]);

  const active = items[activeIndex] ?? items[0];

  return (
    <div className="amenities-showcase-group">
      {label && <p className="amenities-showcase-group-label">{label}</p>}
      <div className="amenities-showcase-grid">
        <div className="amenities-showcase-sticky">
          <div className="amenities-showcase-image-frame">
            <AnimatePresence mode="wait">
              {active.image ? (
                <motion.img
                  key={active.id}
                  src={active.image}
                  alt={active.name}
                  className="amenities-showcase-image"
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              ) : (
                <div key="fallback" className="amenities-showcase-fallback" />
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="amenities-showcase-list">
          {items.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              data-index={index}
              className={`amenities-showcase-item${index === activeIndex ? " is-active" : ""}`}
            >
              <span className="amenities-showcase-item-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h5>{item.name}</h5>
              {item.features.length > 0 && (
                <ul>
                  {item.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AmenitiesShowcase({ entries, locale }: AmenitiesShowcaseProps) {
  if (entries.length === 0) return null;
  const groups = groupAmenities(entries, locale);

  return (
    <div className="amenities-showcase">
      {groups.map((group, index) => (
        <AmenityGroupShowcase
          key={group.key ?? `group-${index}`}
          label={group.label}
          items={group.items}
        />
      ))}
    </div>
  );
}
