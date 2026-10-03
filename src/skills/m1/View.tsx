import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { NumPad } from '../../components/NumPad';
import { colors, font } from '../../theme';
import type { SkillViewProps } from '../views';
import type { M1Item } from './logic';

export function M1View({ onSubmit, disabled }: SkillViewProps<M1Item>) {
  const [value, setValue] = useState('');
  return (
    <>
      <Text style={styles.hint}>Écris le nombre que tu entends :</Text>
      <NumPad value={value} onChange={setValue} onSubmit={() => onSubmit(value)} maxLength={4} disabled={disabled} />
    </>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: font.body, color: colors.textMuted, textAlign: 'center' },
});
