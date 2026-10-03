import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SeyesPaper } from '../../components/SeyesPaper';
import { Text } from '../../components/Text';
import { NumPad } from '../../components/NumPad';
import { colors, font, fonts } from '../../theme';
import type { SkillViewProps } from '../views';
import { displayM10, type M10Item } from './logic';

export function M10View({ item, onSubmit, disabled }: SkillViewProps<M10Item>) {
  const [value, setValue] = useState('');
  return (
    <>
      <SeyesPaper>
        <Text style={styles.calc} accessibilityLabel={displayM10(item).replace('…', 'combien')}>
          {displayM10(item)}
        </Text>
      </SeyesPaper>
      <NumPad value={value} onChange={setValue} onSubmit={() => onSubmit(value)} maxLength={3} disabled={disabled} />
    </>
  );
}

const styles = StyleSheet.create({
  calc: { fontSize: font.huge + 8, fontFamily: fonts.display, color: colors.text, textAlign: 'center' },
});
