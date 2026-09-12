# Mapa de organización aplicado

La estructura evita mezclar marca, contenido publicable, inspiración y código de terceros.

| Antes | Ahora | Motivo |
| --- | --- | --- |
| Archivos de paleta en raíz | `ASSETS/brand/palettes/` | Una sola fuente para los colores de marca. |
| Logos anidados en `andris_logo_assets` | `ASSETS/brand/logos/` | Variantes de logo accesibles desde una ruta clara. |
| Imágenes sueltas de Andris | `ASSETS/content/broker/` | Separa retratos, recortes, héroes y fondos. |
| `PROYECTO01`, `PROYECTO02`, `PROYECTO03` | `ASSETS/projects/` | Todas las fichas y renders bajo una misma colección. |
| `IMAGEN REF` | `ASSETS/references/web-inspiration/` | Capturas de inspiración aisladas del contenido publicable. |
| `REF PWA` | `ASSETS/references/pwa/` | Referencias de aplicación aisladas del contenido publicable. |
| PDF y esquema de datos en raíz | `docs/brief/` y `docs/data/` | Documentos de preparación separados de recursos visuales. |
| Archivos de texto vacíos en raíz | `docs/inbox/` | Pendientes visibles sin contaminar la raíz. |
| Referencia ARCke | `referencias-web/arcke/` | Se conserva sin mezclarse con la marca ni la futura aplicación. |

La raíz solo conserva las tres entradas que necesita un agente o desarrollador: `README.md`, `AGENTS.md`, `ASSETS/`, `docs/` y `referencias-web/`.

## Convención para archivos nuevos

- Usa minúsculas, guiones y nombres descriptivos: `proyecto-nombre-vista-01.webp`.
- Guarda originales en `ASSETS/` y derivados optimizados dentro de la futura aplicación.
- Crea una carpeta de proyecto con un nombre estable solo cuando ese nombre esté confirmado.
- Añade datos aprobados en `DESCRIPCION.txt` junto a los renders de cada proyecto.
