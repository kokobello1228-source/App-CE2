import { z } from 'zod';
import bankJson from '../../content/fr/f10.json';
import type { Rng } from '../../engine/rng';
import { createQcmSkill, pickFromBank, plain, type QcmItem } from '../qcm';
import type { Level } from '../types';

/** F10 – Find the meaning of an uncommon word (in bold) from the context. */
export const f10BankSchema = z.array(
  z.object({
    id: z.string(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    sentence: z.string().regex(/\*\*[^*]+\*\*/),
    answer: z.string(),
    opposite: z.string(),
    lookalike: z.string(),
    other: z.string(),
  }),
);
export type F10Entry = z.infer<typeof f10BankSchema>[number];
export const F10_BANK: F10Entry[] = f10BankSchema.parse(bankJson);

export function targetWord(sentence: string): string {
  return /\*\*([^*]+)\*\*/.exec(sentence)?.[1] ?? '';
}

export function generateF10(level: Level, rng: Rng): QcmItem {
  return itemF10(pickFromBank(F10_BANK, level, rng), level, rng);
}

export function itemF10(e: F10Entry, level: Level, rng: Rng): QcmItem {
  const word = targetWord(e.sentence);
  return {
    key: `F10:${e.id}`,
    level,
    id: e.id,
    stem: e.sentence,
    question: `Que veut dire « ${word} » ?`,
    choices: rng.shuffle([e.answer, e.opposite, e.lookalike, e.other]),
    answer: e.answer,
    tag: 'context',
    say: `${plain(e.sentence)} Que veut dire ${word} ?`,
    explanation: `Ici, « ${word} » veut dire « ${e.answer} ». La phrase donne des indices pour le comprendre.`,
  };
}

export const f10Logic = createQcmSkill({
  id: 'F10',
  instruction: 'Écoute la phrase. Un mot est en gras : trouve ce qu’il veut dire.',
  avgItemSeconds: 18,
  generate: generateF10,
  readChoices: true,
  speech: (item) => `${item.say} ${item.choices.join(' ; ')} ?`,
  classify(item, answer) {
    const e = F10_BANK.find((x) => x.id === item.id);
    if (e && answer === e.opposite) return 'antonym';
    if (e && answer === e.lookalike) return 'sound';
    return 'context';
  },
  errorTags: {
    antonym: {
      label: 'Confond le mot avec son contraire',
      tip: 'Jouez aux contraires et aux synonymes : « grand », le même sens ? « immense » ; le contraire ? « petit ».',
    },
    sound: {
      label: 'Croit qu’un synonyme doit se ressembler à l’oral (épuisé / épicé)',
      tip: 'Expliquez que deux mots de même sens peuvent être très différents : « content » et « ravi ».',
    },
    context: {
      label: 'N’utilise pas les indices de la phrase',
      tip: 'Cachez le mot difficile et demandez : « quel mot connu pourrait le remplacer ici ? ». Lisez beaucoup d’histoires variées.',
    },
  },
});
