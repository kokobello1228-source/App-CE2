import { Pressable, StyleSheet, Text } from 'react-native';
import { speak } from '../services/speech';
import { colors, font, radius, space, TOUCH } from '../theme';

export function SpeakButton({ text, label = 'Réécouter' }: { text: string; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => void speak(text)}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.text}>🔊 {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TOUCH - 8,
    alignSelf: 'flex-start',
    paddingHorizontal: space.m,
    borderRadius: radius.m,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  text: { fontSize: font.body, color: colors.primary, fontWeight: '700' },
});
