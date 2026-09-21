-- ============================================================================
-- Andris Peña · CMS de proyectos inmobiliarios — Migración 0001 (Supabase)
-- ============================================================================
-- Convierte el estándar de docs/organization/PROJECT-DATA-STANDARD.md y el
-- esquema base de docs/data/project-cms-schema.sql a PostgreSQL/Supabase:
-- tablas de contenido, evidencia editorial, leads, cotizaciones de la
-- calculadora, perfiles de administración, RLS y la vista pública
-- `api_projects_v1` que consume el repositorio remoto de la app.
--
-- Aplicar con:  supabase db push   (o pegar en el SQL Editor del proyecto)
-- Datos iniciales: supabase/seed.sql
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Contenido: desarrolladores y proyectos
-- ---------------------------------------------------------------------------

create table if not exists public.developers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  website_url text,
  contact_email text,
  contact_phone text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  developer_id uuid references public.developers(id) on delete set null,
  public_status text not null default 'draft'
    check (public_status in ('draft','review','published','archived')),
  sales_status text not null default 'consultar'
    check (sales_status in ('preventa','construccion','terminado','agotado','consultar')),
  property_category text not null default 'otro'
    check (property_category in ('apartamento','villa','townhouse','penthouse','mixto','otro')),
  sector text,
  city text,
  province text,
  country text not null default 'República Dominicana',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_translations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  locale text not null check (locale in ('es','en','fr')),
  headline text,
  summary text,
  description text,
  investment_note text,
  location_note text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, locale)
);

create table if not exists public.project_source_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_type text not null
    check (source_type in ('brochure','developer_message','website','price_list','contract','manual_note')),
  title text not null,
  url text,
  file_path text,
  received_at timestamptz,
  verified_at timestamptz,
  verified_by text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  delivery_date date,
  delivery_year integer,
  status text not null default 'consultar'
    check (status in ('preventa','construccion','entregado','consultar')),
  source_status text not null default 'pending'
    check (source_status in ('documented','pending','varies','not_applicable','archived')),
  source_record_id uuid references public.project_source_records(id) on delete set null,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_locations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  latitude double precision,
  longitude double precision,
  map_label text,
  address_public text,
  sector text,
  city text,
  province text,
  country text not null default 'República Dominicana',
  distance_to_beach_minutes numeric,
  distance_to_airport_minutes numeric,
  source_status text not null default 'pending'
    check (source_status in ('documented','pending','varies','not_applicable','archived')),
  source_record_id uuid references public.project_source_records(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_unit_types (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  phase_id uuid references public.project_phases(id) on delete set null,
  name text not null,
  property_type text not null default 'otro'
    check (property_type in ('apartamento','villa','townhouse','penthouse','mixto','otro')),
  bedrooms_min numeric,
  bedrooms_max numeric,
  bathrooms_min numeric,
  bathrooms_max numeric,
  area_min_m2 numeric,
  area_max_m2 numeric,
  parking_min numeric,
  parking_max numeric,
  furnished_status text not null default 'unknown'
    check (furnished_status in ('yes','no','optional','unknown')),
  availability_status text not null default 'consult'
    check (availability_status in ('available','limited','sold_out','consult')),
  source_status text not null default 'pending'
    check (source_status in ('documented','pending','varies','not_applicable','archived')),
  source_record_id uuid references public.project_source_records(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_price_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  unit_type_id uuid references public.project_unit_types(id) on delete set null,
  currency text not null default 'USD',
  price_from numeric,
  price_to numeric,
  reservation_amount numeric,
  effective_from date,
  effective_to date,
  source_status text not null default 'pending'
    check (source_status in ('documented','pending','varies','not_applicable','archived')),
  source_record_id uuid references public.project_source_records(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.project_payment_plans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  phase_id uuid references public.project_phases(id) on delete set null,
  unit_type_id uuid references public.project_unit_types(id) on delete set null,
  initial_percent numeric,
  during_construction_percent numeric,
  on_delivery_percent numeric,
  reservation_amount numeric,
  currency text not null default 'USD',
  discount_label text,
  description text,
  source_status text not null default 'pending'
    check (source_status in ('documented','pending','varies','not_applicable','archived')),
  source_record_id uuid references public.project_source_records(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.specification_fields (
  id uuid primary key default gen_random_uuid(),
  field_key text not null unique,
  label_es text not null,
  label_en text,
  label_fr text,
  group_key text not null
    check (group_key in ('investment','space','location','operation','amenities','legal')),
  data_type text not null
    check (data_type in ('text','number','money','percent','distance','date','boolean','enum')),
  unit text,
  is_filterable boolean not null default false,
  is_comparable boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_spec_values (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  field_id uuid not null references public.specification_fields(id) on delete cascade,
  phase_id uuid references public.project_phases(id) on delete set null,
  unit_type_id uuid references public.project_unit_types(id) on delete set null,
  value_text text,
  value_number numeric,
  value_boolean boolean,
  value_date date,
  value_json jsonb,
  source_status text not null default 'pending'
    check (source_status in ('documented','pending','varies','not_applicable','archived')),
  source_record_id uuid references public.project_source_records(id) on delete set null,
  public_note text,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, field_id, phase_id, unit_type_id)
);

create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  amenity_key text not null unique,
  label_es text not null,
  label_en text,
  label_fr text,
  category text not null default 'general',
  icon_name text,
  image_url text,
  is_template boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_amenities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  phase_id uuid references public.project_phases(id) on delete set null,
  availability text not null default 'unknown'
    check (availability in ('included','not_included','optional','varies','unknown')),
  source_status text not null default 'pending'
    check (source_status in ('documented','pending','varies','not_applicable','archived')),
  source_record_id uuid references public.project_source_records(id) on delete set null,
  note text,
  features_es text[],
  features_en text[],
  features_fr text[],
  custom_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, amenity_id, phase_id)
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_type text not null
    check (media_type in ('hero','gallery','floor_plan','map','video','document')),
  url text not null,
  alt_es text,
  alt_en text,
  alt_fr text,
  caption text,
  rights_status text not null default 'unknown'
    check (rights_status in ('owned','developer_provided','licensed','unknown')),
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_contacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  contact_type text not null
    check (contact_type in ('sales','developer','broker','support','internal')),
  name text,
  phone text,
  email text,
  whatsapp text,
  is_public boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Operación: leads del formulario y cotizaciones de la calculadora
-- ---------------------------------------------------------------------------

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  country text,
  budget_label text,
  timeframe_label text,
  interest text,
  message text,
  locale text not null default 'es' check (locale in ('es','en','fr')),
  channel text not null default 'summary'
    check (channel in ('email','whatsapp','summary')),
  status text not null default 'prepared'
    check (status in ('prepared','sent','failed','contacted','closed')),
  page_url text,
  utm jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calculator_quotes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  locale text not null default 'es' check (locale in ('es','en','fr')),
  price numeric not null,
  signing_percent numeric not null,
  construction_percent numeric not null,
  delivery_percent numeric not null,
  months integer not null,
  monthly numeric not null,
  format text not null default 'pdf' check (format in ('pdf')),
  created_at timestamptz not null default now()
);

create table if not exists public.cms_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Triggers de auditoría
-- ---------------------------------------------------------------------------

do $$
declare
  audited text[] := array[
    'developers','projects','project_translations','project_phases',
    'project_locations','project_unit_types','project_payment_plans',
    'specification_fields','project_spec_values','amenities',
    'project_amenities','project_media','project_contacts','leads'
  ];
  table_name text;
begin
  foreach table_name in array audited loop
    execute format(
      'drop trigger if exists trg_%I_updated_at on public.%I;
       create trigger trg_%I_updated_at before update on public.%I
       for each row execute function public.set_updated_at();',
      table_name, table_name, table_name, table_name
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Vista pública del API v1 (consume src/lib/cms/supabase-repository.ts)
-- ---------------------------------------------------------------------------
-- Devuelve por proyecto publicado el DTO del API ya armado como jsonb.
-- Los textos públicos se componen desde project_translations; la galería y
-- amenidades se agregan desde sus tablas. Los precios toman el snapshot
-- documentado vigente más reciente.

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
from public.projects p
left join lateral (
  select url from public.project_media m
  where m.project_id = p.id and m.media_type = 'hero' and m.is_public
  order by m.sort_order limit 1
) hero on true
left join lateral (
  select jsonb_agg(distinct jsonb_build_array(b.bedrooms_min, b.bedrooms_max)) as values
  from (
    select bedrooms_min, bedrooms_max from public.project_unit_types ut
    where ut.project_id = p.id order by ut.sort_order
  ) b
) beds on true
left join lateral (
  select min(ut.area_min_m2) as min_area, max(ut.area_max_m2) as max_area
  from public.project_unit_types ut where ut.project_id = p.id
) u on true
left join lateral (
  select s.price_from, s.price_to, s.currency, s.source_status
  from public.project_price_snapshots s
  where s.project_id = p.id
  order by (s.source_status = 'documented') desc, s.effective_from desc nulls last
  limit 1
) price on true
left join lateral (
  select ph.delivery_year, ph.source_status from public.project_phases ph
  where ph.project_id = p.id order by ph.sort_order limit 1
) phase on true
left join lateral (
  select jsonb_object_agg(t.locale, t.headline) as labels
  from public.project_translations t
  where t.project_id = p.id and t.headline is not null
) delivery on true
left join lateral (
  select jsonb_object_agg(t.locale, t.description) as values
  from public.project_translations t
  where t.project_id = p.id and t.description is not null
) descr on true
left join lateral (
  select l.latitude, l.longitude, l.source_status
  from public.project_locations l where l.project_id = p.id limit 1
) loc on true
left join lateral (
  select jsonb_agg(jsonb_build_object(
    'src', m.url,
    'alt', jsonb_build_object(
      'es', coalesce(m.alt_es,''),
      'en', coalesce(m.alt_en,''),
      'fr', coalesce(m.alt_fr,'')
    )
  ) order by m.sort_order) as gallery
  from public.project_media m
  where m.project_id = p.id and m.media_type = 'gallery' and m.is_public
) media on true
left join lateral (
  select jsonb_agg(jsonb_build_object(
    'es', a.label_es, 'en', coalesce(a.label_en,''), 'fr', coalesce(a.label_fr,'')
  ) order by a.display_order) as values
  from public.project_amenities pa
  join public.amenities a on a.id = pa.amenity_id
  where pa.project_id = p.id and pa.availability = 'included'
) am on true
left join lateral (
  select pl.initial_percent, pl.during_construction_percent,
         pl.on_delivery_percent, pl.source_status
  from public.project_payment_plans pl
  where pl.project_id = p.id order by pl.sort_order limit 1
) plan on true
left join lateral (
  select r.file_path from public.project_source_records r
  where r.project_id = p.id order by r.received_at desc nulls last limit 1
) src on true
where p.public_status = 'published'
order by p.sort_order, p.name;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Lectura pública: solo contenido publicado a través de las tablas de
-- contenido y la vista del API. Escritura: exclusiva del rol de servicio
-- (backend) o de perfiles CMS autenticados. Leads y cotizaciones: inserción
-- anónima permitida (formularios públicos), lectura solo servicio.

alter table public.developers enable row level security;
alter table public.projects enable row level security;
alter table public.project_translations enable row level security;
alter table public.project_source_records enable row level security;
alter table public.project_phases enable row level security;
alter table public.project_locations enable row level security;
alter table public.project_unit_types enable row level security;
alter table public.project_price_snapshots enable row level security;
alter table public.project_payment_plans enable row level security;
alter table public.specification_fields enable row level security;
alter table public.project_spec_values enable row level security;
alter table public.amenities enable row level security;
alter table public.project_amenities enable row level security;
alter table public.project_media enable row level security;
alter table public.project_contacts enable row level security;
alter table public.leads enable row level security;
alter table public.calculator_quotes enable row level security;
alter table public.cms_profiles enable row level security;

-- Lectura pública de contenido publicado
drop policy if exists "projects public read" on public.projects;
create policy "projects public read" on public.projects
  for select using (public_status = 'published');

drop policy if exists "translations public read" on public.project_translations;
create policy "translations public read" on public.project_translations
  for select using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.public_status = 'published'));

drop policy if exists "phases public read" on public.project_phases;
create policy "phases public read" on public.project_phases
  for select using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.public_status = 'published'));

drop policy if exists "locations public read" on public.project_locations;
create policy "locations public read" on public.project_locations
  for select using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.public_status = 'published'));

drop policy if exists "unit types public read" on public.project_unit_types;
create policy "unit types public read" on public.project_unit_types
  for select using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.public_status = 'published'));

drop policy if exists "prices public read" on public.project_price_snapshots;
create policy "prices public read" on public.project_price_snapshots
  for select using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.public_status = 'published'));

drop policy if exists "plans public read" on public.project_payment_plans;
create policy "plans public read" on public.project_payment_plans
  for select using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.public_status = 'published'));

drop policy if exists "spec fields public read" on public.specification_fields;
create policy "spec fields public read" on public.specification_fields
  for select using (true);

drop policy if exists "spec values public read" on public.project_spec_values;
create policy "spec values public read" on public.project_spec_values
  for select using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.public_status = 'published'));

drop policy if exists "amenities public read" on public.amenities;
create policy "amenities public read" on public.amenities
  for select using (true);

drop policy if exists "project amenities public read" on public.project_amenities;
create policy "project amenities public read" on public.project_amenities
  for select using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.public_status = 'published'));

drop policy if exists "media public read" on public.project_media;
create policy "media public read" on public.project_media
  for select using (is_public and exists (
    select 1 from public.projects p
    where p.id = project_id and p.public_status = 'published'));

-- Formularios públicos: cualquiera puede registrar un lead o una cotización,
-- nadie sin autenticación puede leerlos.
drop policy if exists "leads public insert" on public.leads;
create policy "leads public insert" on public.leads
  for insert with check (true);

drop policy if exists "quotes public insert" on public.calculator_quotes;
create policy "quotes public insert" on public.calculator_quotes
  for insert with check (true);

-- Perfil CMS: cada usuario autenticado lee solo su propio perfil.
drop policy if exists "profiles self read" on public.cms_profiles;
create policy "profiles self read" on public.cms_profiles
  for select using (auth.uid() = id);

-- La gestión completa (ediciones, lectura de leads) se realiza con la
-- service_role key desde el estudio conectado, que ignora RLS por diseño.

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

create index if not exists idx_projects_public_status on public.projects(public_status, sort_order);
create index if not exists idx_projects_sector on public.projects(sector, city, country);
create index if not exists idx_project_phases_project on public.project_phases(project_id, delivery_year, status);
create index if not exists idx_project_unit_types_project on public.project_unit_types(project_id, bedrooms_min, area_min_m2);
create index if not exists idx_project_prices_project on public.project_price_snapshots(project_id, currency, price_from);
create index if not exists idx_project_specs_field on public.project_spec_values(field_id, source_status);
create index if not exists idx_project_amenities_amenity on public.project_amenities(amenity_id, availability, source_status);
create index if not exists idx_project_media_project on public.project_media(project_id, media_type, is_public, sort_order);
create index if not exists idx_leads_created on public.leads(created_at desc);
create index if not exists idx_quotes_created on public.calculator_quotes(created_at desc);

commit;
