import { OFFICIAL_M11_FACTS } from '../../content/officialItems';
import { createRng } from '../../engine/rng';
import { displayFact, expectedFact } from '../additionFact';
import { LEVELS } from '../types';
import { generateM11, m11Logic, type M11Item } from './logic';

describe('M11 generator', () => {
  it.each(LEVELS)('level %i gives valid additions under 100, never official ones', (level) => {
    const rng = createRng(level * 7);
    for (let i = 0; i < 500; i++) {
      const item = generateM11(level, rng);
      expect(item.a + item.b).toBe(item.total);
      expect(item.total).toBeLessThan(100);
      expect(OFFICIAL_M11_FACTS).not.toContain(displayFact(item));
      if (item.kind === 'plus9') expect(item.b).toBe(9);
      if (item.kind === 'plus19') expect(item.b).toBe(19);
      if (item.kind === 'nextTen') expect(item.total % 10).toBe(0);
      if (item.kind === 'tens') expect(item.b % 10).toBe(0);
    }
  });

  it('covers + 9 and + 19 at level 3', () => {
    const rng = createRng(3);
    const kinds = new Set(Array.from({ length: 300 }, () => generateM11(3, rng).kind));
    expect(kinds.has('plus9')).toBe(true);
    expect(kinds.has('plus19')).toBe(true);
  });
});

describe('M11 errors and explanations', () => {
  const plus9: M11Item = { key: 'k', level: 3, kind: 'plus9', a: 25, b: 9, total: 34, blank: 'total' };
  it('detects forgetting to remove 1 on + 9', () => {
    expect(m11Logic.classifyError(plus9, '35')).toBe('plus9_adjust');
    expect(m11Logic.classifyError(plus9, '44')).toBe('tens_error');
  });
  it('explains + 9 as + 10 − 1', () => {
    expect(m11Logic.explain(plus9, '35')).toBe('Ajouter 9, c’est ajouter 10 puis enlever 1 : 25 + 10 = 35, puis 35 − 1 = 34.');
  });
  it('explains crossing the ten', () => {
    const item: M11Item = { key: 'k', level: 2, kind: 'small', a: 27, b: 5, total: 32, blank: 'total' };
    expect(expectedFact(item)).toBe(32);
    expect(m11Logic.explain(item, '')).toBe('On passe la dizaine : 27 + 3 = 30, puis encore 2, ça fait 32.');
  });
});
