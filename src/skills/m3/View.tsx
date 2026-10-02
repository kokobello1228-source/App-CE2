import { useState } from 'react';
import { NumberLine } from '../../components/NumberLine';
import { NumPad } from '../../components/NumPad';
import type { SkillViewProps } from '../views';
import type { M3Item } from './logic';

export function M3View({ item, onSubmit, disabled }: SkillViewProps<M3Item>) {
  const [value, setValue] = useState('');
  return (
    <>
      <NumberLine item={item} />
      <NumPad value={value} onChange={setValue} onSubmit={() => onSubmit(value)} maxLength={4} disabled={disabled} />
    </>
  );
}
