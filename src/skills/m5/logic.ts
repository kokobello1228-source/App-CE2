import { pooled } from '../pool';
import type { Rng } from '../../engine/rng';
import {
  columnOpSchema, digit, digitCount, isOfficial, leftAligned, makeColumnOp, randomWithDigits, resultOf,
  type ColumnOpItem,
} from '../columnOps';
import { parseWholeNumber } from '../common';
import type { Level, SkillLogic } from '../types';

/** M5 – Column subtractions without borrowing (every digit on top is the larger one). */
function noBorrow(a: number, b: number): boolean {
  for (let p = 0; p < digitCount(a); p++) if (digit(a, p) < digit(b, p)) return false;
  return a > b;
}

const SHAPES: Record<Level, [number, number][]> = {
  1: [[2, 1], [2, 2]],
  2: [[3, 2], [3, 1]],
  3: [[3, 3], [3, 2]],
};

export function generateM5(level: Level, rng: Rng): ColumnOpItem {
  for (;;) {
    const [da, db] = rng.pick(SHAPES[level]);
    const a = randomWithDigits(rng, da);
    const b = randomWithDigits(rng, db);
    if (!noBorrow(a, b) || isOfficial('-', [a, b])) continue;
    return makeColumnOp('M5', level, '-', [a, b]);
  }
}

export const m5Logic: SkillLogic<ColumnOpItem> = {
  id: 'M5',
  instruction: 'Calcule la soustraction posée. Commence par la colonne des unités.',
  avgItemSeconds: 35,
  schema: columnOpSchema,
  generate: pooled(generateM5),
  check: (item, answer) => parseWholeNumber(answer) === resultOf(item),
  expectedAnswer: (item) => String(resultOf(item)),
  correctAnswerLabel: (item) => `${item.terms[0]} − ${item.terms[1]} = ${resultOf(item)}`,
  explain(item) {
    const [a, b] = item.terms;
    const steps = Array.from({ length: digitCount(a) }, (_, p) => `${digit(a, p)} − ${digit(b, p)} = ${digit(a, p) - digit(b, p)}`);
    return `On soustrait colonne par colonne, en commençant par les unités : ${steps.join(', ')}. Le résultat est ${resultOf(item)}.`;
  },
  classifyError(item, answer) {
    if (m5Logic.check(item, answer)) return null;
    const value = parseWholeNumber(answer);
    if (value === null) return 'no_answer';
    if (value === item.terms[0] + item.terms[1]) return 'added';
    if (value === leftAligned(item)) return 'misaligned';
    if ([1, 10, 100].includes(Math.abs(value - resultOf(item)))) return 'fact_error';
    return 'other';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Entraînez la technique sur des soustractions de nombres à 2 chiffres, en verbalisant chaque colonne.',
    },
    added: {
      label: 'Additionne au lieu de soustraire',
      tip: 'Avant de calculer, faites entourer le signe et dire à voix haute « moins ».',
    },
    misaligned: {
      label: 'Nombres mal alignés',
      tip: 'Utilisez du papier quadrillé et un tableau centaines / dizaines / unités pour poser l’opération.',
    },
    fact_error: {
      label: 'Erreur dans un calcul de colonne',
      tip: 'Revoyez les compléments : 7 − 4, c’est « combien pour aller de 4 à 7 ? ».',
    },
    other: {
      label: 'Technique de la soustraction à consolider',
      tip: 'Faites vérifier le résultat par une addition : résultat + nombre du bas = nombre du haut.',
    },
  },
  speech: () => null,
};
