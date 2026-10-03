import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SeyesPaper } from '../../components/SeyesPaper';
import { Text } from '../../components/Text';
import { BigButton } from '../../components/BigButton';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { FractionText } from '../../components/FractionText';
import { colors, font, fonts, space } from '../../theme';
import { fractionWords } from '../fractions';
import type { SkillViewProps } from '../views';
import { m7Logic, type M7Item } from './logic';

export function M7View({ item, onSubmit, disabled }: SkillViewProps<M7Item>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <SeyesPaper>
        <Text style={styles.words}>« {fractionWords(item)} »</Text>
      </SeyesPaper>
      <ChoiceGrid
        choices={m7Logic.choices!(item)}
        selected={selected}
        onSelect={setSelected}
        disabled={disabled}
        renderChoice={(choice, isSelected) => {
          const [n, d] = choice.id.split('/').map(Number);
          return <FractionText n={n} d={d} color={isSelected ? colors.primary : colors.text} />;
        }}
      />
      <BigButton label="Valider" onPress={() => selected && onSubmit(selected)} disabled={disabled || !selected} />
    </>
  );
}

const styles = StyleSheet.create({
  words: { fontSize: font.title, color: colors.text, fontFamily: fonts.display, textAlign: 'center' },
});
