# Inventario y estado de contenido

Fecha de revisión: 2026-09-12.

## Actualización durante implementación

- El usuario confirmó directamente el correo `andrisprealtor@gmail.com` y WhatsApp `+1 (849) 576-3822`. Están centralizados en `app/src/content/advisor.ts`.
- El usuario reiteró que los otros proyectos no están confirmados: siguen excluidos de la interfaz y API pública.
- Se verificó el enlace de Melcon Paradise y su punto de mapa: 18.637918, -68.444033. Ver `docs/design/project-location-evidence.json`.
- La revisión exhaustiva actual encontró 80 imágenes, frente a las 81 anotadas originalmente; las 80 fueron verificadas visualmente. Se generaron 33 derivados sin alterar los originales.
- La app está implementada en `app/`. Los cursos/certificaciones y biografía ampliada siguen pendientes; no se inventaron. Precios y entregas no se anuncian como vigentes por diferencias entre fuentes.

## Material revisado

| Grupo | Estado | Resultado |
| --- | --- | --- |
| Imágenes propias | Revisadas | 81 archivos PNG, JPG y JPEG decodifican correctamente. |
| PDF de solicitud | Revisado | 8 páginas, legible visualmente y ubicado en `docs/brief/content-request.pdf`. |
| Logos | Revisados | 10 variantes PNG y una referencia JPEG organizadas en `ASSETS/brand/logos/`. |
| Paletas | Revisadas | Tres tableros consistentes con navy, beige, azul y arena en `ASSETS/brand/palettes/`. |
| Referencias web y PWA | Revisadas | Son inspiración. No publicar ni asumir que son propiedad de la marca. |
| Referencia ARCke | Preservada | Está en `referencias-web/arcke/`; se mantiene separada de los recursos de Andris. |

## Proyectos inmobiliarios

| Ruta | Material | Estado publicable |
| --- | --- | --- |
| `ASSETS/projects/melcon-paradise/` | 15 renders y una descripción con unidades, amenidades, precios de referencia y entrega estimada. | Requiere confirmar vigencia comercial antes de publicar. |
| `ASSETS/projects/project-01-unidentified/` | 16 renders y texto vacío. | No publicar hasta recibir nombre, ubicación, características, precios y autorización. |
| `ASSETS/projects/project-03-unidentified/` | 12 renders y texto vacío. | No publicar hasta recibir nombre, ubicación, características, precios y autorización. |

## Pendientes explícitos

1. Completar `docs/inbox/data-placeholder.txt` con perfil, biografía, contactos y enlaces oficiales.
2. Completar `docs/inbox/skills-suggestions-placeholder.txt` o eliminarlo cuando deje de tener propósito.
3. Identificar los proyectos 01 y 03 y completar sus `DESCRIPCION.txt`.
4. Verificar disponibilidad, precios, forma de pago y fecha de entrega de Melcon Paradise antes de cualquier publicación.
5. Definir una familia tipográfica con licencia y aprobar usos de la variante dorada del logo.
6. Revisar los dos archivos idénticos de `project-03-unidentified`. Se conservaron por seguridad; no se borró ninguno.

## Política de archivos

- Los originales se mantienen tal como fueron recibidos dentro de la nueva taxonomía.
- Las imágenes para web deben generarse como derivados optimizados, nunca sobrescribiendo estos originales.
- La inspiración y las capturas permanecen separadas de las imágenes aptas para producción.
