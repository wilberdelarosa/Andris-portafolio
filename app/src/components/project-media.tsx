"use client";

import { useEffect, useState } from "react";
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Panorama,
  Images,
  MapPin,
} from "@phosphor-icons/react";
import type { PropertyProject } from "@/content/projects";
import { discoveryCopy, projectTours } from "@/content/project-discovery";
import { useExperience } from "./experience-provider";
import { Modal, Photo } from "./ui";
import { useProjects } from "./projects-provider";
import { getPublicProjectName } from "@/lib/public-project-label";
import "./project-media.css";

function kuulaSceneUrl(sceneId: string, collection: string, embed = true) {
  const url = `https://kuula.co/share/${sceneId}/collection/${collection}`;
  return embed
    ? `${url}?fs=1&vr=0&zoom=1&sd=1&thumbs=1&chromeless=0&logo=1&autorotate=0`
    : url;
}

function TourFrame({
  src,
  directUrl,
  onPhotos,
}: {
  src: string;
  directUrl: string;
  onPhotos: () => void;
}) {
  const { locale } = useExperience();
  const c = discoveryCopy[locale];
  const [loaded, setLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const loadingTimer = setTimeout(() => setShowLoading(false), 7000);
    const fallbackTimer = setTimeout(() => setShowFallback(true), 12000);
    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <>
      {showLoading && !loaded && (
        <p className="tour-load-status" role="status">
          {c.loading}
        </p>
      )}
      <iframe
        className="project-tour-frame"
        src={src}
        title={`${c.tour} · Terra Serena`}
        loading="eager"
        allow="xr-spatial-tracking; gyroscope; accelerometer"
        allowFullScreen
        scrolling="no"
        referrerPolicy="strict-origin-when-cross-origin"
        data-loaded={loaded ? "true" : "false"}
        onLoad={() => {
          setLoaded(true);
          setShowLoading(false);
        }}
      />
      {showFallback && !loaded && (
        <div className="tour-fallback-panel" role="note">
          <p>{c.unavailable}</p>
          <div>
            <a
              className="button button-primary"
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {c.external}
              <ArrowUpRight size={16} />
            </a>
            <button
              type="button"
              className="button button-outline"
              onClick={onPhotos}
            >
              {c.openPhotos}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function ProjectMedia({
  project,
  open,
  onOpenChange,
  initialView = "tour",
}: {
  project: PropertyProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: "tour" | "photos";
}) {
  const { locale, offline, hideProjectNames } = useExperience();
  const { projects } = useProjects();
  const c = discoveryCopy[locale];
  const displayName = getPublicProjectName(project, Math.max(0, projects.findIndex((item) => item.slug === project.slug)), hideProjectNames, locale);
  const tour = projectTours[project.slug];
  const [view, setView] = useState(tour ? initialView : "photos");
  const [photo, setPhoto] = useState(0);
  const [scene, setScene] = useState(0);
  const [retry, setRetry] = useState(0);
  const selectedScene = tour?.scenes[scene];
  const changePhoto = (direction: number) =>
    setPhoto(
      (value) =>
        (value + direction + project.gallery.length) % project.gallery.length,
    );
  const frameSrc =
    tour && selectedScene
      ? kuulaSceneUrl(selectedScene.id, tour.collection)
      : "";
  const directTourUrl =
    tour && selectedScene
      ? kuulaSceneUrl(selectedScene.id, tour.collection, false)
      : tour?.url || "";
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={displayName}
      className="project-media-modal"
    >
      <div className="project-media-toolbar">
        <div
          className="project-media-switch"
          role="group"
          aria-label={
            locale === "es"
              ? "Vista del proyecto"
              : locale === "fr"
                ? "Vue du projet"
                : "Project view"
          }
        >
          <button
            type="button"
            aria-pressed={view === "photos"}
            onClick={() => setView("photos")}
          >
            <Images size={18} />
            {c.photos}
          </button>
          {tour && (
            <button
              type="button"
              aria-pressed={view === "tour"}
              onClick={() => setView("tour")}
            >
              <Panorama size={18} />
              {c.tour}
            </button>
          )}
        </div>
        {tour && view === "tour" && (
          <a
            className="text-link"
            href={directTourUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.external}
            <ArrowUpRight size={16} />
          </a>
        )}
      </div>
      <div
        className="project-media-stage"
        data-view={view}
        onKeyDown={(event) => {
          if (view !== "photos") return;
          if (event.key === "ArrowRight") {
            event.preventDefault();
            changePhoto(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            changePhoto(-1);
          }
        }}
      >
        {view === "tour" && tour ? (
          offline ? (
            <div className="project-media-offline">
              <p>{c.offline}</p>
              <button
                className="button button-primary"
                onClick={() => setView("photos")}
              >
                {c.openPhotos}
              </button>
            </div>
          ) : (
            open && (
              <TourFrame
                key={`${scene}-${retry}`}
                src={frameSrc}
                directUrl={directTourUrl}
                onPhotos={() => setView("photos")}
              />
            )
          )
        ) : (
          <>
            <Photo
              key={photo}
              src={project.gallery[photo].src}
              alt={project.gallery[photo].alt[locale]}
              sizes="(max-width: 760px) 100vw, 1100px"
              priority
            />
            <button
              type="button"
              className="media-prev icon-button"
              aria-label={c.previous}
              onClick={() => changePhoto(-1)}
            >
              <ArrowLeft size={22} />
            </button>
            <button
              type="button"
              className="media-next icon-button"
              aria-label={c.next}
              onClick={() => changePhoto(1)}
            >
              <ArrowRight size={22} />
            </button>
          </>
        )}
      </div>
      {view === "tour" && tour ? (
        <div className="project-tour-controls">
          <label>
            {c.scenes}
            <select
              value={scene}
              onChange={(event) => setScene(Number(event.target.value))}
            >
              {tour.scenes.map((item, index) => (
                <option value={index} key={item.id}>
                  {item.title[locale]}
                </option>
              ))}
            </select>
          </label>
          <p>{c.tourHelp}</p>
          <button
            type="button"
            className="icon-button"
            aria-label={c.retry}
            title={c.retry}
            onClick={() => setRetry((value) => value + 1)}
          >
            <ArrowClockwise size={21} />
          </button>
        </div>
      ) : (
        <div
          className="project-media-thumbnails"
          role="group"
          aria-label={c.photos}
        >
          {project.gallery.map((item, index) => (
            <button
              type="button"
              key={item.src}
              aria-label={item.alt[locale]}
              aria-pressed={photo === index}
              onClick={() => setPhoto(index)}
            >
              <Photo src={item.src} alt="" sizes="88px" />
            </button>
          ))}
        </div>
      )}
      <p className="project-media-caption">
        {view === "photos" ? `${photo + 1}/${project.gallery.length} · ` : ""}
        {c.renders}
      </p>
    </Modal>
  );
}

export function ProjectTourButton({ project }: { project: PropertyProject }) {
  const { locale } = useExperience();
  const [open, setOpen] = useState(false);
  const hasTour = !!projectTours[project.slug];
  const hasMapUrl = !!project.map?.url;

  if (!hasTour && !hasMapUrl) return null;

  if (hasTour) {
    return (
      <>
        <button
          type="button"
          className="button button-outline project-tour-launch"
          onClick={() => setOpen(true)}
        >
          <Panorama size={22} />
          {discoveryCopy[locale].openTour}
          <ArrowUpRight size={18} />
        </button>
        {open && (
          <ProjectMedia project={project} open={open} onOpenChange={setOpen} />
        )}
      </>
    );
  }

  return (
    <a
      className="button button-outline project-tour-launch"
      href={project.map.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <MapPin size={22} />
      {locale === "es" ? "Ver en Mapa / 360" : locale === "fr" ? "Voir sur la Carte / 360" : "View on Map / 360"}
      <ArrowUpRight size={18} />
    </a>
  );
}
