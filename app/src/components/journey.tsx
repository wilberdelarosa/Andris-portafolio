"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Calculator, ChatCircle, MapPin } from "@phosphor-icons/react";
import { useExperience } from "./experience-provider";
import { journeyCopy } from "@/content/journey-copy";
import { editorialAccents } from "@/content/editorial-accents";
import { MapExplorer } from "./map-explorer";
import { Reveal } from "./ui";
import "./journey.css";
import {
  DecorativeLayer,
  DepthPanel,
  EditorialTitle,
  Magnetic,
  useSurfaceMotion,
  CharacterKicker,
  ArchitecturalCrosshair,
} from "./premium-motion";
import type { Locale } from "@/content/projects";

const MotionLink = motion.create(Link);

function JourneyActionTitle({ text, accent }: { text: string; accent: string }) {
  const split = text.lastIndexOf(accent);
  const lead = split < 0 ? text : text.slice(0, split).trimEnd();
  const emphasis = split < 0 ? "" : text.slice(split);
  return <h2 className="editorial-title editorial-title-compact journey-action-title" aria-label={text}>
    <span className="editorial-lead" aria-hidden="true">{lead}</span>
    {emphasis && <em className="editorial-accent" aria-hidden="true">{emphasis}</em>}
  </h2>;
}

export function HomeMap() {
  const { locale } = useExperience();
  const j = journeyCopy[locale];
  const preview = useRef<HTMLDivElement>(null);
  const nearViewport = useInView(preview, { once: true, margin: "300px" });
  return (
    <section className="section home-map" id="ubicacion" aria-labelledby="home-map-title">
      <DecorativeLayer variant="plan"/>
      <div className="journey-section-heading">
        <div>
          <CharacterKicker text={`02 / ${j.map}`} delay={0.06} />
          <EditorialTitle id="home-map-title" text={j.mapTitle} accent={editorialAccents[locale].map}/>
          <Reveal delay={0.12} distance={18}>
            <p>{j.mapIntro}</p>
          </Reveal>
        </div>
        <Reveal delay={0.2} distance={20}>
          <Link className="text-link" href={`/mapa?lang=${locale}`} prefetch={false}>
            <MapPin size={19}/>{j.map}<ArrowUpRight size={19}/>
          </Link>
        </Reveal>
      </div>
      <div ref={preview} style={{ position: "relative" }}>
        <ArchitecturalCrosshair position="top-left" />
        <ArchitecturalCrosshair position="top-right" />
        {nearViewport ? <MapExplorer compact /> : <div className="explorer-preview-placeholder"><MapPin size={28} /><p>{j.mapTitle}</p><Link className="text-link" href={`/mapa?lang=${locale}`} prefetch={false}>{j.map}<ArrowUpRight size={18} /></Link></div>}
      </div>
    </section>
  );
}

export function AdvisorPreview() {
  const { locale } = useExperience();
  const j = journeyCopy[locale];
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const portraitY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const sceneryScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  return (
    <section ref={ref} className="section advisor-preview" id="sobre-mi" aria-labelledby="advisor-preview-title">
      <DepthPanel>
        <div className="advisor-preview-image">
          <ArchitecturalCrosshair position="top-left" />
          <motion.div className="advisor-preview-depth" style={{ scale: reduced ? 1 : sceneryScale }}>
            <Image src="/derived/hero-atmosphere-v3.webp" alt="" fill sizes="(max-width: 760px) 95vw, 45vw" className="advisor-preview-backdrop"/>
          </motion.div>
          <motion.div className="advisor-preview-depth" data-portrait-depth style={{ y: reduced ? 0 : portraitY }}>
            <Image src="/derived/andris-white-shirt.webp" alt="Andris Peña, asesor inmobiliario" fill unoptimized sizes="(max-width: 760px) 80vw, 440px" className="advisor-preview-portrait"/>
          </motion.div>
          <DecorativeLayer/>
          <span className="advisor-preview-signature" aria-hidden="true">Andris Peña</span>
        </div>
      </DepthPanel>
      <div className="advisor-preview-copy">
        <CharacterKicker text={`04 / ${j.about}`} delay={0.06} />
        <EditorialTitle id="advisor-preview-title" text={j.about} accent={editorialAccents[locale].about}/>
        <Reveal delay={0.12} distance={20}>
          <p>{j.aboutText}</p>
        </Reveal>
        <Reveal delay={0.22} distance={20}>
          <Magnetic strength={0.2}>
            <Link className="button button-primary" href={`/sobre-mi?lang=${locale}`} prefetch={false}>
              {j.aboutAction}<ArrowUpRight size={20}/>
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

function CalculatorCard({ locale }: { locale: Locale }) {
  const j = journeyCopy[locale];
  const surface = useSurfaceMotion(2.4);
  const reduced = useReducedMotion();
  return (
    <MotionLink
      {...surface.bindings}
      className="journey-calculator"
      id="inversion"
      href={`/calculadora?lang=${locale}`}
      prefetch={false}
      initial={reduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.25, once: false }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <ArchitecturalCrosshair position="top-right" />
      <Calculator size={29} weight="light"/>
      <div>
        <JourneyActionTitle text={j.calculator} accent={editorialAccents[locale].calculator}/>
        <p>{j.calculatorText}</p>
        <span>
          {j.calculatorAction}
          <Magnetic strength={0.3}>
            <ArrowUpRight size={21}/>
          </Magnetic>
        </span>
      </div>
      <motion.span className="surface-light" style={surface.glowStyle} aria-hidden="true"/>
    </MotionLink>
  );
}

function ContactCard({ locale, projectSlug }: { locale: Locale; projectSlug?: string }) {
  const j = journeyCopy[locale];
  const surface = useSurfaceMotion(2.4);
  const reduced = useReducedMotion();
  return (
    <MotionLink
      {...surface.bindings}
      className="journey-contact"
      id="contacto"
      href={`/contacto?lang=${locale}${projectSlug ? `&proyecto=${projectSlug}` : ""}`}
      prefetch={false}
      initial={reduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.25, once: false }}
      transition={{ duration: 0.7, delay: reduced ? 0 : 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <ArchitecturalCrosshair position="top-right" />
      <span className="journey-contact-orbit journey-contact-orbit-one" aria-hidden="true"/>
      <span className="journey-contact-orbit journey-contact-orbit-two" aria-hidden="true"/>
      <span className="journey-contact-portrait" aria-hidden="true">
        <Image src="/derived/andris-suit.webp" alt="" fill unoptimized sizes="(max-width: 760px) 68vw, 35vw" className="journey-contact-portrait-image"/>
      </span>
      <ChatCircle size={29} weight="light"/>
      <div>
        <JourneyActionTitle text={j.contact} accent={editorialAccents[locale].contact}/>
        <p>{j.contactText}</p>
        <span>
          {j.contactAction}
          <Magnetic strength={0.3}>
            <ArrowUpRight size={21}/>
          </Magnetic>
        </span>
      </div>
      <motion.span className="surface-light" style={surface.glowStyle} aria-hidden="true"/>
    </MotionLink>
  );
}

export function JourneyActions({ projectSlug }: { projectSlug?: string }) {
  const { locale } = useExperience();
  const j = journeyCopy[locale];
  return (
    <section className="section journey-actions-wrap" aria-label={j.overview}>
      <CharacterKicker text={`05 / ${j.overview}`} delay={0.06} />
      <div className="journey-actions">
        <CalculatorCard locale={locale} />
        <ContactCard locale={locale} projectSlug={projectSlug} />
      </div>
    </section>
  );
}

export function RouteHeading({ kind }: { kind: "aboutPage" | "contactPage" | "investmentPage" }) {
  const { locale } = useExperience();
  return <div className="route-heading"><Link href={`/?lang=${locale}`} prefetch={false}>Andris Peña</Link><span aria-hidden="true">/</span><h1>{journeyCopy[locale][kind]}</h1></div>;
}
