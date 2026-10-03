import { z } from 'zod';
import type { Rng } from '../../engine/rng';
import { OFFICIAL_M3_LINES } from '../../content/officialItems';
import { parseWholeNumber } from '../common';
import type { Level, SkillLogic } from '../types';

/**
 * M3 – Number line, official format: the two ends are labelled, there are
 * 2 to 10 intervals, and an arrow points at an empty label on one tick.
 */
export interface M3Item {
  key: string;
  level: Level;
  start: number;
  step: number;
  /** Number of intervals between the two labelled ends. */
  intervals: number;
  /** Indices of the labelled ticks: always the two ends [0, intervals]. */
  labels: [number, number];
  /** Index of the tick pointed by the arrow (never an end). */
  arrow: number;
}

const schema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  start: z.number().int().min(0),
  step: z.number().int().positive(),
  intervals: z.number().int().min(2).max(10),
  labels: z.tuple([z.number().int().min(0), z.number().int().min(0)]),
  arrow: z.number().int().min(1),
});

export const MAX_VALUE = 1000;

export function valueAt(item: M3Item, index: number): number {
  return item.start + index * item.step;
}

export function expectedM3(item: M3Item): number {
  return valueAt(item, item.arrow);
}

interface LineShape {
  step: number;
  intervals: number;
  /** Possible start values. */
  starts: () => number;
}

/**
 * Line shapes per level, following the score guide:
 * 1 – step 1, close bounds, numbers under 100;
 * 2 – step 1 crossing a ten, or step 10;
 * 3 – any step (2, 5, 10, 100), bounds in different tens or hundreds.
 */
function shapesFor(level: Level, rng: Rng): LineShape[] {
  const tens = (min: number, max: number) => () => rng.int(min, max) * 10;
  switch (level) {
    case 1:
      return [
        { step: 1, intervals: 2, starts: () => rng.int(1, 97) },
        { step: 1, intervals: 4, starts: () => rng.int(1, 95) },
        { step: 1, intervals: 5, starts: () => rng.int(1, 94) },
      ];
    case 2:
      return [
        { step: 1, intervals: 10, starts: () => rng.int(11, 89) },
        { step: 1, intervals: 4, starts: () => rng.int(1, 9) * 10 + rng.int(7, 9) },
        { step: 10, intervals: 10, starts: () => 0 },
        { step: 10, intervals: 2, starts: tens(1, 40) },
        { step: 10, intervals: 4, starts: tens(0, 30) },
        { step: 10, intervals: 5, starts: tens(1, 20) },
      ];
    case 3:
      return [
        { step: 2, intervals: 5, starts: () => rng.int(1, 40) * 2 },
        { step: 5, intervals: 4, starts: () => rng.int(0, 30) * 5 },
        { step: 10, intervals: 4, starts: tens(10, 60) },
        { step: 10, intervals: 10, starts: tens(1, 50) },
        { step: 100, intervals: 10, starts: () => 0 },
        { step: 100, intervals: 4, starts: () => rng.int(0, 6) * 100 },
        { step: 1, intervals: 10, starts: () => rng.int(1, 9) * 100 + rng.int(91, 99) - 100 },
      ];
  }
}

export function generateM3(level: Level, rng: Rng): M3Item {
  let shape: LineShape;
  let start: number;
  do {
    shape = rng.pick(shapesFor(level, rng));
    // Keep the whole line within 0..MAX_VALUE.
    start = Math.min(shape.starts(), MAX_VALUE - shape.intervals * shape.step);
    // Never reuse a line of the official assessment.
  } while (OFFICIAL_M3_LINES.includes(`${start}-${start + shape.intervals * shape.step}`));
  const intervals = shape.intervals;
  const labels: [number, number] = [0, intervals];
  const arrow = rng.int(1, intervals - 1);
  return {
    key: `M3:${start}:${shape.step}:${intervals}:${arrow}`,
    level, start, step: shape.step, intervals, labels, arrow,
  };
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
