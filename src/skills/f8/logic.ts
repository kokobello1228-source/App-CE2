import { z } from 'zod';
import bankJson from '../../content/fr/f8.json';
import type { Rng } from '../../engine/rng';
import type { Choice, Level, SkillLogic } from '../types';

/**
 * F8 – Identify the tense of an underlined verb:
 * imparfait / présent / futur / passé composé.
 */
export type Tense = 'imparfait' | 'present' | 'futur' | 'passe_compose';

/** Official order of the four choices. */
export const TENSES: Tense[] = ['imparfait', 'present', 'futur', 'passe_compose'];

export const TENSE_LABELS: Record<Tense, string> = {
  imparfait: 'imparfait',
  present: 'présent',
  futur: 'futur',
  passe_compose: 'passé composé',
};

/** Sentence with exactly one verb group between square brackets. */
const MARKED_SENTENCE = /^[^[\]]*\[[^[\]]+\][^[\]]*$/;

export const f8BankSchema = z.array(
  z.object({
    id: z.string().regex(/^F8-\d{3}$/),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    tense: z.enum(['imparfait', 'present', 'futur', 'passe_compose']),
    sentence: z.string().regex(MARKED_SENTENCE, 'one verb between [ ]'),
  }),
);

export type F8BankEntry = z.infer<typeof f8BankSchema>[number];

export interface F8Item extends F8BankEntry {
  key: string;
}

const itemSchema = z.object({
  key: z.string(),
  id: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  tense: z.enum(['imparfait', 'present', 'futur', 'passe_compose']),
  sentence: z.string().regex(MARKED_SENTENCE),
});

export const F8_BANK: F8BankEntry[] = f8BankSchema.parse(bankJson);

export function splitSentence(sentence: string): { before: string; verb: string; after: string } {
  const match = /^([^[]*)\[([^\]]+)\](.*)$/.exec(sentence);
  if (!match) throw new Error(`Invalid F8 sentence: ${sentence}`);
  return { before: match[1], verb: match[2], after: match[3] };
}

export function plainSentence(sentence: string): string {
  return sentence.replace(/[[\]]/g, '');
}

export function generateF8(level: Level, rng: Rng): F8Item {
  // Mostly the current level, sometimes an easier one to keep confidence.
  const target = level > 1 && rng.chance(0.2) ? ((level - 1) as Level) : level;
  const entry = rng.pick(F8_BANK.filter((e) => e.level === target));
  return { ...entry, key: entry.id };
}

const IMPARFAIT_ENDINGS = ['aient', 'ions', 'iez', 'ait', 'ais'];
const FUTUR_ENDINGS = ['rons', 'ront', 'rez', 'rai', 'ras', 'ra'];

function explainTense(tense: Tense, verb: string): string {
  switch (tense) {
    case 'present':
      return `« ${verb} » est au présent : l’action se passe maintenant.`;
    case 'imparfait': {
      const ending = IMPARFAIT_ENDINGS.find((e) => verb.endsWith(e));
      return `« ${verb} » est à l’imparfait : c’est du passé, et le verbe se termine par -${ending ?? 'ait'}.`;
    }
    case 'futur': {
      const ending = FUTUR_ENDINGS.find((e) => verb.endsWith(e)) ?? 'ra';
      return `« ${verb} » est au futur : l’action se passera plus tard, on entend le « r » de -${ending}.`;
    }
    case 'passe_compose': {
      const [aux, participle] = verb.split(' ');
      return `« ${verb} » est au passé composé : il a deux mots, « ${aux} » et « ${participle} ».`;
    }
  }
}

/** Unordered pair of tenses, used as an error tag (e.g. "futur__present"). */
export function confusionTag(a: Tense, b: Tense): string {
  return [a, b].sort().join('__');
}

const confusionTips: Record<string, { label: string; tip: string }> = {
  [confusionTag('imparfait', 'present')]: {
    label: 'Confond imparfait et présent',
    tip: 'Faites dire la phrase en commençant par « Hier » puis « Aujourd’hui » : laquelle sonne juste ? Repérez les terminaisons -ais, -ait, -aient.',
  },
  [confusionTag('futur', 'present')]: {
    label: 'Confond futur et présent',
    tip: 'Ajoutez « Demain » devant la phrase. Faites entendre le « r » du futur : il chante / il chantera.',
  },
  [confusionTag('passe_compose', 'present')]: {
    label: 'Confond passé composé et présent',
    tip: 'Le passé composé a deux mots (avoir ou être + verbe). Avec « être » et « avoir » seuls (il a, il est), c’est le présent.',
  },
  [confusionTag('imparfait', 'passe_compose')]: {
    label: 'Confond les deux temps du passé',
    tip: 'Comptez les mots du verbe : un seul mot qui finit par -ait → imparfait ; deux mots → passé composé.',
  },
  [confusionTag('futur', 'passe_compose')]: {
    label: 'Confond futur et passé composé',
    tip: 'Demandez « c’est avant ou après maintenant ? ». Le futur est un seul mot avec un « r » ; le passé composé en a deux.',
  },
  [confusionTag('futur', 'imparfait')]: {
    label: 'Confond futur et imparfait',
    tip: 'Comparez à voix haute « il chantait » et « il chantera ». Le futur parle de demain, l’imparfait d’hier.',
  },
};

export const f8Logic: SkillLogic<F8Item> = {
  id: 'F8',
  instruction: 'Écoute la phrase. À quel temps est le verbe souligné ? Choisis la bonne réponse.',
  avgItemSeconds: 15,
  schema: itemSchema,
  generate: generateF8,
  check: (item, answer) => answer === item.tense,
  expectedAnswer: (item) => item.tense,
  correctAnswerLabel: (item) => TENSE_LABELS[item.tense],
  explain: (item) => explainTense(item.tense, splitSentence(item.sentence).verb),
  classifyError(item, answer) {
    if (answer === item.tense) return null;
    if (!TENSES.includes(answer as Tense)) return 'no_answer';
    return confusionTag(item.tense, answer as Tense);
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Relisez la phrase lentement avec l’enfant et demandez : « ça se passe hier, aujourd’hui ou demain ? ».',
    },
    ...confusionTips,
  },
  speech: (item) => plainSentence(item.sentence),
  choices: (): Choice[] => TENSES.map((t) => ({ id: t, label: TENSE_LABELS[t] })),
};
