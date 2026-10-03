import type { Rng } from '../engine/rng';
import type { Level } from './types';

/** Denominators used in the official assessment. */
export const DENOMINATORS = [2, 3, 4, 5, 6, 8, 10];

const NUMERATOR_WORDS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
const DENOMINATOR_WORDS: Record<number, [string, string]> = {
  2: ['demi', 'demis'],
  3: ['tiers', 'tiers'],
  4: ['quart', 'quarts'],
  5: ['cinquième', 'cinquièmes'],
  6: ['sixième', 'sixièmes'],
  8: ['huitième', 'huitièmes'],
  10: ['dixième', 'dixièmes'],
};

export interface Fraction {
  n: number;
  d: number;
}

/** "trois quarts", "un demi", "deux tiers". */
export function fractionWords({ n, d }: Fraction): string {
  return `${NUMERATOR_WORDS[n]} ${DENOMINATOR_WORDS[d][n > 1 ? 1 : 0]}`;
}

/**
 * Fraction for a level (always ≤ 1):
 * 1 – unit fractions (1/2, 1/3, 1/4…);
 * 2 – non-unit fractions with small denominators;
 * 3 – any denominator.
 */
export function drawFraction(level: Level, rng: Rng): Fraction {
  if (level === 1) return { n: 1, d: rng.pick(DENOMINATORS) };
  const d = level === 2 ? rng.pick([3, 4, 5, 6]) : rng.pick([4, 5, 6, 8, 10]);
  return { n: rng.int(2, d - 1), d };
}

export function sameFraction(a: Fraction, b: Fraction): boolean {
  return a.n === b.n && a.d === b.d;
}
