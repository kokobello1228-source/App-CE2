import { DAY_MS, isDue, onAnswer, type ReviewEntry } from './spacedRepetition';

const base = { skillId: 'M3', itemKey: 'k', itemJson: '{}', now: 1_000_000 };

describe('spaced repetition', () => {
  it('queues a failed item for the next session', () => {
    const update = onAnswer(null, { ...base, correct: false });
    expect(update).toEqual({ kind: 'upsert', entry: { skillId: 'M3', itemKey: 'k', itemJson: '{}', streak: 0, dueAt: base.now } });
  });

  it('ignores a correct answer on an item that is not queued', () => {
    expect(onAnswer(null, { ...base, correct: true })).toEqual({ kind: 'none' });
  });

  it('brings it back 2 days later after a first success, then removes it', () => {
    const entry: ReviewEntry = { skillId: 'M3', itemKey: 'k', itemJson: '{}', streak: 0, dueAt: base.now };
    const first = onAnswer(entry, { ...base, correct: true });
    expect(first.kind).toBe('upsert');
    if (first.kind !== 'upsert') return;
    expect(first.entry.dueAt).toBe(base.now + 2 * DAY_MS);
    expect(isDue(first.entry, base.now + DAY_MS)).toBe(false);
    expect(isDue(first.entry, base.now + 2 * DAY_MS)).toBe(true);
    expect(onAnswer(first.entry, { ...base, correct: true })).toEqual({ kind: 'remove', skillId: 'M3', itemKey: 'k' });
  });

  it('resets the streak on a new failure', () => {
    const entry: ReviewEntry = { skillId: 'M3', itemKey: 'k', itemJson: '{}', streak: 1, dueAt: 0 };
    const update = onAnswer(entry, { ...base, correct: false });
    expect(update.kind === 'upsert' && update.entry.streak).toBe(0);
  });
});
