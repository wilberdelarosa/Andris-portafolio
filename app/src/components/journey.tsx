"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Calculator, ChatCircle, MapPin } from "@phosphor-icons/react";
import { useExperience } from "./experience-provider";
import { journeyCopy } from "@/content/journey-copy";
import { editorialAccents } from "@/content/editorial-accents";
import { MapExplorer } from "./map-explorer";
import { Reveal } from "./ui";
import "./journey.css";
import { DecorativeLayer, DepthPanel, EditorialTitle } from "./premium-motion";

export function HomeMap() {
  const { locale } = useExperience();
  const j = journeyCopy[locale];
  return <section className="section home-map" id="ubicacion" aria-labelledby="home-map-title">
    <DecorativeLayer variant="plan"/>
    <div className="journey-section-heading"><div><EditorialTitle id="home-map-title" text={j.mapTitle} accent={editorialAccents[locale].map}/><p>{j.mapIntro}</p></div><Link className="text-link" href={`/mapa?lang=${locale}`}><MapPin size={19}/>{j.map}<ArrowUpRight size={19}/></Link></div>
    <MapExplorer compact />
  </section>;
}

export function AdvisorPreview() {
  const { locale } = useExperience();
  const j = journeyCopy[locale];
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const portraitY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const sceneryScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  return <section ref={ref} className="section advisor-preview" id="sobre-mi" aria-labelledby="advisor-preview-title">
    <DepthPanel><div className="advisor-preview-image">
      <motion.div className="advisor-preview-depth" style={{ scale: reduced ? 1 : sceneryScale }}><Image src="/derived/hero-atmosphere-v3.webp" alt="" fill sizes="(max-width: 760px) 95vw, 45vw" className="advisor-preview-backdrop"/></motion.div>
      <motion.div className="advisor-preview-depth" data-portrait-depth style={{ y: reduced ? 0 : portraitY }}><Image src="/derived/andris-white-shirt.webp" alt="Andris Peña, asesor inmobiliario" fill unoptimized sizes="(max-width: 760px) 80vw, 440px" className="advisor-preview-portrait"/></motion.div>
      <DecorativeLayer/>
      <span className="advisor-preview-signature" aria-hidden="true">Andris Peña</span>
    </div></DepthPanel>
    <Reveal className="advisor-preview-copy"><EditorialTitle id="advisor-preview-title" text={j.about} accent={editorialAccents[locale].about}/><p>{j.aboutText}</p><Link className="button button-primary" href={`/sobre-mi?lang=${locale}`}>{j.aboutAction}<ArrowUpRight size={20}/></Link></Reveal>
  </section>;
}

export function JourneyActions({ projectSlug }: { projectSlug?: string }) {
  const { locale } = useExperience();
  const j = journeyCopy[locale];
  return <section className="section journey-actions" aria-label={j.overview}>
    <Link className="journey-calculator" id="inversion" href={`/calculadora?lang=${locale}`}><Calculator size={29} weight="light"/><div><EditorialTitle compact text={j.calculator} accent={editorialAccents[locale].calculator}/><p>{j.calculatorText}</p><span>{j.calculatorAction}<ArrowUpRight size={21}/></span></div></Link>
    <Link className="journey-contact" id="contacto" href={`/contacto?lang=${locale}${projectSlug ? `&proyecto=${projectSlug}` : ""}`}><ChatCircle size={29} weight="light"/><div><EditorialTitle compact text={j.contact} accent={editorialAccents[locale].contact}/><p>{j.contactText}</p><span>{j.contactAction}<ArrowUpRight size={21}/></span></div></Link>
  </section>;
}

export function RouteHeading({ kind }: { kind: "aboutPage" | "contactPage" | "investmentPage" }) {
  const { locale } = useExperience();
  return <div className="route-heading"><Link href={`/?lang=${locale}`}>Andris Peña</Link><span aria-hidden="true">/</span><h1>{journeyCopy[locale][kind]}</h1></div>;
}
