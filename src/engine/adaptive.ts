import type { Level } from '../skills/types';

/** Window of recent answers (at the current level) used to adapt the level. */
export const ADAPT_WINDOW = 10;
const LEVEL_UP_MIN_ATTEMPTS = 8;
const LEVEL_UP_RATE = 0.8;
const LEVEL_DOWN_MIN_ATTEMPTS = 6;
const LEVEL_DOWN_RATE = 0.5;

/**
 * Next level of a skill from the most recent answers given at the current level
 * (oldest first). Moves up at 80 % success, down under 50 %.
 */
export function nextLevel(current: Level, recentAtLevel: boolean[]): Level {
  const window = recentAtLevel.slice(-ADAPT_WINDOW);
  if (window.length === 0) return current;
  const rate = window.filter(Boolean).length / window.length;
  if (window.length >= LEVEL_UP_MIN_ATTEMPTS && rate >= LEVEL_UP_RATE && current < 3) {
    return (current + 1) as Level;
  }
  if (window.length >= LEVEL_DOWN_MIN_ATTEMPTS && rate < LEVEL_DOWN_RATE && current > 1) {
    return (current - 1) as Level;
  }
  return current;
}
