import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { SeyesPaper } from '../../components/SeyesPaper';
import { Text } from '../../components/Text';
import { colors, font, fonts, radius, space } from '../../theme';
import type { TextQuestionItem } from '../textQuestions';
import type { SkillViewProps } from '../views';

/** The text, laid out like a page of a reading book. */
export function TextPage({ title, text }: { title: string; text: string }) {
  return (
    <SeyesPaper>
      <Text style={styles.title}>{title}</Text>
      {text.split(/\n\s*\n/).map((paragraph, i) => (
        <Text key={i} style={styles.paragraph}>
          {paragraph.trim()}
        </Text>
      ))}
    </SeyesPaper>
  );
}

/** Question card with the four answers. */
export function TextQuestion({ item, onSubmit, disabled }: SkillViewProps<TextQuestionItem>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <View style={styles.questionCard}>
        <Text style={styles.questionNumber}>Question {item.index + 1}</Text>
        <Text style={styles.question}>{item.question}</Text>
      </View>
      <ChoiceGrid
        choices={item.choices.map((c) => ({ id: c, label: c }))}
        selected={selected}
        onSelect={setSelected}
        disabled={disabled}
        columns={1}
      />
      <BigButton label="Valider" onPress={() => selected && onSubmit(selected)} disabled={disabled || !selected} />
    </>
  );
}

/** F1: read the whole text first, then answer; the text can be reopened at any time. */
export function F1View(props: SkillViewProps<TextQuestionItem>) {
  const { item } = props;
  const [reading, setReading] = useState(item.index === 0);
  const [showText, setShowText] = useState(false);
  if (reading) {
    return (
      <>
        <Text style={styles.hint}>📖 Lis le texte en entier. Prends ton temps.</Text>
        <TextPage title={item.title} text={item.text} />
        <BigButton label="J’ai lu, je réponds aux questions" onPress={() => setReading(false)} />
      </>
    );
  }
  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => setShowText((v) => !v)} style={styles.toggle}>
        <Text style={styles.toggleText}>{showText ? '▲ Cacher le texte' : '📖 Relire le texte'}</Text>
      </Pressable>
      {showText && <TextPage title={item.title} text={item.text} />}
      <TextQuestion {...props} />
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: font.large, fontFamily: fonts.display, color: colors.primary, marginBottom: space.s },
  paragraph: { fontSize: font.body, lineHeight: 32, color: colors.text, marginBottom: space.s },
  hint: { fontSize: font.body - 1, color: colors.textMuted },
  questionCard: { backgroundColor: colors.surface, borderRadius: radius.l, padding: space.l, gap: space.xs },
  questionNumber: { fontSize: font.small, fontFamily: fonts.bold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  question: { fontSize: font.large - 1, fontFamily: fonts.display, color: colors.text, lineHeight: 32 },
  toggle: { alignSelf: 'flex-start', paddingVertical: space.s, paddingHorizontal: space.m, borderRadius: radius.pill, backgroundColor: colors.selected },
  toggleText: { fontSize: font.small + 1, fontFamily: fonts.display, color: colors.primaryDark },
});
