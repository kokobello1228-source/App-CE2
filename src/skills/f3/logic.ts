import bankJson from '../../content/fr/f3.json';
import { textBankSchema, textBlock, textQuestionSchema, type TextQuestionItem } from '../textQuestions';
import type { Choice, SkillLogic } from '../types';

/**
 * F3 – Understand a heard text: an original documentary text read twice aloud,
 * then multiple-choice questions read aloud (30 s each in the official test).
 */
export const F3_BANK = textBankSchema.parse(bankJson);

function readQuestion(item: TextQuestionItem): string {
  return `${item.question} ${item.choices.join(' ; ')} ?`;
}

export const f3Logic: SkillLogic<TextQuestionItem> = {
  id: 'F3',
  instruction: 'Écoute bien : je vais lire un texte deux fois. Ensuite, je poserai des questions. Le texte n’est pas écrit, il faut bien écouter.',
  avgItemSeconds: 45,
  schema: textQuestionSchema,
  generate: (level, rng) => {
    const block = textBlock('F3', F3_BANK, level, rng, 6);
    return block[rng.int(0, block.length - 1)];
  },
  generateBlock: (level, rng, count) => textBlock('F3', F3_BANK, level, rng, Math.max(4, count)),
  check: (item, answer) => answer === item.answer,
  expectedAnswer: (item) => item.answer,
  correctAnswerLabel: (item) => item.answer,
  explain: (item) =>
    item.type === 'global'
      ? `Il fallait penser à tout le texte. Réponse : « ${item.answer} »`
      : `Le texte le disait : « ${item.answer} ».`,
  classifyError: (item, answer) => (answer === item.answer ? null : item.choices.includes(answer) ? item.type : 'no_answer'),
  errorTags: {
    no_answer: { label: 'Pas de réponse dans le temps', tip: 'Réécoutez une question à la fois, sans chronomètre.' },
    explicite: {
      label: 'Ne retient pas une information entendue',
      tip: 'Écoutez ensemble des documentaires courts (radio, podcasts pour enfants) et posez une question précise à la fin.',
    },
    inference: {
      label: 'Difficulté à déduire une information entendue',
      tip: 'Après une écoute, demandez « pourquoi ? » : l’enfant doit relier deux informations du texte.',
    },
    global: {
      label: 'Difficulté à dire de quoi parle le texte',
      tip: 'Demandez de donner un titre au texte écouté, ou de le résumer en une phrase.',
    },
  },
  // The first question also plays the text twice; the countdown starts only after.
  speech: (item) => (item.index === 0 ? `${item.title}. ${item.text} Je relis le texte. ${item.text} Voici les questions. ${readQuestion(item)}` : readQuestion(item)),
  choices: (item): Choice[] => item.choices.map((c) => ({ id: c, label: c })),
};
