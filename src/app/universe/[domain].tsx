import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SKILL_ORDER, SKILLS, type Domain, type SkillId } from '../../../skills.config';
import { Screen } from '../../components/Screen';
import { Stars } from '../../components/Stars';
import { Text } from '../../components/Text';
import { isAvailable } from '../../skills/registry';
import type { Level } from '../../skills/types';
import { useApp } from '../../state/AppContext';
import { colors, font, fonts, radius, shadow, space } from '../../theme';
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
  return (
    <Screen>
      <Stack.Screen options={{ title: domain === 'math' ? 'Mathématiques' : 'Français' }} />
      <Text style={[styles.title, { color: tint }]}>{domain === 'math' ? 'Mathématiques' : 'Français'}</Text>
      <Text style={styles.subtitle}>Choisis un exercice. Les étoiles montrent ton niveau.</Text>
      {skills.map((id) => {
        const available = isAvailable(id);
        return (
          <Pressable
            key={id}
            disabled={!available}
            accessibilityRole="button"
            accessibilityState={{ disabled: !available }}
            accessibilityLabel={`${SKILLS[id].title}${available ? `, niveau ${levels[id] ?? 1}` : ', bientôt disponible'}`}
            onPress={() => router.push(`/skill/${id}`)}
            style={({ pressed }) => [styles.card, available && shadow(1), !available && styles.unavailable, pressed && styles.pressed]}
          >
            <View style={[styles.iconTile, { backgroundColor: available ? colors.domainSoft[domain] : colors.background }]}>
              <Text style={styles.icon}>{SKILL_ICONS[id]}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.cardTitle, !available && { color: colors.textMuted }]}>{SKILLS[id].title}</Text>
              <Text style={styles.format} numberOfLines={2}>
                {available ? SKILLS[id].format : 'Bientôt disponible'}
              </Text>
            </View>
            {available && <Stars count={levels[id] ?? 1} size={font.small} />}
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: font.title, fontFamily: fonts.display },
  subtitle: { fontSize: font.small + 1, color: colors.textMuted, marginTop: -space.s },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: space.m,
    padding: space.m, borderRadius: radius.l, backgroundColor: colors.surface,
  },
  unavailable: { opacity: 0.6, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, backgroundColor: 'transparent' },
  pressed: { transform: [{ scale: 0.98 }] },
  iconTile: { width: 52, height: 52, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 28 },
  cardTitle: { fontSize: font.body, fontFamily: fonts.display, color: colors.text },
  format: { fontSize: font.small - 1, color: colors.textMuted, lineHeight: 20 },
});
