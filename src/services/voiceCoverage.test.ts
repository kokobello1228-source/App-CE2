import { CHEERS, HELLO, MISSION_QUESTION, RETRY_TITLE, summarySpeech } from '../content/phrases';
import { createRng } from '../engine/rng';
import { SKILL_LOGIC } from '../skills/registry';
import { F2_BANK, f2Logic } from '../skills/f2/logic';
import { f3Logic } from '../skills/f3/logic';
import { clipsFor } from './speech';

jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn(() => Promise.resolve()), getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])), VoiceQuality: { Enhanced: 'Enhanced' } }));

/** If this fails after editing content: run `npm run voice:collect` and scripts/voice/synthesize.py. */
describe('natural voice coverage', () => {
  it('records every instruction and Plume phrase', () => {
    for (const logic of Object.values(SKILL_LOGIC)) expect(clipsFor(logic!.instruction)).not.toBeNull();
    for (const text of [...CHEERS, RETRY_TITLE, `${HELLO} ${MISSION_QUESTION}`, summarySpeech(7, 12)]) expect(clipsFor(text)).not.toBeNull();
  });
  it('records dictation words and heard texts', () => {
    for (const e of F2_BANK) expect(clipsFor(f2Logic.speech({ ...e, key: e.id })!)).not.toBeNull();
    const block = f3Logic.generateBlock!(2, createRng(3), 6);
    for (const q of block) expect(clipsFor(f3Logic.speech(q)!)).not.toBeNull();
  });
  it('falls back to the device voice for texts computed on the fly', () => {
    expect(clipsFor('Léa a 137 billes et 58 cartes.')).toBeNull();
  });
});
