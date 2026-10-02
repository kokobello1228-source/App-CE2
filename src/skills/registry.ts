import type { SkillId } from '../../skills.config';
import { f2Logic } from './f2/logic';
import { f8Logic } from './f8/logic';
import { m10Logic } from './m10/logic';
import { m3Logic } from './m3/logic';
import type { AnySkillLogic, ItemBase, SkillLogic } from './types';

/** Pure logic of every implemented skill. Skills not listed here are shown as "bientôt". */
export const SKILL_LOGIC: Partial<Record<SkillId, AnySkillLogic>> = {
  M10: m10Logic as unknown as AnySkillLogic,
  M3: m3Logic as unknown as AnySkillLogic,
  F8: f8Logic as unknown as AnySkillLogic,
  F2: f2Logic as unknown as AnySkillLogic,
};

export function getLogic<I extends ItemBase = ItemBase>(skillId: SkillId): SkillLogic<I> {
  const logic = SKILL_LOGIC[skillId];
  if (!logic) throw new Error(`Skill ${skillId} is not implemented yet`);
  return logic as unknown as SkillLogic<I>;
}

export function isAvailable(skillId: SkillId): boolean {
  return SKILL_LOGIC[skillId] !== undefined;
}

export function availableSkills(): SkillId[] {
  return Object.keys(SKILL_LOGIC) as SkillId[];
}
