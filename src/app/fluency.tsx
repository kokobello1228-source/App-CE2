import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { FluencyChart } from '../components/FluencyChart';
import { Screen } from '../components/Screen';
import { SeyesPaper } from '../components/SeyesPaper';
import { SpeakButton } from '../components/SpeakButton';
import { Text } from '../components/Text';
import { TimerBar } from '../components/TimerBar';
import { FLUENCY_INSTRUCTION } from '../content/phrases';
import { BAND_LABELS, fluencyBand } from '../engine/scoring';
import { fluencyScore, nextText, READING_SECONDS, tokenize, F14_TEXTS } from '../skills/f14/fluency';
import type { FluencyResult } from '../storage/store';
import { useApp } from '../state/AppContext';
import { colors, font, fonts, radius, shadow, space } from '../theme';

type Phase = 'choose' | 'reading' | 'last' | 'result';

const CHILD_INSTRUCTION = FLUENCY_INSTRUCTION;

export default function Fluency() {
  const { repo, notifyDataChanged } = useApp();
  const [results, setResults] = useState<FluencyResult[]>([]);
  const [textIndex, setTextIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('choose');
  const [errors, setErrors] = useState<number[]>([]);
  const [remaining, setRemaining] = useState(READING_SECONDS);
  const [score, setScore] = useState<{ wordsRead: number; errors: number; wcpm: number; seconds: number } | null>(null);
  const startedAt = useRef(0);
  const elapsed = useRef(READING_SECONDS);

  useEffect(() => {
    void repo.fluencyResults().then((r) => {
      setResults(r);
      setTextIndex(F14_TEXTS.indexOf(nextText(r.map((x) => x.textId))));
    });
  }, [repo]);

  const text = F14_TEXTS[textIndex];
  const tokens = tokenize(text.text);

  useEffect(() => {
    if (phase !== 'reading') return;
    const id = setInterval(() => {
      const left = Math.max(0, READING_SECONDS - Math.floor((Date.now() - startedAt.current) / 1000));
      setRemaining(left);
      if (left === 0) {
        elapsed.current = READING_SECONDS;
        setPhase('last');
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  const start = () => {
    setErrors([]);
    setRemaining(READING_SECONDS);
    startedAt.current = Date.now();
    setPhase('reading');
  };

  const finish = async (lastToken: number) => {
    const seconds = phase === 'reading' ? Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)) : elapsed.current;
    const s = fluencyScore({ text: text.text, lastToken, errors, seconds });
    setScore({ ...s, seconds });
    setPhase('result');
    await repo.saveFluencyResult({ textId: text.id, wordsRead: s.wordsRead, errors: s.errors, seconds, wcpm: s.wcpm });
    setResults(await repo.fluencyResults());
    notifyDataChanged();
  };

  const toggleError = (i: number) => setErrors((e) => (e.includes(i) ? e.filter((x) => x !== i) : [...e, i]));

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Lire à voix haute' }} />
      {phase === 'choose' && (
        <>
          <View style={[styles.card, shadow(1)]}>
            <Text style={styles.h1}>🗣️ Lecture à deux</Text>
            <Text style={styles.body}>
              L’enfant lit le texte à voix haute pendant 1 minute. Vous suivez sur l’écran : touchez chaque mot mal lu, puis, à la
              fin, le dernier mot lu. L’objectif de fin de CE1 est de 70 mots bien lus par minute.
            </Text>
          </View>
          <SeyesPaper>
            <Text style={styles.textTitle}>{text.title}</Text>
            <Text style={styles.muted}>{text.words} mots</Text>
          </SeyesPaper>
          <View style={styles.row}>
            <SpeakButton text={CHILD_INSTRUCTION} label="Consigne pour l’enfant" />
            <Pressable onPress={() => setTextIndex((i) => (i + 1) % F14_TEXTS.length)} style={styles.link}>
              <Text style={styles.linkText}>Changer de texte ›</Text>
            </Pressable>
          </View>
          <BigButton label="▶  Démarrer la minute" onPress={start} />
          {results.length > 0 && (
            <View style={[styles.card, shadow(1)]}>
              <Text style={styles.h2}>Progrès</Text>
              <FluencyChart results={results} />
            </View>
          )}
        </>
      )}

      {(phase === 'reading' || phase === 'last') && (
        <>
          {phase === 'reading' ? (
            <>
              <TimerBar remaining={remaining} total={READING_SECONDS} />
              <Text style={styles.instruction}>Touchez les mots mal lus.</Text>
            </>
          ) : (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>⏰ Temps écoulé ! Touchez le dernier mot lu.</Text>
            </View>
          )}
          <SeyesPaper>
            <Text style={styles.textTitle}>{text.title}</Text>
            <View style={styles.words}>
              {tokens.map((t, i) => {
                const wrong = errors.includes(i);
                return (
                  <Pressable
                    key={i}
                    disabled={!t.isWord}
                    onPress={() => (phase === 'reading' ? toggleError(i) : void finish(i))}
                    style={[styles.word, wrong && styles.wrong]}
                    accessibilityRole="button"
                    accessibilityLabel={t.token}
                  >
                    <Text style={[styles.wordText, wrong && styles.wrongText]}>{t.token}</Text>
                  </Pressable>
                );
              })}
            </View>
          </SeyesPaper>
          {phase === 'reading' && (
            <BigButton
              label="Texte terminé avant la minute"
              variant="secondary"
              // Too early is surely a mistaken tap: the score would be extrapolated wildly.
              disabled={remaining > READING_SECONDS - 20}
              onPress={() => void finish(tokens.length - 1)}
            />
          )}
        </>
      )}

      {phase === 'result' && score && (
        <>
          <SeyesPaper>
            <View style={styles.result}>
              <Text style={styles.resultNumber}>{score.wcpm}</Text>
              <Text style={styles.resultUnit}>mots bien lus par minute</Text>
              <Text style={[styles.band, { color: colors.band[fluencyBand(score.wcpm)] }]}>
                {BAND_LABELS[fluencyBand(score.wcpm)]} · objectif 70
              </Text>
              <Text style={styles.muted}>
                {score.wordsRead} mots lus · {score.errors} erreur{score.errors > 1 ? 's' : ''} · {score.seconds} s
              </Text>
            </View>
          </SeyesPaper>
          {results.length > 0 && (
            <View style={[styles.card, shadow(1)]}>
              <Text style={styles.h2}>Progrès</Text>
              <FluencyChart results={results} />
            </View>
          )}
          <BigButton
            label="Lire un autre texte"
            onPress={() => {
              setTextIndex(F14_TEXTS.indexOf(nextText([...results.map((r) => r.textId)])));
              setPhase('choose');
            }}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.l, padding: space.l, gap: space.s },
  h1: { fontSize: font.large, fontFamily: fonts.display, color: colors.domain.fr },
  h2: { fontSize: font.body, fontFamily: fonts.display, color: colors.text },
  body: { fontSize: font.small + 1, color: colors.text, lineHeight: 24 },
  muted: { fontSize: font.small, color: colors.textMuted },
  textTitle: { fontSize: font.large, fontFamily: fonts.display, color: colors.primary, marginBottom: space.s },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: space.s },
  link: { padding: space.s },
  linkText: { fontSize: font.small + 1, fontFamily: fonts.display, color: colors.primary },
  instruction: { fontSize: font.body - 2, color: colors.textMuted },
  banner: { backgroundColor: colors.star, borderRadius: radius.m, padding: space.m },
  bannerText: { fontSize: font.body - 1, fontFamily: fonts.display, color: colors.text },
  words: { flexDirection: 'row', flexWrap: 'wrap' },
  word: { paddingHorizontal: 3, paddingVertical: 4, borderRadius: 6 },
  wrong: { backgroundColor: '#FFE1C7' },
  wordText: { fontSize: font.large - 2, lineHeight: 30, color: colors.text },
  wrongText: { color: '#B54708', textDecorationLine: 'line-through' },
  result: { alignItems: 'center', gap: space.xs, paddingVertical: space.s },
  resultNumber: { fontSize: 72, fontFamily: fonts.displayBold, color: colors.primary, lineHeight: 80 },
  resultUnit: { fontSize: font.body, color: colors.text },
  band: { fontSize: font.body, fontFamily: fonts.display },
});
