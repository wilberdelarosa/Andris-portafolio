# 21st: configuración e inspiración

Revisión: 2026-09-12.

## MCP en Claude Code

Se registró `21st` como servidor HTTP en `https://21st.dev/api/mcp`, con ámbito **local** de `E:/PROYECTOS WEB/AndrisPortafolio`.

- Configuración privada: `C:/Users/wilbe/.claude.json`.
- No se creó un `.mcp.json` del proyecto ni se incorporaron claves al repositorio.
- Verificación ejecutada: `claude mcp list`.
- Resultado: `21st: https://21st.dev/api/mcp (HTTP) - Connected`.
- El servidor `gitnexus` existente permaneció conectado y no fue modificado.

## Acceso y contexto

`21st usage` informa acceso de cuenta con búsquedas y recuperación de componentes ilimitadas incluidas. La generación de IA está deshabilitada; no se ejecutó `generate` ni `iterate`, ni se contrató o compró ningún servicio.

Se inicializaron `.21st/design.json` y `.21st/DESIGN.md`. Las decisiones y restricciones redactadas preservan la paleta de `docs/design/DESIGN.md`, la identidad independiente, la accesibilidad y el aumento de movimiento solicitado por el usuario. El escáner del CLI detecta archivos de raíz; las decisiones explícitas son la fuente relevante durante la creación inicial de `app/`.

## Búsquedas realizadas

Todas con `--context auto --type c --limit 5 --json`:

1. `editorial text reveal animation portfolio hero`
2. `image gallery hover reveal portfolio`
3. `sidebar personal portfolio navigation`

## Selección de referencias

| Componente | Encaje | Aplicación prevista |
| --- | --- | --- |
| [Portfolio Hero — waleedkibhen, #9037](https://21st.dev/@waleedkibhen/components/portfolio-hero) | Nombre grande, entrada con desenfoque y retrato superpuesto. | Composición protagonista de Andris; adaptar proporciones, colores y tipografía a la identidad existente. |
| [Text Reveal — cnippet-dev, #19727](https://21st.dev/@cnippet-dev/components/text-reveal) | Entrada escalonada por palabra, letra o línea. | Nombre y títulos editoriales; mantener texto semántico accesible y alternativa sin movimiento. |
| [Hero Scroll Video Pin Reveal — ajith66310, #25482](https://21st.dev/@ajith66310/components/hero-scroll-video-pin-reveal) | Tipografía cinética, máscaras y expansión visual al desplazar. | Inspiración de ritmo y recorte; no requiere agregar un video inexistente ni bloquear el desplazamiento. |
| [Portfolio Gallery — isaiahbjork, #7517](https://21st.dev/@isaiahbjork/components/portfolio-gallery) | Imágenes superpuestas y profundidad al pasar el puntero. | Hovers fotográficos sutiles; en móvil preferir desplazamiento controlado por la persona y contenido legible. |
| [Image Reveal — jatin-yadav05, #2522](https://21st.dev/@jatin-yadav05/components/image-reveal) | Máscara circular con desenfoque que sigue el cursor. | Inspiración puntual para retratos; conservar el contenido completo en táctil y reduced motion. |

La búsqueda de sidebar devolvió mayormente componentes de paneles administrativos. No se eligieron porque su densidad y navegación de equipos no encajan con este portafolio. La identidad lateral editorial se diseñará con los componentes de la propia aplicación.

## Reutilización

Las referencias anteriores son metadatos del catálogo 21st, no contenido biográfico ni comercial. Las imágenes de demos y sus textos no deben incorporarse a la web pública. No se instaló ningún componente ni dependencia en `app/` durante esta preparación.

Se recuperó una única referencia de código, `21st get 9037 --json`, mediante el acceso ilimitado ya existente. Quedó en `.21st/portfolio-hero-9037.json` para revisión interna; no forma parte del sitio. Procedencia: autor `waleedkibhen`, nombre `Portfolio Hero`, id de demo `9037`, id de componente `6037`.

El payload y el código no contienen una licencia específica, y la página pública accesible no permitió verificarla. **No se debe asumir licencia MIT ni copiar el componente a producción sin resolver su licencia**. Los [términos oficiales de 21st](https://docs.21st.dev/terms), revisados el 12 de septiembre de 2026, distinguen la licencia del código de los derechos sobre demos, imágenes y vistas previas. Para esta implementación conviene reinterpretar los patrones de movimiento con código propio y los recursos reales del proyecto.

Patrones útiles observados en el código:

- `IntersectionObserver` con umbral `0.1` activa la entrada del texto una vez.
- Segmentos por letras o palabras: desenfoque de `10px` a `0`, opacidad de `0` a `1` y desplazamiento vertical de `20px` a `0`.
- Escalonamiento de `50–100ms` por segmento y duración aproximada de `500ms`.
- Retrato superpuesto al nombre, con crecimiento leve al pasar el puntero.
- Solo React y lucide; estos efectos no requieren una librería de animación adicional.

Ajustes necesarios al reinterpretar: soporte de reduced motion, un `h1` semántico, tema persistente sin forzar oscuro, navegación con Escape y foco, acciones de desplazamiento reales, y composición que no choque en pantallas de poca altura. Evitar `transition: all` y animar propiedades concretas.

Verificación final del contexto: `21st init --design-context --check` respondió `Design context is current`.
