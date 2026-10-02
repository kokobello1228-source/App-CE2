import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SKILLS, type SkillId } from '../../../skills.config';
import { BigButton } from '../../components/BigButton';
import { Screen } from '../../components/Screen';
import { formatDuration } from '../../components/SessionRunner';
import { colors, font } from '../../theme';

export default function SkillScreen() {
  const { id } = useLocalSearchParams<{ id: SkillId }>();
  const config = SKILLS[id];
  const color = colors.domain[config.domain];
  return (
    <Screen>
      <Stack.Screen options={{ title: config.title }} />
      <Text style={[styles.title, { color }]}>{config.title}</Text>
      <Text style={styles.format}>{config.format}</Text>
      <BigButton
        label="🎯  Entraînement libre"
        color={color}
        onPress={() => router.push({ pathname: '/session', params: { mode: 'free', skill: id } })}
      />
      <BigButton
        label="🏫  Comme à l’école"
        variant="secondary"
        color={color}
        onPress={() => router.push({ pathname: '/session', params: { mode: 'school', skill: id } })}
      />
      <Text style={styles.format}>
        « Comme à l’école » : {config.officialItems} questions en {formatDuration(config.officialDurationSec)}, comme le jour de
        l’évaluation. La correction est donnée à la fin.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: font.title, fontWeight: '800' },
  format: { fontSize: font.body, color: colors.textMuted, lineHeight: 28 },
});
