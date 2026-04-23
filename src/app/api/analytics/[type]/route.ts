import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Tables } from '@/types/database'
import {
  computeOverview,
  computeAram,
  computeClutch,
  computeOpponentQuality,
  computeTeamComp,
  computeVisionObjectives,
} from '@/lib/analytics'

const VALID_TYPES = ['overview', 'aram', 'clutch', 'opponent-quality', 'team-comp', 'vision-objectives'] as const
type AnalyticsType = (typeof VALID_TYPES)[number]

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type } = await params

  if (!(VALID_TYPES as readonly string[]).includes(type)) {
    return NextResponse.json({ error: 'Unknown analytics type' }, { status: 400 })
  }

  const analyticsType = type as AnalyticsType

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (matches ?? []) as Tables<'matches'>[]

  switch (analyticsType) {
    case 'overview':        return NextResponse.json(computeOverview(rows))
    case 'aram':            return NextResponse.json(computeAram(rows))
    case 'clutch':          return NextResponse.json(computeClutch(rows))
    case 'opponent-quality':return NextResponse.json(computeOpponentQuality(rows))
    case 'team-comp':        return NextResponse.json(computeTeamComp(rows))
    case 'vision-objectives':return NextResponse.json(computeVisionObjectives(rows))
  }
}
