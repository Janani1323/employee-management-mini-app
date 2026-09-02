/**
 * Set-based dedupe (primary approach) — O(n), insertion order preserved.
 */
export function dedupeIdsSet(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

/**
 * filter + indexOf (shown for contrast) — O(n^2), included to demonstrate an
 * alternative approach; dedupeIdsSet is the one actually used elsewhere.
 */
export function dedupeIdsFilter(ids: string[]): string[] {
  return ids.filter((id, index) => ids.indexOf(id) === index);
}
