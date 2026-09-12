# Verificación del rediseño de Andris Peña

Fecha: 12 de septiembre de 2026. Esta evidencia sustituye el informe de la primera versión rechazada. Aplicación local de producción: http://localhost:3001.

La portada se actualizó nuevamente siguiendo la referencia visual posterior del usuario. Su evidencia vigente está en [HERO-V3-QA.md](HERO-V3-QA.md) y `output/playwright/hero-v3/`. La suite funcional completa se volvió a ejecutar sobre esta portada: 15/15. Las capturas `redesign-final-*` de abajo documentan la versión anterior y ya no representan el hero actual.

## Resultado técnico

- `npm run lint`: aprobado.
- `npm run typecheck`: aprobado.
- `npm test`: 5 pruebas de cálculo aprobadas, incluidos redondeos, asignación completa y entradas inválidas.
- `npm run build`: aprobado con Next.js 16.3.5.
- `BASE_URL=http://localhost:3001 npm run test:browser`: **15/15 comprobaciones aprobadas**.
- Inicio y ficha Melcon revisados a 320, 375, 768 y 1440 px: sin desbordamiento horizontal y con imágenes visibles decodificadas.
- Galerías de ambas rutas, teclado, navegación entre fotos y salida con Escape.
- Simulador: ejemplo 240,000 USD / 12 meses / 40% produce 8,000 USD mensuales; estado inválido visible y recuperación.
- Formulario: validación nativa y consulta revisable. La prueba no abrió canales externos ni envió datos.
- Idiomas español, inglés y francés desde controles reales; URL e idioma del documento sincronizados.
- Ruta inexistente devuelve HTTP 404 y ofrece recuperación.
- Cero errores de consola o excepciones JavaScript en la suite final.

Informe reproducible y capturas: `output/playwright/browser-checks/report.json` y archivos de la misma carpeta. El comando se documenta en `app/README.md`.

## PWA, imagen y accesibilidad

La prueba de producción registró `ap-v4-shell`, `ap-v4-pages` y `ap-v4-assets`. Una recarga sin conexión mantuvo la página y el simulador: 180,000 USD produjo 3,000 USD mensuales con los porcentajes iniciales. El píxel de la esquina del recorte de Andris conservó alfa 0 después de cargar desde caché. La causa y regresión del fallo de transparencia están en `PWA-IMAGE-FIX.md`.

Manifest comprobado: `display: standalone`, tres variantes de icono y ruta inicial `/`. La interfaz ofrece instalación nativa cuando el navegador la admite, o instrucciones en ajustes; no se afirma instalación física en iPhone o Android.

Axe WCAG 2 A/AA y 2.1 AA: cero infracciones detectadas en la página de inicio clara y oscura. Esto es una revisión automática, no una certificación completa. Controles de ajustes y menú a 320 px medidos en 44 × 44. Movimiento reducido comprobado; la duración CSS de entrada se reduce a `1e-05s`.

## Revisión visual y correcciones

Composición vigente: navegación horizontal, portada con retrato central de traje, nombre monumental en capas y fondo arquitectónico generado, seguida del dossier de Melcon, recorrido fotográfico, mapa, asesoría, proceso, simulador y contacto. La referencia posterior del usuario recupera deliberadamente las letras alrededor del retrato. Se conservan las decisiones de las demás secciones y la secuencia informativa del proceso.

La revisión independiente pidió corregir controles táctiles y confirmar la evidencia de las animaciones. Se corrigieron sus dimensiones, el tamaño del monograma y la recuperación 404. Las máscaras de entrada liberan la composición al terminar. Las capturas definitivas esperan a que terminen tanto la transición de tema como las animaciones reactivadas al cambiar de breakpoint.

Capturas históricas del rediseño anterior en `output/playwright/`:

- `redesign-final-desktop.png`
- `redesign-final-mobile.png`
- `redesign-final-320.png`
- `redesign-final-dark.png`
- `redesign-final-offline.png`
- `browser-checks/home-768.png`
- `browser-checks/melcon-1440.png`
- `browser-checks/not-found-375.png`

El detector Impeccable produjo una observación informativa sobre la cuadrícula del mapa, precisamente una superficie de mapa; no un fallo mecánico. 21st review: cero errores, cero advertencias y 34 sugerencias informativas, principalmente declaraciones de color en el sistema de tokens. No se reutilizó código de licencia desconocida.

## Alcance de entrega

Versión local preparada para revisión. El portafolio publica únicamente Melcon Paradise. Otros proyectos, cursos y datos comerciales contradictorios siguen fuera hasta confirmación. Los contactos corresponden a los proporcionados por el usuario. La API de lectura y la capa de contenido se conservan para un CMS futuro; no se añadió una base de datos innecesaria.

Revisión independiente del rediseño anterior cerrada: controles, logo, 404 y evidencia del tema oscuro resueltos. El título de tres líneas fue sustituido posteriormente por el nombre monumental; ver la revisión vigente en `HERO-V3-QA.md`.
