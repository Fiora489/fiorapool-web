import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { computeStats, checkEarnedBadges, BADGE_DEFS } from '@/lib/xp'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: matches }, { data: earnedRows }] = await Promise.all([
    supabase.from('matches')
      .select('win,kills,deaths,assists,cs,game_duration_seconds,champion_name,queue_type')
      .eq('user_id', user.id)
      .order('captured_at', { ascending: false }),
    supabase.from('user_badges')
      .select('badge_id,earned_at')
      .eq('user_id', user.id),
  ])

  const stats = computeStats(matches ?? [])
  const earnableIds = new Set(checkEarnedBadges(stats))
  const earnedMap = new Map((earnedRows ?? []).map(r => [r.badge_id, r.earned_at]))

  const badges = BADGE_DEFS.map(b => ({
    ...b,
    earned: earnedMap.has(b.id) || earnableIds.has(b.id),
    earnedAt: earnedMap.get(b.id) ?? null,
  }))

  return NextResponse.json({ badges, total: badges.length, earned: badges.filter(b => b.earned).length })
}
