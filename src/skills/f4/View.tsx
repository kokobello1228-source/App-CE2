import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { F4Scene } from '../../components/F4Scene';
import { Text } from '../../components/Text';
import { colors, font } from '../../theme';
import type { SkillViewProps } from '../views';
import { f4Logic, type F4Item } from './logic';

/** The sentence is only heard (official format); four pictures to choose from. */
export function F4View({ item, onSubmit, disabled }: SkillViewProps<F4Item>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <Text style={styles.hint}>👂 Écoute la phrase, puis touche la bonne image.</Text>
      <ChoiceGrid
        choices={f4Logic.choices!(item)}
        selected={selected}
        onSelect={setSelected}
        disabled={disabled}
        renderChoice={(choice) => <F4Scene scene={item.scenes[Number(choice.id)]} />}
      />
      <BigButton label="Valider" onPress={() => selected && onSubmit(selected)} disabled={disabled || !selected} />
    </>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: font.body - 1, color: colors.textMuted },
});
