import { CHEERS, HELLO, MISSION_QUESTION, RETRY_TITLE, summarySpeech } from '../content/phrases';
import { createRng } from '../engine/rng';
import { SKILL_LOGIC } from '../skills/registry';
import { F2_BANK, F2_EXPLANATION_KINDS, f2Explanation, f2Logic } from '../skills/f2/logic';
import { f3Logic } from '../skills/f3/logic';
import { m1Logic } from '../skills/m1/logic';
import { generateM2, m2Logic } from '../skills/m2/logic';
import { generateM5, m5Logic } from '../skills/m5/logic';
import { poolItems } from '../skills/pool';
import { clipsFor } from './speech';
import { MIN_SEGMENT_WORDS, segments, spokenForm } from './voiceClips';

jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn(() => Promise.resolve()), getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])), VoiceQuality: { Enhanced: 'Enhanced' } }));

const share = (texts: string[]) => texts.filter((t) => clipsFor(t) !== null).length / texts.length;

/**
 * If this fails after editing content: run `npm run voice:collect` and scripts/voice/synthesize.py.
 * A few clips may be missing on purpose: the generator leaves out any take that the speech
 * recogniser does not understand exactly, and the device voice reads that text instead.
 */
describe('natural voice coverage', () => {
  it('records every instruction and Plume phrase', () => {
    for (const logic of Object.values(SKILL_LOGIC)) expect(clipsFor(logic!.instruction)).not.toBeNull();
    for (const text of [...CHEERS, RETRY_TITLE, `${HELLO} ${MISSION_QUESTION}`, summarySpeech(7, 12)]) expect(clipsFor(text)).not.toBeNull();
  });
  it('records almost all dictated words, spellings, numbers and heard texts', () => {
    expect(share(F2_BANK.map((e) => f2Logic.speech({ ...e, key: e.id })!))).toBeGreaterThan(0.9);
    expect(share(F2_BANK.flatMap((e) => F2_EXPLANATION_KINDS.map((k) => f2Explanation(e.word, k))))).toBeGreaterThan(0.9);
    expect(share(Array.from({ length: 1000 }, (_, n) => m1Logic.speech({ key: 'x', level: 1, value: n })!))).toBeGreaterThan(0.9);
    const block = f3Logic.generateBlock!(2, createRng(3), 6);
    // A question is read by Plume only if all its choices were understood: a few short ones fall back.
    expect(share(block.map((q) => f3Logic.speech(q)!))).toBeGreaterThan(0.5);
  });
  it('records almost all math problems and explanations (fixed pools)', () => {
    const problems = poolItems(generateM2, 2);
    expect(share(problems.map((i) => m2Logic.speech(i)!))).toBeGreaterThan(0.85);
    expect(share(problems.map((i) => m2Logic.explain(i, '')))).toBeGreaterThan(0.85);
    expect(share(poolItems(generateM5, 3).map((i) => m5Logic.explain(i, '')))).toBeGreaterThan(0.85);
  });
  it('falls back to the device voice for texts computed on the fly', () => {
    expect(clipsFor('Léa a 137 billes et 58 cartes.')).toBeNull();
  });
});

describe('what Plume says', () => {
  const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  it('never says a dictated word or number on its own', () => {
    const texts = [
      ...F2_BANK.map((e) => f2Logic.speech({ ...e, key: e.id })!),
      ...[0, 7, 80, 342, 999].map((n) => m1Logic.speech({ key: 'x', level: 1, value: n })!),
    ];
    for (const text of texts) for (const s of segments(spokenForm(text))) expect(words(s)).toBeGreaterThanOrEqual(MIN_SEGMENT_WORDS);
  });
  it('spells words with letter names', () => {
    expect(spokenForm(f2Explanation('pomme', 'other'))).toBe('On écrit « pomme » : p, o, deux m, euh.');
  });
});
