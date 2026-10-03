import { z } from 'zod';
import bankJson from '../../content/fr/f14.json';
import { wordsCorrectPerMinute } from '../../engine/scoring';

/** F14 – Reading aloud for one minute (fluency), scored by a parent. */
export const f14BankSchema = z.array(
  z.object({ id: z.string(), title: z.string(), text: z.string(), words: z.number().int().min(130).max(150) }),
);
export const F14_TEXTS = f14BankSchema.parse(bankJson);

export const READING_SECONDS = 60;

/** Words of a text as displayed (punctuation stays attached; lone punctuation is not a word). */
export function tokenize(text: string): { token: string; isWord: boolean }[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => ({ token, isWord: /[\p{L}\p{N}]/u.test(token) }));
}

export function wordCount(text: string): number {
  return tokenize(text).filter((t) => t.isWord).length;
}

/**
 * Result of a reading: words read up to the last word reached, minus the words
 * marked as misread; extrapolated to one minute if the text was finished early.
 */
export function fluencyScore(params: {
  text: string;
  /** Index (in tokens) of the last token read. */
  lastToken: number;
  /** Token indexes marked as misread. */
  errors: number[];
  seconds: number;
}): { wordsRead: number; errors: number; wcpm: number } {
  const tokens = tokenize(params.text);
  const wordsRead = tokens.slice(0, params.lastToken + 1).filter((t) => t.isWord).length;
  const errors = params.errors.filter((i) => i <= params.lastToken && tokens[i]?.isWord).length;
  return { wordsRead, errors, wcpm: wordsCorrectPerMinute(wordsRead, errors, params.seconds) };
}

/** Next text to read: the least recently read one. */
export function nextText(doneIds: string[]): (typeof F14_TEXTS)[number] {
  const counts = new Map(F14_TEXTS.map((t) => [t.id, 0]));
  for (const id of doneIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  const min = Math.min(...counts.values());
  const candidates = F14_TEXTS.filter((t) => counts.get(t.id) === min);
  const lastIndex = F14_TEXTS.findIndex((t) => t.id === doneIds[doneIds.length - 1]);
  return candidates.find((t) => F14_TEXTS.indexOf(t) > lastIndex) ?? candidates[0];
}
