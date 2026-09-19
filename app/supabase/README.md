# Migración del CMS a Supabase

Este directorio contiene todo lo necesario para convertir el estudio CMS local
(`/admin`) y el API estática (`/api/v1/*.json`) en un CMS dinámico sobre
Supabase, sin cambiar la interfaz pública.

## Piezas

| Archivo | Contenido |
| --- | --- |
| `migrations/0001_cms_core.sql` | Tablas de contenido, evidencia editorial, leads, cotizaciones, perfiles CMS, RLS, índices y la vista pública `api_projects_v1`. |
| `seed.sql` | Datos iniciales idempotentes con los tres proyectos verificados (Melcon Paradise, Terra Serena, The Beach at Punta Cana City Place). |

El contrato entre base y aplicación está en `src/lib/cms/types.ts`. El
proveedor remoto (`src/lib/cms/supabase-repository.ts`) consume la vista
`api_projects_v1` por PostgREST con la clave anónima; el proveedor estático
actual sigue funcionando mientras no haya credenciales.

## Pasos cuando existan las credenciales

1. Crear el proyecto en Supabase y copiar la URL y la `anon key`.
2. Aplicar el esquema:
   - Con CLI: `supabase link --project-ref <ref>` y `supabase db push`.
   - Sin CLI: pegar `migrations/0001_cms_core.sql` en el SQL Editor y después `seed.sql`.
3. Crear el usuario administrador en Authentication y registrar su fila en
   `cms_profiles` (`role: 'admin'`).
4. Configurar en el despliegue (Cloudflare Pages/Workers):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` solo en el entorno del estudio, nunca en el
     bundle público.
5. Verificar:
   - `GET <url>/rest/v1/api_projects_v1?select=slug` devuelve los tres slugs.
   - La app muestra `provider: "supabase"` en `/admin` → Estado.

## Reglas de seguridad

- RLS está activado en todas las tablas. La lectura pública solo alcanza
  contenido `published` y la vista `api_projects_v1`.
- `leads` y `calculator_quotes` aceptan inserciones anónimas (formularios
  públicos) y solo el rol de servicio puede leerlos.
- Ninguna credencial se guarda en tablas de contenido ni en el repositorio.

## Flujo editorial

1. Crear proyecto en `draft`.
2. Cargar fuentes aprobadas en `project_source_records`.
3. Completar traducciones, ubicación, fases, tipologías, precio vigente
   (snapshot nuevo, nunca sobrescribir), planes de pago, especificaciones y
   amenidades con su `source_status`.
4. Revisar los campos mínimos de `docs/data/PROJECT-CMS-DATABASE-MAP.md` y
   pasar a `published`.
