"use client";
import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  ArrowUpRight,
  ArrowClockwise,
  Plus,
} from "@phosphor-icons/react";
import type { Map as LeafletMap } from "leaflet";
import { designCopy } from "@/content/design-copy";
import { melcon } from "@/content/projects";
import { useExperience } from "./experience-provider";
import { Reveal } from "./ui";
import "./project-map.css";

export function ProjectMap() {
  const { t, offline, locale } = useExperience();
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  useEffect(() => {
    if (!activated || offline || !container.current) return;
    let cancelled = false;
    import("leaflet")
      .then((L) => {
        if (cancelled || !container.current || map.current) return;
        const point = melcon.map.coordinates!;
        const instance = L.map(container.current, {
          scrollWheelZoom: false,
          zoomControl: false,
          minZoom: 5,
          maxZoom: 18,
          attributionControl: true,
        }).setView(point, 14);
        map.current = instance;
        L.control
          .zoom({
            zoomInTitle:
              locale === "es"
                ? "Acercar"
                : locale === "fr"
                  ? "Zoom avant"
                  : "Zoom in",
            zoomOutTitle:
              locale === "es"
                ? "Alejar"
                : locale === "fr"
                  ? "Zoom arrière"
                  : "Zoom out",
          })
          .addTo(instance);
        const tiles = L.tileLayer(
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
            maxZoom: 19,
          },
        );
        tiles.on("tileerror", () => {
          if (!cancelled) setError(true);
        });
        tiles.addTo(instance);
        const pin = L.divIcon({
          className: "ap-map-marker",
          html: '<span class="ap-pin-dot"></span><span class="ap-pin-name">Melcon Paradise</span>',
          iconSize: [160, 48],
          iconAnchor: [15, 25],
        });
        L.marker(point, {
          icon: pin,
          title: `Melcon Paradise · ${t.mapPin}`,
          alt: t.mapPin,
          keyboard: true,
        })
          .addTo(instance)
          .bindPopup(
            "<strong>Melcon Paradise</strong><br>Vista Cana · Punta Cana",
          );
        instance.invalidateSize();
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [activated, offline, retry, locale, t.mapPin]);
  return (
    <section className="section map-section" id="ubicacion">
      <Reveal className="map-copy">
        <h2>{designCopy[locale].mapTitle}</h2>
        <p className="map-description">{t.mapDescription}</p>
        <div className="map-location">
          <MapPin size={19} />
          <div>
            <strong>Melcon Paradise</strong>
            <span>Vista Cana · Punta Cana</span>
          </div>
        </div>
        <a
          className="text-link"
          href={melcon.map.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.openMap}
          <ArrowUpRight size={19} />
        </a>
      </Reveal>
      <Reveal className="map-panel">
        {activated && !offline ? (
          <>
            <div
              className="live-map"
              ref={container}
              aria-label={`${t.mapPin}: Melcon Paradise`}
            />
            {error && (
              <div className="map-error" role="status">
                <span>
                  {locale === "es"
                    ? "No se pudo cargar parte del mapa."
                    : locale === "en"
                      ? "Part of the map could not be loaded."
                      : "Une partie de la carte n’a pas pu être chargée."}
                </span>
                <button
                  className="text-button"
                  onClick={() => {
                    setError(false);
                    setRetry(retry + 1);
                  }}
                >
                  <ArrowClockwise size={16} />
                  {t.retry}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="map-preview">
            <div className="map-grid" aria-hidden="true">
              <div className="map-road road-one" />
              <div className="map-road road-two" />
              <div className="map-road road-three" />
              <div className="map-area area-one" />
              <div className="map-area area-two" />
              <span className="map-coordinate coord-one">18.637918° N</span>
              <span className="map-coordinate coord-two">68.444033° W</span>
              <span className="map-north">
                N<Plus size={16} />
              </span>
            </div>
            <button
              className="activate-map"
              onClick={() => {
                setError(false);
                setActivated(true);
              }}
              disabled={offline}
            >
              <span className="map-pin-ring">
                <MapPin size={28} weight="fill" />
              </span>
              <strong>Melcon Paradise</strong>
              <span>
                {t.loadMap}
                <ArrowUpRight size={15} />
              </span>
            </button>
            <p className="map-consent">
              {offline ? t.mapUnavailable : t.mapPrivacy}
            </p>
          </div>
        )}
      </Reveal>
    </section>
  );
}
