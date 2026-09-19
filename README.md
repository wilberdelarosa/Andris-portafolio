# Portafolio de Andris Peña

Portafolio de Andris Peña, agente inmobiliario. Este repositorio contiene material de marca, fotos de proyectos, documentación de contenido, referencias visuales y una aplicación Next.js dentro de `app/`.

## Aplicación

La aplicación activa está en `app/` (Next.js, React y TypeScript). Lee [app/README.md](app/README.md) para ejecutarla. Incluye portada animada, catálogo de tres proyectos, fichas independientes, mapa interactivo, calculadora de pagos con PDF de marca, galería, favoritos, contacto ES/EN/FR, temas claro/oscuro y PWA. Añade además un estudio CMS en `/admin`, un API estática v1 en `/api/v1/` y la migración SQL lista para Supabase en `app/supabase/` (ver [docs/integrations/API-Y-CMS.md](docs/integrations/API-Y-CMS.md)).

El recorrido se distribuye entre `/`, `/proyectos`, `/proyectos/[slug]`, `/mapa`, `/sobre-mi`, `/calculadora` y `/contacto`. Las fichas, favoritos, mapa y consulta comparten el identificador del proyecto. Contactos confirmados: +1 (849) 576-3822 y andrisprealtor@gmail.com.

El sitio representa a Andris Peña como asesor independiente. No se debe mencionar ni incluir “Leaf Glass”, “Leafglass” o sus variaciones en ninguna pieza del sitio, SEO, metadato, contenido generado o integración.

## Punto de partida para IA y desarrollo

1. Lee `AGENTS.md`, `docs/design/DESIGN.md` y `docs/organization/CONTENT-STATUS.md`.
2. Usa únicamente afirmaciones confirmadas en `ASSETS/projects/*/DESCRIPCION.txt` o en material aprobado por el cliente.
3. Conserva `referencias-web/arcke` como referencia de componentes. No es código de producción ni una fuente de datos de Andris.
4. Antes de publicar, confirma teléfonos, correo, enlaces sociales, precios, fechas de entrega, disponibilidad y textos legales.

Para entregar el repositorio a otra persona, usa [docs/HANDOFF.md](docs/HANDOFF.md). Resume instalación, validación, publicación en GPT Sites, estado de AlterEstate, variables de entorno y pendientes de contenido.

## Documentación del rediseño

- [Sistema de diseño](DESIGN_SYSTEM.md): tokens, componentes, tipografía, movimiento y adaptación.
- [Dirección visual](docs/design/DESIGN.md): composición y función de cada sección.
- [Responsabilidades de habilidades](docs/design/SKILLS.md): aplicación del paquete, herramientas condicionales y sustituciones.
- [Estándar de datos de proyectos](docs/organization/PROJECT-DATA-STANDARD.md): estructura única, estados de evidencia y cobertura actual para ficha, filtros y comparativa.

## Mapa de carpetas

| Ruta | Contenido |
| --- | --- |
| `ASSETS/brand/` | Logos y paletas visuales de la marca. |
| `ASSETS/content/broker/` | Retratos, recortes y composiciones del asesor. |
| `ASSETS/projects/` | Fotos, renders y descripciones de cada proyecto. |
| `ASSETS/references/` | Capturas de inspiración; no son contenido para publicar. |
| `docs/brief/` | Solicitud de contenido original. |
| `docs/design/` | Sistema visual y reglas de implementación. |
| `docs/organization/` | Inventario y elementos pendientes. |
| `docs/inbox/` | Archivos vacíos conservados a la espera de contenido. |
| `docs/setup/` | Flujo de trabajo y paquete de habilidades para iniciar la aplicación con IA. |
| `referencias-web/arcke/` | Referencia web local reutilizable bajo revisión de licencia. |

## Estado verificado al organizar

- 81 imágenes de material propio verificadas: todas decodifican correctamente.
- 1 PDF de ocho páginas revisado visualmente.
- Melcon Paradise tiene ficha documentada.
- Terra Serena y The Beach at Punta Cana City Place tienen nombres, ubicaciones y renders verificados; sus datos comerciales siguen pendientes. La actualización del 13 de septiembre se registra en CONTENT-STATUS.md.
- 2 copias exactas detectadas dentro de `project-03-unidentified`; se conservaron para no perder material.

Consulta `docs/organization/CONTENT-STATUS.md` antes de construir páginas públicas.
