import { useState } from 'react';
import { ColumnOperation } from '../../components/ColumnOperation';
import { NumPad } from '../../components/NumPad';
import type { ColumnOpItem } from '../columnOps';
import type { SkillViewProps } from '../views';

const CARRY_CYCLE = ['', '1', '2'];

/** Column operation: the answer is typed from the right (units first), carries can be noted. */
export function ColumnOpView({ item, onSubmit, disabled }: SkillViewProps<ColumnOpItem>) {
  const [value, setValue] = useState('');
  const [carries, setCarries] = useState<string[]>([]);
  const toggleCarry = (column: number) =>
    setCarries((previous) => {
      const next = [...previous];
      next[column] = CARRY_CYCLE[(CARRY_CYCLE.indexOf(previous[column] ?? '') + 1) % CARRY_CYCLE.length];
      return next;
    });
  return (
    <>
      <ColumnOperation item={item} answer={value} carries={carries} onToggleCarry={item.op === '+' ? toggleCarry : undefined} />
      <NumPad
        value={value}
        onChange={setValue}
        onSubmit={() => onSubmit(value)}
        maxLength={6}
        disabled={disabled}
        direction="rtl"
        showDisplay={false}
      />
    </>
  );
}
