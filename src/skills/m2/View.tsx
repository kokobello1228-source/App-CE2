import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { ScratchPad } from '../../components/ScratchPad';
import { colors, font, radius, space } from '../../theme';
import type { SkillViewProps } from '../views';
import { m2Logic, type M2Item } from './logic';

export function M2View({ item, onSubmit, disabled }: SkillViewProps<M2Item>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.text}>{item.text}</Text>
      </View>
      <ScratchPad />
      <Text style={styles.hint}>Choisis le bon nombre :</Text>
      <ChoiceGrid choices={m2Logic.choices!(item)} selected={selected} onSelect={setSelected} disabled={disabled} columns={3} />
      <BigButton label="Valider" onPress={() => selected && onSubmit(selected)} disabled={disabled || !selected} />
    </>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.l, padding: space.l, borderWidth: 2, borderColor: colors.border },
  text: { fontSize: font.body + 2, lineHeight: 32, color: colors.text },
  hint: { fontSize: font.body, color: colors.textMuted },
});
