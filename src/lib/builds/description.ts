// Pure markdown description sanitizer.
// Strips script/iframe/event-handler/javascript: patterns.
// Keeps standard markdown constructs and safe inline HTML.

const MAX_DESCRIPTION_LENGTH = 5000

/**
 * Sanitizes a markdown string before persisting it.
 * - Removes <script> and <iframe> blocks (with their content)
 * - Removes on* event handler attributes
 * - Removes javascript: pseudo-protocol from href/src attributes
 * - Removes any HTML tags not in the safe-HTML passthrough set
 */
export function sanitizeDescription(raw: string): string {
  return raw
    // Remove <script> blocks including contents
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Remove <iframe> blocks including contents
    .replace(/<iframe[\s\S]*?(?:<\/iframe>|\/?>)/gi, '')
    // Remove on* event handler attributes (onclick=, onerror=, onload=, …)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Remove javascript: pseudo-protocol from href/src
    .replace(
      /(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:\S*)/gi,
      '',
    )
    // Strip any HTML tags not in the passthrough allowlist
    // Allowed: a, b, i, em, strong, code, pre, h1-h6, ul, ol, li, p, br, hr
    .replace(
      /<(?!\/?(?:a|b|i|em|strong|code|pre|h[1-6]|ul|ol|li|p|br|hr)\b)[^>]+>/gi,
      '',
    )
    .trim()
}

/** Throws when the sanitized markdown string exceeds the character limit. */
export function validateDescription(md: string): void {
  if (md.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(
      `Description exceeds ${MAX_DESCRIPTION_LENGTH} characters (${md.length})`,
    )
  }
}
