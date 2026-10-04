import { z } from 'zod';
import type { Rng } from '../../engine/rng';
import { drawFraction, fractionWords, type Fraction } from '../fractions';
import type { Choice, Level, SkillLogic } from '../types';

/** M7 – Read fractions: the fraction is heard and written in words; pick the digits among 4. */
export interface M7Item {
  key: string;
  level: Level;
  n: number;
  d: number;
  choices: Fraction[];
}

const fractionSchema = z.object({ n: z.number().int().min(1).max(10), d: z.number().int().min(1).max(10) });
const schema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  n: z.number().int().min(1).max(10),
  d: z.number().int().min(2).max(10),
  choices: z.array(fractionSchema).length(4),
});

export const fractionId = (f: Fraction) => `${f.n}/${f.d}`;

/** Typical wrong answers (inverted fraction first, as in the official traps). */
export function m7Distractors({ n, d }: Fraction): Fraction[] {
  const pool: Fraction[] = [
    { n: d, d: n }, // inverted
    { n, d: n }, // 3/3
    { n: d, d }, // 4/4
    { n, d: 1 }, // 6/1
    { n: 1, d }, // 1/4
    { n, d: d === 2 ? 3 : d === 3 ? 4 : d - 2 }, // neighbouring denominator
    { n, d: d < 10 ? d + 1 : 6 },
  ];
  const seen = new Set<string>([fractionId({ n, d })]);
  return pool.filter((f) => {
    const id = fractionId(f);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function generateM7(level: Level, rng: Rng): M7Item {
  const fraction = drawFraction(level, rng);
  // Level 3 keeps the trickiest traps (same digits); other levels mix them.
  const pool = m7Distractors(fraction);
  const wrong = level === 3 ? pool.slice(0, 3) : [pool[0], ...rng.shuffle(pool.slice(1)).slice(0, 2)];
  return {
    key: `M7:${fractionId(fraction)}`,
    level,
    ...fraction,
    choices: rng.shuffle([fraction, ...wrong]),
  };
}

export const m7Logic: SkillLogic<M7Item> = {
  id: 'M7',
  instruction: 'Écoute la fraction. Trouve son écriture en chiffres.',
  avgItemSeconds: 15,
  schema,
  generate: generateM7,
  check: (item, answer) => answer === fractionId(item),
  expectedAnswer: (item) => fractionId(item),
  correctAnswerLabel: (item) => `${item.n}/${item.d}`,
  explain(item) {
    return `« ${fractionWords(item)} » : on partage en ${item.d} parts égales (le nombre du bas) et on en prend ${item.n} (le nombre du haut).`;
  },
  classifyError(item, answer) {
    if (m7Logic.check(item, answer)) return null;
    const [n, d] = answer.split('/').map(Number);
    if (!n || !d) return 'no_answer';
    if (n === item.d && d === item.n) return 'inverted';
    if (n === item.n) return 'wrong_denominator';
    return 'wrong_numerator';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Revoyez les mots demi, tiers, quart, cinquième… en partageant une pizza ou une tablette de chocolat.',
    },
    inverted: {
      label: 'Inverse le numérateur et le dénominateur (trois quarts → 4/3)',
      tip: 'Le nombre du bas dit en combien de parts on coupe ; celui du haut, combien on en prend. Dites « 3 parts sur 4 ».',
    },
    wrong_denominator: {
      label: 'Se trompe sur le mot qui donne le nombre de parts (tiers, quart, sixième…)',
      tip: 'Associez chaque mot à son nombre : demi → 2, tiers → 3, quart → 4, puis cinquième → 5…',
    },
    wrong_numerator: {
      label: 'Se trompe sur le nombre de parts prises',
      tip: 'Faites colorier le nombre de parts entendu sur une bande partagée.',
    },
  },
  speech: (item) => `La fraction est ${fractionWords(item)}. Je répète : ${fractionWords(item)}.`,
  choices: (item): Choice[] => item.choices.map((f) => ({ id: fractionId(f), label: `${f.n}/${f.d}` })),
};
