import { nextLevel } from './adaptive';

const t = true;
const f = false;

describe('nextLevel', () => {
  it('stays put with too few answers', () => {
    expect(nextLevel(1, [t, t, t])).toBe(1);
  });
  it('moves up at 80 % over at least 8 answers', () => {
    expect(nextLevel(1, [t, t, t, t, t, t, t, f])).toBe(2);
    expect(nextLevel(2, [t, t, t, t, t, t, f, f])).toBe(2);
  });
  it('never goes above 3 or below 1', () => {
    expect(nextLevel(3, Array(10).fill(t))).toBe(3);
    expect(nextLevel(1, Array(10).fill(f))).toBe(1);
  });
  it('moves down under 50 % over at least 6 answers', () => {
    expect(nextLevel(2, [f, f, f, f, t, t])).toBe(1);
    expect(nextLevel(2, [f, f, f, t, t, t])).toBe(2);
  });
  it('only looks at the last 10 answers', () => {
    expect(nextLevel(2, [...Array(10).fill(f), ...Array(10).fill(t)])).toBe(3);
  });
});
