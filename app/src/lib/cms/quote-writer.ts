/**
 * Cotizaciones de la calculadora en Supabase (`public.calculator_quotes`).
 *
 * Antes vivían en `localStorage`, con el
 * mismo defecto que tenían los leads: la cotización quedaba registrada en el
 * navegador del VISITANTE, así que el panel del dueño mostraba únicamente las
 * que él mismo había descargado desde su propia máquina. El registro real de
 * interés comercial nunca llegaba a ninguna parte.
 *
 * La tabla ya traía la RLS correcta y no hizo falta migración:
 * `quotes public insert` permite el INSERT anónimo del visitante,
 * `quotes editor read` y `quotes editor delete` reservan lectura y borrado a
 * `is_cms_editor()`.
 */
"use client";

import { cmsFetch, readErrorMessage } from "./session.ts";
import type { CalculatorQuote, Locale } from "./types.ts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface QuoteSubmission {
  locale: Locale;
  /**
   * `projects.id` de Supabase. Solo viaja si de verdad es un UUID: con el
   * proveedor estático el `id` del proyecto no lo es y rompería el FK. Sin
   * proyecto elegido queda `null` («escenario libre»), que es un dato real,
   * no un hueco.
   */
  projectId?: string | null;
  price: number;
  signingPercent: number;
  constructionPercent: number;
  deliveryPercent: number;
  months: number;
  monthly: number;
}

interface QuoteRow {
  id: string;
  created_at: string;
  locale: Locale;
  project_id: string | null;
  price: number | string;
  signing_percent: number | string;
  construction_percent: number | string;
  delivery_percent: number | string;
  months: number;
  monthly: number | string;
  format: string;
  projects: { slug: string; name: string } | null;
}

/**
 * Cotización tal como la ve el panel. Lleva el nombre del proyecto resuelto
 * por la propia consulta: antes el panel lo buscaba en el catálogo público,
 * así que una cotización de un proyecto despublicado aparecía como «escenario
 * libre», que es falso.
 */
export interface EditorQuote extends CalculatorQuote {
  projectName: string | null;
}

/** `numeric` de Postgres llega como cadena por JSON; se normaliza aquí. */
function toNumber(value: number | string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Registro real del simulador. Solo responde a un editor (`quotes editor read`). */
export async function listQuotes(): Promise<EditorQuote[]> {
  const response = await cmsFetch(
    "rest/v1/calculator_quotes?select=*,projects(slug,name)&order=created_at.desc",
  );
  if (!response.ok) throw new Error(await readErrorMessage(response));
  const rows = (await response.json()) as QuoteRow[];
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    locale: row.locale,
    projectSlug: row.projects?.slug ?? null,
    projectName: row.projects?.name ?? null,
    price: toNumber(row.price),
    signingPercent: toNumber(row.signing_percent),
    constructionPercent: toNumber(row.construction_percent),
    deliveryPercent: toNumber(row.delivery_percent),
    months: row.months,
    monthly: toNumber(row.monthly),
    format: "pdf",
  }));
}

export async function createQuote(quote: QuoteSubmission): Promise<void> {
  const payload = {
    locale: quote.locale,
    project_id:
      quote.projectId && UUID_RE.test(quote.projectId) ? quote.projectId : null,
    price: quote.price,
    signing_percent: quote.signingPercent,
    construction_percent: quote.constructionPercent,
    delivery_percent: quote.deliveryPercent,
    months: quote.months,
    monthly: quote.monthly,
    format: "pdf",
  };

  const response = await cmsFetch("rest/v1/calculator_quotes", {
    method: "POST",
    // El visitante no tiene sesión: entra por `quotes public insert`.
    allowAnonymous: true,
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(await readErrorMessage(response));
}

export async function deleteQuote(id: string): Promise<void> {
  const response = await cmsFetch(
    `rest/v1/calculator_quotes?id=eq.${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
  );
  if (!response.ok) throw new Error(await readErrorMessage(response));
}

/**
 * Vacía el registro completo. PostgREST exige un filtro en cada DELETE para
 * no borrar una tabla entera por accidente; `id=not.is.null` es ese filtro
 * explícito, y RLS sigue limitando el alcance a lo que el editor puede ver.
 */
export async function clearQuotes(): Promise<void> {
  const response = await cmsFetch(
    "rest/v1/calculator_quotes?id=not.is.null",
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
  );
  if (!response.ok) throw new Error(await readErrorMessage(response));
}
