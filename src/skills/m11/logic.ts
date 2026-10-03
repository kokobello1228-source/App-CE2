import type { z } from 'zod';
import { OFFICIAL_M11_FACTS } from '../../content/officialItems';
import type { Rng } from '../../engine/rng';
import { additionFactSchema, displayFact, expectedFact, makeFact, type AdditionFact } from '../additionFact';
import { parseWholeNumber } from '../common';
import type { Level, SkillLogic } from '../types';

/**
 * M11 – Mental calculation procedures: + 9, + 19, adding whole tens,
 * completing to the next ten, 2-digit additions, missing terms (results < 100).
 */
export type M11Kind = 'small' | 'tens' | 'nextTen' | 'plus9' | 'plus19' | 'twoDigits' | 'missing';

export interface M11Item extends AdditionFact {
  kind: M11Kind;
}

const KINDS: [M11Kind, ...M11Kind[]] = ['small', 'tens', 'nextTen', 'plus9', 'plus19', 'twoDigits', 'missing'];
const schema = additionFactSchema(KINDS, 99) as z.ZodType<M11Item>;

const KINDS_BY_LEVEL: Record<Level, M11Kind[]> = {
  1: ['small', 'small', 'tens', 'nextTen'],
  2: ['small', 'tens', 'nextTen', 'plus9', 'twoDigits', 'missing'],
  3: ['tens', 'plus9', 'plus19', 'twoDigits', 'missing', 'missing'],
};

function make(level: Level, kind: M11Kind, a: number, b: number, blank: AdditionFact['blank'] = 'total'): M11Item {
  return makeFact('M11', level, kind, a, b, blank);
}

function build(level: Level, kind: M11Kind, rng: Rng): M11Item {
  switch (kind) {
    case 'small': {
      // Adding 1 to 5; crossing the ten from level 2 (27 + 5).
      const b = rng.int(1, 5);
      const tens = rng.int(1, 8) * 10;
      const units = level === 1 ? rng.int(0, 9 - b) : rng.int(5, 9);
      return make(level, kind, tens + units, b);
    }
    case 'tens': {
      const b = rng.int(1, level === 1 ? 3 : 5) * 10;
      const a = rng.int(10, 99 - b);
      return make(level, kind, a, b);
    }
    case 'nextTen': {
      const a = rng.int(1, 8) * 10 + rng.int(1, 9);
      return make(level, kind, a, 10 - (a % 10));
    }
    case 'plus9':
      return make(level, kind, rng.int(12, 89), 9);
    case 'plus19':
      return make(level, kind, rng.int(12, 79), 19);
    case 'twoDigits': {
      // No carry: units and tens add up below 10.
      const a1 = rng.int(1, 7);
      const b1 = rng.int(1, 8 - a1);
      const a0 = rng.int(0, 8);
      const b0 = rng.int(1, 9 - a0);
      return make(level, kind, a1 * 10 + a0, b1 * 10 + b0);
    }
    case 'missing': {
      if (level === 2) {
        // 41 + … = 49
        const a = rng.int(2, 8) * 10 + rng.int(0, 5);
        return make(level, kind, a, rng.int(2, 9 - (a % 10)), 'b');
      }
      // 3 + … = 76 or … + 10 = 45
      if (rng.chance(0.5)) {
        const a = rng.int(2, 8);
        const total = rng.int(2, 9) * 10 + rng.int(a + 1, 9);
        return make(level, kind, a, total - a, 'b');
      }
      const b = rng.pick([1, 2, 10, 20]);
      return make(level, kind, rng.int(11, 99 - b), b, 'a');
    }
  }
}

export function generateM11(level: Level, rng: Rng): M11Item {
  for (;;) {
    const item = build(level, rng.pick(KINDS_BY_LEVEL[level]), rng);
    if (!OFFICIAL_M11_FACTS.includes(displayFact(item)) && item.total < 100) return item;
  }
}

export const m11Logic: SkillLogic<M11Item> = {
  id: 'M11',
  instruction: 'Calcule dans ta tête le plus vite possible et écris le nombre qui manque.',
  avgItemSeconds: 10,
  schema,
  generate: generateM11,
  check: (item, answer) => parseWholeNumber(answer) === expectedFact(item),
  expectedAnswer: (item) => String(expectedFact(item)),
  correctAnswerLabel: (item) => `${item.a} + ${item.b} = ${item.total}`,
  explain(item) {
    const { a, b, total } = item;
    switch (item.kind) {
      case 'plus9':
        return `Ajouter 9, c’est ajouter 10 puis enlever 1 : ${a} + 10 = ${a + 10}, puis ${a + 10} − 1 = ${total}.`;
      case 'plus19':
        return `Ajouter 19, c’est ajouter 20 puis enlever 1 : ${a} + 20 = ${a + 20}, puis ${a + 20} − 1 = ${total}.`;
      case 'tens':
        return `On ajoute ${b / 10} dizaine${b > 10 ? 's' : ''} : les unités ne bougent pas, ${a} + ${b} = ${total}.`;
      case 'nextTen':
        return `Il manque ${b} pour aller de ${a} à la dizaine suivante, ${total}.`;
      case 'twoDigits':
        return `On ajoute les dizaines puis les unités : ${a} + ${b} = ${total}.`;
      case 'missing': {
        const given = item.blank === 'a' ? b : a;
        return `Pour aller de ${given} à ${total}, il faut ajouter ${expectedFact(item)}.`;
      }
      case 'small':
        return a % 10 + b >= 10
          ? `On passe la dizaine : ${a} + ${10 - (a % 10)} = ${a + 10 - (a % 10)}, puis encore ${b - 10 + (a % 10)}, ça fait ${total}.`
          : `${a} + ${b} = ${total} : on avance de ${b} à partir de ${a}.`;
    }
  },
  classifyError(item, answer) {
    if (m11Logic.check(item, answer)) return null;
    const value = parseWholeNumber(answer);
    if (value === null) return 'no_answer';
    if (item.blank !== 'total' && value === item.total) return 'wrote_total';
    const diff = Math.abs(value - expectedFact(item));
    if ((item.kind === 'plus9' || item.kind === 'plus19') && diff === 1) return 'plus9_adjust';
    if (diff % 10 === 0) return 'tens_error';
    if (diff === 1) return 'off_by_one';
    return 'other';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Le calcul mental se travaille par petites séries quotidiennes : 5 calculs du même type, à l’oral, en voiture ou à table.',
    },
    wrote_total: {
      label: 'Écrit le total au lieu du nombre manquant',
      tip: 'Faites lire le calcul à trou à voix haute : « combien faut-il ajouter à 41 pour avoir 49 ? ».',
    },
    plus9_adjust: {
      label: 'Erreur d’une unité sur + 9 ou + 19 (oubli d’enlever 1)',
      tip: 'Expliquez avec des pièces : ajouter 9 €, c’est donner un billet de 10 € et rendre 1 €.',
    },
    tens_error: {
      label: 'Erreur sur les dizaines',
      tip: 'Comptez de 10 en 10 à partir de n’importe quel nombre (23, 33, 43…) pour voir que les unités ne changent pas.',
    },
    off_by_one: {
      label: 'Erreur d’une unité (comptage un par un)',
      tip: 'Encouragez à passer par la dizaine : 27 + 5, c’est 27 + 3 = 30, puis + 2.',
    },
    other: {
      label: 'Procédure de calcul à consolider',
      tip: 'Demandez à l’enfant d’expliquer comment il a calculé : cela révèle la procédure à corriger.',
    },
  },
  speech: () => null,
};
