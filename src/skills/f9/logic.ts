import type { Rng } from '../../engine/rng';
import { confusionTag, TENSE_LABELS } from '../f8/logic';
import { clause, conjugate, SUBJECTS, VERBS, type F9Tense, type Subject } from '../frLexicon';
import { createQcmSkill, type QcmItem } from '../qcm';
import type { Level } from '../types';

/**
 * F9 – Recognise the form of a verb at a given tense: four sentences that only
 * differ by the tense; find the one at the requested tense (être, avoir, 1st group).
 */
const TENSES: F9Tense[] = ['present', 'imparfait', 'futur', 'passe_compose'];

/** Requested tense by level, from the score guide: present, then future, then imparfait. */
const ASKED: Record<Level, F9Tense[]> = {
  1: ['present', 'present', 'present', 'present', 'futur'],
  2: ['futur', 'futur', 'present', 'imparfait'],
  3: ['imparfait', 'imparfait', 'futur', 'present'],
};

function subjectsFor(level: Level): Subject[] {
  if (level === 1) return SUBJECTS.filter((s) => s.person <= 2);
  if (level === 2) return SUBJECTS;
  return SUBJECTS.filter((s) => s.person >= 3);
}

const TENSE_TIPS: Record<F9Tense, string> = {
  present: 'Le présent dit ce qui se passe maintenant',
  imparfait: 'À l’imparfait, le verbe finit par -ais, -ait, -ions, -iez ou -aient',
  futur: 'Au futur, on entend un « r » avant la fin du verbe',
  passe_compose: 'Le passé composé a deux mots',
};

export function generateF9(level: Level, rng: Rng): QcmItem {
  const verb = level === 1 && rng.chance(0.5) ? rng.pick(VERBS.slice(0, 2)) : rng.pick(VERBS);
  const subject = rng.pick(subjectsFor(level));
  const complement = rng.pick(verb.complements);
  const asked = rng.pick(ASKED[level]);
  const sentenceFor = (tense: F9Tense) => `${clause(subject, conjugate(verb.infinitive, tense, subject.person))} ${complement}.`;
  const answer = sentenceFor(asked);
  const order = rng.shuffle(TENSES);
  return {
    key: `F9:${verb.infinitive}:${subject.text}:${complement}:${asked}`,
    level,
    id: verb.infinitive,
    stem: `La phrase avec le verbe « **${verb.infinitive}** » ${asked === 'imparfait' ? 'à l’' : 'au '}${TENSE_LABELS[asked].replace(/^l’|^le /, '')} est :`,
    question: '',
    choices: order.map(sentenceFor),
    answer,
    tag: asked,
    say: `La phrase avec le verbe ${verb.infinitive} ${asked === 'imparfait' ? 'à l’' : 'au '}${TENSE_LABELS[asked].replace(/^l’|^le /, '')} est :`,
    explanation: `${TENSE_TIPS[asked]} : « ${answer} »`,
  };
}

export const f9Logic = createQcmSkill({
  id: 'F9',
  instruction: 'Écoute bien. Les 4 phrases sont presque pareilles, seul le temps change. Trouve la phrase au temps demandé.',
  avgItemSeconds: 22,
  generate: generateF9,
  readChoices: true,
  speech: (item) => `${item.say} ${item.choices.join(' ; ')}`,
  classify(item, answer) {
    const asked = item.tag as F9Tense;
    // Compound tense first: "a eu" also contains the present "a".
    const chosen = (['passe_compose', 'imparfait', 'futur', 'present'] as F9Tense[]).find((t) =>
      answerMatchesTense(answer, item.id, t),
    );
    return chosen && chosen !== asked ? confusionTag(asked, chosen) : 'other';
  },
  errorTags: {
    [confusionTag('imparfait', 'present')]: {
      label: 'Confond imparfait et présent',
      tip: 'Dites la phrase avec « hier » puis « aujourd’hui ». Repérez les terminaisons -ais, -ait, -aient.',
    },
    [confusionTag('futur', 'present')]: {
      label: 'Confond futur et présent',
      tip: 'Faites entendre le « r » du futur : il chante / il chantera, nous sommes / nous serons.',
    },
    [confusionTag('passe_compose', 'present')]: {
      label: 'Prend le passé composé pour du présent',
      tip: '« Il a chanté » a deux mots ; « il a » tout seul, c’est le présent du verbe avoir.',
    },
    [confusionTag('imparfait', 'passe_compose')]: {
      label: 'Confond les deux temps du passé',
      tip: 'Un seul mot qui finit par -ait : imparfait. Deux mots (a + chanté) : passé composé.',
    },
    [confusionTag('futur', 'passe_compose')]: {
      label: 'Confond futur et passé composé',
      tip: 'Demandez : « c’est déjà fait ou ça va arriver ? ».',
    },
    [confusionTag('futur', 'imparfait')]: {
      label: 'Confond futur et imparfait',
      tip: 'Comparez « il était » et « il sera », « il chantait » et « il chantera » à voix haute.',
    },
    other: { label: 'Formes verbales à mémoriser', tip: 'Récitez être et avoir au présent, à l’imparfait et au futur.' },
  },
});

/** True if the sentence contains the verb form of this tense (any person). */
function answerMatchesTense(sentence: string, infinitive: string, tense: F9Tense): boolean {
  const lower = sentence.toLowerCase();
  return ([0, 1, 2, 3, 4, 5] as const).some((p) => {
    const form = conjugate(infinitive, tense, p);
    return new RegExp(`(^|[\\s’])${form}( |\\.)`).test(lower);
  });
}
