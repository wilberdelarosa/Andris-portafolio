# Andris Peña — portafolio inmobiliario

Aplicación Next.js + React + TypeScript con diseño editorial, recursos propios optimizados y contenido ES/EN/FR. La interfaz es una implementación original inspirada en los patrones de ARCke y 21st, sin reutilizar sus recursos ni código sin licencia.

## Ejecutar

Requiere Node.js 20.9 o superior (verificada con Node 24.13).

```powershell
cd 'E:\PROYECTOS WEB\AndrisPortafolio\app'
npm ci
npm run dev
```

Desarrollo: http://localhost:3000. Para probar instalación y funcionamiento offline:

```powershell
npm run build
npm run start
```

El service worker solo se registra en producción. HTTPS es necesario fuera de localhost. En escritorio, Ajustes → Instalar aplicación; en iOS, Compartir → Añadir a pantalla de inicio. La instalación depende del navegador y siempre es una decisión del visitante.

La portada actual usa el retrato original de traje, nombre tipográfico en capas y un fondo arquitectónico generado a medida. Su composición y motion están aislados en `src/components/hero.module.css`; los textos ES/EN/FR viven en `src/content/hero-copy.ts`. El fondo es escenografía editorial ficticia, documentada en `../output/imagegen/hero-atmosphere-v3-provenance.md`.

Para reproducir las comprobaciones específicas de esta portada con el servidor de producción iniciado:

```powershell
$env:BASE_URL='http://localhost:3001'
node scripts/check-hero-v3.mjs
```

## Funciones

- Portada con retrato transparente, nombre animado por letras, fondo con parallax y revelados al desplazarse. Reduced motion evita las animaciones de desplazamiento.
- Encabezado horizontal y navegación entre páginas en escritorio; barra inferior, menú, ajustes y galería deslizables adaptados a móvil.
- Catálogo `/proyectos` con filtros y guardados, tres fichas `/proyectos/[slug]`, galería con teclado y gesto táctil, favoritos por proyecto y enlace compartible.
- Inicio con selector de proyectos, imágenes intercambiables, panel de vidrio navy y accesos a herramientas independientes.
- `/sobre-mi`, `/calculadora` y `/contacto` completan recorridos propios. El contacto recibe `?proyecto=slug` desde la ficha.
- Mapa MapLibre/OpenFreeMap/OpenStreetMap con los tres puntos verificados, vista 3D inicial, panel de proyecto, zoom, estilo detallado/gris, recuperación de errores y enlaces de Google Maps. `/mapa?proyecto=slug` abre la selección compartida; las vistas compactas se activan al solicitarlas. Evidencias de ubicación en `../docs/design/project-location-evidence.json`.
- Simulador editable de pagos con firma, construcción, entrega y cuotas en centavos. Distribuye el redondeo en la última cuota y permite descargar el escenario.
- Formulario validado que prepara una consulta en el navegador. El visitante puede copiarla, descargarla o revisar el mensaje en WhatsApp/correo antes de enviarlo. No se inventa un estado de mensaje entregado.
- ES/EN/FR, apariencia clara/oscura/sistema y favoritos guardados localmente.
- PWA con iconos normales y maskable, página de recuperación offline, caché limitada de documentos y recursos visitados. No almacena formularios, API, mapas externos ni datos de contacto del visitante.

## Contenido y arquitectura

| Directorio | Responsabilidad |
| --- | --- |
| `src/app/` | Rutas, metadatos, manifiesto y handlers API |
| `src/components/` | Interfaz, preferencias, interacciones y registro PWA |
| `src/content/` | Perfil confirmado, catálogo tipado y diccionarios |
| `src/lib/payment.ts` | Cálculo puro, independiente de React |
| `public/derived/` | Derivados optimizados de originales; nunca referencias |
| `tests/` | Invariantes financieras y casos límite |

`getPublishedProjects`, `getProject` y `toPublicProject` forman el límite del repositorio editorial. Para incorporar un CMS, reemplazar estas consultas por un adaptador servidor que conserve `PropertyProject`, el filtro de aprobación y la proyección pública. No conectar una tabla directamente a la interfaz ni devolver borradores en la API.

API de lectura, versión 1:

- `GET /api/v1/projects`: catálogo público y metadatos de vigencia.
- `GET /api/v1/projects/:slug`: ficha o 404.
- `GET /api/v1/health`: disponibilidad de la aplicación.

No se usa Supabase ni se requiere una base de datos para esta fase. El futuro CMS necesita autenticación, permisos editoriales, revisión/publicación, media, auditoría de cambios y validación de vigencia. Una futura integración de leads debe validar en servidor, limitar solicitudes y confirmar persistencia/entrega antes de mostrar éxito; nunca reutilizar el estado local de consulta preparada como comprobante de envío.

## Contacto y pendientes

Contacto aprobado en conversación el 12 de septiembre de 2026: +1 (849) 576-3822, andrisprealtor@gmail.com. Fuente central: `src/content/advisor.ts`. Las variables `NEXT_PUBLIC_CONTACT_EMAIL` y `NEXT_PUBLIC_WHATSAPP` permiten un override de despliegue.

Melcon Paradise tiene ficha documentada. La aprobación registrada el 13 de septiembre en CONTENT-STATUS.md incorpora Terra Serena y The Beach at Punta Cana City Place con nombre, ubicación y renders verificados. Sus datos comerciales se muestran pendientes y no se completan con cifras inventadas. No se presentan cursos, certificaciones, testimonios, rentabilidad, antigüedad ni datos biográficos no suministrados.

Los precios y entregas difieren entre el material local y la fuente oficial. El catálogo no los presenta como oferta vigente. Los US$150,000 iniciales del simulador son un ejemplo editable, sin referencia comercial a una unidad. La reserva, impuestos, gastos y financiación están excluidos explícitamente.

## Preparar publicación

1. Configurar `NEXT_PUBLIC_SITE_URL` con el dominio final y HTTPS.
2. Confirmar textos comerciales, derechos de recursos y política final de privacidad. Los originales se preservaron y las referencias no están en `public/`.
3. Mantener fuera precios, disponibilidad, entregas, atributos de unidades y credenciales sin confirmar.
4. Activar `NEXT_PUBLIC_INDEXABLE=true` al autorizar indexación y volver a compilar. La configuración actual es `noindex` para la revisión local.

## Verificación

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
```

Las pruebas de navegador y capturas están en `../output/playwright/`; el resumen de resultados se mantiene en `../docs/design/IMPLEMENTATION-QA.md`.

Fuentes locales con licencia SIL OFL: Plus Jakarta Sans y Cormorant Garamond. Atribuciones en `THIRD-PARTY-NOTICES.md`. No hay claves de 21st en esta aplicación; el MCP está configurado privadamente en Claude Code para este proyecto.

## Pruebas de navegador reproducibles

Con la aplicación ejecutándose en otra terminal:

```powershell
npm run test:browser
```

El script utiliza `playwright-core`, ya incluido por `@axe-core/playwright`, y Chrome instalado. No agrega un framework de pruebas ni envía consultas a Andris. Revisa nueve páginas a 320, 375, 768 y 1440 px: overflow, imágenes cargadas, estructura principal, galería por teclado, simulador válido e inválido, formulario con resumen local, ES/EN/FR, 404 y errores de consola.

Para otra dirección o puerto:

```powershell
$env:BASE_URL = 'http://localhost:3001'
npm run test:browser
```

Las capturas y `report.json` se guardan en `../output/playwright/browser-checks/`. Un fallo devuelve código de salida 1. Usa `HEADED=1` para ver el navegador; `BROWSER_CHANNEL=msedge` selecciona Edge. En un entorno sin Chrome puedes instalar Chromium con `npx playwright-core install chromium` y establecer `BROWSER_CHANNEL=chromium`. `BROWSER_EXECUTABLE` permite indicar una ruta de navegador concreta.

La suite finaliza las animaciones de duración finita y espera a que las imágenes se decodifiquen antes de guardar las capturas. La evaluación visual del movimiento, su alternativa reducida y el ciclo de instalación/actualización PWA se comprueban durante la revisión visual de producción; este script no publica la app, no instala la PWA y no abre WhatsApp o correo.

## Recorridos y accesibilidad del rediseño

Con el servidor de producción iniciado, `BASE_URL` permite elegir el puerto:

```powershell
$env:BASE_URL='http://127.0.0.1:3012'
node scripts/verify-browser.mjs
node scripts/verify-journeys.mjs
```

La segunda suite cubre selección e imágenes, gesto horizontal, guardados persistentes, filtros al cambiar idioma, mapa y recuperación, menú por teclado y contraste automático WCAG AA en ambos temas. Informes en `../output/playwright/journeys/`; capturas completas en `../.impeccable/review/`. El informe del rediseño está en `../docs/design/REDESIGN-QA-2026-09-13.md`.
