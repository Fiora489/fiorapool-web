export interface MatchRow {
  win: boolean
  kills: number | null
  deaths: number | null
  assists: number | null
  cs: number | null
  game_duration_seconds: number | null
  damage_dealt: number | null
  vision_score: number | null
  wards_placed: number | null
  wards_killed: number | null
  role: string | null
  champion_name: string | null
  queue_type: string | null
  captured_at: string
}

// ─── Momentum Tracker ───────────────────────────────────────────────────────
// Rolling 5-game win rate over time (newest first → oldest last for display)
export function computeMomentum(matches: MatchRow[]) {
  if (matches.length < 2) return []
  const ordered = [...matches].reverse() // oldest first
  return ordered.map((_, i) => {
    const window = ordered.slice(Math.max(0, i - 4), i + 1)
    const wins = window.filter(m => m.win).length
    return {
      game: i + 1,
      winRate: Math.round((wins / window.length) * 100),
      win: ordered[i].win,
    }
  })
}

// ─── Resource Efficiency Index ───────────────────────────────────────────────
export function computeResourceEfficiency(matches: MatchRow[]) {
  const valid = matches.filter(m => m.game_duration_seconds && m.game_duration_seconds > 0)
  if (!valid.length) return null

  const avgCsMin = valid.reduce((s, m) => {
    const mins = m.game_duration_seconds! / 60
    return s + (m.cs ?? 0) / mins
  }, 0) / valid.length

  const avgDmgMin = valid.reduce((s, m) => {
    const mins = m.game_duration_seconds! / 60
    return s + (m.damage_dealt ?? 0) / mins
  }, 0) / valid.length

  const avgVisionMin = valid.reduce((s, m) => {
    const mins = m.game_duration_seconds! / 60
    return s + (m.vision_score ?? 0) / mins
  }, 0) / valid.length

  // Benchmark values (typical for Plat-Diamond)
  const CS_BENCH = 7.0
  const DMG_BENCH = 800
  const VISION_BENCH = 0.8

  const csScore   = Math.min(100, Math.round((avgCsMin / CS_BENCH) * 100))
  const dmgScore  = Math.min(100, Math.round((avgDmgMin / DMG_BENCH) * 100))
  const visScore  = Math.min(100, Math.round((avgVisionMin / VISION_BENCH) * 100))
  const overall   = Math.round((csScore + dmgScore + visScore) / 3)

  return {
    overall,
    csScore,   avgCsMin:    +avgCsMin.toFixed(1),
    dmgScore,  avgDmgMin:   +avgDmgMin.toFixed(0),
    visScore,  avgVisionMin: +avgVisionMin.toFixed(2),
  }
}

// ─── Role Passport ───────────────────────────────────────────────────────────
export function computeRolePassport(matches: MatchRow[]) {
  const roleMap = new Map<string, { wins: number; games: number; kills: number; deaths: number; assists: number; champMap: Map<string, number> }>()

  for (const m of matches) {
    const role = m.role || 'UNKNOWN'
    const r = roleMap.get(role) ?? { wins: 0, games: 0, kills: 0, deaths: 0, assists: 0, champMap: new Map() }
    r.games++
    if (m.win) r.wins++
    r.kills   += m.kills ?? 0
    r.deaths  += m.deaths ?? 0
    r.assists += m.assists ?? 0
    if (m.champion_name) r.champMap.set(m.champion_name, (r.champMap.get(m.champion_name) ?? 0) + 1)
    roleMap.set(role, r)
  }

  return [...roleMap.entries()]
    .sort((a, b) => b[1].games - a[1].games)
    .map(([role, r]) => ({
      role,
      games: r.games,
      winRate: Math.round((r.wins / r.games) * 100),
      avgKda: +((r.kills + r.assists) / Math.max(r.deaths, 1)).toFixed(2),
      topChamp: [...r.champMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-',
    }))
}

// ─── Late-Game Scaling ───────────────────────────────────────────────────────
export function computeLateGameScaling(matches: MatchRow[]) {
  const buckets = [
    { label: 'Early (<25m)',  min: 0,    max: 1500 },
    { label: 'Mid (25-35m)', min: 1500, max: 2100 },
    { label: 'Late (>35m)',  min: 2100, max: Infinity },
  ]

  return buckets.map(({ label, min, max }) => {
    const bucket = matches.filter(m => {
      const d = m.game_duration_seconds ?? 0
      return d >= min && d < max
    })
    const wins = bucket.filter(m => m.win).length
    return {
      label,
      games: bucket.length,
      winRate: bucket.length ? Math.round((wins / bucket.length) * 100) : null,
    }
  })
}

// ─── Carry Ratio ─────────────────────────────────────────────────────────────
// High ratio = carry playstyle (kills >> assists); low = utility/support
export function computeCarryRatio(matches: MatchRow[]) {
  const valid = matches.filter(m => (m.kills ?? 0) + (m.assists ?? 0) > 0)
  if (!valid.length) return null

  const avg = valid.reduce((s, m) => {
    const k = m.kills ?? 0
    const a = m.assists ?? 0
    return s + k / (k + a)
  }, 0) / valid.length

  const pct = Math.round(avg * 100)
  const label = pct >= 60 ? 'Carry' : pct >= 40 ? 'Balanced' : 'Support/Utility'
  return { pct, label }
}

// ─── Map Awareness Score ──────────────────────────────────────────────────────
export function computeMapAwareness(matches: MatchRow[]) {
  const valid = matches.filter(m => m.game_duration_seconds && m.game_duration_seconds > 0)
  if (!valid.length) return null

  const avgWardsMin = valid.reduce((s, m) => {
    const mins = m.game_duration_seconds! / 60
    return s + ((m.wards_placed ?? 0) + (m.wards_killed ?? 0)) / mins
  }, 0) / valid.length

  const avgVisionMin = valid.reduce((s, m) => {
    const mins = m.game_duration_seconds! / 60
    return s + (m.vision_score ?? 0) / mins
  }, 0) / valid.length

  // Score out of 100 (benchmarks: 1.5 wards/min, 0.8 vision/min)
  const wardScore   = Math.min(100, Math.round((avgWardsMin / 1.5) * 100))
  const visionScore = Math.min(100, Math.round((avgVisionMin / 0.8) * 100))
  const overall     = Math.round((wardScore + visionScore) / 2)

  return { overall, wardScore, avgWardsMin: +avgWardsMin.toFixed(2), visionScore, avgVisionMin: +avgVisionMin.toFixed(2) }
}
