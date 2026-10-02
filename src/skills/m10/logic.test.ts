import { createRng } from '../../engine/rng';
import { LEVELS } from '../types';
import { displayM10, expectedM10, generateM10, m10Logic } from './logic';

describe('M10 generator', () => {
  it.each(LEVELS)('level %i produces valid additions', (level) => {
    const rng = createRng(level * 11);
    for (let i = 0; i < 500; i++) {
      const item = generateM10(level, rng);
      expect(item.a + item.b).toBe(item.total);
      expect(item.total).toBeLessThanOrEqual(20);
      expect(m10Logic.check(item, String(expectedM10(item)))).toBe(true);
      if (level === 1) {
        expect(item.total).toBeLessThanOrEqual(10);
        expect(item.kind).not.toBe('missing');
      }
      if (item.kind === 'complement') expect(item.total).toBe(10);
      if (item.kind === 'double') expect(item.a).toBe(item.b);
    }
  });

  it('level 3 contains missing-term additions', () => {
    const rng = createRng(5);
    const kinds = new Set(Array.from({ length: 200 }, () => generateM10(3, rng).kind));
    expect(kinds).toEqual(new Set(['add', 'double', 'complement', 'missing']));
  });
});

describe('M10 display and checking', () => {
  const item = { key: 'k', level: 2 as const, kind: 'complement' as const, a: 2, b: 8, total: 10, blank: 'a' as const };

  it('shows a dotted blank', () => {
    expect(displayM10(item)).toBe('… + 8 = 10');
  });
  it('accepts spaces around the answer and rejects wrong values', () => {
    expect(m10Logic.check(item, ' 2 ')).toBe(true);
    expect(m10Logic.check(item, '3')).toBe(false);
    expect(m10Logic.check(item, '')).toBe(false);
  });
  it('detects writing the total instead of the missing term', () => {
    expect(m10Logic.classifyError(item, '10')).toBe('wrote_total');
    expect(m10Logic.classifyError(item, '')).toBe('no_answer');
    expect(m10Logic.classifyError(item, '3')).toBe('complement');
  });
  it('explains with a child-friendly sentence', () => {
    expect(m10Logic.explain(item, '3')).toBe('2 et 8 font 10 : ce sont des amis de 10.');
  });
});
