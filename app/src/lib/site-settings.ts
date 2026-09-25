"use client";

import { cmsFetch } from "@/lib/cms/session";

export const PUBLIC_PROJECT_NAMES_VISIBLE_KEY = "public_project_names_visible";
export const SITE_SETTINGS_EVENT = "ap-site-settings-changed";

type SiteSettingRow = { key?: unknown; value_json?: unknown };

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  if (value && typeof value === "object" && "value" in value) {
    return parseBoolean((value as { value?: unknown }).value, fallback);
  }
  return fallback;
}

/**
 * Lee solo el indicador público. Si Supabase aún no está configurado o la
 * migración no se ha aplicado, se mantiene la experiencia pública actual.
 */
export async function getPublicProjectNamesVisible(): Promise<boolean> {
  // Enable after the migration is applied; avoid a request to an unavailable
  // table (or disabled OpenAPI endpoint) on every public route meanwhile.
  if (process.env.NEXT_PUBLIC_SITE_SETTINGS_ENABLED !== "true") return true;
  try {
    const response = await cmsFetch(
      `rest/v1/site_settings?select=key,value_json&key=eq.${PUBLIC_PROJECT_NAMES_VISIBLE_KEY}&limit=1`,
      { allowAnonymous: true },
    );
    if (!response.ok) return true;
    const rows = (await response.json().catch(() => [])) as SiteSettingRow[];
    return parseBoolean(rows[0]?.value_json, true);
  } catch {
    return true;
  }
}

export function announceSiteSettingsChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SITE_SETTINGS_EVENT));
  }
}

export function parsePublicProjectNamesVisible(value: unknown): boolean {
  return parseBoolean(value, true);
}
