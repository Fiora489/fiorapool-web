-- Phase 60: Hub Social Layer
-- build_bookmarks
CREATE TABLE IF NOT EXISTS public.build_bookmarks (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  build_id   uuid        NOT NULL REFERENCES public.custom_builds(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, build_id)
);
CREATE INDEX IF NOT EXISTS build_bookmarks_user_idx ON public.build_bookmarks (user_id, created_at DESC);
ALTER TABLE public.build_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks: owner only" ON public.build_bookmarks FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- build_collections
CREATE TABLE IF NOT EXISTS public.build_collections (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  description text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS build_collections_user_idx ON public.build_collections (user_id, created_at DESC);
ALTER TABLE public.build_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections: owner only" ON public.build_collections FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- build_collection_items
CREATE TABLE IF NOT EXISTS public.build_collection_items (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid        NOT NULL REFERENCES public.build_collections(id) ON DELETE CASCADE,
  build_id      uuid        NOT NULL REFERENCES public.custom_builds(id) ON DELETE CASCADE,
  position      integer     NOT NULL DEFAULT 0,
  added_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, build_id)
);
CREATE INDEX IF NOT EXISTS build_collection_items_col_idx ON public.build_collection_items (collection_id, position ASC);
ALTER TABLE public.build_collection_items ENABLE ROW LEVEL SECURITY;
-- Items inherit owner via collection — check via join
CREATE POLICY "collection_items: owner only" ON public.build_collection_items FOR ALL
  USING (
    collection_id IN (
      SELECT id FROM public.build_collections WHERE user_id = auth.uid()
    )
  );
