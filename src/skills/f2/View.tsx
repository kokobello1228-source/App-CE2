import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { colors, font, radius, space, TOUCH } from '../../theme';
import type { SkillViewProps } from '../views';
import type { F2Item } from './logic';

export function F2View({ onSubmit, disabled }: SkillViewProps<F2Item>) {
  const [value, setValue] = useState('');
  const submit = () => {
    if (value.trim() !== '') onSubmit(value);
  };
  return (
    <>
      <Text style={styles.hint}>Écris le mot que tu entends :</Text>
      {/* Like at school: no autocorrect, no suggestions. */}
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        editable={!disabled}
        autoFocus
        autoCorrect={false}
        spellCheck={false}
        autoCapitalize="none"
        autoComplete="off"
        importantForAutofill="no"
        textContentType="none"
        keyboardType="default"
        returnKeyType="done"
        accessibilityLabel="Écris le mot ici"
        style={styles.input}
      />
      <BigButton label="Valider" onPress={submit} disabled={disabled || value.trim() === ''} />
    </>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: font.body, color: colors.textMuted },
  input: {
    minHeight: TOUCH + 12,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
    fontSize: font.title + 4,
    paddingHorizontal: space.m,
    color: colors.text,
    textAlign: 'center',
  },
});
