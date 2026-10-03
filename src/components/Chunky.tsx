import { useRef, type ReactNode } from 'react';
import { Animated, Platform, Pressable, type AccessibilityRole, type AccessibilityState, type StyleProp, type ViewStyle } from 'react-native';
import { tap } from '../services/feedback';
import { radius as radii, shade } from '../theme';

interface Props {
  children: ReactNode;
  onPress?(): void;
  face: string;
  edge?: string;
  depth?: number;
  radius?: number;
  disabled?: boolean;
  /** Outer layout (flex, width, margins). */
  style?: StyleProp<ViewStyle>;
  /** Face content layout (padding, alignment, border). */
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  accessibilityHint?: string;
}

const native = Platform.OS !== 'web';

/**
 * Chunky "3D" surface: a coloured face resting on a darker edge. Under the finger
 * the face sinks into its edge with a spring, like a real button.
 */
export function Chunky({
  children, onPress, face, edge, depth = 6, radius = radii.m, disabled, style, contentStyle, ...a11y
}: Props) {
  const press = useRef(new Animated.Value(0)).current;
  const to = (value: number) =>
    Animated.spring(press, { toValue: value, useNativeDriver: native, speed: 40, bounciness: value ? 0 : 14 }).start();
  return (
    <Pressable
      {...a11y}
      disabled={disabled}
      onPressIn={() => {
        tap();
        to(1);
      }}
      onPressOut={() => to(0)}
      onPress={onPress}
      style={[{ borderRadius: radius, backgroundColor: edge ?? shade(face), paddingBottom: depth }, style]}
    >
      <Animated.View
        style={[
          { backgroundColor: face, borderRadius: radius, transform: [{ translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, depth] }) }] },
          contentStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
