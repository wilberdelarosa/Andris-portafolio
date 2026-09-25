"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowUpRight, ArrowRight } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useExperience } from "./experience-provider";
import { useScrollDirection } from "./premium-motion";

/**
 * Entrada al aparecer en pantalla.
 *
 * Se usa en casi todas las secciones, asi que marca el pulso de la pagina
 * entera. Anima solo `transform` y `opacity`, y `blur` solo cuando se pide:
 * el desenfoque obliga a repintar y no conviene tenerlo en todas partes.
 *
 * Responde en los dos sentidos. Al bajar el bloque llega desde abajo; al subir,
 * desde arriba, de modo que el movimiento acompaña al gesto. Para un bloque que
 * deba entrar una sola vez, se pasa `once`.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  from = "auto",
  distance = 34,
  blur = false,
  amount = 0.15,
  once = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "auto" | "bottom" | "left" | "right" | "scale";
  distance?: number;
  blur?: boolean;
  amount?: number;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  const direction = useScrollDirection();

  const hidden = (dir: "down" | "up") => {
    if (from === "left") return { opacity: 0, x: -distance, y: 0, scale: 1 };
    if (from === "right") return { opacity: 0, x: distance, y: 0, scale: 1 };
    if (from === "scale") return { opacity: 0, x: 0, y: 0, scale: 0.94 };
    // `auto`: el signo del desplazamiento lo marca el sentido del scroll.
    const sign = from === "bottom" ? 1 : dir === "up" ? -1 : 1;
    return { opacity: 0, x: 0, y: distance * sign, scale: 1 };
  };

  return (
    <motion.div
      className={className}
      custom={direction}
      initial={reduced ? false : "hidden"}
      whileInView="shown"
      viewport={{ once, amount, margin: "0px 0px -40px 0px" }}
      variants={{
        hidden: (dir: "down" | "up") => ({
          ...hidden(dir),
          ...(blur ? { filter: "blur(10px)" } : {}),
        }),
        shown: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          ...(blur ? { filter: "blur(0px)" } : {}),
          transition: {
            duration: reduced ? 0 : 0.9,
            delay: reduced ? 0 : delay,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
export function SectionTitle({
  title,
  accent,
  description,
}: {
  label?: string;
  title: string;
  accent?: string;
  description?: string;
}) {
  return (
    <Reveal className="section-heading">
      <h2>
        {title}
        {accent && <> {accent}</>}
      </h2>
      {description && <p className="section-description">{description}</p>}
    </Reveal>
  );
}
export function Arrow({
  diagonal = false,
  size = 19,
}: {
  diagonal?: boolean;
  size?: number;
}) {
  return diagonal ? (
    <ArrowUpRight size={size} aria-hidden="true" />
  ) : (
    <ArrowRight size={size} aria-hidden="true" />
  );
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = "",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { t } = useExperience();
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className={`dialog-content ${className}`}
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement as HTMLElement;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <div className="dialog-header">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label={t.close}>
              <X size={22} />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="dialog-description">
              {description}
            </Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Photo({
  src,
  alt,
  className = "",
  priority = false,
  retryable = false,
  sizes = "(max-width: 700px) 100vw, 70vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  retryable?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { t } = useExperience();
  return (
    <div className={`photo ${className}`} aria-busy={!loaded && !failed}>
      {!loaded && !failed && (
        <span className="photo-loading" aria-hidden="true" />
      )}
      {failed ? (
        <div className="photo-error">
          <span>{t.noPhoto}</span>
          {retryable && (
            <button onClick={() => setFailed(false)}>{t.retry}</button>
          )}
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={!src.startsWith("/derived/")}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
export function downloadText(filename: string, text: string) {
  const blob = new Blob(["\uFEFF" + text], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
