import {
  SCORE_GROUPS, SKILLS,
  type Band, type ScoreGroup, type ScoreGroupId, type SkillId,
} from '../../skills.config';

export const BAND_LABELS: Record<Band, string> = {
  besoins: 'À besoins',
  fragile: 'Fragile',
  satisfaisant: 'Satisfaisant',
};

export function bandForScore(group: ScoreGroup, score: number): Band {
  if (score >= group.satisfaisantMin) return 'satisfaisant';
  if (score >= group.fragileMin) return 'fragile';
  return 'besoins';
}

/** Brings a success rate back to the official number of items (e.g. 6/8 on M3 -> 9/12). */
export function scaleToOfficial(correct: number, total: number, officialItems: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * officialItems);
}

/**
 * Band estimate for a single skill, from any number of attempts.
 * For grouped skills (e.g. F8+F9) the rate is projected onto the group maximum.
 */
export function estimateSkillBand(skillId: SkillId, correct: number, total: number): Band | null {
  if (total <= 0) return null;
  const group = SCORE_GROUPS[SKILLS[skillId].scoreGroup];
  if (group.unit !== 'items') return null;
  return bandForScore(group, scaleToOfficial(correct, total, group.maxScore));
}

export interface SkillScore {
  correct: number;
  total: number;
}

/**
 * Official band of a score group, once every skill of the group has a result.
 * Each skill result is scaled to its own official item count before summing.
 */
export function groupBand(
  groupId: ScoreGroupId,
  results: Partial<Record<SkillId, SkillScore>>,
): { score: number; band: Band } | null {
  const group = SCORE_GROUPS[groupId];
  if (group.unit !== 'items') return null;
  let score = 0;
  for (const skillId of group.skills) {
    const result = results[skillId];
    if (!result) return null;
    score += scaleToOfficial(result.correct, result.total, SKILLS[skillId].officialItems);
  }
  return { score, band: bandForScore(group, score) };
}

/**
 * Words correctly read per minute (fluency, F14).
 * If the text is finished before 60 s, the score is extrapolated to one minute.
 */
export function wordsCorrectPerMinute(wordsRead: number, errors: number, seconds: number): number {
  const correct = Math.max(0, wordsRead - errors);
  const duration = Math.min(Math.max(seconds, 1), 60);
  return Math.round((correct * 60) / duration);
}

export function fluencyBand(wcpm: number): Band {
  return bandForScore(SCORE_GROUPS.F14, wcpm);
}
