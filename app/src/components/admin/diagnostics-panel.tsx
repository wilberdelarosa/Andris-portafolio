/**
 * Diagnostico del estudio CMS.
 *
 * El panel afirmaba "Supabase conectado" en cuanto existian las variables de
 * entorno, sin comprobar nada mas. Eso ocultaba fallos reales: la tabla de
 * avisos devolvia vacio por RLS, el bucket de imagenes no existia y el
 * formulario de alta no tenia permiso de escritura, todo en silencio.
 *
 * Aqui cada pieza se consulta de verdad y, cuando algo falta, se dice que
 * hacer para arreglarlo.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowClockwise,
  CheckCircle,
  Info,
  Warning,
  XCircle,
} from "@phosphor-icons/react";
import {
  cmsFetch,
  describeError,
  getSupabaseConfig,
  readSession,
} from "@/lib/cms/session";
import { getEditorProfile } from "@/lib/cms/project-writer";

type CheckState = "ok" | "warn" | "fail" | "info";

interface Check {
  id: string;
  label: string;
  state: CheckState;
  detail: string;
  fix?: string;
}

const ICONS: Record<CheckState, typeof CheckCircle> = {
  ok: CheckCircle,
  warn: Warning,
  fail: XCircle,
  info: Info,
};

/** Cuenta filas con `count=exact`, que responde en la cabecera Content-Range. */
async function countRows(path: string): Promise<number | null> {
  const response = await cmsFetch(`${path}&limit=1`, {
    headers: { Prefer: "count=exact" },
    allowAnonymous: true,
  });
  if (!response.ok) return null;
  const range = response.headers.get("content-range");
  const total = range?.split("/")[1];
  return total && total !== "*" ? Number(total) : null;
}

async function runChecks(): Promise<Check[]> {
  const config = getSupabaseConfig();
  const session = readSession();
  const checks: Check[] = [];

  if (!config) {
    return [
      {
        id: "env",
        label: "Credenciales de Supabase",
        state: "fail",
        detail: "No hay NEXT_PUBLIC_SUPABASE_URL ni NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        fix: "Añádelas a .env.local y reinicia el servidor de desarrollo.",
      },
    ];
  }

  checks.push({
    id: "env",
    label: "Credenciales de Supabase",
    state: "ok",
    detail: new URL(config.url).host,
  });

  if (session) {
    const expires = session.expiresAt
      ? new Date(session.expiresAt * 1000).toLocaleString("es-DO")
      : "desconocida";
    checks.push({
      id: "session",
      label: "Sesión activa",
      state: session.refreshToken ? "ok" : "warn",
      detail: `${session.email} · vence ${expires}`,
      fix: session.refreshToken
        ? undefined
        : "Sesión heredada sin token de renovación: cierra sesión y vuelve a entrar para que se renueve sola.",
    });
  }

  // --- Vista publica del API -------------------------------------------------
  try {
    const response = await cmsFetch(
      "rest/v1/api_projects_v1?select=slug,summary,detail_extra&limit=1",
      { allowAnonymous: true },
    );
    if (response.ok) {
      const total = await countRows("rest/v1/api_projects_v1?select=slug");
      checks.push({
        id: "view",
        label: "Vista api_projects_v1",
        state: total && total > 0 ? "ok" : "warn",
        detail:
          total === null
            ? "Responde correctamente."
            : `${total} proyecto${total === 1 ? "" : "s"} publicado${total === 1 ? "" : "s"}.`,
        fix:
          total === 0
            ? "No hay proyectos con public_status = 'published'. Aplica supabase/seed.sql o publica desde «Añadir proyecto»."
            : undefined,
      });
    } else {
      checks.push({
        id: "view",
        label: "Vista api_projects_v1",
        state: "fail",
        detail: `Supabase respondió ${response.status}.`,
        fix: "Aplica la migración 0001_cms_core.sql.",
      });
    }
  } catch (error) {
    checks.push({
      id: "view",
      label: "Vista api_projects_v1",
      state: "fail",
      detail: describeError(error),
    });
  }

  // --- Catalogo de categorias (migracion 0005) -------------------------------
  try {
    const total = await countRows("rest/v1/categories?select=id");
    checks.push({
      id: "categories",
      label: "Catálogo de etiquetas",
      state: total === null ? "fail" : "ok",
      detail:
        total === null
          ? "La tabla categories no responde."
          : `${total} etiqueta${total === 1 ? "" : "s"} guardada${total === 1 ? "" : "s"}.`,
      fix: total === null ? "Aplica la migración 0005_categories_and_tags.sql." : undefined,
    });
  } catch (error) {
    checks.push({
      id: "categories",
      label: "Catálogo de etiquetas",
      state: "fail",
      detail: describeError(error),
      fix: "Aplica la migración 0005_categories_and_tags.sql.",
    });
  }

  // --- Avisos (migracion 0003) ----------------------------------------------
  try {
    const response = await cmsFetch("rest/v1/notifications?select=id&limit=1");
    checks.push({
      id: "notifications",
      label: "Tabla de avisos",
      state: response.ok ? "ok" : "fail",
      detail: response.ok
        ? "Legible con la sesión actual."
        : `Supabase respondió ${response.status}.`,
      fix: response.ok ? undefined : "Aplica la migración 0003_notifications.sql.",
    });
  } catch (error) {
    checks.push({
      id: "notifications",
      label: "Tabla de avisos",
      state: "fail",
      detail: describeError(error),
    });
  }

  // --- Bucket de imagenes (migracion 0004) -----------------------------------
  // Se lista el contenido del bucket en vez de pedir sus metadatos.
  // `storage/v1/bucket/projects` es el endpoint de METADATOS y depende de
  // permisos sobre `storage.buckets`, que la migracion 0004 nunca creo (solo
  // creo politicas sobre `storage.objects`). Por eso devolvia 400 y este
  // chequeo marcaba un fallo permanente aunque subir fotos funcionara bien.
  // El listado sí depende de las politicas que existen, que es justo lo que
  // el CMS necesita para operar.
  try {
    const response = await cmsFetch("storage/v1/object/list/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 1 }),
    });
    if (response.ok) {
      checks.push({
        id: "storage",
        label: "Bucket de imágenes",
        state: "ok",
        detail: "El bucket «projects» responde: la subida de fotos funciona.",
      });
    } else {
      const body = await response.text();
      const missing = /NoSuchBucket|Bucket not found/i.test(body);
      checks.push({
        id: "storage",
        label: "Bucket de imágenes",
        state: "fail",
        detail: missing
          ? "No existe el bucket «projects»: subir fotos falla."
          : `El bucket «projects» no acepta el listado (${response.status}): revisa las políticas de storage.objects.`,
        fix: "Aplica supabase/migrations/0004_storage_bucket.sql en el editor SQL.",
      });
    }
  } catch (error) {
    checks.push({
      id: "storage",
      label: "Bucket de imágenes",
      state: "warn",
      detail: describeError(error),
    });
  }

  
  // --- Amenities (migracion 0001 actualizada) -------------------------------
  try {
    const response = await cmsFetch("rest/v1/amenities?select=id,image_url,is_template&limit=1");
    if (response.ok) {
      checks.push({
        id: "amenities_schema",
        label: "Esquema de Amenidades (Plantillas)",
        state: "ok",
        detail: "La tabla 'amenities' existe y cuenta con los campos para imágenes y plantillas interactivas.",
      });
    } else {
      checks.push({
        id: "amenities_schema",
        label: "Esquema de Amenidades (Plantillas)",
        state: "fail",
        detail: `Supabase respondió ${response.status}. Faltan las columnas image_url o is_template.`,
        fix: "Aplica las modificaciones recientes en 0001_cms_core.sql relacionadas con amenidades.",
      });
    }
  } catch (error) {
    checks.push({
      id: "amenities_schema",
      label: "Esquema de Amenidades",
      state: "fail",
      detail: describeError(error),
    });
  }

  // --- MapLibre / OpenFreeMap -------------------------------
  try {
    const start = performance.now();
    const resp = await fetch("https://tiles.openfreemap.org/planet");
    const ms = Math.round(performance.now() - start);
    checks.push({
      id: "maps_api",
      label: "Servidor de Mapas (OpenFreeMap)",
      state: resp.ok ? "ok" : "warn",
      detail: resp.ok ? `Conexión establecida exitosamente (${ms}ms).` : `El servidor respondió con ${resp.status}.`,
    });
  } catch {
    checks.push({
      id: "maps_api",
      label: "Servidor de Mapas (OpenFreeMap)",
      state: "warn",
      detail: "No se pudo conectar a OpenFreeMap. Los mapas podrían no renderizarse correctamente.",
    });
  }

  // --- Permiso de edicion ----------------------------------------------------
  const profile = await getEditorProfile();
  checks.push({
    id: "profile",
    label: "Permiso de edición",
    state: profile ? "ok" : "fail",
    detail: profile
      ? `Registrado en cms_profiles como ${profile.role}.`
      : "Tu usuario no tiene fila en cms_profiles: el catálogo es de solo lectura.",
    fix: profile
      ? undefined
      : "Aplica 0006_cms_studio_access.sql y añade tu usuario a cms_profiles con rol admin.",
  });

  return checks;
}

/** Nunca lanza: un fallo del propio diagnóstico se muestra como comprobación. */
async function safeRunChecks(): Promise<Check[]> {
  try {
    return await runChecks();
  } catch (error) {
    return [
      { id: "error", label: "Diagnóstico", state: "fail", detail: describeError(error) },
    ];
  }
}

export function DiagnosticsPanel() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  // Arranca en `true` para no tener que activarlo desde el cuerpo del efecto.
  const [running, setRunning] = useState(true);

  const refresh = useCallback(() => {
    setRunning(true);
    void safeRunChecks().then((result) => {
      setChecks(result);
      setRunning(false);
    });
  }, []);

  useEffect(() => {
    let active = true;
    void safeRunChecks().then((result) => {
      if (!active) return;
      setChecks(result);
      setRunning(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const failures = checks?.filter((check) => check.state === "fail").length ?? 0;

  return (
    <>
      <div className="admin-page-head">
        <p className="kicker">Estado real</p>
        <h1>Diagnóstico</h1>
        <p>
          Cada pieza del CMS se consulta de verdad contra Supabase. Lo que
          aparezca en rojo es exactamente lo que impide que el estudio funcione
          por completo.
        </p>
      </div>

      <div className="admin-card pad-lg">
        <div className="admin-actions" style={{ marginTop: 0, marginBottom: 14 }}>
          <button className="button button-outline" onClick={refresh} disabled={running}>
            <ArrowClockwise size={16} /> {running ? "Comprobando…" : "Volver a comprobar"}
          </button>
          {checks && (
            <span className={`chip ${failures ? "pending" : "ok"}`}>
              <i />
              {failures === 0
                ? "Todo en orden"
                : failures === 1
                  ? "1 comprobación en rojo"
                  : `${failures} comprobaciones en rojo`}
            </span>
          )}
        </div>

        {!checks ? (
          <div className="admin-empty">Comprobando el estado del CMS…</div>
        ) : (
          <ul className="admin-checks">
            {checks.map((check) => {
              const Icon = ICONS[check.state];
              return (
                <li key={check.id} className={`admin-check is-${check.state}`}>
                  <Icon size={20} weight="fill" aria-hidden="true" />
                  <div>
                    <strong>{check.label}</strong>
                    <p>{check.detail}</p>
                    {check.fix && <p className="admin-check-fix">{check.fix}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
