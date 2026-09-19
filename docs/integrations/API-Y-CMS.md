# API v1 y estudio CMS

Fecha: 2026-09-18.

## Arquitectura

El sitio es una exportación estática (`output: "export"`), así que el API se
publica como JSON versionado en el propio despliegue. Toda lectura pasa por la
capa centralizada `app/src/lib/cms/`:

| Pieza | Rol |
| --- | --- |
| `lib/cms/types.ts` | Contratos públicos (DTO) del API y del estudio. |
| `lib/cms/mappers.ts` | `PropertyProject` → DTO. Funciones puras. |
| `lib/cms/repository.ts` | Repositorio central; elige proveedor estático o Supabase según credenciales. |
| `lib/cms/supabase-repository.ts` | Proveedor remoto por PostgREST sobre la vista `api_projects_v1`. Sin dependencias nuevas. |
| `lib/cms/local-store.ts` | Persistencia local del estudio (leads, cotizaciones, borradores) en `localStorage`. |
| `scripts/generate-static-api.mjs` | Genera `public/api/v1/*.json` y copia el SQL a `public/cms/` en cada `dev`/`build`. |

## Endpoints publicados

| Ruta | Contenido |
| --- | --- |
| `GET /api/v1/health.json` | Estado, versión de esquema (`1.0.0`) y proveedor activo. |
| `GET /api/v1/projects.json` | Índice de proyectos con enlaces web/API. |
| `GET /api/v1/projects/{slug}.json` | Ficha completa: galería, amenidades, plan de pago de referencia y fuente. |
| `GET /api/v1/openapi.json` | Contrato OpenAPI 3.1. |

## Estudio CMS `/admin`

Herramienta interna (excluida de robots, en español): panel de control,
editor de borradores comerciales por proyecto, bandeja de leads registrada
desde el formulario de contacto, registro de cotizaciones PDF de la
calculadora y descarga del esquema SQL. Mientras no existan credenciales,
todo persiste en el dispositivo y se exporta/importa como JSON/CSV.

## Migración a Supabase

Esquema PostgreSQL completo en `app/supabase/migrations/0001_cms_core.sql`
(tablas de contenido con evidencia editorial, leads, cotizaciones, perfiles,
RLS y vista pública), seed idempotente en `app/supabase/seed.sql` y pasos en
`app/supabase/README.md`. Variables necesarias: `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_ANON_KEY`; la `service_role` solo en el entorno del
estudio.

## Verificación

- `tests/cms-api.test.ts` cubre mappers, proveedor estático y reglas de
  evidencia (nunca inventar precios).
- `scripts/verify-cms-browser.mjs` captura `/admin` y `/calculadora` a
  1440/375 px y falla ante errores de consola.
- Evidencias del 2026-09-18 en `output/playwright/cms-checks/`.
