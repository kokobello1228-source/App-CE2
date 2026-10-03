import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { SKILLS } from '../../skills.config';
import type { AnswerRecord, Block } from '../engine/session';
import { speak, stopSpeaking } from '../services/speech';
import { getLogic } from '../skills/registry';
import { SKILL_VIEWS } from '../skills/views';
import { colors, font, fonts, radius, shadow, space } from '../theme';
import { SKILL_ICONS } from '../theme/skillIcons';
import { Mascot } from './Mascot';
import { ProgressBar } from './ProgressBar';
import { SpeechBubble } from './SpeechBubble';
import { BigButton } from './BigButton';
import { FeedbackPanel } from './FeedbackPanel';
import { SpeakButton } from './SpeakButton';
import { TimerBar } from './TimerBar';

interface Props {
  blocks: Block[];
  /** Called after each answer (to save it). */
  onAnswer(record: AnswerRecord): void;
  onFinish(records: AnswerRecord[]): void;
}

type Phase = 'intro' | 'question' | 'feedback';

/** Plays the blocks of a session one item at a time, with countdowns and feedback. */
export function SessionRunner({ blocks, onAnswer, onFinish }: Props) {
  const [blockIndex, setBlockIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [last, setLast] = useState<AnswerRecord | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const records = useRef<AnswerRecord[]>([]);

  const block = blocks[blockIndex];
  const logic = getLogic(block.skillId);
  const config = SKILLS[block.skillId];
  const item = block.items[itemIndex];
  const View_ = SKILL_VIEWS[block.skillId];
  const timing = block.timing;

  useEffect(() => () => stopSpeaking(), []);

  // Instruction read aloud at the start of each block.
  useEffect(() => {
    if (phase === 'intro') void speak(logic.instruction);
  }, [phase, logic]);

  const nextBlockOrFinish = useCallback(() => {
    setTimerRunning(false);
    setRemaining(null);
    if (blockIndex + 1 < blocks.length) {
      setBlockIndex(blockIndex + 1);
      setItemIndex(0);
      setPhase('intro');
    } else {
      stopSpeaking();
      onFinish(records.current);
    }
  }, [blockIndex, blocks.length, onFinish]);

  const goToNextItem = useCallback(() => {
    if (itemIndex + 1 < block.items.length) {
      setItemIndex(itemIndex + 1);
      setPhase('question');
      // A global countdown resumes after the feedback.
      if (timing && timing.kind !== 'perItem') setTimerRunning(true);
    } else {
      nextBlockOrFinish();
    }
  }, [itemIndex, block.items.length, timing, nextBlockOrFinish]);

  const submit = useCallback(
    (answer: string) => {
      if (phase !== 'question') return;
      const correct = logic.check(item, answer);
      const record: AnswerRecord = {
        skillId: block.skillId,
        item,
        answer,
        correct,
        errorTag: logic.classifyError(item, answer),
        isReview: block.reviewKeys.includes(item.key),
      };
      records.current.push(record);
      onAnswer(record);
      setLast(record);
      if (timing?.kind === 'perItem' || block.immediateFeedback) setTimerRunning(false);
      if (block.immediateFeedback) setPhase('feedback');
      else goToNextItem();
    },
    [phase, logic, item, block, timing, onAnswer, goToNextItem],
  );

  // Each question: read it aloud, then start the per-item countdown.
  useEffect(() => {
    if (phase !== 'question') return;
    let cancelled = false;
    const text = logic.speech(item);
    void (async () => {
      if (text) await speak(text);
      if (cancelled || timing?.kind !== 'perItem') return;
      setRemaining(timing.seconds);
      setTimerRunning(true);
    })();
    return () => {
      cancelled = true;
    };
    // Only when the question changes.
  }, [phase, blockIndex, itemIndex]);

  // Countdown tick.
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setRemaining((r) => (r === null ? r : Math.max(0, r - 1))), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // Time is up.
  useEffect(() => {
    if (remaining !== 0 || !timerRunning || !timing) return;
    setTimerRunning(false);
    if (timing.kind === 'perItem') submit('');
    else nextBlockOrFinish();
  }, [remaining, timerRunning, timing, submit, nextBlockOrFinish]);

  const start = () => {
    setPhase('question');
    if (timing && timing.kind !== 'perItem') {
      setRemaining(timing.seconds);
      setTimerRunning(true);
    }
  };

  const tint = colors.domain[config.domain];

  if (phase === 'intro') {
    const timingText = timing
      ? timing.kind === 'perItem'
        ? `${timing.seconds} s par question`
        : `${formatDuration(timing.seconds)} en tout`
      : 'À ton rythme';
    return (
      <View style={styles.intro}>
        {blocks.length > 1 && (
          <View style={styles.steps}>
            {blocks.map((b, i) => (
              <View key={i} style={[styles.step, { backgroundColor: i <= blockIndex ? tint : colors.border }]} />
            ))}
          </View>
        )}
        <View style={[styles.introCard, shadow(2)]}>
          <View style={styles.introHead}>
            <View style={[styles.iconTile, { backgroundColor: colors.domainSoft[config.domain] }]}>
              <Text style={styles.icon}>{SKILL_ICONS[block.skillId]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {blocks.length > 1 && (
                <Text style={styles.eyebrow}>
                  Exercice {blockIndex + 1} sur {blocks.length}
                </Text>
              )}
              <Text style={[styles.skillTitle, { color: tint }]}>{config.title}</Text>
            </View>
          </View>
          <View style={styles.chips}>
            <Text style={styles.chip}>📝 {block.items.length} questions</Text>
            <Text style={styles.chip}>⏱ {timingText}</Text>
          </View>
        </View>
        <View style={styles.coach}>
          <Mascot mood="happy" size={96} />
          <SpeechBubble>
            <Text style={styles.instruction}>{logic.instruction}</Text>
            <View style={{ marginTop: space.s }}>
              <SpeakButton text={logic.instruction} label="Réécouter" />
            </View>
          </SpeechBubble>
        </View>
        <BigButton label="C’est parti !" onPress={start} color={tint} />
      </View>
    );
  }

  const speechText = logic.speech(item);
  const done = itemIndex + (phase === 'feedback' ? 1 : 0);
  return (
    <View style={styles.question}>
      <View style={styles.header}>
        <ProgressBar value={done} total={block.items.length} color={tint} />
        <Text style={styles.progress}>
          {itemIndex + 1}/{block.items.length}
        </Text>
      </View>
      <View style={styles.subHeader}>
        <Text style={[styles.smallTitle, { color: tint }]}>
          {SKILL_ICONS[block.skillId]} {config.title}
        </Text>
        {speechText ? <SpeakButton text={speechText} /> : <SpeakButton text={logic.instruction} label="Consigne" />}
      </View>
      {timing && remaining !== null && <TimerBar remaining={remaining} total={timing.seconds} />}
      {phase === 'question' && View_ && (
        <View_ key={`${blockIndex}-${itemIndex}`} item={item} onSubmit={submit} disabled={false} />
      )}
      {phase === 'feedback' && last && (
        <FeedbackPanel
          correct={last.correct}
          correctLabel={logic.correctAnswerLabel(last.item)}
          explanation={logic.explain(last.item, last.answer)}
          onContinue={goToNextItem}
        />
      )}
    </View>
  );
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} secondes`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : `${minutes} min ${rest} s`;
}

const styles = StyleSheet.create({
  intro: { gap: space.l, paddingTop: space.s },
  steps: { flexDirection: 'row', gap: 6 },
  step: { flex: 1, height: 6, borderRadius: radius.pill },
  introCard: { backgroundColor: colors.surface, borderRadius: radius.l, padding: space.l, gap: space.m },
  introHead: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  coach: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  iconTile: { width: 68, height: 68, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 38, lineHeight: 46 },
  eyebrow: { fontSize: font.small, color: colors.textMuted, fontFamily: fonts.bold, textTransform: 'uppercase', letterSpacing: 1 },
  skillTitle: { fontSize: font.title - 2, fontFamily: fonts.display, lineHeight: 34 },
  instruction: { fontSize: font.body, lineHeight: 28, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  chip: {
    fontSize: font.small - 2, color: colors.textMuted, backgroundColor: colors.background,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, overflow: 'hidden',
  },
  question: { gap: space.m },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  progress: { fontSize: font.body + 2, fontFamily: fonts.display, color: colors.textMuted, minWidth: 52, textAlign: 'right', lineHeight: 28 },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.s },
  smallTitle: { fontSize: font.body - 1, fontFamily: fonts.display, flexShrink: 1, lineHeight: 24 },
});
