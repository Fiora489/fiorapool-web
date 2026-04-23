import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { computeStats, checkEarnedBadges, levelFromXp, BADGE_DEFS } from '@/lib/xp'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: progress }, { data: matches }, { data: earnedRows }] = await Promise.all([
    supabase.from('app_progress').select('*').eq('user_id', user.id).single(),
    supabase.from('matches').select('win,kills,deaths,assists,cs,game_duration_seconds,champion_name,queue_type').eq('user_id', user.id).order('captured_at', { ascending: false }),
    supabase.from('user_badges').select('badge_id,earned_at').eq('user_id', user.id),
  ])

  const stats = computeStats(matches ?? [])
  const { level, xpIntoLevel, xpForNext } = levelFromXp(progress?.xp ?? stats.totalXp)
  const earnedIds = new Set((earnedRows ?? []).map(r => r.badge_id))

  const badges = BADGE_DEFS.map(b => ({
    ...b,
    earned: earnedIds.has(b.id),
    earnedAt: earnedRows?.find(r => r.badge_id === b.id)?.earned_at ?? null,
  }))

  return NextResponse.json({ level, xpIntoLevel, xpForNext, xp: progress?.xp ?? stats.totalXp, stats, badges })
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: matches } = await supabase
    .from('matches')
    .select('win,kills,deaths,assists,cs,game_duration_seconds,champion_name,queue_type')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: false })

  const stats = computeStats(matches ?? [])
  const { level } = levelFromXp(stats.totalXp)

  await supabase.from('app_progress').upsert({
    user_id: user.id,
    xp: stats.totalXp,
    level,
    streak: stats.currentStreak,
    consistency_score: stats.winRate,
  }, { onConflict: 'user_id' })

  const earnedIds = checkEarnedBadges(stats)
  if (earnedIds.length) {
    await supabase.from('user_badges').upsert(
      earnedIds.map(badge_id => ({ user_id: user.id, badge_id })),
      { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
    )
  }

  return NextResponse.json({ ok: true, xp: stats.totalXp, level, streak: stats.currentStreak })
}
