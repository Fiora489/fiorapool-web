import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { computeStats, checkEarnedBadges, BADGE_DEFS, type BadgeDef } from '@/lib/xp'

export const runtime = 'edge'

const VALID_LAYOUTS = ['grid', 'highlight', 'chains'] as const
type Layout = (typeof VALID_LAYOUTS)[number]

type EnrichedBadge = BadgeDef & {
  earned: boolean
  earnedAt: string | null
}

type Progress = { level: number; xp: number } | null

const BG = 'linear-gradient(135deg, #0f0f13 0%, #1a1a2e 100%)'
const FOOTER_TEXT = 'fiorapool.gg'

const CHAIN_LABEL: Record<string, string> = {
  victory:    'Victory Road',
  streak:     'Streak Master',
  kda:        'Mechanical',
  cs:         'Farmer',
  kills:      'Carry',
  xp:         'XP Climb',
  aram:       'ARAM Hero',
  veteran:    'Veteran',
  consistent: 'Consistency',
  pool:       'Champion Pool',
}
const CHAIN_ORDER = ['victory', 'streak', 'kda', 'cs', 'kills', 'xp', 'aram', 'veteran', 'consistent', 'pool']

export async function GET(request: Request) {
  const url = new URL(request.url)
  const layoutParam = (url.searchParams.get('layout') ?? 'grid').toLowerCase()
  if (!(VALID_LAYOUTS as readonly string[]).includes(layoutParam)) {
    return new Response('Invalid layout', { status: 400 })
  }
  const layout = layoutParam as Layout

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const [{ data: profile }, { data: matches }, { data: progress }, { data: earnedRows }] = await Promise.all([
    supabase.from('summoner_profiles').select('riot_id').eq('user_id', user.id).single(),
    supabase.from('matches').select('win,kills,deaths,assists,cs,game_duration_seconds,champion_name,queue_type').eq('user_id', user.id).order('captured_at', { ascending: false }),
    supabase.from('app_progress').select('level,xp').eq('user_id', user.id).single(),
    supabase.from('user_badges').select('badge_id,earned_at').eq('user_id', user.id),
  ])

  const stats = computeStats(matches ?? [])
  const earnableIds = new Set(checkEarnedBadges(stats))
  const earnedMap = new Map((earnedRows ?? []).map(r => [r.badge_id, r.earned_at]))

  const badges: EnrichedBadge[] = BADGE_DEFS.map(b => ({
    ...b,
    earned: earnedMap.has(b.id) || earnableIds.has(b.id),
    earnedAt: earnedMap.get(b.id) ?? null,
  }))

  const identity = profile?.riot_id ?? user.email ?? 'Unknown'
  const earnedCount = badges.filter(b => b.earned).length

  const node = layout === 'grid'
    ? gridLayout(identity, badges, progress as Progress, earnedCount)
    : layout === 'highlight'
      ? highlightLayout(identity, badges, progress as Progress, earnedCount)
      : chainsLayout(identity, badges, progress as Progress, earnedCount)

  return new ImageResponse(node, { width: 800, height: 400 })
}

// --- Shared header ---
function header(identity: string, progress: Progress, subtitle: string) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>FioraPool · {subtitle}</div>
        <div style={{ fontSize: '24px', fontWeight: 700 }}>{identity}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '11px', color: '#6b7280' }}>LEVEL</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#a78bfa' }}>{progress?.level ?? 1}</div>
      </div>
    </div>
  )
}

// --- Layout: Grid (12 earned badges, 4×3) ---
function gridLayout(identity: string, badges: EnrichedBadge[], progress: Progress, earnedCount: number) {
  const earnedBadges = badges.filter(b => b.earned).slice(0, 12)

  return (
    <div style={{ width: '800px', height: '400px', background: BG, display: 'flex', flexDirection: 'column', padding: '32px 40px', fontFamily: 'sans-serif', color: '#ffffff', position: 'relative' }}>
      {header(identity, progress, `${earnedCount} Badges Earned`)}

      {earnedBadges.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '14px' }}>
          No badges earned yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {earnedBadges.map(b => (
            <div key={b.id} style={{
              width: '170px', display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '12px 8px', borderRadius: '8px', background: 'rgba(167,139,250,0.08)',
              border: '1px solid rgba(167,139,250,0.25)',
            }}>
              <div style={{ fontSize: '32px', lineHeight: 1 }}>{b.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '6px', textAlign: 'center' }}>{b.name}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'absolute', bottom: '16px', right: '40px', fontSize: '11px', color: '#374151' }}>{FOOTER_TEXT}</div>
    </div>
  )
}

// --- Layout: Highlight (1 featured + 4 small) ---
function highlightLayout(identity: string, badges: EnrichedBadge[], progress: Progress, earnedCount: number) {
  const earnedBadges = badges.filter(b => b.earned)
  const featured = earnedBadges.slice().sort((a, b) => {
    // Most recent earned (with earnedAt) first; fall back to highest tier
    if (a.earnedAt && b.earnedAt) return b.earnedAt.localeCompare(a.earnedAt)
    if (a.earnedAt) return -1
    if (b.earnedAt) return 1
    return b.tier - a.tier
  })[0]
  const others = earnedBadges.filter(b => b.id !== featured?.id).slice(0, 4)

  return (
    <div style={{ width: '800px', height: '400px', background: BG, display: 'flex', flexDirection: 'column', padding: '32px 40px', fontFamily: 'sans-serif', color: '#ffffff', position: 'relative' }}>
      {header(identity, progress, `${earnedCount} Badges Earned`)}

      {!featured ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '14px' }}>
          No badges earned yet.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flex: 1 }}>
          {/* Featured */}
          <div style={{
            width: '320px', height: '240px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '10px',
            borderRadius: '12px', background: 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(251,191,36,0.10) 100%)',
            border: '2px solid rgba(167,139,250,0.4)',
          }}>
            <div style={{ fontSize: '11px', color: '#a78bfa', letterSpacing: '2px', textTransform: 'uppercase' }}>Featured</div>
            <div style={{ fontSize: '72px', lineHeight: 1 }}>{featured.icon}</div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{featured.name}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', maxWidth: '260px' }}>{featured.desc}</div>
          </div>

          {/* Others */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px' }}>OTHER EARNED</div>
            {others.length === 0
              ? <div style={{ color: '#6b7280', fontSize: '12px' }}>No others yet</div>
              : others.map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '6px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)' }}>
                  <div style={{ fontSize: '24px', lineHeight: 1 }}>{b.icon}</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{b.name}</div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>{b.desc}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: '16px', right: '40px', fontSize: '11px', color: '#374151' }}>{FOOTER_TEXT}</div>
    </div>
  )
}

// --- Layout: Chains (10 chain progress bars) ---
function chainsLayout(identity: string, badges: EnrichedBadge[], progress: Progress, earnedCount: number) {
  const chainStats = CHAIN_ORDER.map(chainId => {
    const chainBadges = badges.filter(b => b.chainId === chainId)
    const earned = chainBadges.filter(b => b.earned).length
    const total  = chainBadges.length
    return { chainId, label: CHAIN_LABEL[chainId] ?? chainId, earned, total }
  })

  return (
    <div style={{ width: '800px', height: '400px', background: BG, display: 'flex', flexDirection: 'column', padding: '32px 40px', fontFamily: 'sans-serif', color: '#ffffff', position: 'relative' }}>
      {header(identity, progress, `${earnedCount} Badges · 10 Chains`)}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {chainStats.map(c => {
          const pct = c.total > 0 ? Math.round((c.earned / c.total) * 100) : 0
          const complete = c.earned === c.total && c.total > 0
          return (
            <div key={c.chainId} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '120px', fontSize: '12px', fontWeight: 600 }}>{c.label}</div>
              <div style={{ flex: 1, height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: complete ? '#fbbf24' : '#a78bfa',
                }} />
              </div>
              <div style={{ width: '60px', fontSize: '11px', color: '#9ca3af', textAlign: 'right', fontFamily: 'monospace' }}>
                {c.earned}/{c.total}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ position: 'absolute', bottom: '16px', right: '40px', fontSize: '11px', color: '#374151' }}>{FOOTER_TEXT}</div>
    </div>
  )
}
