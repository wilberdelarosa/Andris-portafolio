-- ============================================================================
-- Migración 0003: Sistema de notificaciones
-- ============================================================================

begin;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'error')),
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- Solo usuarios autenticados (admin) pueden ver y modificar notificaciones
drop policy if exists "notifications auth read" on public.notifications;
create policy "notifications auth read" on public.notifications
  for select using (auth.role() = 'authenticated');

drop policy if exists "notifications auth update" on public.notifications;
create policy "notifications auth update" on public.notifications
  for update using (auth.role() = 'authenticated');

drop policy if exists "notifications auth delete" on public.notifications;
create policy "notifications auth delete" on public.notifications
  for delete using (auth.role() = 'authenticated');

-- Trigger directly
drop trigger if exists trg_notifications_updated_at on public.notifications;
create trigger trg_notifications_updated_at before update on public.notifications
for each row execute function public.set_updated_at();

commit;
