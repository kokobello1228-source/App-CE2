import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SeyesPaper } from '../../components/SeyesPaper';
import { Text } from '../../components/Text';
import { BigButton } from '../../components/BigButton';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { ScratchPad } from '../../components/ScratchPad';
import { colors, font, fonts, space } from '../../theme';
import type { SkillViewProps } from '../views';
import { m2Logic, type M2Item } from './logic';

export function M2View({ item, onSubmit, disabled }: SkillViewProps<M2Item>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <SeyesPaper>
        <Text style={styles.text}>{item.text}</Text>
      </SeyesPaper>
      <ScratchPad />
      <Text style={styles.hint}>Choisis le bon nombre :</Text>
      <ChoiceGrid choices={m2Logic.choices!(item)} selected={selected} onSelect={setSelected} disabled={disabled} columns={3} />
      <BigButton label="Valider" onPress={() => selected && onSubmit(selected)} disabled={disabled || !selected} />
    </>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: font.body + 2, lineHeight: 32, color: colors.text },
  hint: { fontSize: font.body, color: colors.textMuted },
});
