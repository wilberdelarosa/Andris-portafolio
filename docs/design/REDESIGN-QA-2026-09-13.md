# Rediseño y verificación — 13 de septiembre de 2026

## Resultado implementado

Se conserva la portada con el retrato y el nombre en capas. El bloque dividido de Melcon Paradise se sustituye por un selector de proyectos con fotografía intercambiable, información en vidrio navy, guardados, controles de imagen y gesto horizontal. Inicio presenta una selección, el mapa y al asesor; las herramientas completas tienen páginas propias.

| Ruta | Propósito | Siguiente paso |
| --- | --- | --- |
| `/` | Presentar a Andris y explorar una selección visual | Catálogo, ficha, mapa, asesor o herramienta |
| `/proyectos` | Filtrar por zona, datos confirmados y guardados | Ficha o ubicación del proyecto |
| `/proyectos/[slug]` | Fotos, información verificada, galería y ubicación | Consulta con el proyecto preseleccionado |
| `/mapa?proyecto=slug` | Explorar calles y proyectos, seleccionar marcador y ficha | Abrir proyecto o Google Maps |
| `/sobre-mi` | Presentación personal, proceso y preguntas | Calculadora o conversación |
| `/calculadora` | Preparar un escenario ilustrativo de pagos | Revisar importes y preguntas |
| `/contacto?proyecto=slug` | Preparar una consulta revisable | Copiar, descargar o abrir un canal oficial |

## Coherencia y reparaciones

- Navegación activa según la ruta real; menú y diálogos con foco contenido y devuelto al control de origen.
- Favoritos por identificador de proyecto en tarjeta, catálogo, ficha y diálogo. Eliminar Terra Serena no altera otro proyecto.
- Filtros de amenidades con claves estables al cambiar ES/EN/FR.
- Selección del mapa compartible mediante `proyecto`; panel, marcador y ficha sincronizados.
- Mapas de ficha e inicio reutilizan el explorador. En esta primera iteración las vistas compactas se activaban a petición; la solicitud posterior cambia todas las variantes a carga automática, documentada en MOTION-QA-2026-09-13.md.
- El cambio de estilo se aplica fuera del contenedor administrado por Leaflet: React conserva las clases que necesita el mapa para pintar sus imágenes.
- Error y reintento del mapa dejan disponibles la ficha y el enlace externo.
- Rejillas con tamaño mínimo explícito para impedir que los carruseles ensanchen la página móvil.
- Etiquetas y controles del formulario y proceso ajustados al contraste de su superficie en ambos temas.
- Metadatos específicos de cada ruta y dominio tomado de configuración; caché PWA incrementada a `ap-v5`.

## Herramientas y decisiones

Se usan Motion, Leaflet, Radix y Phosphor ya disponibles. El catálogo 21st aportó referencias de patrones de imagen y vidrio; la implementación utiliza los tokens, fotografías y componentes propios. No se instaló otro sistema de estilos. La referencia de tarjeta suministrada orienta la superficie y la interacción; no aporta datos inmobiliarios.

Se aplicaron las guías de dirección visual, tipografía, responsive, movimiento, accesibilidad y navegador establecidas por el proyecto. El navegador integrado no pudo conectarse al puente nativo de esta sesión; la verificación real se ejecutó en Chrome instalado mediante Playwright.

GitNexus se reindexó antes de los análisis. Los símbolos modificados fueron analizados antes de editar; el grafo informó riesgo bajo en los componentes principales y alcance medio en un helper de navegación de pruebas. La detección final del conjunto de cambios pendientes informó riesgo bajo. El índice tiene cobertura limitada de relaciones entre componentes y el diff también contiene trabajo previo; los recorridos de navegador son la evidencia adicional de integración. No se realizó commit.

## Verificación automatizada

- `npm run lint`: pasa.
- `npm run typecheck`: pasa.
- `npm run test`: 5 de 5 pruebas de cálculo.
- `npm run build`: pasa, rutas generadas correctamente.
- `verify-browser.mjs`: 42 de 42 comprobaciones; nueve páginas a 320, 375, 768 y 1440 px; imágenes, galería, calculadora, formulario, idiomas, 404 y consola.
- `verify-journeys.mjs`: 9 de 9 recorridos; selector, cambio de imágenes y gesto, favoritos persistentes, filtros y cambio de idioma, mapa, error/reintento, teclado y temas.
- Axe con etiquetas WCAG 2 A/AA y 2.1 AA: sin infracciones automáticas en siete rutas por cada tema claro/oscuro, incluyendo ES/EN/FR en la selección de rutas. Esta comprobación automática no equivale a certificación completa de accesibilidad.
- Auditoría adicional: 25 enlaces internos sin destinos o fragmentos rotos; transiciones de proyecto e imagen completadas con movimiento normal activado.
- Detector Impeccable: una ejecución, sin hallazgos. Revisión 21st: cinco archivos, sin hallazgos.

Informes: `output/playwright/browser-checks/report.json`, `output/playwright/journeys/report.json`, `accessibility.json` y `links-motion.json`. Capturas completas: `.impeccable/review/`; capturas de componentes: `output/playwright/journeys/`.

## Límites de entrega

Es una versión local de revisión, sin publicación. Mantiene los límites editoriales de CONTENT-STATUS.md: Melcon tiene ficha documentada; Terra Serena y The Beach cuentan con nombres, ubicaciones y renders verificados, con datos comerciales pendientes. No se añaden precios, disponibilidad o credenciales sin confirmar. La consulta se prepara localmente y no se presenta como mensaje enviado. Las pruebas no enviaron mensajes, no instalaron la PWA ni verificaron su actualización en un dispositivo físico. El mapa necesita conexión con OpenStreetMap.

## Revisión independiente

La primera revisión confirmó identidad, composición, renders, vidrio y adaptación de las ocho capturas. Solicitó dos ajustes materiales: foco visible en el CTA claro de las tarjetas y eliminación de rótulos redundantes sobre el proceso y el mapa. Ambos se aplicaron en una sola ronda.

La verificación posterior usa Tab en catálogo y selección de portada, en tema claro y oscuro: cuatro comprobaciones de foco con contorno navy de 2 px dentro del botón claro. Se recapturaron inicio, proceso y mapa a 375 y 1440 px, sin desbordamiento. Las imágenes del mapa se esperan completas antes de capturar. Evidencia: `.impeccable/review/fixes-validation.json` y `focus-*.png`. Lint, typecheck y build volvieron a pasar tras estos cambios.

Veredicto independiente: **ship**. El pase final calificó las dos correcciones como resueltas y no vio regresiones introducidas por ellas. Este veredicto final puntúa esa lista de correcciones; no constituye una nueva auditoría completa ni una certificación de accesibilidad.
