import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type {
  BuildBlockRow,
  BuildListItem,
  CustomBuildFull,
  CustomBuildRow,
  ItemSwapRow,
  MatchupNoteRow,
  RunePageRow,
  BlockType,
  BuildBlockItem,
} from '@/lib/types/builds'

// Re-export the pure validators so existing imports keep working.
export {
  BuildValidationError,
  canonicalBuildKey,
  validateBuildMeta,
} from './validators'
export type { ValidateBuildMetaInput } from './validators'

// ---------------------------------------------------------------------------
// Row → DTO mappers
// ---------------------------------------------------------------------------

function mapBuildListItem(row: CustomBuildRow): BuildListItem {
  return {
    id: row.id,
    championId: row.champion_id,
    name: row.name,
    roles: row.roles ?? [],
    isPublic: row.is_public,
    patchTag: row.patch_tag,
    updatedAt: row.updated_at,
  }
}

function mapBlockRow(raw: Record<string, unknown>): BuildBlockRow {
  return {
    build_id: String(raw.build_id),
    block_type: raw.block_type as BlockType,
    position: Number(raw.position ?? 0),
    items: Array.isArray(raw.items) ? (raw.items as BuildBlockItem[]) : [],
    power_spikes: Array.isArray(raw.power_spikes) ? (raw.power_spikes as number[]) : [],
    gold_total: Number(raw.gold_total ?? 0),
  }
}

// ---------------------------------------------------------------------------
// Server-side query helpers
// ---------------------------------------------------------------------------

export async function listBuildsForUser(userId: string): Promise<BuildListItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('custom_builds')
    .select(
      'id, user_id, champion_id, name, roles, is_public, patch_tag, updated_at, description_md, build_tags, last_validated_patch, combos, max_priority, warding_note, trinket, spell1, spell2, spell_alt_note, rune_page_id, skill_order, opt_in_aggregate, created_at',
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[listBuildsForUser]', error)
    return []
  }
  return (data as CustomBuildRow[]).map(mapBuildListItem)
}

export async function getBuildById(
  id: string,
  userId: string,
): Promise<CustomBuildFull | null> {
  const supabase = await createClient()

  const { data: buildRow, error: buildErr } = await supabase
    .from('custom_builds')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (buildErr || !buildRow) return null

  return loadBuildChildren(buildRow as CustomBuildRow)
}

export async function getPublicBuild(id: string): Promise<CustomBuildFull | null> {
  const supabase = await createClient()

  const { data: buildRow, error: buildErr } = await supabase
    .from('custom_builds')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle()

  if (buildErr || !buildRow) return null

  return loadBuildChildren(buildRow as CustomBuildRow)
}

async function loadBuildChildren(build: CustomBuildRow): Promise<CustomBuildFull> {
  const supabase = await createClient()

  const [blocksRes, notesRes, swapsRes, runeRes] = await Promise.all([
    supabase.from('custom_build_blocks').select('*').eq('build_id', build.id),
    supabase.from('custom_matchup_notes').select('*').eq('build_id', build.id),
    supabase.from('custom_item_swaps').select('*').eq('build_id', build.id).order('position'),
    build.rune_page_id
      ? supabase.from('custom_rune_pages').select('*').eq('id', build.rune_page_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  const blocks: BuildBlockRow[] = (blocksRes.data ?? []).map((r) =>
    mapBlockRow(r as Record<string, unknown>),
  )
  const matchupNotes = (notesRes.data ?? []) as MatchupNoteRow[]
  const itemSwaps = (swapsRes.data ?? []) as ItemSwapRow[]
  const runePage = (runeRes.data ?? null) as RunePageRow | null

  return { build, blocks, matchupNotes, itemSwaps, runePage }
}
