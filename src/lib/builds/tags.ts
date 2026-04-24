// Pure tag normalisation + validation.

const MAX_TAGS = 8
const MAX_TAG_LENGTH = 24

export class TagValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message)
    this.name = 'TagValidationError'
  }
}

/**
 * Converts a raw tag string to a normalised kebab-case slug.
 * Returns an empty string if the input produces nothing meaningful.
 */
export function normalizeTag(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // strip all except alphanum, space, hyphen
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-{2,}/g, '-')         // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '')        // strip leading/trailing hyphens
}

/**
 * Validates a list of already-normalised tag strings.
 * Throws TagValidationError on any violation.
 */
export function validateTagList(tags: string[]): void {
  if (tags.length > MAX_TAGS) {
    throw new TagValidationError('tags', `Maximum ${MAX_TAGS} tags allowed (got ${tags.length})`)
  }
  for (const tag of tags) {
    if (tag.length === 0) {
      throw new TagValidationError('tags', 'Empty tags are not allowed')
    }
    if (tag.length > MAX_TAG_LENGTH) {
      throw new TagValidationError(
        'tags',
        `Tag "${tag.slice(0, 20)}…" exceeds ${MAX_TAG_LENGTH} characters`,
      )
    }
  }
}

/** Normalises and deduplicates a raw tag list, removing empties. */
export function sanitizeTags(raw: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const tag of raw) {
    const n = normalizeTag(tag)
    if (n.length > 0 && !seen.has(n)) {
      seen.add(n)
      result.push(n)
    }
  }
  return result
}
