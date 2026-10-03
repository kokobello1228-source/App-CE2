import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, View } from 'react-native';
import { playPop } from '../services/feedback';
import { colors, font } from '../theme';
import { Text } from './Text';

const native = Platform.OS !== 'web';

/**
 * Stars drawn as round stickers ("gommettes"). With `animate`, earned stars pop in
 * one after the other with a little sound.
 */
export function Stars({ count, max = 3, size = font.large, animate = false }: { count: number; max?: number; size?: number; animate?: boolean }) {
  const diameter = size * 1.3;
  const scales = useRef(Array.from({ length: max }, () => new Animated.Value(animate ? 0 : 1))).current;

  useEffect(() => {
    if (!animate) return;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      scales.forEach((s, i) => {
        if (reduce || i >= count) {
          s.setValue(1);
          return;
        }
        setTimeout(() => {
          if (cancelled) return;
          playPop();
          Animated.spring(s, { toValue: 1, useNativeDriver: native, speed: 12, bounciness: 18 }).start();
        }, 450 + i * 420);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [animate, count, scales]);

  return (
    <View style={styles.row} accessible accessibilityLabel={`${count} étoile${count > 1 ? 's' : ''} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const on = i < count;
        return (
          <Animated.View
            key={i}
            style={[
              styles.sticker,
              { width: diameter, height: diameter, borderRadius: diameter / 2 },
              on ? styles.on : styles.off,
              { transform: [{ scale: scales[i] }, { rotate: on ? `${(i - 1) * 8}deg` : '0deg' }] },
            ]}
          >
            <Text style={{ fontSize: size * 0.78, lineHeight: size, color: on ? '#FFFFFF' : colors.border }}>★</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5 },
  sticker: { alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: colors.star, borderBottomWidth: 3, borderBottomColor: colors.starDark },
  off: { borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
});
