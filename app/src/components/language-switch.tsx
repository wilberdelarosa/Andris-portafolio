"use client";

/**
 * Selector de idioma de la cabecera.
 *
 * Sustituye al `<select>` nativo que el cliente rechazó ("ese cuadro de
 * selección no le gusta"). Sigue el lenguaje visual del botón de ajustes que
 * vive justo al lado: redondo, semitransparente, con un estado claro al
 * pulsarlo y mientras está abierto.
 *
 * Sobre banderas: no se usan a propósito. Una bandera nombra un país, no un
 * idioma. Este sitio vende en República Dominicana a compradores de EE. UU.,
 * Canadá y Europa: la bandera de España para "es" o la del Reino Unido para
 * "en" serían falsas para casi todo el público real, y a 44 px una bandera se
 * lee como una mancha de color. En su lugar el control muestra el código ISO
 * tratado tipográficamente (tabular, apretado) y, al abrirse, el endónimo de
 * cada idioma escrito en ese mismo idioma y marcado con `lang`, que es la
 * pista visual que de verdad es inequívoca y además se pronuncia bien en un
 * lector de pantalla.
 *
 * Patrón de accesibilidad: divulgación (disclosure), no `role="menu"`. El
 * disparador es un botón con `aria-expanded`/`aria-controls`; cada opción es
 * un botón con `aria-pressed`, así que un lector de pantalla anuncia cuál es
 * el idioma activo sin depender del color.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, GlobeHemisphereWest } from "@phosphor-icons/react";
import { useExperience } from "./experience-provider";
import type { Locale } from "@/content/projects";
import "./language-switch.css";

/** Endónimo: cada idioma escrito en su propio idioma. */
const LANGUAGES: { value: Locale; code: string; name: string }[] = [
  { value: "es", code: "ES", name: "Español" },
  { value: "en", code: "EN", name: "English" },
  { value: "fr", code: "FR", name: "Français" },
];

export function LanguageSwitch() {
  const { locale, setLocale, t } = useExperience();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const flyoutId = useId();
  const active = LANGUAGES.find((item) => item.value === locale) ?? LANGUAGES[0];

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // Cerrar al pulsar fuera o al perder el foco del control completo.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open]);

  const focusOption = (offset: number) => {
    const options = Array.from(
      flyoutRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    );
    if (!options.length) return;
    const current = options.findIndex((option) => option === document.activeElement);
    const next = current < 0 ? (offset > 0 ? 0 : options.length - 1) : (current + offset + options.length) % options.length;
    options[next]?.focus();
  };

  return (
    <div
      className="language-switch"
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          close(true);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="language-switch-trigger"
        aria-expanded={open}
        aria-controls={flyoutId}
        aria-label={`${t.language}: ${active.name}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => focusOption(event.key === "ArrowDown" ? 1 : -1));
          }
        }}
      >
        <GlobeHemisphereWest size={13} weight="bold" aria-hidden="true" />
        <span className="language-switch-code" aria-hidden="true">
          {active.code}
        </span>
      </button>
      <div
        id={flyoutId}
        ref={flyoutRef}
        className="language-switch-flyout"
        hidden={!open}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            focusOption(event.key === "ArrowDown" ? 1 : -1);
          }
        }}
      >
        <p className="language-switch-title">{t.language}</p>
        {LANGUAGES.map((item) => (
          <button
            key={item.value}
            type="button"
            lang={item.value}
            aria-pressed={item.value === locale}
            onClick={() => {
              setLocale(item.value);
              close(true);
            }}
          >
            <span className="language-switch-chip" aria-hidden="true">
              {item.code}
            </span>
            <span className="language-switch-name">{item.name}</span>
            {item.value === locale && <Check size={16} weight="bold" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
}
