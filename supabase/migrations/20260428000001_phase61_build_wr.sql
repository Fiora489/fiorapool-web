-- Phase 61: Build performance tracking indexes and views
-- NOTE: build_match_tags table was created in Phase 53 migration.

-- Indexes for WR queries (table was created in Phase 53)
CREATE INDEX IF NOT EXISTS build_match_tags_build_user_idx
  ON public.build_match_tags (build_id, user_id, won);

CREATE INDEX IF NOT EXISTS build_match_tags_user_match_idx
  ON public.build_match_tags (user_id, match_id);

-- View: personal build win rates
CREATE OR REPLACE VIEW public.build_personal_wr AS
  SELECT
    build_id,
    user_id,
    COUNT(*) AS total_games,
    COUNT(*) FILTER (WHERE won) AS wins,
    ROUND(COUNT(*) FILTER (WHERE won)::numeric / NULLIF(COUNT(*), 0), 4) AS win_rate,
    MAX(detected_at) AS last_tagged_at
  FROM public.build_match_tags
  GROUP BY build_id, user_id;

-- View: aggregate (community) win rates for public opt-in builds
CREATE OR REPLACE VIEW public.build_aggregate_wr AS
  SELECT
    bmt.build_id,
    COUNT(*) AS total_games,
    COUNT(*) FILTER (WHERE bmt.won) AS wins,
    ROUND(COUNT(*) FILTER (WHERE bmt.won)::numeric / NULLIF(COUNT(*), 0), 4) AS win_rate,
    COUNT(DISTINCT bmt.user_id) AS contributor_count
  FROM public.build_match_tags bmt
  JOIN public.custom_builds cb ON cb.id = bmt.build_id
  WHERE cb.is_public = true AND cb.opt_in_aggregate = true
  GROUP BY bmt.build_id;
