import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { diffBuilds } from '@/lib/builds/diff'
import type {
  BuildBlockItem,
  BuildBlockRow,
  BlockType,
  CustomBuildFull,
  CustomBuildRow,
  ItemSwapRow,
  MatchupNoteRow,
  RunePageRow,
} from '@/lib/types/builds'

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

function mapBuildRow(raw: Record<string, unknown>): CustomBuildRow {
  return raw as unknown as CustomBuildRow
}

function mapBlockRow(raw: Record<string, unknown>): BuildBlockRow {
  return {
    build_id: String(raw.build_id),
    block_type: raw.block_type as BlockType,
    position: Number(raw.position ?? 0),
    items: Array.isArray(raw.items) ? (raw.items as BuildBlockItem[]) : [],
    power_spikes: Array.isArray(raw.power_spikes)
      ? (raw.power_spikes as number[])
      : [],
    gold_total: Number(raw.gold_total ?? 0),
  }
}

// ---------------------------------------------------------------------------
// Fetch a full build by ID
// ---------------------------------------------------------------------------

async function fetchBuildFull(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  buildId: string,
): Promise<CustomBuildFull | null> {
  const { data: buildData, error: buildError } = await supabase
    .from('custom_builds')
    .select('*')
    .eq('id', buildId)
    .single()

  if (buildError || !buildData) return null

  const build = mapBuildRow(buildData as Record<string, unknown>)

  const [blocksResult, notesResult, swapsResult] = await Promise.all([
    supabase
      .from('custom_build_blocks')
      .select('*')
      .eq('build_id', buildId),
    supabase
      .from('custom_matchup_notes')
      .select('*')
      .eq('build_id', buildId),
    supabase
      .from('custom_item_swaps')
      .select('*')
      .eq('build_id', buildId),
  ])

  const blocks: BuildBlockRow[] = (
    (blocksResult.data as Record<string, unknown>[] | null) ?? []
  ).map(mapBlockRow)

  const matchupNotes: MatchupNoteRow[] = (notesResult.data ??
    []) as MatchupNoteRow[]
  const itemSwaps: ItemSwapRow[] = (swapsResult.data ?? []) as ItemSwapRow[]

  let runePage: RunePageRow | null = null
  if (build.rune_page_id) {
    const { data: rpData } = await supabase
      .from('custom_rune_pages')
      .select('*')
      .eq('id', build.rune_page_id)
      .single()
    runePage = rpData ?? null
  }

  return { build, blocks, matchupNotes, itemSwaps, runePage }
}

// ---------------------------------------------------------------------------
// GET /api/builds/diff?a=buildIdA&b=buildIdB
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const aId = searchParams.get('a')
  const bId = searchParams.get('b')

  if (!aId || !bId) {
    return NextResponse.json(
      { error: 'Query params "a" and "b" are required' },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [fullA, fullB] = await Promise.all([
    fetchBuildFull(supabase, aId),
    fetchBuildFull(supabase, bId),
  ])

  if (!fullA || !fullB) {
    return NextResponse.json({ error: 'Build not found' }, { status: 404 })
  }

  // Authorization: at least one build is public OR user owns both
  const userId = user?.id ?? null
  const aPublic = fullA.build.is_public
  const bPublic = fullB.build.is_public
  const userOwnsBoth =
    userId !== null &&
    fullA.build.user_id === userId &&
    fullB.build.user_id === userId

  if (!aPublic && !bPublic && !userOwnsBoth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const diff = diffBuilds(fullA, fullB)
  return NextResponse.json(diff, { status: 200 })
}
