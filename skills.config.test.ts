import { SCORE_GROUPS, SKILL_ORDER, SKILLS } from './skills.config';

describe('skills.config', () => {
  it('lists the 25 assessed skills', () => {
    expect(SKILL_ORDER).toHaveLength(25);
    expect(new Set(SKILL_ORDER)).toEqual(new Set(Object.keys(SKILLS)));
  });

  it('has coherent thresholds', () => {
    for (const group of Object.values(SCORE_GROUPS)) {
      expect(group.fragileMin).toBeGreaterThan(0);
      expect(group.satisfaisantMin).toBeGreaterThan(group.fragileMin);
      expect(group.satisfaisantMin).toBeLessThanOrEqual(group.maxScore);
    }
  });

  it('sets each group maximum to the sum of its official items', () => {
    for (const group of Object.values(SCORE_GROUPS)) {
      if (group.unit !== 'items') continue;
      const sum = group.skills.reduce((acc, id) => acc + SKILLS[id].officialItems, 0);
      expect(group.maxScore).toBe(sum);
      for (const id of group.skills) expect(SKILLS[id].scoreGroup).toBe(group.id);
    }
  });
});
