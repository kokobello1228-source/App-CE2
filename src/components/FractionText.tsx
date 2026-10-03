import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors, font } from '../theme';

/** Fraction written as in a school book: numerator above a bar, denominator below. */
export function FractionText({ n, d, size = font.title, color = colors.text }: { n: number; d: number; size?: number; color?: string }) {
  return (
    <View style={styles.box} accessible accessibilityLabel={`${n} sur ${d}`}>
      <Text style={[styles.digit, { fontSize: size, color }]}>{n}</Text>
      <View style={[styles.bar, { backgroundColor: color, width: size * (String(Math.max(n, d)).length * 0.6 + 0.6) }]} />
      <Text style={[styles.digit, { fontSize: size, color }]}>{d}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  digit: { fontWeight: '700', lineHeight: undefined },
  bar: { height: 3, marginVertical: 2, borderRadius: 2 },
});
