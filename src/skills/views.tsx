import type { ComponentType } from 'react';
import type { SkillId } from '../../skills.config';
import { F2View } from './f2/View';
import { F8View } from './f8/View';
import { M10View } from './m10/View';
import { M3View } from './m3/View';
import type { ItemBase } from './types';

export interface SkillViewProps<I extends ItemBase> {
  item: I;
  onSubmit(answer: string): void;
  disabled: boolean;
}

/** Display component of each implemented skill. */
export const SKILL_VIEWS: Partial<Record<SkillId, ComponentType<SkillViewProps<ItemBase>>>> = {
  M10: M10View as ComponentType<SkillViewProps<ItemBase>>,
  M3: M3View as ComponentType<SkillViewProps<ItemBase>>,
  F8: F8View as ComponentType<SkillViewProps<ItemBase>>,
  F2: F2View as ComponentType<SkillViewProps<ItemBase>>,
};
