import { z } from 'zod';
import type { Rng } from '../../engine/rng';
import { parseWholeNumber } from '../common';
import type { Level, SkillLogic } from '../types';

/**
 * M10 – Number facts: addition tables up to 10, doubles, complements to 10,
 * missing-term additions (… + 8 = 10).
 */
export type M10Kind = 'add' | 'double' | 'complement' | 'missing';

export interface M10Item {
  key: string;
  level: Level;
  kind: M10Kind;
  a: number;
  b: number;
  total: number;
  /** Which number the child must find. */
  blank: 'a' | 'b' | 'total';
}

const schema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  kind: z.enum(['add', 'double', 'complement', 'missing']),
  a: z.number().int().min(0).max(20),
  b: z.number().int().min(0).max(20),
  total: z.number().int().min(0).max(20),
  blank: z.enum(['a', 'b', 'total']),
});

const KIND_WEIGHTS: Record<Level, [M10Kind, number][]> = {
  1: [['add', 0.5], ['double', 0.25], ['complement', 0.25]],
  2: [['add', 0.4], ['double', 0.15], ['complement', 0.3], ['missing', 0.15]],
  3: [['add', 0.3], ['double', 0.15], ['complement', 0.2], ['missing', 0.35]],
};

function pickKind(level: Level, rng: Rng): M10Kind {
  let roll = rng.next();
  for (const [kind, weight] of KIND_WEIGHTS[level]) {
    if (roll < weight) return kind;
    roll -= weight;
  }
  return 'add';
}

function make(level: Level, kind: M10Kind, a: number, b: number, blank: M10Item['blank']): M10Item {
  const total = a + b;
  return { key: `M10:${kind}:${a}+${b}:${blank}`, level, kind, a, b, total, blank };
}

export function generateM10(level: Level, rng: Rng): M10Item {
  const kind = pickKind(level, rng);
  switch (kind) {
    case 'add': {
      if (level === 1) {
        const a = rng.int(1, 9);
        const b = rng.int(1, 10 - a);
        return make(level, kind, a, b, 'total');
      }
      // Tables up to 10, sometimes with 0 (6 + 0); level 3 favours sums over 10.
      const a = rng.int(level === 3 ? 4 : 2, 10);
      const b = level === 2 && rng.chance(0.1) ? 0 : rng.int(level === 3 ? 4 : 1, 10);
      return rng.chance(0.5) ? make(level, kind, a, b, 'total') : make(level, kind, b, a, 'total');
    }
    case 'double': {
      const n = level === 1 ? rng.int(1, 5) : rng.int(level === 2 ? 2 : 5, 10);
      return make(level, kind, n, n, 'total');
    }
    case 'complement': {
      const a = rng.int(1, 9);
      const blank = level === 1 ? 'b' : rng.pick(['a', 'b'] as const);
      return make(level, kind, a, 10 - a, blank);
    }
    case 'missing': {
      if (level === 2) {
        // Small missing-term additions: 5 + … = 9.
        const small = rng.int(4, 9);
        const a = rng.int(1, small - 1);
        return make(level, kind, a, small - a, rng.pick(['a', 'b'] as const));
      }
      const total = rng.int(11, 20);
      const a = rng.int(total - 10, 10);
      return make(level, kind, a, total - a, rng.pick(['a', 'b'] as const));
    }
  }
}

export function expectedM10(item: M10Item): number {
  return item[item.blank];
}

/** Text shown on screen, e.g. "… + 8 = 10". */
export function displayM10(item: M10Item): string {
  const show = (part: 'a' | 'b' | 'total') => (item.blank === part ? '…' : String(item[part]));
  return `${show('a')} + ${show('b')} = ${show('total')}`;
}

export const m10Logic: SkillLogic<M10Item> = {
  id: 'M10',
  instruction: 'Calcule le plus vite possible et écris le nombre qui manque.',
  avgItemSeconds: 8,
  schema,
  generate: generateM10,
  check: (item, answer) => parseWholeNumber(answer) === expectedM10(item),
  expectedAnswer: (item) => String(expectedM10(item)),
  correctAnswerLabel: (item) => `${item.a} + ${item.b} = ${item.total}`,
  explain(item) {
    const { a, b, total } = item;
    switch (item.kind) {
      case 'double':
        return `Le double de ${a}, c’est ${a} + ${a} = ${total}.`;
      case 'complement':
        return `${a} et ${b} font 10 : ce sont des amis de 10.`;
      case 'missing': {
        const given = item.blank === 'a' ? b : a;
        return `Pour aller de ${given} à ${total}, il faut ajouter ${expectedM10(item)}.`;
      }
      case 'add': {
        if (Math.min(a, b) === 0) return `Ajouter 0 ne change rien : ${a} + ${b} = ${total}.`;
        return `${a} + ${b} = ${total}. Astuce : pars de ${Math.max(a, b)} et avance de ${Math.min(a, b)}.`;
      }
    }
  },
  classifyError(item, answer) {
    if (m10Logic.check(item, answer)) return null;
    const value = parseWholeNumber(answer);
    if (value === null) return 'no_answer';
    if (item.blank !== 'total' && value === item.total) return 'wrote_total';
    if (item.kind === 'complement') return 'complement';
    if (item.kind === 'double') return 'double';
    if (Math.abs(value - expectedM10(item)) === 1) return 'off_by_one';
    return 'other';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Les faits numériques doivent devenir automatiques : 2 minutes par jour de jeu de cartes « amis de 10 » ou de doubles suffisent.',
    },
    wrote_total: {
      label: 'Écrit le total au lieu du nombre manquant (… + 8 = 10 → 10)',
      tip: 'Lisez ensemble le calcul à trou à voix haute : « combien faut-il ajouter à 8 pour avoir 10 ? ». Manipulez avec des jetons.',
    },
    complement: {
      label: 'Compléments à 10 pas encore mémorisés',
      tip: 'Utilisez les 10 doigts : montrez 7 doigts, combien en manque-t-il pour 10 ? Jouez à le dire de plus en plus vite.',
    },
    double: {
      label: 'Doubles pas encore mémorisés',
      tip: 'Récitez les doubles comme une comptine (1+1, 2+2…) et utilisez les dés : deux dés identiques.',
    },
    off_by_one: {
      label: 'Erreur d’une unité (compte sur les doigts)',
      tip: 'Signe d’un comptage un par un. Encouragez à partir du plus grand nombre et à mémoriser les sommes fréquentes.',
    },
    other: {
      label: 'Erreur de calcul',
      tip: 'Revoyez les tables d’addition avec des cartes : un calcul au recto, le résultat au verso.',
    },
  },
  speech: () => null,
};
