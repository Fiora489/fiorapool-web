'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  CartesianGrid, Cell,
} from 'recharts'

interface AnalyticsData {
  total: number
  winRate: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  avgCsMin: number
  topChampions: { name: string; games: number; wins: number; winRate: number }[]
  recentForm: boolean[]
}

interface CoachingData {
  momentum: { game: number; winRate: number; win: boolean }[]
  resourceEfficiency: { overall: number; csScore: number; dmgScore: number; visScore: number } | null
  mapAwareness: { overall: number; wardScore: number; visionScore: number } | null
  rolePassport: { role: string; winRate: number; games: number }[]
}

interface MatchData {
  win: boolean
  captured_at: string
}

export default function ChartsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [coaching, setCoaching]   = useState<CoachingData | null>(null)
  const [matches, setMatches]     = useState<MatchData[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then(r => r.json()),
      fetch('/api/coaching').then(r => r.json()),
      fetch('/api/matches?count=20').then(r => r.json()),
    ]).then(([a, c, m]) => {
      setAnalytics(a.empty ? null : a)
      setCoaching(c)
      setMatches(m.matches ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <main className="min-h-screen p-6"><p className="text-muted-foreground text-sm">Loading charts...</p></main>
  if (!analytics) return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Charts</h1>
        <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">No data — sync matches first.</div>
      </div>
    </main>
  )

  // Radar data from coaching scores
  const radarData = coaching?.resourceEfficiency && coaching?.mapAwareness ? [
    { metric: 'CS',     score: coaching.resourceEfficiency.csScore },
    { metric: 'Damage', score: coaching.resourceEfficiency.dmgScore },
    { metric: 'Vision', score: coaching.resourceEfficiency.visScore },
    { metric: 'Wards',  score: coaching.mapAwareness.wardScore },
    { metric: 'Win%',   score: analytics.winRate },
  ] : []

  // Calendar: last 20 games by date
  const calendarData = buildCalendar(matches)

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Charts</h1>

        {/* Momentum Line */}
        {coaching?.momentum && coaching.momentum.length > 1 && (
          <ChartCard title="Momentum — Rolling 5-Game Win Rate">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={coaching.momentum} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="game" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 6, fontSize: 12 }}
                  formatter={(v) => [`${v}%`, 'Win Rate']}
                />
                <Line type="monotone" dataKey="winRate" stroke="#a78bfa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Champion Win Rates */}
        {analytics.topChampions.length > 0 && (
          <ChartCard title="Champion Win Rate">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.topChampions} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 6, fontSize: 12 }}
                  formatter={(v) => [`${v}%`, 'Win Rate']}
                />
                <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                  {analytics.topChampions.map((c, i) => (
                    <Cell key={i} fill={c.winRate >= 50 ? '#4ade80' : '#f87171'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Radar */}
          {radarData.length > 0 && (
            <ChartCard title="Performance Radar">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1f2937" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Radar dataKey="score" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Game Calendar */}
          {calendarData.length > 0 && (
            <ChartCard title="Game Calendar (last 20)">
              <div className="flex flex-wrap gap-1.5 pt-2">
                {calendarData.map((d, i) => (
                  <div
                    key={i}
                    title={`${d.date}: ${d.wins}W ${d.losses}L`}
                    className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
                    style={{
                      background: d.wins > d.losses
                        ? `rgba(74,222,128,${0.15 + d.wins * 0.15})`
                        : d.losses > d.wins
                          ? `rgba(248,113,113,${0.15 + d.losses * 0.15})`
                          : 'rgba(107,114,128,0.2)',
                      color: d.wins > d.losses ? '#4ade80' : d.losses > d.wins ? '#f87171' : '#6b7280',
                    }}
                  >
                    {d.wins + d.losses}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Each box = one day. Hover for details.</p>
            </ChartCard>
          )}
        </div>
      </div>
    </main>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-5 space-y-3">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </div>
  )
}

function buildCalendar(matches: MatchData[]) {
  const map = new Map<string, { wins: number; losses: number }>()
  for (const m of matches) {
    const date = m.captured_at.slice(0, 10)
    const d = map.get(date) ?? { wins: 0, losses: 0 }
    if (m.win) d.wins++; else d.losses++
    map.set(date, d)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { wins, losses }]) => ({ date, wins, losses }))
}
