import { Pressable, StyleSheet } from 'react-native';
import { speak } from '../services/speech';
import { colors, font, fonts, radius, shadow, space } from '../theme';
import { Text } from './Text';

/** Replays a text with the speech synthesis. */
export function SpeakButton({ text, label = 'Réécouter' }: { text: string; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => void speak(text)}
      style={({ pressed }) => [styles.button, shadow(1), pressed && { transform: [{ scale: 0.96 }] }]}
    >
      <Text style={styles.icon}>🔊</Text>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: space.m,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  icon: { fontSize: font.body },
  text: { fontSize: font.small + 1, color: colors.primary, fontFamily: fonts.display },
});
