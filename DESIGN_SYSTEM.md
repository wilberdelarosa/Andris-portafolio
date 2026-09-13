# Sistema de diseño de Andris Peña

Referencia humana del rediseño en curso, derivada de `app/src/app/globals.css` y `app/src/components/hero.module.css`. Fecha: 12 de septiembre de 2026. Esta guía describe el sistema implementado; la validación de la versión se registra aparte.

## Idea visual

Un portafolio inmobiliario personal, claro y contemporáneo. El blanco predomina; el navy aporta estructura y confianza; los tonos cálidos conectan con los materiales de marca. La fotografía tiene una escala suficiente para comunicar lugares reales y la presencia de Andris. Cada sección resuelve una pregunta diferente: quién acompaña, qué proyecto explorar, dónde está, cómo organizar los pagos y cómo conversar.

El encabezado horizontal libera el ancho de la página. La portada interpreta la última referencia solicitada por el usuario: retrato de traje centrado, nombre monumental en dos planos y arquitectura luminosa como atmósfera. En escritorio, los textos y las acciones ocupan los laterales; en móvil se convierte en un póster vertical con nombre, retrato, propuesta y acción en una sola columna. Los proyectos mantienen su dossier de fotografía y datos, con navegación a una ficha propia.

## Colores de marca

Estos valores proceden del sistema original y se conservan.

| Token | Valor | Función |
| --- | --- | --- |
| `--color-ink` | `#0B1F3A` | Identidad navy, acciones principales y panel del resultado. |
| `--color-ink-soft` | `#132E4A` | Superficie navy secundaria y panel oscuro. |
| `--color-blue` | `#316692` | Único azul de acento, foco y controles. |
| `--color-sand` | `#D8C8B4` | Acento cálido, selección y acción sobre navy. |
| `--color-sand-deep` | `#C8B79C` | Detalles cálidos y superficie de controles. |
| `--color-surface` | `#F4F0E6` | Base cálida disponible. |
| `--color-surface-raised` | `#FBF9F4` | Alternancia suave de secciones. |
| `--color-text-muted` | `#4E5A6B` | Texto secundario en tema claro. |

El dorado pertenece al recurso de logo. No se introduce como un color adicional de texto pequeño o botón. La variante de azul `#2F5D8C` de los tableros originales no se utiliza junto al acento activo.

## Tokens semánticos y tema

| Token | Claro | Oscuro |
| --- | --- | --- |
| `--paper` | `#FFFFFF` | `#0B1F3A` |
| `--panel` | `#FFFFFF` | `#132E4A` |
| `--text` | `--color-ink` | `#FBF9F4` |
| `--muted` | `--color-text-muted` | `#C4D0DB` |
| `--line` | `#DCE1E5` | `#38506A` |
| `--soft` | `--color-surface-raised` | `#10263F` |
| `--nav-active` | `#EDF1F4` | `#233E58` |

`--on-ink: #FBF9F4`, `--on-ink-muted: #C4D0DB` y `--ink-line: #38506A` resuelven texto y divisiones sobre navy. Los componentes utilizan la función del token, en lugar de escoger colores por sección. El modo oscuro se aplica con `data-theme="dark"`; las preferencias incluyen claro, oscuro y sistema.

## Tipografía

- **Principal:** Plus Jakarta Sans Variable, servida localmente mediante Fontsource. Se usa en navegación, propuesta, encabezados, texto y controles.
- **Secundaria:** Cormorant Garamond 500, utilizada en el nombre monumental y la propuesta de la portada, además de la presentación personal y firma. Los títulos de las otras secciones conservan la familia principal.
- **Títulos:** peso 600, interlineado 1.14, tracking `-0.035em` y `text-wrap: balance`.
- **H2:** `clamp(32px, 3.5vw, 50px)`; la portada tiene su escala propia adaptada al espacio disponible.
- **Cuerpo:** 15 px y línea 1.7 como base; los textos de apoyo conservan una medida acotada. Los valores numéricos comparables usan cifras tabulares.
- **Marca:** monograma original en imagen acompañado por el nombre en texto de interfaz. Ese texto no pretende reproducir ni sustituir el dibujo del wordmark original.

Las licencias de fuentes y dependencias están registradas en `app/THIRD-PARTY-NOTICES.md`.

## Espacio y forma

| Token | Valor actual |
| --- | --- |
| `--content-max` | `1440px` |
| `--page-gutter` | `clamp(20px, 5vw, 80px)` |
| `--space-section` | `clamp(72px, 8vw, 120px)` |
| `--radius-control` | `8px` |
| `--radius-card` | `16px` |
| `--shadow-overlay` | `0 24px 80px #0B1F3A26` |

Los márgenes agrupan contenido relacionado y separan secciones. La fotografía usa esquinas discretas. Las tarjetas se reservan para fichas, herramientas o acciones; no son el molde de cada párrafo. Las líneas de división son finas. Las sombras corresponden a superposiciones, no a cada bloque.

## Superficies y componentes

| Superficie | Decisión |
| --- | --- |
| Encabezado | Marca a la izquierda, navegación compacta, idioma, tema, ajustes y contacto. El menú sustituye la navegación cuando falta espacio. |
| Portada | Retrato de traje centrado, ANDRIS detrás del retrato y PEÑA sobre el plano frontal inferior, en texto sólido. Laterales con propuesta, exploración y presentación; enlace a Melcon inmediatamente después. El nombre accesible permanece completo en un único H1. |
| Proyecto | Fotografía amplia junto a título, ubicación y hechos confirmados; galería de seis imágenes y ficha como acciones propias. Los renders se identifican como ilustrativos. |
| Ubicación | Mapa que se activa por decisión del visitante, con atribución y enlace a la ubicación confirmada. |
| Sobre Andris | Escena editorial con el recorte real de camisa blanca, el nombre vertical en segundo plano y arquitectura ficticia como atmósfera. El retrato puede rebasar el marco y responde de forma limitada al scroll y al puntero fino; la presentación y acción permanecen legibles. Sin citas atribuidas ni credenciales no confirmadas. |
| Proceso | Cuatro pasos de una secuencia real en lista ordenada. La numeración explica la secuencia y no decora el resto de secciones. |
| Simulador | Controles claros y resultado sobre navy. Los números y la distribución de pagos son el contenido principal; los importes se presentan como escenario editable. |
| Preguntas | `details` y `summary` nativos, con apertura comprensible y sin índices decorativos. |
| Contacto | Etiquetas persistentes, consentimiento y resumen antes de continuar por un canal real. Sin confirmaciones de envío inexistentes. |
| Diálogos | Galería, preferencias y revisión de consulta con foco contenido, cierre identificable y restauración de foco. En móvil se adaptan como paneles. |

La galería de Melcon reúne seis vistas: jardines y río, piscina, interior, habitación, vista aérea y Summer Gardens. Sus miniaturas, controles, teclado y gesto horizontal comparten la misma colección de contenido.

El componente `Photo` mantiene las dimensiones reservadas durante la carga, expone `aria-busy` y muestra una superficie de carga hasta recibir la imagen. El error sustituye la imagen por un mensaje; el reintento se ofrece donde corresponde, como en la galería, sin introducir botones dentro de otros controles.

Los botones principales tienen una altura mínima de 52 px. Las acciones de icono usan un espacio de 44 px como base. El estado activo responde al toque; el hover solo se especializa para dispositivos que disponen de él.

## Movimiento

La curva compartida es `cubic-bezier(0.22, 1, 0.36, 1)`. La portada reúne el momento principal: el nombre entra por máscaras, el retrato aparece con desplazamiento y opacidad, y el fondo se asienta con un acercamiento leve. El movimiento por scroll separa los planos del fondo y del retrato; la respuesta al puntero se limita a ratón y escritorio con puntero fino. El resto del movimiento acompaña acciones, imágenes y paneles. No se requiere desplazamiento para revelar contenido oculto.

Los efectos extensos se desactivan en móvil cuando perjudican la lectura. `prefers-reduced-motion` elimina animación y desplazamiento suave. La base visual debe estar disponible aunque JavaScript tarde o la animación no se ejecute.

## Adaptación y accesibilidad

El CSS transforma la composición en los puntos de ajuste de 1190, 1020, 760 y 374 px. La verificación exigida por el paquete de habilidades cubre **320, 375, 768 y 1440 px**; los puntos de ajuste y los tamaños de prueba tienen propósitos distintos.

En móvil, la portada dispone el nombre y retrato como un póster, seguidos de la propuesta, exploración y presentación. Sus columnas laterales no se comprimen; el texto secundario se reduce para preservar una jerarquía clara. El resto de las rejillas se apila, el simulador conserva un orden de lectura natural y aparece una navegación inferior que respeta el área segura del dispositivo. Evitar desbordamiento horizontal y preservar acciones útiles con textos en español, inglés y francés.

Mantener HTML semántico, un encabezado principal por ruta, enlace para saltar al contenido, etiquetas y errores asociados, contraste WCAG AA, foco visible y navegación por teclado. Selección, cursor de texto y scrollbar usan el sistema de color. Las imágenes decorativas llevan alternativa vacía; las de contenido describen el material sin inventar atributos.

## Recursos propios de la portada

El retrato `andris-suit.webp` conserva la identidad y transparencia del recorte original de Andris. El fondo `hero-atmosphere-v3.webp` se generó como escenografía editorial ficticia: pared marfil, travertino, sombras de palmas y una abertura hacia el mar. No representa Melcon Paradise ni constituye evidencia de una propiedad. La procedencia, el prompt y los archivos preservados se registran en [hero-atmosphere-v3-provenance.md](output/imagegen/hero-atmosphere-v3-provenance.md).

La portada amplía su lienzo hasta 1720 px y utiliza un contorno de 12 px en escritorio y 9 px en móvil, como decisiones locales de esta escena. El CTA adopta una cápsula con flecha circular; los controles y tarjetas del resto de la aplicación conservan sus tokens globales. Los velos de iluminación derivan del marfil y navy existentes, sin introducir otra paleta. El modo oscuro mantiene el mismo fondo bajo un velo navy.

## Mantenimiento

Las decisiones de composición se amplían en [docs/design/DESIGN.md](docs/design/DESIGN.md); las responsabilidades de habilidades en [docs/design/SKILLS.md](docs/design/SKILLS.md). Al modificar tokens o patrones, actualizar este documento y su implementación juntos. Conservar el contenido confirmado separado de componentes y recursos derivados. Esta guía no cambia las restricciones de marca, las confirmaciones pendientes ni el alcance de publicación.
