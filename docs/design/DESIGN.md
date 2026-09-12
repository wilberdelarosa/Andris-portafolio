# Dirección visual de Andris Peña

Rediseño del 12 de septiembre de 2026, actualizado con la referencia de portada enviada posteriormente por el usuario. El objetivo del sitio sigue siendo presentar a Andris Peña como asesor independiente y convertir visitas en conversaciones sobre proyectos confirmados.

## Dirección elegida

**Blanco predominante, retrato central, nombre monumental y arquitectura luminosa en la portada; secciones claras y tipografía sans en el resto del recorrido.** La referencia más reciente del usuario recupera deliberadamente la composición del nombre y retrato en capas y sustituye la portada dividida anterior. Esa solicitud prevalece sobre las restricciones de composición registradas en versiones previas de este documento.

El encabezado permanece horizontal. En escritorio, el retrato de traje se sitúa en el centro: ANDRIS ocupa el plano posterior y PEÑA el plano frontal inferior, ambos en serif sólida. La propuesta y el CTA de exploración quedan a la izquierda; el acompañamiento y la presentación, a la derecha. La arquitectura, el retrato y el nombre forman tres planos de profundidad. En móvil, la escena se transforma en un póster vertical, con nombre y retrato seguidos de propuesta y acciones. El acceso al proyecto confirmado aparece a continuación.

La entrada del retrato, del nombre y de la luz concentra el gesto visual principal. Las interacciones de galería, proyectos, mapa y calculadora mantienen sus respuestas propias. La nueva portada vive en `app/src/components/hero.tsx`, `hero.module.css` y `app/src/content/hero-copy.ts`, separada de las reglas generales.

El sistema completo de tamaños, componentes, superficies y temas está en [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md). El catálogo de responsabilidades está en [SKILLS.md](SKILLS.md). Este documento define dirección, no certifica resultados de QA ni aprobación visual del usuario.

## Paleta preservada

| Token de marca | Valor |
| --- | --- |
| `--color-ink` | `#0B1F3A` |
| `--color-ink-soft` | `#132E4A` |
| `--color-blue` | `#316692` |
| `--color-sand` | `#D8C8B4` |
| `--color-sand-deep` | `#C8B79C` |
| `--color-surface` | `#F4F0E6` |
| `--color-surface-raised` | `#FBF9F4` |
| `--color-text-muted` | `#4E5A6B` |

Los colores proceden de los tableros de marca entregados. `--paper` introduce el blanco como superficie predominante y conserva el navy y arena originales en identidad, texto, acciones y herramienta de pagos. El tema oscuro adapta las superficies mediante tokens semánticos. Se usa un solo azul de acento por página. La alternativa `#2F5D8C` de los tableros queda fuera de la paleta activa. El dorado se conserva en los recursos originales de logo; no se añade a controles o texto pequeño.

## Jerarquía y tipografía

Plus Jakarta Sans es la familia principal, con encabezados de peso 600 y una escala claramente diferenciada del cuerpo. Cormorant Garamond 500 da carácter al nombre monumental y a la propuesta de la portada, además de la presentación personal o firma. Los demás títulos de sección conservan su jerarquía sans. Ambas fuentes se sirven localmente y sus licencias figuran en `app/THIRD-PARTY-NOTICES.md`.

El monograma original conserva la identidad de marca. El nombre escrito junto a él funciona como texto legible de interfaz; no se intenta recrear el dibujo del wordmark. El nombre artístico de la portada tiene un único equivalente accesible completo en el H1. Los encabezados del recorrido expresan su contenido por sí mismos; se conservan fuera las etiquetas redundantes, numeración decorativa y citas no confirmadas.

## Secciones

1. **Encabezado:** marca, navegación, idioma, preferencias y contacto.
2. **Portada:** retrato central de Andris en traje y nombre en capas, escenografía arquitectónica luminosa, propuesta, CTA de exploración y acceso al proyecto real.
3. **Proyecto:** Melcon Paradise como dossier de imágenes y datos confirmados, con galería y ficha propia. Solo se publica el proyecto aprobado.
4. **Ubicación:** punto confirmado de Melcon, enlace de ubicación y mapa activable con atribución.
5. **Asesor:** fotografía de costa y una presentación personal directa, sin biografía ampliada, cursos o certificaciones inventados.
6. **Proceso:** cuatro pasos legibles desde escuchar prioridades hasta preparar la conversación siguiente.
7. **Simulador:** escenario de pagos editable, controles claros y resultado sobre navy. No representa una oferta vigente ni promete financiación.
8. **Preguntas:** respuestas en desplegables nativos para acompañar la decisión.
9. **Contacto:** teléfono y correo confirmados, consulta revisable y elección explícita del canal.

La ficha de proyecto reutiliza los componentes pertinentes. No se completa la cartera con nombres, precios o ubicaciones no aprobados.

## Imágenes y movimiento

Usar los derivados optimizados de `app/public/derived/`, preservando los originales en `ASSETS/`. El recorte `andris-suit.webp` conserva el retrato real de Andris y su transparencia. El fondo `hero-atmosphere-v3.webp` fue generado mediante `imagegen`: arquitectura marfil y travertino, sombras de palmas y una abertura lateral hacia un mar sin hitos identificables. Es una escenografía editorial ficticia, no una propiedad ofertada ni una fotografía documental de Melcon. El original, la optimización y el prompt están registrados en [hero-atmosphere-v3-provenance.md](../../output/imagegen/hero-atmosphere-v3-provenance.md). Los renders del proyecto siguen identificados como imágenes ilustrativas.

La animación guía la atención hacia la entrada con máscaras del nombre, desplazamiento y opacidad del retrato, y acercamiento suave del fondo. Un movimiento limitado por scroll separa los planos; la respuesta del retrato al ratón funciona solo en escritorio con puntero fino. Se respeta `prefers-reduced-motion` y el contenido base permanece visible. El texto debe ser legible sin esperar una secuencia prolongada. Los hovers se reservan para puntero fino; en móvil las acciones son visibles y táctiles. No se introducen cargadores artificiales para retrasar el contenido.

## Responsive y accesibilidad

En móvil, la portada se recompone como póster vertical: nombre y retrato centrados, base del retrato fundida con la escena y propuesta y acciones debajo. Los textos laterales de escritorio no se encogen hasta resultar ilegibles. Las demás columnas se apilan con su jerarquía propia. La navegación inferior permite acceder a los recorridos principales; las preferencias y la galería se adaptan a paneles cómodos de tocar. El espacio inferior respeta el área segura del dispositivo.

La entrega requiere revisión a 320, 375, 768 y 1440 px, navegación por teclado, foco visible, contraste AA, ausencia de desbordamiento, idiomas ES/EN/FR y reducción de movimiento. Formularios, mapas, imágenes y estados deben mantener un camino de recuperación. Los resultados se documentan después de verificar la versión correspondiente.

## Recursos y límites

- Paletas y logos: `ASSETS/brand/`.
- Retratos y composiciones: `ASSETS/content/broker/`.
- Datos publicables: `ASSETS/projects/melcon-paradise/` y [CONTENT-STATUS.md](../organization/CONTENT-STATUS.md).
- Inspiración privada: `ASSETS/references/` y `referencias-web/arcke/`; no son contenido público de Andris.
- Originales conservados; las modificaciones de tamaño, formato o composición se guardan como derivados.

La procedencia y la licencia se revisan antes de reutilizar material externo. Las restricciones de [AGENTS.md](../../AGENTS.md) permanecen vigentes.
