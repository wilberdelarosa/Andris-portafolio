"use client";

import { CheckCircle, Info, Warning, X, XCircle } from "@phosphor-icons/react";
import { useEffect } from "react";

export type ActionToastTone = "success" | "error" | "info" | "warning";

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: Warning,
} as const;

export function ActionToast({
  tone,
  message,
  onDismiss,
}: {
  tone: ActionToastTone;
  message: string;
  onDismiss: () => void;
}) {
  const Icon = ICONS[tone];
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 3800);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div className={`action-toast is-${tone}`} role="status" aria-live="polite">
      <Icon size={20} weight="fill" aria-hidden="true" />
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Cerrar notificación">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
