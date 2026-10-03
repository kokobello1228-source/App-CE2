import type { z } from 'zod';
import type { SkillId } from '../../skills.config';
import type { Rng } from '../engine/rng';

export type Level = 1 | 2 | 3;
export const LEVELS: Level[] = [1, 2, 3];

/** Every item is plain JSON so it can be stored for spaced repetition. */
export interface ItemBase {
  /** Stable identity of the item content (used to avoid duplicates and for reviews). */
  key: string;
  level: Level;
}

export interface Choice {
  id: string;
  label: string;
}

export interface ErrorTagInfo {
  /** What the child did, in words a parent understands. */
  label: string;
  /** One concrete piece of advice for the parent. */
  tip: string;
}

/**
 * Pure logic of a skill: no React Native import here, so it can be used by
 * Jest tests and by the content validation script.
 */
export interface SkillLogic<I extends ItemBase = ItemBase> {
  id: SkillId;
  /** Spoken and displayed at the start of a block. */
  instruction: string;
  /** Rough time a child spends on one item in practice mode (with feedback). */
  avgItemSeconds: number;
  schema: z.ZodType<I>;
  generate(level: Level, rng: Rng): I;
  check(item: I, answer: string): boolean;
  /** Canonical correct answer (typed value or choice id), used by tests and validation. */
  expectedAnswer(item: I): string;
  /** Correct answer as shown to the child. */
  correctAnswerLabel(item: I): string;
  /** One child-friendly sentence explaining the answer. */
  explain(item: I, answer: string): string;
  /** Error tag for a wrong answer (keys of errorTags), or null when correct. */
  classifyError(item: I, answer: string): string | null;
  errorTags: Record<string, ErrorTagInfo>;
  /** What the speech synthesis reads for this item (null: nothing is read). */
  speech(item: I): string | null;
  /**
   * Skills built around a text (F1, F3): returns the questions of one text, in order,
   * instead of independent items.
   */
  generateBlock?(level: Level, rng: Rng, count: number): I[];
  /** Choices for multiple-choice skills. */
  choices?(item: I): Choice[];
}

export type AnySkillLogic = SkillLogic<ItemBase>;
