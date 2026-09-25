-- ============================================================================
-- Migración 0010: expone el rango de baños en el API público.
--
-- El CMS ya guarda bathrooms_min/bathrooms_max por tipología, pero la vista
-- pública solo exponía habitaciones y dejaba el detalle vacío. Se conserva la
-- vista 0009 como base y se añade el rango normalizado para todos los
-- proyectos, actuales y futuros.
-- ============================================================================

begin;

alter view public.api_projects_v1 rename to api_projects_v1_base;

create view public.api_projects_v1
with (security_invoker = true) as
select
  base.slug,
  jsonb_set(
    base.summary,
    '{bathrooms}',
    coalesce(baths.values, '[]'::jsonb),
    true
  ) as summary,
  jsonb_set(
    base.detail_extra,
    '{bathrooms}',
    coalesce(baths.values, '[]'::jsonb),
    true
  ) as detail_extra
from public.api_projects_v1_base base
left join lateral (
  select jsonb_agg(distinct n order by n) as values
  from public.project_unit_types ut
  cross join lateral generate_series(
    coalesce(ut.bathrooms_min, ut.bathrooms_max),
    coalesce(ut.bathrooms_max, ut.bathrooms_min),
    0.5
  ) as n
  where ut.project_id = (base.summary->>'id')::uuid
) baths on true;

grant select on public.api_projects_v1 to anon, authenticated;

commit;
