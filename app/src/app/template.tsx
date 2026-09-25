"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Transicion de entrada al cambiar de ruta.
 *
 * `template` vuelve a montarse en cada navegacion, que es justo lo que hace
 * falta para una animacion de entrada. Es deliberadamente breve y solo toca
 * `opacity` y `transform`: nada debe retrasar la lectura del contenido.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={false}
      animate={reduced ? { opacity: 1, y: 0 } : { opacity: [0.94, 1], y: [6, 0] }}
      transition={{ duration: reduced ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
