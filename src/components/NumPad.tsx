import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, space, TOUCH } from '../theme';

interface Props {
  value: string;
  onChange(value: string): void;
  onSubmit(): void;
  maxLength?: number;
  disabled?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'erase', '0', 'ok'] as const;

/** On-screen number pad: big keys, usable with one thumb. */
export function NumPad({ value, onChange, onSubmit, maxLength = 4, disabled }: Props) {
  const press = (key: (typeof KEYS)[number]) => {
    if (key === 'erase') onChange(value.slice(0, -1));
    else if (key === 'ok') {
      if (value !== '') onSubmit();
    } else if (value.length < maxLength) onChange(value + key);
  };
  return (
    <View style={styles.pad}>
      <View style={styles.display} accessibilityLiveRegion="polite" accessibilityLabel={`Ta réponse : ${value || 'vide'}`}>
        <Text style={styles.displayText}>{value || ' '}</Text>
      </View>
      <View style={styles.grid}>
        {KEYS.map((key) => {
          const label = key === 'erase' ? '⌫' : key === 'ok' ? 'Valider' : key;
          const isOk = key === 'ok';
          const isDisabled = disabled || (isOk && value === '');
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={key === 'erase' ? 'Effacer' : label}
              disabled={isDisabled}
              onPress={() => press(key)}
              style={({ pressed }) => [
                styles.key,
                isOk && styles.okKey,
                isOk && isDisabled && styles.okDisabled,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.keyText, isOk && styles.okText]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { gap: space.s, width: '100%', maxWidth: 420, alignSelf: 'center' },
  display: {
    minHeight: TOUCH,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayText: { fontSize: font.huge - 8, fontWeight: '700', color: colors.text, letterSpacing: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.s },
  key: {
    width: '32%',
    minHeight: TOUCH,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontSize: font.title, color: colors.text, fontWeight: '600' },
  okKey: { backgroundColor: colors.primary, borderColor: colors.primary },
  okDisabled: { backgroundColor: colors.disabled, borderColor: colors.disabled },
  okText: { fontSize: font.body, color: colors.primaryText, fontWeight: '700' },
});
