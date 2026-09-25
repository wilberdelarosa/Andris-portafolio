-- Mark existing leads as previously seen, and let new leads start unread.
begin;

alter table public.leads
  add column if not exists read_at timestamptz;

update public.leads
set read_at = created_at
where read_at is null;

comment on column public.leads.read_at is
  'Timestamp when a CMS editor first opened this lead; null means unread.';

commit;
