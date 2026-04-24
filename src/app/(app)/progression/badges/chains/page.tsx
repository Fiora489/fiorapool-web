import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeStats, checkEarnedBadges, BADGE_DEFS } from '@/lib/xp'
import { ChainsOverview } from '@/components/progression/badges/chains/ChainsOverview'
import { ChainCard, type ChainTier } from '@/components/progression/badges/chains/ChainCard'

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

export default async function BadgeChainsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: matches }, { data: earnedRows }] = await Promise.all([
    supabase.from('matches')
      .select('win,kills,deaths,assists,cs,game_duration_seconds,champion_name,queue_type')
      .eq('user_id', user!.id)
      .order('captured_at', { ascending: false }),
    supabase.from('user_badges')
      .select('badge_id,earned_at')
      .eq('user_id', user!.id),
  ])

  const stats = computeStats(matches ?? [])
  const earnableIds = new Set(checkEarnedBadges(stats))
  const earnedMap = new Map((earnedRows ?? []).map(r => [r.badge_id, r.earned_at]))

  // Group by chain
  type ChainGroup = { chainId: string; tiers: ChainTier[] }
  const chainsMap = new Map<string, ChainTier[]>()
  for (const def of BADGE_DEFS) {
    const earned = earnedMap.has(def.id) || earnableIds.has(def.id)
    const tier: ChainTier = {
      id: def.id,
      tier: def.tier,
      name: def.name,
      desc: def.desc,
      icon: def.icon,
      earned,
      earnedAt: earnedMap.get(def.id) ?? null,
    }
    const arr = chainsMap.get(def.chainId) ?? []
    arr.push(tier)
    chainsMap.set(def.chainId, arr)
  }
  // Sort tiers ascending within each chain
  for (const arr of chainsMap.values()) arr.sort((a, b) => a.tier - b.tier)

  const chains: ChainGroup[] = CHAIN_ORDER.map(chainId => ({
    chainId,
    tiers: chainsMap.get(chainId) ?? [],
  })).filter(c => c.tiers.length > 0)

  // Aggregate stats
  const totalChains = chains.length
  const chainsComplete = chains.filter(c => c.tiers.every(t => t.earned)).length
  const totalBadges = chains.reduce((s, c) => s + c.tiers.length, 0)
  const badgesEarned = chains.reduce((s, c) => s + c.tiers.filter(t => t.earned).length, 0)

  // Next-up: lowest-tier unearned across all chains
  const nextUpTier = chains
    .flatMap(c => c.tiers.filter(t => !t.earned).map(t => ({ ...t, chainId: c.chainId })))
    .sort((a, b) => a.tier - b.tier)[0]
  const nextUp = nextUpTier
    ? { name: nextUpTier.name, desc: nextUpTier.desc, chainLabel: CHAIN_LABEL[nextUpTier.chainId] ?? nextUpTier.chainId }
    : null

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">Badge Chains</h1>
          <p className="text-sm text-muted-foreground">
            Themed progressions across {totalChains} chains. Each tier unlocks at a higher milestone.
          </p>
        </div>

        <ChainsOverview
          chainsComplete={chainsComplete}
          totalChains={totalChains}
          badgesEarned={badgesEarned}
          totalBadges={totalBadges}
          nextUp={nextUp}
        />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {chains.map(c => (
            <ChainCard
              key={c.chainId}
              chainLabel={CHAIN_LABEL[c.chainId] ?? c.chainId}
              tiers={c.tiers}
            />
          ))}
        </section>
      </div>
    </main>
  )
}
