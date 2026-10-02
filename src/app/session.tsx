import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SKILLS, type SkillId } from '../../skills.config';
import { BigButton } from '../components/BigButton';
import { Screen } from '../components/Screen';
import { SessionRunner } from '../components/SessionRunner';
import { Stars } from '../components/Stars';
import type { AnswerRecord, Mode } from '../engine/session';
import { speak } from '../services/speech';
import { getLogic, isAvailable } from '../skills/registry';
import { useApp } from '../state/AppContext';
import {
  finishSession, prepareSession, saveAnswer, type PreparedSession, type SessionSummary,
} from '../state/sessionController';
import { colors, font, radius, space } from '../theme';

type State =
  | { kind: 'loading' }
  | { kind: 'running'; session: PreparedSession }
  | { kind: 'done'; session: PreparedSession; summary: SessionSummary; records: AnswerRecord[] };

export default function SessionScreen() {
  const params = useLocalSearchParams<{ mode: Mode; skill?: SkillId }>();
  const { repo, settings, notifyDataChanged } = useApp();
  const [state, setState] = useState<State>({ kind: 'loading' });
  // Answers are saved one after the other, in order.
  const saving = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const skill = params.skill && isAvailable(params.skill) ? params.skill : undefined;
    void prepareSession(repo, settings, params.mode ?? 'daily', skill).then((session) =>
      setState({ kind: 'running', session }),
    );
    // Prepared once when the screen opens.
  }, []);

  if (state.kind === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (state.kind === 'running') {
    const { session } = state;
    return (
      <Screen>
        <SessionRunner
          blocks={session.blocks}
          onAnswer={(record) => {
            saving.current = saving.current.then(() => saveAnswer(repo, session, record)).catch(() => undefined);
          }}
          onFinish={(records) => {
            void saving.current.then(async () => {
              const summary = await finishSession(repo, session, records);
              notifyDataChanged();
              setState({ kind: 'done', session, summary, records });
            });
          }}
        />
      </Screen>
    );
  }

  return <Summary {...state} childName={settings.childName} />;
}

function Summary({
  session, summary, records, childName,
}: { session: PreparedSession; summary: SessionSummary; records: AnswerRecord[]; childName: string }) {
  const school = session.mode === 'school';
  const mistakes = records.filter((r) => !r.correct);
  const message = `Bravo ${childName} ! Tu as réussi ${summary.correct} question${summary.correct > 1 ? 's' : ''} sur ${summary.total}.`;
  useEffect(() => {
    void speak(message);
  }, [message]);

  return (
    <Screen>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Séance terminée !</Text>
        <Stars count={summary.stars} size={56} />
        <Text style={styles.summaryText}>{message}</Text>
        {school && records.length < summary.total && (
          <Text style={styles.muted}>Le temps était écoulé avant la fin : ce n’est pas grave, on s’entraîne pour aller plus vite.</Text>
        )}
      </View>

      {school && mistakes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Corrigeons ensemble</Text>
          {mistakes.map((r, i) => {
            const logic = getLogic(r.skillId);
            return (
              <View key={`${r.item.key}-${i}`} style={styles.mistake}>
                <Text style={styles.mistakeAnswer}>
                  Bonne réponse : <Text style={{ fontWeight: '800' }}>{logic.correctAnswerLabel(r.item)}</Text>
                </Text>
                <Text style={styles.mistakeText}>{logic.explain(r.item, r.answer)}</Text>
              </View>
            );
          })}
        </>
      )}

      {!school && (
        <Text style={styles.muted}>
          {session.blocks.map((b) => SKILLS[b.skillId].title).join(' · ')}
        </Text>
      )}
      <BigButton label="Retour à l’accueil" onPress={() => router.dismissTo('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  summaryCard: {
    backgroundColor: colors.surface, borderRadius: radius.l, padding: space.l, alignItems: 'center', gap: space.m, marginTop: space.l,
  },
  summaryTitle: { fontSize: font.title, fontWeight: '800', color: colors.text },
  summaryText: { fontSize: font.large, color: colors.text, textAlign: 'center', lineHeight: 34 },
  muted: { fontSize: font.body, color: colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: font.large, fontWeight: '800', color: colors.text, marginTop: space.m },
  mistake: { backgroundColor: colors.retryBg, borderRadius: radius.m, padding: space.m, gap: space.xs },
  mistakeAnswer: { fontSize: font.body, color: colors.text },
  mistakeText: { fontSize: font.body, color: colors.text, lineHeight: 28 },
});
