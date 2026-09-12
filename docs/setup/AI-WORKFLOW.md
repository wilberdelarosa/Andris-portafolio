# Flujo de trabajo para construir el sitio con IA

## Antes de generar código

1. Declara la lectura de diseño: portafolio inmobiliario de confianza para clientes e inversionistas de Punta Cana, sobrio y cálido.
2. Usa `docs/design/DESIGN.md` como fuente de tokens, estructura y restricciones de accesibilidad.
3. Revisa `docs/setup/SKILLS.md` y aplica las habilidades requeridas para la etapa del trabajo.
4. Revisa `docs/organization/CONTENT-STATUS.md` y confirma qué proyectos pueden mostrarse.
5. Revisa el archivo de contenido de la sección que vayas a construir. Si falta un dato, deja una tarea pendiente en vez de inventarlo.
6. Usa solamente el nombre **Andris Peña**. Excluye “Leaf Glass”, “Leafglass” y sus variaciones de todo resultado público, técnico o generado.

## Al crear la aplicación

1. Crea `app/` sin mover ni modificar los originales de `ASSETS/`.
2. Mantén `app/src/content/` para contenido aprobado, `app/src/components/` para componentes y `app/public/derived/` para versiones optimizadas de imágenes.
3. Usa una sola familia de iconos, tokens semánticos y una estrategia de movimiento reducida.
4. Implementa el modo móvil desde el comienzo, con acciones táctiles y navegación accesible.

## Antes de mostrar una versión

- Comprueba contraste, foco de teclado, textos alternativos y preferencia de reducción de movimiento.
- Verifica 320 px, escritorio y un navegador real.
- Verifica que cada precio, fecha, característica y CTA sea una fuente confirmada.
- No copies una página completa de ARCke. Extrae ideas o reconstruye componentes necesarios con el sistema visual de Andris.
