import { z } from 'zod';
import type { SkillId } from '../../skills.config';
import type { Rng } from '../engine/rng';
import type { Choice, ErrorTagInfo, Level, SkillLogic } from './types';

/**
 * Generic multiple-choice item used by most French skills.
 * In `stem`, [words] are underlined and **words** are in bold.
 */
export interface QcmItem {
  key: string;
  level: Level;
  /** Source entry id (bank) or generated signature. */
  id: string;
  stem: string;
  /** Line shown under the stem ("Le sujet est :"). */
  question: string;
  choices: string[];
  answer: string;
  /** Kind of question, used to pick the explanation or the error tag. */
  tag: string;
  /** Text read by speech synthesis. */
  say: string;
  explanation: string;
}

export const qcmItemSchema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  id: z.string(),
  stem: z.string(),
  question: z.string(),
  choices: z.array(z.string().min(1)).min(4).max(4),
  answer: z.string().min(1),
  tag: z.string(),
  say: z.string(),
  explanation: z.string().min(5),
});

/** Removes the [ ] and ** markers. */
export function plain(text: string): string {
  return text.replace(/[[\]]/g, '').replace(/\*\*/g, '');
}

export interface QcmSkillConfig {
  id: SkillId;
  instruction: string;
  avgItemSeconds: number;
  generate(level: Level, rng: Rng): QcmItem;
  errorTags: Record<string, ErrorTagInfo>;
  /** Error tag for a wrong choice; default: the item tag. */
  classify?(item: QcmItem, answer: string): string;
  /** Read the four choices after the stem (official instructions for heard exercises). */
  readChoices?: boolean;
  /** Override what is read (default: item.say). */
  speech?(item: QcmItem): string | null;
}

export function createQcmSkill(config: QcmSkillConfig): SkillLogic<QcmItem> {
  const logic: SkillLogic<QcmItem> = {
    id: config.id,
    instruction: config.instruction,
    avgItemSeconds: config.avgItemSeconds,
    schema: qcmItemSchema,
    generate: config.generate,
    check: (item, answer) => answer === item.answer,
    expectedAnswer: (item) => item.answer,
    correctAnswerLabel: (item) => item.answer,
    explain: (item) => item.explanation,
    classifyError(item, answer) {
      if (answer === item.answer) return null;
      if (!item.choices.includes(answer)) return 'no_answer';
      return config.classify ? config.classify(item, answer) : item.tag;
    },
    errorTags: {
      no_answer: {
        label: 'Pas de réponse dans le temps',
        tip: 'Refaites l’exercice sans chronomètre en entraînement libre, puis remettez le temps quand l’enfant est à l’aise.',
      },
      ...config.errorTags,
    },
    speech: (item) => {
      if (config.speech) return config.speech(item);
      return config.readChoices ? `${item.say} ${item.question} ${item.choices.join(' ; ')} ?` : item.say;
    },
    choices: (item): Choice[] => item.choices.map((c) => ({ id: c, label: c })),
  };
  return logic;
}

/** Picks an entry of a bank for a level (sometimes an easier one), then builds the item. */
export function pickFromBank<E extends { id: string; level: Level }>(bank: E[], level: Level, rng: Rng): E {
  const target = level > 1 && rng.chance(0.2) ? ((level - 1) as Level) : level;
  const pool = bank.filter((e) => e.level === target);
  return rng.pick(pool.length > 0 ? pool : bank);
}
