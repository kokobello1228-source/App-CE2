import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, View } from 'react-native';
import { CHEERS, RETRY_TITLE } from '../content/phrases';
import { playSuccess } from '../services/feedback';
import { speak } from '../services/speech';
import { colors, font, fonts, radius, shadow, space } from '../theme';
import { BigButton } from './BigButton';
import { Confetti } from './Confetti';
import { Mascot } from './Mascot';
import { SpeakButton } from './SpeakButton';
import { Text } from './Text';

interface Props {
  correct: boolean;
  correctLabel: string;
  explanation: string;
  onContinue(): void;
}

const native = Platform.OS !== 'web';

/**
 * Feedback after an answer: Plume jumps for joy (confetti and chime) or looks
 * thoughtful and explains kindly. Never red, never a "wrong" sound.
 */
export function FeedbackPanel({ correct, correctLabel, explanation, onContinue }: Props) {
  const title = correct ? CHEERS[explanation.length % CHEERS.length] : RETRY_TITLE;
  const enter = useRef(new Animated.Value(0)).current;
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (correct) {
      playSuccess();
      setBurst(1);
      void speak(title);
    } else {
      void speak(`${title} ${explanation}`);
    }
  }, [correct, title, explanation]);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) enter.setValue(1);
      else Animated.spring(enter, { toValue: 1, useNativeDriver: native, friction: 7, tension: 80 }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [enter]);

  const tint = correct ? colors.success : colors.primary;
  return (
    <View>
      <Animated.View
        accessibilityLiveRegion="assertive"
        style={[
          styles.panel,
          shadow(2),
          { borderColor: tint },
          { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }, { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] },
        ]}
      >
        <View style={styles.header}>
          <Mascot mood={correct ? 'cheer' : 'think'} size={92} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.title, { color: tint }]}>{title}</Text>
            {!correct && (
              <Text style={styles.answer}>
                La bonne réponse : <Text style={styles.answerValue}>{correctLabel}</Text>
              </Text>
            )}
          </View>
        </View>
        <View style={[styles.explainBox, { backgroundColor: correct ? colors.successBg : colors.retryBg }]}>
          <Text style={styles.explanation}>{explanation}</Text>
          {correct && <SpeakButton text={explanation} label="Écouter l’explication" />}
        </View>
        <BigButton label="Continuer" onPress={onContinue} color={tint} />
      </Animated.View>
      <View pointerEvents="none" style={styles.confetti}>
        <Confetti burst={burst} count={22} height={420} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  confetti: { position: 'absolute', top: -120, left: 0, right: 0, height: 420 },
  panel: { borderRadius: radius.l, padding: space.m + 4, gap: space.m, borderWidth: 3, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  title: { fontSize: font.title, fontFamily: fonts.display, lineHeight: 38 },
  answer: { fontSize: font.body, color: colors.text, lineHeight: 26 },
  answerValue: { fontFamily: fonts.bold },
  explainBox: { borderRadius: radius.m, padding: space.m, gap: space.s },
  explanation: { fontSize: font.body, color: colors.text, lineHeight: 29 },
});
