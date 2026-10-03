import { concatenatedColumns, hasCarry, leftAligned, resultOf, sumWithoutCarry } from './columnOps';

describe('column operation helpers', () => {
  it('computes results', () => {
    expect(resultOf({ op: '+', terms: [83, 6, 556] })).toBe(645);
    expect(resultOf({ op: '-', terms: [578, 241] })).toBe(337);
  });
  it('detects carries', () => {
    expect(hasCarry([43, 53])).toBe(false);
    expect(hasCarry([595, 45])).toBe(true);
  });
  it('models typical mistakes', () => {
    expect(sumWithoutCarry([595, 45])).toBe(530);
    expect(concatenatedColumns([47, 35])).toBe(712);
    expect(leftAligned({ op: '+', terms: [83, 6] })).toBe(143);
    expect(leftAligned({ op: '-', terms: [159, 48] })).toBe(-321);
  });
});
