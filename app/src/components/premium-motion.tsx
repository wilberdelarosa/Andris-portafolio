"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import "./premium-motion.css";

export function EditorialTitle({ text, accent, id, as: Tag = "h2", compact = false, className = "" }: {
  text: string; accent: string; id?: string; as?: "h1" | "h2"; compact?: boolean; className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Move the complete typeset heading, never individual words across lines.
  const y = useTransform(scrollYProgress, [0, .32, .7, 1], [48, 8, -8, -32]);
  const mark = useTransform(scrollYProgress, [0, .32, .8, 1], [.15, 1, 1, .45]);
  const split = text.lastIndexOf(accent);
  const lead = split < 0 ? text : text.slice(0, split).trimEnd();
  const emphasis = split < 0 ? "" : text.slice(split);
  return <Tag ref={ref} id={id} aria-label={text} className={`editorial-title ${compact ? "editorial-title-compact" : ""} ${className}`}>
    <motion.span className="editorial-motion" data-heading-depth aria-hidden="true" style={{ y: reduced ? 0 : y }}>
    <span className="editorial-lead">{lead.split(" ").map((word, index) => <span className="editorial-word-space" key={`${word}-${index}`}><span className="editorial-word">{word}</span>{" "}</span>)}</span>
    {emphasis && <em className="editorial-accent">
      {emphasis}<motion.span className="editorial-mark" style={{ scaleX: reduced ? 1 : mark }}/>
    </em>}
    </motion.span>
  </Tag>;
}

/** Perspective is bounded and pointer-only; touch keeps native scrolling/swiping. */
export function useSurfaceMotion(tilt = 2.2) {
  const reduced = useReducedMotion();
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const active = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 28 });
  const sy = useSpring(y, { stiffness: 240, damping: 28 });
  const opacity = useSpring(active, { stiffness: 220, damping: 30 });
  const rotateX = useTransform(sy, [0, 100], [tilt, -tilt]);
  const rotateY = useTransform(sx, [0, 100], [-tilt, tilt]);
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
  const y = useTransform(scrollYProgress, [0, .35, .65, 1], [72, 12, -12, -54]);
  const scale = useTransform(scrollYProgress, [0, .4, .7, 1], [.94, 1, 1, .97]);
  return <div ref={ref} className={`depth-frame ${className}`}><motion.div className="depth-panel" data-scroll-depth style={{ y: reduced ? 0 : y, scale: reduced ? 1 : scale }}>{children}</motion.div></div>;
}

export function DecorativeLayer({ variant = "palm" }: { variant?: "palm" | "plan" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [130, -140]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-9, 9]);
  return <div ref={ref} className={`section-ambient section-ambient-${variant}`} aria-hidden="true"><motion.div className="ambient-depth" data-decorative-depth style={{ y: reduced ? 0 : y, rotate: reduced ? 0 : rotate }}>
    <Image src={variant === "palm" ? "/derived/ambient-palm-color-v2.webp" : "/derived/ambient-site-plan-v1.webp"} alt="" fill sizes="(max-width: 760px) 320px, 650px"/>
  </motion.div></div>;
}

export function ReadingProgress() {
  const { scrollYProgress } = useScroll({ trackContentSize: true });
  // CSS handles reduced motion without changing the server/client tree.
  return <motion.div className="reading-progress" aria-hidden="true" style={{ scaleX: scrollYProgress }}/>;
}

/* ==========================================================================
   PRIMITIVAS COMPLEMENTARIAS
   ========================================================================== */

/** Hacia donde se esta desplazando la pagina. */
export function useScrollDirection() {
  const { scrollY } = useScroll();
  const [direction, setDirection] = useState<"down" | "up">("down");

  useEffect(() => {
    let previous = scrollY.get();
    return scrollY.on("change", (current) => {
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
export function Stagger({
  children,
  className,
  gap = 0.09,
  delay = 0,
  amount = 0.2,
  once = false,
  role,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  amount?: number;
  once?: boolean;
  role?: string;
  "aria-label"?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      role={role}
      aria-label={ariaLabel}
      initial={reduced ? false : "hidden"}
      whileInView="shown"
      viewport={{ once, amount, margin: "0px 0px -40px 0px" }}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Hijo de Stagger. */
export function StaggerItem({ children, className, distance = 24 }: { children: ReactNode; className?: string; distance?: number }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: distance, scale: 0.98 },
        shown: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
        },
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

  return (
    <motion.span
      className={className}
      style={{ x: reduced ? 0 : x, y: reduced ? 0 : y, display: "inline-flex" }}
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== "mouse" || !matchMedia("(pointer: fine)").matches) return;
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

/** Revelado tipográfico meticuloso con máscara de línea y desenfoque óptico progresivo. */
export function MaskedLineReveal({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.05,
  once = false,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3, once });
  const reduced = useReducedMotion();
  const words = text.split(" ");

  return (
    <Tag ref={ref as React.Ref<never>} className={`masked-line-reveal ${className}`}>
      <span className="sr-only">{text}</span>
      <span className="masked-words-container" aria-hidden="true">
        {words.map((word, i) => (
          <span className="masked-word-wrap" key={`${word}-${i}`}>
            <motion.span
              className="masked-word-inner"
              initial={reduced ? false : { y: "115%", opacity: 0, filter: "blur(4px)" }}
              animate={
                inView || reduced
                  ? { y: "0%", opacity: 1, filter: "blur(0px)" }
                  : { y: "115%", opacity: 0, filter: "blur(4px)" }
              }
              transition={{
                duration: 0.82,
                delay: reduced ? 0 : delay + i * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </span>
    </Tag>
  );
}

/** Kicker / subtítulo con revelado secuencial letra a letra y línea de cota expansiva. */
export function CharacterKicker({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });
  const reduced = useReducedMotion();
  const chars = Array.from(text);

  return (
    <div ref={ref} className={`character-kicker ${className}`}>
      <span className="sr-only">{text}</span>
      <motion.span
        className="character-kicker-rule"
        initial={reduced ? false : { scaleX: 0 }}
        animate={inView || reduced ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.65, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
      <span className="character-kicker-chars" aria-hidden="true">
        {chars.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            className="character-kicker-char"
            initial={reduced ? false : { opacity: 0, y: 3 }}
            animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 }}
            transition={{
              duration: 0.35,
              delay: reduced ? 0 : delay + 0.12 + i * 0.016,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    </div>
  );
}

/** Crucetas técnicas arquitectónicas para encuadrar tarjetas y planos. */
export function ArchitecturalCrosshair({
  position = "top-left",
  className = "",
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}) {
  return (
    <span
      className={`arch-crosshair arch-crosshair-${position} ${className}`}
      aria-hidden="true"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1" strokeOpacity="0.45" />
      </svg>
    </span>
  );
}

/** Escala métrica gráfica con marcas de cota animadas al entrar al viewport. */
export function TechnicalRuler({
  ticks = 5,
  className = "",
}: {
  ticks?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className={`tech-ruler ${className}`} aria-hidden="true">
      <motion.span
        className="tech-ruler-line"
        initial={reduced ? false : { scaleX: 0 }}
        animate={inView || reduced ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="tech-ruler-ticks">
        {Array.from({ length: ticks }).map((_, i) => (
          <motion.span
            key={i}
            className={`tech-ruler-tick ${i === 0 || i === ticks - 1 ? "is-major" : ""}`}
            initial={reduced ? false : { scaleY: 0 }}
            animate={inView || reduced ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.35, delay: reduced ? 0 : 0.18 + i * 0.04 }}
          />
        ))}
      </div>
    </div>
  );
}

/** Contador dinámico mecánico con desaceleración cuártica y números tabulares. */
export function MetricTicker({
  value,
  prefix = "",
  suffix = "",
  duration = 1300,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(value);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- Animación fotograma a fotograma al entrar al viewport */
    if (!mounted || reduced) {
      setCurrent(value);
      return;
    }
    if (!inView) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - p, 4);
      setCurrent(Math.round(value * ease));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [mounted, inView, reduced, value, duration]);

  return (
    <span ref={ref} className={`metric-ticker ${className}`}>
      <span className="sr-only">
        {prefix}{value.toLocaleString("es-DO")}{suffix}
      </span>
      <span aria-hidden="true" className="metric-ticker-value">
        {prefix}{current.toLocaleString("es-DO")}{suffix}
      </span>
    </span>
  );
}

/** Desenmascarado tipo cortina arquitectónica para imágenes y renders. */
export function ImageClipCurtain({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className={`clip-curtain-wrap ${className}`}>
      <motion.div
        className="clip-curtain-inner"
        initial={reduced ? false : { clipPath: "inset(0% 0% 100% 0%)", scale: 1.05 }}
        animate={
          inView || reduced
            ? { clipPath: "inset(0% 0% 0% 0%)", scale: 1 }
            : { clipPath: "inset(0% 0% 100% 0%)", scale: 1.05 }
        }
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

type TrackerLocale = "es" | "en" | "fr";

/** Indicador lateral flotante de estaciones del recorrido en escritorio. */
export function JourneyScrollTracker({
  locale = "es",
}: {
  locale?: TrackerLocale;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("proyectos");
  const { scrollYProgress } = useScroll();

  const labels: Record<TrackerLocale, { id: string; label: string; num: string }[]> = {
    es: [
      { id: "proyectos", label: "Catálogo", num: "01" },
      { id: "ubicacion", label: "Ubicación", num: "02" },
      { id: "arquitectura", label: "Arquitectura", num: "03" },
      { id: "sobre-mi", label: "Asesor", num: "04" },
      { id: "inversion", label: "Inversión", num: "05" },
    ],
    en: [
      { id: "proyectos", label: "Portfolio", num: "01" },
      { id: "ubicacion", label: "Location", num: "02" },
      { id: "arquitectura", label: "Architecture", num: "03" },
      { id: "sobre-mi", label: "Advisor", num: "04" },
      { id: "inversion", label: "Investment", num: "05" },
    ],
    fr: [
      { id: "proyectos", label: "Catalogue", num: "01" },
      { id: "ubicacion", label: "Emplacement", num: "02" },
      { id: "arquitectura", label: "Architecture", num: "03" },
      { id: "sobre-mi", label: "Conseiller", num: "04" },
      { id: "inversion", label: "Investissement", num: "05" },
    ],
  };

  const sections = labels[locale] ?? labels.es;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sections]);

  if (!mounted) return null;

  return (
    <nav className="journey-tracker" aria-label="Navegación del recorrido">
      <div className="journey-tracker-track">
        <motion.div
          className="journey-tracker-fill"
          style={{ scaleY: scrollYProgress }}
        />
      </div>
      <ul className="journey-tracker-list">
        {sections.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <li key={sec.id} className={`journey-tracker-item ${isActive ? "is-active" : ""}`}>
              <a
                href={`#${sec.id}`}
                className="journey-tracker-link"
                title={sec.label}
              >
                <span className="journey-tracker-dot" />
                <span className="journey-tracker-label">
                  <small>{sec.num}</small>
                  <strong>{sec.label}</strong>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
