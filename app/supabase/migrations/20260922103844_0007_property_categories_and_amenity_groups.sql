-- ============================================================================
-- Migración 0007: categorías de propiedad y grupos de amenidades
-- ============================================================================
-- Documenta en el repositorio lo que ya se aplicó y verificó en producción
-- (backfill sin filas huérfanas, confirmado el 2026-09-22). No se re-ejecuta
-- destructivamente: usa `create table if not exists` / `add column if not
-- exists` para poder correrla de nuevo sin romper nada si el historial local
-- de migraciones alguna vez se re-sincroniza contra la base remota.
--
-- Qué resuelve: el "combo box" de categoría de propiedad no existía de
-- verdad. El formulario de alta escribía siempre `property_category: 'otro'`
-- y `amenities.category` era texto libre sin catálogo. Esta migración crea
-- las tablas de categoría cerrada y añade las columnas FK, pero **no borra**
-- las columnas de texto viejas (`projects.property_category`,
-- `project_unit_types.property_type`, `amenities.category`): eso es la 0008
-- posterior, después de que el cutover completo esté verificado en producción.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Categorías de propiedad
-- ---------------------------------------------------------------------------

create table if not exists public.property_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label_es text not null,
  label_en text,
  label_fr text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.property_categories;
create trigger set_updated_at
  before update on public.property_categories
  for each row execute function public.set_updated_at();

alter table public.property_categories enable row level security;

drop policy if exists "property categories public read" on public.property_categories;
create policy "property categories public read" on public.property_categories
  for select using (true);

drop policy if exists "property categories editor write" on public.property_categories;
create policy "property categories editor write" on public.property_categories
  for all to authenticated
  using (public.is_cms_editor()) with check (public.is_cms_editor());

grant select on public.property_categories to anon, authenticated;
grant insert, update, delete on public.property_categories to authenticated;

insert into public.property_categories (key, label_es, sort_order) values
  ('apartamento', 'Apartamento', 10),
  ('villa', 'Villa', 20),
  ('townhouse', 'Townhouse', 30),
  ('penthouse', 'Penthouse', 40),
  ('mixto', 'Mixto', 50),
  ('otro', 'Otro', 60)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Grupos de amenidades
-- ---------------------------------------------------------------------------

create table if not exists public.amenity_groups (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label_es text not null,
  label_en text,
  label_fr text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.amenity_groups;
create trigger set_updated_at
  before update on public.amenity_groups
  for each row execute function public.set_updated_at();

alter table public.amenity_groups enable row level security;

drop policy if exists "amenity groups public read" on public.amenity_groups;
create policy "amenity groups public read" on public.amenity_groups
  for select using (true);

drop policy if exists "amenity groups editor write" on public.amenity_groups;
create policy "amenity groups editor write" on public.amenity_groups
  for all to authenticated
  using (public.is_cms_editor()) with check (public.is_cms_editor());

grant select on public.amenity_groups to anon, authenticated;
grant insert, update, delete on public.amenity_groups to authenticated;

insert into public.amenity_groups (key, label_es, sort_order) values
  ('beach', 'Playa', 10),
  ('wellness', 'Bienestar', 20),
  ('sports', 'Deportes', 30),
  ('family', 'Familia', 40),
  ('lifestyle', 'Estilo de vida', 50),
  ('service', 'Servicios', 60),
  ('operation', 'Operación', 70),
  ('technology', 'Tecnología', 80),
  ('sustainability', 'Sostenibilidad', 90),
  ('general', 'General', 100)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Columnas FK nuevas + backfill desde las columnas de texto viejas
-- ---------------------------------------------------------------------------
-- NOT NULL todavía no se fuerza: se hace en una migración posterior, una vez
-- que todo el código que escribe estas tablas pase siempre un id.

alter table public.projects
  add column if not exists property_category_id uuid references public.property_categories(id);

update public.projects p
set property_category_id = pc.id
from public.property_categories pc
where p.property_category_id is null
  and pc.key = p.property_category;

alter table public.project_unit_types
  add column if not exists property_category_id uuid references public.property_categories(id);

update public.project_unit_types ut
set property_category_id = pc.id
from public.property_categories pc
where ut.property_category_id is null
  and pc.key = ut.property_type;

alter table public.amenities
  add column if not exists group_id uuid references public.amenity_groups(id);

update public.amenities a
set group_id = ag.id
from public.amenity_groups ag
where a.group_id is null
  and ag.key = a.category;

commit;
