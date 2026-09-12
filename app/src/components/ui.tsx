"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowUpRight, ArrowRight } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useExperience } from "./experience-provider";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? {} : { opacity: [0.85, 1] }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
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
