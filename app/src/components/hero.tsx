"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowUpRight, ArrowDown, MapPin } from "@phosphor-icons/react";
import { useExperience } from "./experience-provider";
import { heroCopy } from "@/content/hero-copy";
import styles from "./hero.module.css";

export function Hero() {
  const { t, locale } = useExperience();
  const copy = heroCopy[locale];
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 65, damping: 24 });
  const y = useSpring(pointerY, { stiffness: 65, damping: 24 });
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start start", "end start"],
  });
  const landscapeY = useTransform(scrollYProgress, [0, 1], [0, 65]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 38]);

  function followPointer(event: PointerEvent<HTMLElement>) {
    if (
      reduced ||
      event.pointerType !== "mouse" ||
      !window.matchMedia("(min-width: 1021px) and (pointer: fine)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 16);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 10);
  }

  return (
    <section
      id="inicio"
      ref={root}
      className={styles.hero}
      aria-labelledby="hero-name"
      onPointerMove={followPointer}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <div className={styles.scene}>
        <motion.div
          className={styles.atmosphere}
          style={{ y: reduced ? 0 : landscapeY }}
          aria-hidden="true"
        >
          <picture>
            <source
              media="(min-width: 761px)"
              srcSet="/derived/hero-coast-wide-w640.webp 640w, /derived/hero-coast-wide-w960.webp 960w, /derived/hero-coast-wide-w1440.webp 1440w, /derived/hero-coast-wide.webp 1800w"
              sizes="100vw"
              type="image/webp"
            />
            <source
              media="(max-width: 760px)"
              srcSet="/derived/hero-coast-portrait-w320.webp 320w, /derived/hero-coast-portrait-w640.webp 640w, /derived/hero-coast-portrait.webp 900w"
              sizes="100vw"
              type="image/webp"
            />
            {/* Art direction needs one matching source per viewport. */}
            <img
              src="/derived/hero-coast-portrait.webp"
              alt=""
              fetchPriority="high"
              decoding="async"
              className={styles.backdrop}
            />
          </picture>
        </motion.div>
        <div className={styles.light} aria-hidden="true" />
        <div className={styles.grade} aria-hidden="true" />
        <div className={styles.sceneTop}>
          <span>{copy.personal}</span>
          <span className={styles.location}>
            <MapPin size={14} aria-hidden="true" /> Punta Cana, RD
          </span>
        </div>
        <h1 id="hero-name" className={styles.name}>
          <span className="sr-only">Andris Peña, {t.role}</span>
          <span className={styles.firstName} aria-hidden="true">
            <span>Andris</span>
          </span>
          <span className={styles.lastName} aria-hidden="true">
            <span>Peña</span>
          </span>
        </h1>
        <motion.div
          className={styles.portraitDepth}
          style={{ y: reduced ? 0 : portraitY }}
        >
          <motion.div
            className={styles.portrait}
            style={{ x: reduced ? 0 : x, y: reduced ? 0 : y }}
          >
            <div className={styles.portraitEntrance}>
              <Image
                src="/derived/andris-suit.webp"
                alt="Andris Peña"
                fill
                priority
                sizes="(max-width: 760px) 280px, (max-width: 1020px) 360px, 480px"
              />
            </div>
          </motion.div>
        </motion.div>
        <div className={styles.intro}>
          <p className={styles.promise}>{copy.promise}</p>
          <a className={styles.explore} href="#proyectos">
            <span>{t.explore}</span>
            <span className={styles.buttonArrow}>
              <ArrowUpRight size={22} aria-hidden="true" />
            </span>
          </a>
        </div>
        <div className={styles.advice}>
          <span className={styles.smallRule} aria-hidden="true" />
          <p>{copy.guidance}</p>
          <a className={styles.meet} href={`/sobre-mi?lang=${locale}`}>
            {t.meet}
            <ArrowUpRight size={19} aria-hidden="true" />
          </a>
        </div>
        <a className={styles.conversation} href={`/contacto?lang=${locale}`}>
          {t.talk}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
        <a
          className={styles.scroll}
          href="#proyectos"
          aria-label={`${t.scroll}: ${t.explore}`}
        >
          <ArrowDown size={25} aria-hidden="true" />
        </a>
      </div>
      <div className={styles.afterword}>
        <p>{copy.afterword}</p>
        <Link
          className={styles.projectLink}
          href={`/proyectos/melcon-paradise?lang=${locale}`}
          prefetch={false}
        >
          <span className={styles.projectPhoto}>
            <Image src="/derived/melcon-hero-small.webp" alt="" fill sizes="74px" />
          </span>
          <span className={styles.projectText}>
            <small>{copy.project}</small>
            <strong>Melcon Paradise</strong>
          </span>
          <ArrowUpRight size={21} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
