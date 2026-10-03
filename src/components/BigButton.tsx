import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, font, fonts, radius, shadow, space, TOUCH } from '../theme';
import { Text } from './Text';

interface Props {
  label: string;
  onPress(): void;
  variant?: 'primary' | 'secondary';
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

/** Large pill button. Primary is filled; secondary is outlined. */
export function BigButton({ label, onPress, variant = 'primary', color, disabled, style, accessibilityHint }: Props) {
  const tint = color ?? colors.primary;
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? { backgroundColor: disabled ? colors.disabled : tint } : { backgroundColor: colors.surface, borderColor: disabled ? colors.disabled : tint, borderWidth: 2.5 },
        !disabled && shadow(1),
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, { color: primary ? colors.primaryText : disabled ? colors.disabled : tint }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TOUCH,
    borderRadius: radius.pill,
    paddingHorizontal: space.l,
    paddingVertical: space.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  label: { fontSize: font.large - 2, fontFamily: fonts.display, textAlign: 'center' },
});
