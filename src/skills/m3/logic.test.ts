import { OFFICIAL_M3_LINES } from '../../content/officialItems';
import { createRng } from '../../engine/rng';
import { LEVELS } from '../types';
import { expectedM3, generateM3, m3Logic, MAX_VALUE, valueAt, type M3Item } from './logic';

describe('M3 generator (official format)', () => {
  it.each(LEVELS)('level %i gives lines labelled at both ends', (level) => {
    const rng = createRng(level * 101);
    for (let i = 0; i < 500; i++) {
      const item = generateM3(level, rng);
      expect(item.labels).toEqual([0, item.intervals]);
      expect(item.intervals).toBeGreaterThanOrEqual(2);
      expect(item.intervals).toBeLessThanOrEqual(10);
      expect(item.arrow).toBeGreaterThan(0);
      expect(item.arrow).toBeLessThan(item.intervals);
      expect(valueAt(item, item.intervals)).toBeLessThanOrEqual(MAX_VALUE);
      expect(OFFICIAL_M3_LINES).not.toContain(`${item.start}-${valueAt(item, item.intervals)}`);
      if (level === 1) {
        expect(item.step).toBe(1);
        expect(valueAt(item, item.intervals)).toBeLessThan(100);
      }
      if (level === 2) expect([1, 10]).toContain(item.step);
    }
  });

  it('uses steps of 1, 2, 5, 10 and 100 across levels', () => {
    const rng = createRng(9);
    const steps = new Set<number>();
    for (const level of LEVELS) for (let i = 0; i < 300; i++) steps.add(generateM3(level, rng).step);
    expect(steps).toEqual(new Set([1, 2, 5, 10, 100]));
  });

  it('often starts away from 0', () => {
    const rng = createRng(10);
    const items = Array.from({ length: 300 }, () => generateM3(2, rng));
    expect(items.filter((i) => i.start !== 0).length).toBeGreaterThan(150);
  });
});

describe('M3 checking and errors', () => {
  const item: M3Item = { key: 'k', level: 3, start: 20, step: 5, intervals: 4, labels: [0, 4], arrow: 3 };

  it('expects start + arrow × step', () => {
    expect(expectedM3(item)).toBe(35);
    expect(m3Logic.check(item, '35')).toBe(true);
  });
  it('detects counting ticks one by one', () => {
    // nearest label is 40 (index 4): 40 - 1 = 39
    expect(m3Logic.classifyError(item, '39')).toBe('counted_by_one');
  });
  it('detects ignoring the start of the line', () => {
    expect(m3Logic.classifyError(item, '15')).toBe('ignored_start');
  });
  it('detects an off-by-one-tick error', () => {
    expect(m3Logic.classifyError(item, '30')).toBe('off_by_one_tick');
  });
  it('explains from the nearest label', () => {
    expect(m3Logic.explain(item, '39')).toBe(
      'De 20 à 40, il y a 4 bonds, donc chaque bond vaut 5. La flèche est 1 trait avant 40 : c’est 35.',
    );
  });
});
