import { Text } from 'react-native';
import { colors, font } from '../theme';

export function Stars({ count, max = 3, size = font.large }: { count: number; max?: number; size?: number }) {
  return (
    <Text style={{ fontSize: size }} accessibilityLabel={`${count} étoile${count > 1 ? 's' : ''} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <Text key={i} style={{ color: i < count ? colors.star : colors.border }}>
          ★
        </Text>
      ))}
    </Text>
  );
}
