import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Choice } from '../skills/types';
import { colors, font, fonts, radius, shadow, space, TOUCH } from '../theme';
import { Text } from './Text';

interface Props {
  choices: Choice[];
  selected: string | null;
  onSelect(id: string): void;
  disabled?: boolean;
  /** Custom content of a choice (fraction, figure…). Defaults to the label text. */
  renderChoice?(choice: Choice, selected: boolean): ReactNode;
  /** Choices per row (default 2). */
  columns?: number;
}

/** Multiple-choice answers as large cards; the selected one gets the ink colour and a tick. */
export function ChoiceGrid({ choices, selected, onSelect, disabled, renderChoice, columns = 2 }: Props) {
  const basis = columns === 3 ? '31%' : '47%';
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {choices.map((choice) => {
        const isSelected = choice.id === selected;
        return (
          <Pressable
            key={choice.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected, disabled }}
            accessibilityLabel={choice.label}
            disabled={disabled}
            onPress={() => onSelect(choice.id)}
            style={({ pressed }) => [
              styles.choice,
              { flexBasis: basis },
              shadow(1),
              isSelected && styles.selected,
              pressed && styles.pressed,
            ]}
          >
            {renderChoice ? (
              renderChoice(choice, isSelected)
            ) : (
              <Text style={[styles.label, isSelected && styles.selectedLabel]}>{choice.label}</Text>
            )}
            {isSelected && (
              <View style={styles.tick}>
                <Text style={styles.tickText}>✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s + 2, justifyContent: 'space-between' },
  choice: {
    flexGrow: 1,
    minHeight: TOUCH + 8,
    borderRadius: radius.m,
    borderWidth: 2.5,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.s,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.selected },
  pressed: { transform: [{ scale: 0.97 }] },
  label: { fontSize: font.large - 2, color: colors.text, textAlign: 'center' },
  selectedLabel: { fontFamily: fonts.bold, color: colors.primaryDark },
  tick: {
    position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  tickText: { color: colors.primaryText, fontSize: 13, fontFamily: fonts.bold, lineHeight: 16 },
});
