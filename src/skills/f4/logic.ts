import { z } from 'zod';
import type { Rng } from '../../engine/rng';
import type { Choice, Level, SkillLogic } from '../types';

/**
 * F4 – Understand heard sentences: a sentence is heard; choose the matching
 * picture among 4. Structures from the guide: negation, spatial words, passive
 * voice, relative clauses. Pictures are composed from simple elements so that
 * exactly one of them matches.
 */
export const ANIMALS = [
  { id: 'chat', emoji: '🐱', det: 'le', f: false },
  { id: 'chien', emoji: '🐶', det: 'le', f: false },
  { id: 'lapin', emoji: '🐰', det: 'le', f: false },
  { id: 'ours', emoji: '🐻', det: 'l’', f: false },
  { id: 'souris', emoji: '🐭', det: 'la', f: true },
  { id: 'grenouille', emoji: '🐸', det: 'la', f: true },
] as const;
export type AnimalId = (typeof ANIMALS)[number]['id'];

export const OBJECTS = [
  { id: 'boîte', emoji: '📦', det: 'la' },
  { id: 'chaise', emoji: '🪑', det: 'la' },
  { id: 'parasol', emoji: '⛱️', det: 'le' },
] as const;
export type ObjectId = (typeof OBJECTS)[number]['id'];
export type Relation = 'sur' | 'sous' | 'à côté de';

/** A picture: one animal (maybe with a hat) placed relative to an object, or two animals walking in a line. */
export type Scene =
  | { type: 'place'; animal: AnimalId; hat: boolean; object: ObjectId; relation: Relation }
  | { type: 'line'; front: AnimalId; back: AnimalId };

export type Fact =
  | { kind: 'spatial'; animal: AnimalId; relation: Relation; object: ObjectId }
  | { kind: 'negation'; animal: AnimalId }
  | { kind: 'relative'; animal: AnimalId; relation: Relation; object: ObjectId }
  | { kind: 'passive'; followed: AnimalId; follower: AnimalId };

export interface F4Item {
  key: string;
  level: Level;
  sentence: string;
  fact: Fact;
  scenes: Scene[];
}

const animalIds = ANIMALS.map((a) => a.id) as [AnimalId, ...AnimalId[]];
const objectIds = OBJECTS.map((o) => o.id) as [ObjectId, ...ObjectId[]];
const relationSchema = z.enum(['sur', 'sous', 'à côté de']);
const sceneSchema = z.union([
  z.object({ type: z.literal('place'), animal: z.enum(animalIds), hat: z.boolean(), object: z.enum(objectIds), relation: relationSchema }),
  z.object({ type: z.literal('line'), front: z.enum(animalIds), back: z.enum(animalIds) }),
]);
const factSchema = z.union([
  z.object({ kind: z.literal('spatial'), animal: z.enum(animalIds), relation: relationSchema, object: z.enum(objectIds) }),
  z.object({ kind: z.literal('negation'), animal: z.enum(animalIds) }),
  z.object({ kind: z.literal('relative'), animal: z.enum(animalIds), relation: relationSchema, object: z.enum(objectIds) }),
  z.object({ kind: z.literal('passive'), followed: z.enum(animalIds), follower: z.enum(animalIds) }),
]);
const schema = z.object({
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  sentence: z.string(),
  fact: factSchema,
  scenes: z.array(sceneSchema).length(4),
});

/** Objects that make sense with each relation (an animal is not "under a box"). */
const OBJECTS_FOR: Record<Relation, ObjectId[]> = {
  sur: ['boîte', 'chaise'],
  sous: ['chaise', 'parasol'],
  'à côté de': ['boîte', 'chaise', 'parasol'],
};

const animal = (id: AnimalId) => ANIMALS.find((a) => a.id === id)!;
const object = (id: ObjectId) => OBJECTS.find((o) => o.id === id)!;
const withDet = (det: string, word: string) => (det.endsWith('’') ? `${det}${word}` : `${det} ${word}`);
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const prep = (relation: Relation, o: ObjectId) =>
  relation === 'à côté de' ? (object(o).det === 'le' ? `à côté du ${o}` : `à côté de la ${o}`) : `${relation} ${withDet(object(o).det, o)}`;

export function satisfies(scene: Scene, fact: Fact): boolean {
  switch (fact.kind) {
    case 'spatial':
      return scene.type === 'place' && scene.animal === fact.animal && scene.relation === fact.relation && scene.object === fact.object;
    case 'negation':
      return scene.type === 'place' && scene.animal === fact.animal && !scene.hat;
    case 'relative':
      return scene.type === 'place' && scene.animal === fact.animal && scene.hat && scene.relation === fact.relation && scene.object === fact.object;
    case 'passive':
      return scene.type === 'line' && scene.front === fact.followed && scene.back === fact.follower;
  }
}

export function sentenceOf(fact: Fact): string {
  const a = (id: AnimalId) => withDet(animal(id).det, id);
  switch (fact.kind) {
    case 'spatial':
      return `${capital(a(fact.animal))} est ${prep(fact.relation, fact.object)}.`;
    case 'negation':
      return `${capital(a(fact.animal))} n’a pas de chapeau.`;
    case 'relative':
      return `${capital(a(fact.animal))} qui a un chapeau est ${prep(fact.relation, fact.object)}.`;
    case 'passive':
      return `${capital(a(fact.followed))} est ${animal(fact.followed).f ? 'suivie' : 'suivi'} par ${a(fact.follower)}.`;
  }
}

const KINDS: Record<Level, Fact['kind'][]> = {
  1: ['spatial', 'spatial', 'negation'],
  2: ['spatial', 'negation', 'relative'],
  3: ['passive', 'passive', 'relative', 'negation'],
};

function randomFact(level: Level, rng: Rng): Fact {
  const kind = rng.pick(KINDS[level]);
  const a = rng.pick(animalIds);
  const relation: Relation = level === 1 ? rng.pick<Relation>(['sur', 'sous']) : rng.pick<Relation>(['sur', 'sous', 'à côté de']);
  const o = rng.pick(OBJECTS_FOR[relation]);
  switch (kind) {
    case 'spatial':
      return { kind, animal: a, relation, object: o };
    case 'negation':
      return { kind, animal: a };
    case 'relative':
      return { kind, animal: a, relation, object: o };
    case 'passive':
      return { kind, followed: a, follower: rng.pick(animalIds.filter((x) => x !== a)) };
  }
}

/** Correct picture and close distractors (one change each). */
function candidates(fact: Fact, rng: Rng): Scene[] {
  const other = (a: AnimalId) => rng.pick(animalIds.filter((x) => x !== a));
  const otherRelation = (r: Relation) => rng.pick((['sur', 'sous', 'à côté de'] as Relation[]).filter((x) => x !== r));
  const place = (a: AnimalId, hat: boolean, relation: Relation, o: ObjectId): Scene => ({
    type: 'place', animal: a, hat, relation, object: OBJECTS_FOR[relation].includes(o) ? o : OBJECTS_FOR[relation][0],
  });
  switch (fact.kind) {
    case 'spatial': {
      const r1 = otherRelation(fact.relation);
      return [
        place(fact.animal, false, fact.relation, fact.object),
        place(fact.animal, false, r1, fact.object),
        place(fact.animal, false, otherRelation(fact.relation), fact.object),
        place(other(fact.animal), false, fact.relation, fact.object),
        place(fact.animal, false, r1 === 'sur' ? 'sous' : 'sur', fact.object),
      ];
    }
    case 'negation': {
      const r = rng.pick<Relation>(['sur', 'sous', 'à côté de']);
      const o = rng.pick(OBJECTS_FOR[r]);
      const b = other(fact.animal);
      return [place(fact.animal, false, r, o), place(fact.animal, true, r, o), place(b, true, r, o), place(b, false, r, o)];
    }
    case 'relative':
      return [
        place(fact.animal, true, fact.relation, fact.object),
        place(fact.animal, false, fact.relation, fact.object),
        place(fact.animal, true, otherRelation(fact.relation), fact.object),
        place(other(fact.animal), true, fact.relation, fact.object),
        place(fact.animal, false, otherRelation(fact.relation), fact.object),
      ];
    case 'passive': {
      const c = rng.pick(animalIds.filter((x) => x !== fact.followed && x !== fact.follower));
      return [
        { type: 'line', front: fact.followed, back: fact.follower },
        { type: 'line', front: fact.follower, back: fact.followed },
        { type: 'line', front: fact.followed, back: c },
        { type: 'line', front: c, back: fact.follower },
      ];
    }
  }
}

const sceneKey = (s: Scene) => JSON.stringify(s);

export function generateF4(level: Level, rng: Rng): F4Item {
  for (;;) {
    const fact = randomFact(level, rng);
    const [correct, ...rest] = candidates(fact, rng);
    if (!satisfies(correct, fact)) continue;
    const seen = new Set([sceneKey(correct)]);
    const wrong: Scene[] = [];
    for (const s of rest) {
      if (wrong.length === 3) break;
      if (satisfies(s, fact) || seen.has(sceneKey(s))) continue;
      seen.add(sceneKey(s));
      wrong.push(s);
    }
    if (wrong.length < 3) continue;
    const sentence = sentenceOf(fact);
    return { key: `F4:${sentence}`, level, sentence, fact, scenes: rng.shuffle([correct, ...wrong]) };
  }
}

/** Words for a picture, shown as the right answer in the feedback. */
export function describeScene(scene: Scene): string {
  const a = (id: AnimalId) => withDet(animal(id).det, id);
  if (scene.type === 'line') return `${a(scene.front)} devant, ${a(scene.back)} derrière`;
  return `${a(scene.animal)} ${scene.hat ? 'avec' : 'sans'} chapeau, ${prep(scene.relation, scene.object)}`;
}

function explainF4(item: F4Item): string {
  const f = item.fact;
  switch (f.kind) {
    case 'spatial':
      return `« ${item.sentence} » : regarde bien où se trouve l’animal, ${prep(f.relation, f.object)}.`;
    case 'negation':
      return `« n’a pas de chapeau » : il faut trouver ${withDet(animal(f.animal).det, f.animal)} sans chapeau.`;
    case 'relative':
      return `Il faut ${withDet(animal(f.animal).det, f.animal)} qui porte un chapeau, et il est ${prep(f.relation, f.object)}.`;
    case 'passive':
      return `« ${item.sentence} » : c’est ${withDet(animal(f.follower).det, f.follower)} qui marche derrière ; ${withDet(animal(f.followed).det, f.followed)} est devant.`;
  }
}

export const f4Logic: SkillLogic<F4Item> = {
  id: 'F4',
  instruction: 'Écoute bien la phrase. Choisis l’image qui correspond à la phrase.',
  avgItemSeconds: 15,
  schema: schema as z.ZodType<F4Item>,
  generate: generateF4,
  check: (item, answer) => {
    const scene = item.scenes[Number(answer)];
    return answer !== '' && scene !== undefined && satisfies(scene, item.fact);
  },
  expectedAnswer: (item) => String(item.scenes.findIndex((s) => satisfies(s, item.fact))),
  correctAnswerLabel: (item) => describeScene(item.scenes.find((sc) => satisfies(sc, item.fact))!),
  explain: explainF4,
  classifyError(item, answer) {
    if (f4Logic.check(item, answer)) return null;
    if (item.scenes[Number(answer)] === undefined || answer === '') return 'no_answer';
    return item.fact.kind;
  },
  errorTags: {
    no_answer: { label: 'Pas de réponse dans le temps', tip: 'Faites réécouter la phrase et décrire l’image choisie avec ses mots.' },
    spatial: {
      label: 'Termes spatiaux mal compris (sur, sous, à côté de)',
      tip: 'Jouez à cacher un jouet « sous », « sur », « à côté de » la chaise et faites dire où il est.',
    },
    negation: {
      label: 'Ne tient pas compte de la négation (« n’a pas »)',
      tip: 'Insistez sur les petits mots « ne… pas » : faites répéter la phrase en tapant dans les mains sur « pas ».',
    },
    passive: {
      label: 'Phrase passive mal comprise (« est suivi par »)',
      tip: 'Mimez ensemble : « le chien est suivi par le chat » → qui marche devant ? Transformez en « le chat suit le chien ».',
    },
    relative: {
      label: 'Phrase longue avec « qui » mal comprise',
      tip: 'Découpez la phrase : « le chat qui a un chapeau » (lequel ?), puis « est sur la boîte » (où ?).',
    },
  },
  speech: (item) => `${item.sentence} Je répète : ${item.sentence}`,
  choices: (item): Choice[] => item.scenes.map((_, i) => ({ id: String(i), label: `Image ${i + 1}` })),
};
