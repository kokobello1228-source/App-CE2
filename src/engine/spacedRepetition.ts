/**
 * Spaced repetition of failed items.
 * - A failed item is due at the next session.
 * - After a first success it comes back 2 days later.
 * - After a second success in a row it leaves the queue.
 * - A new failure puts it back to the start.
 */
export const DAY_MS = 24 * 60 * 60 * 1000;
export const SUCCESSES_TO_GRADUATE = 2;
const INTERVAL_DAYS_AFTER_SUCCESS = [2];

export interface ReviewEntry {
  skillId: string;
  itemKey: string;
  itemJson: string;
  streak: number;
  dueAt: number;
}

export type ReviewUpdate =
  | { kind: 'upsert'; entry: ReviewEntry }
  | { kind: 'remove'; skillId: string; itemKey: string }
  | { kind: 'none' };

export function onAnswer(
  existing: ReviewEntry | null,
  params: { skillId: string; itemKey: string; itemJson: string; correct: boolean; now: number },
): ReviewUpdate {
  const { skillId, itemKey, itemJson, correct, now } = params;
  if (!correct) {
    return { kind: 'upsert', entry: { skillId, itemKey, itemJson, streak: 0, dueAt: now } };
  }
  if (!existing) return { kind: 'none' };
  const streak = existing.streak + 1;
  if (streak >= SUCCESSES_TO_GRADUATE) return { kind: 'remove', skillId, itemKey };
  const days = INTERVAL_DAYS_AFTER_SUCCESS[Math.min(streak - 1, INTERVAL_DAYS_AFTER_SUCCESS.length - 1)];
  return { kind: 'upsert', entry: { ...existing, itemJson, streak, dueAt: now + days * DAY_MS } };
}

export function isDue(entry: ReviewEntry, now: number): boolean {
  return entry.dueAt <= now;
}
