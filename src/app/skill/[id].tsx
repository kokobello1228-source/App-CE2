import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SKILLS, type SkillId } from '../../../skills.config';
import { Chunky } from '../../components/Chunky';
import { Mascot } from '../../components/Mascot';
import { Screen } from '../../components/Screen';
import { formatDuration } from '../../components/SessionRunner';
import { SpeechBubble } from '../../components/SpeechBubble';
import { Text } from '../../components/Text';
import { colors, font, fonts, radius, space } from '../../theme';
import { SKILL_ICONS } from '../../theme/skillIcons';

function ModeCard({ icon, title, text, face, onPress }: { icon: string; title: string; text: string; face: string; onPress(): void }) {
  return (
    <Chunky onPress={onPress} face={face} radius={radius.l} depth={7} contentStyle={styles.mode} accessibilityRole="button" accessibilityLabel={title}>
      <View style={styles.modeIconBox}>
        <Text style={styles.modeIcon}>{icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.modeTitle}>{title}</Text>
        <Text style={styles.modeText}>{text}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Chunky>
  );
}

export default function SkillScreen() {
  const { id } = useLocalSearchParams<{ id: SkillId }>();
  const config = SKILLS[id];
  return (
    <Screen>
      <Stack.Screen options={{ title: '' }} />
      <View style={[styles.hero, { backgroundColor: colors.domainSoft[config.domain] }]}>
        <Text style={styles.heroIcon}>{SKILL_ICONS[id]}</Text>
        <Text style={[styles.title, { color: colors.domainDark[config.domain] }]}>{config.title}</Text>
        <Text style={styles.format}>{config.format}</Text>
      </View>
      <View style={styles.coach}>
        <Mascot mood="happy" size={76} />
        <SpeechBubble>
          <Text style={styles.coachText}>Comment veux-tu t’entraîner ?</Text>
        </SpeechBubble>
      </View>
      <ModeCard
        icon="🎯"
        title="Entraînement libre"
        text="À ton rythme, avec une explication après chaque réponse."
        face={colors.domain[config.domain]}
        onPress={() => router.push({ pathname: '/session', params: { mode: 'free', skill: id } })}
      />
      <ModeCard
        icon="🏫"
        title="Comme à l’école"
        text={`${config.officialItems} questions en ${formatDuration(config.officialDurationSec)}, comme le jour de l’évaluation.`}
        face={colors.primary}
        onPress={() => router.push({ pathname: '/session', params: { mode: 'school', skill: id } })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.l, padding: space.l, gap: space.xs, alignItems: 'flex-start' },
  heroIcon: { fontSize: 52, lineHeight: 62 },
  title: { fontSize: font.title + 2, fontFamily: fonts.display, lineHeight: 40 },
  format: { fontSize: font.body - 1, color: colors.text, lineHeight: 27 },
  coach: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  coachText: { fontSize: font.body + 1, fontFamily: fonts.display, color: colors.text, lineHeight: 28 },
  mode: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m + 4 },
  modeIconBox: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  modeIcon: { fontSize: 32, lineHeight: 40 },
  modeTitle: { fontSize: font.large, fontFamily: fonts.display, color: colors.primaryText, lineHeight: 30 },
  modeText: { fontSize: font.small, color: 'rgba(255,255,255,0.95)', lineHeight: 21 },
  chevron: { fontSize: 40, fontFamily: fonts.display, color: colors.primaryText },
});
