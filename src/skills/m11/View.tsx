import { M10View } from '../m10/View';
import type { SkillViewProps } from '../views';
import type { M11Item } from './logic';

/** Same display as M10: one addition with a blank and the number pad. */
export function M11View(props: SkillViewProps<M11Item>) {
  return <M10View {...(props as unknown as Parameters<typeof M10View>[0])} />;
}
