"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useExperience } from "./experience-provider";
import { introLabel, introSkip } from "@/content/intro-copy";

const NAME = "ANDRIS PEÑA";
/** Debe coincidir con `--intro-total` en intro-curtain.css. */
const TOTAL_MS = 2900;

/**
 * Cortina de entrada.
 *
 * Se dibuja una retícula, se traza una línea, aparece el monograma y el nombre
 * se revela letra a letra. Al final seis paños suben en cascada y descubren la
 * página, que arranca entonces su propia animación.
 *
 * La secuencia es CSS puro y el marcado llega desde el servidor: así no hay un
 * destello de la página antes de que la cortina exista. Si el JavaScript falla,
 * la animación termina igual y deja de bloquear, porque el estado final de los
 * fotogramas ya la retira.
 */
export function IntroCurtain() {
  const { locale } = useExperience();
  const pathname = usePathname();
  const [gone, setGone] = useState(false);
  const skipped = useRef(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- El estado inicial depende
       de un atributo que un script escribe antes de pintar; leerlo durante el
       render del servidor no es posible y provocaría una discrepancia. */
    const root = document.documentElement;
    // Marcada como vista: en el resto de la sesión la página entra directa.
    try {
      sessionStorage.setItem("ap-intro-seen", "1");
    } catch {
      /* En modo privado la intro volverá a verse; no es un fallo. */
    }

    if (root.dataset.intro === "skip") {
      setGone(true);
      return;
    }

    const finish = () => {
      if (skipped.current) return;
      skipped.current = true;
      root.dataset.intro = "done";
      setGone(true);
    };

    // Salida anticipada: cualquier gesto claro de la persona la interrumpe.
    const skipNow = () => {
      if (skipped.current) return;
      root.dataset.intro = "skip";
      finish();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") skipNow();
    };

    const timer = window.setTimeout(finish, TOTAL_MS);
    document.addEventListener("keydown", onKey);
    window.addEventListener("wheel", skipNow, { passive: true, once: true });
    window.addEventListener("touchmove", skipNow, { passive: true, once: true });

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", skipNow);
      window.removeEventListener("touchmove", skipNow);
    };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (gone) return null;

  const letters = Array.from(NAME);

  return (
    <div
      className="intro"
      // Decorativa: el contenido real ya está en la página, debajo.
      aria-hidden="true"
      onClick={() => {
        document.documentElement.dataset.intro = "skip";
        setGone(true);
      }}
    >
      {/* Los paños son el fondo: al subir, descubren la página. */}
      <div className="intro-panels">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} style={{ "--panel": index } as React.CSSProperties} />
        ))}
      </div>

      <div className="intro-grid" />

      <div className="intro-core">
        <span className="intro-rule" />

        <span className="intro-mark">
          <Image src="/derived/logo-navy.webp" alt="" width={72} height={72} priority />
        </span>

        <p className="intro-name">
          {letters.map((letter, index) => (
            <span key={index} className="intro-letter" style={{ "--letter": index } as React.CSSProperties}>
              <span>{letter === " " ? " " : letter}</span>
            </span>
          ))}
        </p>

        <p className="intro-label">{introLabel(pathname, locale)}</p>

        <span className="intro-progress">
          <i />
        </span>
      </div>

      <button
        type="button"
        className="intro-skip"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => {
          document.documentElement.dataset.intro = "skip";
          setGone(true);
        }}
      >
        {introSkip[locale]}
      </button>
    </div>
  );
}
