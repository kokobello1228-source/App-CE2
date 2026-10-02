import { SCORE_GROUPS } from '../../skills.config';
import {
  bandForScore, estimateSkillBand, fluencyBand, groupBand, scaleToOfficial, wordsCorrectPerMinute,
} from './scoring';

describe('bandForScore uses the official thresholds', () => {
  it.each([
    ['M10', 9, 'besoins'], ['M10', 10, 'fragile'], ['M10', 13, 'fragile'], ['M10', 14, 'satisfaisant'],
    ['M3', 4, 'besoins'], ['M3', 5, 'fragile'], ['M3', 6, 'fragile'], ['M3', 7, 'satisfaisant'],
    ['F2', 3, 'besoins'], ['F2', 4, 'fragile'], ['F2', 6, 'fragile'], ['F2', 7, 'satisfaisant'],
    ['F8F9', 5, 'besoins'], ['F8F9', 6, 'fragile'], ['F8F9', 9, 'fragile'], ['F8F9', 10, 'satisfaisant'],
    ['F3F4', 6, 'besoins'], ['F3F4', 7, 'fragile'], ['F3F4', 9, 'satisfaisant'],
    ['M4M5', 2, 'besoins'], ['M4M5', 3, 'fragile'], ['M4M5', 6, 'fragile'], ['M4M5', 7, 'satisfaisant'],
  ] as const)('%s score %i -> %s', (group, score, band) => {
    expect(bandForScore(SCORE_GROUPS[group], score)).toBe(band);
  });
});

describe('scaleToOfficial', () => {
  it('projects a rate onto the official item count', () => {
    expect(scaleToOfficial(6, 8, 12)).toBe(9);
    expect(scaleToOfficial(0, 0, 12)).toBe(0);
    expect(scaleToOfficial(10, 10, 20)).toBe(20);
  });
});

describe('estimateSkillBand', () => {
  it('returns null without attempts', () => {
    expect(estimateSkillBand('M3', 0, 0)).toBeNull();
  });
  it('projects grouped skills onto the group maximum (F8 on 16)', () => {
    // 5/8 = 10/16 -> satisfaisant ; 4/8 = 8/16 -> fragile
    expect(estimateSkillBand('F8', 5, 8)).toBe('satisfaisant');
    expect(estimateSkillBand('F8', 4, 8)).toBe('fragile');
    expect(estimateSkillBand('F8', 2, 8)).toBe('besoins');
  });
});

describe('groupBand', () => {
  it('needs every skill of the group', () => {
    expect(groupBand('F8F9', { F8: { correct: 8, total: 8 } })).toBeNull();
  });
  it('sums scaled scores', () => {
    expect(groupBand('F8F9', { F8: { correct: 4, total: 8 }, F9: { correct: 6, total: 8 } })).toEqual({
      score: 10, band: 'satisfaisant',
    });
    expect(groupBand('M10', { M10: { correct: 12, total: 20 } })).toEqual({ score: 12, band: 'fragile' });
  });
});

describe('fluency', () => {
  it('counts correct words in one minute', () => {
    expect(wordsCorrectPerMinute(75, 5, 60)).toBe(70);
  });
  it('extrapolates when the text is finished early', () => {
    expect(wordsCorrectPerMinute(140, 0, 50)).toBe(168);
  });
  it('never goes below zero and caps time at 60 s', () => {
    expect(wordsCorrectPerMinute(3, 5, 60)).toBe(0);
    expect(wordsCorrectPerMinute(60, 0, 90)).toBe(60);
  });
  it('maps to the official bands', () => {
    expect(fluencyBand(49)).toBe('besoins');
    expect(fluencyBand(50)).toBe('fragile');
    expect(fluencyBand(70)).toBe('satisfaisant');
  });
});
