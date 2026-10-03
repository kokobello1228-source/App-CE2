import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { VOICE_SAMPLE } from '../content/phrases';
import { listFrenchVoices, speak, type FrenchVoice } from '../services/speech';
import { colors, font, fonts, radius, space } from '../theme';
import { Text } from './Text';

const SAMPLE = VOICE_SAMPLE;

interface Props {
  value: string;
  natural: boolean;
  onChange(choice: { natural: boolean; voiceId: string }): void;
}

/** List of the French voices of the device, each with a preview button. */
export function VoicePicker({ value, natural, onChange }: Props) {
  const [voices, setVoices] = useState<FrenchVoice[] | null>(null);

  useEffect(() => {
    void listFrenchVoices().then(setVoices);
  }, []);

  /** Plays the sample with a voice without selecting it (listening is not choosing). */
  const preview = (identifier: string, useNatural = false) => {
    void speak(SAMPLE, { natural: useNatural, voiceId: identifier });
  };

  if (voices === null) return <ActivityIndicator color={colors.primary} />;
  const options: (FrenchVoice | null)[] = [null, ...voices];
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: natural }}
        onPress={() => {
          onChange({ natural: true, voiceId: value });
          preview(value, true);
        }}
        style={[styles.row, natural && styles.selected]}
      >
        <View style={[styles.radio, natural && styles.radioOn]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>🦉 Plume – voix naturelle</Text>
          <Text style={styles.detail}>Recommandée. Les phrases calculées à la volée utilisent la voix choisie dessous.</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Écouter Plume" onPress={() => preview(value, true)} style={styles.play}>
          <Text style={styles.playText}>▶</Text>
        </Pressable>
      </Pressable>
      <Text style={styles.muted}>Voix de l’appareil :</Text>
      {voices.length === 0 && <Text style={styles.muted}>Aucune voix française n’a été trouvée sur cet appareil.</Text>}
      {options.map((voice) => {
        const id = voice?.identifier ?? '';
        const selected = id === value && !natural;
        return (
          <Pressable
            key={id || 'auto'}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              onChange({ natural: false, voiceId: id });
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
