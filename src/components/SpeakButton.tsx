import { StyleSheet } from 'react-native';
import { Chunky } from './Chunky';
import { speak } from '../services/speech';
import { colors, font, fonts, radius, shadow, space } from '../theme';
import { Text } from './Text';

/** Replays a text with the speech synthesis. */
export function SpeakButton({ text, label = 'Réécouter' }: { text: string; label?: string }) {
  return (
    <Chunky
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => void speak(text)}
      face={colors.surface}
      edge={colors.border}
      depth={4}
      radius={radius.pill}
      style={{ alignSelf: 'flex-start' }}
      contentStyle={styles.button}
    >
      <Text style={styles.icon}>🔊</Text>
      <Text style={styles.text}>{label}</Text>
    </Chunky>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.m },
  icon: { fontSize: font.body },
  text: { fontSize: font.body - 1, color: colors.primary, fontFamily: fonts.display, lineHeight: 24 },
});
