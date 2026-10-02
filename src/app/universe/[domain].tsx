import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SKILL_ORDER, SKILLS, type Domain, type SkillId } from '../../../skills.config';
import { Screen } from '../../components/Screen';
import { Stars } from '../../components/Stars';
import { isAvailable } from '../../skills/registry';
import type { Level } from '../../skills/types';
import { useApp } from '../../state/AppContext';
import { colors, font, radius, space, TOUCH } from '../../theme';

export default function Universe() {
  const { domain } = useLocalSearchParams<{ domain: Domain }>();
  const { repo, dataVersion } = useApp();
  const [levels, setLevels] = useState<Partial<Record<SkillId, Level>>>({});

  useEffect(() => {
    void repo.getLevels().then(setLevels);
  }, [repo, dataVersion]);

  const skills = SKILL_ORDER.filter((id) => SKILLS[id].domain === domain);
  const color = colors.domain[domain === 'math' ? 'math' : 'fr'];
  return (
    <Screen>
      <Stack.Screen options={{ title: domain === 'math' ? 'Mathématiques' : 'Français' }} />
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
            style={({ pressed }) => [
              styles.card,
              { borderColor: available ? color : colors.border },
              !available && styles.unavailable,
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, !available && { color: colors.textMuted }]}>{SKILLS[id].title}</Text>
              {!available && <Text style={styles.soon}>Bientôt</Text>}
            </View>
            {available && <Stars count={levels[id] ?? 1} />}
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: TOUCH + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    padding: space.m,
    borderRadius: radius.m,
    borderWidth: 3,
    backgroundColor: colors.surface,
  },
  unavailable: { backgroundColor: colors.background, borderStyle: 'dashed' },
  title: { fontSize: font.body + 2, fontWeight: '700', color: colors.text },
  soon: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
});
