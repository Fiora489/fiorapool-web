import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { computeStats } from '@/lib/xp'

export const runtime = 'edge'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const [{ data: profile }, { data: matches }, { data: progress }] = await Promise.all([
    supabase.from('summoner_profiles').select('riot_id').eq('user_id', user.id).single(),
    supabase.from('matches').select('win,kills,deaths,assists,cs,game_duration_seconds,champion_name,queue_type').eq('user_id', user.id).order('captured_at', { ascending: false }).limit(20),
    supabase.from('app_progress').select('level,xp').eq('user_id', user.id).single(),
  ])

  const stats = computeStats(matches ?? [])
  const recentForm = (matches ?? []).slice(0, 10).map(m => m.win)

  // Top champion
  const champMap = new Map<string, { wins: number; games: number }>()
  for (const m of matches ?? []) {
    const c = champMap.get(m.champion_name ?? '') ?? { wins: 0, games: 0 }
    c.games++; if (m.win) c.wins++
    champMap.set(m.champion_name ?? '', c)
  }
  const topChamp = [...champMap.entries()].sort((a, b) => b[1].games - a[1].games)[0]

  return new ImageResponse(
    (
      <div
        style={{
          width: '800px', height: '400px',
          background: 'linear-gradient(135deg, #0f0f13 0%, #1a1a2e 100%)',
          display: 'flex', flexDirection: 'column', padding: '40px',
          fontFamily: 'sans-serif', color: '#ffffff', position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>FioraPool</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{profile?.riot_id ?? user.email}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>LEVEL</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#a78bfa' }}>{progress?.level ?? 1}</div>
          </div>
        </div>

        {/* Stats row */}
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

        {/* Recent form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px' }}>RECENT FORM</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {recentForm.map((win, i) => (
              <div
                key={i}
                style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  background: win ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                  border: `1px solid ${win ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700,
                  color: win ? '#4ade80' : '#f87171',
                }}
              >
                {win ? 'W' : 'L'}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '20px', right: '40px', fontSize: '11px', color: '#374151' }}>
          fiorapool.gg
        </div>
      </div>
    ),
    { width: 800, height: 400 }
  )
}
