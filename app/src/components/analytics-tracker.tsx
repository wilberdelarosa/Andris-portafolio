"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }
  return hash.toString(36);
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Solo trackear si estamos en producción o forzado, pero para pruebas trackearemos local también si hay SUPABASE_URL
    if (typeof window === "undefined" || pathname.startsWith('/admin')) return;

    const sessionSalt = sessionStorage.getItem("sb_analytics_salt") || Math.random().toString(36).slice(2);
    sessionStorage.setItem("sb_analytics_salt", sessionSalt);

    const track = async () => {
      // Determinamos el proyecto visitado basado en la ruta /proyectos/slug
      const slugMatch = pathname.match(/^\/proyectos\/([^\/]+)$/);
      const projectSlug = slugMatch ? slugMatch[1] : 'home';

      // Creamos un hash efímero para sesión actual + fecha
      const today = new Date().toISOString().split('T')[0];
      const sessionHash = hashString(sessionSalt + today);

      try {
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

        // Llamar la RPC directamente con fetch y keepalive
        const body = JSON.stringify({
          p_slug: projectSlug,
          p_path: pathname,
          p_hash: sessionHash,
          p_agent: navigator.userAgent.slice(0, 150)
        });

        fetch(`${SUPABASE_URL}/rest/v1/rpc/track_page_view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body,
          keepalive: true
        }).catch(() => {});
      } catch (e) {
        // Silencio en caso de error
      }
    };

    // Agregar delay para no afectar la carga del LCP
    const timer = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => track());
      } else {
        track();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
