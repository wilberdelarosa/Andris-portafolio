"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "motion/react";
import { Play, Pause } from "@phosphor-icons/react";
import type { Locale } from "@/content/projects";
import type { ResolvedAmenity } from "@/lib/amenities";

/** @deprecated usa `ResolvedAmenity` de `@/lib/amenities`; se conserva por compatibilidad de tipos. */
export type AmenityItem = ResolvedAmenity;

export interface AmenitiesCarouselProps {
  items: ResolvedAmenity[];
  locale?: Locale;
}

// 5s: mismo intervalo por defecto que usa Bootstrap Carousel
// (`data-bs-interval`), un valor estándar y ya conocido para autoplay,
// ni tan rápido que interrumpa la lectura del título/viñetas ni tan lento
// que se sienta estático.
const AUTOPLAY_INTERVAL_MS = 5000;

/** Separación entre tarjetas, como fracción del ancho de una tarjeta. Debe
 *  coincidir con el `xOffset` que posiciona cada tarjeta más abajo. */
const STEP_RATIO = 0.9;

/** Fracción de un paso que hay que arrastrar para que al soltar cambie de
 *  tarjeta. Por debajo de esto el riel vuelve a su sitio sin cambiar nada. */
const SNAP_THRESHOLD = 0.35;

/** Velocidad (px/s) a partir de la cual un gesto corto cuenta como "flick" y
 *  avanza una tarjeta aunque el dedo no haya recorrido media. La distancia
 *  decide CUÁNTAS tarjetas; la velocidad solo decide si cuenta como una. */
const FLICK_VELOCITY_PX_S = 400;

/** Desplazamiento horizontal acumulado (trackpad) necesario para avanzar una
 *  tarjeta. El scroll vertical se deja intacto para la página. */
const WHEEL_STEP_PX = 60;

export function AmenitiesCarousel({ items, locale = "es" }: AmenitiesCarouselProps) {
  const reducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  /** Ancho en px de un paso entre tarjetas. En ref, no en estado: se lee al
   *  soltar el arrastre y no debe provocar re-render al medirse. */
  const stepPxRef = useRef(0);
  /** Se activa solo durante el clic que el navegador emite justo después de
   *  arrastrar, para que ese clic no se interprete como selección de tarjeta. */
  const suppressClickRef = useRef(false);
  const wheelAccumulatorRef = useRef(0);

  const total = items?.length ?? 0;

  // El paso depende del ancho real de la tarjeta, que cambia por breakpoint.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const measure = () => {
      const card = node.querySelector<HTMLElement>(".amenities-carousel-item");
      stepPxRef.current = card ? card.offsetWidth * STEP_RATIO : 0;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Autoplay: avanza solo mientras nadie interactúa. Se detiene con
  // `prefers-reduced-motion`, al arrastrar, al pasar el mouse por encima,
  // o si el usuario lo pausa manualmente con el botón.
  useEffect(() => {
    if (reducedMotion || !isPlaying || isHovered || isDragging || total <= 1) {
      return;
    }
    const id = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, isPlaying, isHovered, isDragging, total]);

  if (!items || items.length === 0) return null;

  const goBy = (steps: number) => {
    if (!steps) return;
    setCurrentIndex((prev) => (((prev + steps) % total) + total) % total);
  };

  const setIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    suppressClickRef.current = false;
  };

  const handleDragEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    setIsDragging(false);

    if (Math.abs(info.offset.x) > 8) {
      // El clic sintético llega inmediatamente después de soltar; se descarta
      // ese y solo ese, no los clics posteriores.
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    const step = stepPxRef.current;
    if (!step) return;

    // Arrastrar a la izquierda (offset negativo) avanza.
    const rawSteps = -info.offset.x / step;
    let steps = Math.round(rawSteps);

    if (steps === 0) {
      const isFlick = Math.abs(info.velocity.x) > FLICK_VELOCITY_PX_S;
      if (isFlick || Math.abs(rawSteps) >= SNAP_THRESHOLD) {
        steps = rawSteps !== 0 ? Math.sign(rawSteps) : -Math.sign(info.velocity.x);
      }
    }

    goBy(steps);
  };

  // Gesto horizontal de trackpad. Solo actúa cuando el movimiento es más
  // horizontal que vertical, para no secuestrar el scroll de la página.
  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    wheelAccumulatorRef.current += event.deltaX;
    if (Math.abs(wheelAccumulatorRef.current) >= WHEEL_STEP_PX) {
      goBy(Math.sign(wheelAccumulatorRef.current));
      wheelAccumulatorRef.current = 0;
    }
  };

  const handleCardClick = (index: number, isCenter: boolean) => {
    if (suppressClickRef.current) return;
    if (!isCenter) setIndex(index);
  };

  const toggleLabel = isPlaying
    ? locale === "es"
      ? "Pausar carrusel"
      : locale === "fr"
        ? "Mettre le carrousel en pause"
        : "Pause carousel"
    : locale === "es"
      ? "Reanudar carrusel"
      : locale === "fr"
        ? "Reprendre le carrousel"
        : "Play carousel";

  return (
    <div
      className="amenities-carousel-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="amenities-carousel-container" ref={containerRef}>
        {/*
          Un único riel arrastrable: al mover el dedo se desplaza TODO el
          conjunto a la vez. Antes cada tarjeta tenía su propio `drag`, así que
          solo se movía la que se agarraba y el resto saltaba después.
        */}
        <motion.div
          className="amenities-carousel-track"
          drag={total > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onWheel={handleWheel}
        >
          {items.map((item, index) => {
            let diff = (index - currentIndex) % total;
            if (diff > Math.floor(total / 2)) {
              diff -= total;
            } else if (diff < -Math.floor((total - 1) / 2)) {
              diff += total;
            }

            const isCenter = diff === 0;
            const absDiff = Math.abs(diff);

            const xOffset = diff * STEP_RATIO * 100;
            const scale = 1 - absDiff * 0.15;
            const opacity = absDiff > 2 ? 0 : 1 - absDiff * 0.4;
            const zIndex = 10 - absDiff;

            return (
              <motion.div
                key={item.id}
                className="amenities-carousel-item"
                initial={false}
                animate={{
                  x: `${xOffset}%`,
                  scale,
                  opacity,
                  zIndex,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                onClick={() => handleCardClick(index, isCenter)}
              >
                <div className="amenities-carousel-card">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="amenities-carousel-image"
                      draggable={false}
                    />
                  ) : (
                    <div className="amenities-carousel-fallback" />
                  )}
                  {isCenter && (
                    <motion.div
                      className="amenities-carousel-label"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <strong>{item.name}</strong>
                      {item.features.length > 0 && (
                        <ul className="amenities-carousel-features">
                          {item.features.slice(0, 3).map((feature, featureIndex) => (
                            <li key={featureIndex}>{feature}</li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Fuera del riel: el botón no debe desplazarse con el arrastre. */}
        {!reducedMotion && total > 1 && (
          <button
            type="button"
            className="amenities-carousel-toggle"
            onClick={() => setIsPlaying((prev) => !prev)}
            aria-label={toggleLabel}
            aria-pressed={!isPlaying}
          >
            {isPlaying ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
          </button>
        )}
      </div>

      <div className="amenities-carousel-pagination">
        {items.map((_, idx) => (
          <button
            key={idx}
            className={`amenities-carousel-dot ${
              idx === currentIndex ? "active" : ""
            }`}
            onClick={() => setIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
