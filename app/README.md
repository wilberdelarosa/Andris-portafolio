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
- Identidad y navegación lateral en escritorio; barra inferior, menú, ajustes y galería deslizables adaptados a móvil.
- Ficha `/proyectos/melcon-paradise`, galería con teclado y gesto táctil, favoritos persistentes y enlace compartible.
- Mapa Leaflet cargado solo al solicitarlo. Marcador en 18.637918, -68.444033, verificado contra el enlace de Google Maps suministrado. Atribución OpenStreetMap visible.
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

Solo Melcon Paradise tiene ficha. Los dos otros proyectos siguen como borradores, confirmado por el usuario. Sus ubicaciones están documentadas fuera de la app en `../docs/design/project-location-evidence.json`. No se presentan cursos, certificaciones, testimonios, rentabilidad, antigüedad ni datos biográficos no suministrados.

Los precios y entregas difieren entre el material local y la fuente oficial. El catálogo no los presenta como oferta vigente. Los US$150,000 iniciales del simulador son un ejemplo editable, sin referencia comercial a una unidad. La reserva, impuestos, gastos y financiación están excluidos explícitamente.

## Preparar publicación

1. Configurar `NEXT_PUBLIC_SITE_URL` con el dominio final y HTTPS.
2. Confirmar textos comerciales, derechos de recursos y política final de privacidad. Los originales se preservaron y las referencias no están en `public/`.
3. Mantener fuera los dos proyectos sin ficha y cursos sin acreditar.
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

El script utiliza `playwright-core`, ya incluido por `@axe-core/playwright`, y Chrome instalado. No agrega un framework de pruebas ni envía consultas a Andris. Revisa portada y ficha de Melcon a 320, 375, 768 y 1440 px: overflow, imágenes cargadas, estructura principal, galería por teclado, simulador válido e inválido, formulario con resumen local, ES/EN/FR, 404 y errores de consola.

Para otra dirección o puerto:

```powershell
$env:BASE_URL = 'http://localhost:3001'
npm run test:browser
```

Las capturas y `report.json` se guardan en `../output/playwright/browser-checks/`. Un fallo devuelve código de salida 1. Usa `HEADED=1` para ver el navegador; `BROWSER_CHANNEL=msedge` selecciona Edge. En un entorno sin Chrome puedes instalar Chromium con `npx playwright-core install chromium` y establecer `BROWSER_CHANNEL=chromium`. `BROWSER_EXECUTABLE` permite indicar una ruta de navegador concreta.

La suite finaliza las animaciones de duración finita y espera a que las imágenes se decodifiquen antes de guardar las capturas. La evaluación visual del movimiento, su alternativa reducida y el ciclo de instalación/actualización PWA se comprueban durante la revisión visual de producción; este script no publica la app, no instala la PWA y no abre WhatsApp o correo.
