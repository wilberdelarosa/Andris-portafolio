"use client";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { melcon, type PropertyProject } from "@/content/projects";
import { journeyCopy } from "@/content/journey-copy";
import { useExperience } from "./experience-provider";
import { MapExplorer } from "./map-explorer";
import "./journey.css";

export function ProjectMap({ project = melcon }: { project?: PropertyProject }) {
  const { locale } = useExperience();
  const j = journeyCopy[locale];
  return <section className="section project-location-section" id="ubicacion" aria-labelledby="project-location-title">
    <div className="journey-section-heading"><div><h2 id="project-location-title">{project.location}</h2><p>{j.mapIntro}</p></div><Link className="text-link" href={`/mapa?lang=${locale}&proyecto=${project.slug}`}>{j.map}<ArrowUpRight size={20}/></Link></div>
    <MapExplorer compact initialSlug={project.slug} />
  </section>;
}
