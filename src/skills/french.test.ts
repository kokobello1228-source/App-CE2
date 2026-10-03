import { createRng } from '../engine/rng';
import { generateF4, satisfies, sentenceOf } from './f4/logic';
import { F67_BANK, f6Logic, generateF6, generateF7 } from './f6/logic';
import { generateF9, f9Logic } from './f9/logic';
import { generateF12, f12Logic } from './f12/logic';
import { generateF13, CLASSES } from './f13/logic';
import { fluencyScore, nextText, tokenize, F14_TEXTS } from './f14/fluency';
import { f1Logic, F1_BANK } from './f1/logic';
import { f3Logic } from './f3/logic';
import { clause, conjugate, SUBJECTS } from './frLexicon';
import { LEVELS } from './types';

describe('conjugation (F9 lexicon)', () => {
  it.each([
    ['chanter', 'present', 0, 'chante'], ['chanter', 'imparfait', 3, 'chantions'], ['chanter', 'futur', 5, 'chanteront'],
    ['chanter', 'passe_compose', 2, 'a chanté'], ['être', 'imparfait', 4, 'étiez'], ['avoir', 'futur', 1, 'auras'],
    ['avoir', 'passe_compose', 3, 'avons eu'], ['être', 'passe_compose', 5, 'ont été'],
  ] as const)('%s, %s, person %i -> %s', (verb, tense, person, form) => {
    expect(conjugate(verb, tense, person)).toBe(form);
  });
  it('elides "je" before a vowel', () => {
    expect(clause(SUBJECTS[0], 'ai')).toBe('J’ai');
    expect(clause(SUBJECTS[0], 'écoutais')).toBe('J’écoutais');
    expect(clause(SUBJECTS[0], 'suis')).toBe('Je suis');
  });
});

describe('F9 generator', () => {
  it.each(LEVELS)('level %i: 4 distinct sentences, the answer is at the asked tense', (level) => {
    const rng = createRng(level);
    for (let i = 0; i < 200; i++) {
      const item = generateF9(level, rng);
      expect(new Set(item.choices).size).toBe(4);
      expect(item.choices).toContain(item.answer);
      for (const wrong of item.choices.filter((c) => c !== item.answer)) {
        expect(f9Logic.classifyError(item, wrong)).not.toBe('other');
      }
    }
  });
});

describe('F12 agreement', () => {
  it('chooses the form from gender and number', () => {
    const rng = createRng(3);
    for (let i = 0; i < 300; i++) {
      const item = generateF12(3, rng);
      expect(new Set(item.choices).size).toBe(4);
      expect(item.choices).toContain(item.answer);
    }
  });
  it('tags gender and number mistakes', () => {
    const item = { ...generateF12(2, createRng(1)) };
    const forced = { ...item, answer: 'vertes', choices: ['vert', 'verte', 'verts', 'vertes'] };
    expect(f12Logic.classifyError(forced, 'verts')).toBe('gender');
    expect(f12Logic.classifyError(forced, 'verte')).toBe('number');
    expect(f12Logic.classifyError(forced, 'vert')).toBe('both');
  });
});

describe('F13 word classes', () => {
  it('underlines exactly one word and keeps the official order of choices', () => {
    const rng = createRng(4);
    for (const level of LEVELS) {
      for (let i = 0; i < 100; i++) {
        const item = generateF13(level, rng);
        expect(item.stem.match(/\[/g)).toHaveLength(1);
        expect(item.choices).toEqual([...CLASSES]);
        if (level === 1) expect(['nom propre', 'nom commun']).toContain(item.answer);
      }
    }
  });
});

describe('F6 / F7', () => {
  it('offers the 4 groups of the sentence and the right one', () => {
    const rng = createRng(5);
    const subject = generateF6(3, rng);
    const entry = F67_BANK.find((e) => e.id === subject.id)!;
    expect(subject.answer).toBe(entry.groups[entry.subject]);
    expect(entry.subjectLevel === 3 || entry.subjectLevel === 2).toBe(true);
    expect(f6Logic.classifyError(subject, entry.groups[entry.verb])).toBe('verb_as_subject');
    const verb = generateF7(2, rng);
    expect([...verb.choices].sort()).toEqual([...F67_BANK.find((e) => e.id === verb.id)!.groups].sort());
  });
});

describe('F4 pictures', () => {
  it.each(LEVELS)('level %i: exactly one picture matches the sentence', (level) => {
    const rng = createRng(level * 7);
    for (let i = 0; i < 300; i++) {
      const item = generateF4(level, rng);
      expect(item.scenes.filter((s) => satisfies(s, item.fact))).toHaveLength(1);
      expect(new Set(item.scenes.map((s) => JSON.stringify(s))).size).toBe(4);
    }
  });
  it('writes the passive voice with agreement', () => {
    expect(sentenceOf({ kind: 'passive', followed: 'souris', follower: 'chat' })).toBe('La souris est suivie par le chat.');
    expect(sentenceOf({ kind: 'spatial', animal: 'ours', relation: 'à côté de', object: 'parasol' })).toBe('L’ours est à côté du parasol.');
  });
});

describe('F1 / F3 text blocks', () => {
  it('returns the questions of one text, in order', () => {
    const block = f1Logic.generateBlock!(2, createRng(1), 8);
    expect(block).toHaveLength(8);
    expect(new Set(block.map((q) => q.textId)).size).toBe(1);
    expect(block.map((q) => q.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(F1_BANK.find((t) => t.id === block[0].textId)!.level).toBe(2);
  });
  it('reads the F3 text twice before the first question only', () => {
    const block = f3Logic.generateBlock!(1, createRng(2), 6);
    expect(f3Logic.speech(block[0])).toContain('Je relis le texte.');
    expect(f3Logic.speech(block[1])).not.toContain('Je relis le texte.');
  });
});

describe('F14 fluency', () => {
  const text = 'Le chat dort. « Il rêve ! » Puis il part.';
  it('does not count lone punctuation as words', () => {
    expect(tokenize(text).filter((t) => t.isWord)).toHaveLength(8);
  });
  it('counts correct words up to the last word read, per minute', () => {
    // last token "rêve" (index 5): 5 words read, 1 error -> 4 in 60 s
    expect(fluencyScore({ text, lastToken: 5, errors: [1], seconds: 60 })).toEqual({ wordsRead: 5, errors: 1, wcpm: 4 });
    // finished in 30 s: 8 words -> 16 per minute; errors after the last word are ignored
    expect(fluencyScore({ text, lastToken: 10, errors: [], seconds: 30 }).wcpm).toBe(16);
  });
  it('suggests the least recently read text', () => {
    expect(nextText([]).id).toBe(F14_TEXTS[0].id);
    expect(nextText([F14_TEXTS[0].id]).id).toBe(F14_TEXTS[1].id);
  });
});
