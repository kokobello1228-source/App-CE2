import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, space } from '../theme';

/** White bubble with a tail pointing to the mascot on its left. */
export function SpeechBubble({ children, style, tail = 'left' }: { children: ReactNode; style?: StyleProp<ViewStyle>; tail?: 'left' | 'top' }) {
  return (
    <View style={[styles.bubble, shadow(1), style]}>
      <View style={tail === 'left' ? styles.tail : styles.tailTop} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.l, padding: space.m, gap: 2 },
  tail: {
    position: 'absolute', left: -8, top: 28, width: 18, height: 18, backgroundColor: colors.surface,
    transform: [{ rotate: '45deg' }], borderRadius: 3,
  },
  tailTop: {
    position: 'absolute', top: -8, alignSelf: 'center', left: '50%', marginLeft: -9, width: 18, height: 18,
    backgroundColor: colors.surface, transform: [{ rotate: '45deg' }], borderRadius: 3,
  },
});
