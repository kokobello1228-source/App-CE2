import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SKILLS, type Band, type SkillId } from '../../skills.config';
import { BigButton } from '../components/BigButton';
import { Screen } from '../components/Screen';
import { Stars } from '../components/Stars';
import { BAND_LABELS, estimateSkillBand } from '../engine/scoring';
import { speak } from '../services/speech';
import { availableSkills, getLogic } from '../skills/registry';
import type { ErrorTagInfo, Level } from '../skills/types';
import { useApp } from '../state/AppContext';
import { colors, font, radius, space, TOUCH } from '../theme';

/** Small multiplication a CE2 child does not know yet, as a parental gate. */
function useGate() {
  return useMemo(() => {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    return { question: `${a} × ${b}`, answer: String(a * b) };
  }, []);
}

export default function Parent() {
  const gate = useGate();
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState('');

  if (!unlocked) {
    return (
      <Screen>
        <Text style={styles.h1}>Réservé aux parents</Text>
        <Text style={styles.body}>Combien font {gate.question} ?</Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          keyboardType="number-pad"
          style={styles.input}
          accessibilityLabel="Réponse"
          onSubmitEditing={() => setUnlocked(value.trim() === gate.answer)}
        />
        <BigButton label="Entrer" onPress={() => setUnlocked(value.trim() === gate.answer)} />
        {value !== '' && value.length >= gate.answer.length && value.trim() !== gate.answer && (
          <Text style={styles.muted}>Ce n’est pas la bonne réponse.</Text>
        )}
      </Screen>
    );
  }
  return <ParentArea />;
}

interface SkillRow {
  skillId: SkillId;
  level: Level;
  band: Band | null;
  correct: number;
  total: number;
  topError: ErrorTagInfo | null;
}

function ParentArea() {
  const { repo, settings, updateSettings, dataVersion, notifyDataChanged } = useApp();
  const [rows, setRows] = useState<SkillRow[]>([]);
  const [name, setName] = useState(settings.childName);

  useEffect(() => {
    void (async () => {
      const [histories, levels] = await Promise.all([repo.skillHistories(), repo.getLevels()]);
      const result: SkillRow[] = [];
      for (const skillId of availableSkills()) {
        const h = histories[skillId];
        const band = h ? estimateSkillBand(skillId, h.correct, h.total) : null;
        let topError: ErrorTagInfo | null = null;
        if (band && band !== 'satisfaisant') {
          const tags = await repo.errorTagCounts(skillId);
          const tag = tags.find((t) => t.tag in getLogic(skillId).errorTags);
          if (tag) topError = getLogic(skillId).errorTags[tag.tag];
        }
        result.push({ skillId, level: levels[skillId] ?? 1, band, correct: h?.correct ?? 0, total: h?.total ?? 0, topError });
      }
      setRows(result);
    })();
  }, [repo, dataVersion]);

  const reset = () =>
    Alert.alert('Tout effacer ?', 'Toute la progression sera supprimée. Les réglages sont conservés.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Effacer',
        style: 'destructive',
        onPress: () => void repo.resetAll().then(notifyDataChanged),
      },
    ]);

  return (
    <Screen>
      <Text style={styles.h1}>Progression</Text>
      <Text style={styles.muted}>
        Positionnement estimé sur les 30 dernières réponses, ramené aux seuils officiels. Le tableau de bord complet arrive
        dans une prochaine étape.
      </Text>
      {rows.map((row) => (
        <View key={row.skillId} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{SKILLS[row.skillId].title}</Text>
            <Stars count={row.level} size={font.body} />
          </View>
          {row.band ? (
            <Text style={[styles.band, { color: colors.band[row.band] }]}>
              {BAND_LABELS[row.band]} · {row.correct} / {row.total} réussies
            </Text>
          ) : (
            <Text style={styles.muted}>Pas encore travaillé</Text>
          )}
          {row.topError && (
            <>
              <Text style={styles.body}>Erreur fréquente : {row.topError.label}</Text>
              <Text style={styles.tip}>💡 {row.topError.tip}</Text>
            </>
          )}
        </View>
      ))}

      <Text style={styles.h1}>Réglages</Text>
      <Text style={styles.label}>Prénom</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        onEndEditing={() => void updateSettings({ childName: name.trim() })}
        style={styles.input}
        accessibilityLabel="Prénom de l’enfant"
      />

      <Text style={styles.label}>Durée de la séance du jour</Text>
      <Segmented
        options={[5, 10, 15].map((m) => ({ value: m, label: `${m} min` }))}
        value={settings.dailyMinutes}
        onChange={(v) => void updateSettings({ dailyMinutes: v })}
      />

      <Text style={styles.label}>Vitesse de la voix</Text>
      <Segmented
        options={[
          { value: 0.75, label: 'Lente' },
          { value: 0.9, label: 'Normale' },
          { value: 1.05, label: 'Rapide' },
        ]}
        value={settings.voiceRate}
        onChange={(v) => void updateSettings({ voiceRate: v }).then(() => speak('Voici la nouvelle vitesse de la voix.'))}
      />

      <View style={styles.switchRow}>
        <Text style={[styles.label, { flex: 1 }]}>Chronomètre en entraînement libre</Text>
        <Switch
          value={settings.timerInPractice}
          onValueChange={(v) => void updateSettings({ timerInPractice: v })}
          accessibilityLabel="Chronomètre en entraînement libre"
        />
      </View>

      <BigButton label="Effacer la progression" variant="secondary" onPress={reset} />
      <Text style={styles.muted}>
        Aucune donnée ne quitte ce téléphone : pas de compte, pas de publicité, pas de statistiques envoyées.
      </Text>
    </Screen>
  );
}

function Segmented<T extends number>({
  options, value, onChange,
}: { options: { value: T; label: string }[]; value: T; onChange(v: T): void }) {
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.label}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.segmentText, selected && { color: colors.primaryText }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: font.large, fontWeight: '800', color: colors.text, marginTop: space.m },
  body: { fontSize: font.body, color: colors.text, lineHeight: 28 },
  muted: { fontSize: font.small, color: colors.textMuted, lineHeight: 22 },
  label: { fontSize: font.body, fontWeight: '700', color: colors.text },
  input: {
    minHeight: TOUCH - 8, borderWidth: 2, borderColor: colors.border, borderRadius: radius.m,
    backgroundColor: colors.surface, fontSize: font.large, paddingHorizontal: space.m, color: colors.text,
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.m, padding: space.m, gap: space.xs },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.s },
  cardTitle: { fontSize: font.body, fontWeight: '700', color: colors.text, flex: 1 },
  band: { fontSize: font.body, fontWeight: '700' },
  tip: { fontSize: font.small + 1, color: colors.text, lineHeight: 22 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  segmented: { flexDirection: 'row', gap: space.s },
  segment: {
    flex: 1, minHeight: TOUCH - 12, borderRadius: radius.m, borderWidth: 2, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface,
  },
  segmentSelected: { backgroundColor: colors.primary },
  segmentText: { fontSize: font.body, fontWeight: '700', color: colors.primary },
});
