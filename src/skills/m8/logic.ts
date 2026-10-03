import { z } from 'zod';
import type { Rng } from '../../engine/rng';
import { drawFraction, fractionWords } from '../fractions';
import type { Choice, Level, SkillLogic } from '../types';

/**
 * M8 – Represent fractions: the fraction is heard; pick among 4 figures the one
 * whose grey part matches. Traps: unequal parts, wrong number of parts,
 * complementary colouring.
 */
export type Shape = 'disc' | 'bar';

export interface Figure {
  shape: Shape;
  /** Relative sizes of the parts (all equal for a correct partition). */
  sizes: number[];
  /** Indices of the grey parts. */
  shaded: number[];
}

export interface M8Item {
  key: string;
  level: Level;
  n: number;
  d: number;
  figures: Figure[];
}

const figureSchema = z.object({
  shape: z.enum(['disc', 'bar']),
  sizes: z.array(z.number().positive()).min(2).max(12),
  shaded: z.array(z.number().int().min(0)),
});
const schema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  n: z.number().int().min(1).max(10),
  d: z.number().int().min(2).max(10),
  figures: z.array(figureSchema).length(4),
});

function equalParts(f: Figure): boolean {
  return f.sizes.every((s) => s === f.sizes[0]);
}

/** True when the figure shows n/d: d equal parts, n of them grey. */
export function represents(f: Figure, n: number, d: number): boolean {
  return equalParts(f) && f.sizes.length === d && f.shaded.length === n;
}

/** A distractor must not show an equivalent fraction either (2/4 for 1/2). */
function ambiguous(f: Figure, n: number, d: number): boolean {
  return equalParts(f) && f.shaded.length * d === n * f.sizes.length;
}

function figure(shape: Shape, sizes: number[], shadedCount: number, rng: Rng): Figure {
  // Grey parts are contiguous for bars (as in the booklet) and start at a random slice for discs.
  const start = shape === 'disc' ? rng.int(0, sizes.length - 1) : 0;
  const shaded = Array.from({ length: shadedCount }, (_, i) => (start + i) % sizes.length);
  return { shape, sizes, shaded };
}

const equal = (count: number) => Array.from({ length: count }, () => 1);

function unequal(count: number, rng: Rng): number[] {
  for (;;) {
    const sizes = Array.from({ length: count }, () => rng.int(1, 3));
    if (!sizes.every((s) => s === sizes[0])) return sizes;
  }
}

type Trap = 'unequal' | 'moreParts' | 'fewerParts' | 'complement' | 'double';

export function generateM8(level: Level, rng: Rng): M8Item {
  const { n, d } = level === 1 ? { n: 1, d: rng.pick([2, 3, 4]) } : drawFraction(level, rng);
  const baseShape: Shape = rng.pick(['disc', 'bar']);
  const shapeFor = () => (level === 3 ? rng.pick<Shape>(['disc', 'bar']) : baseShape);
  const traps: Trap[] =
    level === 1 ? ['moreParts', 'fewerParts', 'complement', 'double'] : ['unequal', 'moreParts', 'complement', 'fewerParts', 'double'];
  const wrong: Figure[] = [];
  for (const trap of rng.shuffle(traps)) {
    if (wrong.length === 3) break;
    let f: Figure | null = null;
    if (trap === 'unequal') f = figure(shapeFor(), unequal(d, rng), n, rng);
    if (trap === 'moreParts') f = figure(shapeFor(), equal(d + rng.int(1, 2)), n, rng);
    if (trap === 'fewerParts' && d - 1 > n) f = figure(shapeFor(), equal(d - 1), n, rng);
    if (trap === 'complement' && d - n !== n) f = figure(shapeFor(), equal(d), d - n, rng);
    if (trap === 'double' && 2 * d <= 12) f = figure(shapeFor(), equal(2 * d), n, rng);
    if (f && !ambiguous(f, n, d)) wrong.push(f);
  }
  while (wrong.length < 3) {
    const f = figure(shapeFor(), equal(d + 2 + wrong.length), n, rng);
    if (!ambiguous(f, n, d)) wrong.push(f);
  }
  const correct = figure(shapeFor(), equal(d), n, rng);
  return { key: `M8:${n}/${d}:${rng.int(0, 9999)}`, level, n, d, figures: rng.shuffle([correct, ...wrong]) };
}

export const m8Logic: SkillLogic<M8Item> = {
  id: 'M8',
  instruction: 'Écoute la fraction. Trouve la figure dont la partie grise correspond à cette fraction.',
  avgItemSeconds: 20,
  schema,
  generate: generateM8,
  check: (item, answer) => {
    const f = item.figures[Number(answer)];
    return answer !== '' && f !== undefined && represents(f, item.n, item.d);
  },
  expectedAnswer: (item) => String(item.figures.findIndex((f) => represents(f, item.n, item.d))),
  correctAnswerLabel: (item) => `la figure partagée en ${item.d} parts égales avec ${item.n} part${item.n > 1 ? 's' : ''} grise${item.n > 1 ? 's' : ''}`,
  explain(item) {
    return `${fractionWords(item)} : la figure doit être partagée en ${item.d} parts égales, et ${item.n} part${item.n > 1 ? 's sont grises' : ' est grise'}.`;
  },
  classifyError(item, answer) {
    if (m8Logic.check(item, answer)) return null;
    const f = item.figures[Number(answer)];
    if (answer === '' || !f) return 'no_answer';
    if (!equalParts(f)) return 'unequal_parts';
    if (f.sizes.length !== item.d) return 'wrong_part_count';
    return 'complement';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Pliez des bandes de papier en 2, 3, 4 parts égales et coloriez des fractions ensemble.',
    },
    unequal_parts: {
      label: 'Choisit une figure aux parts inégales',
      tip: 'Insistez : une fraction n’a de sens que si les parts sont toutes pareilles (partage équitable d’un gâteau).',
    },
    wrong_part_count: {
      label: 'Ne vérifie pas le nombre total de parts',
      tip: 'Faites compter toutes les parts avant les parts grises : le nombre du bas doit correspondre.',
    },
    complement: {
      label: 'Regarde les parts blanches au lieu des parts grises',
      tip: 'Rappelez que la fraction décrit la partie coloriée : « on a colorié 2 parts sur 5 ».',
    },
  },
  speech: (item) => `Dans quel cas a-t-on colorié ${fractionWords(item)} de la figure en gris ?`,
  choices: (item): Choice[] => item.figures.map((_, i) => ({ id: String(i), label: `Figure ${i + 1}` })),
};
