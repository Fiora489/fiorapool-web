// Pure stat aggregation. Additive across all items — including percent stats.
// This matches in-game additive stacking (e.g. two 12% LS items → 24%, not compound).
// Haste and omnivamp are not present in Data Dragon item.json stats; both stay 0.

export interface ComputedStats {
  ad: number
  ap: number
  hp: number
  armor: number
  mr: number
  crit: number        // fraction (0–1); 0.2 = 20% crit
  ms: number          // flat movement speed bonus
  msPercent: number   // fraction (0–1)
  lifesteal: number   // fraction (0–1)
  attackSpeed: number // fraction bonus (0–1)
  mana: number
  haste: number       // always 0 (not in ddragon stats)
  omnivamp: number    // always 0 (not in ddragon stats)
}

const STAT_MAP: Readonly<Record<string, keyof ComputedStats>> = {
  FlatPhysicalDamageMod:   'ad',
  FlatMagicDamageMod:      'ap',
  FlatHPPoolMod:           'hp',
  FlatArmorMod:            'armor',
  FlatSpellBlockMod:       'mr',
  FlatCritChanceMod:       'crit',
  FlatMovementSpeedMod:    'ms',
  PercentMovementSpeedMod: 'msPercent',
  PercentLifeStealMod:     'lifesteal',
  PercentAttackSpeedMod:   'attackSpeed',
  FlatMPPoolMod:           'mana',
}

const ZERO: ComputedStats = {
  ad: 0, ap: 0, hp: 0, armor: 0, mr: 0,
  crit: 0, ms: 0, msPercent: 0, lifesteal: 0, attackSpeed: 0,
  mana: 0, haste: 0, omnivamp: 0,
}

export function computeFinalStats(
  items: ReadonlyArray<{ stats: Record<string, number> }>,
): ComputedStats {
  const result = { ...ZERO }
  for (const item of items) {
    for (const [key, value] of Object.entries(item.stats)) {
      const stat = STAT_MAP[key]
      if (stat !== undefined) result[stat] += value
    }
  }
  return result
}
