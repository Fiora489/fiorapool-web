-- Phase 63: Patch Lifecycle
-- Performance index for staleness queries
CREATE INDEX IF NOT EXISTS custom_builds_patch_lifecycle_idx
  ON public.custom_builds (user_id, last_validated_patch, patch_tag, is_public);
