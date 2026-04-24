import 'server-only'

import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

const MAX_QUERY_LENGTH = 500

/** Stable 16-char SHA-256 prefix of the normalised query — used for grouping. */
function hashQuery(queryText: string): string {
  return createHash('sha256')
    .update(queryText.toLowerCase().trim())
    .digest('hex')
    .slice(0, 16)
}

/**
 * Fire-and-forget search event logger.
 *
 * - Skips empty / whitespace-only queries.
 * - Respects `app_settings.telemetry_opt_out = true` for authenticated users.
 * - Never throws — analytics must never break the user's search.
 */
export async function logSearch({
  userId,
  queryText,
  filtersJson = {},
}: {
  userId?: string | null
  queryText: string
  filtersJson?: Json
}): Promise<void> {
  const trimmed = queryText?.trim() ?? ''
  if (!trimmed) return

  try {
    const supabase = await createClient()

    // Best-effort opt-out check — if the column/table doesn't exist we log anyway
    if (userId) {
      const { data: settings } = await supabase
        .from('app_settings')
        .select('telemetry_opt_out')
        .eq('user_id', userId)
        .maybeSingle()
      if (settings && (settings as unknown as Record<string, unknown>).telemetry_opt_out === true) {
        return
      }
    }

    await supabase.from('search_analytics').insert({
      user_id: userId ?? null,
      query_hash: hashQuery(trimmed),
      query_text: trimmed.toLowerCase().slice(0, MAX_QUERY_LENGTH),
      filters_json: filtersJson,
    })
  } catch {
    // Swallow all errors — telemetry is non-critical
  }
}
