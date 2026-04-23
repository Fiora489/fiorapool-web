import { createClient } from '@/lib/supabase/server'
import {
  computeResourceEfficiency, computeRolePassport,
  computeLateGameScaling, computeCarryRatio, computeMapAwareness,
  type MatchRow,
} from '@/lib/coaching'

export default async function CoachingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: matches } = await supabase
    .from('matches')
    .select('win,kills,deaths,assists,cs,game_duration_seconds,damage_dealt,vision_score,wards_placed,wards_killed,role,champion_name,queue_type,captured_at')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: false })

  const m = (matches ?? []) as MatchRow[]

  if (!m.length) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Coaching</h1>
          <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
            No match data — sync matches first.
          </div>
        </div>
      </main>
    )
  }

  const rei    = computeResourceEfficiency(m)
  const roles  = computeRolePassport(m)
  const scaling = computeLateGameScaling(m)
  const carry  = computeCarryRatio(m)
  const map    = computeMapAwareness(m)

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Coaching</h1>

        {/* Resource Efficiency Index */}
        {rei && (
          <Section title="Resource Efficiency Index">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Overall Score</span>
                <span className={`text-xl font-bold ${rei.overall >= 70 ? 'text-green-400' : rei.overall >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{rei.overall}/100</span>
              </div>
              {[
                { label: 'CS/min',        score: rei.csScore,  value: `${rei.avgCsMin}` },
                { label: 'Damage/min',    score: rei.dmgScore, value: `${rei.avgDmgMin}` },
                { label: 'Vision/min',    score: rei.visScore, value: `${rei.avgVisionMin}` },
              ].map(({ label, score, value }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{label}</span><span>{value} · {score}/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Role Passport */}
        {roles.length > 0 && (
          <Section title="Role Passport">
            <div className="space-y-2">
              {roles.map(r => (
                <div key={r.role} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <span className="text-sm font-medium">{formatRole(r.role)}</span>
                    <span className="text-xs text-muted-foreground ml-2">{r.topChamp}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">{r.games}g</span>
                    <span className="text-muted-foreground">{r.avgKda} KDA</span>
                    <span className={r.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>{r.winRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Late-Game Scaling */}
          <Section title="Late-Game Scaling">
            <div className="space-y-3">
              {scaling.map(s => (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span>{s.games}g · {s.winRate !== null ? <span className={s.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>{s.winRate}%</span> : <span className="text-muted-foreground">—</span>}</span>
                  </div>
                  {s.winRate !== null && (
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${s.winRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${s.winRate}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Map Awareness */}
          {map && (
            <Section title="Map Awareness">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Overall</span>
                  <span className={`text-xl font-bold ${map.overall >= 70 ? 'text-green-400' : map.overall >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{map.overall}/100</span>
                </div>
                {[
                  { label: 'Wards/min',  score: map.wardScore,   value: map.avgWardsMin },
                  { label: 'Vision/min', score: map.visionScore, value: map.avgVisionMin },
                ].map(({ label, score, value }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{label}</span><span>{value} · {score}/100</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Carry Ratio */}
        {carry && (
          <Section title="Playstyle — Carry Ratio">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Support / Utility</span><span>Pure Carry</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 relative">
                  <div className="bg-primary h-3 rounded-full" style={{ width: `${carry.pct}%` }} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{carry.pct}%</p>
                <p className="text-xs text-muted-foreground">{carry.label}</p>
              </div>
            </div>
          </Section>
        )}
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-5 space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </div>
  )
}

function formatRole(role: string) {
  const map: Record<string, string> = {
    TOP: 'Top', JUNGLE: 'Jungle', MIDDLE: 'Mid', BOTTOM: 'Bot', UTILITY: 'Support', UNKNOWN: 'Unknown',
  }
  return map[role] ?? role
}
