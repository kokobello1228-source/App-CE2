import { z } from 'zod';
import type { Rng } from '../engine/rng';
import type { Level } from './types';

/** One question about a text (F1 read text, F3 heard text). */
export interface TextQuestionItem {
  key: string;
  level: Level;
  textId: string;
  title: string;
  text: string;
  /** Position of the question in the text's list (0 = first). */
  index: number;
  /** Kind of question: prelevement / explicite (found in the text), inference, global. */
  type: string;
  question: string;
  choices: string[];
  answer: string;
}

export const textQuestionSchema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  textId: z.string(),
  title: z.string(),
  text: z.string().min(100),
  index: z.number().int().min(0),
  type: z.string(),
  question: z.string(),
  choices: z.array(z.string()).length(4),
  answer: z.string(),
});

export const textBankSchema = z.array(
  z.object({
    id: z.string(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    title: z.string(),
    text: z.string(),
    words: z.number().int(),
    questions: z.array(
      z.object({
        type: z.string(),
        question: z.string(),
        answer: z.string(),
        distractors: z.array(z.string()).length(3),
      }),
    ),
  }),
);
export type TextEntry = z.infer<typeof textBankSchema>[number];

export function questionItem(skill: string, text: TextEntry, index: number, rng: Rng): TextQuestionItem {
  const q = text.questions[index];
  return {
    key: `${skill}:${text.id}:${index}`,
    level: text.level,
    textId: text.id,
    title: text.title,
    text: text.text,
    index,
    type: q.type,
    question: q.question,
    choices: rng.shuffle([q.answer, ...q.distractors]),
    answer: q.answer,
  };
}

/** Picks a text of the level (not the one just done if possible) and returns its questions. */
export function textBlock(skill: string, bank: TextEntry[], level: Level, rng: Rng, count: number): TextQuestionItem[] {
  const pool = bank.filter((t) => t.level === level);
  const text = rng.pick(pool.length > 0 ? pool : bank);
  const n = Math.min(count, text.questions.length);
  return Array.from({ length: n }, (_, i) => questionItem(skill, text, i, rng));
}
