import { OFFICIAL_COLUMN_OPS } from '../../content/officialItems';
import { createRng } from '../../engine/rng';
import { hasCarry, resultOf, type ColumnOpItem } from '../columnOps';
import { m5Logic, generateM5 } from '../m5/logic';
import { LEVELS } from '../types';
import { generateM4, m4Logic } from './logic';

describe('M4 additions', () => {
  it.each(LEVELS)('level %i follows the score guide', (level) => {
    const rng = createRng(level * 3);
    for (let i = 0; i < 400; i++) {
      const item = generateM4(level, rng);
      expect(resultOf(item)).toBeLessThanOrEqual(999);
      expect(OFFICIAL_COLUMN_OPS).not.toContain(item.terms.join('+'));
      if (level === 1) expect(hasCarry(item.terms)).toBe(false);
      if (level >= 2) expect(hasCarry(item.terms)).toBe(true);
      expect(item.terms).toHaveLength(level === 3 ? 3 : 2);
    }
  });

  const item: ColumnOpItem = { key: 'k', level: 2, op: '+', terms: [595, 45] };
  it.each([
    ['640', null], ['530', 'forgot_carry'], ['51310', 'column_concat'], ['1045', 'misaligned'], ['650', 'fact_error'],
  ])('answer %s -> %s', (answer, tag) => {
    expect(m4Logic.classifyError(item, answer)).toBe(tag);
  });
  it('explains the first carry', () => {
    expect(m4Logic.explain(item, '')).toBe('Dans la colonne des unités, ça fait 10 : on écrit 0 et on retient 1. Le résultat est 640.');
  });
});

describe('M5 subtractions without borrowing', () => {
  it.each(LEVELS)('level %i never needs a borrow', (level) => {
    const rng = createRng(level * 5);
    for (let i = 0; i < 400; i++) {
      const item = generateM5(level, rng);
      const [a, b] = item.terms;
      expect(a).toBeGreaterThan(b);
      String(b).padStart(String(a).length, '0').split('').forEach((digit, idx) => {
        expect(Number(String(a)[idx])).toBeGreaterThanOrEqual(Number(digit));
      });
    }
  });

  const item: ColumnOpItem = { key: 'k', level: 3, op: '-', terms: [578, 241] };
  it('detects adding instead of subtracting', () => {
    expect(m5Logic.classifyError(item, '819')).toBe('added');
    expect(m5Logic.classifyError(item, '337')).toBeNull();
  });
  it('explains column by column', () => {
    expect(m5Logic.explain(item, '')).toBe(
      'On soustrait colonne par colonne, en commençant par les unités : 8 − 1 = 7, 7 − 4 = 3, 5 − 2 = 3. Le résultat est 337.',
    );
  });
});
