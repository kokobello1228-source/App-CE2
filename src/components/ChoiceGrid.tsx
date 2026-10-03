import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Choice } from '../skills/types';
import { colors, font, radius, space, TOUCH } from '../theme';

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

/** Multiple-choice answers as large buttons, two per row. */
export function ChoiceGrid({ choices, selected, onSelect, disabled, renderChoice, columns = 2 }: Props) {
  const basis = columns === 3 ? '31%' : '48%';
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
            style={({ pressed }) => [styles.choice, { flexBasis: basis }, isSelected && styles.selected, pressed && { opacity: 0.8 }]}
          >
            {renderChoice ? (
              renderChoice(choice, isSelected)
            ) : (
              <Text style={[styles.label, isSelected && styles.selectedLabel]}>{choice.label}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  choice: {
    flexGrow: 1,
    minHeight: TOUCH + 8,
    borderRadius: radius.m,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.s,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.selected },
  label: { fontSize: font.large, color: colors.text, textAlign: 'center' },
  selectedLabel: { fontWeight: '700', color: colors.primary },
});
