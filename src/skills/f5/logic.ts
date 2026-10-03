import { z } from 'zod';
import bankJson from '../../content/fr/f5.json';
import type { Rng } from '../../engine/rng';
import { createQcmSkill, pickFromBank, type QcmItem } from '../qcm';
import type { Level } from '../types';

/**
 * F5 – Understand read sentences: a sentence with a gap; one of 4 words gives
 * a correct meaning. Levels from the score guide: 1 a noun, 2 a verb, 3 an adjective
 * (syntax and agreement matter, not only meaning).
 */
export const f5BankSchema = z.array(
  z.object({
    id: z.string(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    kind: z.enum(['n', 'v', 'a']),
    sentence: z.string().includes('…'),
    answer: z.string(),
    distractors: z.array(z.string()).length(3),
  }),
);
export type F5Entry = z.infer<typeof f5BankSchema>[number];
export const F5_BANK: F5Entry[] = f5BankSchema.parse(bankJson);

export function fill(sentence: string, word: string): string {
  const filled = sentence.replace('…', word).replace(/l’([aeiouéh])/gi, 'l’$1');
  return /[.!?]$/.test(filled) ? filled : `${filled}.`;
}

const EXPLAIN: Record<F5Entry['kind'], string> = {
  n: 'Avec ce mot, la phrase a du sens',
  v: 'Avec ce verbe, la phrase a du sens et le verbe va bien avec le sujet',
  a: 'Cet adjectif donne du sens à la phrase et il s’accorde bien avec le nom',
};

export function generateF5(level: Level, rng: Rng): QcmItem {
  return itemF5(pickFromBank(F5_BANK, level, rng), level, rng);
}

export function itemF5(e: F5Entry, level: Level, rng: Rng): QcmItem {
  return {
    key: `F5:${e.id}`,
    level,
    id: e.id,
    stem: e.sentence,
    question: 'Quel mot donne un sens correct à la phrase ?',
    choices: rng.shuffle([e.answer, ...e.distractors]),
    answer: e.answer,
    tag: e.kind,
    say: '',
    explanation: `${EXPLAIN[e.kind]} : « ${fill(e.sentence, e.answer)} »`,
  };
}

/** Same beginning as the answer: an agreement mistake rather than a meaning one. */
function sameRoot(a: string, b: string): boolean {
  return a.slice(0, 3).toLowerCase() === b.slice(0, 3).toLowerCase();
}

export const f5Logic = createQcmSkill({
  id: 'F5',
  instruction: 'Lis la phrase. Choisis le mot qui permet de lui donner un sens correct.',
  avgItemSeconds: 16,
  generate: generateF5,
  speech: () => null,
  classify: (item, answer) => (item.tag !== 'n' && sameRoot(item.answer, answer) ? 'agreement' : item.tag === 'n' ? 'decoding' : 'meaning'),
  errorTags: {
    decoding: {
      label: 'Confond des mots qui se ressemblent à l’écrit (poisson / poison)',
      tip: 'Lisez ensemble les 4 mots à voix haute, lentement, puis relisez la phrase avec chacun.',
    },
    agreement: {
      label: 'Choisit le bon mot mais mal accordé (s’appuie seulement sur le sens)',
      tip: 'Demandez « qui fait l’action ? » ou « de quel nom on parle ? » pour vérifier l’accord.',
    },
    meaning: {
      label: 'Choisit un mot qui ne donne pas de sens à la phrase',
      tip: 'Après avoir choisi, faites relire toute la phrase : « est-ce que ça veut dire quelque chose ? ».',
    },
  },
});
