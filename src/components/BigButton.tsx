import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, font, fonts, radius, space, TOUCH } from '../theme';
import { Chunky } from './Chunky';
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

/** Big chunky pill button that sinks under the finger. */
export function BigButton({ label, onPress, variant = 'primary', color, disabled, style, accessibilityHint }: Props) {
  const tint = disabled ? colors.disabled : color ?? colors.primary;
  const primary = variant === 'primary';
  return (
    <Chunky
      onPress={onPress}
      disabled={disabled}
      face={primary ? tint : colors.surface}
      edge={primary ? undefined : tint}
      radius={radius.pill}
      style={style}
      contentStyle={[styles.face, !primary && { borderWidth: 2.5, borderColor: tint }]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.label, { color: primary ? colors.primaryText : tint }]}>{label}</Text>
    </Chunky>
  );
}

const styles = StyleSheet.create({
  face: { minHeight: TOUCH, paddingHorizontal: space.l, paddingVertical: space.s + 2, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: font.large, fontFamily: fonts.display, textAlign: 'center', lineHeight: 32 },
});
