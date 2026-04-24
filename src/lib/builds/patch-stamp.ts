// Patch currency helpers — reads current DDragon patch and detects stale stamps.
import 'server-only'
import { getDDragonVersion } from '@/lib/ddragon'

/** Returns the current live DDragon patch string (e.g. "14.9.1"). */
export async function currentPatch(): Promise<string> {
  return getDDragonVersion()
}

/**
 * Returns true when `stamped` is ≥ `threshold` major.minor steps behind `current`.
 *
 * Only the first two version segments (major.minor) are compared.
 * A missing/null stamp is always considered stale.
 *
 * @example
 * isStale('14.7.1', '14.9.1')     // true  (2 minor versions behind)
 * isStale('14.8.1', '14.9.1')     // false (1 behind, threshold is 2)
 * isStale(null, '14.9.1')          // true
 */
export function isStale(
  stamped: string | null | undefined,
  current: string,
  threshold = 2,
): boolean {
  if (!stamped) return true

  const toScore = (v: string): number => {
    const parts = v.split('.')
    const major = parseInt(parts[0] ?? '0', 10)
    const minor = parseInt(parts[1] ?? '0', 10)
    return major * 100 + minor
  }

  return toScore(current) - toScore(stamped) >= threshold
}
