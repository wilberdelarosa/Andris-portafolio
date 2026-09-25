"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { type PropertyProject } from "@/content/projects";
import { journeyCopy } from "@/content/journey-copy";
import { useExperience } from "./experience-provider";
import "./journey.css";

const MapExplorer = dynamic(() => import("./map-explorer").then((module) => module.MapExplorer), { ssr: false });

export function ProjectMap({ project }: { project: PropertyProject }) {
  const { locale } = useExperience();
  const j = journeyCopy[locale];
  const preview = useRef<HTMLDivElement>(null);
  const nearViewport = useInView(preview, { once: true, margin: "300px" });
  return <section className="section project-location-section" id="ubicacion" aria-labelledby="project-location-title">
    <div className="journey-section-heading"><div><h2 id="project-location-title">{project.location}</h2><p>{j.mapIntro}</p></div><Link className="text-link" href={`/mapa?lang=${locale}&proyecto=${project.slug}`} prefetch={false}>{j.map}<ArrowUpRight size={20}/></Link></div>
    <div ref={preview}>
      {nearViewport ? <MapExplorer compact initialSlug={project.slug} /> : <div className="explorer-preview-placeholder"><p>{j.mapTitle}</p></div>}
    </div>
  </section>;
}
