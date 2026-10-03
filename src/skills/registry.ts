import type { SkillId } from '../../skills.config';
import { f2Logic } from './f2/logic';
import { f8Logic } from './f8/logic';
import { m10Logic } from './m10/logic';
import { m11Logic } from './m11/logic';
import { m1Logic } from './m1/logic';
import { m2Logic } from './m2/logic';
import { m3Logic } from './m3/logic';
import { m4Logic } from './m4/logic';
import { m5Logic } from './m5/logic';
import { m6Logic } from './m6/logic';
import { m7Logic } from './m7/logic';
import { m8Logic } from './m8/logic';
import { m9Logic } from './m9/logic';
import type { AnySkillLogic, ItemBase, SkillLogic } from './types';

const as = (logic: unknown) => logic as AnySkillLogic;

/** Pure logic of every implemented skill. Skills not listed here are shown as "bientôt". */
export const SKILL_LOGIC: Partial<Record<SkillId, AnySkillLogic>> = {
  F2: as(f2Logic),
  F8: as(f8Logic),
  M1: as(m1Logic),
  M2: as(m2Logic),
  M3: as(m3Logic),
  M4: as(m4Logic),
  M5: as(m5Logic),
  M6: as(m6Logic),
  M7: as(m7Logic),
  M8: as(m8Logic),
  M9: as(m9Logic),
  M10: as(m10Logic),
  M11: as(m11Logic),
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
