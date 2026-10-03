import { SKILLS } from '../../skills.config';
import { OFFICIAL_F2_WORDS, OFFICIAL_F8_SENTENCES } from './officialItems';
import { createRng } from '../engine/rng';
import { normalizeText } from '../skills/common';
import { F2_BANK } from '../skills/f2/logic';
import { F8_BANK, splitSentence } from '../skills/f8/logic';
import { SKILL_LOGIC } from '../skills/registry';
import { F1_BANK } from '../skills/f1/logic';
import { F3_BANK } from '../skills/f3/logic';
import { F5_BANK } from '../skills/f5/logic';
import { F67_BANK } from '../skills/f6/logic';
import { F10_BANK } from '../skills/f10/logic';
import { F11_BANK } from '../skills/f11/logic';
import { F14_TEXTS, wordCount } from '../skills/f14/fluency';
import type { TextEntry } from '../skills/textQuestions';
import { LEVELS, type AnySkillLogic } from '../skills/types';

const SAMPLES_PER_LEVEL = 300;

/** Checks generated items of a skill. Returns a list of problems (empty = OK). */
export function validateSkill(logic: AnySkillLogic): string[] {
  const problems: string[] = [];
  const rng = createRng(12345);
  for (const level of LEVELS) {
    for (let i = 0; i < SAMPLES_PER_LEVEL; i++) {
      const item = logic.generate(level, rng);
      const where = `${logic.id} ${item.key}`;
      const parsed = logic.schema.safeParse(JSON.parse(JSON.stringify(item)));
      if (!parsed.success) problems.push(`${where}: schema – ${parsed.error.message}`);
      if (!logic.check(item, logic.expectedAnswer(item))) problems.push(`${where}: expected answer is rejected`);
      if (logic.classifyError(item, logic.expectedAnswer(item)) !== null) problems.push(`${where}: error tag on correct answer`);
      if (logic.explain(item, logic.expectedAnswer(item)).trim() === '') problems.push(`${where}: empty explanation`);
      const texts = [
        logic.explain(item, logic.expectedAnswer(item)), logic.explain(item, ''), logic.correctAnswerLabel(item),
        logic.speech(item) ?? '', ...(logic.choices?.(item).map((c) => c.label) ?? []),
      ];
      for (const text of texts) {
        if (/undefined|NaN|null|\{|\}/.test(text)) problems.push(`${where}: broken text "${text}"`);
      }
      if (logic.choices) {
        const choices = logic.choices(item);
        const expectedCount = logic.id === 'M2' ? 6 : 4;
        if (choices.length !== expectedCount) problems.push(`${where}: ${choices.length} choices instead of ${expectedCount}`);
        if (new Set(choices.map((c) => c.label)).size !== choices.length) problems.push(`${where}: duplicate choices`);
        const correct = choices.filter((c) => logic.check(item, c.id));
        if (correct.length !== 1) problems.push(`${where}: ${correct.length} correct choices`);
      }
      // Every wrong answer must map to a known error tag.
      const wrong = logic.choices ? logic.choices(item).find((c) => !logic.check(item, c.id))?.id : '9999';
      if (wrong !== undefined) {
        const tag = logic.classifyError(item, wrong);
        if (tag === null || !(tag in logic.errorTags)) problems.push(`${where}: unknown error tag ${tag}`);
      }
    }
  }
  return problems;
}

export function validateF8Bank(): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const entry of F8_BANK) {
    if (ids.has(entry.id)) problems.push(`${entry.id}: duplicate id`);
    ids.add(entry.id);
    const { before, verb, after } = splitSentence(entry.sentence);
    if (!/^[A-ZÀ-Ý]/.test((before + verb).trim())) problems.push(`${entry.id}: sentence must start with a capital`);
    if (!/[.!?]$/.test(after.trim() || verb)) problems.push(`${entry.id}: sentence must end with punctuation`);
    if (OFFICIAL_F8_SENTENCES.includes(entry.sentence.replace(/[[\]]/g, ''))) problems.push(`${entry.id}: official item`);
    const words = verb.trim().split(/\s+/).length;
    if (entry.tense === 'passe_compose' && words !== 2) problems.push(`${entry.id}: passé composé must have 2 words`);
    if (entry.tense !== 'passe_compose' && words !== 1) problems.push(`${entry.id}: simple tense must have 1 word`);
  }
  if (F8_BANK.length < 60) problems.push(`F8: ${F8_BANK.length} items, 60 required`);
  return problems;
}

export function validateF2Bank(): string[] {
  const problems: string[] = [];
  const words = new Set<string>();
  for (const entry of F2_BANK) {
    if (words.has(entry.word)) problems.push(`${entry.id}: duplicate word ${entry.word}`);
    words.add(entry.word);
    if (OFFICIAL_F2_WORDS.includes(entry.word)) problems.push(`${entry.id}: official item "${entry.word}"`);
    const sentence = normalizeText(entry.sentence);
    if (!sentence.includes(normalizeText(entry.word))) problems.push(`${entry.id}: sentence does not contain "${entry.word}"`);
    if (!/^[A-ZÀ-Ý]/.test(entry.sentence)) problems.push(`${entry.id}: sentence must start with a capital`);
    if (!/[.!?]$/.test(entry.sentence)) problems.push(`${entry.id}: sentence must end with punctuation`);
  }
  if (F2_BANK.length < 150) problems.push(`F2: ${F2_BANK.length} words, 150 required`);
  return problems;
}

function distinct(values: string[]): boolean {
  return new Set(values).size === values.length;
}

/** French banks written by hand: structure and minimum volumes. */
export function validateFrenchBanks(): string[] {
  const problems: string[] = [];
  const minimum = (name: string, count: number, min: number) => {
    if (count < min) problems.push(`${name}: ${count} items, ${min} required`);
  };
  minimum('F5', F5_BANK.length, 60);
  minimum('F6/F7', F67_BANK.length, 60);
  minimum('F10', F10_BANK.length, 60);
  minimum('F11', F11_BANK.length, 60);
  minimum('F1', F1_BANK.length, 12);
  minimum('F3', F3_BANK.length, 12);
  minimum('F14', F14_TEXTS.length, 15);
  for (const e of F5_BANK) if (!distinct([e.answer, ...e.distractors])) problems.push(`${e.id}: duplicate choices`);
  for (const e of F10_BANK) if (!distinct([e.answer, e.opposite, e.lookalike, e.other])) problems.push(`${e.id}: duplicate choices`);
  for (const e of F11_BANK) if (!distinct([...e.family, e.intruder])) problems.push(`${e.id}: duplicate choices`);
  for (const e of F67_BANK) {
    if (!distinct(e.groups)) problems.push(`${e.id}: duplicate groups`);
    for (const g of e.groups) if (!e.sentence.includes(g)) problems.push(`${e.id}: group "${g}" not in sentence`);
    if (e.subject === e.verb) problems.push(`${e.id}: subject and verb are the same group`);
  }
  const texts = (name: string, bank: TextEntry[], questions: number, minWords: number, maxWords: number) => {
    for (const t of bank) {
      if (t.questions.length !== questions) problems.push(`${t.id}: ${t.questions.length} questions, ${questions} expected`);
      if (t.words < minWords || t.words > maxWords) problems.push(`${t.id}: ${t.words} words (${minWords}-${maxWords})`);
      for (const q of t.questions) if (!distinct([q.answer, ...q.distractors])) problems.push(`${t.id}: duplicate choices in "${q.question}"`);
    }
    for (const level of [1, 2, 3]) if (!bank.some((t) => t.level === level)) problems.push(`${name}: no text at level ${level}`);
  };
  texts('F1', F1_BANK, 8, 200, 280);
  texts('F3', F3_BANK, 6, 160, 230);
  for (const t of F14_TEXTS) {
    const n = wordCount(t.text);
    if (n < 130 || n > 150) problems.push(`${t.id}: ${n} words (130-150)`);
  }
  return problems;
}

export function validateAll(): string[] {
  const problems: string[] = [];
  for (const logic of Object.values(SKILL_LOGIC)) {
    if (!logic) continue;
    if (!SKILLS[logic.id]) problems.push(`${logic.id}: missing from skills.config.ts`);
    problems.push(...validateSkill(logic));
  }
  problems.push(...validateF8Bank(), ...validateF2Bank(), ...validateFrenchBanks());
  return problems;
}
