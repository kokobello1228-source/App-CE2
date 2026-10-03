import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SKILL_ORDER, SKILLS, type Domain, type SkillId } from '../../../skills.config';
import { Chunky } from '../../components/Chunky';
import { Mascot } from '../../components/Mascot';
import { Screen } from '../../components/Screen';
import { SpeechBubble } from '../../components/SpeechBubble';
import { Stars } from '../../components/Stars';
import { Text } from '../../components/Text';
import { isAvailable, SPECIAL_ROUTES } from '../../skills/registry';
import type { Level } from '../../skills/types';
import { useApp } from '../../state/AppContext';
import { colors, font, fonts, radius, space } from '../../theme';
import { SKILL_ICONS } from '../../theme/skillIcons';

export default function Universe() {
  const { domain: param } = useLocalSearchParams<{ domain: Domain }>();
  const domain: Domain = param === 'math' ? 'math' : 'fr';
  const { repo, dataVersion } = useApp();
  const [levels, setLevels] = useState<Partial<Record<SkillId, Level>>>({});

  useEffect(() => {
    void repo.getLevels().then(setLevels);
  }, [repo, dataVersion]);

  const skills = SKILL_ORDER.filter((id) => SKILLS[id].domain === domain);
  const tint = colors.domain[domain];
  const title = domain === 'math' ? 'Mathématiques' : 'Français';
  return (
    <Screen>
      <Stack.Screen options={{ title }} />
      <View style={styles.head}>
        <Mascot mood="idle" size={78} />
        <SpeechBubble>
          <Text style={[styles.title, { color: tint }]}>{title}</Text>
          <Text style={styles.subtitle}>Choisis un exercice. Les étoiles montrent ton niveau.</Text>
        </SpeechBubble>
      </View>
      <View style={styles.grid}>
        {skills.map((id) => {
          const special = SPECIAL_ROUTES[id];
          const available = isAvailable(id) || special !== undefined;
          return (
            <Chunky
              key={id}
              disabled={!available}
              onPress={() => router.push((special ?? `/skill/${id}`) as '/fluency')}
              face={colors.surface}
              edge={colors.border}
              radius={radius.l}
              depth={6}
              style={styles.tileBox}
              contentStyle={styles.tile}
              accessibilityRole="button"
              accessibilityState={{ disabled: !available }}
              accessibilityLabel={`${SKILLS[id].title}${available ? `, niveau ${levels[id] ?? 1}` : ', bientôt disponible'}`}
            >
              <View style={[styles.blob, { backgroundColor: colors.domainSoft[domain] }]}>
                <Text style={styles.icon}>{SKILL_ICONS[id]}</Text>
              </View>
              <Text style={styles.tileTitle} numberOfLines={3}>
                {SKILLS[id].title}
              </Text>
              {available && !special ? (
                <Stars count={levels[id] ?? 1} size={14} />
              ) : (
                <Text style={[styles.badge, { color: tint }]}>{special ? 'À deux' : 'Bientôt'}</Text>
              )}
            </Chunky>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  title: { fontSize: font.title - 2, fontFamily: fonts.display, lineHeight: 34 },
  subtitle: { fontSize: font.small, color: colors.textMuted, lineHeight: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m, justifyContent: 'space-between', alignItems: 'flex-start' },
  tileBox: { width: '47.5%' },
  tile: { padding: space.m, gap: space.s, height: 178, alignItems: 'flex-start' },
  blob: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
  icon: { fontSize: 30, lineHeight: 38 },
  tileTitle: { fontSize: font.body - 1, fontFamily: fonts.display, color: colors.text, lineHeight: 23, flexGrow: 1 },
  badge: { fontSize: font.small - 2, fontFamily: fonts.bold },
});
