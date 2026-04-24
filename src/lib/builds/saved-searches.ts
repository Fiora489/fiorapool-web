import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { HubQuery, SavedSearch } from '@/lib/types/builds'

/**
 * Return all saved searches for a user, most recent first.
 * Used internally by the listSavedSearches server action.
 */
export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('saved_searches')
    .select('id, name, query_json, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getSavedSearches]', error)
    return []
  }

  return (data ?? []).map(row => ({
    id: row.id as string,
    name: row.name as string,
    queryJson: row.query_json as HubQuery,
    createdAt: row.created_at as string,
  }))
}
