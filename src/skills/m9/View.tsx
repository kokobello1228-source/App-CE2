import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg from 'react-native-svg';
import { Bar, Base10Blocks, Cube, Plate } from '../../components/Base10Blocks';
import { NumPad } from '../../components/NumPad';
import { colors, font, radius, space } from '../../theme';
import type { SkillViewProps } from '../views';
import type { M9Item } from './logic';

/** Reminder of the value of each block, as at the top of the booklet page. */
function Legend() {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <Svg width={21} height={21}><Cube x={2} y={2} /></Svg>
        <Text style={styles.legendText}>= 1</Text>
      </View>
      <View style={styles.legendItem}>
        <Svg width={17} height={94}><Bar x={2} y={2} /></Svg>
        <Text style={styles.legendText}>= 10</Text>
      </View>
      <View style={styles.legendItem}>
        <Svg width={94} height={94}><Plate x={2} y={2} /></Svg>
        <Text style={styles.legendText}>= 100</Text>
      </View>
    </View>
  );
}

export function M9View({ item, onSubmit, disabled }: SkillViewProps<M9Item>) {
  const [value, setValue] = useState('');
  return (
    <>
      <Legend />
      <Base10Blocks cells={item.cells} />
      <Text style={styles.sentence}>Il y a {value || '…'} cubes.</Text>
      <NumPad value={value} onChange={setValue} onSubmit={() => onSubmit(value)} maxLength={4} disabled={disabled} showDisplay={false} />
    </>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.m, padding: space.s,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  legendText: { fontSize: font.body, fontWeight: '700', color: colors.text },
  sentence: { fontSize: font.large, color: colors.text, textAlign: 'center', fontWeight: '600' },
});
