import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { BigButton } from '../components/BigButton';
import { ChoiceGrid } from '../components/ChoiceGrid';
import { MarkedText } from '../components/MarkedText';
import { SeyesPaper } from '../components/SeyesPaper';
import { Text } from '../components/Text';
import { colors, font } from '../theme';
import type { QcmItem } from './qcm';
import type { SkillViewProps } from './views';

/** Generic multiple-choice view: stem on notebook paper, 4 answer cards, validate. */
export function QcmView({ item, onSubmit, disabled }: SkillViewProps<QcmItem>) {
  const [selected, setSelected] = useState<string | null>(null);
  const long = item.choices.some((c) => c.length > 18);
  return (
    <>
      <SeyesPaper>
        <MarkedText text={item.stem} style={styles.stem} />
        {item.question ? <Text style={styles.question}>{item.question}</Text> : null}
      </SeyesPaper>
      <ChoiceGrid
        choices={item.choices.map((c) => ({ id: c, label: c }))}
        selected={selected}
        onSelect={setSelected}
        disabled={disabled}
        columns={long ? 1 : 2}
      />
      <BigButton label="Valider" onPress={() => selected && onSubmit(selected)} disabled={disabled || !selected} />
    </>
  );
}

const styles = StyleSheet.create({
  stem: { fontSize: font.large + 1, lineHeight: 40, color: colors.text },
  question: { fontSize: font.body - 1, color: colors.textMuted, marginTop: 8 },
});
