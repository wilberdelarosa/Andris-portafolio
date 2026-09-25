-- There was no read history before this feature; let the CMS owner review
-- historical leads instead of assuming that any of them were already seen.
update public.leads
set read_at = null
where read_at is not null;
