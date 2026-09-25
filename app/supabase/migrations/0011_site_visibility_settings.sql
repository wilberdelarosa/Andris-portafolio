-- ============================================================================
-- Migración 0011: configuración pública controlada desde el CMS.
--
-- Esta tabla contiene únicamente flags seguros para lectura pública. Los
-- nombres reales de los proyectos nunca se sustituyen en la base de datos:
-- cuando el flag es false, la interfaz pública los presenta como Proyecto 01,
-- Proyecto 02, etc., conservando nombre, slug y relaciones internas.
-- ============================================================================

begin;

create table if not exists public.site_settings (
  key text primary key,
  value_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

insert into public.site_settings (key, value_json)
values ('public_project_names_visible', 'true'::jsonb)
on conflict (key) do nothing;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings
  for select
  to anon, authenticated
  using (key in ('public_project_names_visible'));

drop policy if exists "site_settings_editor_insert" on public.site_settings;
create policy "site_settings_editor_insert"
  on public.site_settings
  for insert
  to authenticated
  with check (public.is_cms_editor());

drop policy if exists "site_settings_editor_update" on public.site_settings;
create policy "site_settings_editor_update"
  on public.site_settings
  for update
  to authenticated
  using (public.is_cms_editor())
  with check (public.is_cms_editor());

drop policy if exists "site_settings_editor_delete" on public.site_settings;
create policy "site_settings_editor_delete"
  on public.site_settings
  for delete
  to authenticated
  using (public.is_cms_editor());

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

commit;
