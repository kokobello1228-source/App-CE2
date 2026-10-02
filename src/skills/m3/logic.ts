import { z } from 'zod';
import type { Rng } from '../../engine/rng';
import { parseWholeNumber } from '../common';
import type { Level, SkillLogic } from '../types';

/**
 * M3 – Number line: a graduated line with two labelled ticks and an arrow.
 * The child deduces the step and writes the number shown by the arrow.
 */
export interface M3Item {
  key: string;
  level: Level;
  start: number;
  step: number;
  /** Number of intervals between the first and the last tick. */
  intervals: number;
  /** Indices of the labelled ticks (exactly two). */
  labels: [number, number];
  /** Index of the tick pointed by the arrow. */
  arrow: number;
}

const schema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  start: z.number().int().min(0),
  step: z.number().int().positive(),
  intervals: z.number().int().min(4).max(12),
  labels: z.tuple([z.number().int().min(0), z.number().int().min(0)]),
  arrow: z.number().int().min(0),
});

export const MAX_VALUE = 1000;

export function valueAt(item: M3Item, index: number): number {
  return item.start + index * item.step;
}

export function expectedM3(item: M3Item): number {
  return valueAt(item, item.arrow);
}

function make(level: Level, start: number, step: number, intervals: number, labels: [number, number], arrow: number): M3Item {
  return {
    key: `M3:${start}:${step}:${intervals}:${labels.join(',')}:${arrow}`,
    level, start, step, intervals, labels, arrow,
  };
}

function pickArrow(rng: Rng, intervals: number, labels: [number, number]): number {
  const candidates: number[] = [];
  for (let i = 1; i < intervals; i++) if (!labels.includes(i)) candidates.push(i);
  return rng.pick(candidates);
}

export function generateM3(level: Level, rng: Rng): M3Item {
  if (level === 1) {
    // Step 1, labels at both ends; start is 0 half of the time.
    const start = rng.chance(0.5) ? 0 : rng.int(1, 9) * 10;
    const labels: [number, number] = [0, 10];
    return make(level, start, 1, 10, labels, pickArrow(rng, 10, labels));
  }
  if (level === 2) {
    const step = rng.pick([1, 2, 5, 10]);
    const startChoices: Record<number, number[]> = {
      1: [0, 10, 30, 50, 80],
      2: [0, 0, 20, 40],
      5: [0, 0, 50, 100],
      10: [0, 0, 100, 200, 500],
    };
    const start = rng.pick(startChoices[step]);
    const labels: [number, number] = rng.chance(0.7) ? [0, 10] : [0, 5];
    return make(level, start, step, 10, labels, pickArrow(rng, 10, labels));
  }
  // Level 3: bigger steps, non-zero start, labels not always at the ends.
  const step = rng.pick([2, 5, 10, 10, 100]);
  const intervals = step === 100 ? rng.pick([8, 10]) : rng.pick([8, 10, 10, 12]);
  // Keep the whole line within 0..MAX_VALUE.
  const maxStartIndex = Math.floor((MAX_VALUE - intervals * step) / step);
  const upper = Math.min(maxStartIndex, step === 2 ? 50 : 60);
  const lower = Math.min(step === 100 ? 0 : 1, upper);
  const start = rng.int(lower, upper) * step;
  const gap = rng.pick([2, 4, 5]);
  const first = rng.int(0, intervals - gap);
  const labels: [number, number] = [first, first + gap];
  return make(level, start, step, intervals, labels, pickArrow(rng, intervals, labels));
}

/** Labelled tick closest to the arrow, used as the starting point of the explanation. */
function nearestLabel(item: M3Item): number {
  const [l1, l2] = item.labels;
  return Math.abs(item.arrow - l1) <= Math.abs(item.arrow - l2) ? l1 : l2;
}

export const m3Logic: SkillLogic<M3Item> = {
  id: 'M3',
  instruction: 'Regarde bien la ligne graduée. Écris le nombre qui correspond à la flèche.',
  avgItemSeconds: 25,
  schema,
  generate: generateM3,
  check: (item, answer) => parseWholeNumber(answer) === expectedM3(item),
  expectedAnswer: (item) => String(expectedM3(item)),
  correctAnswerLabel: (item) => String(expectedM3(item)),
  explain(item) {
    const [l1, l2] = item.labels;
    const ref = nearestLabel(item);
    const distance = Math.abs(item.arrow - ref);
    const direction = item.arrow > ref ? 'après' : 'avant';
    const stepPart =
      l2 - l1 === 1
        ? `Entre deux traits, on avance de ${item.step}.`
        : `De ${valueAt(item, l1)} à ${valueAt(item, l2)}, il y a ${l2 - l1} bonds, donc chaque bond vaut ${item.step}.`;
    const traits = distance === 1 ? 'trait' : 'traits';
    return `${stepPart} La flèche est ${distance} ${traits} ${direction} ${valueAt(item, ref)} : c’est ${expectedM3(item)}.`;
  },
  classifyError(item, answer) {
    if (m3Logic.check(item, answer)) return null;
    const value = parseWholeNumber(answer);
    if (value === null) return 'no_answer';
    const expected = expectedM3(item);
    const ref = nearestLabel(item);
    if (item.step !== 1 && value === valueAt(item, ref) + (item.arrow - ref)) return 'counted_by_one';
    if (item.start !== 0 && value === item.arrow * item.step) return 'ignored_start';
    if (Math.abs(value - expected) === item.step) return 'off_by_one_tick';
    return 'other';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse',
      tip: 'Reprenez une ligne graduée simple de 0 à 10 et faites avancer un petit objet de trait en trait en comptant.',
    },
    counted_by_one: {
      label: 'Compte les graduations de 1 en 1 alors que le pas est différent',
      tip: 'Avant de répondre, demandez toujours : « de combien avance-t-on d’un trait à l’autre ? ». Comptez ensemble de 5 en 5, de 10 en 10.',
    },
    ignored_start: {
      label: 'Oublie que la ligne ne commence pas à 0',
      tip: 'Montrez une règle qui commence à 20 (comme un mètre coupé) : on part du premier nombre écrit, pas de zéro.',
    },
    off_by_one_tick: {
      label: 'Se trompe d’une graduation',
      tip: 'Faites pointer chaque trait avec le doigt en comptant ; attention à ne pas compter le trait de départ.',
    },
    other: {
      label: 'Lecture de la ligne graduée à consolider',
      tip: 'Dessinez des lignes graduées dans la vie courante (thermomètre, règle, frise des jours) et cherchez des nombres manquants.',
    },
  },
  speech: () => null,
};
