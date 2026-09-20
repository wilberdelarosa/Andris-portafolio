"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowClockwise, ArrowUpRight, Check, Crosshair, Cube, MapPin, Minus, Plus, Stack, Panorama, Images } from "@phosphor-icons/react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { getPublishedProjects } from "@/content/projects";
import { discoveryCopy, projectTours } from "@/content/project-discovery";
import { mapExplorerCopy } from "@/content/map-copy";
import { journeyCopy } from "@/content/journey-copy";
import { useExperience } from "./experience-provider";
import { Photo } from "./ui";
import { ProjectMedia } from "./project-media";
import "./map-explorer.css";

const projects = getPublishedProjects().filter((project) => project.map.coordinates);
const MAP_LAYER_STORAGE = "andris-map-layer";
const MAP_TONE_STORAGE = "andris-map-tone";
let mapLibreWorkerConfigured = false;
// The maintained style includes road names, neighbourhoods, land use and POIs.
const mapStyle = "https://tiles.openfreemap.org/styles/bright";
const satelliteSource = {
  type: "raster" as const,
  tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
  tileSize: 256,
  maxzoom: 19,
  attribution: 'Imagery: <a href="https://www.esri.com/en-us/arcgis/products/arcgis-online/overview" target="_blank" rel="noopener noreferrer">Esri, Maxar, Earthstar Geographics</a>',
};
type SatelliteTone = "natural" | "vivid" | "nocturne";
const satelliteTones: Record<SatelliteTone, {
  opacity: number;
  contrast: number;
  saturation: number;
  brightnessMin: number;
  brightnessMax: number;
  hueRotate: number;
}> = {
  natural: { opacity: 0.96, contrast: 0.05, saturation: 0.08, brightnessMin: 0.04, brightnessMax: 1, hueRotate: 0 },
  vivid: { opacity: 0.98, contrast: 0.22, saturation: 0.34, brightnessMin: 0.03, brightnessMax: 1, hueRotate: 0 },
  nocturne: { opacity: 0.96, contrast: 0.18, saturation: -0.04, brightnessMin: 0.01, brightnessMax: 0.84, hueRotate: -8 },
};
const terrainSource = {
  type: "raster-dem" as const,
  tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
  tileSize: 256,
  maxzoom: 15,
  encoding: "terrarium" as const,
  attribution: 'Terrain: <a href="https://registry.opendata.aws/terrain-tiles/">Mapzen</a> · SRTM/GMTED2010: USGS · ETOPO1: NOAA',
};

function applyDimension(instance: MapLibreMap, enabled: boolean) {
  // No DEM downloads until the visitor deliberately chooses 3D.
  if (enabled && !instance.getSource("ap-terrain")) instance.addSource("ap-terrain", terrainSource);
  instance.setTerrain(enabled ? { source: "ap-terrain", exaggeration: 1 } : null);
  if (enabled && !instance.getLayer("ap-buildings")) {
    const firstLabel = instance.getStyle().layers.find((layer) => layer.type === "symbol")?.id;
    instance.addLayer({ id: "ap-buildings", type: "fill-extrusion", source: "openmaptiles", "source-layer": "building", minzoom: 13,
      paint: { "fill-extrusion-color": "#c5b79f", "fill-extrusion-height": ["coalesce", ["get", "render_height"], 0], "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0], "fill-extrusion-opacity": 0.85 } }, firstLabel);
  }
  if (instance.getLayer("ap-buildings")) instance.setLayoutProperty("ap-buildings", "visibility", enabled ? "visible" : "none");
}

function applySatellite(instance: MapLibreMap, enabled: boolean, tone: SatelliteTone) {
  if (enabled && !instance.getSource("ap-satellite")) {
    instance.addSource("ap-satellite", satelliteSource);
    const firstSymbol = instance.getStyle().layers.find((layer) => layer.type === "symbol")?.id;
    instance.addLayer({ id: "ap-satellite-layer", type: "raster", source: "ap-satellite", paint: {} }, firstSymbol);
  }
  if (!instance.getLayer("ap-satellite-layer")) return;
  instance.setLayoutProperty("ap-satellite-layer", "visibility", enabled ? "visible" : "none");
  if (!enabled) return;
  const values = satelliteTones[tone];
  instance.setPaintProperty("ap-satellite-layer", "raster-opacity", values.opacity);
  instance.setPaintProperty("ap-satellite-layer", "raster-contrast", values.contrast);
  instance.setPaintProperty("ap-satellite-layer", "raster-saturation", values.saturation);
  instance.setPaintProperty("ap-satellite-layer", "raster-brightness-min", values.brightnessMin);
  instance.setPaintProperty("ap-satellite-layer", "raster-brightness-max", values.brightnessMax);
  instance.setPaintProperty("ap-satellite-layer", "raster-hue-rotate", values.hueRotate);
}
const toLngLat = ([latitude, longitude]: [number, number]) => [longitude, latitude] as [number, number];
const projectBounds = () => {
  const coordinates = projects.map((project) => toLngLat(project.map.coordinates!));
  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);
  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ] as [[number, number], [number, number]];
};
const puntaCanaBounds = () => {
  const [[west, south], [east, north]] = projectBounds();
  return [
    [west - 0.08, south - 0.07],
    [east + 0.08, north + 0.07],
  ] as [[number, number], [number, number]];
};

/** One geographic view shared by the home preview and the independent map route. */
export function MapExplorer({ compact = false, initialSlug = "" }: { compact?: boolean; initialSlug?: string }) {
  const { locale, offline } = useExperience();
  const c = mapExplorerCopy[locale];
  const d = discoveryCopy[locale];
  const j = journeyCopy[locale];
  const reduced = useReducedMotion();
  const shouldReduce = reduced ?? false;
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef<Record<string, Marker>>({});
  const layersButton = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState(projects.find((project) => project.slug === initialSlug)?.slug ?? projects[0]?.slug ?? "");
  const [mapSelectionMode, setMapSelectionMode] = useState<"overview" | "focus">(initialSlug ? "focus" : "overview");
  const selectedRef = useRef(selected);
  const viewMode = useRef<"all" | "selected" | "free">(initialSlug ? "selected" : "all");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [muted, setMuted] = useState(false);
  const [satellite, setSatellite] = useState(true);
  const [satelliteTone, setSatelliteTone] = useState<SatelliteTone>("vivid");
  const satelliteRef = useRef(true);
  const satelliteToneRef = useRef<SatelliteTone>("vivid");
  const [mapPreferenceReady, setMapPreferenceReady] = useState(false);
  const [threeD, setThreeD] = useState(false);
  const threeDRef = useRef(false);
  const [media, setMedia] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect -- Post-hydration synchronization with prefers-reduced-motion; SSR must match static tree. */
  useEffect(() => {
    if (reduced) { setThreeD(false); threeDRef.current = false; }
  }, [reduced]);
  /* eslint-enable react-hooks/set-state-in-effect */
  const [layersOpen, setLayersOpen] = useState(false);
  const [retry, setRetry] = useState(0);
  const project = projects.find((item) => item.slug === selected) ?? projects[0];

  /* eslint-disable react-hooks/set-state-in-effect -- Hydrate an optional persisted map preference before creating MapLibre. */
  useEffect(() => {
    try {
      const storedLayer = window.localStorage.getItem(MAP_LAYER_STORAGE);
      const storedTone = window.localStorage.getItem(MAP_TONE_STORAGE);
      const nextSatellite = storedLayer !== "street";
      const nextTone = storedTone === "natural" || storedTone === "vivid" || storedTone === "nocturne" ? storedTone : "vivid";
      satelliteRef.current = nextSatellite;
      satelliteToneRef.current = nextTone;
      setSatellite(nextSatellite);
      setSatelliteTone(nextTone);
    } catch {
      // Private browsing or blocked storage keeps the premium satellite default.
    } finally {
      setMapPreferenceReady(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setSatelliteView = useCallback((next: boolean) => {
    satelliteRef.current = next;
    setSatellite(next);
    if (next) setMuted(false);
    try { window.localStorage.setItem(MAP_LAYER_STORAGE, next ? "satellite" : "street"); } catch { /* optional preference */ }
  }, []);

  const setSatelliteTreatment = useCallback((next: SatelliteTone) => {
    satelliteToneRef.current = next;
    setSatelliteTone(next);
    try { window.localStorage.setItem(MAP_TONE_STORAGE, next); } catch { /* optional preference */ }
  }, []);

  const fitAll = useCallback(() => {
    setMapSelectionMode("overview");
    if (!map.current || !projects.length) return;
    viewMode.current = "all";
    map.current.fitBounds(projectBounds(), { padding: 64, maxZoom: 14.5, duration: shouldReduce ? 0 : 550 });
  }, [shouldReduce]);

  const focus = useCallback((slug: string) => {
    setMapSelectionMode("focus");
    viewMode.current = "selected";
    setSelected(slug);
    selectedRef.current = slug;
    if (!compact) {
      const url = new URL(location.href);
      url.searchParams.set("proyecto", slug);
      history.replaceState(null, "", url);
    }
    const item = projects.find((project) => project.slug === slug);
    if (!item || !map.current) return;
    map.current.easeTo({ center: toLngLat(item.map.coordinates!), zoom: 15.2, duration: shouldReduce ? 0 : 550 });
  }, [compact, shouldReduce]);

  const toggleThreeD = useCallback(() => {
    const next = !threeDRef.current;
    // isStyleLoaded() becomes false while DEM tiles load. Do not trap the
    // visitor in 3D until those external requests finish.
    if (!map.current || status !== "ready") return;
    applyDimension(map.current, next);
    setThreeD(next);
    threeDRef.current = next;
    map.current?.easeTo({
      pitch: next ? 62 : 0,
      bearing: next ? -18 : 0,
      duration: shouldReduce ? 0 : 420,
    });
  }, [shouldReduce, status]);

  useEffect(() => {
    const slug = new URLSearchParams(location.search).get("proyecto");
    // Client query parameters are unavailable in the static export's initial HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (slug && projects.some((item) => item.slug === slug)) focus(slug);
  }, [focus]);

  useEffect(() => {
    if (!mapPreferenceReady || offline || !container.current || !projects.length) return;
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    import("maplibre-gl").then((maplibregl) => {
      const target = container.current;
      if (cancelled || !target || map.current) return;

      if (!mapLibreWorkerConfigured) {
        maplibregl.setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");
        mapLibreWorkerConfigured = true;
      }

      const instance = new maplibregl.Map({
        container: target,
        style: mapStyle,
        center: toLngLat(projects[0].map.coordinates!),
        zoom: 14,
        pitch: threeDRef.current ? 62 : 0,
        bearing: threeDRef.current ? -18 : 0,
        maxBounds: puntaCanaBounds(),
        minZoom: 11.5,
        maxZoom: 17.5,
        attributionControl: false,
        renderWorldCopies: false,
      });

      map.current = instance;
      instance.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      if (compact) instance.scrollZoom.disable();
      if (shouldReduce) {
        instance.dragRotate.disable();
        instance.touchZoomRotate.disableRotation();
      }
      instance.on("dragstart", () => { viewMode.current = "free"; });
      instance.on("error", (event) => {
        if ("sourceId" in event && event.sourceId === "ap-terrain") {
          instance.setTerrain(null);
          return;
        }
        // A single missing external tile must not cover a working map.
        if (!cancelled) setStatus((current) => current === "ready" ? current : "error");
      });
      instance.once("load", () => {
        if (!cancelled) {
          if (threeDRef.current) applyDimension(instance, true);
          applySatellite(instance, satelliteRef.current, satelliteToneRef.current);
          setStatus("ready");
        }
      });

      timeout = setTimeout(() => {
        if (!cancelled) setStatus((current) => current === "ready" ? current : "error");
      }, 12000);

      for (const item of projects) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = "ap-explorer-marker";
        element.setAttribute("aria-label", `${projectTours[item.slug] ? d.openTour : d.openPhotos}: ${item.name}`);
        element.setAttribute("aria-haspopup", "dialog");
        element.setAttribute("aria-pressed", String(item.slug === selectedRef.current));
        const pin = document.createElement("span");
        pin.className = "ap-explorer-pin";
        pin.setAttribute("aria-hidden", "true");
        const label = document.createElement("strong");
        label.textContent = item.slug.startsWith("the-beach") ? "The Beach" : item.name;
        element.append(pin, label);
        element.dataset.project = item.slug;
        element.addEventListener("click", () => { focus(item.slug); setMedia(true); });
        const marker = new maplibregl.Marker({ element, anchor: "bottom" })
          .setLngLat(toLngLat(item.map.coordinates!))
          .addTo(instance);
        markers.current[item.slug] = marker;
      }

      const requested = projects.find((item) => item.slug === selectedRef.current);
      if (viewMode.current === "selected" && requested) instance.jumpTo({ center: toLngLat(requested.map.coordinates!), zoom: 15.2 });
      else instance.fitBounds(projectBounds(), { padding: 64, maxZoom: 14.5, duration: 0 });

      observer = new ResizeObserver(() => {
        instance.resize();
        if (viewMode.current === "all") instance.fitBounds(projectBounds(), { padding: 64, maxZoom: 14.5, duration: 0 });
        if (viewMode.current === "selected") {
          const active = projects.find((item) => item.slug === selectedRef.current);
          if (active) instance.jumpTo({ center: toLngLat(active.map.coordinates!) });
        }
      });
      observer.observe(target);
    }).catch(() => { if (!cancelled) setStatus("error"); });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
      markers.current = {};
    };
  }, [c, d, compact, focus, initialSlug, mapPreferenceReady, offline, retry, shouldReduce]);

  useEffect(() => {
    if (!map.current || status !== "ready") return;
    applySatellite(map.current, satellite, satelliteTone);
  }, [satellite, satelliteTone, status]);

  useEffect(() => {
    for (const [slug, marker] of Object.entries(markers.current)) {
      const element = marker.getElement();
      element.classList.toggle("is-selected", slug === selected);
      element.setAttribute("aria-pressed", String(slug === selected));
      const hidden = mapSelectionMode === "focus" && slug !== selected;
      element.hidden = hidden;
      element.setAttribute("aria-hidden", String(hidden));
    }
  }, [mapSelectionMode, selected, status]);

  useEffect(() => {
    if (!layersOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLayersOpen(false);
        layersButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [layersOpen]);

  if (!project) return <p className="section">{j.noMatch}</p>;
  return (
    <div className={`explorer ${compact ? "explorer-compact" : ""}`}>
      <aside className="explorer-panel" aria-label={c.listLabel} data-lenis-prevent>
        <header className="explorer-panel-head"><h2>{c.title}</h2><p>{j.mapHelp}</p></header>
        <button type="button" className="explorer-overview" aria-pressed={mapSelectionMode === "overview"} onClick={fitAll}>
          <MapPin size={19} aria-hidden="true" />
          <span><strong>{c.overview}</strong><small>{c.overviewHint}</small></span>
          {mapSelectionMode === "overview" && <Check size={16} aria-hidden="true" />}
        </button>
        <div className="explorer-list" role="group" aria-label={j.select}>
          {projects.map((item) => <button key={item.slug} type="button" className="explorer-item" aria-label={c.select(item.name)} aria-pressed={selected === item.slug} onClick={() => focus(item.slug)}>
            <Photo src={item.hero} alt="" sizes="64px" />
            <span><strong>{item.name}</strong><small>{item.location.split("·")[0].trim()}</small></span>
            {selected === item.slug && <Check size={16} aria-hidden="true" />}
          </button>)}
        </div>
        <div className="explorer-selected" aria-live="polite" aria-atomic="true">
          <div className="explorer-selected-image"><Photo key={project.slug} src={project.hero} alt={project.gallery[0].alt[locale]} sizes="360px" /><span>{j.render}</span></div>
          <div className="explorer-selected-copy"><span className="explorer-location"><MapPin size={14} />{project.location}</span><h3>{project.name}</h3>
            <p>{project.bedrooms.length
              ? `${project.bedrooms.join(", ")} ${locale === "es" ? "habitaciones" : locale === "fr" ? "chambres" : "bedrooms"}${project.area.max > 0 ? ` · ${project.area.min}–${project.area.max} m²` : ""}`
              : j.pending}</p>
            <button type="button" className="button button-primary explorer-media-launch" onClick={() => setMedia(true)}>{projectTours[project.slug] ? <Panorama size={19} /> : <Images size={19} />}{projectTours[project.slug] ? d.openTour : d.openPhotos}</button>
            <Link className="explorer-google" href={`/proyectos/${project.slug}?lang=${locale}`} prefetch={false}>{c.open}<ArrowUpRight size={18} /></Link>
            <a className="explorer-google" href={project.map.url} target="_blank" rel="noopener noreferrer">{c.googleMaps}<ArrowUpRight size={16} /></a>
          </div>
        </div>
      </aside>
      <div className={`explorer-map-area ${muted ? "is-muted" : ""} ${satellite ? "is-satellite" : ""}`} data-lenis-prevent={compact ? undefined : true}>
        <div ref={container} className="explorer-canvas" role="region" aria-label={c.title} data-map-dimension={threeD ? "3d" : "2d"} data-map-layer={satellite ? "satellite" : "street"} data-map-ready={status === "ready"} />
        {(offline || status !== "ready") && <div className="explorer-blocker" role="status">
          <MapPin size={32} weight="light" /><p>{offline ? c.offline : status === "loading" ? j.loading : c.error}</p>
          {!offline && status === "error" && <button type="button" className="button button-primary" onClick={() => { setStatus("loading"); setRetry((value) => value + 1); }}><ArrowClockwise size={18} />{c.retry}</button>}
          {(offline || status === "error") && <a className="text-link" href={project.map.url} target="_blank" rel="noopener noreferrer">{c.googleMaps}<ArrowUpRight size={18} /></a>}
        </div>}
        <div className="explorer-controls">
          <div className="explorer-layers"><button ref={layersButton} type="button" className="explorer-button" aria-label={c.style} aria-expanded={layersOpen} onClick={() => setLayersOpen(!layersOpen)}><Stack size={21} /></button>
            {layersOpen && <div className="explorer-layer-menu" role="group" aria-label={c.style}>
              {[false, true].map((value) => <button type="button" key={String(value)} aria-pressed={muted === value && !satellite} onClick={() => { setMuted(value); setSatelliteView(false); setLayersOpen(false); layersButton.current?.focus(); }}>{value ? c.muted : c.detailed}{muted === value && !satellite && <Check size={16} />}</button>)}
              <div className="explorer-layer-divider" />
              <span className="explorer-layer-label">{c.satelliteView}</span>
              <button type="button" aria-pressed={satellite} onClick={() => { setSatelliteView(!satellite); setLayersOpen(false); layersButton.current?.focus(); }}>{satellite ? c.streetView : c.satelliteView}<span className="explorer-layer-action">{satellite ? <Check size={16} /> : <Panorama size={16} />}</span></button>
              {satellite && <div className="explorer-tone-picker" role="group" aria-label={c.satelliteTone}>
                <span className="explorer-layer-label">{c.satelliteTone}</span>
                {(["natural", "vivid", "nocturne"] as const).map((tone) => <button type="button" key={tone} className="explorer-tone" aria-pressed={satelliteTone === tone} onClick={() => setSatelliteTreatment(tone)}>{c[tone]}{satelliteTone === tone && <Check size={14} />}</button>)}
              </div>}
            </div>}
          </div>
          <button type="button" disabled={status !== "ready" || offline} className={`explorer-button explorer-view-toggle ${satellite ? "is-active" : ""}`} aria-label={satellite ? c.streetView : c.satelliteView} aria-pressed={satellite} title={satellite ? c.streetView : c.satelliteView} onClick={() => setSatelliteView(!satellite)}>{satellite ? <Panorama size={20} /> : <MapPin size={20} />}</button>
          <button type="button" disabled={status !== "ready" || offline} className="explorer-button explorer-3d-button" title={d.terrainNote} aria-label={threeD ? c.disable3d : c.enable3d} aria-pressed={threeD} onClick={toggleThreeD}><Cube size={19} /><span>{threeD ? "2D" : "3D"}</span></button>
          <button type="button" disabled={status !== "ready" || offline} className="explorer-button" aria-label={c.zoomIn} onClick={() => { viewMode.current = "free"; map.current?.zoomIn({ duration: shouldReduce ? 0 : 250 }); }}><Plus size={21} /></button>
          <button type="button" disabled={status !== "ready" || offline} className="explorer-button" aria-label={c.zoomOut} onClick={() => { viewMode.current = "free"; map.current?.zoomOut({ duration: shouldReduce ? 0 : 250 }); }}><Minus size={21} /></button>
          <button type="button" disabled={status !== "ready" || offline} className="explorer-button" aria-label={c.reset} onClick={fitAll}><Crosshair size={21} /></button>
        </div>
        <span className="explorer-dimension" aria-hidden="true"><Cube size={13} />{threeD ? c.threeD : c.flat}</span>
        <span className="explorer-privacy"><MapPin size={13} aria-hidden="true" />{c.puntaCanaOnly}</span>
      </div>
      {media && <ProjectMedia key={project.slug} project={project} open={media} onOpenChange={setMedia} />}
    </div>
  );
}
