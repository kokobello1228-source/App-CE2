import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { FractionText } from '../../components/FractionText';
import { colors, font, radius, space } from '../../theme';
import { fractionWords } from '../fractions';
import type { SkillViewProps } from '../views';
import { m7Logic, type M7Item } from './logic';

export function M7View({ item, onSubmit, disabled }: SkillViewProps<M7Item>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.words}>« {fractionWords(item)} »</Text>
      </View>
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
  card: { backgroundColor: colors.surface, borderRadius: radius.l, padding: space.l, alignItems: 'center' },
  words: { fontSize: font.title, color: colors.text, fontWeight: '700' },
});
