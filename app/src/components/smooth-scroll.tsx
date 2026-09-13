"use client";

import { useEffect } from "react";

/**
 * Scroll suave con Lenis.
 *
 * Da inercia al desplazamiento, que es lo que hace que las animaciones ligadas
 * al scroll se lean como un movimiento continuo y no como saltos.
 *
 * Se carga bajo demanda y solo donde aporta: con movimiento reducido no se
 * descarga siquiera, y en pantallas tactiles se deja el scroll del sistema, que
 * ya tiene su propia inercia y responde mejor al gesto.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let frame = 0;
    let instance: { raf: (time: number) => void; destroy: () => void } | null = null;
    let cancelled = false;

    import("lenis")
      .then(({ default: Lenis }) => {
        if (cancelled) return;
        const lenis = new Lenis({
          duration: 1.05,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          wheelMultiplier: 0.9,
          // Los enlaces internos siguen funcionando con el desplazamiento suave.
          anchors: true,
        });
        instance = lenis;

        const loop = (time: number) => {
          lenis.raf(time);
          frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
      })
      .catch(() => {
        /* Sin Lenis la pagina se desplaza de forma nativa, que es suficiente. */
      });

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      instance?.destroy();
    };
  }, []);

  return null;
}
