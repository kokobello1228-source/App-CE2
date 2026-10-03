import { Pressable, StyleSheet, View } from 'react-native';
import { colors, font, fonts, radius, shadow, space, TOUCH } from '../theme';
import { Text } from './Text';

interface Props {
  value: string;
  onChange(value: string): void;
  onSubmit(): void;
  maxLength?: number;
  disabled?: boolean;
  /** 'rtl' fills from the right, units first, like a column operation on paper. */
  direction?: 'ltr' | 'rtl';
  showDisplay?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'erase', '0', 'ok'] as const;

/** On-screen number pad: big keys, usable with one thumb. */
export function NumPad({ value, onChange, onSubmit, maxLength = 4, disabled, direction = 'ltr', showDisplay = true }: Props) {
  const rtl = direction === 'rtl';
  const press = (key: (typeof KEYS)[number]) => {
    if (key === 'erase') onChange(rtl ? value.slice(1) : value.slice(0, -1));
    else if (key === 'ok') {
      if (value !== '') onSubmit();
    } else if (value.length < maxLength) onChange(rtl ? key + value : value + key);
  };
  return (
    <View style={styles.pad}>
      {showDisplay && (
        <View style={styles.display} accessibilityLiveRegion="polite" accessibilityLabel={`Ta réponse : ${value || 'vide'}`}>
          <Text style={[styles.displayText, !value && styles.placeholder]}>{value || '?'}</Text>
        </View>
      )}
      <View style={styles.grid}>
        {KEYS.map((key) => {
          const isOk = key === 'ok';
          const isErase = key === 'erase';
          const isDisabled = disabled || (isOk && value === '');
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={isErase ? 'Effacer' : isOk ? 'Valider' : key}
              disabled={isDisabled}
              onPress={() => press(key)}
              style={({ pressed }) => [
                styles.key,
                !isOk && shadow(1),
                isOk && styles.okKey,
                isOk && isDisabled && styles.okDisabled,
                isErase && styles.eraseKey,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.keyText, isOk && styles.okText, isErase && styles.eraseText]}>
                {isErase ? '⌫' : isOk ? 'Valider' : key}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { gap: space.s + 2, width: '100%', maxWidth: 420, alignSelf: 'center' },
  display: {
    minHeight: TOUCH + 4,
    borderWidth: 2.5,
    borderColor: colors.primary,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayText: { fontSize: font.huge - 6, fontFamily: fonts.display, color: colors.text, letterSpacing: 4 },
  placeholder: { color: colors.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.s + 2 },
  key: {
    width: '31.5%',
    minHeight: TOUCH,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.94 }], backgroundColor: colors.selected },
  keyText: { fontSize: font.title, fontFamily: fonts.display, color: colors.text },
  eraseKey: { backgroundColor: '#F6F8FC' },
  eraseText: { color: colors.textMuted },
  okKey: { backgroundColor: colors.primary, ...shadow(1) },
  okDisabled: { backgroundColor: colors.disabled },
  okText: { fontSize: font.body, color: colors.primaryText },
});
