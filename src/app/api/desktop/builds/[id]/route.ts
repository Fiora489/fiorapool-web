import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateApiKey } from '@/lib/builds/desktop-sync'
import type { CustomBuildFull } from '@/lib/types/builds'

async function getApiUser(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const rawKey = auth.slice(7)
  return validateApiKey(rawKey)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getApiUser(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  // Fetch the build, verifying ownership
  const { data: build, error: buildError } = await supabase
    .from('custom_builds')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (buildError || !build) {
    return NextResponse.json({ error: 'Build not found' }, { status: 404 })
  }

  // Fetch related data in parallel
  const [blocksResult, matchupResult, swapsResult, runeResult] = await Promise.all([
    supabase
      .from('custom_build_blocks')
      .select('*')
      .eq('build_id', id)
      .order('position', { ascending: true }),
    supabase
      .from('custom_matchup_notes')
      .select('*')
      .eq('build_id', id),
    supabase
      .from('custom_item_swaps')
      .select('*')
      .eq('build_id', id)
      .order('position', { ascending: true }),
    build.rune_page_id
      ? supabase
          .from('custom_rune_pages')
          .select('*')
          .eq('id', build.rune_page_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ])

  const response: CustomBuildFull = {
    build: {
      id: build.id,
      user_id: build.user_id,
      champion_id: build.champion_id,
      name: build.name,
      description_md: build.description_md,
      roles: build.roles as import('@/lib/types/builds').RoleId[],
      build_tags: build.build_tags,
      patch_tag: build.patch_tag,
      last_validated_patch: build.last_validated_patch,
      combos: build.combos,
      max_priority: build.max_priority,
      warding_note: build.warding_note,
      trinket: build.trinket,
      spell1: build.spell1,
      spell2: build.spell2,
      spell_alt_note: build.spell_alt_note,
      rune_page_id: build.rune_page_id,
      skill_order: build.skill_order,
      is_public: build.is_public,
      opt_in_aggregate: build.opt_in_aggregate,
      created_at: build.created_at,
      updated_at: build.updated_at,
    },
    blocks: (blocksResult.data ?? []).map((b) => ({
      build_id: b.build_id,
      block_type: b.block_type as import('@/lib/types/builds').BlockType,
      position: b.position,
      items: b.items as unknown as import('@/lib/types/builds').BuildBlockItem[],
      power_spikes: b.power_spikes,
      gold_total: b.gold_total,
    })),
    matchupNotes: (matchupResult.data ?? []).map((m) => ({
      build_id: m.build_id,
      enemy_champion_id: m.enemy_champion_id,
      difficulty: m.difficulty as import('@/lib/types/builds').MatchupDifficulty,
      note: m.note,
      threats: m.threats as Array<{ kind: 'champion' | 'item'; id: string | number }>,
    })),
    itemSwaps: (swapsResult.data ?? []).map((s) => ({
      id: s.id,
      build_id: s.build_id,
      condition_text: s.condition_text,
      from_item: s.from_item,
      to_item: s.to_item,
      position: s.position,
    })),
    runePage: runeResult.data
      ? {
          id: runeResult.data.id,
          user_id: runeResult.data.user_id,
          name: runeResult.data.name,
          primary_style: runeResult.data.primary_style,
          keystone: runeResult.data.keystone,
          primary_minors: runeResult.data.primary_minors as [number, number, number],
          secondary_style: runeResult.data.secondary_style,
          secondary_minors: runeResult.data.secondary_minors as [number, number],
          shards: runeResult.data.shards as [number, number, number],
          created_at: runeResult.data.created_at,
          updated_at: runeResult.data.updated_at,
        }
      : null,
  }

  return NextResponse.json(response)
}
