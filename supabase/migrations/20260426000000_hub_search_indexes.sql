-- Phase 58: Hub search indexes + saved_searches + bookmark counts view

-- ---------------------------------------------------------------------------
-- 1. Full-text search infrastructure on custom_builds
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add the search vector column (not generated — to_tsvector is STABLE, not IMMUTABLE)
ALTER TABLE public.custom_builds
  ADD COLUMN IF NOT EXISTS search_tsv tsvector;

-- Trigger function: rebuilds search_tsv on every insert/update
CREATE OR REPLACE FUNCTION public.custom_builds_search_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description_md, '')), 'B') ||
    setweight(to_tsvector('simple', array_to_string(NEW.build_tags, ' ')), 'A') ||
    setweight(to_tsvector('simple', array_to_string(NEW.combos, ' ')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW.warding_note, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS custom_builds_search_trigger ON public.custom_builds;
CREATE TRIGGER custom_builds_search_trigger
  BEFORE INSERT OR UPDATE ON public.custom_builds
  FOR EACH ROW EXECUTE FUNCTION public.custom_builds_search_update();

-- Backfill existing rows (touch name to fire the trigger)
UPDATE public.custom_builds SET name = name;

-- GIN index on search_tsv (full-text query)
CREATE INDEX IF NOT EXISTS custom_builds_search_tsv_gin_idx
  ON public.custom_builds USING GIN (search_tsv);

-- Trigram index on name (prefix / "contains" autocomplete)
CREATE INDEX IF NOT EXISTS custom_builds_name_trgm_idx
  ON public.custom_builds USING GIN (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- 2. Supporting btree indexes for hub filters + sorts
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS custom_builds_champion_public_idx
  ON public.custom_builds (champion_id, is_public);

CREATE INDEX IF NOT EXISTS custom_builds_patch_public_idx
  ON public.custom_builds (patch_tag, is_public);

CREATE INDEX IF NOT EXISTS custom_builds_public_created_idx
  ON public.custom_builds (is_public, created_at DESC);

CREATE INDEX IF NOT EXISTS custom_builds_public_updated_idx
  ON public.custom_builds (is_public, updated_at DESC);

-- ---------------------------------------------------------------------------
-- 3. Saved searches
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.saved_searches (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  query_json jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saved_searches_user_idx
  ON public.saved_searches (user_id, created_at DESC);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_searches: owner only"
  ON public.saved_searches FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. Bookmark count view (Phase 60 populates build_bookmarks; this view
--    lets the hub query join without knowing Phase 60 details yet)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.build_bookmark_counts AS
  SELECT
    build_id,
    COUNT(*) AS bookmark_count
  FROM public.build_bookmarks
  GROUP BY build_id;
