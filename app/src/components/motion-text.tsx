"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Texto que se escribe solo al entrar en pantalla.
 *
 * El texto completo vive siempre en el DOM para lectores de pantalla; lo que se
 * anima es una capa visual aparte. El cursor se retira al terminar para no
 * dejar un elemento parpadeando de forma indefinida.
 */
export function TypeLine({
  text,
  as: Tag = "span",
  className,
  speed = 32,
  delay = 0,
  cursor = true,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState("");
  const done = typed.length >= text.length;

  useEffect(() => {
    if (reduced) {
      setTyped(text);
      return;
    }
    if (!inView) return;

    let index = 0;
    let step: number | undefined;
    const begin = window.setTimeout(function tick() {
      index += 1;
      setTyped(text.slice(0, index));
      if (index >= text.length) return;
      // Pausa mas larga tras puntuacion: imita el ritmo de una lectura real.
      const pause = /[.,;:]/.test(text[index - 1] ?? "") ? speed * 8 : speed;
      step = window.setTimeout(tick, pause);
    }, delay);

    return () => {
      window.clearTimeout(begin);
      if (step) window.clearTimeout(step);
    };
  }, [inView, reduced, text, speed, delay]);

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {reduced ? text : typed}
        {cursor && !reduced && !done && inView ? <span className="type-caret" /> : null}
      </span>
    </Tag>
  );
}

/**
 * Revelado por lineas con barrido vertical, como un titulo de credito.
 *
 * Las lineas se pasan explicitas en lugar de dejar que el navegador decida
 * donde cortar: un salto automatico distinto por ancho daria mascaras que no
 * coinciden con el texto.
 */
export function CutLines({
  lines,
  as: Tag = "span",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.12,
  once = true,
}: {
  lines: readonly string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35, once });
  const reduced = useReducedMotion();

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden="true">
        {lines.map((line, index) => (
          <span className="cut-line" key={`${line}-${index}`}>
            <motion.span
              className={lineClassName}
              style={{ display: "block" }}
              initial={reduced ? false : { y: "112%" }}
              animate={inView || reduced ? { y: "0%" } : { y: "112%" }}
              transition={{
                duration: 0.95,
                delay: reduced ? 0 : delay + index * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}

/*
 * Componentes animados creados una sola vez, fuera del render.
 * `motion.create` dentro del cuerpo devolveria un componente nuevo en cada
 * pasada y su estado se reiniciaria.
 */
const risers = {
  div: motion.div,
  p: motion.p,
  span: motion.span,
  li: motion.li,
  section: motion.section,
} as const;

/**
 * Entrada escalonada de un bloque. Anima solo `transform` y `opacity`.
 */
export function Rise({
  children,
  className,
  delay = 0,
  distance = 22,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  as?: keyof typeof risers;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.25, once: true });
  const reduced = useReducedMotion();
  const MotionTag = risers[as];

  return (
    <MotionTag
      // El tipo del ref depende de la etiqueta elegida; el nodo es el mismo.
      ref={ref as React.Ref<never>}
      className={className}
      initial={reduced ? false : { opacity: 0, y: distance }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{ duration: 0.85, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}
