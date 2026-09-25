"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Eye, EyeSlash, FloppyDisk, LockKey, Warning } from "@phosphor-icons/react";
import { useAdminToast } from "./admin-toast";
import {
  announceSiteSettingsChange,
  parsePublicProjectNamesVisible,
  PUBLIC_PROJECT_NAMES_VISIBLE_KEY,
} from "@/lib/site-settings";
import { cmsFetch, describeError, isSupabaseConfigured, readErrorMessage } from "@/lib/cms/session";

export function SiteSettingsPanel() {
  const { notify } = useAdminToast();
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(() => isSupabaseConfigured());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isSupabaseConfigured()) {
      return;
    }
    void cmsFetch(
      `rest/v1/site_settings?select=key,value_json&key=eq.${PUBLIC_PROJECT_NAMES_VISIBLE_KEY}&limit=1`,
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(await readErrorMessage(response));
        const rows = (await response.json().catch(() => [])) as Array<{ value_json?: unknown }>;
        if (!cancelled && rows[0]) setVisible(parsePublicProjectNamesVisible(rows[0].value_json));
      })
      .catch((error: unknown) => {
        if (!cancelled) notify({ tone: "warning", message: `No se pudo leer la configuración: ${describeError(error)}` });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [notify]);

  const save = async () => {
    setSaving(true);
    try {
      const response = await cmsFetch(
        "rest/v1/site_settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=minimal",
          },
          body: JSON.stringify({
            key: PUBLIC_PROJECT_NAMES_VISIBLE_KEY,
            value_json: visible,
            updated_at: new Date().toISOString(),
          }),
        },
      );
      if (!response.ok) throw new Error(await readErrorMessage(response));
      announceSiteSettingsChange();
      notify({
        tone: "success",
        message: visible
          ? "Los nombres reales ya están visibles en el catálogo público."
          : "Privacidad activa: el catálogo mostrará Proyecto 01, Proyecto 02…",
      });
    } catch (error: unknown) {
      notify({ tone: "error", message: `No se guardó la configuración: ${describeError(error)}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-page-head">
        <p className="kicker">Configuración pública</p>
        <h1>Visibilidad de los nombres</h1>
        <p>
          Controla desde un único lugar qué ve un visitante. Los nombres reales,
          slugs, imágenes y datos del proyecto permanecen intactos dentro del CMS.
        </p>
      </div>

      <section className="admin-card pad-lg site-settings-card" aria-labelledby="project-name-visibility-title">
        <div className="site-settings-heading">
          <div className="site-settings-icon"><LockKey size={24} weight="duotone" aria-hidden="true" /></div>
          <div>
            <h2 id="project-name-visibility-title">Modo catálogo privado</h2>
            <p>Cuando está desactivado, cada ficha pública usa una etiqueta estable: Proyecto 01, Proyecto 02…</p>
          </div>
        </div>

        <button
          type="button"
          className={`site-settings-toggle ${visible ? "is-on" : "is-off"}`}
          role="switch"
          aria-checked={visible}
          disabled={loading || saving || !isSupabaseConfigured()}
          onClick={() => setVisible((value) => !value)}
        >
          <span className="site-settings-toggle-copy">
            {visible ? <Eye size={20} aria-hidden="true" /> : <EyeSlash size={20} aria-hidden="true" />}
            <span>
              <strong>Mostrar nombres reales</strong>
              <small>{visible ? "Visible para visitantes" : "Oculto para visitantes"}</small>
            </span>
          </span>
          <span className="site-settings-switch" aria-hidden="true"><span /></span>
        </button>

        {!isSupabaseConfigured() && (
          <p className="site-settings-notice"><Warning size={17} /> Supabase no está configurado en este entorno.</p>
        )}
        <div className="admin-actions">
          <button type="button" className="button button-primary" disabled={loading || saving || !isSupabaseConfigured()} onClick={() => void save()}>
            {saving ? <span className="spin" aria-hidden="true">◌</span> : <FloppyDisk size={18} />}
            Guardar visibilidad
          </button>
          <span className="site-settings-safe"><CheckCircle size={16} /> Las URL internas no cambian</span>
        </div>
      </section>
    </>
  );
}
