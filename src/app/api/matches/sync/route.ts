import { createClient } from '@/lib/supabase/server'
import { getMatchIds, getMatch, extractMatchRow } from '@/lib/riot-matches'
import { computeStats, checkEarnedBadges, levelFromXp } from '@/lib/xp'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('summoner_profiles')
    .select('puuid, region')
    .eq('user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'No Riot account linked' }, { status: 404 })

  const matchIds = await getMatchIds(profile.puuid, profile.region, 0, 20).catch((e) =>
    NextResponse.json({ error: e.message }, { status: 502 })
  )
  if (matchIds instanceof NextResponse) return matchIds

  // Find which game_ids are already stored
  const numericIds = matchIds.map((id) => parseInt(id.split('_')[1] ?? '0', 10)).filter(Boolean)
  const { data: existing } = await supabase
    .from('matches')
    .select('game_id')
    .eq('user_id', user.id)
    .in('game_id', numericIds)

  const existingIds = new Set((existing ?? []).map((m) => m.game_id))
  const toFetch = matchIds.filter((id) => {
    const num = parseInt(id.split('_')[1] ?? '0', 10)
    return num && !existingIds.has(num)
  })

  await Promise.allSettled(
    toFetch.map(async (matchId) => {
      const match = await getMatch(matchId, profile.region)
      const participant = match.info.participants.find((p) => p.puuid === profile.puuid)
      if (!participant) return

      await supabase
        .from('matches')
        .upsert(extractMatchRow(match, participant, user.id), { onConflict: 'user_id,game_id' })
    })
  )

  // Recalculate XP + badges after sync
  const { data: allMatches } = await supabase
    .from('matches')
    .select('win,kills,deaths,assists,cs,game_duration_seconds,champion_name,queue_type')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: false })
    .limit(500)

  const stats = computeStats(allMatches ?? [])
  const { level } = levelFromXp(stats.totalXp)
  await supabase.from('app_progress').upsert(
    { user_id: user.id, xp: stats.totalXp, level, streak: stats.currentStreak, consistency_score: stats.winRate },
    { onConflict: 'user_id' }
  )
  const earnedIds = checkEarnedBadges(stats)
  if (earnedIds.length) {
    await supabase.from('user_badges').upsert(
      earnedIds.map(badge_id => ({ user_id: user.id, badge_id })),
      { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
    )
  }

  return NextResponse.json({ ok: true, synced: toFetch.length })
}
