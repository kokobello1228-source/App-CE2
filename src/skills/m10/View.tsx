import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { NumPad } from '../../components/NumPad';
import { colors, font } from '../../theme';
import type { SkillViewProps } from '../views';
import { displayM10, type M10Item } from './logic';

export function M10View({ item, onSubmit, disabled }: SkillViewProps<M10Item>) {
  const [value, setValue] = useState('');
  return (
    <>
      <Text style={styles.calc} accessibilityLabel={displayM10(item).replace('…', 'combien')}>
        {displayM10(item)}
      </Text>
      <NumPad value={value} onChange={setValue} onSubmit={() => onSubmit(value)} maxLength={3} disabled={disabled} />
    </>
  );
}

const styles = StyleSheet.create({
  calc: { fontSize: font.huge + 8, fontWeight: '800', color: colors.text, textAlign: 'center', marginVertical: 8 },
});
