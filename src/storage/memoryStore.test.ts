import { MemoryStore, type Persistence } from './memoryStore';

function memory(): Persistence & { data: string | null } {
  return {
    data: null,
    load() { return this.data; },
    save(d) { this.data = d; },
  };
}

const attempt = (correct: boolean, level: 1 | 2 | 3 = 1, mode: 'free' | 'school' = 'free') => ({
  sessionId: 1, skillId: 'M3' as const, level, mode, item: { key: `k${Math.random()}`, level }, answer: '1',
  correct, errorTag: correct ? null : 'other', isReview: false,
});

describe('MemoryStore (web storage)', () => {
  it('persists and reloads its state', async () => {
    const p = memory();
    const a = new MemoryStore(p);
    await a.saveSettings({ childName: 'Zoé' });
    await a.setLevel('M3', 2);
    const b = new MemoryStore(p);
    expect((await b.getSettings()).childName).toBe('Zoé');
    expect(await b.getLevels()).toEqual({ M3: 2 });
  });

  it('starts fresh on unreadable data', async () => {
    const p = memory();
    p.data = '{oops';
    expect((await new MemoryStore(p).getSettings()).dailyMinutes).toBe(10);
  });

  it('counts recent practice results at a level since the level changed', async () => {
    let t = 1000;
    const store = new MemoryStore(memory(), () => t);
    await store.recordAttempt(attempt(false));
    t = 2000;
    await store.setLevel('M3', 1);
    t = 3000;
    await store.recordAttempt(attempt(true));
    await store.recordAttempt(attempt(true, 1, 'school'));
    await store.recordAttempt(attempt(false, 2));
    expect(await store.recentResultsAtLevel('M3', 1, 10)).toEqual([true]);
  });

  it('computes histories, error tags, streak days and stars', async () => {
    const store = new MemoryStore(memory(), () => 5000);
    const id = await store.startSession('daily', '2026-10-03');
    await store.recordAttempt(attempt(true));
    await store.recordAttempt(attempt(false));
    await store.finishSession(id, 1, 2, 2);
    await store.startSession('daily', '2026-10-04'); // not finished
    expect(await store.skillHistories()).toEqual({ M3: { correct: 1, total: 2, lastPracticedAt: 5000 } });
    expect(await store.errorTagCounts('M3')).toEqual([{ tag: 'other', count: 1 }]);
    expect(await store.activeDays()).toEqual(['2026-10-03']);
    expect(await store.totalStars()).toBe(2);
  });

  it('manages the review queue', async () => {
    const store = new MemoryStore(memory());
    const entry = { skillId: 'M3', itemKey: 'a', itemJson: '{}', streak: 0, dueAt: 10 };
    await store.applyReviewUpdate({ kind: 'upsert', entry });
    expect(await store.getReview('M3', 'a')).toEqual(entry);
    expect(await store.dueReviews('M3', 5, 10)).toEqual([]);
    expect(await store.dueReviewCounts(10)).toEqual({ M3: 1 });
    await store.applyReviewUpdate({ kind: 'remove', skillId: 'M3', itemKey: 'a' });
    expect(await store.getReview('M3', 'a')).toBeNull();
  });

  it('keeps settings on reset', async () => {
    const store = new MemoryStore(memory());
    await store.saveSettings({ childName: 'Zoé' });
    await store.setLevel('M3', 3);
    await store.resetAll();
    expect(await store.getLevels()).toEqual({});
    expect((await store.getSettings()).childName).toBe('Zoé');
  });
});
