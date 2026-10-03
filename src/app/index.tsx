import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SKILL_ORDER, SKILLS, type Domain } from '../../skills.config';
import { BigButton } from '../components/BigButton';
import { Screen } from '../components/Screen';
import { SeyesPaper } from '../components/SeyesPaper';
import { Text } from '../components/Text';
import { computeStreak, toDayString } from '../engine/session';
import { speak } from '../services/speech';
import { isAvailable, SPECIAL_ROUTES } from '../skills/registry';
import { useApp } from '../state/AppContext';
import { colors, font, fonts, radius, shadow, space } from '../theme';

const UNIVERSES: { domain: Domain; title: string; emoji: string }[] = [
  { domain: 'fr', title: 'Français', emoji: '📖' },
  { domain: 'math', title: 'Maths', emoji: '🔢' },
];

/** First launch: ask the child's first name (kept on the device only). */
function Welcome() {
  const { updateSettings } = useApp();
  const [name, setName] = useState('');
  const save = () => {
    if (name.trim()) void updateSettings({ childName: name.trim() });
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <View style={{ height: space.xl }} />
        <SeyesPaper>
          <Text style={styles.welcomeTitle}>Bienvenue !</Text>
          <Text style={styles.welcomeText}>Comment t’appelles-tu ?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={save}
            autoCorrect={false}
            autoFocus
            placeholder="Ton prénom"
            placeholderTextColor={colors.disabled}
            accessibilityLabel="Ton prénom"
            style={styles.nameInput}
          />
        </SeyesPaper>
        <BigButton label="C’est parti !" onPress={save} disabled={!name.trim()} />
      </Screen>
    </SafeAreaView>
  );
}

export default function Home() {
  const { settings } = useApp();
  return settings.childName ? <HomeScreen /> : <Welcome />;
}

function Chip({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={[styles.chip, shadow(1)]} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <View>
        <Text style={styles.chipValue}>{value}</Text>
        <Text style={styles.chipLabel}>{label}</Text>
      </View>
    </View>
  );
}

function HomeScreen() {
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
  const count = (domain: Domain) => SKILL_ORDER.filter((id) => SKILLS[id].domain === domain && (isAvailable(id) || SPECIAL_ROUTES[id] !== undefined)).length;
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <View style={styles.top}>
          <Pressable onPress={() => void speak(`${greeting} Que veux-tu faire aujourd’hui ?`)} accessibilityRole="header" style={{ flex: 1 }}>
            <Text style={styles.hello}>{greeting}</Text>
            <Text style={styles.subtitle}>On s’entraîne aujourd’hui ?</Text>
          </Pressable>
        </View>

        <View style={styles.chips}>
          <Chip icon="⭐" value={String(stars)} label="étoiles" />
          <Chip icon="🔥" value={String(streak)} label={streak > 1 ? 'jours de suite' : 'jour de suite'} />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Séance du jour"
          onPress={() => router.push({ pathname: '/session', params: { mode: 'daily' } })}
          style={({ pressed }) => [styles.hero, shadow(2), pressed && styles.pressed]}
        >
          <View style={styles.heroDots} pointerEvents="none">
            {Array.from({ length: 5 }, (_, i) => (
              <View key={i} style={[styles.heroLine, { top: 22 + i * 26 }]} />
            ))}
          </View>
          <Text style={styles.heroEyebrow}>☀️ Séance du jour</Text>
          <Text style={styles.heroTitle}>{settings.dailyMinutes} minutes, rien que pour toi</Text>
          <Text style={styles.heroText}>Des exercices choisis selon tes progrès.</Text>
          <View style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Commencer  ▸</Text>
          </View>
        </Pressable>

        <View style={styles.universes}>
          {UNIVERSES.map((u) => (
            <Pressable
              key={u.domain}
              accessibilityRole="button"
              accessibilityLabel={u.title === 'Maths' ? 'Mathématiques' : u.title}
              onPress={() => router.push(`/universe/${u.domain}`)}
              style={({ pressed }) => [styles.universe, shadow(1), pressed && styles.pressed]}
            >
              <View style={[styles.universeIcon, { backgroundColor: colors.domainSoft[u.domain] }]}>
                <Text style={styles.universeEmoji}>{u.emoji}</Text>
              </View>
              <Text style={[styles.universeTitle, { color: colors.domain[u.domain] }]}>{u.title}</Text>
              <Text style={styles.universeCount}>{count(u.domain)} exercices</Text>
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
  safe: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', alignItems: 'center', marginTop: space.m },
  hello: { fontSize: font.title + 2, fontFamily: fonts.display, color: colors.text },
  subtitle: { fontSize: font.body, color: colors.textMuted, marginTop: 2 },
  chips: { flexDirection: 'row', gap: space.s + 2 },
  chip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.s,
    backgroundColor: colors.surface, borderRadius: radius.m, paddingVertical: space.s + 2, paddingHorizontal: space.m,
  },
  chipIcon: { fontSize: 28 },
  chipValue: { fontSize: font.large, fontFamily: fonts.display, color: colors.text, lineHeight: 28 },
  chipLabel: { fontSize: font.small - 2, color: colors.textMuted },
  hero: {
    backgroundColor: colors.primary, borderRadius: radius.l, padding: space.l, gap: space.s, overflow: 'hidden',
  },
  heroDots: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  heroEyebrow: { fontSize: font.body - 2, fontFamily: fonts.display, color: '#CFE0FF' },
  heroTitle: { fontSize: font.large + 2, fontFamily: fonts.display, color: colors.primaryText, lineHeight: 32 },
  heroText: { fontSize: font.small + 1, color: '#DCE8FF' },
  heroButton: {
    alignSelf: 'flex-start', marginTop: space.s, backgroundColor: colors.star,
    paddingHorizontal: space.l, paddingVertical: space.s + 4, borderRadius: radius.pill,
  },
  heroButtonText: { fontSize: font.body, fontFamily: fonts.display, color: colors.text },
  pressed: { transform: [{ scale: 0.98 }] },
  universes: { flexDirection: 'row', gap: space.m },
  universe: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.l, padding: space.m, gap: space.xs },
  universeIcon: { width: 56, height: 56, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  universeEmoji: { fontSize: 30 },
  universeTitle: { fontSize: font.large - 1, fontFamily: fonts.display },
  universeCount: { fontSize: font.small - 1, color: colors.textMuted },
  parentLink: { alignSelf: 'center', padding: space.m },
  parentText: { fontSize: font.small, color: colors.textMuted },
  welcomeTitle: { fontSize: font.title + 4, fontFamily: fonts.display, color: colors.primary, lineHeight: 44 },
  welcomeText: { fontSize: font.large, color: colors.text, lineHeight: 32, marginBottom: space.m },
  nameInput: {
    minHeight: 68, borderWidth: 2.5, borderColor: colors.primary, borderRadius: radius.m, backgroundColor: colors.surface,
    fontSize: font.title, paddingHorizontal: space.m, color: colors.text, fontFamily: fonts.display,
  },
});
