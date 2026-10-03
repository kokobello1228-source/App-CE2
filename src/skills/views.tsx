import type { ComponentType } from 'react';
import type { SkillId } from '../../skills.config';
import { F2View } from './f2/View';
import { F8View } from './f8/View';
import { M10View } from './m10/View';
import { M11View } from './m11/View';
import { M1View } from './m1/View';
import { M2View } from './m2/View';
import { M3View } from './m3/View';
import { ColumnOpView } from './m4/View';
import { M6View } from './m6/View';
import { M7View } from './m7/View';
import { M8View } from './m8/View';
import { M9View } from './m9/View';
import type { ItemBase } from './types';

export interface SkillViewProps<I extends ItemBase> {
  item: I;
  onSubmit(answer: string): void;
  disabled: boolean;
}

type AnyView = ComponentType<SkillViewProps<ItemBase>>;
const as = (view: unknown) => view as AnyView;

/** Display component of each implemented skill. */
export const SKILL_VIEWS: Partial<Record<SkillId, AnyView>> = {
  F2: as(F2View),
  F8: as(F8View),
  M1: as(M1View),
  M2: as(M2View),
  M3: as(M3View),
  M4: as(ColumnOpView),
  M5: as(ColumnOpView),
  M6: as(M6View),
  M7: as(M7View),
  M8: as(M8View),
  M9: as(M9View),
  M10: as(M10View),
  M11: as(M11View),
};
