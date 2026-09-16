"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useExperience } from "./experience-provider";
import { Reveal } from "./ui";
import "./villa-scene.css";
import {
  CharacterKicker,
  MaskedLineReveal,
  ArchitecturalCrosshair,
} from "./premium-motion";

const villaCopy = {
  es: {
    kicker: "03 / Espacios & Arquitectura",
    title: "Líneas limpias en sintonía con la luz del Caribe",
    alt: "Vista aérea conceptual de una villa tropical con piscina, terraza y jardín.",
    caption: "Villa conceptual · Imagen generada, no es una propiedad ofertada",
    callouts: ["Piscina", "Terraza", "Jardín"],
  },
  en: {
    kicker: "03 / Spaces & Architecture",
    title: "Clean lines in harmony with Caribbean light",
    alt: "Conceptual aerial view of a tropical villa with a pool, terrace and garden.",
    caption: "Concept villa · Generated image, not a listed property",
    callouts: ["Pool", "Terrace", "Garden"],
  },
  fr: {
    kicker: "03 / Espaces & Architecture",
    title: "Des lignes pures en harmonie avec la lumière caribéenne",
    alt: "Vue aérienne conceptuelle d’une villa tropicale avec piscine, terrasse et jardin.",
    caption: "Villa conceptuelle · Image générée, il ne s’agit pas d’un bien proposé",
    callouts: ["Piscine", "Terrasse", "Jardin"],
  },
} as const;

/** Decorative scene only: it is explicitly labelled and never presented as inventory. */
export function VillaScene() {
  const { locale } = useExperience();
  const copy = villaCopy[locale];
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const sceneY = useTransform(scrollYProgress, [0, 1], [88, -78]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <section
      ref={ref}
      id="arquitectura"
      className="section villa-scene"
      aria-labelledby="villa-scene-caption"
    >
      <div className="villa-scene-header">
        <CharacterKicker text={copy.kicker} delay={0.06} />
        <MaskedLineReveal as="h2" text={copy.title} className="villa-scene-heading" />
      </div>
      <div className="villa-scene-frame">
        <ArchitecturalCrosshair position="top-left" />
        <ArchitecturalCrosshair position="bottom-right" />
        <motion.div
          className="villa-scene-art"
          style={reduced ? undefined : { y: sceneY, scale: sceneScale }}
        >
          <Image
            src="/derived/ambient-villa-v1.webp"
            alt={copy.alt}
            fill
            sizes="(max-width: 760px) 100vw, (max-width: 1120px) 92vw, 1180px"
            className="villa-scene-image"
          />
          <ol className="villa-scene-callouts" aria-hidden="true">
            {copy.callouts.map((label, index) => (
              <motion.li
                className={`villa-scene-callout villa-scene-callout-${index + 1}`}
                key={label}
                initial={reduced ? false : { opacity: 0, scale: 0.82, y: 16 }}
                whileInView={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
                viewport={{ amount: 0.35, once: false }}
                transition={{
                  duration: 0.65,
                  delay: reduced ? 0 : 0.16 + index * 0.14,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span aria-hidden="true" className="villa-scene-callout-badge">
                  <span className="villa-scene-callout-ripple" aria-hidden="true" />
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{label}</strong>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </div>
      <ol className="villa-scene-mobile-legend">
        {copy.callouts.map((label, index) => (
          <li key={label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {label}
          </li>
        ))}
      </ol>
      <Reveal from="bottom" distance={18}>
        <p className="villa-scene-caption" id="villa-scene-caption">
          {copy.caption}
        </p>
      </Reveal>
    </section>
  );
}
