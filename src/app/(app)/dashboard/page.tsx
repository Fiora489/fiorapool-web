import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from './actions'
import { SparklesText } from '@/components/ui/sparkles-text'

async function getAnalytics(userId: string) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: matches } = await supabase
    .from('matches')
    .select('win,kills,deaths,assists,cs,game_duration_seconds,champion_name,queue_type,captured_at')
    .eq('user_id', userId)
    .order('captured_at', { ascending: false })

  if (!matches?.length) return null

  const total = matches.length
  const wins = matches.filter(m => m.win).length
  const avgKills   = matches.reduce((s, m) => s + (m.kills ?? 0), 0) / total
  const avgDeaths  = matches.reduce((s, m) => s + (m.deaths ?? 0), 0) / total
  const avgAssists = matches.reduce((s, m) => s + (m.assists ?? 0), 0) / total
  const avgCsMin   = matches.reduce((s, m) => {
    const mins = (m.game_duration_seconds ?? 0) / 60
    return s + (mins > 0 ? (m.cs ?? 0) / mins : 0)
  }, 0) / total

  const champMap = new Map<string, { wins: number; games: number }>()
  const queueMap = new Map<string, { wins: number; games: number }>()

  for (const m of matches) {
    const champ = m.champion_name ?? 'Unknown'
    const c = champMap.get(champ) ?? { wins: 0, games: 0 }
    c.games++; if (m.win) c.wins++
    champMap.set(champ, c)

    const queue = m.queue_type ?? 'Unknown'
    const q = queueMap.get(queue) ?? { wins: 0, games: 0 }
    q.games++; if (m.win) q.wins++
    queueMap.set(queue, q)
  }

  return {
    total,
    winRate: Math.round((wins / total) * 100),
    avgKills:   +avgKills.toFixed(1),
    avgDeaths:  +avgDeaths.toFixed(1),
    avgAssists: +avgAssists.toFixed(1),
    avgCsMin:   +avgCsMin.toFixed(1),
    topChampions: [...champMap.entries()]
      .sort((a, b) => b[1].games - a[1].games).slice(0, 5)
      .map(([name, { wins: w, games: g }]) => ({ name, games: g, wins: w, winRate: Math.round((w / g) * 100) })),
    queueBreakdown: [...queueMap.entries()]
      .sort((a, b) => b[1].games - a[1].games)
      .map(([type, { wins: w, games: g }]) => ({ type, games: g, wins: w, winRate: Math.round((w / g) * 100) })),
    recentForm: matches.slice(0, 10).map(m => m.win),
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const stats = user ? await getAnalytics(user.id) : null

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <SparklesText
            className="font-display text-3xl font-bold sm:text-4xl"
            colors={{ first: 'var(--primary)', second: '#ffffff' }}
            sparklesCount={5}
          >
            Dashboard
          </SparklesText>
          <div className="flex items-center gap-4">
            <a
              href="/api/share/card"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Share card ↗
            </a>
            <form action={logout}>
              <button type="submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>

        {!stats ? (
          <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
            No match data yet — go to <Link href="/matches" className="underline">Matches</Link> and hit Sync.
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Win Rate" value={`${stats.winRate}%`} sub={`${stats.total} games`} color={stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'} />
              <StatCard label="Avg KDA" value={`${stats.avgKills}/${stats.avgDeaths}/${stats.avgAssists}`} sub={`${((stats.avgKills + stats.avgAssists) / Math.max(stats.avgDeaths, 1)).toFixed(2)} ratio`} />
              <StatCard label="CS / min" value={stats.avgCsMin.toString()} sub="avg per game" />
              <StatCard label="Games" value={stats.total.toString()} sub="synced" />
            </div>

            {/* Recent form */}
            <div className="rounded-lg border border-border p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Form</p>
              <div className="flex gap-1.5">
                {stats.recentForm.map((win, i) => (
                  <span key={i} className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${win ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {win ? 'W' : 'L'}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Top champions */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Top Champions</p>
                {stats.topChampions.map(c => (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{c.name}</span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{c.games}g</span>
                      <span className={c.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>{c.winRate}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Queue breakdown */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By Queue</p>
                {stats.queueBreakdown.map(q => (
                  <div key={q.type} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{q.type.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{q.games}g</span>
                      <span className={q.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>{q.winRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold ${color ?? ''}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}
