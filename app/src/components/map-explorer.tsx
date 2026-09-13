"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowClockwise, ArrowUpRight, Crosshair, MapPin, Minus, Plus, Stack, Check } from "@phosphor-icons/react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { getPublishedProjects } from "@/content/projects";
import { mapExplorerCopy } from "@/content/map-copy";
import { journeyCopy } from "@/content/journey-copy";
import { useExperience } from "./experience-provider";
import { Photo } from "./ui";
import "./map-explorer.css";

const projects = getPublishedProjects().filter((project) => project.map.coordinates);

/** One geographic view shared by the home preview and the independent map route. */
export function MapExplorer({ compact = false, initialSlug = "" }: { compact?: boolean; initialSlug?: string }) {
  const { locale, offline } = useExperience();
  const c = mapExplorerCopy[locale];
  const j = journeyCopy[locale];
  const reduced = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<Record<string, Marker>>({});
  const layersButton = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState(projects.find((p) => p.slug === initialSlug)?.slug ?? projects[0]?.slug ?? "");
  const selectedRef = useRef(selected);
  const viewMode = useRef<"all" | "selected" | "free">(initialSlug ? "selected" : "all");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [muted, setMuted] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [retry, setRetry] = useState(0);
  const project = projects.find((p) => p.slug === selected) ?? projects[0];

  const fitAll = useCallback(() => {
    if (!map.current || !projects.length) return;
    viewMode.current = "all";
    map.current.fitBounds(projects.map((p) => p.map.coordinates!), { padding: [55, 55], maxZoom: 14, animate: !reduced });
  }, [reduced]);

  const focus = useCallback((slug: string) => {
    viewMode.current = "selected";
    setSelected(slug);
    selectedRef.current = slug;
    if (!compact) {
      const url = new URL(location.href);
      url.searchParams.set("proyecto", slug);
      history.replaceState(null, "", url);
    }
    const item = projects.find((p) => p.slug === slug);
    if (!item || !map.current) return;
    map.current.flyTo(item.map.coordinates!, 15, { animate: !reduced, duration: reduced ? 0 : .55 });
  }, [compact, reduced]);

  useEffect(() => {
    if (offline || !container.current || !projects.length) return;
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    import("leaflet").then((L) => {
      if (cancelled || !container.current || map.current) return;
      const instance = L.map(container.current, {
        scrollWheelZoom: !compact, zoomControl: false, attributionControl: true,
        minZoom: 5, maxZoom: 18, keyboard: true, zoomAnimation: !reduced, fadeAnimation: !reduced,
      });
      map.current = instance;
      instance.on("dragstart", () => { viewMode.current = "free"; });
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>', maxZoom: 19,
      });
      let loaded = 0;
      tiles.on("tileload", () => { loaded++; if (!cancelled) setStatus("ready"); });
      tiles.on("load", () => { if (!cancelled) setStatus(loaded ? "ready" : "error"); });
      tiles.addTo(instance);
      timeout = setTimeout(() => { if (!cancelled && !loaded) setStatus("error"); }, 12000);
      for (const item of projects) {
        const icon = L.divIcon({ className: "ap-explorer-marker", html: '<span class="ap-explorer-pin"><span></span></span>', iconSize: [44, 44], iconAnchor: [22, 40] });
        const marker = L.marker(item.map.coordinates!, { icon, title: item.name, alt: item.name, keyboard: true }).addTo(instance);
        marker.on("click", () => focus(item.slug));
        markers.current[item.slug] = marker;
      }
      const requested = projects.find((p) => p.slug === selectedRef.current);
      if (initialSlug && requested) instance.setView(requested.map.coordinates!, 15);
      else instance.fitBounds(projects.map((p) => p.map.coordinates!), { padding: [55, 55], maxZoom: 14 });
      observer = new ResizeObserver(() => {
        instance.invalidateSize({ animate: false });
        if (viewMode.current === "all") {
          instance.fitBounds(projects.map((p) => p.map.coordinates!), { padding: [55, 55], maxZoom: 14, animate: false });
        } else if (viewMode.current === "selected") {
          const active = projects.find((p) => p.slug === selectedRef.current);
          if (active) instance.panTo(active.map.coordinates!, { animate: false });
        }
      });
      observer.observe(container.current);
    }).catch(() => { if (!cancelled) setStatus("error"); });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
      markers.current = {};
    };
  }, [offline, retry, compact, focus, initialSlug, reduced]);

  useEffect(() => {
    for (const [slug, marker] of Object.entries(markers.current)) {
      const element = marker.getElement();
      element?.querySelector(".ap-explorer-pin")?.classList.toggle("is-selected", slug === selected);
      element?.setAttribute("aria-pressed", String(slug === selected));
    }
  }, [selected, status]);

  useEffect(() => {
    if (!layersOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setLayersOpen(false); layersButton.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [layersOpen]);

  if (!project) return <p className="section">{j.noMatch}</p>;
  return (
    <div className={`explorer ${compact ? "explorer-compact" : ""}`}>
      <aside className="explorer-panel" aria-label={c.listLabel}>
        <header className="explorer-panel-head"><h2>{c.title}</h2><p>{j.mapHelp}</p></header>
        <div className="explorer-list" role="group" aria-label={j.select}>
          {projects.map((item) => <button key={item.slug} type="button" className="explorer-item" aria-label={c.select(item.name)} aria-pressed={selected === item.slug} onClick={() => focus(item.slug)}>
            <Photo src={item.hero} alt="" sizes="64px"/>
            <span><strong>{item.name}</strong><small>{item.location.split("·")[0].trim()}</small></span>
            {selected === item.slug && <Check size={16} aria-hidden="true"/>}
          </button>)}
        </div>
        <div className="explorer-selected" aria-live="polite" aria-atomic="true">
          <div className="explorer-selected-image"><Photo key={project.slug} src={project.hero} alt={project.gallery[0].alt[locale]} sizes="360px"/><span>{j.render}</span></div>
          <div className="explorer-selected-copy"><span className="explorer-location"><MapPin size={14}/>{project.location}</span><h3>{project.name}</h3>
            <p>{project.bedrooms.length ? `${project.bedrooms.join(", ")} ${locale === "es" ? "habitaciones" : locale === "fr" ? "chambres" : "bedrooms"} · ${project.area.min}–${project.area.max} m²` : j.pending}</p>
            <Link className="button button-primary" href={`/proyectos/${project.slug}?lang=${locale}`}>{c.open}<ArrowUpRight size={18}/></Link>
            <a className="explorer-google" href={project.map.url} target="_blank" rel="noopener noreferrer">{c.googleMaps}<ArrowUpRight size={16}/></a>
          </div>
        </div>
      </aside>
      <div className={`explorer-map-area ${muted ? "is-muted" : ""}`}>
        <div ref={container} className="explorer-canvas" role="region" aria-label={c.title}/>
        {(offline || status !== "ready") && <div className="explorer-blocker" role="status">
          <MapPin size={32} weight="light"/><p>{offline ? c.offline : status === "loading" ? j.loading : c.error}</p>
          {!offline && status === "error" && <button type="button" className="button button-primary" onClick={() => { setStatus("loading"); setRetry((n) => n + 1); }}><ArrowClockwise size={18}/>{c.retry}</button>}
          {(offline || status === "error") && <a className="text-link" href={project.map.url} target="_blank" rel="noopener noreferrer">{c.googleMaps}<ArrowUpRight size={18}/></a>}
        </div>}
        <div className="explorer-controls">
          <div className="explorer-layers"><button ref={layersButton} type="button" className="explorer-button" aria-label={c.style} aria-expanded={layersOpen} onClick={() => setLayersOpen(!layersOpen)}><Stack size={21}/></button>
            {layersOpen && <div className="explorer-layer-menu" role="group" aria-label={c.style}>{[false, true].map((value) => <button type="button" key={String(value)} aria-pressed={muted === value} onClick={() => { setMuted(value); setLayersOpen(false); layersButton.current?.focus(); }}>{value ? c.muted : c.detailed}{muted === value && <Check size={16}/>}</button>)}</div>}
          </div>
          <button type="button" disabled={status !== "ready" || offline} className="explorer-button" aria-label={c.zoomIn} onClick={() => { viewMode.current = "free"; map.current?.zoomIn(); }}><Plus size={21}/></button>
          <button type="button" disabled={status !== "ready" || offline} className="explorer-button" aria-label={c.zoomOut} onClick={() => { viewMode.current = "free"; map.current?.zoomOut(); }}><Minus size={21}/></button>
          <button type="button" disabled={status !== "ready" || offline} className="explorer-button" aria-label={c.reset} onClick={fitAll}><Crosshair size={21}/></button>
        </div>
        <span className="explorer-privacy">{c.privacy}</span>
      </div>
    </div>
  );
}
