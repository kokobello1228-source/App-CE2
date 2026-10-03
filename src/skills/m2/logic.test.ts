import { createRng } from '../../engine/rng';
import { LEVELS } from '../types';
import { generateM2, m2Distractors, m2Logic, type M2Item } from './logic';

describe('M2 generator', () => {
  it.each(LEVELS)('level %i: well-formed statements and 6 distinct choices', (level) => {
    const rng = createRng(level * 29);
    for (let i = 0; i < 400; i++) {
      const item = generateM2(level, rng);
      expect(item.text).not.toMatch(/[{}]|undefined|NaN/);
      expect(item.text.endsWith('?')).toBe(true);
      expect(new Set(item.choices).size).toBe(6);
      expect(item.choices.filter((c) => c === item.answer)).toHaveLength(1);
      expect(item.answer).toBeGreaterThan(0);
    }
  });

  it('level 1 only has one-step transformations and parts-whole', () => {
    const rng = createRng(1);
    const types = new Set(Array.from({ length: 200 }, () => generateM2(1, rng).type));
    expect([...types].sort()).toEqual(['combine', 'gain', 'loss']);
  });

  it('level 3 includes two-step problems and sharing', () => {
    const rng = createRng(2);
    const types = new Set(Array.from({ length: 300 }, () => generateM2(3, rng).type));
    expect(types.has('twoStepBus')).toBe(true);
    expect(types.has('partition')).toBe(true);
  });
});

describe('M2 distractors and errors', () => {
  it('uses the numbers of the statement and near results, like the official choices', () => {
    expect(m2Distractors({ answer: 195, given: [137, 58], wrongOperation: 79, partial: null })).toEqual([79, 137, 58, 196, 194]);
  });

  const item: M2Item = {
    key: 'k', level: 2, type: 'initialLoss',
    text: 'Zélie a perdu 9 billes. Maintenant, elle en a 34. Combien de billes Zélie avait-elle avant ?',
    answer: 43, given: [9, 34], wrongOperation: 25, partial: null, choices: [43, 25, 9, 34, 44, 42],
  };
  it.each([['25', 'wrong_operation'], ['34', 'number_from_text'], ['44', 'calculation'], ['43', null]])(
    'answer %s -> %s', (answer, tag) => {
      expect(m2Logic.classifyError(item, answer)).toBe(tag);
    },
  );
  it('explains the initial-state trap', () => {
    expect(m2Logic.explain(item, '25')).toBe('Avant d’en perdre 9, il y en avait plus : on ajoute 34 + 9 = 43.');
  });
  it('reads the statement twice', () => {
    expect(m2Logic.speech(item)).toBe(`${item.text} Je répète. ${item.text}`);
  });
});
