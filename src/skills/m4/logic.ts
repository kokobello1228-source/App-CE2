import { pooled } from '../pool';
import type { Rng } from '../../engine/rng';
import {
  columnOpSchema, concatenatedColumns, digit, hasCarry, isOfficial, leftAligned, makeColumnOp, randomWithDigits,
  resultOf, sumWithoutCarry, type ColumnOpItem,
} from '../columnOps';
import { parseWholeNumber } from '../common';
import type { Level, SkillLogic } from '../types';

/**
 * M4 – Column additions: 2 or 3 terms, up to 3 digits, with or without carry.
 * Levels from the score guide: 1 no carry, 2 with carry, 3 three terms of mixed lengths.
 */
function candidate(level: Level, rng: Rng): number[] {
  if (level === 1) {
    const big = rng.chance(0.3) ? 3 : 2;
    return [randomWithDigits(rng, big), randomWithDigits(rng, rng.int(1, 2))];
  }
  if (level === 2) return [randomWithDigits(rng, rng.int(2, 3)), randomWithDigits(rng, 2)];
  return rng.shuffle([randomWithDigits(rng, rng.int(1, 2)), randomWithDigits(rng, 2), randomWithDigits(rng, 3)]);
}

export function generateM4(level: Level, rng: Rng): ColumnOpItem {
  for (;;) {
    const terms = candidate(level, rng);
    const total = terms.reduce((a, b) => a + b, 0);
    if (total > 999 || isOfficial('+', terms)) continue;
    const carry = hasCarry(terms);
    if (level === 1 && carry) continue;
    if (level >= 2 && !carry) continue;
    return makeColumnOp('M4', level, '+', terms);
  }
}

/** First column (from the units) where a carry happens, with its sum. */
function firstCarry(terms: number[]): { position: number; sum: number } | null {
  let carry = 0;
  const width = Math.max(...terms.map((t) => String(t).length));
  for (let p = 0; p < width; p++) {
    const sum = terms.reduce((acc, t) => acc + digit(t, p), 0) + carry;
    if (sum >= 10) return { position: p, sum };
    carry = 0;
  }
  return null;
}

const COLUMN_NAMES = ['unités', 'dizaines', 'centaines'];

export const m4Logic: SkillLogic<ColumnOpItem> = {
  id: 'M4',
  instruction: 'Calcule l’addition posée. Commence par la colonne des unités. Tu peux noter les retenues en touchant les petites cases.',
  avgItemSeconds: 40,
  schema: columnOpSchema,
  generate: pooled(generateM4),
  check: (item, answer) => parseWholeNumber(answer) === resultOf(item),
  expectedAnswer: (item) => String(resultOf(item)),
  correctAnswerLabel: (item) => `${item.terms.join(' + ')} = ${resultOf(item)}`,
  explain(item) {
    const result = resultOf(item);
    const carry = firstCarry(item.terms);
    if (!carry) return `On additionne colonne par colonne, en commençant par les unités : le résultat est ${result}.`;
    return `Dans la colonne des ${COLUMN_NAMES[carry.position]}, ça fait ${carry.sum} : on écrit ${carry.sum % 10} et on retient ${Math.floor(carry.sum / 10)}. Le résultat est ${result}.`;
  },
  classifyError(item, answer) {
    if (m4Logic.check(item, answer)) return null;
    const value = parseWholeNumber(answer);
    if (value === null) return 'no_answer';
    if (value === sumWithoutCarry(item.terms)) return 'forgot_carry';
    if (value === concatenatedColumns(item.terms)) return 'column_concat';
    if (value === leftAligned(item)) return 'misaligned';
    if ([1, 10, 100].includes(Math.abs(value - resultOf(item)))) return 'fact_error';
    return 'other';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Entraînez la technique sur de petites additions sans retenue pour gagner en rapidité et en confiance.',
    },
    forgot_carry: {
      label: 'Oublie la retenue',
      tip: 'Faites écrire la retenue en couleur en haut de la colonne suivante, à chaque fois, même quand c’est évident.',
    },
    column_concat: {
      label: 'Écrit le total de chaque colonne en entier (5 + 7 → 12 dans la colonne)',
      tip: 'Avec des cubes : 12 unités, c’est 1 dizaine et 2 unités. La dizaine monte dans la colonne des dizaines.',
    },
    misaligned: {
      label: 'Nombres mal alignés (les unités ne sont pas sous les unités)',
      tip: 'Posez les additions sur du papier quadrillé, en commençant par écrire les unités les unes sous les autres.',
    },
    fact_error: {
      label: 'Erreur dans un calcul de colonne',
      tip: 'La technique est comprise : revoyez les tables d’addition (exercice M10).',
    },
    other: {
      label: 'Technique de l’addition posée à consolider',
      tip: 'Faites verbaliser chaque étape : « 3 plus 5, 8, j’écris 8 ; 4 plus 3… ».',
    },
  },
  speech: () => null,
};
