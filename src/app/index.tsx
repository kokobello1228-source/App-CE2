import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SKILL_ORDER, SKILLS, type Domain } from '../../skills.config';
import { BigButton } from '../components/BigButton';
import { Chunky } from '../components/Chunky';
import { Mascot } from '../components/Mascot';
import { Screen } from '../components/Screen';
import { SpeechBubble } from '../components/SpeechBubble';
import { Text } from '../components/Text';
import { HELLO, homeGreeting } from '../content/phrases';
import { computeStreak, toDayString } from '../engine/session';
import { speak } from '../services/speech';
import { isAvailable, SPECIAL_ROUTES } from '../skills/registry';
import { useApp } from '../state/AppContext';
import { colors, font, fonts, radius, space } from '../theme';

const UNIVERSES: { domain: Domain; title: string; emoji: string; tagline: string }[] = [
  { domain: 'fr', title: 'Français', emoji: '📚', tagline: 'Lire, écouter, écrire' },
  { domain: 'math', title: 'Maths', emoji: '🧮', tagline: 'Compter, calculer, chercher' },
];

/** First launch: Plume introduces itself and asks the child's first name (kept on the device only). */
function Welcome() {
  const { updateSettings } = useApp();
  const [name, setName] = useState('');
  const save = () => {
    if (name.trim()) void updateSettings({ childName: name.trim() });
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <View style={styles.welcomeTop}>
          <Mascot mood="happy" size={150} />
          <SpeechBubble style={{ flex: 0, alignSelf: 'stretch' }} tail="top">
            <Text style={styles.bubbleTitle}>Coucou, moi c’est Plume !</Text>
            <Text style={styles.bubbleText}>Je vais t’aider à t’entraîner. Et toi, comment t’appelles-tu ?</Text>
          </SpeechBubble>
        </View>
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
        <BigButton label="C’est parti !" onPress={save} disabled={!name.trim()} />
      </Screen>
    </SafeAreaView>
  );
}

export default function Home() {
  const { settings } = useApp();
  return settings.childName ? <HomeScreen /> : <Welcome />;
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

  const count = (domain: Domain) =>
    SKILL_ORDER.filter((id) => SKILLS[id].domain === domain && (isAvailable(id) || SPECIAL_ROUTES[id] !== undefined)).length;
  const greeting = homeGreeting(streak);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <View style={styles.topBar}>
          <View style={styles.counter} accessible accessibilityLabel={`${stars} étoiles`}>
            <Text style={styles.counterIcon}>⭐</Text>
            <Text style={styles.counterValue}>{stars}</Text>
          </View>
          <View style={styles.counter} accessible accessibilityLabel={`${streak} jours de suite`}>
            <Text style={styles.counterIcon}>🔥</Text>
            <Text style={styles.counterValue}>{streak}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => router.push('/parent')} accessibilityRole="button" accessibilityLabel="Espace parent" style={styles.parentButton}>
            <Text style={styles.parentIcon}>🔒</Text>
          </Pressable>
        </View>

        <Pressable style={styles.hero} onPress={() => void speak(`${HELLO} ${greeting}`)} accessibilityRole="button" accessibilityLabel="Plume te dit bonjour">
          <Mascot mood="happy" size={118} />
          <SpeechBubble>
            <Text style={styles.bubbleTitle}>Bonjour {settings.childName} !</Text>
            <Text style={styles.bubbleText}>{greeting}</Text>
          </SpeechBubble>
        </Pressable>

        <Chunky
          onPress={() => router.push({ pathname: '/session', params: { mode: 'daily' } })}
          face={colors.star}
          radius={radius.l}
          depth={8}
          contentStyle={styles.mission}
          accessibilityRole="button"
          accessibilityLabel="Séance du jour"
        >
          <Text style={styles.missionEmoji}>🎯</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.missionEyebrow}>Mission du jour</Text>
            <Text style={styles.missionTitle}>{settings.dailyMinutes} minutes d’exercices</Text>
          </View>
          <View style={styles.play}>
            <Text style={styles.playText}>▶</Text>
          </View>
        </Chunky>

        <View style={styles.worlds}>
          {UNIVERSES.map((u) => (
            <Chunky
              key={u.domain}
              onPress={() => router.push(`/universe/${u.domain}`)}
              face={colors.domain[u.domain]}
              radius={radius.l}
              depth={8}
              style={{ flex: 1 }}
              contentStyle={styles.world}
              accessibilityRole="button"
              accessibilityLabel={u.title === 'Maths' ? 'Mathématiques' : u.title}
            >
              <View style={styles.worldBlob}>
                <Text style={styles.worldEmoji}>{u.emoji}</Text>
              </View>
              <Text style={styles.worldTitle}>{u.title}</Text>
              <Text style={styles.worldTagline}>{u.tagline}</Text>
              <Text style={styles.worldCount}>{count(u.domain)} exercices</Text>
            </Chunky>
          ))}
        </View>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: space.s, marginTop: space.s },
  counter: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface,
    paddingHorizontal: space.m, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.border,
  },
  counterIcon: { fontSize: 20, lineHeight: 26 },
  counterValue: { fontSize: font.body + 2, fontFamily: fonts.display, color: colors.text, lineHeight: 28 },
  parentButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  parentIcon: { fontSize: 18 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.s, marginTop: space.s },
  bubbleTitle: { fontSize: font.large, fontFamily: fonts.display, color: colors.primary, lineHeight: 30 },
  bubbleText: { fontSize: font.body - 1, color: colors.text, lineHeight: 26 },
  mission: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m + 4 },
  missionEmoji: { fontSize: 42, lineHeight: 50 },
  missionEyebrow: { fontSize: font.small, fontFamily: fonts.bold, color: '#7A5600' },
  missionTitle: { fontSize: font.large, fontFamily: fonts.display, color: colors.text, lineHeight: 30 },
  play: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  playText: { fontSize: 22, color: colors.starDark, marginLeft: 3 },
  worlds: { flexDirection: 'row', gap: space.m },
  world: { padding: space.m, paddingVertical: space.l, alignItems: 'flex-start', gap: 2, minHeight: 200 },
  worldBlob: {
    width: 64, height: 64, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: space.s, transform: [{ rotate: '-6deg' }],
  },
  worldEmoji: { fontSize: 36, lineHeight: 44 },
  worldTitle: { fontSize: font.title, fontFamily: fonts.display, color: colors.primaryText, lineHeight: 36 },
  worldTagline: { fontSize: font.small - 1, color: 'rgba(255,255,255,0.92)', lineHeight: 20 },
  worldCount: {
    marginTop: space.s, fontSize: font.small - 2, fontFamily: fonts.bold, color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, overflow: 'hidden',
  },
  welcomeTop: { alignItems: 'center', gap: space.m, marginTop: space.l },
  nameInput: {
    minHeight: 68, borderWidth: 3, borderColor: colors.primary, borderRadius: radius.l, backgroundColor: colors.surface,
    fontSize: font.title, paddingHorizontal: space.m, color: colors.text, fontFamily: fonts.display, textAlign: 'center',
  },
});
