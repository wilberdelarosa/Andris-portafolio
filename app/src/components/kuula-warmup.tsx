"use client";

import { useEffect, useMemo, useState } from "react";
import { projectTours } from "@/content/project-discovery";

function warmupUrl() {
  const tour = projectTours["terra-serena"];
  const scene = tour?.scenes[0];
  if (!tour || !scene) return "";
  return `https://kuula.co/share/${scene.id}/collection/${tour.collection}?fs=1&vr=0&zoom=1&sd=1&thumbs=1&chromeless=0&logo=1&autorotate=0&initload=1`;
}

export function KuulaWarmup() {
  const src = useMemo(() => warmupUrl(), []);
  const [online, setOnline] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const refresh = () => setOnline(navigator.onLine);
    const detect = window.setTimeout(refresh, 0);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    return () => {
      window.clearTimeout(detect);
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
    };
  }, []);

  useEffect(() => {
    if (!src || !online) return;
    const connection = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    if (connection.connection?.saveData) return;
    const idle = window.setTimeout(() => setEnabled(true), 2500);
    return () => window.clearTimeout(idle);
  }, [online, src]);

  if (!enabled || !online || !src) return null;

  return (
    <iframe
      className="kuula-warmup-frame"
      title="Precarga 360 Terra Serena"
      src={src}
      aria-hidden="true"
      tabIndex={-1}
      loading="eager"
      allow="xr-spatial-tracking; gyroscope; accelerometer"
      allowFullScreen
      scrolling="no"
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() => {
        document.documentElement.dataset.kuulaWarmup = "ready";
      }}
    />
  );
}
