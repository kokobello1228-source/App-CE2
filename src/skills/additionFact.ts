import { z } from 'zod';
import type { Level } from './types';

/** A one-line addition with one missing number (M10, M11): "… + 8 = 10". */
export interface AdditionFact {
  key: string;
  level: Level;
  kind: string;
  a: number;
  b: number;
  total: number;
  /** Which number the child must find. */
  blank: 'a' | 'b' | 'total';
}

export function additionFactSchema<K extends [string, ...string[]]>(kinds: K, max: number) {
  return z.object({
    key: z.string(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    kind: z.enum(kinds),
    a: z.number().int().min(0).max(max),
    b: z.number().int().min(0).max(max),
    total: z.number().int().min(0).max(max),
    blank: z.enum(['a', 'b', 'total']),
  });
}

export function expectedFact(item: AdditionFact): number {
  return item[item.blank];
}

export function displayFact(item: AdditionFact): string {
  const show = (part: 'a' | 'b' | 'total') => (item.blank === part ? '…' : String(item[part]));
  return `${show('a')} + ${show('b')} = ${show('total')}`;
}

export function makeFact<K extends string>(
  skill: string, level: Level, kind: K, a: number, b: number, blank: AdditionFact['blank'],
): AdditionFact & { kind: K } {
  return { key: `${skill}:${kind}:${a}+${b}:${blank}`, level, kind, a, b, total: a + b, blank };
}
