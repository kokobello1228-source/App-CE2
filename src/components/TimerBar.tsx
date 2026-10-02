import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, space } from '../theme';

/** Calm countdown: a shrinking bar and the remaining seconds. */
export function TimerBar({ remaining, total }: { remaining: number; total: number }) {
  const ratio = total > 0 ? Math.max(0, remaining / total) : 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, '0');
  return (
    <View style={styles.row} accessibilityLabel={`Temps restant : ${remaining} secondes`}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.text}>⏱ {minutes > 0 ? `${minutes}:${seconds}` : `${remaining} s`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  track: { flex: 1, height: 14, borderRadius: radius.m, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary },
  text: { fontSize: font.body, fontWeight: '700', color: colors.text, minWidth: 80, textAlign: 'right' },
});
