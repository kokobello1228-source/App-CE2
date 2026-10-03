import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SeyesPaper } from '../../components/SeyesPaper';
import { Text } from '../../components/Text';
import { BigButton } from '../../components/BigButton';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { FractionFigure } from '../../components/FractionFigure';
import { FractionText } from '../../components/FractionText';
import { colors, font, fonts, space } from '../../theme';
import type { SkillViewProps } from '../views';
import { m8Logic, type M8Item } from './logic';

export function M8View({ item, onSubmit, disabled }: SkillViewProps<M8Item>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <SeyesPaper>
        <View style={styles.card}>
          <Text style={styles.text}>Dans quel cas a-t-on colorié</Text>
          <FractionText n={item.n} d={item.d} size={font.large} />
          <Text style={styles.text}>de la figure en gris ?</Text>
        </View>
      </SeyesPaper>
      <ChoiceGrid
        choices={m8Logic.choices!(item)}
        selected={selected}
        onSelect={setSelected}
        disabled={disabled}
        renderChoice={(choice) => <FractionFigure figure={item.figures[Number(choice.id)]} />}
      />
      <BigButton label="Valider" onPress={() => selected && onSubmit(selected)} disabled={disabled || !selected} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: space.s,
  },
  text: { fontSize: font.body, color: colors.text },
});
