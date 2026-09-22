-- ============================================================================
-- Migración 0008: expone la categoría de propiedad en `api_projects_v1`
-- ============================================================================
-- La 0007 creó `property_categories` y hoy backfillea `projects.property_
-- category_id`, pero la vista pública `api_projects_v1` (definida en la 0001)
-- todavía no la expone: el sitio público sigue sin poder mostrar la
-- categoría real de cada proyecto.
--
-- `create or replace view` en vez de editar la 0001 in-place: la vista ya
-- existe en producción y las migraciones ya aplicadas no se tocan.
-- ============================================================================

begin;

create or replace view public.api_projects_v1
with (security_invoker = true) as
select
  p.slug,
  jsonb_build_object(
    'id', p.id,
    'slug', p.slug,
    'name', p.name,
    'status', case p.public_status when 'published' then 'reviewed' else 'draft' end,
    'location', trim(both ' ' from concat_ws(' · ', nullif(p.sector,''), nullif(p.city,''))),
    'hero', hero.url,
    'bedrooms', coalesce(beds.values, '[]'::jsonb),
    'area', jsonb_build_object(
      'min', coalesce(u.min_area, 0),
      'max', coalesce(u.max_area, 0),
      'unit', 'm²'
    ),
    'price', jsonb_build_object(
      'from', price.price_from,
      'to', price.price_to,
      'currency', coalesce(price.currency, 'USD'),
      'status', case when price.source_status = 'documented' then 'confirmed' else 'pending' end
    ),
    'delivery', jsonb_build_object(
      'label', coalesce(delivery.labels, '{}'::jsonb),
      'year', phase.delivery_year,
      'status', case coalesce(phase.source_status,'pending')
        when 'documented' then 'confirmed'
        when 'varies' then 'varies'
        else 'pending' end
    ),
    'map', jsonb_build_object(
      'coordinates', case when loc.latitude is not null and loc.longitude is not null
        then jsonb_build_array(loc.latitude, loc.longitude) else null end,
      'precision', case when loc.source_status = 'documented' then 'exact' else 'unverified' end
    ),
    'propertyCategory', case when pc.id is null then null else jsonb_build_object(
      'key', pc.key,
      'label', jsonb_build_object(
        'es', pc.label_es,
        'en', coalesce(pc.label_en, pc.label_es),
        'fr', coalesce(pc.label_fr, pc.label_es)
      )
    ) end,
    'links', jsonb_build_object(
      'web', '/proyectos/' || p.slug || '/',
      'api', '/api/v1/projects/' || p.slug || '.json'
    )
  ) as summary,
  jsonb_build_object(
    'description', coalesce(descr.values, '{}'::jsonb),
    'gallery', coalesce(media.gallery, '[]'::jsonb),
    'amenities', coalesce(am.values, '[]'::jsonb),
    'paymentReference', jsonb_build_object(
      'signing', plan.initial_percent,
      'construction', plan.during_construction_percent,
      'delivery', plan.on_delivery_percent,
      'commercialStatus', plan.source_status
    ),
    'source', src.file_path
  ) as detail_extra
from projects p
left join lateral (
  select m.url
  from project_media m
  where m.project_id = p.id and m.media_type = 'hero' and m.is_public
  order by m.sort_order
  limit 1
) hero on true
left join lateral (
  select jsonb_agg(distinct jsonb_build_array(b.bedrooms_min, b.bedrooms_max)) as values
  from (
    select ut.bedrooms_min, ut.bedrooms_max
    from project_unit_types ut
    where ut.project_id = p.id
    order by ut.sort_order
  ) b
) beds on true
left join lateral (
  select min(ut.area_min_m2) as min_area, max(ut.area_max_m2) as max_area
  from project_unit_types ut
  where ut.project_id = p.id
) u on true
left join lateral (
  select s.price_from, s.price_to, s.currency, s.source_status
  from project_price_snapshots s
  where s.project_id = p.id
  order by (s.source_status = 'documented') desc, s.effective_from desc nulls last
  limit 1
) price on true
left join lateral (
  select ph.delivery_year, ph.source_status
  from project_phases ph
  where ph.project_id = p.id
  order by ph.sort_order
  limit 1
) phase on true
left join lateral (
  select jsonb_object_agg(t.locale, t.headline) as labels
  from project_translations t
  where t.project_id = p.id and t.headline is not null
) delivery on true
left join lateral (
  select jsonb_object_agg(t.locale, t.description) as values
  from project_translations t
  where t.project_id = p.id and t.description is not null
) descr on true
left join lateral (
  select l.latitude, l.longitude, l.source_status
  from project_locations l
  where l.project_id = p.id
  limit 1
) loc on true
left join lateral (
  select jsonb_agg(
    jsonb_build_object(
      'src', m.url,
      'alt', jsonb_build_object(
        'es', coalesce(m.alt_es, ''),
        'en', coalesce(m.alt_en, ''),
        'fr', coalesce(m.alt_fr, '')
      )
    ) order by m.sort_order
  ) as gallery
  from project_media m
  where m.project_id = p.id and m.media_type = 'gallery' and m.is_public
) media on true
left join lateral (
  select jsonb_agg(
    jsonb_build_object(
      'es', a.label_es,
      'en', coalesce(a.label_en, ''),
      'fr', coalesce(a.label_fr, '')
    ) order by a.display_order
  ) as values
  from project_amenities pa
  join amenities a on a.id = pa.amenity_id
  where pa.project_id = p.id and pa.availability = 'included'
) am on true
left join lateral (
  select pl.initial_percent, pl.during_construction_percent, pl.on_delivery_percent, pl.source_status
  from project_payment_plans pl
  where pl.project_id = p.id
  order by pl.sort_order
  limit 1
) plan on true
left join lateral (
  select r.file_path
  from project_source_records r
  where r.project_id = p.id
  order by r.received_at desc nulls last
  limit 1
) src on true
left join public.property_categories pc on pc.id = p.property_category_id
where p.public_status = 'published'
order by p.sort_order, p.name;

commit;
