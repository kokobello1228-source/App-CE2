import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Domain } from '../../skills.config';
import { BigButton } from '../components/BigButton';
import { Screen } from '../components/Screen';
import { computeStreak, toDayString } from '../engine/session';
import { speak } from '../services/speech';
import { useApp } from '../state/AppContext';
import { colors, font, radius, space } from '../theme';

const UNIVERSES: { domain: Domain; title: string; emoji: string }[] = [
  { domain: 'fr', title: 'Français', emoji: '📖' },
  { domain: 'math', title: 'Mathématiques', emoji: '🔢' },
];

export default function Home() {
  const { repo, settings, dataVersion } = useApp();
  const [streak, setStreak] = useState(0);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    void (async () => {
      setStreak(computeStreak(await repo.activeDays(), toDayString(new Date())));
      setStars(await repo.totalStars());
    })();
  }, [repo, dataVersion]);

  const greeting = `Bonjour ${settings.childName} !`;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Screen>
        <Pressable onPress={() => void speak(`${greeting} Que veux-tu faire aujourd’hui ?`)} accessibilityRole="header">
          <Text style={styles.greeting}>{greeting} 👋</Text>
        </Pressable>
        <View style={styles.rewards}>
          <Text style={styles.reward} accessibilityLabel={`${stars} étoiles gagnées`}>
            ⭐ {stars}
          </Text>
          <Text style={styles.reward} accessibilityLabel={`${streak} jours de suite`}>
            🔥 {streak} jour{streak > 1 ? 's' : ''} de suite
          </Text>
        </View>

        <BigButton
          label={`☀️  Séance du jour (${settings.dailyMinutes} min)`}
          onPress={() => router.push({ pathname: '/session', params: { mode: 'daily' } })}
          style={styles.daily}
        />

        <View style={styles.universes}>
          {UNIVERSES.map((u) => (
            <Pressable
              key={u.domain}
              accessibilityRole="button"
              accessibilityLabel={u.title}
              onPress={() => router.push(`/universe/${u.domain}`)}
              style={({ pressed }) => [styles.universe, { backgroundColor: colors.domain[u.domain] }, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.universeEmoji}>{u.emoji}</Text>
              <Text style={styles.universeTitle}>{u.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexGrow: 1 }} />
        <Pressable onPress={() => router.push('/parent')} accessibilityRole="button" style={styles.parentLink}>
          <Text style={styles.parentText}>🔒 Espace parent</Text>
        </Pressable>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: font.title + 4, fontWeight: '800', color: colors.text, marginTop: space.m },
  rewards: { flexDirection: 'row', gap: space.l, flexWrap: 'wrap' },
  reward: { fontSize: font.large, fontWeight: '700', color: colors.text },
  daily: { minHeight: 96, marginTop: space.s },
  universes: { flexDirection: 'row', gap: space.m },
  universe: {
    flex: 1, minHeight: 150, borderRadius: radius.l, alignItems: 'center', justifyContent: 'center', padding: space.m, gap: space.s,
  },
  universeEmoji: { fontSize: 48 },
  universeTitle: { fontSize: font.body + 2, fontWeight: '800', color: colors.primaryText, textAlign: 'center' },
  parentLink: { alignSelf: 'center', padding: space.m },
  parentText: { fontSize: font.small + 2, color: colors.textMuted },
});
