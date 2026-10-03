import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Choice } from '../skills/types';
import { colors, font, fonts, radius, space, TOUCH } from '../theme';
import { Chunky } from './Chunky';
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

/** Answer cards: chunky, they sink when touched; the chosen one turns blue with a tick. */
export function ChoiceGrid({ choices, selected, onSelect, disabled, renderChoice, columns = 2 }: Props) {
  const basis = columns === 3 ? '31%' : columns === 1 ? '100%' : '47.5%';
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {choices.map((choice) => {
        const isSelected = choice.id === selected;
        return (
          <Chunky
            key={choice.id}
            onPress={() => onSelect(choice.id)}
            disabled={disabled}
            face={isSelected ? colors.selected : colors.surface}
            edge={isSelected ? colors.primary : colors.border}
            radius={radius.m}
            depth={5}
            style={{ flexBasis: basis, flexGrow: 1 }}
            contentStyle={[styles.choice, isSelected && styles.selected]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected, disabled }}
            accessibilityLabel={choice.label}
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
          </Chunky>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s + 4, justifyContent: 'space-between' },
  choice: {
    minHeight: TOUCH + 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.s,
  },
  selected: { borderColor: colors.primary },
  label: { fontSize: font.large - 1, fontFamily: fonts.displayMedium, color: colors.text, textAlign: 'center', lineHeight: 30 },
  selectedLabel: { color: colors.primaryDark },
  tick: {
    position: 'absolute', top: -8, right: -6, width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface,
  },
  tickText: { color: colors.primaryText, fontSize: 14, fontFamily: fonts.bold, lineHeight: 18 },
});
