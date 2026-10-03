import { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const PALETTE = [colors.star, colors.primary, colors.domain.fr, colors.domain.math, colors.coral, '#FF8FB1'];
const native = Platform.OS !== 'web';

/** A burst of confetti falling over its parent. Changing `burst` replays it. */
export function Confetti({ burst, count = 26, height = 520 }: { burst: number; count?: number; height?: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 37) % 100}%` as const,
        delay: (i % 7) * 0.04,
        drift: ((i * 53) % 60) - 30,
        spin: ((i * 97) % 720) - 360,
        size: 7 + ((i * 13) % 7),
        round: i % 3 === 0,
        color: PALETTE[i % PALETTE.length],
      })),
    // New pieces for each burst.
    [burst, count],
  );

  useEffect(() => {
    if (burst === 0) return;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce || cancelled) return;
      progress.setValue(0);
      Animated.timing(progress, { toValue: 1, duration: 1700, useNativeDriver: native }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [burst, progress]);

  if (burst === 0) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const t = progress.interpolate({ inputRange: [p.delay, 1], outputRange: [0, 1], extrapolate: 'clamp' });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              top: -16,
              left: p.left,
              width: p.size,
              height: p.round ? p.size : p.size * 1.6,
              borderRadius: p.round ? p.size / 2 : 2,
              backgroundColor: p.color,
              opacity: t.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, height] }) },
                { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
                { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
              ],
            }}
          />
        );
      })}
    </View>
  );
}
