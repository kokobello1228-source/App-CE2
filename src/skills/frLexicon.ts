/**
 * Small French lexicon used by the generated grammar exercises (F9, F12, F13).
 * Only regular, frequent words that an 8-year-old knows.
 */

// Conjugation (F9)

export type Person = 0 | 1 | 2 | 3 | 4 | 5; // je, tu, il, nous, vous, ils
export type F9Tense = 'present' | 'imparfait' | 'futur' | 'passe_compose';

export interface Subject {
  text: string;
  person: Person;
}

export const SUBJECTS: Subject[] = [
  { text: 'je', person: 0 }, { text: 'tu', person: 1 }, { text: 'il', person: 2 }, { text: 'elle', person: 2 },
  { text: 'Léa', person: 2 }, { text: 'le chat', person: 2 }, { text: 'mon frère', person: 2 },
  { text: 'nous', person: 3 }, { text: 'vous', person: 4 }, { text: 'ils', person: 5 }, { text: 'elles', person: 5 },
  { text: 'les enfants', person: 5 }, { text: 'mes amis', person: 5 },
];

const ETRE: Record<F9Tense, string[]> = {
  present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
  imparfait: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
  futur: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
  passe_compose: ['ai été', 'as été', 'a été', 'avons été', 'avez été', 'ont été'],
};
const AVOIR: Record<F9Tense, string[]> = {
  present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
  imparfait: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
  futur: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
  passe_compose: ['ai eu', 'as eu', 'a eu', 'avons eu', 'avez eu', 'ont eu'],
};

/** Regular first-group verbs with a complement that needs no agreement. */
export const VERBS: { infinitive: string; complements: string[] }[] = [
  { infinitive: 'être', complements: ['en retard', 'à la maison', 'dans le jardin', 'au marché', 'en vacances'] },
  { infinitive: 'avoir', complements: ['un chat', 'faim', 'une bonne idée', 'de la chance', 'un vélo rouge'] },
  { infinitive: 'chanter', complements: ['une chanson'] },
  { infinitive: 'jouer', complements: ['au ballon', 'aux cartes'] },
  { infinitive: 'regarder', complements: ['les étoiles', 'un dessin animé'] },
  { infinitive: 'préparer', complements: ['une tarte', 'le goûter'] },
  { infinitive: 'danser', complements: ['dans la cour'] },
  { infinitive: 'parler', complements: ['à la maîtresse'] },
  { infinitive: 'dessiner', complements: ['un château'] },
  { infinitive: 'porter', complements: ['un sac', 'un manteau'] },
  { infinitive: 'couper', complements: ['le pain'] },
  { infinitive: 'laver', complements: ['la voiture'] },
  { infinitive: 'écouter', complements: ['de la musique'] },
  { infinitive: 'aimer', complements: ['les fraises'] },
  { infinitive: 'ramasser', complements: ['des feuilles'] },
  { infinitive: 'fermer', complements: ['la porte'] },
  { infinitive: 'visiter', complements: ['le musée'] },
  { infinitive: 'sauter', complements: ['dans les flaques'] },
];

const PRESENT_ENDINGS = ['e', 'es', 'e', 'ons', 'ez', 'ent'];
const IMPARFAIT_ENDINGS = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
const FUTUR_ENDINGS = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];

export function conjugate(infinitive: string, tense: F9Tense, person: Person): string {
  if (infinitive === 'être') return ETRE[tense][person];
  if (infinitive === 'avoir') return AVOIR[tense][person];
  const stem = infinitive.slice(0, -2);
  switch (tense) {
    case 'present':
      return stem + PRESENT_ENDINGS[person];
    case 'imparfait':
      return stem + IMPARFAIT_ENDINGS[person];
    case 'futur':
      return infinitive + FUTUR_ENDINGS[person];
    case 'passe_compose':
      return `${AVOIR.present[person]} ${stem}é`;
  }
}

/** "je" + "ai" -> "j’ai"; capital letter at the start of the sentence. */
export function clause(subject: Subject, verbForm: string): string {
  const elide = subject.text === 'je' && /^[aeiouéèêh]/i.test(verbForm);
  const text = elide ? `j’${verbForm}` : `${subject.text} ${verbForm}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Noun groups (F12, F13)

export type Gender = 'm' | 'f';

export interface Noun {
  word: string;
  gender: Gender;
  plural?: string;
}

export const NOUNS: Noun[] = [
  { word: 'chat', gender: 'm' }, { word: 'chien', gender: 'm' }, { word: 'ballon', gender: 'm' },
  { word: 'crayon', gender: 'm' }, { word: 'livre', gender: 'm' }, { word: 'vélo', gender: 'm' },
  { word: 'chapeau', gender: 'm', plural: 'chapeaux' }, { word: 'gâteau', gender: 'm', plural: 'gâteaux' },
  { word: 'manteau', gender: 'm', plural: 'manteaux' }, { word: 'sac', gender: 'm' }, { word: 'cahier', gender: 'm' },
  { word: 'pull', gender: 'm' }, { word: 'camion', gender: 'm' }, { word: 'bateau', gender: 'm', plural: 'bateaux' },
  { word: 'jardin', gender: 'm' }, { word: 'cartable', gender: 'm' },
  { word: 'robe', gender: 'f' }, { word: 'maison', gender: 'f' }, { word: 'voiture', gender: 'f' },
  { word: 'fleur', gender: 'f' }, { word: 'pomme', gender: 'f' }, { word: 'table', gender: 'f' },
  { word: 'chemise', gender: 'f' }, { word: 'porte', gender: 'f' }, { word: 'tasse', gender: 'f' },
  { word: 'jupe', gender: 'f' }, { word: 'fenêtre', gender: 'f' }, { word: 'poupée', gender: 'f' },
  { word: 'valise', gender: 'f' }, { word: 'montagne', gender: 'f' }, { word: 'trousse', gender: 'f' },
  { word: 'chaussure', gender: 'f' },
];

export function nounForm(noun: Noun, plural: boolean): string {
  return plural ? noun.plural ?? `${noun.word}s` : noun.word;
}

export interface Adjective {
  /** [masculine singular, feminine singular, masculine plural, feminine plural] */
  forms: [string, string, string, string];
  position: 'before' | 'after';
  /** The feminine is heard at the oral (vert / verte) or not (bleu / bleue). */
  audible: boolean;
}

export const ADJECTIVES: Adjective[] = [
  { forms: ['vert', 'verte', 'verts', 'vertes'], position: 'after', audible: true },
  { forms: ['rond', 'ronde', 'ronds', 'rondes'], position: 'after', audible: true },
  { forms: ['blanc', 'blanche', 'blancs', 'blanches'], position: 'after', audible: true },
  { forms: ['lourd', 'lourde', 'lourds', 'lourdes'], position: 'after', audible: true },
  { forms: ['chaud', 'chaude', 'chauds', 'chaudes'], position: 'after', audible: true },
  { forms: ['noir', 'noire', 'noirs', 'noires'], position: 'after', audible: false },
  { forms: ['bleu', 'bleue', 'bleus', 'bleues'], position: 'after', audible: false },
  { forms: ['mouillé', 'mouillée', 'mouillés', 'mouillées'], position: 'after', audible: false },
  { forms: ['petit', 'petite', 'petits', 'petites'], position: 'before', audible: true },
  { forms: ['grand', 'grande', 'grands', 'grandes'], position: 'before', audible: true },
  { forms: ['long', 'longue', 'longs', 'longues'], position: 'before', audible: true },
  { forms: ['joli', 'jolie', 'jolis', 'jolies'], position: 'before', audible: false },
];

export function adjectiveForm(adj: Adjective, gender: Gender, plural: boolean): string {
  return adj.forms[(gender === 'f' ? 1 : 0) + (plural ? 2 : 0)];
}

export const DETERMINERS: Record<Gender, string[]> = { m: ['le', 'un', 'mon', 'ce'], f: ['la', 'une', 'ma', 'cette'] };
export const PLURAL_DETERMINERS = ['les', 'des', 'mes', 'ces'];

export function determiner(gender: Gender, plural: boolean, pick: <T>(items: readonly T[]) => T): string {
  return pick(plural ? PLURAL_DETERMINERS : DETERMINERS[gender]);
}

export const PROPER_NOUNS = ['Léa', 'Sami', 'Inès', 'Hugo', 'Aya', 'Noah', 'Jade', 'Malik', 'Paris', 'Lyon', 'Marseille', 'Toulouse'];
