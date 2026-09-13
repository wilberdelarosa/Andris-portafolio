---
name: Andris Peña
description: Portafolio inmobiliario personal de fotografía protagonista, blanco, navy y arena.
colors:
  ink: "#0B1F3A"
  ink-soft: "#132E4A"
  blue: "#316692"
  sand: "#D8C8B4"
  sand-deep: "#C8B79C"
  surface: "#F4F0E6"
  surface-raised: "#FBF9F4"
  text-muted: "#4E5A6B"
  paper: "#FFFFFF"
  line: "#DCE1E5"
  nav-active: "#EDF1F4"
  on-ink: "#FBF9F4"
  on-ink-muted: "#C4D0DB"
  ink-line: "#38506A"
  glass-ink: "#0B1F3AD9"
  glass-line: "#FFFFFF38"
  glass-paper: "#FFFFFFF0"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontWeight: 500
  headline:
    fontFamily: "Plus Jakarta Sans Variable, sans-serif"
    fontSize: "clamp(32px, 3.5vw, 50px)"
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "-0.035em"
  property-title:
    fontFamily: "Plus Jakarta Sans Variable, sans-serif"
    fontSize: "clamp(22px, 2.2vw, 30px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Plus Jakarta Sans Variable, sans-serif"
    fontSize: "15px"
    lineHeight: 1.7
  control:
    fontFamily: "Plus Jakarta Sans Variable, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  control: "8px"
  card: "16px"
spacing:
  page-gutter: "clamp(20px, 5vw, 80px)"
  section: "clamp(72px, 8vw, 120px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.on-ink}"
  button-sand:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "14px 24px"
  property-action:
    backgroundColor: "{colors.on-ink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  property-card:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.card}"
  contact-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "13px 15px"
---

# Design System: Andris Peña

## Overview

**Creative North Star: "La persona y el lugar"**

El retrato real de Andris y las imágenes aportadas de los proyectos conducen un portafolio independiente, claro y contemporáneo. El blanco da espacio a la fotografía; el navy estructura identidad, lectura y acciones; la arena aporta calidez. Se conserva la portada aprobada con nombre monumental y retrato en planos.

La firma reutilizable del recorrido es la tarjeta fotográfica con información sobre vidrio navy. Las herramientas mantienen controles reconocibles y jerarquía directa. El movimiento acompaña entrada, imágenes y acciones; la información permanece disponible con movimiento reducido.

**Key Characteristics:**

- Retrato real, fotografía protagonista y renders identificados.
- Blanco, navy y arena con superficies semánticas para ambos temas.
- Sans para recorrer y operar; serif recta para la presencia personal y cursiva para énfasis editorial.
- Tarjeta compartida y selección visible entre recorridos.

Actualizado el 13 de septiembre de 2026 desde la aplicación implementada. El frontmatter contiene primitivas del tema claro; [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) documenta el tema oscuro y los recorridos. [.impeccable/design.json](../../.impeccable/design.json) guarda extensiones y ejemplos. Las capturas de .impeccable/review y output/playwright/journeys respaldan composición; no certifican movimiento, accesibilidad completa ni despliegue. La evidencia de ejecución vive en [REDESIGN-QA-2026-09-13.md](REDESIGN-QA-2026-09-13.md).

## Colors

Navy profundo, arena cálida y superficies claras conservan los materiales de marca.

### Primary

Navy (ink, ink-soft) para identidad, paneles y acciones. Azul (blue) como acento compartido para foco y estados interactivos.

### Secondary

Arena (sand, sand-deep) para selección, favorito guardado y acciones sobre navy.

### Neutral

Blanco y marfil (paper, surface, surface-raised) como lienzo y alternancia. text-muted, line y nav-active resuelven apoyo, límites y navegación. on-ink, on-ink-muted e ink-line sostienen lectura sobre navy. glass-ink, glass-line y glass-paper resuelven tarjetas, controles y superposiciones.

El tema oscuro adapta superficies y textos mediante tokens semánticos; el vidrio navy permanece estable. El dorado pertenece al logo original y la alternativa azul de los tableros no integra la paleta activa.

**The Color Role Rule.** Usar el token de la superficie y su texto asociado; no elegir una paleta nueva para cada sección.

## Typography

**Display Font:** Cormorant Garamond, con Georgia y serif como alternativas. **Body Font:** Plus Jakarta Sans Variable, con sans-serif como alternativa. Fuentes locales con licencias registradas en app/THIRD-PARTY-NOTICES.md.

La serif da presencia al nombre, propuesta, firma y proyecto destacado. EditorialTitle combina sans 500 con serif cursiva 500 para el cierre de la frase; acento azul sobre claro y arena sobre navy u oscuro. Las palabras conservan el salto de línea natural y el encabezado tiene un nombre accesible completo. La sans mantiene legibles datos y controles. El monograma conserva su recurso original; el nombre del encabezado es texto de interfaz.

La escala de encabezados generales combina tamaño fluido, peso 600 y balance de líneas. Los títulos de tarjeta y catálogo usan peso 500. La tarjeta destacada amplía su título a clamp(30px, 3.5vw, 48px), con 30 px en móvil compacto. El cuerpo base pasa a 14 px en móvil; introducciones entre 15 y 16 px según contexto. Contadores e importes comparables usan cifras tabulares. La escala monumental del hero permanece local a esa escena.

**The Heading Content Rule.** El encabezado explica su contenido; las etiquetas de render, ubicación, filtro y estado aportan información concreta. No añadir rótulos ornamentales encima de títulos.

## Layout

Contenedor general de 1440 px y escalas de margen y separación definidas en el frontmatter. A 760 px o menos: margen de 24 px y separación de 72 px; por debajo de 375 px: margen de 18 px. La portada conserva lienzo más ancho y composición móvil de póster.

El explorador combina tarjeta amplia y selector lateral de 310 px, ajustable a 260 px. A 760 px o menos, el selector se desplaza horizontalmente con ajuste de posición. Los hijos flexibles no deben forzar el ancho de página. El catálogo utiliza una, dos o tres columnas (40 y 68 rem).

El mapa independiente combina panel de 360 px y lienzo flexible; en móvil, mapa arriba y panel debajo. La navegación pasa a menú a 1120 px y la barra inferior móvil respeta el área segura.

Inicio orienta mediante portada, proyectos, mapa compacto, presentación breve y accesos. Catálogo, fichas, mapa, asesor, calculadora y contacto tienen rutas propias; la relación completa está en DESIGN_SYSTEM.md.

## Elevation & Depth

La profundidad nace de imagen y contraste de superficies. El vidrio navy separa datos y fotografía mediante fondo estable, borde claro y desenfoque. Los controles de imagen usan blur de 18 px; el panel, 24 px. La sombra compartida de superposición es 0 24px 80px #0B1F3A26.

**The Legible Glass Rule.** El desenfoque refuerza el panel; el fondo navy y el texto marfil deben sostener la lectura por sí mismos.

La curva compartida es cubic-bezier(0.22, 1, 0.36, 1). La portada conserva entrada con máscaras, retrato y profundidad limitada por scroll y puntero fino. El asesor ampliado conserva su recorte y movimiento propios. Las imágenes de tarjeta cambian manualmente, sin avance automático. Los títulos, paneles y capas ambientales responden al scroll descendente y ascendente. Las tarjetas siguen al ratón con inclinación máxima de 2.2 grados y luz radial; botones y enlaces tienen respuesta al hover. Las capas usan los derivados decorativos existentes. prefers-reduced-motion deja estos efectos estáticos, y la transición de ruta conserva contenido visible antes de ejecutar JavaScript.

## Shapes

Controles de esquinas suaves y tarjetas de mayor radio, según el frontmatter. Círculos y cápsulas corresponden a favoritos, flechas, filtros y estados. Los selectores usan bordes finos y fondo semántico. El retrato recortado y el nombre en capas pertenecen a las escenas personales.

## Components

### Buttons

Botón general de mínimo 52 px, CTA marfil de tarjeta de 50 px e iconos y filtros de 44 px como base. Colores adaptados al tema; la arena conserva texto navy. El foco global es azul (3 px, offset 5 px). Sobre tarjeta pasa a marfil, salvo su CTA marfil: contorno navy (2 px, offset −4 px). El hover responde al puntero compatible.

### Chips

Filtros y guardados con selección explícita. Un filtro sin resultados permanece operable y explica su estado. Las etiquetas sobre imagen identifican renders; no son adornos editoriales.

### Cards / Containers

PropertyCard comparte imagen, ubicación, nombre, hechos confirmados, favorito, contador, flechas y gesto horizontal. La variante destacada superpone el panel de vidrio; el catálogo apila imagen y contenido. El CTA abre la ficha y la acción de mapa conserva proyecto.

Photo reserva dimensiones, comunica carga y permite recuperación contextual. Cada galería mantiene su colección; Melcon conserva seis vistas con miniaturas, flechas, teclado y gesto.

### Inputs / Fields

Etiquetas persistentes, mínimo de 48 px, borde line, fondo panel y texto text. Errores asociados y consentimiento cuando corresponde. Contacto preselecciona el proyecto recibido por enlace y prepara un resumen local revisable. La selección posterior de un canal inicia la salida de la aplicación; preparar el resumen no envía una consulta.

### Navigation

Encabezado horizontal con monograma, rutas, idioma, tema, preferencias y contacto. Estado actual mediante aria-current. Menú en diálogo y cuatro accesos inferiores móviles: inicio, proyectos, mapa y contacto. Diálogos con cierre y restauración de foco.

### Map Explorer

Leaflet con OpenStreetMap y tres puntos verificados. Panel y marcadores comparten selección; el parámetro proyecto abre el punto desde otra ruta. Todas las variantes cargan automáticamente: inicio, fichas y ruta independiente. La rueda en los compactos desplaza la página; arrastre y controles están disponibles desde la carga. El encuadre general se adapta al cambio de tamaño y conserva los tres marcadores. Controles de acercamiento, vista general y estilo, con atribución y enlace externo. El estilo atenuado se aplica al envoltorio y preserva las clases de interacción administradas por Leaflet.

### Personal scenes and tools

Portada con retrato real de traje, ANDRIS detrás y PEÑA delante; H1 accesible con nombre completo. Inicio resume al asesor y enlaza la escena ampliada. El proceso usa numeración funcional y las preguntas details/summary. Calculadora con cifras editables y resultado navy como escenario ilustrativo.

## Do's and Don'ts

### Do:

- **Do** preservar el nombre Andris Peña, monograma original, retratos reales y paleta existente.
- **Do** reutilizar la tarjeta y conservar proyecto entre ficha, mapa, favoritos y consulta.
- **Do** mantener semántica, teclado, foco visible, contraste AA como objetivo y reducción de movimiento; validar a 320, 375, 768 y 1440 px en ES/EN/FR y ambos temas.
- **Do** conservar originales, optimizar derivados e identificar renders y ambientación ficticia.

### Don't:

- **Don't** inventar precios, disponibilidad, fechas, testimonios, valoraciones, contactos o credenciales. Melcon Paradise, Terra Serena y The Beach at Punta Cana City Place están autorizados; solo Melcon tiene ficha escrita completa. Los otros dos conservan detalles comerciales pendientes según CONTENT-STATUS.md.
- **Don't** convertir rótulos ornamentales, valores locales del hero o CSS antiguo sin uso en nuevos patrones del sistema.
- **Don't** publicar referencias privadas ni material externo sin procedencia y licencia revisadas.
- **Don't** presentar fondos generados como proyectos reales. Sus procedencias se conservan en output/imagegen/hero-atmosphere-v3-provenance.md y output/imagegen/ambient-assets-v1-provenance.md.
- **Don't** declarar envío, accesibilidad certificada o despliegue a partir de una captura o estado local.

## Ampliación de movimiento y tipografía

La solicitud posterior del usuario incorpora mezcla sans/serif cursiva, vidrio con degradado, hovers y profundidad reversible debajo de la portada. premium-motion.tsx y premium-motion.css reúnen estos patrones con Motion ya instalado. --glass-gradient define un degradado navy translúcido compartido; --editorial-accent adapta la cursiva al tema. El panel destacado usa blur de 26 px. Las especificaciones completas y escalas viven en DESIGN_SYSTEM.md. Evidencia de esta iteración: [MOTION-QA-2026-09-13.md](MOTION-QA-2026-09-13.md).
