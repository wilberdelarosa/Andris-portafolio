"use client";

import { CheckCircle, Info, Warning, X, XCircle } from "@phosphor-icons/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type AdminToastTone = "success" | "error" | "info" | "warning";

export interface AdminToastValue {
  tone: AdminToastTone;
  message: string;
}

interface AdminToastContextValue {
  notify: (toast: AdminToastValue) => void;
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: Warning,
} as const;

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<AdminToastValue | null>(null);

  const notify = useCallback((next: AdminToastValue) => setToast(next), []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <AdminToastContext.Provider value={{ notify }}>
      {children}
      {toast && <AdminToast toast={toast} onDismiss={() => setToast(null)} />}
    </AdminToastContext.Provider>
  );
}

export function useAdminToast(): AdminToastContextValue {
  const value = useContext(AdminToastContext);
  if (!value) throw new Error("useAdminToast debe usarse dentro de AdminToastProvider");
  return value;
}

function AdminToast({ toast, onDismiss }: { toast: AdminToastValue; onDismiss: () => void }) {
  const Icon = ICONS[toast.tone];
  return (
    <div className={`admin-toast is-${toast.tone}`} role="status" aria-live="polite">
      <Icon size={21} weight="fill" aria-hidden="true" />
      <span>{toast.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Cerrar notificación">
        <X size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
