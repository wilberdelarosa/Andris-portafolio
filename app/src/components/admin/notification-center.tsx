import React, { useEffect, useState } from "react";
import { Info, CheckCircle, Warning, XCircle, X } from "@phosphor-icons/react";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationCenter() {
  // Intentar leer de Supabase (si está conectado)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(Boolean(supabaseUrl && anonKey));

  useEffect(() => {
    if (!supabaseUrl || !anonKey) {
      return;
    }

    fetch(`${supabaseUrl}/rest/v1/notifications?select=*&is_read=eq.false&order=created_at.desc`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch((err) => console.error("Error cargando notificaciones:", err))
      .finally(() => setLoading(false));
  }, [supabaseUrl, anonKey]);

  const dismiss = async (id: string) => {
    // UI Optimista
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    if (supabaseUrl && anonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/notifications?id=eq.${id}`, {
          method: "PATCH",
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ is_read: true }),
        });
      } catch (err) {
        console.error("Error al descartar notificación:", err);
      }
    }
  };

  if (loading) return null;
  if (notifications.length === 0) return null;

  return (
    <div className="admin-notifications">
      {notifications.map((n) => (
        <div key={n.id} className={"admin-notification is-" + n.type}>
          <div className="admin-notification-icon">
            {n.type === "success" && <CheckCircle size={22} weight="fill" />}
            {n.type === "warning" && <Warning size={22} weight="fill" />}
            {n.type === "error" && <XCircle size={22} weight="fill" />}
            {n.type === "info" && <Info size={22} weight="fill" />}
          </div>
          <div className="admin-notification-content">
            <strong>{n.title}</strong>
            {n.message && <p>{n.message}</p>}
          </div>
          <button className="admin-notification-close" onClick={() => dismiss(n.id)} aria-label="Descartar">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
