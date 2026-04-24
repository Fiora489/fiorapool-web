import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { computeStats } from '@/lib/xp'

export const runtime = 'edge'

const VALID_LAYOUTS = ['hero', 'scoreboard', 'timeline'] as const
type Layout = (typeof VALID_LAYOUTS)[number]

type MatchSlim = {
  win: boolean
  kills: number
  deaths: number
  assists: number
  cs: number
  game_duration_seconds: number
  champion_name: string | null
  queue_type: string
  captured_at: string
}

type Progress = { level: number; xp: number } | null

const BG = 'linear-gradient(135deg, #0f0f13 0%, #1a1a2e 100%)'
const FOOTER_TEXT = 'fiorapool.gg'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const layoutParam = (url.searchParams.get('layout') ?? 'hero').toLowerCase()
  if (!(VALID_LAYOUTS as readonly string[]).includes(layoutParam)) {
    return new Response('Invalid layout', { status: 400 })
  }
  const layout = layoutParam as Layout

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const [{ data: profile }, { data: matches }, { data: progress }] = await Promise.all([
    supabase.from('summoner_profiles').select('riot_id').eq('user_id', user.id).single(),
    supabase.from('matches').select('win,kills,deaths,assists,cs,game_duration_seconds,champion_name,queue_type,captured_at').eq('user_id', user.id).order('captured_at', { ascending: false }).limit(50),
    supabase.from('app_progress').select('level,xp').eq('user_id', user.id).single(),
  ])

  const ms = (matches ?? []) as MatchSlim[]
  const identity = profile?.riot_id ?? user.email ?? 'Unknown'

  const node = layout === 'hero'
    ? heroLayout(identity, ms, progress as Progress)
    : layout === 'scoreboard'
      ? scoreboardLayout(identity, ms, progress as Progress)
      : timelineLayout(identity, ms, progress as Progress)

  return new ImageResponse(node, { width: 800, height: 400 })
}

// --- Layout: Hero (overview stats + recent form) ---
function heroLayout(identity: string, matches: MatchSlim[], progress: Progress) {
  const stats = computeStats(matches.map(m => ({
    win: m.win, kills: m.kills, deaths: m.deaths, assists: m.assists,
    cs: m.cs, game_duration_seconds: m.game_duration_seconds,
    champion_name: m.champion_name, queue_type: m.queue_type,
  })))
  const recentForm = matches.slice(0, 10).map(m => m.win)

  const champMap = new Map<string, { wins: number; games: number }>()
  for (const m of matches) {
    const name = m.champion_name ?? ''
    const c = champMap.get(name) ?? { wins: 0, games: 0 }
    c.games++; if (m.win) c.wins++
    champMap.set(name, c)
  }
  const topChamp = [...champMap.entries()].sort((a, b) => b[1].games - a[1].games)[0]

  return (
    <div style={{ width: '800px', height: '400px', background: BG, display: 'flex', flexDirection: 'column', padding: '40px', fontFamily: 'sans-serif', color: '#ffffff', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '13px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>FioraPool</div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{identity}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>LEVEL</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#a78bfa' }}>{progress?.level ?? 1}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '28px' }}>
        {[
          { label: 'WIN RATE', value: `${stats.winRate}%`, color: stats.winRate >= 50 ? '#4ade80' : '#f87171' },
          { label: 'AVG KDA', value: `${stats.avgKda}`, color: '#ffffff' },
          { label: 'CS/MIN', value: `${stats.avgCsMin}`, color: '#ffffff' },
          { label: 'GAMES', value: `${stats.total}`, color: '#ffffff' },
          ...(topChamp ? [{ label: 'TOP CHAMP', value: topChamp[0], color: '#fbbf24' }] : []),
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px' }}>{label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px' }}>RECENT FORM</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {recentForm.map((win, i) => (
            <div key={i} style={{
              width: '32px', height: '32px', borderRadius: '6px',
              background: win ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
              border: `1px solid ${win ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: win ? '#4ade80' : '#f87171',
            }}>{win ? 'W' : 'L'}</div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', right: '40px', fontSize: '11px', color: '#374151' }}>{FOOTER_TEXT}</div>
    </div>
  )
}

// --- Layout: Scoreboard (last 5 matches table) ---
function scoreboardLayout(identity: string, matches: MatchSlim[], progress: Progress) {
  const recent = matches.slice(0, 5)

  return (
    <div style={{ width: '800px', height: '400px', background: BG, display: 'flex', flexDirection: 'column', padding: '40px', fontFamily: 'sans-serif', color: '#ffffff', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '13px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>FioraPool · Recent Matches</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{identity}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>LEVEL</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#a78bfa' }}>{progress?.level ?? 1}</div>
        </div>
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', fontSize: '10px', color: '#6b7280', letterSpacing: '1px', borderBottom: '1px solid #2a2a3a' }}>
        <div style={{ flex: 2 }}>CHAMPION</div>
        <div style={{ flex: 1, textAlign: 'right' }}>K / D / A</div>
        <div style={{ flex: 1, textAlign: 'right' }}>CS</div>
        <div style={{ flex: 1, textAlign: 'right' }}>TIME</div>
        <div style={{ flex: 1, textAlign: 'right' }}>RESULT</div>
      </div>

      {/* Match rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {recent.length === 0
          ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>No recent matches</div>
          )
          : recent.map((m, i) => {
            const mins = Math.floor(m.game_duration_seconds / 60)
            const secs = (m.game_duration_seconds % 60).toString().padStart(2, '0')
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', padding: '12px',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                fontSize: '14px',
              }}>
                <div style={{ flex: 2, fontWeight: 600 }}>{m.champion_name ?? 'Unknown'}</div>
                <div style={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>{m.kills}/{m.deaths}/{m.assists}</div>
                <div style={{ flex: 1, textAlign: 'right', color: '#9ca3af' }}>{m.cs}</div>
                <div style={{ flex: 1, textAlign: 'right', color: '#9ca3af', fontSize: '12px' }}>{mins}:{secs}</div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px',
                    background: m.win ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                    color: m.win ? '#4ade80' : '#f87171',
                  }}>{m.win ? 'WIN' : 'LOSS'}</div>
                </div>
              </div>
            )
          })}
      </div>

      <div style={{ position: 'absolute', bottom: '20px', right: '40px', fontSize: '11px', color: '#374151' }}>{FOOTER_TEXT}</div>
    </div>
  )
}

// --- Layout: Timeline (last 14 days W/L blocks) ---
function timelineLayout(identity: string, matches: MatchSlim[], progress: Progress) {
  // Group last 14 days
  const now = new Date()
  const days: { date: string; wins: number; losses: number; total: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, wins: 0, losses: 0, total: 0 })
  }
  const dayMap = new Map(days.map(d => [d.date, d]))
  for (const m of matches) {
    const key = m.captured_at.slice(0, 10)
    const day = dayMap.get(key)
    if (!day) continue
    day.total++
    if (m.win) day.wins++; else day.losses++
  }

  const totalGames = matches.length
  const totalWins = matches.filter(m => m.win).length
  const wr = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0
  const maxDayTotal = Math.max(...days.map(d => d.total), 1)

  return (
    <div style={{ width: '800px', height: '400px', background: BG, display: 'flex', flexDirection: 'column', padding: '40px', fontFamily: 'sans-serif', color: '#ffffff', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '13px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>FioraPool · Last 14 Days</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{identity}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>LEVEL</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#a78bfa' }}>{progress?.level ?? 1}</div>
        </div>
      </div>

      {/* Stats summary row */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px' }}>GAMES</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalGames}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px' }}>WIN RATE</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: wr >= 50 ? '#4ade80' : '#f87171' }}>{wr}%</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px' }}>WINS · LOSSES</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalWins}W · {totalGames - totalWins}L</div>
        </div>
      </div>

      {/* Daily blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px' }}>DAILY ACTIVITY (W = green, L = red)</div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '100px' }}>
          {days.map((d, i) => {
            const heightPct = d.total === 0 ? 8 : Math.max(8, Math.round((d.total / maxDayTotal) * 100))
            const winShare = d.total === 0 ? 0 : d.wins / d.total
            const day = new Date(d.date).getDate()
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '100%', height: `${heightPct}px`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderRadius: '3px', overflow: 'hidden' }}>
                  {d.total > 0 ? (
                    <>
                      <div style={{ flex: winShare, background: '#4ade80' }} />
                      <div style={{ flex: 1 - winShare, background: '#f87171' }} />
                    </>
                  ) : (
                    <div style={{ flex: 1, background: '#1f2937' }} />
                  )}
                </div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>{day}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', right: '40px', fontSize: '11px', color: '#374151' }}>{FOOTER_TEXT}</div>
    </div>
  )
}
