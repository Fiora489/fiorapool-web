CREATE TABLE IF NOT EXISTS public.desktop_api_keys (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label        text        NOT NULL CHECK (length(label) BETWEEN 1 AND 100),
  key_hash     text        NOT NULL UNIQUE,  -- SHA-256 hex of the raw key
  key_prefix   text        NOT NULL,         -- first 8 chars of raw key (display only)
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

CREATE INDEX IF NOT EXISTS desktop_api_keys_user_idx
  ON public.desktop_api_keys (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS desktop_api_keys_hash_idx
  ON public.desktop_api_keys (key_hash);

ALTER TABLE public.desktop_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "desktop_api_keys: owner only"
  ON public.desktop_api_keys FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
