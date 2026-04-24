import { createClient } from '@/lib/supabase/server'
import { getWeeklyQuestDefs, getMondayOfWeek, computeQuestProgress, detectTilt } from '@/lib/quests'

export default async function QuestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const weekStart = getMondayOfWeek()
  const weekStartStr = weekStart.toISOString().slice(0, 10)

  const [{ data: matches }, { data: storedQuests }, { data: todayLogin }] = await Promise.all([
    supabase.from('matches')
      .select('win,kills,deaths,assists,cs,game_duration_seconds,vision_score,captured_at')
      .eq('user_id', user.id)
      .order('captured_at', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('weekly_quests')
      .select('*').eq('user_id', user.id).eq('week_start', weekStartStr),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('daily_logins')
      .select('*').eq('user_id', user.id).eq('login_date', new Date().toISOString().slice(0, 10))
      .single(),
  ])

  const m = matches ?? []
  const defs = getWeeklyQuestDefs(weekStart)
  const quests = defs.map(def => {
    const progress = computeQuestProgress(def.id, m, weekStart)
    const stored = storedQuests?.find((q: { quest_id: string; completed: boolean }) => q.quest_id === def.id)
    return { ...def, progress, completed: stored?.completed ?? (progress >= def.target) }
  })

  const tilt = detectTilt(m)
  const loginAwarded = !!todayLogin
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  const daysLeft = Math.ceil((weekEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000))

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Quests</h1>

        {/* Tilt alert */}
        {tilt && (
          <div className={`rounded-lg border p-4 space-y-1 ${
            tilt.level === 'high' ? 'border-red-500/50 bg-red-500/10' :
            tilt.level === 'medium' ? 'border-yellow-500/50 bg-yellow-500/10' :
            'border-orange-500/30 bg-orange-500/5'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{tilt.level === 'high' ? '🚨' : tilt.level === 'medium' ? '⚠️' : '💡'}</span>
              <p className="text-sm font-medium">Tilt Detected — {tilt.reason}</p>
            </div>
            <p className="text-xs text-muted-foreground pl-7">{tilt.advice}</p>
          </div>
        )}

        {/* Daily login */}
        <div className={`rounded-lg border p-4 flex items-center justify-between ${loginAwarded ? 'border-green-500/30 bg-green-500/5' : 'border-border'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="text-sm font-medium">Daily Login Reward</p>
              <p className="text-xs text-muted-foreground">+50 XP for showing up</p>
            </div>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded ${loginAwarded ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
            {loginAwarded ? 'Claimed ✓' : 'Visit to claim'}
          </span>
        </div>

        {/* Weekly quests */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Weekly Quests</h2>
            <span className="text-xs text-muted-foreground">{daysLeft}d left</span>
          </div>

          {quests.map(q => {
            const pct = Math.min(100, Math.round((q.progress / q.target) * 100))
            return (
              <div key={q.id} className={`rounded-lg border p-4 space-y-3 ${q.completed ? 'border-green-500/30 bg-green-500/5' : 'border-border'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{q.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{q.label}</p>
                      <p className="text-xs text-muted-foreground">{q.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    {q.completed ? (
                      <span className="text-xs font-medium text-green-400">Done ✓</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{q.progress}/{q.target}</span>
                    )}
                    <p className="text-xs text-primary">+{q.xpReward} XP</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${q.completed ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
