import { createRng } from '../../engine/rng';
import { LEVELS } from '../types';
import { F8_BANK, f8Logic, plainSentence, splitSentence, TENSES, type F8Item } from './logic';

describe('F8 bank', () => {
  it('has at least 60 items, balanced over tenses and levels', () => {
    expect(F8_BANK.length).toBeGreaterThanOrEqual(60);
    for (const tense of TENSES) {
      for (const level of LEVELS) {
        expect(F8_BANK.filter((e) => e.tense === tense && e.level === level).length).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('has unique ids and sentences', () => {
    expect(new Set(F8_BANK.map((e) => e.id)).size).toBe(F8_BANK.length);
    expect(new Set(F8_BANK.map((e) => e.sentence)).size).toBe(F8_BANK.length);
  });
});

describe('F8 logic', () => {
  const item: F8Item = { key: 'F8-x', id: 'F8-x', level: 3, tense: 'futur', sentence: 'Les hirondelles [reviendront] au printemps.' };

  it('splits the sentence around the verb', () => {
    expect(splitSentence(item.sentence)).toEqual({ before: 'Les hirondelles ', verb: 'reviendront', after: ' au printemps.' });
    expect(plainSentence(item.sentence)).toBe('Les hirondelles reviendront au printemps.');
  });
  it('offers the four official choices in order', () => {
    expect(f8Logic.choices?.(item).map((c) => c.label)).toEqual(['imparfait', 'présent', 'futur', 'passé composé']);
  });
  it('checks and tags confusions symmetrically', () => {
    expect(f8Logic.check(item, 'futur')).toBe(true);
    expect(f8Logic.classifyError(item, 'present')).toBe('futur__present');
    expect(f8Logic.classifyError({ ...item, tense: 'present' }, 'futur')).toBe('futur__present');
    expect(f8Logic.classifyError(item, '')).toBe('no_answer');
  });
  it('explains with the verb ending', () => {
    expect(f8Logic.explain(item, 'present')).toBe(
      '« reviendront » est au futur : l’action se passera plus tard, on entend le « r » de -ront.',
    );
    expect(f8Logic.explain({ ...item, tense: 'passe_compose', sentence: 'Elles [sont arrivées] en retard.' }, '')).toBe(
      '« sont arrivées » est au passé composé : il a deux mots, « sont » et « arrivées ».',
    );
  });
  it('generates items from the bank', () => {
    const rng = createRng(1);
    for (const level of LEVELS) {
      const generated = f8Logic.generate(level, rng);
      expect(F8_BANK.some((e) => e.id === generated.id)).toBe(true);
      expect(generated.level).toBeLessThanOrEqual(level);
    }
  });
});
