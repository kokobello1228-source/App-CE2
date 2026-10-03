import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SeyesPaper } from '../../components/SeyesPaper';
import { Text } from '../../components/Text';
import { BigButton } from '../../components/BigButton';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { colors, font, fonts, space } from '../../theme';
import type { SkillViewProps } from '../views';
import { f8Logic, splitSentence, type F8Item } from './logic';

export function F8View({ item, onSubmit, disabled }: SkillViewProps<F8Item>) {
  const [selected, setSelected] = useState<string | null>(null);
  const { before, verb, after } = splitSentence(item.sentence);
  return (
    <>
      <SeyesPaper>
        <Text style={styles.sentence}>
          {before}
          <Text style={styles.verb}>{verb}</Text>
          {after}
        </Text>
        <Text style={styles.question}>Dans cette phrase, le temps du verbe souligné est :</Text>
      </SeyesPaper>
      <ChoiceGrid choices={f8Logic.choices!(item)} selected={selected} onSelect={setSelected} disabled={disabled} />
      <BigButton label="Valider" onPress={() => selected && onSubmit(selected)} disabled={disabled || !selected} />
    </>
  );
}

const styles = StyleSheet.create({
  sentence: { fontSize: font.large + 2, lineHeight: 40, color: colors.text },
  question: { fontSize: font.body, color: colors.textMuted, marginTop: space.s },
  verb: { textDecorationLine: 'underline', fontWeight: '800', color: colors.primaryDark },
});
