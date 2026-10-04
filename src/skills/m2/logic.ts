import { pooled } from '../pool';
import { z } from 'zod';
import { NAMES, TEMPLATES, type ProblemType } from '../../content/fr/m2Templates';
import type { Rng } from '../../engine/rng';
import type { Choice, Level, SkillLogic } from '../types';

/**
 * M2 – Word problems read aloud twice and displayed; answer among 6 numbers.
 * Types from the official guide: parts-whole, transformation (initial or final
 * state), two-step additive, one-step multiplicative, sharing.
 */
export interface M2Item {
  key: string;
  level: Level;
  type: ProblemType;
  text: string;
  answer: number;
  /** Numbers written in the statement. */
  given: number[];
  /** Result of the most likely wrong operation. */
  wrongOperation: number;
  /** Intermediate result of a two-step problem. */
  partial: number | null;
  choices: number[];
}

const TYPES = Object.keys(TEMPLATES) as [ProblemType, ...ProblemType[]];

const schema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  type: z.enum(TYPES),
  text: z.string().min(20),
  answer: z.number().int().positive(),
  given: z.array(z.number().int().positive()),
  wrongOperation: z.number().int(),
  partial: z.number().int().nullable(),
  choices: z.array(z.number().int().nonnegative()).length(6),
});

/**
 * Levels from the score guide:
 * 1 – one-step transformations (final state) and parts-whole, small numbers;
 * 2 – all one-step additive problems (incl. initial state), multiplicative, bigger numbers;
 * 3 – two-step additive problems and sharing.
 */
const TYPES_BY_LEVEL: Record<Level, ProblemType[]> = {
  1: ['combine', 'gain', 'loss', 'gain', 'loss'],
  2: ['combine', 'missingPart', 'initialLoss', 'initialGain', 'multiply', 'loss'],
  3: ['twoStepBus', 'twoStepPrice', 'twoStepChange', 'quotition', 'partition', 'multiply', 'initialLoss'],
};

interface Numbers {
  a: number;
  b: number;
  c: number;
  t: number;
  answer: number;
  wrongOperation: number;
  partial: number | null;
  given: number[];
}

function numbersFor(type: ProblemType, level: Level, rng: Rng): Numbers {
  const big = level >= 2;
  const n2 = () => rng.int(big ? 21 : 11, big ? 89 : 49);
  const empty = { a: 0, b: 0, c: 0, t: 0, partial: null };
  switch (type) {
    case 'combine':
    case 'gain': {
      const a = type === 'combine' && big && rng.chance(0.4) ? rng.int(101, 199) : n2();
      const b = rng.int(big ? 12 : 3, big ? 79 : 30);
      return { ...empty, a, b, answer: a + b, wrongOperation: Math.abs(a - b), given: [a, b] };
    }
    case 'missingPart':
    case 'loss': {
      const a = big ? rng.int(40, 99) : rng.int(20, 69);
      const b = rng.int(big ? 12 : 3, a - 5);
      return { ...empty, a, b, answer: a - b, wrongOperation: a + b, given: [a, b] };
    }
    case 'initialLoss': {
      const b = rng.int(5, 29);
      const c = rng.int(12, 69);
      return { ...empty, b, c, answer: c + b, wrongOperation: Math.abs(c - b), given: [b, c] };
    }
    case 'initialGain': {
      const b = rng.int(5, 29);
      const c = rng.int(b + 8, 89);
      return { ...empty, b, c, answer: c - b, wrongOperation: c + b, given: [b, c] };
    }
    case 'twoStepBus': {
      const a = rng.int(30, 69);
      const b = rng.int(8, a - 10);
      const c = rng.int(5, 25);
      return { ...empty, a, b, c, answer: a - b + c, wrongOperation: a + b + c, partial: a - b, given: [a, b, c] };
    }
    case 'twoStepPrice': {
      const a = rng.int(10, 30);
      const b = rng.int(5, 20);
      const x = rng.int(3, 20);
      const t = a + b + x;
      return { ...empty, a, b, t, answer: x, wrongOperation: t + a + b, partial: t - a, given: [a, b, t] };
    }
    case 'twoStepChange': {
      const a = rng.int(3, 15);
      const b = rng.int(2, 12);
      const t = a + b < 18 ? rng.pick([20, 50]) : 50;
      return { ...empty, a, b, t, answer: t - a - b, wrongOperation: a + b, partial: t - a, given: [a, b, t] };
    }
    case 'multiply': {
      const a = rng.int(3, 9);
      const b = rng.pick([2, 3, 4, 5, 10]);
      return { ...empty, a, b, answer: a * b, wrongOperation: a + b, given: [a, b] };
    }
    case 'quotition': {
      const b = rng.pick([2, 3, 4, 5, 6, 10]);
      const answer = rng.int(3, 9);
      const t = answer * b;
      return { ...empty, b, t, answer, wrongOperation: t - b, given: [t, b] };
    }
    case 'partition': {
      const a = rng.pick([2, 3, 4, 5]);
      const answer = rng.int(3, 9);
      const t = answer * a;
      return { ...empty, a, t, answer, wrongOperation: t - a, given: [t, a] };
    }
  }
}

/** Five wrong answers drawn from typical errors, most likely first. */
export function m2Distractors(n: Pick<Numbers, 'answer' | 'given' | 'wrongOperation' | 'partial'>): number[] {
  const { answer } = n;
  const pool = [
    n.wrongOperation, ...(n.partial !== null ? [n.partial] : []), ...n.given,
    answer + 1, answer - 1, answer + 10, answer - 10, answer + 2, answer - 2, answer + 11, answer + 20,
  ];
  return pool.filter((v, i) => v > 0 && v !== answer && pool.indexOf(v) === i).slice(0, 5);
}

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
}

export function generateM2(level: Level, rng: Rng): M2Item {
  const type = rng.pick(TYPES_BY_LEVEL[level]);
  const numbers = numbersFor(type, level, rng);
  const person = rng.pick(NAMES);
  const templateIndex = rng.int(0, TEMPLATES[type].length - 1);
  const text = fill(TEMPLATES[type][templateIndex], {
    N: person.name, il: person.f ? 'elle' : 'il', Il: person.f ? 'Elle' : 'Il',
    a: numbers.a, b: numbers.b, c: numbers.c, t: numbers.t,
  });
  return {
    key: `M2:${type}:${templateIndex}:${numbers.given.join('-')}`,
    level,
    type,
    text,
    answer: numbers.answer,
    given: numbers.given,
    wrongOperation: numbers.wrongOperation,
    partial: numbers.partial,
    choices: rng.shuffle([numbers.answer, ...m2Distractors(numbers)]),
  };
}

function explainM2(item: M2Item): string {
  const [x, y, z3] = item.given;
  const r = item.answer;
  switch (item.type) {
    case 'combine':
      return `On réunit les deux groupes : ${x} + ${y} = ${r}.`;
    case 'gain':
      return `On en ajoute, donc il y en a plus à la fin : ${x} + ${y} = ${r}.`;
    case 'missingPart':
      return `On enlève la partie connue du total : ${x} − ${y} = ${r}.`;
    case 'loss':
      return `On en enlève, donc il en reste moins : ${x} − ${y} = ${r}.`;
    case 'initialLoss':
      return `Avant d’en perdre ${x}, il y en avait plus : on ajoute ${y} + ${x} = ${r}.`;
    case 'initialGain':
      return `Avant d’en recevoir ${x}, il y en avait moins : on enlève ${y} − ${x} = ${r}.`;
    case 'twoStepBus':
      return `D’abord ${x} − ${y} = ${x - y}, puis ${x - y} + ${z3} = ${r}.`;
    case 'twoStepPrice':
      return `Les deux premiers achats coûtent ${x} + ${y} = ${x + y} euros, donc le dernier coûte ${z3} − ${x + y} = ${r} euros.`;
    case 'twoStepChange':
      return `Les fruits coûtent ${x} + ${y} = ${x + y} euros, on rend ${z3} − ${x + y} = ${r} euros.`;
    case 'multiply':
      return `Il y a ${x} groupes de ${y} : ${x} × ${y} = ${r}.`;
    case 'quotition':
      return `On fait des paquets de ${y} dans ${x} : ${r} paquets, car ${r} × ${y} = ${x}.`;
    case 'partition':
      return `On partage ${x} en ${y} parts égales : chacun reçoit ${r}, car ${y} × ${r} = ${x}.`;
  }
}

export const m2Logic: SkillLogic<M2Item> = {
  id: 'M2',
  instruction: 'Écoute bien le problème. Il est lu deux fois. Tu peux chercher dans le brouillon, puis choisis le bon nombre.',
  avgItemSeconds: 70,
  schema,
  generate: pooled(generateM2),
  check: (item, answer) => Number(answer) === item.answer && answer !== '',
  expectedAnswer: (item) => String(item.answer),
  correctAnswerLabel: (item) => String(item.answer),
  explain: explainM2,
  classifyError(item, answer) {
    if (m2Logic.check(item, answer)) return null;
    const value = Number(answer);
    if (answer === '' || Number.isNaN(value)) return 'no_answer';
    if (item.partial !== null && value === item.partial) return 'one_step_only';
    if (value === item.wrongOperation) return 'wrong_operation';
    if (item.given.includes(value)) return 'number_from_text';
    if ([1, 2, 10, 11, 20].includes(Math.abs(value - item.answer))) return 'calculation';
    return 'other';
  },
  errorTags: {
    no_answer: {
      label: 'Pas de réponse dans le temps',
      tip: 'Lisez le problème ensemble et faites-le raconter avec ses mots avant de chercher.',
    },
    wrong_operation: {
      label: 'Choisit la mauvaise opération (ajoute au lieu d’enlever, ou l’inverse)',
      tip: 'Faites mimer ou dessiner la situation. Attention aux mots pièges : « perdu » ne veut pas toujours dire soustraire (« il a perdu 9 billes, il lui en reste 34 : combien avant ? »).',
    },
    number_from_text: {
      label: 'Recopie un nombre de l’énoncé',
      tip: 'Demandez toujours « qu’est-ce qu’on cherche ? » avant de calculer, et vérifiez que la réponse a du sens.',
    },
    one_step_only: {
      label: 'S’arrête après la première étape d’un problème à deux étapes',
      tip: 'Relisez la question à la fin : « as-tu bien répondu à ce qu’on demande ? ». Faites un schéma en deux temps.',
    },
    calculation: {
      label: 'Bon raisonnement mais erreur de calcul',
      tip: 'Le problème est compris ; consolidez le calcul (tables, calcul posé) et la vérification.',
    },
    other: {
      label: 'Modélisation du problème à consolider',
      tip: 'Utilisez des objets ou un dessin en barres (une barre pour le tout, des morceaux pour les parties).',
    },
  },
  speech: (item) => `${item.text} Je répète. ${item.text}`,
  choices: (item): Choice[] => item.choices.map((n) => ({ id: String(n), label: String(n) })),
};
