import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, font, radius, space, TOUCH } from '../theme';

interface Props {
  label: string;
  onPress(): void;
  variant?: 'primary' | 'secondary';
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

export function BigButton({ label, onPress, variant = 'primary', color, disabled, style, accessibilityHint }: Props) {
  const background = variant === 'primary' ? (color ?? colors.primary) : colors.surface;
  const textColor = variant === 'primary' ? colors.primaryText : (color ?? colors.primary);
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
        { backgroundColor: disabled ? colors.disabled : background, borderColor: color ?? colors.primary },
        variant === 'secondary' && styles.secondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, { color: disabled ? colors.surface : textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TOUCH,
    borderRadius: radius.m,
    paddingHorizontal: space.l,
    paddingVertical: space.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { borderWidth: 3 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  label: { fontSize: font.large, fontWeight: '700', textAlign: 'center' },
});
