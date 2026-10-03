import { createRng } from '../../engine/rng';
import { LEVELS } from '../types';
import { generateM9, GRID_COLS, GRID_ROWS, m9Logic, totalOf, type M9Item } from './logic';

describe('M9 generator', () => {
  it.each(LEVELS)('level %i draws exactly the counted blocks without overlap', (level) => {
    const rng = createRng(level * 23);
    for (let i = 0; i < 300; i++) {
      const item = generateM9(level, rng);
      const drawn = { plate: 0, bar: 0, cube: 0 };
      for (const c of item.cells) drawn[c.kind] += c.count;
      expect(drawn).toEqual({ plate: item.plates, bar: item.bars, cube: item.cubes });
      const slots = item.cells.map((c) => c.row * GRID_COLS + c.col);
      expect(new Set(slots).size).toBe(slots.length);
      expect(item.cells.length).toBeLessThanOrEqual(GRID_COLS * GRID_ROWS);
      expect(totalOf(item)).toBeGreaterThan(0);
      if (level === 1) expect(totalOf(item)).toBeLessThan(100);
    }
  });

  it('level 3 sometimes has more than 9 bars or cubes', () => {
    const rng = createRng(8);
    const items = Array.from({ length: 200 }, () => generateM9(3, rng));
    expect(items.some((i) => i.bars > 9 || i.cubes > 9)).toBe(true);
  });
});

describe('M9 errors', () => {
  const item: M9Item = { key: 'k', level: 1, plates: 0, bars: 6, cubes: 7, cells: [] };
  it.each([
    ['67', null], ['13', 'counted_objects'], ['76', 'reversed'], ['68', 'counting_slip'], ['', 'no_answer'],
  ])('answer %s -> %s', (answer, tag) => {
    expect(m9Logic.classifyError(item, answer)).toBe(tag);
  });
  it('detects a missing zero and missing regrouping', () => {
    expect(m9Logic.classifyError({ ...item, plates: 1, bars: 0, cubes: 8 }, '18')).toBe('missing_zero');
    expect(m9Logic.classifyError({ ...item, plates: 1, bars: 12, cubes: 5 }, '1125')).toBe('no_regrouping');
  });
  it('explains the total', () => {
    expect(m9Logic.explain({ ...item, plates: 1, bars: 0, cubes: 8 }, '')).toBe('Il y a 1 plaque (100), 8 cubes (8) : 100 + 8 = 108.');
  });
});
