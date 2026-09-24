-- Restringe el acceso a los agregados de analítica y fija permisos de los RPC.
-- analytics_events conserva RLS sin políticas: la escritura pública solo
-- puede ocurrir por track_page_view, que es el flujo del tracker del sitio.

alter view public.project_views set (security_invoker = true);
revoke select on public.project_views from anon, authenticated;

-- El helper de políticas debe ser ejecutable solo por usuarios autenticados.
revoke execute on function public.is_cms_editor() from public, anon;
grant execute on function public.is_cms_editor() to authenticated;

-- Mantiene el RPC anónimo de analytics, pero evita search_path mutable.
alter function public.track_page_view(text, text, text, text)
  set search_path = pg_catalog, public;
revoke execute on function public.track_page_view(text, text, text, text) from public;
grant execute on function public.track_page_view(text, text, text, text)
  to anon, authenticated;
