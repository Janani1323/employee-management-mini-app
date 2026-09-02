import { dedupeIdsFilter, dedupeIdsSet } from './dedupe-ids.util';

describe('dedupeIdsSet', () => {
  it('removes duplicate values while preserving first-seen order', () => {
    expect(dedupeIdsSet(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  it('returns an empty array for an empty input', () => {
    expect(dedupeIdsSet([])).toEqual([]);
  });

  it('returns the same values when there are no duplicates', () => {
    expect(dedupeIdsSet(['x', 'y', 'z'])).toEqual(['x', 'y', 'z']);
  });
});

describe('dedupeIdsFilter', () => {
  it('produces the same result as the Set-based approach', () => {
    const input = ['a', 'b', 'a', 'c', 'b', 'a'];
    expect(dedupeIdsFilter(input)).toEqual(dedupeIdsSet(input));
  });
});
