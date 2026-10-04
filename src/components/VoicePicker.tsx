import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { VOICE_SAMPLE } from '../content/phrases';
import { NATURAL_VOICES, type NaturalVoiceId } from '../services/naturalVoices';
import { listFrenchVoices, speak, type FrenchVoice } from '../services/speech';
import { colors, font, fonts, radius, space } from '../theme';
import { Text } from './Text';

const SAMPLE = VOICE_SAMPLE;

interface Props {
  value: string;
  natural: boolean;
  naturalId: NaturalVoiceId;
  onChange(choice: { natural: boolean; naturalId: NaturalVoiceId; voiceId: string }): void;
}

/** List of the French voices of the device, each with a preview button. */
export function VoicePicker({ value, natural, naturalId, onChange }: Props) {
  const [voices, setVoices] = useState<FrenchVoice[] | null>(null);

  useEffect(() => {
    void listFrenchVoices().then(setVoices);
  }, []);

  /** Plays the sample with a voice without selecting it (listening is not choosing). */
  const preview = (identifier: string, useNatural = false, id: NaturalVoiceId = naturalId) => {
    void speak(SAMPLE, { natural: useNatural, naturalId: id, voiceId: identifier });
  };

  // The natural voices are shown at once; only the device voices wait for their list.
  const options: (FrenchVoice | null)[] = voices === null ? [] : [null, ...voices];
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      <Text style={styles.muted}>Voix naturelles :</Text>
      {NATURAL_VOICES.map((nv) => {
        const selected = natural && naturalId === nv.id;
        return (
          <Pressable
            key={nv.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              onChange({ natural: true, naturalId: nv.id, voiceId: value });
              preview(value, true, nv.id);
            }}
            style={[styles.row, selected && styles.selected]}
          >
            <View style={[styles.radio, selected && styles.radioOn]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{`${nv.emoji} ${nv.name}`}</Text>
              <Text style={styles.detail}>{nv.description}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Écouter ${nv.name}`} onPress={() => preview(value, true, nv.id)} style={styles.play}>
              <Text style={styles.playText}>▶</Text>
            </Pressable>
          </Pressable>
        );
      })}
      <Text style={styles.muted}>Voix de l’appareil :</Text>
      {voices === null && <ActivityIndicator color={colors.primary} />}
      {voices?.length === 0 && <Text style={styles.muted}>Aucune voix française n’a été trouvée sur cet appareil.</Text>}
      {options.map((voice) => {
        const id = voice?.identifier ?? '';
        const selected = id === value && !natural;
        return (
          <Pressable
            key={id || 'auto'}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              onChange({ natural: false, naturalId, voiceId: id });
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
