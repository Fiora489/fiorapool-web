import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getWeeklyQuestDefs, getMondayOfWeek, computeQuestProgress } from '@/lib/quests'

const DAILY_LOGIN_XP = 50

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const weekStart = getMondayOfWeek()
  const weekStartStr = weekStart.toISOString().slice(0, 10)

  const [{ data: matches }, { data: storedQuests }, { data: todayLogin }] = await Promise.all([
    supabase.from('matches')
      .select('win,kills,deaths,assists,cs,game_duration_seconds,vision_score,captured_at')
      .eq('user_id', user.id)
      .order('captured_at', { ascending: false }),
    sb.from('weekly_quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStartStr),
    sb.from('daily_logins')
      .select('*')
      .eq('user_id', user.id)
      .eq('login_date', new Date().toISOString().slice(0, 10))
      .single(),
  ])

  const defs = getWeeklyQuestDefs(weekStart)
  const m = matches ?? []

  // Upsert quest progress for each quest
  const quests = await Promise.all(defs.map(async (def) => {
    const progress = computeQuestProgress(def.id, m, weekStart)
    const completed = progress >= def.target
    const stored = storedQuests?.find((q: { quest_id: string; completed: boolean; progress: number; id: string }) => q.quest_id === def.id)

    if (!stored) {
      await sb.from('weekly_quests').insert({
        user_id: user.id, week_start: weekStartStr,
        quest_id: def.id, target: def.target,
        progress, completed, xp_reward: def.xpReward,
      })
    } else if (stored.progress !== progress || stored.completed !== completed) {
      await sb.from('weekly_quests').update({ progress, completed })
        .eq('id', stored.id)

      // Award XP when newly completed
      if (completed && !stored.completed) {
        const { data: prog } = await supabase.from('app_progress').select('xp').eq('user_id', user.id).single()
        await supabase.from('app_progress').upsert(
          { user_id: user.id, xp: (prog?.xp ?? 0) + def.xpReward },
          { onConflict: 'user_id' }
        )
      }
    }

    return { ...def, progress, completed }
  }))

  // Daily login reward
  const loginAwarded = !!todayLogin
  if (!loginAwarded) {
    await sb.from('daily_logins').insert({ user_id: user.id, xp_awarded: DAILY_LOGIN_XP })
    const { data: prog } = await supabase.from('app_progress').select('xp').eq('user_id', user.id).single()
    await supabase.from('app_progress').upsert(
      { user_id: user.id, xp: (prog?.xp ?? 0) + DAILY_LOGIN_XP },
      { onConflict: 'user_id' }
    )
  }

  return NextResponse.json({ quests, loginAwarded, loginXp: DAILY_LOGIN_XP, weekStart: weekStartStr })
}
