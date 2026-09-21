-- Migration: 0007_analytics.sql
-- Description: Tablas y vistas para el rastreador de visitas.

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_slug text NOT NULL,
  path text NOT NULL,
  session_hash text NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow insert from anon (so the edge function using anon key can insert)
-- Or better, no policies means no one can insert except service_role. 
-- Let's make it so only service_role can insert, since our Edge Function will use it, or anon can insert via RPC.
-- To be safe, let's create a secure RPC that the Edge function or Frontend can call.

CREATE OR REPLACE FUNCTION public.track_page_view(
  p_slug text,
  p_path text,
  p_hash text,
  p_agent text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.analytics_events (project_slug, path, session_hash, user_agent)
  VALUES (p_slug, p_path, p_hash, p_agent);
END;
$$;

-- Allow anon to call this function
GRANT EXECUTE ON FUNCTION public.track_page_view TO anon;
GRANT EXECUTE ON FUNCTION public.track_page_view TO authenticated;

-- Create a view for the CMS dashboard
CREATE OR REPLACE VIEW public.project_views AS
SELECT project_slug, count(*) as views, count(distinct session_hash) as unique_visitors
FROM public.analytics_events
GROUP BY project_slug;

-- Give access to the view
GRANT SELECT ON public.project_views TO anon;
GRANT SELECT ON public.project_views TO authenticated;
