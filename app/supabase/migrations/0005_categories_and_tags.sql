-- Migración 0005: Sistema de Categorías y Etiquetas (Normalización 3NF)

create type public.category_type as enum (
  'amenity', 
  'product_type', 
  'typology', 
  'investment_benefit', 
  'nearby_place',
  'rd_location'
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  type public.category_type not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (type, name)
);

-- RLS
alter table public.categories enable row level security;

drop policy if exists "Public Access Categories" on public.categories;
drop policy if exists "Auth Insert Categories" on public.categories;

-- Lectura pública
create policy "Public Access Categories" on public.categories
  for select using (true);

-- Inserción autenticada (o anónima para desarrollo local CMS)
create policy "Auth Insert Categories" on public.categories
  for insert with check (true);
