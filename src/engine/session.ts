import { SKILLS, type Band, type SkillId, type Timing } from '../../skills.config';
import { LEVELS, type AnySkillLogic, type ItemBase, type Level } from '../skills/types';
import type { Rng } from './rng';

export type Mode = 'daily' | 'free' | 'school';

export interface Block {
  skillId: SkillId;
  items: ItemBase[];
  /** Keys of the items that come from the review queue. */
  reviewKeys: string[];
  /** Countdown, or null for untimed practice. */
  timing: Timing | null;
  /** Feedback after each answer (practice) or only at the end (school mode). */
  immediateFeedback: boolean;
}

/**
 * Builds the list of items of a block: due reviews first, then fresh items,
 * with no duplicate content.
 */
export function buildItems(params: {
  logic: AnySkillLogic;
  count: number;
  level: Level;
  rng: Rng;
  reviews?: ItemBase[];
  /** School mode: spread items over the three levels, like the official test. */
  mixedLevels?: boolean;
}): { items: ItemBase[]; reviewKeys: string[] } {
  const { logic, count, level, rng, reviews = [], mixedLevels = false } = params;
  const items: ItemBase[] = [];
  const seen = new Set<string>();
  const reviewKeys: string[] = [];
  for (const review of reviews.slice(0, Math.ceil(count / 2))) {
    if (seen.has(review.key)) continue;
    seen.add(review.key);
    items.push(review);
    reviewKeys.push(review.key);
  }
  const fresh: ItemBase[] = [];
  const freshCount = count - items.length;
  const levelPlan = mixedLevels
    ? Array.from({ length: freshCount }, (_, i) => LEVELS[Math.floor((i * LEVELS.length) / freshCount)])
    : Array.from({ length: freshCount }, () => level);
  for (const target of levelPlan) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const item = logic.generate(target, rng);
      if (!seen.has(item.key)) {
        seen.add(item.key);
        fresh.push(item);
        break;
      }
    }
  }
  // Mixed levels stay in increasing order of difficulty; reviews are interleaved.
  const ordered = mixedLevels ? fresh : rng.shuffle(fresh);
  return { items: interleave(items, ordered), reviewKeys };
}

/** Spreads reviews among fresh items instead of putting them all first. */
function interleave(reviews: ItemBase[], fresh: ItemBase[]): ItemBase[] {
  if (reviews.length === 0) return fresh;
  const result: ItemBase[] = [];
  const gap = Math.max(1, Math.floor((reviews.length + fresh.length) / reviews.length));
  let r = 0;
  let f = 0;
  for (let i = 0; r < reviews.length || f < fresh.length; i++) {
    if (r < reviews.length && (i % gap === 0 || f >= fresh.length)) result.push(reviews[r++]);
    else result.push(fresh[f++]);
  }
  return result;
}

/** Number of items in free practice (close to the official count, but short). */
export function freePracticeCount(skillId: SkillId): number {
  return Math.min(12, Math.max(8, SKILLS[skillId].officialItems));
}

export interface SkillSnapshot {
  skillId: SkillId;
  band: Band | null;
  lastPracticedAt: number | null;
  dueReviews: number;
}

const BAND_WEIGHT: Record<Band, number> = { besoins: 3, fragile: 2, satisfaisant: 1 };
const UNKNOWN_BAND_WEIGHT = 2.5;
const DAY_MS = 24 * 60 * 60 * 1000;

export function skillPriority(snapshot: SkillSnapshot, now: number): number {
  const bandWeight = snapshot.band ? BAND_WEIGHT[snapshot.band] : UNKNOWN_BAND_WEIGHT;
  const days = snapshot.lastPracticedAt === null ? 7 : (now - snapshot.lastPracticedAt) / DAY_MS;
  return bandWeight + Math.min(days, 7) * 0.3 + Math.min(snapshot.dueReviews, 5) * 0.4;
}

/** Number of skills in the daily session, from its duration. */
export function dailySkillCount(minutes: number): number {
  return minutes >= 12 ? 4 : 3;
}

/**
 * Picks the skills of the daily session: most fragile first, then the ones not
 * practised for a while. Keeps at least one French and one maths skill when possible.
 */
export function chooseDailySkills(snapshots: SkillSnapshot[], count: number, now: number): SkillId[] {
  const sorted = [...snapshots].sort((a, b) => skillPriority(b, now) - skillPriority(a, now));
  const chosen = sorted.slice(0, count);
  const domains = new Set(chosen.map((s) => SKILLS[s.skillId].domain));
  if (domains.size === 1 && chosen.length > 1) {
    const other = sorted.find((s) => SKILLS[s.skillId].domain !== SKILLS[chosen[0].skillId].domain);
    if (other) chosen[chosen.length - 1] = other;
  }
  return chosen.map((s) => s.skillId);
}

/** Items per skill so that the daily session lasts about `minutes`. */
export function dailyItemCount(logic: AnySkillLogic, minutes: number, skillCount: number): number {
  const seconds = (minutes * 60) / skillCount;
  return Math.min(15, Math.max(4, Math.round(seconds / logic.avgItemSeconds)));
}

export interface AnswerRecord {
  skillId: SkillId;
  item: ItemBase;
  answer: string;
  correct: boolean;
  errorTag: string | null;
  isReview: boolean;
}

/** Stars earned for a finished session: 1 for finishing, +1 at 60 %, +1 at 85 %. */
export function sessionStars(records: AnswerRecord[]): number {
  if (records.length === 0) return 0;
  const rate = records.filter((r) => r.correct).length / records.length;
  return 1 + (rate >= 0.6 ? 1 : 0) + (rate >= 0.85 ? 1 : 0);
}

export function summarizeBySkill(records: AnswerRecord[]): Partial<Record<SkillId, { correct: number; total: number }>> {
  const result: Partial<Record<SkillId, { correct: number; total: number }>> = {};
  for (const r of records) {
    const entry = (result[r.skillId] ??= { correct: 0, total: 0 });
    entry.total += 1;
    if (r.correct) entry.correct += 1;
  }
  return result;
}

/** Consecutive days with at least one session, ending today or yesterday. Days are "YYYY-MM-DD". */
export function computeStreak(activeDays: string[], today: string): number {
  const days = new Set(activeDays);
  const cursor = new Date(`${today}T12:00:00`);
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(toDayString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function toDayString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
