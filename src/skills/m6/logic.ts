import { pooled } from '../pool';
import { z } from 'zod';
import { OFFICIAL_M6_TEXTS } from '../../content/officialItems';
import type { Rng } from '../../engine/rng';
import type { Choice, Level, SkillLogic } from '../types';

/**
 * M6 – Recognise a number from its decomposition in units of numeration
 * ("3 dizaines + 4 unités + 6 centaines"), 4 choices.
 */
export type Unit = 'c' | 'd' | 'u';

export interface Part {
  unit: Unit;
  count: number;
}

export interface M6Item {
  key: string;
  level: Level;
  parts: Part[];
  choices: number[];
}

const schema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  parts: z.array(z.object({ unit: z.enum(['c', 'd', 'u']), count: z.number().int().min(1).max(99) })).min(1).max(3),
  choices: z.array(z.number().int().min(0)).length(4),
});

const VALUE: Record<Unit, number> = { c: 100, d: 10, u: 1 };
const NAMES: Record<Unit, [string, string]> = {
  c: ['centaine', 'centaines'],
  d: ['dizaine', 'dizaines'],
  u: ['unité', 'unités'],
};

export function valueOf(parts: Part[]): number {
  return parts.reduce((acc, p) => acc + p.count * VALUE[p.unit], 0);
}

export function partsText(parts: Part[]): string {
  return parts.map((p) => `${p.count} ${NAMES[p.unit][p.count > 1 ? 1 : 0]}`).join(' + ');
}

/**
 * Levels from the score guide:
 * 1 – positional order, all counts under 10;
 * 2 – mixed order;
 * 3 – a missing unit (6 unités + 3 centaines) or more than 9 of a unit (50 dizaines).
 */
function drawParts(level: Level, rng: Rng): Part[] {
  const n = () => rng.int(1, 9);
  if (level === 1) {
    return rng.chance(0.5)
      ? [{ unit: 'c', count: n() }, { unit: 'd', count: n() }, { unit: 'u', count: n() }]
      : [{ unit: 'd', count: n() }, { unit: 'u', count: n() }];
  }
  if (level === 2) {
    const parts: Part[] = rng.chance(0.6)
      ? [{ unit: 'c', count: n() }, { unit: 'd', count: n() }, { unit: 'u', count: n() }]
      : [{ unit: 'd', count: n() }, { unit: 'u', count: n() }];
    let shuffled = rng.shuffle(parts);
    while (shuffled.map((p) => p.unit).join('') === parts.map((p) => p.unit).join('')) shuffled = rng.shuffle(parts);
    return shuffled;
  }
  return rng.pick<() => Part[]>([
    () => rng.shuffle([{ unit: 'u', count: n() }, { unit: 'c', count: n() }]), // 306
    () => rng.shuffle([{ unit: 'd', count: n() }, { unit: 'c', count: n() }]), // 360
    () => [{ unit: 'd', count: rng.int(1, 9) * 10 }], // 50 dizaines
    () => [{ unit: 'u', count: rng.int(11, 39) }, { unit: 'd', count: n() }], // 33 unités + 4 dizaines
    () => [{ unit: 'd', count: n() }, { unit: 'u', count: rng.int(1, 4) * 10 }], // 5 dizaines + 20 unités
    () => rng.shuffle([{ unit: 'd', count: rng.int(11, 19) }, { unit: 'u', count: n() }]), // 14 dizaines + 3 unités
    () => rng.shuffle([{ unit: 'u', count: rng.int(11, 39) }, { unit: 'd', count: n() }, { unit: 'c', count: n() }]),
  ])();
}

/** Typical wrong answers, most frequent first. */
export function distractors(parts: Part[]): number[] {
  const answer = valueOf(parts);
  const readingOrder = Number(parts.map((p) => p.count).join(''));
  const positional = Number(
    (['c', 'd', 'u'] as Unit[]).map((u) => parts.find((p) => p.unit === u)?.count ?? '').join(''),
  );
  const sum = parts.reduce((acc, p) => acc + p.count, 0);
  const valuesConcat = Number(parts.map((p) => p.count * VALUE[p.unit]).join(''));
  const reversed = Number(String(answer).split('').reverse().join(''));
  const pool = [readingOrder, positional, sum, valuesConcat, answer * 10, Math.floor(answer / 10), reversed,
    answer + 100, answer - 10, answer + 10, answer + 1];
  return pool.filter((v, i) => v > 0 && v !== answer && pool.indexOf(v) === i);
}

export function generateM6(level: Level, rng: Rng): M6Item {
  let parts: Part[];
  do parts = drawParts(level, rng);
  while (OFFICIAL_M6_TEXTS.includes(partsText(parts)));
  const answer = valueOf(parts);
  const wrong = distractors(parts).slice(0, 3);
  return {
    key: `M6:${parts.map((p) => `${p.count}${p.unit}`).join('+')}`,
    level,
    parts,
    choices: rng.shuffle([answer, ...wrong]),
  };
}

function orderedText(parts: Part[]): string {
  const answer = valueOf(parts);
  return `${Math.floor(answer / 100)} centaines, ${Math.floor((answer % 100) / 10)} dizaines et ${answer % 10} unités`;
}

export const m6Logic: SkillLogic<M6Item> = {
  id: 'M6',
  instruction: 'Écoute la décomposition. Trouve le nombre qui correspond.',
  avgItemSeconds: 18,
  schema,
  generate: pooled(generateM6),
  check: (item, answer) => Number(answer) === valueOf(item.parts),
  expectedAnswer: (item) => String(valueOf(item.parts)),
  correctAnswerLabel: (item) => String(valueOf(item.parts)),
  explain(item) {
    const answer = valueOf(item.parts);
    const big = item.parts.find((p) => p.count > 9);
    if (big) {
      const value = big.count * VALUE[big.unit];
      const name = NAMES[big.unit][1];
      return `${big.count} ${name}, c’est ${value}. On ajoute le reste : ça fait ${answer}.`;
    }
    return `On range dans l’ordre : ${orderedText(item.parts)}. C’est ${answer}.`;
  },
  classifyError(item, answer) {
    if (m6Logic.check(item, answer)) return null;
    const value = Number(answer);
    if (answer === '' || Number.isNaN(value)) return 'no_answer';
    const parts = item.parts;
    if (value === Number(parts.map((p) => p.count).join(''))) return 'reading_order';
    if (value === parts.reduce((acc, p) => acc + p.count, 0)) return 'sum_of_counts';
    if (parts.some((p) => p.count > 9)) return 'decimal_aspect';
    if (parts.length < 3 && String(valueOf(parts)).includes('0')) return 'missing_zero';
    return 'other';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Manipulez avec des cubes, barres et plaques (ou des pièces de 1, 10 et 100) pour fabriquer des nombres.',
    },
    reading_order: {
      label: 'Écrit les chiffres dans l’ordre où il les entend (6 unités + 8 dizaines → 68)',
      tip: 'Utilisez un tableau centaines / dizaines / unités : on place chaque nombre dans sa colonne avant de lire.',
    },
    sum_of_counts: {
      label: 'Additionne les nombres sans tenir compte des unités (3 dizaines + 4 unités → 7)',
      tip: 'Rappelez qu’une dizaine vaut 10 : 3 dizaines, ce sont 3 paquets de 10.',
    },
    decimal_aspect: {
      label: 'Ne convertit pas 10 unités en 1 dizaine (50 dizaines, 20 unités…)',
      tip: 'Faites des échanges : 10 cubes contre 1 barre, 10 barres contre 1 plaque. 50 dizaines = 5 plaques = 500.',
    },
    missing_zero: {
      label: 'Oublie le zéro quand une unité manque (6 unités + 3 centaines → 36)',
      tip: 'Dans le tableau, faites écrire 0 dans la colonne vide.',
    },
    other: {
      label: 'Numération à consolider',
      tip: 'Jouez à la « banque » : composez des nombres avec des pièces de 1, 10 et 100.',
    },
  },
  speech: (item) => `${partsText(item.parts)}. Quel est ce nombre ?`,
  choices: (item): Choice[] => item.choices.map((n) => ({ id: String(n), label: String(n) })),
};
