/**
 * Campo de imagen: enlace directo o subida al bucket `projects` de Storage.
 *
 * La subida va firmada con la sesion del estudio (antes leia el token de
 * `localStorage` a mano y caia a la clave anonima, que la politica de Storage
 * rechaza). Si el bucket todavia no existe, el error de Supabase se traduce a
 * una instruccion concreta en vez de un "Error al subir imagen" opaco.
 */
"use client";

import { useRef, useState, type ChangeEvent } from "react";
import {
  CircleNotch,
  Image as ImageIcon,
  Link as LinkIcon,
  UploadSimple,
  X,
} from "@phosphor-icons/react";
import {
  cmsFetch,
  describeError,
  isSupabaseConfigured,
  readErrorMessage,
} from "@/lib/cms/session";
import { prepareWebpUpload } from "@/lib/prepare-webp-upload";

const BUCKET = "projects";
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function ImageInput({ label, value, onChange, required }: ImageInputProps) {
  const [mode, setMode] = useState<"link" | "upload">("link");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // El input se limpia enseguida para poder reintentar con el mismo archivo.
    event.target.value = "";
    if (!file) return;

    if (!isSupabaseConfigured()) {
      setError("Supabase no está configurado: usa el modo Enlace.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Selecciona una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError(`La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB; el máximo de origen es 20 MB.`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const webp = await prepareWebpUpload(file);
      const unique =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      const path = `uploads/${Date.now()}-${unique}.webp`;

      const response = await cmsFetch(`storage/v1/object/${BUCKET}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "image/webp",
          "cache-control": "max-age=31536000",
          "x-upsert": "true",
        },
        body: webp,
      });

      if (!response.ok) {
        const detail = await readErrorMessage(response);
        if (/bucket not found/i.test(detail) || response.status === 404) {
          throw new Error(
            `No existe el bucket «${BUCKET}» en Storage. Aplica la migración 0004_storage_bucket.sql en Supabase.`,
          );
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Storage rechazó la subida: la sesión no tiene permiso de escritura. Aplica la migración 0004 y vuelve a entrar.",
          );
        }
        throw new Error(detail);
      }

      const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
      onChange(`${base}/storage/v1/object/public/${BUCKET}/${path}`);
    } catch (uploadError) {
      setError(describeError(uploadError));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-image-input">
      <div className="admin-image-input-header">
        <span className="admin-field-label">
          {label} {required && <abbr title="Obligatorio">*</abbr>}
        </span>
        <div className="admin-image-tabs" role="group" aria-label={`Origen de ${label}`}>
          <button
            type="button"
            className={mode === "link" ? "is-active" : ""}
            aria-pressed={mode === "link"}
            onClick={() => setMode("link")}
          >
            <LinkIcon size={14} /> Enlace
          </button>
          <button
            type="button"
            className={mode === "upload" ? "is-active" : ""}
            aria-pressed={mode === "upload"}
            onClick={() => setMode("upload")}
          >
            <UploadSimple size={14} /> Subir
          </button>
        </div>
      </div>

      {mode === "link" ? (
        <div className="admin-image-link-field">
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/derived/proyecto-hero.webp o https://…"
            required={required && !value}
            className="admin-field-input"
            aria-label={label}
          />
          {value.trim() && <ImageLinkPreview key={value} src={value.trim()} label={label} />}
        </div>
      ) : (
        <div className={`admin-image-dropzone ${value ? "has-value" : ""}`}>
          {value ? (
            <div className="admin-image-preview">
              {/* Previsualización de una URL arbitraria en el panel privado:
                  next/image exigiría declarar cada dominio en next.config. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt={`Vista previa de ${label}`} />
              <button
                type="button"
                className="admin-image-clear"
                onClick={() => onChange("")}
                aria-label={`Quitar ${label}`}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="admin-image-upload-box"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <CircleNotch size={24} className="spin" />
              ) : (
                <ImageIcon size={24} />
              )}
              <span>{uploading ? "Subiendo…" : "Clic para subir desde la galería"}</span>
              <small>JPG, PNG o WebP · hasta 20 MB · se publica en WebP</small>
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/jpeg,image/png,image/webp"
            hidden
          />
        </div>
      )}
      {error && <p className="admin-error-text">{error}</p>}
    </div>
  );
}

function ImageLinkPreview({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`admin-image-link-preview ${failed ? "is-error" : ""}`}
      aria-label={`Vista previa de ${label}`}
    >
      {failed ? (
        <span className="admin-image-link-preview-message" role="status">
          <ImageIcon size={18} /> No se pudo cargar la vista previa. Comprueba la ruta o el enlace.
        </span>
      ) : (
        // URL arbitrary: next/image would require allow-listing every source host.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`Vista previa de ${label}`} onError={() => setFailed(true)} />
      )}
      {!failed && <span className="admin-image-link-preview-badge">Vista previa</span>}
    </div>
  );
}
