-- ============================================================================
-- Migración 0006: permisos del estudio CMS
-- ============================================================================
-- La migración 0001 dejó las tablas de contenido en solo lectura pública y
-- reservó la escritura a la `service_role`. Pero el sitio se publica como
-- export estático: no hay backend donde guardar esa clave, así que el estudio
-- de /admin no podía crear ni editar nada.
--
-- Esta migración abre la escritura a los usuarios autenticados que estén
-- registrados en `cms_profiles`, que es el marcador de editor que ya define el
-- esquema. Quien no tenga fila ahí sigue siendo un visitante anónimo, aunque
-- consiga un token válido de Auth.
--
-- También:
--   * permite a esos editores leer borradores, leads y cotizaciones;
--   * cierra la subida anónima de imágenes que abría la 0004;
--   * restringe la creación de etiquetas de la 0005 a usuarios autenticados.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Marcador de editor
-- ---------------------------------------------------------------------------
-- `security definer` evita la recursión: la política de `cms_profiles` volvería
-- a consultar `cms_profiles` para resolverse a sí misma.

create or replace function public.is_cms_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cms_profiles where id = auth.uid()
  );
$$;

revoke execute on function public.is_cms_editor() from public;
grant execute on function public.is_cms_editor() to authenticated;

-- ---------------------------------------------------------------------------
-- Contenido: lectura completa y escritura para editores
-- ---------------------------------------------------------------------------

do $$
declare
  editable text[] := array[
    'developers','projects','project_translations','project_source_records',
    'project_phases','project_locations','project_unit_types',
    'project_price_snapshots','project_payment_plans','specification_fields',
    'project_spec_values','amenities','project_amenities','project_media',
    'project_contacts'
  ];
  item text;
begin
  foreach item in array editable loop
    -- Lectura sin el filtro de `published`, para poder trabajar en borradores.
    execute format(
      'drop policy if exists "%1$s editor read" on public.%1$I;
       create policy "%1$s editor read" on public.%1$I
         for select to authenticated using (public.is_cms_editor());',
      item
    );
    execute format(
      'drop policy if exists "%1$s editor insert" on public.%1$I;
       create policy "%1$s editor insert" on public.%1$I
         for insert to authenticated with check (public.is_cms_editor());',
      item
    );
    execute format(
      'drop policy if exists "%1$s editor update" on public.%1$I;
       create policy "%1$s editor update" on public.%1$I
         for update to authenticated
         using (public.is_cms_editor()) with check (public.is_cms_editor());',
      item
    );
    execute format(
      'drop policy if exists "%1$s editor delete" on public.%1$I;
       create policy "%1$s editor delete" on public.%1$I
         for delete to authenticated using (public.is_cms_editor());',
      item
    );
    execute format(
      'grant select, insert, update, delete on public.%1$I to authenticated;',
      item
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Operación: los editores leen y gestionan leads y cotizaciones
-- ---------------------------------------------------------------------------
-- La inserción anónima de la 0001 se conserva: los formularios públicos siguen
-- funcionando sin sesión.

drop policy if exists "leads editor read" on public.leads;
create policy "leads editor read" on public.leads
  for select to authenticated using (public.is_cms_editor());

drop policy if exists "leads editor update" on public.leads;
create policy "leads editor update" on public.leads
  for update to authenticated
  using (public.is_cms_editor()) with check (public.is_cms_editor());

drop policy if exists "leads editor delete" on public.leads;
create policy "leads editor delete" on public.leads
  for delete to authenticated using (public.is_cms_editor());

drop policy if exists "quotes editor read" on public.calculator_quotes;
create policy "quotes editor read" on public.calculator_quotes
  for select to authenticated using (public.is_cms_editor());

drop policy if exists "quotes editor delete" on public.calculator_quotes;
create policy "quotes editor delete" on public.calculator_quotes
  for delete to authenticated using (public.is_cms_editor());

grant select, update, delete on public.leads to authenticated;
grant select, delete on public.calculator_quotes to authenticated;

-- ---------------------------------------------------------------------------
-- Avisos: que los editores puedan crearlos, no solo leerlos
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.notifications') is not null then
    execute 'drop policy if exists "notifications editor insert" on public.notifications';
    execute 'create policy "notifications editor insert" on public.notifications
               for insert to authenticated with check (public.is_cms_editor())';
    execute 'grant select, insert, update, delete on public.notifications to authenticated';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Etiquetas (0005): lectura pública, escritura solo autenticada
-- ---------------------------------------------------------------------------
-- La 0005 dejaba `with check (true)`, así que cualquiera con la clave anónima
-- pública podía llenar el catálogo de basura.

do $$
begin
  if to_regclass('public.categories') is not null then
    execute 'drop policy if exists "Auth Insert Categories" on public.categories';
    execute 'drop policy if exists "categories auth insert" on public.categories';
    execute 'create policy "categories auth insert" on public.categories
               for insert to authenticated with check (true)';
    execute 'grant select on public.categories to anon, authenticated';
    execute 'grant insert on public.categories to authenticated';
  end if;
end $$;

commit;

-- ---------------------------------------------------------------------------
-- Storage: bucket público de imágenes, subida solo para editores
-- ---------------------------------------------------------------------------
-- Fuera de la transacción porque `storage.objects` pertenece al rol de storage
-- y un fallo de permisos aquí no debe revertir las políticas de arriba.

insert into storage.buckets (id, name, public)
values ('projects', 'projects', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Anon Upload" on storage.objects;
drop policy if exists "Anon Update" on storage.objects;
drop policy if exists "Anon Delete" on storage.objects;
drop policy if exists "projects public read" on storage.objects;
drop policy if exists "projects editor insert" on storage.objects;
drop policy if exists "projects editor update" on storage.objects;
drop policy if exists "projects editor delete" on storage.objects;

create policy "projects public read" on storage.objects
  for select using (bucket_id = 'projects');

create policy "projects editor insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'projects' and public.is_cms_editor());

create policy "projects editor update" on storage.objects
  for update to authenticated
  using (bucket_id = 'projects' and public.is_cms_editor());

create policy "projects editor delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'projects' and public.is_cms_editor());

-- ---------------------------------------------------------------------------
-- Alta del administrador
-- ---------------------------------------------------------------------------
-- Sustituye el correo por el del usuario creado en Authentication y ejecuta
-- esta sentencia una vez. Sin esta fila el panel entra pero no puede escribir.
--
--   insert into public.cms_profiles (id, full_name, role)
--   select id, 'Andris Peña', 'admin' from auth.users where email = 'tu@correo.com'
--   on conflict (id) do update set role = 'admin';
