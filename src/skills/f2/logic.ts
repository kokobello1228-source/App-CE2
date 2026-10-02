import { z } from 'zod';
import bankJson from '../../content/fr/f2.json';
import type { Rng } from '../../engine/rng';
import { normalizeText, stripAccents } from '../common';
import type { Level, SkillLogic } from '../types';

/**
 * F2 – Write dictated words. As in the official marking, a plural mark is accepted.
 */
export const f2BankSchema = z.array(
  z.object({
    id: z.string().regex(/^F2-\d{3}$/),
    word: z.string().min(2),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    /** Context sentence read between the two dictations of the word. */
    sentence: z.string().min(5),
    /** Words that never take a plural mark (adverbs, numbers…). */
    invariable: z.boolean(),
    /** Irregular plural forms (cheval -> chevaux). */
    plurals: z.array(z.string()).optional(),
  }),
);

export type F2BankEntry = z.infer<typeof f2BankSchema>[number];

export interface F2Item extends F2BankEntry {
  key: string;
}

const itemSchema = z.object({
  key: z.string(),
  id: z.string(),
  word: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  sentence: z.string(),
  invariable: z.boolean(),
  plurals: z.array(z.string()).optional(),
});

export const F2_BANK: F2BankEntry[] = f2BankSchema.parse(bankJson);

const ARTICLES = /^(?:(?:le|la|les|un|une|des)\s+|l')/;

/** Normalises a typed answer: case, apostrophes, spaces and a leading article. */
export function normalizeAnswer(answer: string): string {
  return normalizeText(answer).replace(ARTICLES, '').trim();
}

/** Every spelling accepted for an entry (singular and plural marks). */
export function acceptedForms(entry: Pick<F2BankEntry, 'word' | 'invariable' | 'plurals'>): string[] {
  const word = normalizeText(entry.word);
  if (entry.invariable) return [word];
  if (entry.plurals) return [word, ...entry.plurals.map(normalizeText)];
  if (/[sxz]$/.test(word)) return [word];
  if (/(eau|au|eu)$/.test(word)) return [word, `${word}x`];
  return [word, `${word}s`];
}

export function generateF2(level: Level, rng: Rng): F2Item {
  const target = level > 1 && rng.chance(0.2) ? ((level - 1) as Level) : level;
  const entry = rng.pick(F2_BANK.filter((e) => e.level === target));
  return { ...entry, key: entry.id };
}

/** "maison" -> "m-a-i-s-o-n" */
export function spell(word: string): string {
  return [...word].filter((c) => c !== ' ').join('-');
}

function collapseDoubles(text: string): string {
  return text.replace(/([a-z])\1/g, '$1');
}

/** Rough phonetic key: different spellings of the same sounds collapse together. */
export function phoneticKey(text: string): string {
  return stripAccents(text)
    .replace(/eau|au/g, 'o')
    .replace(/ai|ei|et$/g, 'e')
    .replace(/[ae][nm](?=[^aeiouy]|$)/g, 'A')
    .replace(/(ai|ei|i)[nm](?=[^aeiouy]|$)/g, 'I')
    .replace(/ph/g, 'f')
    .replace(/qu|c(?=[aou])|k/g, 'K')
    .replace(/c(?=[eiy])|ç/g, 's')
    .replace(/g(?=[eiy])/g, 'j')
    .replace(/([a-z])\1/g, '$1')
    .replace(/[sxtdzp]$/, '');
}

export const f2Logic: SkillLogic<F2Item> = {
  id: 'F2',
  instruction: 'Écoute bien le mot, puis écris-le. Le mot est dit deux fois.',
  avgItemSeconds: 25,
  schema: itemSchema,
  generate: generateF2,
  check: (item, answer) => acceptedForms(item).includes(normalizeAnswer(answer)),
  expectedAnswer: (item) => item.word,
  correctAnswerLabel: (item) => item.word,
  explain(item, answer) {
    const word = item.word;
    if (f2Logic.check(item, answer)) return `Bravo ! « ${word} » s’écrit ${spell(word)}.`;
    switch (f2Logic.classifyError(item, answer)) {
      case 'accent':
        return `On écrit « ${word} » avec un accent : ${spell(word)}.`;
      case 'silent_letter':
        return `On écrit « ${word} » : attention à la lettre muette à la fin, ${spell(word)}.`;
      case 'double_consonant':
        return `On écrit « ${word} » : regarde bien les lettres doublées, ${spell(word)}.`;
      default:
        return `On écrit « ${word} » : ${spell(word)}.`;
    }
  },
  classifyError(item, answer) {
    if (f2Logic.check(item, answer)) return null;
    const typed = normalizeAnswer(answer);
    if (typed === '') return 'no_answer';
    const forms = acceptedForms(item);
    if (forms.some((f) => stripAccents(f) === stripAccents(typed))) return 'accent';
    const word = normalizeText(item.word);
    if (typed.length < word.length && word.startsWith(typed) && word.length - typed.length <= 2) {
      return 'silent_letter';
    }
    if (forms.some((f) => collapseDoubles(stripAccents(f)) === collapseDoubles(stripAccents(typed)))) {
      return 'double_consonant';
    }
    if (phoneticKey(typed) === phoneticKey(word)) return 'phonetic';
    return 'other';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Entraînez-vous à écrire vite les mots très courants : une petite liste de 5 mots par jour, relue et écrite de mémoire.',
    },
    accent: {
      label: 'Oubli ou erreur d’accent',
      tip: 'Faites prononcer le mot en exagérant le son « é » ou « è » ; l’accent fait partie du mot comme une lettre.',
    },
    silent_letter: {
      label: 'Oubli de la lettre muette finale (chat → cha)',
      tip: 'Cherchez un mot de la même famille qui fait entendre la lettre : chat → chaton, petit → petite.',
    },
    double_consonant: {
      label: 'Consonne double oubliée ou ajoutée',
      tip: 'Écrivez le mot en grand et entourez les lettres doublées en couleur, puis cachez-le et faites-le réécrire.',
    },
    phonetic: {
      label: 'Écrit les bons sons mais pas la bonne orthographe (o / au / eau…)',
      tip: 'L’enfant entend bien les sons : il faut maintenant mémoriser l’orthographe. Classez les mots par graphie (o, au, eau).',
    },
    other: {
      label: 'Mot mal encodé',
      tip: 'Dites le mot syllabe par syllabe et faites écrire chaque syllabe ; vérifiez ensemble lettre par lettre.',
    },
  },
  speech: (item) => `${item.word}. ${item.sentence} ${item.word}.`,
};
