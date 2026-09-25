/**
 * Alta de un lead en Supabase desde el formulario público.
 *
 * Antes el formulario solo guardaba en `localStorage`,
 * así que un visitante real quedaba registrado en SU navegador y nunca
 * llegaba al panel: el dueño solo veía los leads que él mismo había enviado
 * desde su propia máquina.
 *
 * La tabla `public.leads` ya tenía la RLS correcta para esto y no hizo falta
 * migración: `leads public insert` permite INSERT al rol público (el visitante
 * anónimo) y `leads editor read` restringe la lectura a `is_cms_editor()`.
 */
"use client";

import { cmsFetch, readErrorMessage } from "./session.ts";
import type { CmsLead } from "./types.ts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface LeadSubmission extends Omit<CmsLead, "id" | "createdAt"> {
  /**
   * `projects.id` de Supabase. Solo se envía si de verdad es un UUID: con el
   * proveedor estático el `id` del proyecto no lo es, y mandarlo rompería el
   * FK.
   */
  projectId?: string;
}

interface LeadRow {
  id: string;
  created_at: string;
  read_at: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  budget_label: string | null;
  timeframe_label: string | null;
  interest: string | null;
  message: string | null;
  locale: CmsLead["locale"];
  channel: CmsLead["channel"];
  status: string;
  page_url: string | null;
  projects: { name: string } | null;
}

/** Estados que el panel sabe representar; el resto se muestra como enviado. */
const KNOWN_STATUS = new Set<CmsLead["status"]>(["prepared", "sent", "failed"]);

/**
 * Bandeja real del CMS. Solo responde a un editor: la política
 * `leads editor read` restringe el SELECT a `is_cms_editor()`.
 */
export async function listLeads(): Promise<CmsLead[]> {
  const response = await cmsFetch(
    "rest/v1/leads?select=*,projects(name)&order=created_at.desc",
  );
  if (!response.ok) throw new Error(await readErrorMessage(response));
  const rows = (await response.json()) as LeadRow[];
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    readAt: row.read_at,
    name: row.name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    country: row.country ?? "",
    budget: row.budget_label ?? "",
    timeframe: row.timeframe_label ?? "",
    project: row.projects?.name ?? "",
    interest: row.interest ?? "",
    message: row.message ?? "",
    locale: row.locale,
    pageUrl: row.page_url ?? undefined,
    channel: row.channel,
    status: KNOWN_STATUS.has(row.status as CmsLead["status"])
      ? (row.status as CmsLead["status"])
      : "sent",
  }));
}

/** Persist the editor's first view so the unread badge stays correct on reload. */
export async function markLeadRead(id: string): Promise<void> {
  const response = await cmsFetch(
    `rest/v1/leads?id=eq.${encodeURIComponent(id)}&read_at=is.null`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ read_at: new Date().toISOString() }),
    },
  );
  if (!response.ok) throw new Error(await readErrorMessage(response));
}

export async function createLead(lead: LeadSubmission): Promise<void> {
  const payload = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone || null,
    country: lead.country || null,
    budget_label: lead.budget || null,
    timeframe_label: lead.timeframe || null,
    interest: lead.interest || null,
    message: lead.message || null,
    locale: lead.locale,
    channel: lead.channel,
    status: lead.status,
    page_url: lead.pageUrl || null,
    project_id:
      lead.projectId && UUID_RE.test(lead.projectId) ? lead.projectId : null,
  };

  const response = await cmsFetch("rest/v1/leads", {
    method: "POST",
    // El visitante no tiene sesión: entra por la política de inserción pública.
    allowAnonymous: true,
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

/**
 * Borra un lead. El panel lo hacía contra `localStorage` (`leadsStore.remove`),
 * así que el lead "eliminado" seguía intacto en la base y reaparecía al
 * recargar desde otro dispositivo. La política `leads editor delete` ya
 * existía para esto.
 */
export async function deleteLead(id: string): Promise<void> {
  const response = await cmsFetch(
    `rest/v1/leads?id=eq.${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
  );
  if (!response.ok) throw new Error(await readErrorMessage(response));
}

/**
 * Vacía la bandeja completa. PostgREST exige un filtro en todo DELETE para no
 * borrar una tabla entera por accidente; `id=not.is.null` es ese filtro
 * explícito, y RLS limita el alcance a lo que el editor puede ver.
 */
export async function deleteAllLeads(): Promise<void> {
  const response = await cmsFetch("rest/v1/leads?id=not.is.null", {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
}
