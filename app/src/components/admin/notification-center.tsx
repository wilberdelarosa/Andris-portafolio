/**
 * Avisos del CMS guardados en `public.notifications`.
 *
 * La tabla solo es legible por usuarios autenticados (migracion 0003) y este
 * componente consultaba con la clave anonima, asi que RLS devolvia siempre una
 * lista vacia y ningun aviso llegaba a verse. Ahora va firmado con la sesion.
 */
"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Info, Warning, X, XCircle } from "@phosphor-icons/react";
import { cmsFetch, isSupabaseConfigured } from "@/lib/cms/session";

interface CmsNotification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string | null;
}

const ICONS = {
  success: CheckCircle,
  warning: Warning,
  error: XCircle,
  info: Info,
} as const;

function isNotification(value: unknown): value is CmsNotification {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.title === "string";
}

/** Fuera del componente: el efecto solo actualiza estado en el callback. */
async function loadNotifications(): Promise<CmsNotification[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const response = await cmsFetch(
      "rest/v1/notifications?select=id,type,title,message&is_read=eq.false&order=created_at.desc&limit=20",
    );
    if (!response.ok) return [];
    const data: unknown = await response.json();
    return Array.isArray(data) ? data.filter(isNotification) : [];
  } catch {
    // Los avisos son informativos: su fallo no debe romper el panel.
    return [];
  }
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<CmsNotification[]>([]);

  useEffect(() => {
    let active = true;
    void loadNotifications().then((rows) => {
      if (active) setNotifications(rows);
    });
    return () => {
      active = false;
    };
  }, []);

  const dismiss = async (id: string) => {
    // Se retira de la vista al instante y se confirma en segundo plano.
    setNotifications((current) => current.filter((item) => item.id !== id));
    try {
      await cmsFetch(`rest/v1/notifications?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ is_read: true }),
      });
    } catch {
      /* Si no se pudo marcar, volvera a aparecer en la proxima carga. */
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="admin-notifications">
      {notifications.map((item) => {
        const Icon = ICONS[item.type] ?? Info;
        return (
          <div key={item.id} className={`admin-notification is-${item.type ?? "info"}`}>
            <div className="admin-notification-icon">
              <Icon size={22} weight="fill" />
            </div>
            <div className="admin-notification-content">
              <strong>{item.title}</strong>
              {item.message && <p>{item.message}</p>}
            </div>
            <button
              className="admin-notification-close"
              onClick={() => dismiss(item.id)}
              aria-label={`Descartar: ${item.title}`}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
