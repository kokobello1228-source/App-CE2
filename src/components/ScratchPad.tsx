import { useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import Svg, { Path } from 'react-native-svg';
import { colors, font, radius, space } from '../theme';

/** Free drawing area ("brouillon") to search a problem with the finger. */
export function ScratchPad({ height = 180 }: { height?: number }) {
  const [paths, setPaths] = useState<string[]>([]);
  const current = useRef<string>('');
  const [, force] = useState(0);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Keep drawing even if the page would like to scroll.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        force((n) => n + 1);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        force((n) => n + 1);
      },
      onPanResponderRelease: () => {
        const finished = current.current;
        current.current = '';
        setPaths((previous) => [...previous, finished]);
      },
    }),
  ).current;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>✏️ Brouillon</Text>
        <Pressable accessibilityRole="button" onPress={() => setPaths([])} style={styles.clear}>
          <Text style={styles.clearText}>Effacer</Text>
        </Pressable>
      </View>
      <View style={[styles.area, { height }]} {...responder.panHandlers} accessibilityLabel="Zone de brouillon pour dessiner">
        <Svg width="100%" height="100%" pointerEvents="none">
          {[...paths, current.current].filter(Boolean).map((d, i) => (
            <Path key={i} d={d} stroke={colors.primary} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: space.xs },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: font.body, fontWeight: '700', color: colors.textMuted },
  clear: { paddingHorizontal: space.m, paddingVertical: space.xs, borderRadius: radius.m, borderWidth: 2, borderColor: colors.border },
  clearText: { fontSize: font.small, color: colors.textMuted, fontWeight: '700' },
  area: { backgroundColor: colors.surface, borderRadius: radius.m, borderWidth: 2, borderColor: colors.border, overflow: 'hidden' },
});
