import { m10Logic } from '../skills/m10/logic';
import { m3Logic } from '../skills/m3/logic';
import type { AnySkillLogic } from '../skills/types';
import { createRng } from './rng';
import {
  buildItems, chooseDailySkills, computeStreak, dailyItemCount, sessionStars, type AnswerRecord, type SkillSnapshot,
} from './session';

const m3 = m3Logic as unknown as AnySkillLogic;
const m10 = m10Logic as unknown as AnySkillLogic;
const NOW = Date.UTC(2026, 9, 2);

describe('buildItems', () => {
  it('produces the requested number of unique items', () => {
    const { items } = buildItems({ logic: m3, count: 12, level: 2, rng: createRng(3) });
    expect(items).toHaveLength(12);
    expect(new Set(items.map((i) => i.key)).size).toBe(12);
  });

  it('includes due reviews without duplicates', () => {
    const review = m3.generate(1, createRng(99));
    const { items, reviewKeys } = buildItems({ logic: m3, count: 6, level: 1, rng: createRng(4), reviews: [review, review] });
    expect(reviewKeys).toEqual([review.key]);
    expect(items.filter((i) => i.key === review.key)).toHaveLength(1);
    expect(items).toHaveLength(6);
  });

  it('spreads levels in school mode, easiest first', () => {
    const { items } = buildItems({ logic: m10, count: 9, level: 1, rng: createRng(5), mixedLevels: true });
    expect(items.map((i) => i.level)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
  });
});

describe('chooseDailySkills', () => {
  const snap = (skillId: SkillSnapshot['skillId'], band: SkillSnapshot['band'], days: number | null, due = 0): SkillSnapshot => ({
    skillId, band, lastPracticedAt: days === null ? null : NOW - days * 86_400_000, dueReviews: due,
  });

  it('prioritises fragile skills', () => {
    const chosen = chooseDailySkills(
      [snap('M10', 'satisfaisant', 0), snap('M3', 'besoins', 0), snap('F8', 'fragile', 0), snap('F2', 'satisfaisant', 0)],
      2, NOW,
    );
    expect(chosen).toEqual(['M3', 'F8']);
  });

  it('keeps one French and one maths skill', () => {
    const chosen = chooseDailySkills(
      [snap('M10', 'besoins', 3), snap('M3', 'besoins', 3), snap('F8', 'satisfaisant', 0), snap('F2', 'satisfaisant', 0)],
      2, NOW,
    );
    expect(chosen).toContain('M10');
    expect(chosen.some((id) => id.startsWith('F'))).toBe(true);
  });
});

describe('dailyItemCount', () => {
  it('fits the session duration and stays between 4 and 15', () => {
    expect(dailyItemCount(m3, 10, 3)).toBe(8);
    expect(dailyItemCount(m10, 10, 3)).toBe(15);
    expect(dailyItemCount(m3, 1, 4)).toBe(4);
  });
});

describe('sessionStars', () => {
  const rec = (correct: boolean): AnswerRecord => ({
    skillId: 'M3', item: { key: 'x', level: 1 }, answer: '', correct, errorTag: null, isReview: false,
  });
  it('gives 1 to 3 stars', () => {
    expect(sessionStars([])).toBe(0);
    expect(sessionStars([rec(false), rec(false)])).toBe(1);
    expect(sessionStars([rec(true), rec(true), rec(false)])).toBe(2);
    expect(sessionStars(Array(7).fill(rec(true)))).toBe(3);
  });
});

describe('computeStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(computeStreak(['2026-09-30', '2026-10-01', '2026-10-02'], '2026-10-02')).toBe(3);
  });
  it('still counts when today is not done yet', () => {
    expect(computeStreak(['2026-09-30', '2026-10-01'], '2026-10-02')).toBe(2);
  });
  it('breaks on a missing day and handles month change', () => {
    expect(computeStreak(['2026-09-28', '2026-09-30', '2026-10-01'], '2026-10-01')).toBe(2);
    expect(computeStreak([], '2026-10-01')).toBe(0);
  });
});
