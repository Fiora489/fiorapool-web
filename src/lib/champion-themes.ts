/**
 * Single source of truth for champion → theme mapping.
 * Hand-curated list today; planned programmatic expansion from Data Dragon.
 *
 * Used by:
 *   - (app)/layout.tsx — server-read accent_champion, apply `theme-{id}` class
 *   - profile/theme-picker.tsx — render the picker options
 *   - Magic UI components read --primary / --primary-glow indirectly
 */

export type ChampionThemeId =
  | 'fiora' | 'camille' | 'irelia' | 'lux'
  | 'jinx' | 'yasuo' | 'zed' | 'ahri'

export type ChampionThemeEntry = {
  id: ChampionThemeId
  championName: string    // display name (matches Riot champion_name when possible)
  label: string
  /** OKLCh hue anchor. Kept alongside the CSS class for UI previews. */
  previewHex: string
}

export const CHAMPION_THEMES: ChampionThemeEntry[] = [
  { id: 'fiora',   championName: 'Fiora',   label: 'Fiora — Rose',     previewHex: '#f4718b' },
  { id: 'camille', championName: 'Camille', label: 'Camille — Steel',  previewHex: '#6fa6cf' },
  { id: 'irelia',  championName: 'Irelia',  label: 'Irelia — Violet',  previewHex: '#a066e0' },
  { id: 'lux',     championName: 'Lux',     label: 'Lux — Gold',       previewHex: '#f4d670' },
  { id: 'jinx',    championName: 'Jinx',    label: 'Jinx — Cyan',      previewHex: '#5cd4d0' },
  { id: 'yasuo',   championName: 'Yasuo',   label: 'Yasuo — Wind',     previewHex: '#88c0d0' },
  { id: 'zed',     championName: 'Zed',     label: 'Zed — Amber',      previewHex: '#e19246' },
  { id: 'ahri',    championName: 'Ahri',    label: 'Ahri — Rose-Pink', previewHex: '#e76fc4' },
]

const ID_BY_NAME = new Map<string, ChampionThemeId>(
  CHAMPION_THEMES.map(t => [t.championName.toLowerCase(), t.id]),
)

const ID_SET = new Set<string>(CHAMPION_THEMES.map(t => t.id))

/**
 * Given a stored champion accent (from app_progress.accent_champion), resolve
 * it to a theme id. Accepts either a canonical champion name ("Fiora") or a
 * theme id ("fiora"). Returns null if unknown.
 */
export function resolveThemeId(input: string | null | undefined): ChampionThemeId | null {
  if (!input) return null
  const normalised = input.toLowerCase()
  if (ID_SET.has(normalised)) return normalised as ChampionThemeId
  return ID_BY_NAME.get(normalised) ?? null
}

/** CSS class to apply on <body> or <html>, e.g. `theme-fiora`. */
export function themeClass(id: ChampionThemeId | null): string {
  return id ? `theme-${id}` : ''
}

export function isValidThemeId(id: string): id is ChampionThemeId {
  return ID_SET.has(id)
}
