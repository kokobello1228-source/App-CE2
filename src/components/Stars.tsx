import { StyleSheet, View } from 'react-native';
import { colors, font } from '../theme';
import { Text } from './Text';

/** Stars drawn as round stickers ("gommettes"), as on a school notebook. */
export function Stars({ count, max = 3, size = font.large }: { count: number; max?: number; size?: number }) {
  const diameter = size * 1.25;
  return (
    <View style={styles.row} accessible accessibilityLabel={`${count} étoile${count > 1 ? 's' : ''} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const on = i < count;
        return (
          <View
            key={i}
            style={[
              styles.sticker,
              { width: diameter, height: diameter, borderRadius: diameter / 2 },
              on ? styles.on : styles.off,
            ]}
          >
            <Text style={{ fontSize: size * 0.72, lineHeight: size * 0.9, color: on ? '#FFFFFF' : colors.border }}>★</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  sticker: { alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: colors.star, transform: [{ rotate: '-8deg' }] },
  off: { borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
});
