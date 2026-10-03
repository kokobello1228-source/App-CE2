import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, space } from '../theme';

const LINE = 8;

/**
 * Card drawn like a page of a French school exercise book ("grands carreaux"
 * Seyès ruling): fine lines every 8 px, a stronger one every 4 lines, red margin.
 */
export function SeyesPaper({ children, style, margin = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; margin?: boolean }) {
  const [height, setHeight] = useState(0);
  const count = Math.ceil(height / LINE);
  return (
    <View style={[styles.paper, style]} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: count }, (_, i) => (
          <View
            key={i}
            style={[styles.line, { top: (i + 1) * LINE }, (i + 1) % 4 === 0 ? styles.strong : null]}
          />
        ))}
        {margin && <View style={styles.margin} />}
      </View>
      <View style={[styles.content, margin && styles.withMargin]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { backgroundColor: colors.paper, borderRadius: radius.l, overflow: 'hidden', ...shadow(1) },
  line: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.seyes, opacity: 0.55 },
  strong: { backgroundColor: colors.seyesStrong, opacity: 0.8 },
  margin: { position: 'absolute', top: 0, bottom: 0, left: 30, width: 2, backgroundColor: colors.margin, opacity: 0.55 },
  content: { padding: space.l },
  withMargin: { paddingLeft: 46 },
});
