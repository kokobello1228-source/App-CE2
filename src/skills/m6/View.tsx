import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { colors, font, radius, space } from '../../theme';
import type { SkillViewProps } from '../views';
import { m6Logic, partsText, type M6Item } from './logic';

export function M6View({ item, onSubmit, disabled }: SkillViewProps<M6Item>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.text}>{partsText(item.parts)} =</Text>
      </View>
      <ChoiceGrid choices={m6Logic.choices!(item)} selected={selected} onSelect={setSelected} disabled={disabled} />
      <BigButton label="Valider" onPress={() => selected && onSubmit(selected)} disabled={disabled || !selected} />
    </>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.l, padding: space.l },
  text: { fontSize: font.large, lineHeight: 36, color: colors.text, fontWeight: '600' },
});
