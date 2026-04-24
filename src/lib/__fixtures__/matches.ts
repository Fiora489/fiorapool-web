import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

/** Minimal, overridable match fixture — all fields pre-filled so you can cherry-pick overrides. */
export function makeMatch(overrides: Partial<MatchRow> = {}): MatchRow {
  return {
    id: 'm-1',
    user_id: 'u-1',
    game_id: 1234,
    champion_id: 114,
    champion_name: 'Fiora',
    enemy_champion_id: 10,
    enemy_champion_name: 'Kayle',
    win: true,
    kills: 5,
    deaths: 3,
    assists: 7,
    cs: 180,
    damage_dealt: 18000,
    vision_score: 24,
    wards_placed: 10,
    wards_killed: 3,
    game_duration_seconds: 25 * 60,
    gold_diff_at_10: 200,
    cs_diff_at_10: 2,
    cs_diff_at_20: 5,
    queue_type: 'RANKED_SOLO_5x5',
    role: 'TOP',
    captured_at: '2026-04-20T10:00:00.000Z',
    items_json: null,
    spell_casts_json: null,
    ward_events_json: null,
    ...overrides,
  }
}

/** N matches spanning date range, alternating win/loss if not overridden. */
export function makeMatchSeries(n: number, base: Partial<MatchRow> = {}): MatchRow[] {
  const out: MatchRow[] = []
  const start = new Date('2026-01-01T12:00:00.000Z').getTime()
  for (let i = 0; i < n; i++) {
    const captured = new Date(start + i * 86400000).toISOString()  // +1 day per match
    out.push(makeMatch({
      id: `m-${i}`,
      game_id: 1000 + i,
      win: i % 2 === 0,
      captured_at: captured,
      ...base,
    }))
  }
  return out
}
