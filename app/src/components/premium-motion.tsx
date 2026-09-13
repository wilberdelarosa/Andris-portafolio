"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import "./premium-motion.css";

/** The heading stays readable at either end of the reversible scroll sequence. */
function DepthWord({ word, progress, index }: { word: string; progress: MotionValue<number>; index: number }) {
  const reduced = useReducedMotion();
  const distance = 18 + Math.min(index, 6) * 2;
  const y = useTransform(progress, [0, .28, .74, 1], [distance, 0, 0, -10]);
  const scale = useTransform(progress, [0, .28, .74, 1], [.96, 1, 1, 1.015]);
  return <motion.span className="editorial-word" style={{ y: reduced ? 0 : y, scale: reduced ? 1 : scale }}>{word}</motion.span>;
}

export function EditorialTitle({ text, accent, id, as: Tag = "h2", compact = false, className = "" }: {
  text: string; accent: string; id?: string; as?: "h1" | "h2"; compact?: boolean; className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, .3, .74, 1], [-16, 0, 0, 12]);
  const mark = useTransform(scrollYProgress, [0, .32, .8, 1], [.15, 1, 1, .45]);
  const split = text.lastIndexOf(accent);
  const lead = split < 0 ? text : text.slice(0, split).trimEnd();
  const emphasis = split < 0 ? "" : text.slice(split);
  return <Tag ref={ref} id={id} aria-label={text} className={`editorial-title ${compact ? "editorial-title-compact" : ""} ${className}`}>
    <span aria-hidden="true" className="editorial-lead">{lead.split(" ").map((word, index) => <span className="editorial-word-space" key={`${word}-${index}`}><DepthWord word={word} index={index} progress={scrollYProgress}/>{" "}</span>)}</span>
    {emphasis && <motion.em aria-hidden="true" className="editorial-accent" style={{ x: reduced ? 0 : x }}>
      {emphasis}<motion.span className="editorial-mark" style={{ scaleX: reduced ? 1 : mark }}/>
    </motion.em>}
  </Tag>;
}

/** Perspective is bounded and pointer-only; touch keeps native scrolling/swiping. */
export function useSurfaceMotion() {
  const reduced = useReducedMotion();
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const active = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 28 });
  const sy = useSpring(y, { stiffness: 240, damping: 28 });
  const opacity = useSpring(active, { stiffness: 220, damping: 30 });
  const rotateX = useTransform(sy, [0, 100], [2.2, -2.2]);
  const rotateY = useTransform(sx, [0, 100], [-2.2, 2.2]);
  const glowX = useTransform(sx, [0, 100], ["-32%", "32%"]);
  const glowY = useTransform(sy, [0, 100], ["-30%", "30%"]);
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== "mouse" || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set(Math.max(0, Math.min(100, (event.clientX - box.left) / box.width * 100)));
    y.set(Math.max(0, Math.min(100, (event.clientY - box.top) / box.height * 100)));
    active.set(1);
  };
  const onPointerLeave = () => { x.set(50); y.set(50); active.set(0); };
  return {
    bindings: { onPointerMove, onPointerLeave, style: { rotateX: reduced ? 0 : rotateX, rotateY: reduced ? 0 : rotateY, transformPerspective: 1200 } },
    glowStyle: { x: reduced ? 0 : glowX, y: reduced ? 0 : glowY, opacity: reduced ? 0 : opacity },
  };
}

export function DepthPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, .25, .72, 1], [28, 0, 0, -24]);
  const scale = useTransform(scrollYProgress, [0, .3, .75, 1], [.975, 1, 1, .985]);
  return <div ref={ref} className={`depth-frame ${className}`}><motion.div className="depth-panel" data-scroll-depth style={{ y: reduced ? 0 : y, scale: reduced ? 1 : scale }}>{children}</motion.div></div>;
}

export function DecorativeLayer({ variant = "palm" }: { variant?: "palm" | "plan" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [48, -52]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-4, 4]);
  return <div ref={ref} className={`section-ambient section-ambient-${variant}`} aria-hidden="true"><motion.div className="ambient-depth" data-decorative-depth style={{ y: reduced ? 0 : y, rotate: reduced ? 0 : rotate }}>
    <Image src={`/derived/ambient-${variant === "palm" ? "palm-overlay" : "site-plan"}-v1.webp`} alt="" fill sizes="(max-width: 760px) 300px, 650px"/>
  </motion.div></div>;
}

export function ReadingProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // El muelle suaviza el avance cuando el scroll llega a saltos.
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 26, restDelta: 0.001 });
  if (reduced) return null;
  return <motion.div className="reading-progress" aria-hidden="true" style={{ scaleX }}/>;
}

/* ==========================================================================
   PRIMITIVAS COMPLEMENTARIAS
   Se unificaron aqui para que la aplicacion tenga una sola capa de movimiento.
   Todas animan solo `transform` y `opacity`, y se apagan con movimiento
   reducido, igual que las de arriba.
   ========================================================================== */

/**
 * Hacia donde se esta desplazando la pagina.
 *
 * Permite que un bloque entre desde abajo al bajar y desde arriba al subir, de
 * modo que el movimiento acompaña al gesto. Se lee del `scrollY` de la libreria,
 * sin añadir otro escuchador de scroll.
 */
export function useScrollDirection() {
  const { scrollY } = useScroll();
  const [direction, setDirection] = useState<"down" | "up">("down");

  useEffect(() => {
    let previous = scrollY.get();
    return scrollY.on("change", (current) => {
      // Umbral corto: ignora el temblor del scroll por inercia.
      if (Math.abs(current - previous) < 6) return;
      setDirection(current > previous ? "down" : "up");
      previous = current;
    });
  }, [scrollY]);

  return direction;
}

/** Deriva un elemento mientras su seccion cruza la pantalla. */
export function Parallax({ children, speed = 60, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [speed, -speed]), { stiffness: 110, damping: 30, mass: 0.4 });
  return <div ref={ref} className={className}><motion.div style={reduced ? undefined : { y }}>{children}</motion.div></div>;
}

/** La imagen se acerca despacio mientras su seccion pasa por la pantalla. */
export function ScrollZoom({ children, from = 1.14, to = 1, className }: { children: ReactNode; from?: number; to?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [from, to]);
  return <div ref={ref} className={className} style={{ overflow: "hidden" }}><motion.div style={reduced ? undefined : { scale }}>{children}</motion.div></div>;
}

/** Contenedor que orquesta la entrada de sus hijos, uno detras de otro. */
export function Stagger({ children, className, gap = 0.09, delay = 0, amount = 0.2, once = false }: {
  children: ReactNode; className?: string; gap?: number; delay?: number; amount?: number; once?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : "hidden"}
      whileInView="shown"
      viewport={{ once, amount, margin: "0px 0px -40px 0px" }}
      variants={{ shown: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

/** Hijo de `Stagger`. Su ritmo lo marca el contenedor, no un retardo propio. */
export function StaggerItem({ children, className, distance = 26 }: { children: ReactNode; className?: string; distance?: number }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: distance },
        shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Cifra que cuenta hasta su valor al entrar en pantalla. */
export function CountUp({ to, duration = 1600, format = (value: number) => value.toLocaleString("es-DO"), className }: {
  to: number; duration?: number; format?: (value: number) => string; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.6, once: true });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- La cuenta arranca al
       entrar en pantalla y avanza por fotograma; no puede derivarse del render. */
    if (reduced) {
      setValue(to);
      return;
    }
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // Desaceleracion: la cifra frena al acercarse a su valor final.
      setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [inView, reduced, to, duration]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{format(to)}</span>
      <span aria-hidden="true">{format(value)}</span>
    </span>
  );
}

/** El elemento se acerca al cursor dentro de un radio corto. */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const reduced = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 220, damping: 20, mass: 0.35 });
  const y = useSpring(rawY, { stiffness: 220, damping: 20, mass: 0.35 });

  if (reduced) return <span className={className}>{children}</span>;

  return (
    <motion.span
      className={className}
      style={{ x, y, display: "inline-flex" }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || !matchMedia("(pointer: fine)").matches) return;
        const box = event.currentTarget.getBoundingClientRect();
        rawX.set((event.clientX - box.left - box.width / 2) * strength);
        rawY.set((event.clientY - box.top - box.height / 2) * strength);
      }}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
