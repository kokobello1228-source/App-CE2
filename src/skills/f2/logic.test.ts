import { LEVELS } from '../types';
import { acceptedForms, F2_BANK, f2Logic, normalizeAnswer, spell, type F2Item } from './logic';

const item = (word: string, extra: Partial<F2Item> = {}): F2Item => ({
  key: word, id: 'F2-x', word, level: 1, sentence: `Le mot ${word}.`, invariable: false, ...extra,
});

describe('F2 bank', () => {
  it('has 150 unique words, 50 per level', () => {
    expect(F2_BANK).toHaveLength(150);
    expect(new Set(F2_BANK.map((e) => e.word)).size).toBe(150);
    for (const level of LEVELS) expect(F2_BANK.filter((e) => e.level === level)).toHaveLength(50);
  });
});

describe('F2 answer checking', () => {
  it('ignores case, spaces and a leading article', () => {
    expect(f2Logic.check(item('maison'), '  Maison ')).toBe(true);
    expect(f2Logic.check(item('maison'), 'la maison')).toBe(true);
    expect(f2Logic.check(item('école'), "l'école")).toBe(true);
    expect(f2Logic.check(item('lac'), 'lac')).toBe(true);
  });
  it('accepts a plural mark, as in the official marking', () => {
    expect(f2Logic.check(item('maison'), 'maisons')).toBe(true);
    expect(f2Logic.check(item('bateau'), 'bateaux')).toBe(true);
    expect(f2Logic.check(item('cheval', { plurals: ['chevaux'] }), 'chevaux')).toBe(true);
    expect(f2Logic.check(item('souris'), 'souris')).toBe(true);
  });
  it('does not accept a plural on invariable words', () => {
    expect(f2Logic.check(item('toujours', { invariable: true }), 'toujours')).toBe(true);
    expect(f2Logic.check(item('vite', { invariable: true }), 'vites')).toBe(false);
  });
  it('requires accents and unifies apostrophes', () => {
    expect(f2Logic.check(item('école'), 'ecole')).toBe(false);
    expect(f2Logic.check(item('aujourd’hui', { invariable: true }), "aujourd'hui")).toBe(true);
  });
  it('lists accepted forms', () => {
    expect(acceptedForms(item('gâteau'))).toEqual(['gâteau', 'gâteaux']);
    expect(normalizeAnswer('Les  Chats')).toBe('chats');
  });
});

describe('F2 error tags', () => {
  it.each([
    ['école', 'ecole', 'accent'],
    ['chat', 'cha', 'silent_letter'],
    ['pomme', 'pome', 'double_consonant'],
    ['bateau', 'bato', 'phonetic'],
    ['maison', 'mézon', 'other'],
    ['maison', '', 'no_answer'],
  ])('%s written "%s" -> %s', (word, answer, tag) => {
    expect(f2Logic.classifyError(item(word), answer)).toBe(tag);
  });

  it('spells the word in the explanation', () => {
    expect(spell('chat')).toBe('c-h-a-t');
    expect(f2Logic.explain(item('chat'), 'cha')).toBe('On écrit « chat » : attention à la lettre muette à la fin, c-h-a-t.');
  });
});
