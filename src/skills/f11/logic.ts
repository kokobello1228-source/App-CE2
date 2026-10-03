import { z } from 'zod';
import bankJson from '../../content/fr/f11.json';
import type { Rng } from '../../engine/rng';
import { createQcmSkill, pickFromBank, type QcmItem } from '../qcm';
import type { Level } from '../types';

/**
 * F11 – Words of the same family: among 4 words, find the intruder that does
 * not belong to the family of the given word (it only looks like it: fort / forêt).
 */
export const f11BankSchema = z.array(
  z.object({
    id: z.string(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    word: z.string(),
    family: z.array(z.string()).length(3),
    intruder: z.string(),
  }),
);
export type F11Entry = z.infer<typeof f11BankSchema>[number];
export const F11_BANK: F11Entry[] = f11BankSchema.parse(bankJson);

export function generateF11(level: Level, rng: Rng): QcmItem {
  const e = pickFromBank(F11_BANK, level, rng);
  const word = e.word.replace(/ \(.*\)$/, '');
  return {
    key: `F11:${e.id}`,
    level,
    id: e.id,
    stem: `Famille du mot **${e.word}**`,
    question: 'Quel mot n’est pas de la famille ? C’est l’intrus.',
    choices: rng.shuffle([...e.family, e.intruder]),
    answer: e.intruder,
    tag: e.level === 1 ? 'radical' : 'meaning',
    say: `Famille du mot ${word}. Quel mot n’est pas de la famille ?`,
    explanation: `« ${e.intruder} » ressemble un peu à « ${word} », mais il n’a pas le même sens : ce n’est pas un mot de sa famille. ${e.family.join(', ')} parlent tous de « ${word} ».`,
  };
}

export const f11Logic = createQcmSkill({
  id: 'F11',
  instruction: 'Écoute le mot. Parmi les 4 mots, un seul n’est pas de sa famille : trouve l’intrus.',
  avgItemSeconds: 16,
  generate: generateF11,
  readChoices: true,
  speech: (item) => `${item.say} ${item.choices.join(' ; ')} ?`,
  errorTags: {
    radical: {
      label: 'Ne repère pas le radical commun (fleur → fleuriste, fleurir)',
      tip: 'Entourez le morceau commun des mots de la famille, puis cherchez celui qui ne l’a pas vraiment.',
    },
    meaning: {
      label: 'Se laisse piéger par un mot qui ressemble mais n’a pas le même sens (fort / fortune)',
      tip: 'Pour chaque mot, demandez « est-ce que ça parle de… ? ». Le sens compte autant que la forme.',
    },
  },
});
