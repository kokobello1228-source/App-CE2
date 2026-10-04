/**
 * Lists every text segment that can be pre-recorded with the natural voice.
 * Output: JSON array of { key, text } on stdout (used by synthesize.py).
 * Dynamic texts (word problems, calculations, generated sentences) are not
 * listed: they keep the device voice.
 */
import { CHEERS, FLUENCY_INSTRUCTION, HELLO, homeGreeting, RETRY_TITLE, streakCheer, summarySpeech, VOICE_SAMPLE } from '../../src/content/phrases';
import { createRng } from '../../src/engine/rng';
import { clipKey, segments, spokenForm } from '../../src/services/voiceClips';
import { F1_BANK, f1Logic } from '../../src/skills/f1/logic';
import { F2_BANK, F2_EXPLANATION_KINDS, f2Explanation, f2Logic } from '../../src/skills/f2/logic';
import { F3_BANK, f3Logic } from '../../src/skills/f3/logic';
import { ANIMALS, f4Logic, sentenceOf, type Fact, type F4Item, type Relation } from '../../src/skills/f4/logic';
import { F5_BANK, f5Logic, itemF5 } from '../../src/skills/f5/logic';
import { F67_BANK, f6Logic, f7Logic, itemF6, itemF7 } from '../../src/skills/f6/logic';
import { F8_BANK, f8Logic } from '../../src/skills/f8/logic';
import { F10_BANK, f10Logic, itemF10 } from '../../src/skills/f10/logic';
import { F11_BANK, f11Logic, itemF11 } from '../../src/skills/f11/logic';
import { ADJECTIVES, adjectiveForm, DETERMINERS, NOUNS, nounForm, PLURAL_DETERMINERS } from '../../src/skills/frLexicon';
import { DENOMINATORS } from '../../src/skills/fractions';
import { m1Logic } from '../../src/skills/m1/logic';
import { m7Logic } from '../../src/skills/m7/logic';
import { m8Logic } from '../../src/skills/m8/logic';
import { textQuestionSchema, questionItem } from '../../src/skills/textQuestions';
import { SKILL_LOGIC } from '../../src/skills/registry';
import { poolItems } from '../../src/skills/pool';
import { generateM2 } from '../../src/skills/m2/logic';
import { generateM3 } from '../../src/skills/m3/logic';
import { generateM4 } from '../../src/skills/m4/logic';
import { generateM5 } from '../../src/skills/m5/logic';
import { generateM6 } from '../../src/skills/m6/logic';
import { generateM9 } from '../../src/skills/m9/logic';
import { generateM10 } from '../../src/skills/m10/logic';
import { generateM11 } from '../../src/skills/m11/logic';
import type { AnySkillLogic, ItemBase } from '../../src/skills/types';

const texts = new Map<string, string>();
const add = (text: string | null | undefined) => {
  if (!text) return;
  for (const segment of segments(spokenForm(text))) {
    const key = clipKey(segment);
    if (!texts.has(key)) texts.set(key, segment);
  }
};
const rng = createRng(1);
const say = (logic: AnySkillLogic, item: ItemBase) => {
  add(logic.speech(item));
  add(logic.explain(item, ''));
};
const any = (l: unknown) => l as AnySkillLogic;

// Instructions and Plume's phrases
for (const logic of Object.values(SKILL_LOGIC)) add(logic?.instruction);
[...CHEERS, RETRY_TITLE, VOICE_SAMPLE, FLUENCY_INSTRUCTION].forEach(add);
// Home greeting, as said by the home screen
add(`${HELLO} ${homeGreeting(0)}`);
for (let d = 2; d <= 60; d++) add(`${HELLO} ${homeGreeting(d)}`);
for (let d = 2; d <= 60; d++) add(streakCheer(d));
for (let total = 1; total <= 60; total++) for (let c = 0; c <= total; c += 1) add(summarySpeech(c, total));

// F2 dictation: words, sentences and spelled explanations
for (const e of F2_BANK) {
  add(f2Logic.speech({ ...e, key: e.id }));
  for (const kind of F2_EXPLANATION_KINDS) add(f2Explanation(e.word, kind));
}
// F8 tenses
for (const e of F8_BANK) say(any(f8Logic), { ...e, key: e.id } as ItemBase);
// F5, F6, F7, F10, F11 banks
for (const e of F5_BANK) say(any(f5Logic), itemF5(e, e.level, rng));
for (const e of F67_BANK) {
  say(any(f6Logic), itemF6(e, 1, rng));
  say(any(f7Logic), itemF7(e, 1, rng));
}
for (const e of F10_BANK) say(any(f10Logic), itemF10(e, e.level, rng));
for (const e of F11_BANK) say(any(f11Logic), itemF11(e, e.level, rng));
// F1 / F3 texts
for (const t of F1_BANK) t.questions.forEach((_, i) => say(any(f1Logic), textQuestionSchema.parse(questionItem('F1', t, i, rng))));
for (const t of F3_BANK) t.questions.forEach((_, i) => say(any(f3Logic), textQuestionSchema.parse(questionItem('F3', t, i, rng))));
// F4 sentences
const animals = ANIMALS.map((a) => a.id);
const relations: [Relation, ('boîte' | 'chaise' | 'parasol')[]][] = [['sur', ['boîte', 'chaise']], ['sous', ['chaise', 'parasol']], ['à côté de', ['boîte', 'chaise', 'parasol']]];
const facts: Fact[] = [];
for (const a of animals) {
  facts.push({ kind: 'negation', animal: a });
  for (const [relation, objects] of relations) for (const object of objects) {
    facts.push({ kind: 'spatial', animal: a, relation, object }, { kind: 'relative', animal: a, relation, object });
  }
  for (const b of animals) if (a !== b) facts.push({ kind: 'passive', followed: a, follower: b });
}
for (const fact of facts) {
  const item: F4Item = { key: 'x', level: 1, sentence: sentenceOf(fact), fact, scenes: [] };
  add(f4Logic.speech(item));
  add(f4Logic.explain(item, ''));
}
// F12 noun groups and explanations
for (const noun of NOUNS) for (const plural of [false, true]) {
  for (const det of plural ? PLURAL_DETERMINERS : DETERMINERS[noun.gender]) {
    const n = nounForm(noun, plural);
    add(`${det} ${n}. Quel adjectif est bien accordé ?`);
    add(`« ${n} » est ${noun.gender === 'f' ? 'féminin' : 'masculin'} ${plural ? 'pluriel' : 'singulier'} (${det} ${n}).`);
  }
}
for (const adj of ADJECTIVES) for (const gender of ['m', 'f'] as const) for (const plural of [false, true]) {
  const rule = gender === 'f' ? (plural ? 'on ajoute un e et un s' : 'on ajoute un e') : plural ? 'on ajoute un s' : 'on ne change rien';
  add(`Alors ${rule}, ça donne « ${adjectiveForm(adj, gender, plural)} ».`);
}
// M1 numbers (M6 decompositions are computed: device voice), M7 / M8 fractions
for (let n = 0; n <= 999; n++) {
  add(m1Logic.speech({ key: 'x', level: 1, value: n }));
  add(m1Logic.explain({ key: 'x', level: 1, value: n }, ''));
}
// Math skills with random numbers: every item of their fixed pools (problems and explanations)
const POOLED = { M2: generateM2, M3: generateM3, M4: generateM4, M5: generateM5, M6: generateM6, M9: generateM9, M10: generateM10, M11: generateM11 };
for (const [id, generate] of Object.entries(POOLED)) {
  const logic = SKILL_LOGIC[id as keyof typeof SKILL_LOGIC] as unknown as AnySkillLogic;
  for (const level of [1, 2, 3] as const) for (const item of poolItems(generate as (l: 1 | 2 | 3, r: ReturnType<typeof createRng>) => ItemBase, level)) say(logic, item);
}
for (const d of DENOMINATORS) for (let n = 1; n <= d; n++) {
  const m7 = { key: 'x', level: 1 as const, n, d, choices: [] };
  add(m7Logic.speech(m7));
  add(m7Logic.explain(m7, ''));
  const m8 = { key: 'x', level: 1 as const, n, d, figures: [] };
  add(m8Logic.speech(m8));
  add(m8Logic.explain(m8, ''));
}

process.stdout.write(JSON.stringify([...texts].map(([key, text]) => ({ key, text }))));
