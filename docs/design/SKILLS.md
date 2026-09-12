# Habilidades del portafolio de Andris Peña

Este documento adapta el paquete de habilidades entregado por el usuario el 12 de septiembre de 2026 a las responsabilidades concretas del proyecto. Las habilidades permanecen instaladas en el entorno; no se duplican dentro de la aplicación.

El catálogo completo de rutas está en [docs/setup/SKILLS.md](../setup/SKILLS.md). Se comprobó la existencia de sus 28 archivos `SKILL.md` al preparar este documento. La existencia de una habilidad no significa que se haya ejecutado: las herramientas se usan según la tarea, y sus resultados se registran cuando existen.

## Dirección y responsabilidades aplicadas

El rediseño conserva los datos confirmados y reemplaza la composición anterior por la dirección descrita en [DESIGN.md](DESIGN.md). [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) es la referencia humana del sistema implementado en CSS.

| Responsabilidad | Habilidades del paquete | Aplicación en esta versión |
| --- | --- | --- |
| Dirección visual | `design-taste-frontend`, `frontend-design`, `ui-design`, `ui-ux-pro-max` | Objetivo de conversión explícito, encabezado horizontal, propuesta visible, retrato protagonista y secciones con funciones distintas. Estas habilidades informan decisiones; no requieren generar cuatro propuestas incompatibles. |
| Criterio de composición | `impeccable` | Dirección principal del rediseño: sustituir el lenguaje visual rechazado, fortalecer jerarquía, retirar adornos redundantes y concentrar la entrada animada en la portada. |
| Sistema y tipografía | `design-md`, `better-typography` | Tokens semánticos documentados, Plus Jakarta Sans como voz principal y títulos de peso 600; Cormorant Garamond en el nombre y propuesta de la portada, presentación y firma personal. No se afirma una exportación de Stitch. |
| Responsive y accesibilidad | `responsive-design` | Portada móvil como póster de nombre y retrato seguido de propuesta y acciones; navegación inferior, controles táctiles, foco visible, formularios etiquetados y alternativa con movimiento reducido. La matriz de comprobación se encuentra más abajo. |
| Interacciones | `framer-motion`, `emilkowal-animations`, `animate-text` | Entrada de retrato y texto, respuesta a acciones y transiciones con una curva compartida. El contenido debe seguir disponible sin animación. |
| Verificación | `playwright` y `browser-use:browser` o `browser-automation` | Inspección en navegador real de rutas, composición, contactos, formulario, galería, mapa, calculadora, idiomas y preferencias. Esta fila asigna responsabilidad; no certifica que las pruebas del rediseño estén terminadas. |

Las decisiones de estas filas están representadas por la estructura y el sistema de la aplicación. No son un registro de ejecución de todos los comandos de cada habilidad. La evidencia de pruebas debe identificar la versión revisada y conservarse separada de este documento.

## Aplicación demostrada durante el rediseño

- Se leyeron `design-taste-frontend`, `frontend-design`, `ui-design`, `better-typography`, `responsive-design`, `design-md`, `impeccable`, `framer-motion`, `emilkowal-animations` y `animate-text`. Sus criterios se aplicaron a la dirección, jerarquía, movimiento y adaptación documentados arriba.
- Se ejecutó `search.py` de `ui-ux-pro-max` para recomendaciones de UX y móvil.
- Se ejecutaron búsqueda y revisión de 21st. La revisión devolvió **0 errores y 0 advertencias**. Ese resultado corresponde al análisis de 21st; no sustituye la inspección visual ni todas las comprobaciones de accesibilidad.
- El arranque de `browser-use:browser` falló por el mecanismo de pipe nativo privilegiado que el entorno no consideró confiable. Se continuó con Playwright CLI y su API como alternativa funcional de navegador real. No se declara una inspección completada mediante `browser-use` ni mediante `browser-automation`.
- Figma, Stitch, Remotion y `site-cloner` permanecieron condicionales; no se utilizaron para producir este rediseño. No se generaron videos ni un archivo Figma/Stitch. La portada posterior sí utilizó `imagegen`, como se detalla a continuación.

Los resultados completos de rutas, tamaños y comandos de validación se registran en [IMPLEMENTATION-QA.md](IMPLEMENTATION-QA.md), separados de esta relación de herramientas.

## Portada según la última referencia del usuario

La composición central de traje y nombre monumental sustituye la portada dividida anterior por solicitud explícita del usuario. `impeccable`, `ui-design` y `ui-ux-pro-max` se aplicaron a una revisión independiente de dirección con los retratos y fondos existentes; se consultaron las recomendaciones de UX sobre movimiento reducido y separación táctil. La documentación de sistema se actualiza a partir del componente y sus estilos, sin atribuirla a una exportación de Stitch.

`imagegen` se utilizó mediante la herramienta integrada en una generación para crear una nueva escenografía arquitectónica editorial. El recurso es ficticio y decorativo; no representa una propiedad ofertada. El original, derivado WebP, dimensiones, prompt y procedencia se conservan en [hero-atmosphere-v3-provenance.md](../../output/imagegen/hero-atmosphere-v3-provenance.md). El retrato real de Andris sigue siendo un recurso independiente.

La búsqueda de inspiración en 21st empleó la consulta `Editorial portfolio hero oversized typography portrait layered parallax magnetic button text reveal luxury`. Devolvió estos metadatos:

- [3D Coverflow Carousel](https://21st.dev/@dg.singh252525/components/3-d-coverflow-carousel).
- [Editorial Collage Hero](https://21st.dev/@felipemenezes098/components/hero-04).
- [Quordix Work Hero](https://21st.dev/@quordix/components/quordix-work-hero).

No se recuperó ni incorporó código de esos componentes. Son referencias de composición y movimiento; la implementación usa las dependencias existentes. La revisión de 21st y los resultados de QA de la versión anterior no certifican esta nueva portada: su validación se documenta por separado cuando se complete.

## Habilidades condicionales

| Necesidad | Habilidades | Cuándo aplicarlas |
| --- | --- | --- |
| Narrativa por desplazamiento | `gsap-framer-scroll-animation` | Cuando la secuencia explique el proyecto o un proceso. No añadir secciones fijadas ni una segunda librería solo para aumentar efectos. |
| Exploración con Stitch | `stitch-design`, `stitch-loop` | Cuando se encargue una exploración o se trabaje con un proyecto Stitch. Adaptar sus resultados al sistema existente. |
| Trabajo en Figma | `figma-use`, `figma-generate-design`, `figma-implement-design`, `figma-generate-library` | Cuando exista un archivo Figma o se solicite producirlo. Leer `figma-use` antes de cada llamada a su herramienta. |
| Imágenes nuevas | `imagegen` | Cuando un recurso necesario no esté cubierto por los materiales aprobados. Guardar derivados y conservar los originales. No presentar una imagen generada como evidencia de un proyecto real. |
| Video exportable | `remotion-best-practices`, `remotion-ad-recreation` | Solo para una pieza de video solicitada. No son necesarias para animar esta interfaz. |
| Estudio de una web de referencia | `site-cloner`, `mirror-public-website` | Investigación privada del origen autorizado y revisión de licencia. Reconstruir con contenido y marca propios; no publicar la captura ni el sitio clonado. |

## Sustituciones del paquete

El paquete recibido informa que estas cuatro habilidades no están instaladas ni disponibles en su catálogo. No se declara una instalación ni una ejecución inexistente.

| Habilidad no disponible | Sustitución indicada por el usuario |
| --- | --- |
| `product-design:audit` | `design-taste-frontend` + `impeccable` + verificación con `playwright`. |
| `product-design:ideate` | `frontend-design` + `stitch-design` + `21st-ui-build`, según el material disponible. |
| `product-design:image-to-code` | `figma-implement-design` cuando exista Figma; en otro caso, `frontend-design` y comparación visual con `playwright`. |
| `product-design:url-to-code` | `site-cloner` o `mirror-public-website`, con revisión de procedencia y licencia y reconstrucción con el sistema propio. |

`site-cloner` sí tiene un archivo local en la ruta proporcionada por el paquete; su uso sigue condicionado a la necesidad de estudiar una referencia. No se confunde con las cuatro habilidades ausentes.

## Comprobaciones de entrega

Antes de considerar terminada una versión, documentar conjuntamente:

- Composición y ausencia de desbordamiento a 320, 375, 768 y 1440 px, con capturas de móvil y escritorio.
- Uso por teclado, foco visible y devolución de foco de diálogos, contraste AA y `prefers-reduced-motion`.
- Estados de carga, vacío, error, éxito y deshabilitado donde tengan sentido; no fabricar estados ajenos al flujo.
- Rutas principales y ficha, formulario y enlaces de contacto, galería, mapa, calculadora, favoritos, idiomas, tema y PWA.
- Resultados de `lint`, `typecheck`, `test` y `build` sobre la versión entregada.

La comprobación visual se realiza en lotes: inspección de escritorio y móvil, corrección conjunta de los hallazgos y confirmación. La evidencia de una versión anterior no prueba la calidad del rediseño actual. Este documento no certifica QA ni aprobación visual del usuario.

## Contenido y autoridad

La interfaz presenta exclusivamente a Andris Peña como asesor independiente. Las restricciones de [AGENTS.md](../../AGENTS.md) y los datos de [CONTENT-STATUS.md](../organization/CONTENT-STATUS.md) siguen vigentes. Las referencias aportan ideas; no autorizan a copiar su identidad, propiedades o afirmaciones. La solicitud directa del usuario guía el alcance y prevalece sobre recomendaciones genéricas de una habilidad.
