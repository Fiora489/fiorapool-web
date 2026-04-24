export const XP_PER_LEVEL = 500

export function xpForWin(streakLength: number): number {
  const base = 100
  const streakBonus = Math.min(streakLength, 10) * 15
  return base + streakBonus
}

export function xpForLoss(): number {
  return 30
}

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = xp % XP_PER_LEVEL
  return { level, xpIntoLevel, xpForNext: XP_PER_LEVEL }
}

export interface MatchStats {
  wins: number
  total: number
  winRate: number
  maxStreak: number
  currentStreak: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  avgKda: number
  avgCsMin: number
  totalXp: number
  aramWins: number
  uniqueChampions: number
  totalKills: number
}

export function computeStats(matches: Array<{
  win: boolean
  kills: number | null
  deaths: number | null
  assists: number | null
  cs: number | null
  game_duration_seconds: number | null
  queue_type?: string | null
  champion_name?: string | null
}>): MatchStats {
  if (!matches.length) {
    return { wins: 0, total: 0, winRate: 0, maxStreak: 0, currentStreak: 0, avgKills: 0, avgDeaths: 0, avgAssists: 0, avgKda: 0, avgCsMin: 0, totalXp: 0, aramWins: 0, uniqueChampions: 0, totalKills: 0 }
  }

  // matches are newest-first; iterate oldest-first for streak/XP
  const ordered = [...matches].reverse()

  let totalXp = 0
  let streak = 0
  let maxStreak = 0
  let currentStreak = 0

  for (let i = 0; i < ordered.length; i++) {
    const m = ordered[i]
    if (m.win) {
      streak++
      maxStreak = Math.max(maxStreak, streak)
      totalXp += xpForWin(streak)
    } else {
      streak = 0
      totalXp += xpForLoss()
    }
    if (i === ordered.length - 1) currentStreak = m.win ? streak : 0
  }

  const total = matches.length
  const wins = matches.filter(m => m.win).length
  const avgKills   = matches.reduce((s, m) => s + (m.kills ?? 0), 0) / total
  const avgDeaths  = matches.reduce((s, m) => s + (m.deaths ?? 0), 0) / total
  const avgAssists = matches.reduce((s, m) => s + (m.assists ?? 0), 0) / total
  const avgKda     = (avgKills + avgAssists) / Math.max(avgDeaths, 1)
  const avgCsMin   = matches.reduce((s, m) => {
    const mins = (m.game_duration_seconds ?? 0) / 60
    return s + (mins > 0 ? (m.cs ?? 0) / mins : 0)
  }, 0) / total

  const aramWins = matches.filter(m => m.win && m.queue_type === 'ARAM').length
  const uniqueChampions = new Set(matches.map(m => m.champion_name).filter((c): c is string => c !== null && c !== undefined)).size
  const totalKills = matches.reduce((s, m) => s + (m.kills ?? 0), 0)

  return {
    wins,
    total,
    winRate: Math.round((wins / total) * 100),
    maxStreak,
    currentStreak,
    avgKills: +avgKills.toFixed(1),
    avgDeaths: +avgDeaths.toFixed(1),
    avgAssists: +avgAssists.toFixed(1),
    avgKda: +avgKda.toFixed(2),
    avgCsMin: +avgCsMin.toFixed(1),
    totalXp,
    aramWins,
    uniqueChampions,
    totalKills,
  }
}

export interface BadgeDef {
  id: string
  name: string
  desc: string
  icon: string
  chainId: string
  tier: number
}

export const BADGE_DEFS: BadgeDef[] = [
  // Chain 1 — Victory Road
  { id: 'victory_1', name: 'First Blood',    desc: 'Win 1 game',    icon: '🥉', chainId: 'victory', tier: 1 },
  { id: 'victory_2', name: 'Bronze Victor',  desc: 'Win 5 games',   icon: '🥈', chainId: 'victory', tier: 2 },
  { id: 'victory_3', name: 'Silver Victor',  desc: 'Win 10 games',  icon: '🥇', chainId: 'victory', tier: 3 },
  { id: 'victory_4', name: 'Gold Victor',    desc: 'Win 25 games',  icon: '🏅', chainId: 'victory', tier: 4 },
  { id: 'victory_5', name: 'Champion',       desc: 'Win 50 games',  icon: '🏆', chainId: 'victory', tier: 5 },
  { id: 'victory_6', name: 'Legend',         desc: 'Win 100 games', icon: '👑', chainId: 'victory', tier: 6 },

  // Chain 2 — Battle Hardened
  { id: 'veteran_1', name: 'Rookie',     desc: 'Play 1 game',    icon: '⚔️',  chainId: 'veteran', tier: 1 },
  { id: 'veteran_2', name: 'Regular',    desc: 'Play 10 games',  icon: '🛡️',  chainId: 'veteran', tier: 2 },
  { id: 'veteran_3', name: 'Veteran',    desc: 'Play 25 games',  icon: '⚔️',  chainId: 'veteran', tier: 3 },
  { id: 'veteran_4', name: 'Dedicated',  desc: 'Play 50 games',  icon: '🛡️',  chainId: 'veteran', tier: 4 },
  { id: 'veteran_5', name: 'Committed',  desc: 'Play 100 games', icon: '💎',  chainId: 'veteran', tier: 5 },
  { id: 'veteran_6', name: 'Iron Will',  desc: 'Play 250 games', icon: '🔩',  chainId: 'veteran', tier: 6 },

  // Chain 3 — Win Streak
  { id: 'streak_1', name: 'Double Down',   desc: 'Win 2 in a row',  icon: '🔥', chainId: 'streak', tier: 1 },
  { id: 'streak_2', name: 'Hot Streak',    desc: 'Win 3 in a row',  icon: '🔥', chainId: 'streak', tier: 2 },
  { id: 'streak_3', name: 'On Fire',       desc: 'Win 5 in a row',  icon: '🔥', chainId: 'streak', tier: 3 },
  { id: 'streak_4', name: 'Unstoppable',   desc: 'Win 7 in a row',  icon: '⚡', chainId: 'streak', tier: 4 },
  { id: 'streak_5', name: 'Godlike',       desc: 'Win 10 in a row', icon: '💫', chainId: 'streak', tier: 5 },
  { id: 'streak_6', name: 'Beyond Legend', desc: 'Win 15 in a row', icon: '✨', chainId: 'streak', tier: 6 },

  // Chain 4 — Sharp Blade (min 10 games)
  { id: 'kda_1', name: 'Competent',   desc: 'Avg KDA ≥ 2.0 (min 10 games)',  icon: '🗡️', chainId: 'kda', tier: 1 },
  { id: 'kda_2', name: 'Skilled',     desc: 'Avg KDA ≥ 3.0 (min 10 games)',  icon: '🗡️', chainId: 'kda', tier: 2 },
  { id: 'kda_3', name: 'Precise',     desc: 'Avg KDA ≥ 4.0 (min 10 games)',  icon: '⚔️', chainId: 'kda', tier: 3 },
  { id: 'kda_4', name: 'Untouchable', desc: 'Avg KDA ≥ 5.0 (min 10 games)',  icon: '🌟', chainId: 'kda', tier: 4 },
  { id: 'kda_5', name: 'Sublime',     desc: 'Avg KDA ≥ 7.0 (min 10 games)',  icon: '💫', chainId: 'kda', tier: 5 },
  { id: 'kda_6', name: 'Perfect',     desc: 'Avg KDA ≥ 10.0 (min 10 games)', icon: '👑', chainId: 'kda', tier: 6 },

  // Chain 5 — CS Machine (min 10 games)
  { id: 'cs_1', name: 'Apprentice Farmer', desc: 'Avg 4+ CS/min (min 10 games)', icon: '💰', chainId: 'cs', tier: 1 },
  { id: 'cs_2', name: 'Steady Farmer',     desc: 'Avg 5+ CS/min (min 10 games)', icon: '💰', chainId: 'cs', tier: 2 },
  { id: 'cs_3', name: 'Expert Farmer',     desc: 'Avg 6+ CS/min (min 10 games)', icon: '💰', chainId: 'cs', tier: 3 },
  { id: 'cs_4', name: 'Master Farmer',     desc: 'Avg 7+ CS/min (min 10 games)', icon: '💎', chainId: 'cs', tier: 4 },
  { id: 'cs_5', name: 'Elite Farmer',      desc: 'Avg 8+ CS/min (min 10 games)', icon: '💎', chainId: 'cs', tier: 5 },
  { id: 'cs_6', name: 'Perfect Wave',      desc: 'Avg 9+ CS/min (min 10 games)', icon: '✨', chainId: 'cs', tier: 6 },

  // Chain 6 — XP Grind
  { id: 'xp_1', name: 'Getting Started', desc: 'Earn 200 XP',    icon: '⭐', chainId: 'xp', tier: 1 },
  { id: 'xp_2', name: 'Finding Rhythm',  desc: 'Earn 500 XP',    icon: '⭐', chainId: 'xp', tier: 2 },
  { id: 'xp_3', name: 'In The Zone',     desc: 'Earn 1,000 XP',  icon: '🌟', chainId: 'xp', tier: 3 },
  { id: 'xp_4', name: 'Committed',       desc: 'Earn 2,500 XP',  icon: '🌟', chainId: 'xp', tier: 4 },
  { id: 'xp_5', name: 'Dedicated',       desc: 'Earn 5,000 XP',  icon: '💫', chainId: 'xp', tier: 5 },
  { id: 'xp_6', name: 'Immortal',        desc: 'Earn 10,000 XP', icon: '👑', chainId: 'xp', tier: 6 },

  // Chain 7 — Consistency (min 20 games)
  { id: 'consistent_1', name: 'Even Odds',   desc: '50%+ win rate (min 20 games)', icon: '⚖️', chainId: 'consistent', tier: 1 },
  { id: 'consistent_2', name: 'Favorable',   desc: '55%+ win rate (min 20 games)', icon: '⚖️', chainId: 'consistent', tier: 2 },
  { id: 'consistent_3', name: 'Dominant',    desc: '60%+ win rate (min 20 games)', icon: '🔥', chainId: 'consistent', tier: 3 },
  { id: 'consistent_4', name: 'Superior',    desc: '65%+ win rate (min 20 games)', icon: '⚡', chainId: 'consistent', tier: 4 },
  { id: 'consistent_5', name: 'Overpowered', desc: '70%+ win rate (min 20 games)', icon: '💫', chainId: 'consistent', tier: 5 },
  { id: 'consistent_6', name: 'Unreal',      desc: '75%+ win rate (min 20 games)', icon: '👑', chainId: 'consistent', tier: 6 },

  // Chain 8 — ARAM Specialist
  { id: 'aram_1', name: 'Bridge Troll',    desc: 'Win 1 ARAM',    icon: '🌉', chainId: 'aram', tier: 1 },
  { id: 'aram_2', name: 'Poke Specialist', desc: 'Win 5 ARAMs',   icon: '🎯', chainId: 'aram', tier: 2 },
  { id: 'aram_3', name: 'ARAM Veteran',    desc: 'Win 10 ARAMs',  icon: '⚔️', chainId: 'aram', tier: 3 },
  { id: 'aram_4', name: 'ARAM Expert',     desc: 'Win 25 ARAMs',  icon: '🛡️', chainId: 'aram', tier: 4 },
  { id: 'aram_5', name: 'ARAM Master',     desc: 'Win 50 ARAMs',  icon: '🏆', chainId: 'aram', tier: 5 },
  { id: 'aram_6', name: 'ARAM Overlord',   desc: 'Win 100 ARAMs', icon: '👑', chainId: 'aram', tier: 6 },

  // Chain 9 — Champion Pool
  { id: 'pool_1', name: 'One Trick',   desc: 'Play 1 champion',   icon: '🎭', chainId: 'pool', tier: 1 },
  { id: 'pool_2', name: 'Flexible',    desc: 'Play 3 champions',  icon: '🎭', chainId: 'pool', tier: 2 },
  { id: 'pool_3', name: 'Versatile',   desc: 'Play 5 champions',  icon: '🎪', chainId: 'pool', tier: 3 },
  { id: 'pool_4', name: 'Diverse',     desc: 'Play 10 champions', icon: '🎪', chainId: 'pool', tier: 4 },
  { id: 'pool_5', name: 'Eclectic',    desc: 'Play 15 champions', icon: '🌈', chainId: 'pool', tier: 5 },
  { id: 'pool_6', name: 'Jack of All', desc: 'Play 25 champions', icon: '🌈', chainId: 'pool', tier: 6 },

  // Chain 10 — Unstoppable Force
  { id: 'kills_1', name: 'Drawing Blood', desc: 'Score 10 kills',    icon: '⚔️', chainId: 'kills', tier: 1 },
  { id: 'kills_2', name: 'Fighter',       desc: 'Score 50 kills',    icon: '⚔️', chainId: 'kills', tier: 2 },
  { id: 'kills_3', name: 'Warrior',       desc: 'Score 100 kills',   icon: '🗡️', chainId: 'kills', tier: 3 },
  { id: 'kills_4', name: 'Hunter',        desc: 'Score 250 kills',   icon: '🗡️', chainId: 'kills', tier: 4 },
  { id: 'kills_5', name: 'Assassin',      desc: 'Score 500 kills',   icon: '💀', chainId: 'kills', tier: 5 },
  { id: 'kills_6', name: 'Warlord',       desc: 'Score 1,000 kills', icon: '💀', chainId: 'kills', tier: 6 },
]

export function checkEarnedBadges(stats: MatchStats): string[] {
  const earned: string[] = []

  // Chain 1 — Victory Road
  if (stats.wins >= 1)   earned.push('victory_1')
  if (stats.wins >= 5)   earned.push('victory_2')
  if (stats.wins >= 10)  earned.push('victory_3')
  if (stats.wins >= 25)  earned.push('victory_4')
  if (stats.wins >= 50)  earned.push('victory_5')
  if (stats.wins >= 100) earned.push('victory_6')

  // Chain 2 — Battle Hardened
  if (stats.total >= 1)   earned.push('veteran_1')
  if (stats.total >= 10)  earned.push('veteran_2')
  if (stats.total >= 25)  earned.push('veteran_3')
  if (stats.total >= 50)  earned.push('veteran_4')
  if (stats.total >= 100) earned.push('veteran_5')
  if (stats.total >= 250) earned.push('veteran_6')

  // Chain 3 — Win Streak
  if (stats.maxStreak >= 2)  earned.push('streak_1')
  if (stats.maxStreak >= 3)  earned.push('streak_2')
  if (stats.maxStreak >= 5)  earned.push('streak_3')
  if (stats.maxStreak >= 7)  earned.push('streak_4')
  if (stats.maxStreak >= 10) earned.push('streak_5')
  if (stats.maxStreak >= 15) earned.push('streak_6')

  // Chain 4 — Sharp Blade (min 10 games)
  if (stats.total >= 10 && stats.avgKda >= 2.0)  earned.push('kda_1')
  if (stats.total >= 10 && stats.avgKda >= 3.0)  earned.push('kda_2')
  if (stats.total >= 10 && stats.avgKda >= 4.0)  earned.push('kda_3')
  if (stats.total >= 10 && stats.avgKda >= 5.0)  earned.push('kda_4')
  if (stats.total >= 10 && stats.avgKda >= 7.0)  earned.push('kda_5')
  if (stats.total >= 10 && stats.avgKda >= 10.0) earned.push('kda_6')

  // Chain 5 — CS Machine (min 10 games)
  if (stats.total >= 10 && stats.avgCsMin >= 4.0) earned.push('cs_1')
  if (stats.total >= 10 && stats.avgCsMin >= 5.0) earned.push('cs_2')
  if (stats.total >= 10 && stats.avgCsMin >= 6.0) earned.push('cs_3')
  if (stats.total >= 10 && stats.avgCsMin >= 7.0) earned.push('cs_4')
  if (stats.total >= 10 && stats.avgCsMin >= 8.0) earned.push('cs_5')
  if (stats.total >= 10 && stats.avgCsMin >= 9.0) earned.push('cs_6')

  // Chain 6 — XP Grind
  if (stats.totalXp >= 200)   earned.push('xp_1')
  if (stats.totalXp >= 500)   earned.push('xp_2')
  if (stats.totalXp >= 1000)  earned.push('xp_3')
  if (stats.totalXp >= 2500)  earned.push('xp_4')
  if (stats.totalXp >= 5000)  earned.push('xp_5')
  if (stats.totalXp >= 10000) earned.push('xp_6')

  // Chain 7 — Consistency (min 20 games)
  if (stats.total >= 20 && stats.winRate >= 50) earned.push('consistent_1')
  if (stats.total >= 20 && stats.winRate >= 55) earned.push('consistent_2')
  if (stats.total >= 20 && stats.winRate >= 60) earned.push('consistent_3')
  if (stats.total >= 20 && stats.winRate >= 65) earned.push('consistent_4')
  if (stats.total >= 20 && stats.winRate >= 70) earned.push('consistent_5')
  if (stats.total >= 20 && stats.winRate >= 75) earned.push('consistent_6')

  // Chain 8 — ARAM Specialist
  if (stats.aramWins >= 1)   earned.push('aram_1')
  if (stats.aramWins >= 5)   earned.push('aram_2')
  if (stats.aramWins >= 10)  earned.push('aram_3')
  if (stats.aramWins >= 25)  earned.push('aram_4')
  if (stats.aramWins >= 50)  earned.push('aram_5')
  if (stats.aramWins >= 100) earned.push('aram_6')

  // Chain 9 — Champion Pool
  if (stats.uniqueChampions >= 1)  earned.push('pool_1')
  if (stats.uniqueChampions >= 3)  earned.push('pool_2')
  if (stats.uniqueChampions >= 5)  earned.push('pool_3')
  if (stats.uniqueChampions >= 10) earned.push('pool_4')
  if (stats.uniqueChampions >= 15) earned.push('pool_5')
  if (stats.uniqueChampions >= 25) earned.push('pool_6')

  // Chain 10 — Unstoppable Force
  if (stats.totalKills >= 10)   earned.push('kills_1')
  if (stats.totalKills >= 50)   earned.push('kills_2')
  if (stats.totalKills >= 100)  earned.push('kills_3')
  if (stats.totalKills >= 250)  earned.push('kills_4')
  if (stats.totalKills >= 500)  earned.push('kills_5')
  if (stats.totalKills >= 1000) earned.push('kills_6')

  return earned
}
