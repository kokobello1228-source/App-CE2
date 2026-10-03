import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SKILLS, type SkillId } from '../../../skills.config';
import { Screen } from '../../components/Screen';
import { formatDuration } from '../../components/SessionRunner';
import { Text } from '../../components/Text';
import { colors, font, fonts, radius, shadow, space } from '../../theme';
import { SKILL_ICONS } from '../../theme/skillIcons';

function ModeCard({ icon, title, text, color, onPress }: { icon: string; title: string; text: string; color: string; onPress(): void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.mode, shadow(1), pressed && styles.pressed]}
    >
      <Text style={styles.modeIcon}>{icon}</Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.modeTitle, { color }]}>{title}</Text>
        <Text style={styles.modeText}>{text}</Text>
      </View>
      <Text style={[styles.chevron, { color }]}>›</Text>
    </Pressable>
  );
}

export default function SkillScreen() {
  const { id } = useLocalSearchParams<{ id: SkillId }>();
  const config = SKILLS[id];
  const color = colors.domain[config.domain];
  return (
    <Screen>
      <Stack.Screen options={{ title: '' }} />
      <View style={[styles.hero, { backgroundColor: colors.domainSoft[config.domain] }]}>
        <Text style={styles.heroIcon}>{SKILL_ICONS[id]}</Text>
        <Text style={[styles.title, { color }]}>{config.title}</Text>
        <Text style={styles.format}>{config.format}</Text>
      </View>
      <ModeCard
        icon="🎯"
        title="Entraînement libre"
        text="À ton rythme, avec une explication après chaque réponse."
        color={color}
        onPress={() => router.push({ pathname: '/session', params: { mode: 'free', skill: id } })}
      />
      <ModeCard
        icon="🏫"
        title="Comme à l’école"
        text={`${config.officialItems} questions en ${formatDuration(config.officialDurationSec)}, comme le jour de l’évaluation. Correction à la fin.`}
        color={color}
        onPress={() => router.push({ pathname: '/session', params: { mode: 'school', skill: id } })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.l, padding: space.l, gap: space.s, alignItems: 'flex-start' },
  heroIcon: { fontSize: 48 },
  title: { fontSize: font.title, fontFamily: fonts.display, lineHeight: 38 },
  format: { fontSize: font.body - 1, color: colors.text, lineHeight: 27 },
  mode: { flexDirection: 'row', alignItems: 'center', gap: space.m, backgroundColor: colors.surface, borderRadius: radius.l, padding: space.m + 2 },
  modeIcon: { fontSize: 34 },
  modeTitle: { fontSize: font.large - 2, fontFamily: fonts.display },
  modeText: { fontSize: font.small, color: colors.textMuted, lineHeight: 21 },
  chevron: { fontSize: 36, fontFamily: fonts.display },
  pressed: { transform: [{ scale: 0.98 }] },
});
