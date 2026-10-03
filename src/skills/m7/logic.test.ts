import { createRng } from '../../engine/rng';
import { fractionWords } from '../fractions';
import { m8Logic, generateM8, represents } from '../m8/logic';
import { LEVELS } from '../types';
import { fractionId, generateM7, m7Logic, m7Distractors } from './logic';

describe('fraction words', () => {
  it.each([
    [1, 2, 'un demi'], [3, 4, 'trois quarts'], [2, 3, 'deux tiers'], [6, 8, 'six huitièmes'], [1, 10, 'un dixième'],
  ])('%i/%i -> %s', (n, d, words) => {
    expect(fractionWords({ n, d })).toBe(words);
  });
});

describe('M7 read fractions', () => {
  it.each(LEVELS)('level %i: fractions ≤ 1, one correct among 4 distinct', (level) => {
    const rng = createRng(level * 17);
    for (let i = 0; i < 300; i++) {
      const item = generateM7(level, rng);
      expect(item.n).toBeLessThanOrEqual(item.d);
      expect([2, 3, 4, 5, 6, 8, 10]).toContain(item.d);
      expect(new Set(item.choices.map(fractionId)).size).toBe(4);
      expect(item.choices.filter((c) => c.n === item.n && c.d === item.d)).toHaveLength(1);
      // The inverted fraction is always offered as a trap.
      expect(item.choices.some((c) => c.n === item.d && c.d === item.n)).toBe(true);
    }
  });
  it('tags the inverted fraction', () => {
    const item = { key: 'k', level: 2 as const, n: 3, d: 4, choices: [{ n: 3, d: 4 }, ...m7Distractors({ n: 3, d: 4 }).slice(0, 3)] };
    expect(m7Logic.classifyError(item, '4/3')).toBe('inverted');
    expect(m7Logic.classifyError(item, '3/3')).toBe('wrong_denominator');
  });
});

describe('M8 represent fractions', () => {
  it.each(LEVELS)('level %i: exactly one figure shows the fraction, no equivalent trap', (level) => {
    const rng = createRng(level * 19);
    for (let i = 0; i < 300; i++) {
      const item = generateM8(level, rng);
      const correct = item.figures.filter((f) => represents(f, item.n, item.d));
      expect(correct).toHaveLength(1);
      for (const f of item.figures) {
        const equalParts = f.sizes.every((s) => s === f.sizes[0]);
        if (equalParts && f !== correct[0]) {
          expect(f.shaded.length * item.d).not.toBe(item.n * f.sizes.length);
        }
        expect(f.shaded.every((s) => s < f.sizes.length)).toBe(true);
      }
    }
  });
  it('offers an unequal-parts trap from level 2', () => {
    const rng = createRng(1);
    const items = Array.from({ length: 100 }, () => generateM8(2, rng));
    expect(items.some((i) => i.figures.some((f) => !f.sizes.every((s) => s === f.sizes[0])))).toBe(true);
  });
  it('reads the official question', () => {
    const item = generateM8(1, createRng(5));
    expect(m8Logic.speech(item)).toMatch(/^Dans quel cas a-t-on colorié un (demi|tiers|quart) de la figure en gris \?$/);
  });
});
