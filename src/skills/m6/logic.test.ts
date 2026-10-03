import { OFFICIAL_M6_TEXTS } from '../../content/officialItems';
import { createRng } from '../../engine/rng';
import { LEVELS } from '../types';
import { distractors, generateM6, m6Logic, partsText, valueOf, type M6Item } from './logic';

describe('M6 generator', () => {
  it.each(LEVELS)('level %i gives one correct choice among 4, never official', (level) => {
    const rng = createRng(level * 13);
    for (let i = 0; i < 400; i++) {
      const item = generateM6(level, rng);
      expect(item.choices.filter((c) => c === valueOf(item.parts))).toHaveLength(1);
      expect(new Set(item.choices).size).toBe(4);
      expect(OFFICIAL_M6_TEXTS).not.toContain(partsText(item.parts));
      if (level === 1) expect(item.parts.every((p) => p.count <= 9)).toBe(true);
    }
  });

  it('level 3 uses more than 9 of a unit or a missing unit', () => {
    const rng = createRng(2);
    const items = Array.from({ length: 200 }, () => generateM6(3, rng));
    expect(items.some((i) => i.parts.some((p) => p.count > 9))).toBe(true);
    expect(items.some((i) => i.parts.length === 2 && !i.parts.some((p) => p.unit === 'd'))).toBe(true);
  });
});

describe('M6 distractors and errors', () => {
  const item: M6Item = {
    key: 'k', level: 2, parts: [{ unit: 'u', count: 6 }, { unit: 'd', count: 8 }], choices: [86, 68, 14, 806],
  };
  it('reproduces the typical mistakes', () => {
    expect(distractors(item.parts).slice(0, 3)).toEqual([68, 14, 680]);
    expect(m6Logic.classifyError(item, '68')).toBe('reading_order');
    expect(m6Logic.classifyError(item, '14')).toBe('sum_of_counts');
  });
  it('explains with more than 9 of a unit', () => {
    const big: M6Item = { key: 'k', level: 3, parts: [{ unit: 'd', count: 50 }], choices: [500, 50, 5000, 5] };
    expect(m6Logic.explain(big, '50')).toBe('50 dizaines, c’est 500. On ajoute le reste : ça fait 500.');
    expect(m6Logic.speech(big)).toBe('50 dizaines. Quel est ce nombre ?');
  });
});
