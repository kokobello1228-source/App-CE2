import bankJson from '../../content/fr/f1.json';
import { textBankSchema, textBlock, textQuestionSchema, questionItem, type TextQuestionItem } from '../textQuestions';
import type { Choice, SkillLogic } from '../types';

/**
 * F1 – Understand a text read alone: an original narrative text (about 250 words),
 * then multiple-choice questions (finding information, inference, overall meaning).
 */
export const F1_BANK = textBankSchema.parse(bankJson);

const EXPLAIN: Record<string, string> = {
  prelevement: 'La réponse est écrite dans le texte : relis le passage qui en parle.',
  inference: 'La réponse n’est pas écrite mot pour mot : il faut comprendre ce que pensent ou ressentent les personnages.',
  global: 'Il faut penser à toute l’histoire, du début à la fin.',
};

export const f1Logic: SkillLogic<TextQuestionItem> = {
  id: 'F1',
  instruction: 'Lis le texte tout seul, tranquillement. Ensuite, réponds aux questions. Tu peux relire le texte quand tu veux.',
  avgItemSeconds: 70,
  schema: textQuestionSchema,
  generate: (level, rng) => {
    const block = textBlock('F1', F1_BANK, level, rng, 8);
    return block[rng.int(0, block.length - 1)];
  },
  generateBlock: (level, rng, count) => textBlock('F1', F1_BANK, level, rng, Math.max(4, count)),
  check: (item, answer) => answer === item.answer,
  expectedAnswer: (item) => item.answer,
  correctAnswerLabel: (item) => item.answer,
  explain: (item) => `${EXPLAIN[item.type] ?? ''} Réponse : « ${item.answer} »`.trim(),
  classifyError: (item, answer) => (answer === item.answer ? null : item.choices.includes(answer) ? item.type : 'no_answer'),
  errorTags: {
    no_answer: { label: 'Pas de réponse dans le temps', tip: 'Laissez du temps pour relire le texte : l’objectif est de comprendre, pas d’aller vite.' },
    prelevement: {
      label: 'Ne retrouve pas une information écrite dans le texte',
      tip: 'Apprenez à retourner dans le texte : chercher le mot clé de la question (un nom, un lieu) et relire autour.',
    },
    inference: {
      label: 'Difficulté à comprendre ce qui n’est pas écrit (inférences)',
      tip: 'Pendant la lecture du soir, demandez « pourquoi a-t-il fait ça ? », « comment se sent-elle ? » et cherchez les indices ensemble.',
    },
    global: {
      label: 'Difficulté à résumer l’histoire ou à trouver la morale',
      tip: 'Après chaque lecture, faites raconter l’histoire en trois phrases : début, problème, fin.',
    },
  },
  speech: () => null,
  choices: (item): Choice[] => item.choices.map((c) => ({ id: c, label: c })),
};

export { questionItem };
