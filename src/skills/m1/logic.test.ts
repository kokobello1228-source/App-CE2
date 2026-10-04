import { OFFICIAL_M1_NUMBERS } from '../../content/officialItems';
import { createRng } from '../../engine/rng';
import { LEVELS } from '../types';
import { generateM1, m1Logic, type M1Item } from './logic';

const item = (value: number): M1Item => ({ key: `M1:${value}`, level: 3, value });

describe('M1 generator', () => {
  it.each(LEVELS)('level %i stays in range and avoids official numbers', (level) => {
    const rng = createRng(level);
    for (let i = 0; i < 400; i++) {
      const { value } = generateM1(level, rng);
      expect(OFFICIAL_M1_NUMBERS).not.toContain(value);
      if (level === 1) expect(value).toBeLessThan(100);
      if (level === 3) expect(value).toBeGreaterThan(100);
    }
  });

  it('level 3 includes zeros in the middle and 70–99 inside hundreds', () => {
    const rng = createRng(4);
    const values = Array.from({ length: 300 }, () => generateM1(3, rng).value);
    expect(values.some((v) => Math.floor(v / 10) % 10 === 0)).toBe(true);
    expect(values.some((v) => v % 100 >= 70)).toBe(true);
  });
});

describe('M1 speech, checking and errors', () => {
  it('reads the number in words, twice', () => {
    expect(m1Logic.speech(item(97))).toBe('Le nombre à écrire est quatre-vingt-dix-sept. Je répète : quatre-vingt-dix-sept.');
  });
  it.each([
    [904, '9004', 'written_as_heard'],
    [97, '8017', 'written_as_heard'],
    [904, '94', 'missing_zero'],
    [79, '97', 'digit_order'],
    [79, '69', 'seventy_ninety'],
    [45, '', 'no_answer'],
  ])('%i written %s -> %s', (value, answer, tag) => {
    expect(m1Logic.classifyError(item(value), answer)).toBe(tag);
  });
  it('explains 70–99 with a decomposition', () => {
    expect(m1Logic.explain(item(674), '')).toBe('« six cent soixante-quatorze », c’est 600 + 60 + 14 : on écrit 674.');
    expect(m1Logic.explain(item(93), '')).toBe('« quatre-vingt-treize », c’est 80 + 13 : on écrit 93.');
  });
});
