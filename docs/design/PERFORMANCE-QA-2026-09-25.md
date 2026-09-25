# Verificación de rendimiento · 25 de septiembre de 2026

Se midió la exportación estática local en Chrome sin caché previa, a 1440 × 900 px, desde Inicio hasta el catálogo y una ficha. Son muestras puntuales en esta máquina; sirven para comprobar la dirección del cambio, no para estimar tiempos de producción en redes móviles.

| Paso | Antes | Después |
| --- | ---: | ---: |
| HTML inicial hasta hidratación lista | 4.151 ms | 942 ms |
| Inicio → catálogo, desde el clic hasta la ruta | 1.474 ms | 248 ms |
| Catálogo → ficha | 484 ms | 278 ms |
| Lecturas del catálogo a Supabase | 4 | 1 |
| Carga anticipada del visor 360 | Sí | No |

En viewport de 375 px, la medición final fue de 825 ms hasta hidratación, 317 ms de Inicio a catálogo y 232 ms de catálogo a ficha. El cambio del proyecto destacado quedó visible en 121 ms en escritorio.

El primer servidor de desarrollo en el puerto 3000 no entregó HTML dentro de 30 s. La medición comparable se hizo sobre la exportación estática con un servidor local limpio; el bloqueo de ese proceso de desarrollo se trató como un problema separado del tiempo de interacción de la web publicada.

Se probó la precarga automática de rutas. Bajo `output: "export"` emitió peticiones 404 para archivos RSC de Next en el servidor estático local, así que se conservaron los enlaces públicos con `prefetch={false}`. En la versión final no hubo recursos 404 inesperados.

Validación final: `npm run lint` (0 errores, 1 advertencia previa en `amenities-carousel.tsx`), `npm run typecheck`, `npm test` (33/33), `npm run build` y `npm run test:browser` (42/42; rutas y tamaños de 320, 375, 768 y 1440 px). El detector de Impeccable devolvió 0 hallazgos en los componentes de interfaz cambiados. La vista previa interna de navegador no pudo conectarse por su puente privilegiado; la verificación funcional se realizó con Chrome automatizado mediante Playwright.
