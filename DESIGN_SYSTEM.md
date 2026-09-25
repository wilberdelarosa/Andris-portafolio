# Sistema de diseño de Andris Peña

Sistema implementado, actualizado el 13 de septiembre de 2026. Fuentes: app/src/app/globals.css, hero.module.css, property-card.css, project-showcase.css, map-explorer.css, journey.css y premium-motion.css. Los tokens portables están en [docs/design/DESIGN.md](docs/design/DESIGN.md); sus extensiones, en [.impeccable/design.json](.impeccable/design.json).

## Dirección visual

Portafolio independiente de Andris Peña: blanco predominante, navy estructural, arena cálida y fotografía protagonista. Se conserva la portada aprobada: retrato real de traje centrado, ANDRIS detrás y PEÑA delante, arquitectura luminosa y textos laterales. En móvil se recompone como póster vertical. El nombre accesible permanece completo en un único H1.

El nuevo explorador comparte PropertyCard con el catálogo: fotografía amplia, información sobre vidrio navy, flechas manuales, contador, gesto horizontal y favorito. Sustituye la antigua ficha dividida del inicio. El selector se presenta en un lateral en escritorio y como lista horizontal desplazable en móvil.

## Paleta y tema

| Token | Valor | Uso |
| --- | --- | --- |
| --color-ink | #0B1F3A | Identidad, acciones y paneles navy. |
| --color-ink-soft | #132E4A | Superficie navy secundaria. |
| --color-blue | #316692 | Acento, foco y marcador seleccionado. |
| --color-sand | #D8C8B4 | Selección y acciones sobre navy. |
| --color-sand-deep | #C8B79C | Bordes seleccionados y respuesta de acciones. |
| --color-surface | #F4F0E6 | Base cálida. |
| --color-surface-raised | #FBF9F4 | Alternancia suave. |
| --color-text-muted | #4E5A6B | Texto secundario claro. |
| --on-ink | #FBF9F4 | Texto sobre navy. |
| --on-ink-muted | #C4D0DB | Apoyo sobre navy. |
| --ink-line | #38506A | Divisiones sobre navy. |
| --glass-ink | #0B1F3AD9 | Panel y controles sobre fotografía. |
| --glass-line | #FFFFFF38 | Borde del vidrio navy. |

| Token semántico | Claro | Oscuro |
| --- | --- | --- |
| --paper | #FFFFFF | #0B1F3A |
| --panel | #FFFFFF | #132E4A |
| --text | --color-ink | #FBF9F4 |
| --muted | --color-text-muted | #C4D0DB |
| --line | #DCE1E5 | #38506A |
| --soft | --color-surface-raised | #10263F |
| --nav-active | #EDF1F4 | #233E58 |
| --glass-paper | #FFFFFFF0 | #132E4AF0 |

El tema oscuro se aplica mediante data-theme; las preferencias incluyen claro, oscuro y sistema. El vidrio navy y su texto marfil permanecen estables en ambos temas. El desenfoque refuerza la separación, sin sustituir el fondo que sostiene el contraste. El dorado pertenece al logo original. La variante azul #2F5D8C de los tableros queda fuera de la paleta activa.

## Tipografía

Plus Jakarta Sans Variable es la familia principal. Cormorant Garamond 500 aparece en el nombre, la propuesta, la firma y el proyecto destacado; su cursiva introduce el énfasis editorial en los títulos de sección. Ambas se sirven localmente y sus licencias constan en app/THIRD-PARTY-NOTICES.md.

Los títulos generales usan peso 600, línea 1.14, tracking −0.035em y balance de líneas. H2 usa clamp(32px, 3.5vw, 50px). Los nombres del catálogo conservan la sans con peso 500. EditorialTitle combina una primera frase sans con un cierre en serif cursiva, manteniendo el texto y el nombre accesible completos. El nombre de tarjeta usa clamp(22px, 2.2vw, 30px), línea 1.2 y tracking −0.03em; la variante destacada usa Cormorant a clamp(38px, 4.7vw, 64px), con 40 px en móvil. EditorialTitle usa clamp(38px, 4.25vw, 62px), peso 500, línea 1.09 y tracking −0.055em; el énfasis mide 1.21em. En móvil usa clamp(34px, 8.7vw, 48px), con énfasis de 1.18em. Las palabras pueden saltar de línea individualmente.

La base de cuerpo es 15 px y línea 1.7; en móvil pasa a 14 px. Las introducciones mantienen medidas acotadas y tamaños de 15–16 px según contexto. Los importes y contadores comparables usan cifras tabulares. El monograma original convive con un nombre legible de interfaz; ese texto no recrea el dibujo del wordmark.

## Espacio, forma y profundidad

| Token | Valor |
| --- | --- |
| --content-max | 1440px |
| --page-gutter | clamp(20px, 5vw, 80px) |
| --space-section | clamp(72px, 8vw, 120px) |
| --radius-control | 8px |
| --radius-card | 16px |
| --shadow-overlay | 0 24px 80px #0B1F3A26 |
| --ease | cubic-bezier(0.22, 1, 0.36, 1) |

Los espacios agrupan contenido y separan funciones. Las tarjetas corresponden a proyectos, herramientas y acciones. Los párrafos no necesitan un contenedor individual. La profundidad nace de fotografía, navy y vidrio; la sombra compartida se reserva para superposiciones. Los controles de imagen usan blur de 18 px; el panel destacado usa 26 px y saturación 1.15. --glass-gradient comparte un degradado navy translúcido de 132 grados (#173653eb, #0b1f3adc al 54%, #29445bec). --editorial-accent usa azul en claro y arena en oscuro; los títulos sobre navy usan arena. La fotografía conserva esquinas discretas; círculos y cápsulas identifican controles y estados.

## Recorridos y componentes

| Recorrido o componente | Decisión vigente |
| --- | --- |
| Inicio | Portada, explorador de proyectos, mapa compacto, presentación breve y accesos a herramientas. Orienta sin repetir calculadora y formulario completos. |
| /proyectos | Catálogo de PropertyCard compartidas, filtros y vista de guardados. |
| /proyectos/[slug] | Dossier propio, galería y hechos confirmados; enlaces al mapa y contacto conservan proyecto. |
| /mapa | MapExplorer con MapLibre, OpenFreeMap y OpenStreetMap: tres puntos verificados, panel y marcadores sincronizados, edificios extruidos y perspectiva 3D activada inicialmente. Carga automática en inicio, fichas y mapa independiente, sin botón de activación. |
| /sobre-mi | Presentación ampliada, escena editorial del retrato de camisa blanca y proceso. Inicio mantiene solo el resumen y enlace. |
| /calculadora | Escenario editable con resultado navy. Los importes son ilustrativos, no una oferta vigente ni financiación prometida. |
| /contacto | Proyecto preseleccionado por enlace, etiquetas persistentes, consentimiento y resumen local revisable antes de elegir canal. Preparar el resumen no envía mensajes ni registra una consulta en servidor. |
| Encabezado | Marca y rutas con estado actual, idioma, tema, ajustes y contacto. Menú en diálogo cuando falta espacio. |
| Navegación móvil | Inicio, proyectos, mapa y contacto; respeta área segura. |
| PropertyCard | Imagen, ubicación, nombre, hechos confirmados, contador, flechas, gesto y favorito. CTA marfil a la ficha y acción de mapa. Sin avance automático. |
| Galería y Photo | Colección por proyecto, dimensiones reservadas, carga y recuperación de error contextual. Melcon conserva seis vistas con miniaturas, controles, teclado y gesto. |
| Proceso y preguntas | Numeración funcional del proceso; encabezados sin etiquetas ornamentales. Preguntas con details/summary nativos. |
| Diálogos | Galería, menú, preferencias y revisión contienen el foco, permiten cerrar y restauran el foco al origen. |

El enlace con parámetro proyecto conserva la selección al abrir mapa y contacto. El mapa ofrece acercamiento, vista general, estilo y cambio entre perspectiva 3D y plana; el estilo atenuado se aplica al lienzo de MapLibre. Mantener atribución y enlace externo de ubicación visibles. Al cambiar de tamaño, la vista general reencuadra los tres proyectos; una selección conserva su centro. El mapa compacto permite arrastrar y usar sus controles desde el inicio, y deja la rueda disponible para desplazar la página.

El catálogo autorizado el 13 de septiembre comprende Melcon Paradise, Terra Serena y The Beach at Punta Cana City Place. Solo Melcon tiene ficha escrita completa. Los otros dos presentan nombre, ubicación y renders verificados con detalles comerciales pendientes. No añadir precios, valoraciones, disponibilidad, fechas ni hechos de unidades para completar una tarjeta. La autoridad de contenido es [CONTENT-STATUS.md](docs/organization/CONTENT-STATUS.md).

## Movimiento, responsive y accesibilidad

La portada conserva entrada breve del nombre por máscaras, aparición del retrato y asentamiento del fondo, sin cortina de espera. Scroll y puntero fino aportan profundidad limitada; el contenido permanece visible sin esperar la animación. La escena ampliada del asesor mantiene el recorte real que rebasa el marco y sus desplazamientos cortos. EditorialTitle, DepthPanel y DecorativeLayer responden al scroll en ambas direcciones sin ocultar el contenido. Las capas ambientales se desplazan de 48 a −52 px; los paneles combinan desplazamiento corto y escala de 0.975 a 1. Las tarjetas siguen al ratón con un máximo de 2.2 grados y una luz radial; el gesto táctil conserva el desplazamiento y la galería. Botones, enlaces, miniaturas y accesos responden al hover. ReadingProgress indica el avance de lectura. prefers-reduced-motion mantiene estáticos los desplazamientos, la inclinación y la luz decorativa. La transición de ruta dura 180 ms y parte de contenido ya visible, incluso antes de ejecutar JavaScript.

La navegación de escritorio pasa a menú a 1120 px. A 760 px o menos, el selector de proyectos se vuelve horizontal, el mapa ocupa la parte superior y su panel pasa debajo. La tarjeta destacada ajusta su panel a 1000 y 600 px. El catálogo usa una, dos o tres columnas (40 y 68 rem). Los márgenes globales pasan a 24 px y la separación a 72 px en móvil; por debajo de 375 px, el margen es 18 px. Los puntos de ajuste heredados de 1190 y 1020 px siguen atendiendo otros elementos.

Botones generales de mínimo 52 px; CTA de tarjeta de 50 px; iconos y filtros de 44 px como base. Campos de mínimo 48 px, fondo panel, texto text y borde line, con etiquetas y errores asociados. El foco global es azul de 3 px y offset 5 px. Sobre tarjeta pasa a marfil, salvo el CTA marfil: contorno navy de 2 px, interior mediante outline-offset de −4 px.

Mantener semántica, un encabezado principal por ruta, salto al contenido, teclado, foco visible, contraste AA como objetivo, idiomas ES/EN/FR y ausencia de desbordamiento desde 320 px. Los estados de selección no dependen solo del color. No reutilizar etiquetas ornamentales ni reglas CSS antiguas sin uso como patrones nuevos.

## Recursos y verificación

Los originales permanecen en ASSETS y los derivados optimizados en app/public/derived. El retrato andris-suit.webp conserva la identidad y transparencia originales. hero-atmosphere-v3.webp es escenografía ficticia: marfil, travertino, sombras de palmas y abertura al mar. No representa un proyecto ofertado. La portada mantiene su lienzo local de hasta 1720 px, contorno de 12 px en escritorio y 9 px en móvil, y CTA en cápsula como decisiones de esa escena.

La arquitectura y las capas ambientales del asesor conservan su procedencia en [hero-atmosphere-v3-provenance.md](output/imagegen/hero-atmosphere-v3-provenance.md) y [ambient-assets-v1-provenance.md](output/imagegen/ambient-assets-v1-provenance.md). Las referencias privadas no son contenido publicable; revisar licencia y procedencia antes de reutilizar material externo.

Las capturas en .impeccable/review y output/playwright/journeys respaldan la composición observada. Una captura estática no certifica movimiento ni accesibilidad completa. La matriz de tamaños 320, 375, 768 y 1440 px, pruebas de teclado y scripts lint, typecheck, test y build se documentan en [REDESIGN-QA-2026-09-13.md](docs/design/REDESIGN-QA-2026-09-13.md). Esta guía no declara certificación ni despliegue. Mantenerla alineada con los tokens y [SKILLS.md](docs/design/SKILLS.md).

La ampliación de tipografía, movimiento y mapas automáticos se verifica por separado en [MOTION-QA-2026-09-13.md](docs/design/MOTION-QA-2026-09-13.md). Sus capturas y mediciones están en output/playwright/premium-motion. Las capas de palmas y plano costero son decorativas y reutilizan los derivados existentes.
