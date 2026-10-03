import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SeyesPaper } from '../../components/SeyesPaper';
import { Text } from '../../components/Text';
import { BigButton } from '../../components/BigButton';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { colors, font, fonts, space } from '../../theme';
import type { SkillViewProps } from '../views';
import { m6Logic, partsText, type M6Item } from './logic';

export function M6View({ item, onSubmit, disabled }: SkillViewProps<M6Item>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <SeyesPaper>
        <Text style={styles.text}>{partsText(item.parts)} =</Text>
      </SeyesPaper>
      <ChoiceGrid choices={m6Logic.choices!(item)} selected={selected} onSelect={setSelected} disabled={disabled} />
      <BigButton label="Valider" onPress={() => selected && onSubmit(selected)} disabled={disabled || !selected} />
    </>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: font.large, lineHeight: 40, color: colors.text, fontFamily: fonts.display },
});
