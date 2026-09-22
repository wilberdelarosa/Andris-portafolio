-- ============================================================================
-- Migración 0009: corrige `summary.bedrooms` en `api_projects_v1`
-- ============================================================================
-- El lateral `beds` original agregaba pares [bedrooms_min, bedrooms_max] por
-- tipo de unidad (`jsonb_agg(distinct jsonb_build_array(...))`), pero todo el
-- frontend (project-catalog.tsx, map-explorer.tsx, project-section.tsx,
-- property-card.tsx) espera un arreglo PLANO de enteros — los valores
-- posibles de habitaciones a través de todos los tipos de unidad del
-- proyecto — y hace `.join(", ")` directo sobre él. Resultado visible en el
-- sitio hoy: "0,3, 0,4, 1,2 hab." en vez de "0, 1, 2, 3, 4 hab.".
--
-- Esta migración incluye el contenido completo de la 0008 (propertyCategory)
-- más este fix, en un solo `create or replace view`: aplicar solo esta
-- (0009) es suficiente aunque la 0008 no se haya aplicado antes.
--
-- También enriquece `detail_extra.amenities`: el esquema ya tenía
-- `project_amenities.custom_image_url`/`features_*` y `amenities.image_url`/
-- `group_id`, pero la vista nunca los exponía (solo el label). Necesario
-- para el carrusel de amenidades por proyecto (imagen + features + grupo).
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
  select jsonb_agg(distinct n order by n) as values
  from project_unit_types ut
  cross join lateral generate_series(ut.bedrooms_min, ut.bedrooms_max) as n
  where ut.project_id = p.id
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
      'key', a.amenity_key,
      'name', jsonb_build_object(
        'es', a.label_es,
        'en', coalesce(a.label_en, ''),
        'fr', coalesce(a.label_fr, '')
      ),
      'image', coalesce(pa.custom_image_url, a.image_url),
      'features', jsonb_build_object(
        'es', coalesce(to_jsonb(pa.features_es), '[]'::jsonb),
        'en', coalesce(to_jsonb(pa.features_en), '[]'::jsonb),
        'fr', coalesce(to_jsonb(pa.features_fr), '[]'::jsonb)
      ),
      'group', case when ag.id is null then null else jsonb_build_object(
        'key', ag.key,
        'label', jsonb_build_object(
          'es', ag.label_es,
          'en', coalesce(ag.label_en, ag.label_es),
          'fr', coalesce(ag.label_fr, ag.label_es)
        )
      ) end
    ) order by coalesce(ag.sort_order, 999), a.display_order
  ) as values
  from project_amenities pa
  join amenities a on a.id = pa.amenity_id
  left join amenity_groups ag on ag.id = a.group_id
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
