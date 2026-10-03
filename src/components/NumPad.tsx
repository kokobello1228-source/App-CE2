import { StyleSheet, View } from 'react-native';
import { Chunky } from './Chunky';
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
            <Chunky
              key={key}
              accessibilityRole="button"
              accessibilityLabel={isErase ? 'Effacer' : isOk ? 'Valider' : key}
              disabled={isDisabled}
              onPress={() => press(key)}
              face={isOk ? (isDisabled ? colors.disabled : colors.success) : isErase ? '#F3F6FB' : colors.surface}
              edge={isOk ? undefined : colors.border}
              depth={5}
              style={styles.keyBox}
              contentStyle={styles.key}
            >
              <Text style={[styles.keyText, isOk && styles.okText, isErase && styles.eraseText]}>
                {isErase ? '⌫' : isOk ? 'Valider' : key}
              </Text>
            </Chunky>
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
  displayText: { fontSize: font.huge - 4, fontFamily: fonts.display, color: colors.text, letterSpacing: 4, lineHeight: 56 },
  placeholder: { color: colors.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.s + 2 },
  keyBox: { width: '31.5%' },
  key: { minHeight: TOUCH - 4, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: font.title + 2, fontFamily: fonts.display, color: colors.text, lineHeight: 42 },
  eraseText: { color: colors.textMuted },
  okText: { fontSize: font.body + 1, color: colors.primaryText, lineHeight: 28 },
});
