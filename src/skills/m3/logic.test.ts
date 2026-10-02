import { createRng } from '../../engine/rng';
import { LEVELS } from '../types';
import { expectedM3, generateM3, m3Logic, MAX_VALUE, valueAt, type M3Item } from './logic';

describe('M3 generator', () => {
  it.each(LEVELS)('level %i gives coherent lines', (level) => {
    const rng = createRng(level * 101);
    for (let i = 0; i < 500; i++) {
      const item = generateM3(level, rng);
      const [l1, l2] = item.labels;
      expect(l1).toBeLessThan(l2);
      expect(l2).toBeLessThanOrEqual(item.intervals);
      expect(item.labels).not.toContain(item.arrow);
      expect(item.arrow).toBeGreaterThan(0);
      expect(item.arrow).toBeLessThan(item.intervals);
      expect(valueAt(item, item.intervals)).toBeLessThanOrEqual(MAX_VALUE);
      expect(item.start % item.step).toBe(0);
      if (level === 1) expect(item.step).toBe(1);
    }
  });

  it('uses steps of 1, 2, 5, 10 and 100 across levels', () => {
    const rng = createRng(9);
    const steps = new Set<number>();
    for (const level of LEVELS) for (let i = 0; i < 300; i++) steps.add(generateM3(level, rng).step);
    expect(steps).toEqual(new Set([1, 2, 5, 10, 100]));
  });

  it('sometimes starts away from 0 and sometimes labels the middle', () => {
    const rng = createRng(10);
    const items = Array.from({ length: 300 }, () => generateM3(2, rng));
    expect(items.some((i) => i.start !== 0)).toBe(true);
    expect(items.some((i) => i.labels[1] === 5)).toBe(true);
  });
});

describe('M3 checking and errors', () => {
  const item: M3Item = { key: 'k', level: 2, start: 20, step: 5, intervals: 10, labels: [0, 10], arrow: 3 };

  it('expects start + arrow × step', () => {
    expect(expectedM3(item)).toBe(35);
    expect(m3Logic.check(item, '35')).toBe(true);
  });
  it('detects counting ticks one by one', () => {
    expect(m3Logic.classifyError(item, '23')).toBe('counted_by_one');
  });
  it('detects ignoring the start of the line', () => {
    expect(m3Logic.classifyError(item, '15')).toBe('ignored_start');
  });
  it('detects an off-by-one-tick error', () => {
    expect(m3Logic.classifyError(item, '40')).toBe('off_by_one_tick');
  });
  it('explains from the nearest label', () => {
    expect(m3Logic.explain(item, '23')).toBe(
      'De 20 à 70, il y a 10 bonds, donc chaque bond vaut 5. La flèche est 3 traits après 20 : c’est 35.',
    );
  });
});
