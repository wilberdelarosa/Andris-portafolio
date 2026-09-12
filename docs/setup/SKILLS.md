# Paquete de habilidades para el sitio de Andris

Las habilidades se instalan en el entorno de Codex, no dentro de una carpeta de cada proyecto. Este documento las activa como política de trabajo para este repositorio y evita copias locales que se queden obsoletas.

## Rutas verificadas de las habilidades

Estas rutas apuntan al archivo de instrucciones que una IA debe leer al aplicar una habilidad. Fueron verificadas el 2026-09-12.

| Habilidad | Ruta de `SKILL.md` |
| --- | --- |
| `design-taste-frontend` | `C:\Users\wilbe\.agents\skills\design-taste-frontend\SKILL.md` |
| `frontend-design` | `C:\Users\wilbe\.agents\skills\frontend-design\SKILL.md` |
| `responsive-design` | `C:\Users\wilbe\.agents\skills\responsive-design\SKILL.md` |
| `ui-design` | `C:\Users\wilbe\.agents\skills\ui-design\SKILL.md` |
| `better-typography` | `C:\Users\wilbe\.codex\skills\better-typography\SKILL.md` |
| `playwright` | `C:\Users\wilbe\.codex\skills\playwright\SKILL.md` |
| `browser-automation` | `C:\Users\wilbe\.agents\skills\browser-automation\SKILL.md` |
| `browser-use:browser` | `C:\Users\wilbe\.codex\plugins\cache\openai-bundled\browser-use\0.1.0-alpha2\skills\browser\SKILL.md` |
| `design-md` | `C:\Users\wilbe\.agents\skills\design-md\SKILL.md` |
| `impeccable` | `C:\Users\wilbe\.agents\skills\impeccable\SKILL.md` |
| `ui-ux-pro-max` | `C:\Users\wilbe\.codex\skills\ui-ux-pro-max\SKILL.md` |
| `framer-motion` | `C:\Users\wilbe\.agents\skills\framer-motion\SKILL.md` |
| `emilkowal-animations` | `C:\Users\wilbe\.agents\skills\emilkowal-animations\SKILL.md` |
| `gsap-framer-scroll-animation` | `C:\Users\wilbe\.agents\skills\gsap-framer-scroll-animation\SKILL.md` |
| `animate-text` | `C:\Users\wilbe\.agents\skills\animate-text\SKILL.md` |
| `remotion-best-practices` | `C:\Users\wilbe\.agents\skills\remotion-best-practices\SKILL.md` |
| `remotion-ad-recreation` | `C:\Users\wilbe\.codex\skills\remotion-ad-recreation\SKILL.md` |
| `figma-use` | `C:\Users\wilbe\.codex\skills\figma-use\SKILL.md` |
| `figma-implement-design` | `C:\Users\wilbe\.codex\skills\figma-implement-design\SKILL.md` |
| `figma-generate-design` | `C:\Users\wilbe\.codex\skills\figma-generate-design\SKILL.md` |
| `figma-generate-library` | `C:\Users\wilbe\.codex\skills\figma-generate-library\SKILL.md` |
| `stitch-design` | `C:\Users\wilbe\.agents\skills\stitch-design\SKILL.md` |
| `stitch-loop` | `C:\Users\wilbe\.agents\skills\stitch-loop\SKILL.md` |
| `imagegen` | `C:\Users\wilbe\.codex\skills\.system\imagegen\SKILL.md` |
| `21st-ui-build` | `C:\Users\wilbe\.codex\skills\21st-ui-build\SKILL.md` |
| `21st-ui-review` | `C:\Users\wilbe\.codex\skills\21st-ui-review\SKILL.md` |
| `site-cloner` | `C:\Users\wilbe\clawd\.agents\skills\site-cloner\SKILL.md` |
| `mirror-public-website` | `C:\Users\wilbe\.codex\skills\mirror-public-website\SKILL.md` |

`product-design:audit`, `product-design:ideate`, `product-design:image-to-code` y `product-design:url-to-code` no tienen una ruta local porque no están instaladas ni figuran en el catálogo instalable actual. Usa las sustituciones de la sección siguiente.

## Obligatorio para toda interfaz

| Etapa | Habilidades | Resultado exigido |
| --- | --- | --- |
| Dirección UX/UI | `design-taste-frontend`, `frontend-design`, `ui-design`, `ui-ux-pro-max` | Objetivo de la página, jerarquía, CTA principal y dirección visual coherente. |
| Sistema y documentación | `design-md`, `better-typography` | Tokens semánticos y actualización de `docs/design/DESIGN.md`. |
| Responsive y accesibilidad | `responsive-design` | Revisión explícita a 320, 375, 768 y 1440 px; teclado, foco, contraste AA y movimiento reducido. |
| Calidad visual | `impeccable` | Revisión de espaciado, alineación, estados y consistencia. |
| Navegador real | `playwright` + `browser-use:browser` o `browser-automation` | Rutas críticas, formularios, consola y capturas de escritorio y móvil verificadas. |

## Según la necesidad

| Necesidad | Habilidades autorizadas | Regla |
| --- | --- | --- |
| Microinteracciones React | `framer-motion`, `emilkowal-animations` | Anima solo transform y opacidad cuando sea posible; respeta `prefers-reduced-motion`. |
| Narrativa por scroll | `gsap-framer-scroll-animation` | Úsala solo si comunica una historia de propiedad o proceso. No usar scroll complejo como adorno. |
| Tipografía animada | `animate-text` | Restringirla a un momento clave; nunca debe impedir leer ni afectar el rendimiento. |
| Video exportable | `remotion-best-practices`, `remotion-ad-recreation` | Solo si se solicita una pieza de video. |
| Figma | `figma-use`, `figma-generate-design`, `figma-implement-design`, `figma-generate-library` | Aplicar `figma-use` antes de herramientas de Figma. |
| Exploración visual | `stitch-design`, `stitch-loop`, `21st-ui-build`, `21st-ui-review` | Mantener los tokens y las restricciones de marca de este repositorio. |
| Imagen propia | `imagegen` | Guardar el resultado como derivado; no sustituir los originales de `ASSETS/`. |
| Referencia externa | `site-cloner`, `mirror-public-website` | Tratarla como inspiración privada, documentar procedencia y revisar licencia antes de publicar. |

## Sustituciones configuradas

Las habilidades `product-design:audit`, `product-design:ideate`, `product-design:image-to-code` y `product-design:url-to-code` no están presentes en las fuentes instalables actuales del entorno. Hasta que estén disponibles, se cubren así:

| Función solicitada | Sustitución aprobada |
| --- | --- |
| Auditoría de UX | `design-taste-frontend` + `impeccable` + pruebas de `playwright`. |
| Ideación de interfaz | `frontend-design` + `stitch-design` + `21st-ui-build`. |
| Imagen a código | `figma-implement-design` si existe Figma; si no, `frontend-design` con `playwright` visual. |
| URL a código | `site-cloner` o `mirror-public-website`, respetando licencia y reconstruyendo con el sistema de Andris. |

## Reglas de marca y contenido

- El sitio es de **Andris Peña, asesor independiente**. Nunca menciones ni incluyas “Leaf Glass”, “Leafglass” o variaciones.
- Las referencias externas y ARCke nunca se copian literalmente ni se publican sin revisar procedencia y licencia.
- No inventes precios, propiedades, testimonios, contactos ni disponibilidad.

## Puerta de entrega

Toda ruta relevante debe tener: estados loading, empty, error, success y disabled cuando correspondan; pruebas a 320, 375, 768 y 1440 px; teclado y foco; contraste AA; reducción de movimiento; captura visual; y resultados de `lint`, `typecheck`, `test` y `build` cuando la aplicación exista.
