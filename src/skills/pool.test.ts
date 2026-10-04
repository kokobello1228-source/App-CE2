import { createRng } from '../engine/rng';
import { generateM2, m2Logic } from './m2/logic';
import { POOL_SIZE, poolItems } from './pool';

describe('item pools', () => {
  it('only produces items of the recorded pool', () => {
    const pool = new Set(poolItems(generateM2, 2).map((i) => m2Logic.speech(i)));
    const rng = createRng(42);
    for (let i = 0; i < 200; i++) expect(pool.has(m2Logic.speech(m2Logic.generate(2, rng))!)).toBe(true);
  });
  it('keeps enough variety', () => {
    expect(new Set(poolItems(generateM2, 1).map((i) => i.key)).size).toBeGreaterThan(POOL_SIZE * 0.9);
  });
});
