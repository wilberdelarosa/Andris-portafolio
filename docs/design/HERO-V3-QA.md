# Portada de Andris: composición central

Verificación del 12 de septiembre de 2026 sobre producción local en http://localhost:3001. Corresponde a la referencia posterior del usuario: nombre monumental, retrato de traje y fondo arquitectónico integrado. Sustituye las capturas de portada `redesign-final-*`.

## Implementación revisada

- `app/src/components/hero.tsx`: estructura semántica, enlaces reales a proyectos, presentación y contacto, retrato original transparente y profundidad reactiva con Motion.
- `app/src/components/hero.module.css`: composición por capas, entrada finita de nombre/retrato/fondo, transiciones de acciones, tema oscuro y póster móvil. Se retiraron 80 reglas obsoletas del hero en el CSS global.
- `app/src/content/hero-copy.ts`: textos en español, inglés y francés separados de la interfaz.
- `app/public/derived/hero-atmosphere-v3.webp`: escenografía editorial generada, 1774 × 887 px y 129,502 bytes. No representa una propiedad ofertada. Original y prompt preservados en `output/imagegen/`.

La revisión GitNexus de `Hero` informó riesgo LOW, cero dependencias directas y cero procesos afectados en su índice. Se conservan navegación, rutas y funciones del resto de la aplicación.

## Resultado de comprobaciones

- `npm run lint`: aprobado, incluida la revisión posterior a los cambios finales.
- `npm run typecheck`: aprobado.
- `npm test`: 5 pruebas aprobadas.
- `npm run build`: aprobado con Next.js 16.3.5.
- `BASE_URL=http://localhost:3001 npm run test:browser`: 15/15, con inicio y Melcon en cuatro tamaños, galería, simulador, formulario, idiomas, 404 y consola.
- `node scripts/check-hero-v3.mjs`: 11 comprobaciones de composición/accesibilidad/movimiento más una comprobación PWA aprobada mediante repetición específica. El informe combinado conserva la procedencia de esa repetición.
- 21st review de los dos archivos de interfaz: 0 errores, 0 advertencias y 14 sugerencias informativas sobre colores alfa derivados de la paleta.

La primera pasada funcional detectó que el H1 tenía altura cero en escritorio al contener solo elementos posicionados. Se corrigió su geometría manteniendo las capas y se repitió la suite completa: 15/15.

## Imágenes, temas e interacción

Revisados 320, 375, 768 y 1440 px, ambos temas y francés móvil. Sin desbordamiento horizontal ni recursos de portada faltantes. El nombre completo conserva un único H1 accesible y los enlaces apuntan a secciones existentes o a la ficha real de Melcon.

El cursor mueve el retrato en escritorio y vuelve a su posición al salir. La alternativa de movimiento reducido registra cero animaciones activas y desplazamiento de puntero exactamente 0,0. El movimiento móvil del retrato por scroll se desactiva para conservar su separación respecto al texto.

Axe del hero claro y oscuro: cero infracciones detectadas y 12 reglas aprobadas por tema. El contraste sobre la fotografía queda marcado como incompleto por la herramienta; se complementó con inspección visual. Esto no es una certificación automática exhaustiva de contraste.

La revisión visual independiente de siete capturas confirmó el fundido móvil a todo el ancho, retrato limpio, nombre legible, acciones distinguibles y ausencia de colisiones en los tamaños revisados. No solicitó más cambios para este alcance.

## Comprobación sin conexión

Después de visitar la página y precalentar recursos, se bloqueó la red del contexto del navegador. La petición no cacheada a `/api/v1/health` fue rechazada; la recarga del documento llegó desde el service worker, las tres imágenes del hero se decodificaron, el retrato conservó alfa 0 y no hubo desbordamiento a 375 px. La captura muestra el aviso de falta de conexión.

La primera aserción comprobaba `navigator.onLine`, que Chrome mantuvo en `true` al emular el bloqueo después de la recarga. Se corrigió el helper para demostrar el fallo de red y el origen cacheado del documento. No se cambió la aplicación para acomodar esa peculiaridad del navegador de prueba. La repetición específica y sus observaciones están en `report-pwa.json`; el informe inicial se conserva por trazabilidad.

## Evidencia

Carpeta: `output/playwright/hero-v3/`.

- `report.json`: resultados combinados de la versión final.
- `report-pwa.json`: repetición específica sin conexión.
- `es-light-1440.png`, `es-light-768.png`, `es-light-375.png`, `es-light-320.png`.
- `es-dark-1440.png`, `es-dark-375.png`, `fr-light-375.png`.
- `es-light-reduced-motion-1440.png`, `es-light-offline-375.png`.

La suite de recorridos completa conserva su informe separado en `output/playwright/browser-checks/report.json`. Se trabajó y comprobó en local; no se desplegó en un dominio público ni se enviaron consultas a terceros.
