import type { ComponentType } from 'react';
import type { SkillId } from '../../skills.config';
import { F1View } from './f1/View';
import { F2View } from './f2/View';
import { F3View } from './f3/View';
import { F4View } from './f4/View';
import { QcmView } from './QcmView';
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
  F1: as(F1View),
  F2: as(F2View),
  F3: as(F3View),
  F4: as(F4View),
  F5: as(QcmView),
  F6: as(QcmView),
  F7: as(QcmView),
  F8: as(F8View),
  F9: as(QcmView),
  F10: as(QcmView),
  F11: as(QcmView),
  F12: as(QcmView),
  F13: as(QcmView),
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
