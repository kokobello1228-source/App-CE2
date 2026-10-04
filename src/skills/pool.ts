import { createRng, type Rng } from '../engine/rng';
import type { Level } from './types';

/**
 * Generated skills whose texts contain random numbers (word problems, calculations,
 * explanations) draw their items from a fixed pool of seeds: every text that can be
 * spoken is then known in advance and recorded with Plume's natural voice.
 */
export const POOL_SIZE = 80;

const seedOf = (level: Level, index: number) => level * 10_000 + index;

/** Wraps a generator so that it only produces the POOL_SIZE items of each level. */
export function pooled<T>(generate: (level: Level, rng: Rng) => T): (level: Level, rng: Rng) => T {
  return (level, rng) => generate(level, createRng(seedOf(level, rng.int(0, POOL_SIZE - 1))));
}

/** Every item of a level's pool (used to record the voice clips). */
export function poolItems<T>(generate: (level: Level, rng: Rng) => T, level: Level): T[] {
  return Array.from({ length: POOL_SIZE }, (_, i) => generate(level, createRng(seedOf(level, i))));
}
