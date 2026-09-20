-- Migración 0004: Bucket de Imágenes de Proyectos

insert into storage.buckets (id, name, public) 
values ('projects', 'projects', true) 
on conflict (id) do nothing;

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Anon Upload" on storage.objects;
drop policy if exists "Anon Update" on storage.objects;
drop policy if exists "Anon Delete" on storage.objects;

create policy "Public Access" on storage.objects 
for select using (bucket_id = 'projects');

create policy "Anon Upload" on storage.objects 
for insert with check (bucket_id = 'projects');

create policy "Anon Update" on storage.objects 
for update using (bucket_id = 'projects');

create policy "Anon Delete" on storage.objects 
for delete using (bucket_id = 'projects');
