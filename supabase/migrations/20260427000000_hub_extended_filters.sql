-- Phase 59: Extended filter + search infrastructure

-- ---------------------------------------------------------------------------
-- 1. hub_top_tags — facet counts for the tag filter panel
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.hub_top_tags(
  p_champion_id text DEFAULT NULL,
  p_patch_tag   text DEFAULT NULL,
  p_limit       int  DEFAULT 20
)
RETURNS TABLE (tag text, count bigint)
LANGUAGE sql STABLE AS $$
  SELECT
    unnest(build_tags) AS tag,
    COUNT(*)           AS count
  FROM public.custom_builds
  WHERE is_public = true
    AND (p_champion_id IS NULL OR champion_id = p_champion_id)
    AND (p_patch_tag   IS NULL OR patch_tag   = p_patch_tag)
  GROUP BY 1
  ORDER BY 2 DESC
  LIMIT p_limit;
$$;

-- ---------------------------------------------------------------------------
-- 2. hub_search_log — anonymous query logging for trending searches
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.hub_search_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text  text        NOT NULL CHECK (length(query_text) >= 3),
  searched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hub_search_log_time_text_idx
  ON public.hub_search_log (searched_at DESC, query_text);

ALTER TABLE public.hub_search_log ENABLE ROW LEVEL SECURITY;

-- Anonymous insert (no auth required — lightweight telemetry)
CREATE POLICY "hub_search_log: insert"
  ON public.hub_search_log FOR INSERT WITH CHECK (true);

CREATE POLICY "hub_search_log: read"
  ON public.hub_search_log FOR SELECT USING (true);
