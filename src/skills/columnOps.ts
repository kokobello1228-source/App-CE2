import { z } from 'zod';
import { OFFICIAL_COLUMN_OPS } from '../content/officialItems';
import type { Rng } from '../engine/rng';
import type { Level } from './types';

/** A column operation (M4 additions, M5 subtractions without borrowing). */
export interface ColumnOpItem {
  key: string;
  level: Level;
  op: '+' | '-';
  terms: number[];
}

export const columnOpSchema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  op: z.enum(['+', '-']),
  terms: z.array(z.number().int().min(0).max(999)).min(2).max(3),
});

export function resultOf(item: Pick<ColumnOpItem, 'op' | 'terms'>): number {
  return item.op === '+' ? item.terms.reduce((a, b) => a + b, 0) : item.terms[0] - item.terms[1];
}

/** Digit of n at a position (0 = units). */
export function digit(n: number, position: number): number {
  return Math.floor(n / 10 ** position) % 10;
}

export function digitCount(n: number): number {
  return Math.max(1, String(n).length);
}

/** Column sums without carries, units first. */
function columnSums(terms: number[]): number[] {
  const width = Math.max(...terms.map(digitCount));
  return Array.from({ length: width }, (_, p) => terms.reduce((acc, t) => acc + digit(t, p), 0));
}

export function hasCarry(terms: number[]): boolean {
  let carry = 0;
  for (const sum of columnSums(terms)) {
    if (sum + carry >= 10) return true;
    carry = 0;
  }
  return false;
}

/** Result obtained when every carry is forgotten (5 + 7 = 12 -> writes 2). */
export function sumWithoutCarry(terms: number[]): number {
  return columnSums(terms).reduce((acc, sum, p) => acc + (sum % 10) * 10 ** p, 0);
}

/** Result obtained when each column total is written in full (5 + 7 -> "12"). */
export function concatenatedColumns(terms: number[]): number {
  return Number(columnSums(terms).reverse().join(''));
}

/** Result obtained when numbers are aligned on the left instead of the right. */
export function leftAligned(item: Pick<ColumnOpItem, 'op' | 'terms'>): number {
  const width = Math.max(...item.terms.map(digitCount));
  const shifted = item.terms.map((t) => t * 10 ** (width - digitCount(t)));
  return resultOf({ op: item.op, terms: shifted });
}

function opKey(op: '+' | '-', terms: number[]): string {
  return terms.join(op);
}

export function makeColumnOp(skill: string, level: Level, op: '+' | '-', terms: number[]): ColumnOpItem {
  return { key: `${skill}:${opKey(op, terms)}`, level, op, terms };
}

export function isOfficial(op: '+' | '-', terms: number[]): boolean {
  return OFFICIAL_COLUMN_OPS.includes(opKey(op, terms));
}

/** Random number with exactly `digits` digits. */
export function randomWithDigits(rng: Rng, digits: number): number {
  return digits === 1 ? rng.int(1, 9) : rng.int(10 ** (digits - 1), 10 ** digits - 1);
}
