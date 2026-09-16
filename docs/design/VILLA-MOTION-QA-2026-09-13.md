# Cierre: villa, color y scroll

- Terra (razonamiento alto) implementó la villa y el panel con el retrato real de Andris. Astra integró las imágenes generadas, ajustó las capas de movimiento y diagnosticó la carga del cliente.
- Villa conceptual generada, con indicaciones de piscina, terraza y jardín. Se identifica expresamente como imagen generada, no como propiedad ofertada. Originales y prompts en `output/imagegen/villa-color-v1-provenance.md`.
- Palmas con más color; máscaras evitan invadir los párrafos móviles. El plano es secundario: opacidad 0.16 en escritorio, 0.12 móvil, 0.14 oscuro, recorte lateral, blur de 1 px y `pointer-events: none`.
- Scroll nativo y transformaciones directas y reversibles, sin la inercia global anterior. Títulos completos se desplazan sin cruzar sus palabras.
- Corregida una divergencia de hidratación reproducible con movimiento reducido: ReadingProgress mantiene el mismo árbol servidor/cliente y CSS oculta la barra. CSS también desactiva transformaciones decorativas desde el primer render con esa preferencia.

## Verificación final

Vista previa: `http://localhost:3001`, desarrollo con Webpack.

- `node scripts/verify-villa-motion.mjs`: 6/6 comprobaciones aprobadas, sin errores de ejecución. Incluye rueda real reversible, imagen, indicaciones, leyenda conceptual, 320/375/768/1440 px, ES/EN/FR, títulos sin colisiones, modo oscuro y movimiento reducido.
- `node scripts/verify-contact-scroll.mjs`: 5/5 comprobaciones aprobadas, sin errores de ejecución. Incluye retrato, ajuste de textos, teclado y movimiento reducido.
- `npm run lint`: cero errores; dos advertencias preexistentes en `scripts/capture-tour-code.js`.
- `npm run typecheck`, `npm test` (5 pruebas) y `npm run build`: aprobados.
- `git diff --check`: sin errores de espacios.
- Revisión visual en navegador real: el plano no tapa el encabezado ni controles del mapa; la villa y sus indicaciones quedan visibles. Capturas y mediciones en `output/playwright/villa-motion/` y `output/playwright/contact-scroll/`.

No se ha hecho un nuevo commit ni un despliegue. Se preservaron los cambios concurrentes ajenos a este alcance. Esta validación cubre los componentes modificados, no certifica todo el sitio.
