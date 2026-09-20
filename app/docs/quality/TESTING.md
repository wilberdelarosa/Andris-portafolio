# Plan de calidad del portafolio y CMS

Este documento es el contrato de pruebas del proyecto. Cada cambio que afecte
una pantalla, comportamiento, contrato de datos o integración debe actualizar
una prueba automatizada y, cuando corresponda, esta matriz. El workflow de
GitHub bloquea cambios de `src/` que no traigan evidencia en `tests/`,
`scripts/verify-*.mjs`, este directorio o el workflow de calidad.

## Puertas obligatorias antes de publicar

| Comando | Objetivo |
| --- | --- |
| `npm run lint` | Errores de calidad y reglas de React/Next. |
| `npm run typecheck` | Contratos TypeScript del sitio, CMS y API. |
| `npm test` | Datos, cálculos, filtros, formularios y adaptadores puros. |
| `npm run build:sites` | Export estático compatible con GPT Sites. |
| `npm run test:browser` | Carga real de rutas públicas, responsive e interacciones. |
| `npm run test:cms-browser` | Acceso, paneles CMS y vista previa, sin escribir datos reales. |

## Pruebas unitarias y de contrato

| Área | Debe validar |
| --- | --- |
| Proyectos | Slugs únicos, datos verificables, precios pendientes sin números inventados, imágenes y coordenadas válidas. |
| Filtros y comparativa | Cada criterio devuelve solo proyectos compatibles; selección, eliminación y estado vacío. |
| Fichas y API | Resumen, detalle, rutas web/API, versiones, estado de salud y evidencia de fuente. |
| Formulario de contacto | Campos requeridos, país, teléfono, presupuesto, plazo y aceptación de privacidad. Preparar una consulta no transmite datos. |
| Calculadora | Distribución de pagos, cuotas, porcentajes inválidos, restablecimiento y PDF. |
| CMS | Contratos de sesión, repositorio, borradores, leads, cotizaciones, diagnósticos y permisos. |
| Vista previa CMS | Borrador incompleto, galería, importes pendientes y coordenadas inválidas sin romper la interfaz. |
| Integraciones | Adaptador AlterEstate transforma el lead y reporta errores sin ocultarlos; las pruebas remotas usan credenciales de prueba, nunca las de producción. |

## Pruebas de navegador

| Flujo | Cobertura automática |
| --- | --- |
| Rutas públicas | `/`, catálogo, tres fichas, mapa, sobre mí, contacto, calculadora y ruta 404 a 320, 375, 768 y 1440 px. |
| Presentación | Un `main` y un `h1`, sin overflow horizontal, imágenes cargadas, idioma sincronizado y sin excepciones ni recursos 404 inesperados. |
| Galería | Apertura, avance y retroceso con teclado, cierre con Escape. |
| Contacto | Validación nativa, proyecto preseleccionado, resumen local y cero solicitudes mutantes. |
| Calculadora | Importes, desglose, rechazo del plan inválido y restablecimiento. |
| CMS sin sesión | Solo se presenta el acceso restringido. |
| CMS autenticado simulado | Resumen, Proyectos, Añadir proyecto y ambas vistas previas cargan sin excepciones. La sesión es ficticia y no llama a Supabase. |

## Casos manuales antes de habilitar una integración real

- Iniciar sesión con una cuenta administradora de Supabase y confirmar que el diagnóstico muestra sesión, perfil, RLS y bucket de imágenes.
- Crear, editar, guardar y descartar un borrador; confirmar que el contenido público no cambia hasta la publicación autorizada.
- Probar envío real de un lead de prueba en AlterEstate y comprobar un único registro con los campos acordados.
- Validar en móvil el mapa satelital, agrupación de marcadores, vista general y ficha de localización.
- Revisar con contenido real que cada dato comercial tenga fuente vigente y que términos, privacidad y consentimientos estén aprobados por el cliente.

## Cómo actualizar esta matriz

1. Añade una prueba unitaria al cambiar una función de datos, cálculo, mapeo o validación.
2. Añade o amplía una verificación de navegador al cambiar una pantalla, un formulario, un flujo o su estado de error.
3. Actualiza la fila de este documento para describir el nuevo comportamiento observable.
4. Ejecuta todas las puertas obligatorias localmente. El mismo conjunto corre en GitHub antes de aceptar un cambio.
