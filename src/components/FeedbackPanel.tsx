import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import { speak } from '../services/speech';
import { colors, font, fonts, radius, shadow, space } from '../theme';
import { BigButton } from './BigButton';
import { Text } from './Text';

interface Props {
  correct: boolean;
  correctLabel: string;
  explanation: string;
  onContinue(): void;
}

const CHEERS = ['Bravo !', 'Super !', 'Très bien !', 'Exact !', 'Génial !'];

/** Immediate, kind feedback that slides up: the right answer and one sentence of explanation. */
export function FeedbackPanel({ correct, correctLabel, explanation, onContinue }: Props) {
  const title = correct ? CHEERS[explanation.length % CHEERS.length] : 'Regarde bien';
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    void speak(`${title}. ${explanation}`);
  }, [title, explanation]);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) enter.setValue(1);
      else Animated.spring(enter, { toValue: 1, useNativeDriver: true, friction: 8, tension: 70 }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [enter]);

  const tint = correct ? colors.success : colors.retry;
  return (
    <Animated.View
      accessibilityLiveRegion="assertive"
      style={[
        styles.panel,
        shadow(2),
        { backgroundColor: correct ? colors.successBg : colors.retryBg, borderColor: tint },
        { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: tint }]}>
          <Text style={styles.badgeText}>{correct ? '✓' : '💡'}</Text>
        </View>
        <Text style={[styles.title, { color: tint }]}>{title}</Text>
      </View>
      {!correct && (
        <Text style={styles.answer}>
          La bonne réponse : <Text style={styles.answerValue}>{correctLabel}</Text>
        </Text>
      )}
      <Text style={styles.explanation}>{explanation}</Text>
      <BigButton label="Continuer" onPress={onContinue} color={tint} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: radius.l, padding: space.l, gap: space.m, borderWidth: 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.s + 2 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 22, color: colors.primaryText, fontFamily: fonts.bold },
  title: { fontSize: font.title, fontFamily: fonts.display },
  answer: { fontSize: font.large - 2, color: colors.text },
  answerValue: { fontFamily: fonts.bold },
  explanation: { fontSize: font.body + 1, color: colors.text, lineHeight: 30 },
});
