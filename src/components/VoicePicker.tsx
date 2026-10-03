import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { listFrenchVoices, setVoice, speak, type FrenchVoice } from '../services/speech';
import { colors, font, fonts, radius, space } from '../theme';
import { Text } from './Text';

const SAMPLE = 'Bonjour ! Écoute bien : le chat dort sur le tapis. Combien font trois plus quatre ?';

interface Props {
  value: string;
  onChange(identifier: string): void;
}

/** List of the French voices of the device, each with a preview button. */
export function VoicePicker({ value, onChange }: Props) {
  const [voices, setVoices] = useState<FrenchVoice[] | null>(null);

  useEffect(() => {
    void listFrenchVoices().then(setVoices);
  }, []);

  const preview = (identifier: string) => {
    setVoice(identifier);
    void speak(SAMPLE);
  };

  if (voices === null) return <ActivityIndicator color={colors.primary} />;
  if (voices.length === 0) {
    return <Text style={styles.muted}>Aucune voix française n’a été trouvée sur cet appareil.</Text>;
  }
  const options: (FrenchVoice | null)[] = [null, ...voices];
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {options.map((voice) => {
        const id = voice?.identifier ?? '';
        const selected = id === value;
        return (
          <Pressable
            key={id || 'auto'}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              onChange(id);
              preview(id);
            }}
            style={[styles.row, selected && styles.selected]}
          >
            <View style={[styles.radio, selected && styles.radioOn]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{voice ? voice.name : 'Automatique'}</Text>
              <Text style={styles.detail}>
                {voice
                  ? `${voice.language}${voice.enhanced ? ' · qualité améliorée' : ''}`
                  : 'La meilleure voix française trouvée'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Écouter ${voice?.name ?? 'la voix automatique'}`}
              onPress={() => preview(id)}
              style={styles.play}
            >
              <Text style={styles.playText}>▶</Text>
            </Pressable>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.s },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m,
    borderRadius: radius.m, backgroundColor: colors.background, borderWidth: 2, borderColor: 'transparent',
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.selected },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: colors.disabled },
  radioOn: { borderColor: colors.primary, backgroundColor: colors.primary, borderWidth: 6 },
  name: { fontSize: font.body - 1, fontFamily: fonts.display, color: colors.text },
  detail: { fontSize: font.small - 2, color: colors.textMuted },
  play: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  playText: { fontSize: 16, color: colors.primary },
  muted: { fontSize: font.small, color: colors.textMuted },
});
