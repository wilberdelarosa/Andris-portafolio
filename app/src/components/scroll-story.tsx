"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useExperience } from "./experience-provider";
import { storyCopy } from "@/content/story-copy";
import "./scroll-story.css";

/**
 * Momento narrativo guiado por scroll.
 *
 * La frase se enciende palabra a palabra mientras la seccion avanza, y detras
 * una imagen se abre despacio. El texto nunca depende de la animacion para
 * poder leerse: su estado de reposo es legible y con movimiento reducido
 * aparece entero de una vez.
 */
export function ScrollStory() {
  const { locale } = useExperience();
  const copy = storyCopy[locale];
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start end", "end start"],
  });

  // La frase se revela en el tramo central del recorrido; los extremos quedan
  // para la entrada y la salida de la imagen.
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.16, 1]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.22, 0.8, 1], [0.25, 0.7, 0.7, 0.3]);
  const veilOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.86, 1, 0.86]);

  const words = copy.line.split(" ");

  return (
    <section className="story" ref={section} aria-label={copy.label}>
      <motion.div
        className="story-media"
        aria-hidden="true"
        style={reduced ? undefined : { scale: imageScale, opacity: imageOpacity }}
      >
        <Image src="/derived/melcon-hero.webp" alt="" fill sizes="100vw" className="story-image" />
      </motion.div>
      <motion.div
        className="story-veil"
        aria-hidden="true"
        style={reduced ? undefined : { opacity: veilOpacity }}
      />

      <div className="story-inner">
        <span className="story-eyebrow">{copy.eyebrow}</span>
        <p className="story-line">
          <span className="sr-only">{copy.line}</span>
          <span aria-hidden="true">
            {words.map((word, index) => (
              <Word
                key={`${word}-${index}`}
                progress={scrollYProgress}
                index={index}
                total={words.length}
                reduced={Boolean(reduced)}
              >
                {word}
              </Word>
            ))}
          </span>
        </p>
        <p className="story-footnote">{copy.footnote}</p>
      </div>
    </section>
  );
}

/**
 * Una palabra que pasa de apagada a encendida en su tramo del recorrido.
 * Los tramos se solapan un poco para que la frase fluya en vez de parpadear.
 */
function Word({
  children,
  progress,
  index,
  total,
  reduced,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  index: number;
  total: number;
  reduced: boolean;
}) {
  const span = 0.52 / total;
  const start = 0.2 + index * span;
  // El piso no baja de 0.45: por debajo la frase deja de ser legible
  // mientras se recorre, y el texto no puede depender de la animacion.
  const opacity = useTransform(progress, [start, start + span * 1.8], [0.45, 1]);

  return (
    <motion.span className="story-word" style={reduced ? { opacity: 1 } : { opacity }}>
      {children}{" "}
    </motion.span>
  );
}
