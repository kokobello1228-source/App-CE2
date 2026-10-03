import { z } from 'zod';
import bankJson from '../../content/fr/f6f7.json';
import type { Rng } from '../../engine/rng';
import { createQcmSkill, type QcmItem } from '../qcm';
import type { Level } from '../types';

/**
 * F6 – Identify the subject, F7 – identify the conjugated verb.
 * One shared bank of original sentences cut into 4 word groups.
 */
export const f6f7BankSchema = z.array(
  z.object({
    id: z.string(),
    sentence: z.string(),
    groups: z.array(z.string().min(1)).length(4),
    subject: z.number().int().min(0).max(3),
    verb: z.number().int().min(0).max(3),
    /** 1 subject first, 2 pronoun or long group, 3 subject after a complement. */
    subjectLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    /** 1 first-group verb, 2 avoir, 3 être. */
    verbLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }),
);

export type F67Entry = z.infer<typeof f6f7BankSchema>[number];
export const F67_BANK: F67Entry[] = f6f7BankSchema.parse(bankJson);

function pick(level: Level, rng: Rng, by: 'subjectLevel' | 'verbLevel'): F67Entry {
  const target = level > 1 && rng.chance(0.2) ? ((level - 1) as Level) : level;
  return rng.pick(F67_BANK.filter((e) => e[by] === target));
}

function stemWith(entry: F67Entry): string {
  return entry.sentence;
}

export function generateF6(level: Level, rng: Rng): QcmItem {
  const e = pick(level, rng, 'subjectLevel');
  const subject = e.groups[e.subject];
  const verb = e.groups[e.verb];
  return {
    key: `F6:${e.id}`,
    level,
    id: e.id,
    stem: stemWith(e),
    question: 'Le sujet est :',
    choices: rng.shuffle(e.groups),
    answer: subject,
    tag: 'subject',
    say: e.sentence,
    explanation: `Le sujet dit qui fait l’action ou de qui on parle, avant le verbe « ${verb} » : ici, c’est « ${subject} ».`,
  };
}

export function generateF7(level: Level, rng: Rng): QcmItem {
  const e = pick(level, rng, 'verbLevel');
  const verb = e.groups[e.verb];
  const lemma = e.verbLevel === 2 ? 'avoir' : e.verbLevel === 3 ? 'être' : null;
  return {
    key: `F7:${e.id}`,
    level,
    id: e.id,
    stem: stemWith(e),
    question: 'Le verbe conjugué est :',
    choices: rng.shuffle(e.groups),
    answer: verb,
    tag: 'verb',
    say: e.sentence,
    explanation: lemma
      ? `« ${verb} », c’est le verbe ${lemma} conjugué. Hier, on dirait autrement : le verbe change avec le temps.`
      : `Le verbe, c’est le mot qui change quand on dit la phrase hier ou demain : « ${verb} ».`,
  };
}

const findEntry = (item: QcmItem) => F67_BANK.find((e) => e.id === item.id);

export const f6Logic = createQcmSkill({
  id: 'F6',
  instruction: 'Écoute la phrase. Trouve le sujet du verbe parmi les 4 groupes de mots.',
  avgItemSeconds: 15,
  generate: generateF6,
  classify(item, answer) {
    const e = findEntry(item);
    if (e && answer === e.groups[e.verb]) return 'verb_as_subject';
    if (e && e.subject !== 0 && answer === e.groups[0]) return 'first_group';
    return 'other';
  },
  errorTags: {
    verb_as_subject: {
      label: 'Confond le sujet et le verbe',
      tip: 'Repérez d’abord le verbe (le mot qui change avec « hier » / « demain »), puis demandez « qui est-ce qui… ? ».',
    },
    first_group: {
      label: 'Croit que le sujet est toujours au début de la phrase',
      tip: 'Proposez des phrases qui commencent par « Le soir, », « Dans la forêt, »… et cherchez ensemble qui fait l’action.',
    },
    other: {
      label: 'Sujet mal identifié',
      tip: 'Encadrez le sujet par « c’est… qui » : « C’est le bébé qui serre son doudou. »',
    },
  },
});

export const f7Logic = createQcmSkill({
  id: 'F7',
  instruction: 'Écoute la phrase. Trouve le verbe conjugué parmi les 4 groupes de mots.',
  avgItemSeconds: 15,
  generate: generateF7,
  classify(item, answer) {
    const e = findEntry(item);
    if (e && answer === e.groups[e.subject]) return 'subject_as_verb';
    if (e && e.verbLevel > 1) return 'etre_avoir';
    return 'other';
  },
  errorTags: {
    subject_as_verb: {
      label: 'Confond le verbe et le sujet',
      tip: 'Le verbe change quand on change de moment : faites dire la phrase avec « hier » puis « demain ».',
    },
    etre_avoir: {
      label: 'Ne reconnaît pas « être » ou « avoir » comme verbes',
      tip: 'Récitez « je suis, tu es, il est… » et « j’ai, tu as, il a… » : ces petits mots sont des verbes.',
    },
    other: {
      label: 'Verbe mal identifié',
      tip: 'Encadrez le verbe avec « ne… pas » : « Les enfants ne jouent pas au ballon. »',
    },
  },
});
