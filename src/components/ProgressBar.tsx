import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

/** Thin progress track across the top of an exercise. */
export function ProgressBar({ value, total, color = colors.primary }: { value: number; total: number; color?: string }) {
  const ratio = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: value }}>
      <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flex: 1, height: 12, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
