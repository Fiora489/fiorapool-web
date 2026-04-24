import 'server-only'

/**
 * Hook point for manual search index maintenance.
 *
 * Phase 58 relies entirely on the DB trigger `custom_builds_search_trigger`
 * (installed by migration 20260426000000_hub_search_indexes.sql) to keep
 * `search_tsv` up to date on every INSERT/UPDATE.  This function exists as
 * a documented extension point for future bulk-maintenance workflows (e.g.
 * after a Data Dragon item-ID rename migration that doesn't touch rows
 * individually).
 *
 * To force a rebuild for a specific build, issue a no-op UPDATE from a
 * privileged context; the trigger will fire and regenerate search_tsv.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function refreshSearchIndex(_buildId: string): Promise<void> {
  // Intentional no-op stub — the DB trigger handles incremental maintenance.
}
