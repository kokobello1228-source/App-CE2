import type { Rng } from '../../engine/rng';
import { ADJECTIVES, adjectiveForm, determiner, NOUNS, nounForm, PROPER_NOUNS } from '../frLexicon';
import { createQcmSkill, type QcmItem } from '../qcm';
import type { Level } from '../types';

/**
 * F13 – Word classes: a word is underlined; choose déterminant, nom commun,
 * adjectif or nom propre (official order of the choices).
 * Levels from the score guide: 1 proper and common nouns; 2 + determiners; 3 + adjectives.
 */
export const CLASSES = ['déterminant', 'nom commun', 'adjectif', 'nom propre'] as const;
type WordClass = (typeof CLASSES)[number];

const PEOPLE = PROPER_NOUNS.slice(0, 8);
const CITIES = PROPER_NOUNS.slice(8);

const TARGETS: Record<1 | 2 | 3, WordClass[]> = {
  1: ['nom propre', 'nom commun', 'nom commun'],
  2: ['nom propre', 'nom commun', 'déterminant', 'déterminant'],
  3: ['adjectif', 'adjectif', 'déterminant', 'nom commun', 'nom propre'],
};

const VERBS = ['regarde', 'dessine', 'cherche', 'range', 'prend', 'montre'];

const EXPLAIN: Record<WordClass, (word: string, noun: string) => string> = {
  'nom propre': (w) => `« ${w} » commence par une majuscule : c’est un nom propre, le nom d’une personne ou d’un lieu.`,
  'nom commun': (w) => `« ${w} » est un nom commun : on peut mettre « le », « la » ou « un » devant.`,
  déterminant: (w, n) => `« ${w} » est un déterminant : c’est le petit mot placé devant le nom « ${n} ».`,
  adjectif: (w, n) => `« ${w} » est un adjectif : il dit comment est « ${n} ».`,
};

export function generateF13(level: Level, rng: Rng): QcmItem {
  const target = rng.pick(TARGETS[level]);
  const noun = rng.pick(NOUNS);
  const plural = level === 3 && rng.chance(0.4);
  const adjective = rng.pick(ADJECTIVES);
  const det = determiner(noun.gender, plural, rng.pick);
  const nounText = nounForm(noun, plural);
  const adj = adjectiveForm(adjective, noun.gender, plural);
  const person = rng.pick(PEOPLE);
  const mark = (cls: WordClass, word: string) => (cls === target ? `[${word}]` : word);
  const group =
    adjective.position === 'before'
      ? `${mark('déterminant', det)} ${mark('adjectif', adj)} ${mark('nom commun', nounText)}`
      : `${mark('déterminant', det)} ${mark('nom commun', nounText)} ${mark('adjectif', adj)}`;
  const useCity = target === 'nom propre' && rng.chance(0.4);
  const city = rng.pick(CITIES);
  const stem = useCity
    ? `${person} ${rng.pick(VERBS)} ${group} à [${city}].`
    : `${mark('nom propre', person)} ${rng.pick(VERBS)} ${group}.`;
  const word = { 'nom propre': useCity ? city : person, 'nom commun': nounText, déterminant: det, adjectif: adj }[target];
  const sentence = stem.charAt(0).toUpperCase() + stem.slice(1);
  return {
    key: `F13:${sentence}`,
    level,
    id: target,
    stem: sentence,
    question: 'Le mot souligné est :',
    choices: [...CLASSES],
    answer: target,
    tag: target,
    say: `${sentence.replace(/[[\]]/g, '')} Le mot souligné est : ${word}.`,
    explanation: EXPLAIN[target](word, nounText),
  };
}

export const f13Logic = createQcmSkill({
  id: 'F13',
  instruction: 'Écoute la phrase. Un mot est souligné : est-ce un déterminant, un nom commun, un adjectif ou un nom propre ?',
  avgItemSeconds: 14,
  generate: generateF13,
  classify: (item, answer) => `${item.answer}→${answer}`,
  errorTags: Object.fromEntries(
    CLASSES.flatMap((expected) =>
      CLASSES.filter((c) => c !== expected).map((chosen) => [
        `${expected}→${chosen}`,
        {
          label: `Prend un ${expected} pour un ${chosen}`,
          tip:
            expected === 'adjectif'
              ? 'L’adjectif dit comment est la chose : on peut le retirer et la phrase reste correcte (« un ballon rouge » → « un ballon »).'
              : expected === 'déterminant'
                ? 'Le déterminant est le petit mot devant le nom : le, la, les, un, une, des, mon, ce…'
                : expected === 'nom propre'
                  ? 'Le nom propre commence par une majuscule, même au milieu de la phrase.'
                  : 'Le nom commun désigne une chose ou un animal : on peut mettre « un » ou « une » devant.',
        },
      ]),
    ),
  ),
});
