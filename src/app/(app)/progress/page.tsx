import { createClient } from '@/lib/supabase/server'
import { computeStats, checkEarnedBadges, levelFromXp, BADGE_DEFS } from '@/lib/xp'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: progress }, { data: matches }, { data: earnedRows }] = await Promise.all([
    supabase.from('app_progress').select('*').eq('user_id', user.id).single(),
    supabase.from('matches').select('win,kills,deaths,assists,cs,game_duration_seconds,champion_name,queue_type').eq('user_id', user.id).order('captured_at', { ascending: false }),
    supabase.from('user_badges').select('badge_id,earned_at').eq('user_id', user.id),
  ])

  const stats = computeStats(matches ?? [])
  const xp = progress?.xp ?? stats.totalXp
  const { level, xpIntoLevel, xpForNext } = levelFromXp(xp)
  const pct = Math.round((xpIntoLevel / xpForNext) * 100)
  const earnedIds = new Set((earnedRows ?? []).map(r => r.badge_id))

  const badges = BADGE_DEFS.map(b => ({
    ...b,
    earned: earnedIds.has(b.id),
  }))

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Progress</h1>

        {/* Level + XP bar */}
        <div className="rounded-lg border border-border p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold">Level {level}</span>
            <span className="text-sm text-muted-foreground">{xpIntoLevel} / {xpForNext} XP</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{xp} total XP</p>
        </div>

        {/* Streak + stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border p-4 text-center space-y-1">
            <p className="text-2xl font-bold">{stats.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Win Streak</p>
          </div>
          <div className="rounded-lg border border-border p-4 text-center space-y-1">
            <p className="text-2xl font-bold">{stats.maxStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="rounded-lg border border-border p-4 text-center space-y-1">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Games Played</p>
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-lg border border-border p-5 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Badges — {badges.filter(b => b.earned).length} / {badges.length}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map(b => (
              <div
                key={b.id}
                className={`rounded-lg border p-3 flex items-center gap-3 transition-colors ${
                  b.earned ? 'border-border bg-card' : 'border-border/40 opacity-40'
                }`}
              >
                <span className="text-2xl">{b.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{b.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
