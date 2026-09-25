# Imágenes WebP y auditoría de velocidad — 2026-09-25

## Qué se cambió

- Los 52 derivados editoriales y de proyectos en `app/public/derived/` ya eran WebP. El script `app/scripts/generate-responsive-images.mjs` genera 376 tamaños WebP adicionales antes de `dev` y `build`, sin sobrescribir los originales de `ASSETS/` ni los derivados fuente.
- `next/image` usa un cargador local que elige esos tamaños en la exportación estática. Las imágenes externas conservan su URL; una exportación estática no puede transcodificar un servidor ajeno.
- El hero usa `<picture>` para solicitar solo la composición correspondiente al ancho de pantalla. Antes, el navegador móvil también descargaba la foto de escritorio oculta.
- El CMS convierte JPG, PNG y WebP a WebP antes de subirlos a Storage. El navegador limita el lado mayor a 2000 px, envía `image/webp` y conserva el archivo original local. El modo Enlace depende del formato que entregue la URL externa.
- Los cuatro PNG públicos siguen siendo iconos de instalación y de Apple, que requieren ese formato para compatibilidad.

## Medición

Se usó [Lighthouse CI de GoogleChrome](https://github.com/GoogleChrome/lighthouse-ci) contra la exportación local, en modo móvil, para inicio y catálogo. Los resultados completos se escriben en `output/lighthouse/ci/`; no se suben a un servicio externo. Las cifras son estimaciones de ahorro de bytes por tamaño de imagen, no tiempos reales de usuarios.

| Página | Antes | Después | Reducción |
| --- | ---: | ---: | ---: |
| Inicio, imágenes sobredimensionadas | 876 KiB | 56 KiB | 94 % |
| Catálogo, imágenes sobredimensionadas | 438 KiB | 31 KiB | 93 % |
| Inicio, imagen de escritorio oculta en móvil | 177 KiB | 9 KiB | 95 % |

El puntaje general de Lighthouse fluctúa con la CPU local. Esta mejora de imágenes no elimina el cuello restante: en la muestra móvil, el JavaScript inicial del inicio fue aproximadamente 946 KiB y el LCP siguió entre 9 y 12 s. Hay que tratar ese trabajo de renderizado por separado si se busca subir el puntaje global de forma consistente.

## Cómo comprobarlo

Desde `app/`:

```bash
npm run build
npm run test:performance
npm run test:browser
npm run test:cms-browser
```

`test:performance` ejecuta dos pasadas por página, exige formato moderno y un desperdicio estimado menor de 200 KiB en cada ruta. El flujo `.github/workflows/quality.yml` ejecuta la misma auditoría en cada PR y adjunta los informes. `test:cms-browser` simula una subida PNG y comprueba extensión `.webp`, cabecera `image/webp` y firma binaria `WEBP` sin escribir en Supabase.

La opción nueva de visibilidad de nombres del CMS se activa con `NEXT_PUBLIC_SITE_SETTINGS_ENABLED=true` solo después de aplicar la migración `site_visibility_settings`; así la web pública no interroga una tabla que todavía no existe.

## Resultado de la validación final

- `npm run lint`, `npm run typecheck`, `npm test` (36/36) y `npm run build:sites`: correctos.
- Navegador público: 43/43 comprobaciones, incluida la selección exclusiva de la foto WebP de móvil o escritorio.
- Navegador CMS: 8/8 comprobaciones, incluida la conversión PNG a WebP.
- Lighthouse CI: cuatro pasadas completas; presupuestos de formato moderno y tamaño aprobados. En la última muestra local el puntaje global fue 63/100 en ambas páginas. Ese puntaje no mejoró de forma estable, aunque se redujeron los bytes de imagen indicados arriba.
- Artefacto de publicación `app/dist/`: contiene los 376 tamaños WebP generados.
