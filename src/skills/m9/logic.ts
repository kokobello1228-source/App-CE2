import { pooled } from '../pool';
import { z } from 'zod';
import type { Rng } from '../../engine/rng';
import { parseWholeNumber } from '../common';
import type { Level, SkillLogic } from '../types';

/**
 * M9 – Count a collection drawn with base-10 blocks (cube = 1, bar = 10, plate = 100).
 * Blocks may be scattered, a unit may be missing (108), or there may be more
 * than 9 of a unit (12 bars).
 */
export type BlockKind = 'plate' | 'bar' | 'cube';

/** One cell of the drawing grid holds a plate, up to 3 bars or up to 4 cubes. */
export interface Cell {
  col: number;
  row: number;
  kind: BlockKind;
  count: number;
}

export interface M9Item {
  key: string;
  level: Level;
  plates: number;
  bars: number;
  cubes: number;
  cells: Cell[];
}

export const GRID_COLS = 6;
export const GRID_ROWS = 4;
const CAPACITY: Record<BlockKind, number> = { plate: 1, bar: 3, cube: 4 };

const schema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  plates: z.number().int().min(0).max(9),
  bars: z.number().int().min(0).max(19),
  cubes: z.number().int().min(0).max(19),
  cells: z.array(z.object({
    col: z.number().int().min(0).max(GRID_COLS - 1),
    row: z.number().int().min(0).max(GRID_ROWS - 1),
    kind: z.enum(['plate', 'bar', 'cube']),
    count: z.number().int().min(1).max(4),
  })),
});

export function totalOf(item: Pick<M9Item, 'plates' | 'bars' | 'cubes'>): number {
  return item.plates * 100 + item.bars * 10 + item.cubes;
}

/** Splits the blocks into cells, then places the cells in order or scattered. */
function layout(plates: number, bars: number, cubes: number, scattered: boolean, rng: Rng): Cell[] {
  const groups: { kind: BlockKind; count: number }[] = [];
  for (const [kind, total] of [['plate', plates], ['bar', bars], ['cube', cubes]] as [BlockKind, number][]) {
    let left = total;
    while (left > 0) {
      const count = Math.min(CAPACITY[kind], left);
      groups.push({ kind, count });
      left -= count;
    }
  }
  const slots = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => i);
  const positions = scattered ? rng.shuffle(slots) : slots;
  const ordered = scattered ? rng.shuffle(groups) : groups;
  return ordered.map((g, i) => ({ ...g, col: positions[i] % GRID_COLS, row: Math.floor(positions[i] / GRID_COLS) }));
}

/**
 * Levels from the score guide:
 * 1 – under 100, blocks in order;
 * 2 – up to 3 plates, scattered blocks, sometimes a missing unit;
 * 3 – more than 9 bars or cubes, missing unit, scattered.
 */
export function generateM9(level: Level, rng: Rng): M9Item {
  let plates: number;
  let bars: number;
  let cubes: number;
  if (level === 1) {
    plates = 0;
    bars = rng.int(1, 9);
    cubes = rng.int(1, 9);
  } else if (level === 2) {
    plates = rng.int(1, 3);
    bars = rng.chance(0.25) ? 0 : rng.int(1, 9);
    cubes = bars !== 0 && rng.chance(0.25) ? 0 : rng.int(1, 9);
  } else {
    plates = rng.int(0, 4);
    const many = rng.pick(['bars', 'cubes', 'none']);
    bars = many === 'bars' ? rng.int(10, 15) : rng.chance(0.3) ? 0 : rng.int(1, 9);
    cubes = many === 'cubes' ? rng.int(10, 15) : bars === 0 ? rng.int(1, 9) : rng.int(0, 9);
    if (plates === 0 && many === 'none') plates = rng.int(1, 3);
  }
  const cells = layout(plates, bars, cubes, level > 1, rng);
  return { key: `M9:${plates}-${bars}-${cubes}:${level > 1 ? rng.int(0, 999) : 0}`, level, plates, bars, cubes, cells };
}

export const m9Logic: SkillLogic<M9Item> = {
  id: 'M9',
  instruction: 'Une plaque vaut 100 cubes, une barre vaut 10 cubes. Combien y a-t-il de cubes en tout ?',
  avgItemSeconds: 25,
  schema,
  generate: pooled(generateM9),
  check: (item, answer) => parseWholeNumber(answer) === totalOf(item),
  expectedAnswer: (item) => String(totalOf(item)),
  correctAnswerLabel: (item) => String(totalOf(item)),
  explain(item) {
    const parts: string[] = [];
    if (item.plates) parts.push(`${item.plates} plaque${item.plates > 1 ? 's' : ''} (${item.plates * 100})`);
    if (item.bars) parts.push(`${item.bars} barre${item.bars > 1 ? 's' : ''} (${item.bars * 10})`);
    if (item.cubes) parts.push(`${item.cubes} cube${item.cubes > 1 ? 's' : ''} (${item.cubes})`);
    const sum = [item.plates * 100, item.bars * 10, item.cubes].filter(Boolean).join(' + ');
    return `Il y a ${parts.join(', ')} : ${sum} = ${totalOf(item)}.`;
  },
  classifyError(item, answer) {
    if (m9Logic.check(item, answer)) return null;
    const value = parseWholeNumber(answer);
    if (value === null) return 'no_answer';
    const total = totalOf(item);
    if (value === item.plates + item.bars + item.cubes) return 'counted_objects';
    if (String(value) === String(total).split('').reverse().join('')) return 'reversed';
    if ((item.bars > 9 || item.cubes > 9) && value === Number(`${item.plates || ''}${item.bars}${item.cubes}`)) return 'no_regrouping';
    if (String(total).includes('0') && String(value) === String(total).replace(/0/g, '')) return 'missing_zero';
    if ([1, 10, 100].includes(Math.abs(value - total))) return 'counting_slip';
    return 'other';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Avec des objets réels, faites des paquets de 10 puis comptez les paquets : c’est plus rapide qu’un par un.',
    },
    counted_objects: {
      label: 'Compte chaque dessin comme 1 (6 barres et 7 cubes → 13)',
      tip: 'Rappelez la valeur de chaque pièce : une barre, ce sont 10 cubes collés. Comptez de 10 en 10 pour les barres.',
    },
    reversed: {
      label: 'Inverse dizaines et unités (67 → 76)',
      tip: 'Utilisez un tableau dizaines / unités : on écrit d’abord le nombre de barres, puis le nombre de cubes.',
    },
    no_regrouping: {
      label: 'Ne regroupe pas quand il y a plus de 9 barres ou cubes (12 barres → écrit 12 dans les dizaines)',
      tip: 'Faites échanger : 10 barres contre 1 plaque, 10 cubes contre 1 barre, puis recomptez.',
    },
    missing_zero: {
      label: 'Oublie le zéro quand une sorte de pièce manque (108 → 18)',
      tip: 'Dites « 1 centaine, 0 dizaine, 8 unités » et écrivez le 0 pour la case vide.',
    },
    counting_slip: {
      label: 'Erreur de comptage (oubli ou double comptage d’une pièce)',
      tip: 'Apprenez à barrer ou pointer chaque pièce comptée, surtout quand elles sont dispersées.',
    },
    other: {
      label: 'Dénombrement à consolider',
      tip: 'Manipulez du matériel de numération (ou des allumettes en fagots de 10) et comptez ensemble.',
    },
  },
  speech: () => null,
};
