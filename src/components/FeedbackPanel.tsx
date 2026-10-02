import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { speak } from '../services/speech';
import { colors, font, radius, space } from '../theme';
import { BigButton } from './BigButton';

interface Props {
  correct: boolean;
  correctLabel: string;
  explanation: string;
  onContinue(): void;
}

const CHEERS = ['Bravo !', 'Super !', 'Très bien !', 'Exact !'];

/** Immediate, kind feedback: the right answer and one sentence of explanation. */
export function FeedbackPanel({ correct, correctLabel, explanation, onContinue }: Props) {
  const title = correct ? CHEERS[explanation.length % CHEERS.length] : 'Regarde bien :';
  useEffect(() => {
    void speak(`${title} ${explanation}`);
  }, [title, explanation]);
  return (
    <View
      style={[styles.panel, correct ? styles.correct : styles.retry]}
      accessibilityLiveRegion="assertive"
    >
      <Text style={[styles.title, { color: correct ? colors.success : colors.retry }]}>
        {correct ? '✓ ' : ''}
        {title}
      </Text>
      {!correct && (
        <Text style={styles.answer}>
          La bonne réponse : <Text style={styles.answerValue}>{correctLabel}</Text>
        </Text>
      )}
      <Text style={styles.explanation}>{explanation}</Text>
      <BigButton label="Continuer" onPress={onContinue} color={correct ? colors.success : colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: radius.l, padding: space.l, gap: space.m, borderWidth: 3 },
  correct: { backgroundColor: colors.successBg, borderColor: colors.success },
  retry: { backgroundColor: colors.retryBg, borderColor: colors.retry },
  title: { fontSize: font.title, fontWeight: '800' },
  answer: { fontSize: font.large, color: colors.text },
  answerValue: { fontWeight: '800' },
  explanation: { fontSize: font.body + 2, color: colors.text, lineHeight: 30 },
});
