-- Phase 59: Search analytics table + trending view

-- ---------------------------------------------------------------------------
-- search_analytics — per-search telemetry (user_id nullable for anon searches)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.search_analytics (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  query_hash   text        NOT NULL,
  query_text   text        NOT NULL CHECK (length(query_text) >= 1),
  filters_json jsonb       NOT NULL DEFAULT '{}',
  searched_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS search_analytics_ts_idx
  ON public.search_analytics (searched_at DESC);

CREATE INDEX IF NOT EXISTS search_analytics_hash_ts_idx
  ON public.search_analytics (query_hash, searched_at DESC);

ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own history; anon rows (null user_id) are not exposed
CREATE POLICY "search_analytics: own read"
  ON public.search_analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Any request (incl. anon) may insert a row — fire-and-forget telemetry
CREATE POLICY "search_analytics: insert"
  ON public.search_analytics FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- trending_searches_view — pre-aggregated query counts over 7 / 30-day windows
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.trending_searches_view AS
  SELECT
    query_text,
    COUNT(*)                                                                    AS total_count,
    COUNT(*) FILTER (WHERE searched_at > now() - INTERVAL '7 days')            AS count_7d,
    COUNT(*) FILTER (WHERE searched_at > now() - INTERVAL '30 days')           AS count_30d,
    MAX(searched_at)                                                            AS last_seen_at
  FROM public.search_analytics
  WHERE length(query_text) >= 3
  GROUP BY query_text
  ORDER BY count_7d DESC;
