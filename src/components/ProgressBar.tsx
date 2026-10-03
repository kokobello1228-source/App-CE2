import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';
import { Text } from './Text';

const native = Platform.OS !== 'web';

/** Chunky progress track with a star that slides forward after each question. */
export function ProgressBar({ value, total, color = colors.primary }: { value: number; total: number; color?: string }) {
  const ratio = total > 0 ? Math.min(1, value / total) : 0;
  const anim = useRef(new Animated.Value(ratio)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: ratio, useNativeDriver: false, speed: 10, bounciness: 8 }).start();
  }, [ratio, anim]);
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: value }}>
      <Animated.View style={[styles.fill, { width, backgroundColor: color }]}>
        <View style={styles.shine} />
      </Animated.View>
      <Animated.View style={[styles.knobWrap, { left: width }]}>
        <Text style={styles.knob}>⭐</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flex: 1, height: 16, borderRadius: radius.pill, backgroundColor: '#D3E1F5', justifyContent: 'center' },
  fill: { height: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  shine: { position: 'absolute', top: 3, left: 6, right: 6, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.45)' },
  knobWrap: { position: 'absolute', marginLeft: -13, top: -8 },
  knob: { fontSize: 24, lineHeight: 30 },
});
