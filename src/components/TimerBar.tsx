import { StyleSheet, View } from 'react-native';
import { colors, font, fonts, radius } from '../theme';
import { Text } from './Text';

/** Calm countdown: a shrinking bar and the remaining time. */
export function TimerBar({ remaining, total }: { remaining: number; total: number }) {
  const ratio = total > 0 ? Math.max(0, remaining / total) : 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, '0');
  return (
    <View style={styles.row} accessibilityLabel={`Temps restant : ${remaining} secondes`}>
      <Text style={styles.icon}>⏱</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.text}>{minutes > 0 ? `${minutes}:${seconds}` : `${remaining} s`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: font.body },
  track: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.star, borderRadius: radius.pill },
  text: { fontSize: font.body, fontFamily: fonts.display, color: colors.text, minWidth: 64, textAlign: 'right' },
});
