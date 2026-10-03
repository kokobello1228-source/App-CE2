import type { SkillId } from '../../skills.config';
import type { Mode } from '../engine/session';
import type { ReviewEntry, ReviewUpdate } from '../engine/spacedRepetition';
import type { ItemBase, Level } from '../skills/types';
import type { Settings } from './settings';

export interface AttemptInput {
  sessionId: number;
  skillId: SkillId;
  level: Level;
  mode: Mode;
  item: ItemBase;
  answer: string;
  correct: boolean;
  errorTag: string | null;
  isReview: boolean;
}

export interface SkillHistory {
  correct: number;
  total: number;
  lastPracticedAt: number | null;
}

/** Number of most recent attempts used for the band estimate of a skill. */
export const HISTORY_WINDOW = 30;

/**
 * Local persistence, implemented with SQLite on the phone app (repository.ts)
 * and with browser storage on the web app (repository.web.ts).
 */
export interface Store {
  getSettings(): Promise<Settings>;
  saveSettings(patch: Partial<Settings>): Promise<void>;
  getLevels(): Promise<Partial<Record<SkillId, Level>>>;
  setLevel(skillId: SkillId, level: Level): Promise<void>;
  /** Results of the last practice answers given at a level since the level was set (oldest first). */
  recentResultsAtLevel(skillId: SkillId, level: Level, limit: number): Promise<boolean[]>;
  startSession(mode: Mode, day: string): Promise<number>;
  finishSession(id: number, correct: number, total: number, stars: number): Promise<void>;
  recordAttempt(attempt: AttemptInput): Promise<void>;
  skillHistories(): Promise<Partial<Record<SkillId, SkillHistory>>>;
  errorTagCounts(skillId: SkillId): Promise<{ tag: string; count: number }[]>;
  activeDays(): Promise<string[]>;
  totalStars(): Promise<number>;
  getReview(skillId: SkillId, itemKey: string): Promise<ReviewEntry | null>;
  applyReviewUpdate(update: ReviewUpdate): Promise<void>;
  dueReviews(skillId: SkillId, now: number, limit: number): Promise<ReviewEntry[]>;
  dueReviewCounts(now: number): Promise<Partial<Record<SkillId, number>>>;
  saveSchoolResult(skillId: SkillId, correct: number, total: number): Promise<void>;
  resetAll(): Promise<void>;
}
