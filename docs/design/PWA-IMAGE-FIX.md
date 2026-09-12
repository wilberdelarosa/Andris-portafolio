# Transparencia de imágenes en la PWA

Fecha: 2026-09-12.

## Causa comprobada

Los PNG originales y los WebP de `app/public/derived/` conservan su canal alfa. El negro se introducía durante la precarga del service worker: `fetch(url)` enviaba `Accept: */*` a `/_next/image`; Next devolvía un JPEG, que aplana la transparencia sobre negro. La consulta posterior con `ignoreVary: true` reutilizaba ese JPEG aunque el navegador solicitara WebP.

Para `andris-suit.webp`, ancho 640, el endpoint devolvió:

| Accept | Formato | Canales | Transparencia |
| --- | --- | --- | --- |
| `*/*` | JPEG | 3 | Ninguna; 239.105 píxeles negros opacos |
| `image/webp` | WebP | 4 | 244.161 píxeles totalmente transparentes |

## Corrección

- `app/public/sw.js` utiliza una única petición normalizada con `Accept: image/webp` para precargar, descargar, guardar y consultar imágenes de `/_next/image`.
- La consulta de esas imágenes respeta `Vary`. Sus claves siempre guardan el mismo encabezado de negociación, de modo que la visita en línea y la recuperación sin conexión coinciden.
- La versión `ap-v4` elimina los almacenes anteriores durante la activación.
- Las reglas existentes para HTML, recursos directos, API, límites de caché y documento alternativo sin conexión se conservan.
- No se modificaron los originales ni los derivados.

## Regresión ejecutada

Se ejecutó el archivo `sw.js` real mediante `node:vm`, con peticiones reales al servidor Next de producción en `localhost:3001`. El almacén de prueba implementó la comparación de `Vary`; Sharp decodificó los bytes recibidos. No se sustituyó el optimizador por respuestas simuladas.

1. La activación eliminó `ap-v3-assets`.
2. El mensaje `CACHE_PUBLIC_PAGE` precargó seis imágenes con `Accept: image/webp`.
3. Con la red desactivada en el arnés, seis peticiones con el encabezado habitual del navegador recuperaron sus imágenes desde caché.
4. Todas conservaron canal alfa y píxeles transparentes:

| Imagen | Píxeles transparentes recuperados sin conexión |
| --- | ---: |
| `andris-suit.webp` | 244.161 |
| `andris-white-shirt.webp` | 272.153 |
| `logo-navy.webp` | 12.401 |
| `logo-white.webp` | 11.582 |
| `wordmark-navy.webp` | 22.744 |
| `wordmark-white.webp` | 16.893 |

5. Una petición a otro ancho, ausente de caché y con `Accept: */*`, se normalizó a WebP. Su segunda petición sin conexión con otro encabezado recuperó el mismo WebP transparente.
6. `/api/v1/health` continuó fuera del manejador de caché.

Resultado: **PASS**. Esta prueba verifica negociación, conservación real del alfa y recuperación desde caché; no sustituye la comprobación final del ciclo de actualización del navegador.

## Confirmación en navegador de producción

Después de reiniciar la compilación de producción:

1. Actualizar el service worker y recargar; comprobar que los almacenes activos se llaman `ap-v4-*` y no quedan almacenes `ap-v3-*`.
2. Visitar la portada y esperar a que termine la precarga. Comprobar que las entradas `/_next/image` de `ap-v4-assets` guardan `Accept: image/webp` y sus respuestas son WebP.
3. Desactivar la red y recargar la portada. Comprobar retratos y logos sobre el fondo del diseño, además del acceso a imágenes ya visitadas y al simulador.
4. Si el nuevo diseño utiliza `unoptimized` para retratos y logos, confirmar también un recurso del optimizador mediante una petición explícita: `/_next/image?url=%2Fderived%2Fandris-suit.webp&w=640&q=75`, primero en línea y después sin conexión.
