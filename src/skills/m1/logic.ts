import { z } from 'zod';
import { OFFICIAL_M1_NUMBERS } from '../../content/officialItems';
import type { Rng } from '../../engine/rng';
import { parseWholeNumber } from '../common';
import { frenchNumber, plural } from '../frenchNumbers';
import type { Level, SkillLogic } from '../types';

/**
 * M1 – Write dictated whole numbers (up to 999), with a focus on 70–99
 * and zeros in the middle (904).
 */
export interface M1Item {
  key: string;
  level: Level;
  value: number;
}

const schema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  value: z.number().int().min(0).max(999),
});

/**
 * Levels from the score guide:
 * 1 – numbers under 100 (some 70–99);
 * 2 – 70–99 and 3-digit numbers whose spoken form is transparent (347);
 * 3 – zeros in the middle (904), 70–99 inside hundreds (674), round numbers (880).
 */
function draw(level: Level, rng: Rng): number {
  const hundreds = () => rng.int(1, 9) * 100;
  switch (level) {
    case 1:
      return rng.chance(0.75) ? rng.int(11, 69) : rng.int(70, 99);
    case 2:
      return rng.chance(0.6) ? rng.int(70, 99) : hundreds() + rng.int(2, 6) * 10 + rng.int(1, 9);
    case 3:
      return rng.pick([
        () => hundreds() + rng.int(1, 9), // 904
        () => hundreds() + rng.int(7, 9) * 10 + rng.int(0, 9), // 674, 880
        () => hundreds() + rng.int(1, 9) * 10, // 340
        () => hundreds() + rng.int(11, 16), // 512
      ])();
  }
}

export function generateM1(level: Level, rng: Rng): M1Item {
  let value: number;
  do value = draw(level, rng);
  while (OFFICIAL_M1_NUMBERS.includes(value));
  return { key: `M1:${value}`, level, value };
}

function decomposition(n: number): string {
  const h = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;
  const parts: string[] = [];
  if (h > 0) parts.push(plural(h, 'centaine'));
  parts.push(plural(d, 'dizaine'), plural(u, 'unité'));
  return parts.join(', ').replace(/, ([^,]*)$/, ' et $1');
}

export const m1Logic: SkillLogic<M1Item> = {
  id: 'M1',
  instruction: 'Écoute bien le nombre. Il est dit deux fois. Écris-le avec des chiffres.',
  avgItemSeconds: 10,
  schema,
  generate: generateM1,
  check: (item, answer) => parseWholeNumber(answer) === item.value,
  expectedAnswer: (item) => String(item.value),
  correctAnswerLabel: (item) => String(item.value),
  explain(item) {
    const n = item.value;
    const words = frenchNumber(n);
    const rest = n % 100;
    const head = n - rest > 0 ? `${n - rest} + ` : '';
    if (rest >= 70 && rest < 80) return `« ${words} », c’est ${head}60 + ${rest - 60} : on écrit ${n}.`;
    if (rest >= 90) return `« ${words} », c’est ${head}80 + ${rest - 80} : on écrit ${n}.`;
    return `« ${words} » : ${decomposition(n)}, on écrit ${n}.`;
  },
  classifyError(item, answer) {
    if (m1Logic.check(item, answer)) return null;
    const value = parseWholeNumber(answer);
    if (value === null) return 'no_answer';
    const expected = String(item.value);
    const typed = String(value);
    if (typed.length > expected.length) return 'written_as_heard';
    if (expected.includes('0') && typed === expected.replace(/0/g, '')) return 'missing_zero';
    if (typed.length === expected.length && [...typed].sort().join('') === [...expected].sort().join('')) return 'digit_order';
    const rest = item.value % 100;
    if (rest >= 70) return 'seventy_ninety';
    return 'other';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Dictez des nombres au quotidien (prix, numéros de maison) et faites-les écrire rapidement.',
    },
    written_as_heard: {
      label: 'Écrit le nombre comme il l’entend (quatre-vingt-dix-sept → 8017, neuf cent quatre → 9004)',
      tip: 'Utilisez un tableau centaines / dizaines / unités : chaque chiffre a une seule case.',
    },
    missing_zero: {
      label: 'Oublie le zéro qui marque une dizaine absente (904 → 94)',
      tip: 'Avec du matériel (plaques, barres, cubes), montrez qu’il n’y a aucune dizaine : on écrit 0 pour la case vide.',
    },
    digit_order: {
      label: 'Inverse des chiffres (79 → 97)',
      tip: 'Faites dire d’abord combien de dizaines, puis combien d’unités, avant d’écrire.',
    },
    seventy_ninety: {
      label: 'Difficultés avec 70 à 99 (soixante-dix, quatre-vingt-dix)',
      tip: 'Décomposez à voix haute : soixante-dix-neuf = 60 + 19. Jouez à dire ces nombres « à la belge » (septante, nonante) pour comprendre.',
    },
    other: {
      label: 'Nombre mal transcrit',
      tip: 'Faites répéter le nombre entendu avant de l’écrire, puis relire le nombre écrit à voix haute.',
    },
  },
  // Never a number alone: inside a sentence, the voice says it clearly.
  speech: (item) => `Le nombre à écrire est ${frenchNumber(item.value)}. Je répète : ${frenchNumber(item.value)}.`,
};
