import { SKILLS, type SkillId } from '../../skills.config';
import { ADAPT_WINDOW, nextLevel } from '../engine/adaptive';
import { createRng, randomSeed } from '../engine/rng';
import { estimateSkillBand } from '../engine/scoring';
import {
  buildItems, chooseDailySkills, dailyItemCount, dailySkillCount, freePracticeCount, sessionStars, summarizeBySkill,
  toDayString, type AnswerRecord, type Block, type Mode, type SkillSnapshot,
} from '../engine/session';
import { onAnswer as reviewOnAnswer } from '../engine/spacedRepetition';
import { availableSkills, getLogic } from '../skills/registry';
import type { ItemBase, Level } from '../skills/types';
import type { Repository } from '../storage/repository';
import type { Settings } from '../storage/settings';

export interface PreparedSession {
  sessionId: number;
  mode: Mode;
  blocks: Block[];
  levels: Partial<Record<SkillId, Level>>;
}

async function loadReviews(repo: Repository, skillId: SkillId, limit: number): Promise<ItemBase[]> {
  const logic = getLogic(skillId);
  const entries = await repo.dueReviews(skillId, Date.now(), limit);
  const items: ItemBase[] = [];
  for (const entry of entries) {
    try {
      const parsed = logic.schema.safeParse(JSON.parse(entry.itemJson));
      if (parsed.success) items.push(parsed.data);
    } catch {
      // Ignore an unreadable stored item.
    }
  }
  return items;
}

export async function prepareSession(
  repo: Repository,
  settings: Settings,
  mode: Mode,
  skillId?: SkillId,
): Promise<PreparedSession> {
  const levels = await repo.getLevels();
  const rng = createRng(randomSeed());
  const levelOf = (id: SkillId): Level => levels[id] ?? 1;
  const blocks: Block[] = [];

  if (mode === 'school' && skillId) {
    const { items } = buildItems({
      logic: getLogic(skillId), count: SKILLS[skillId].officialItems, level: 1, rng, mixedLevels: true,
    });
    blocks.push({ skillId, items, reviewKeys: [], timing: SKILLS[skillId].timing, immediateFeedback: false });
  } else if (mode === 'free' && skillId) {
    const count = freePracticeCount(skillId);
    const reviews = await loadReviews(repo, skillId, Math.ceil(count / 2));
    const built = buildItems({ logic: getLogic(skillId), count, level: levelOf(skillId), rng, reviews });
    blocks.push({
      skillId, ...built, timing: settings.timerInPractice ? SKILLS[skillId].timing : null, immediateFeedback: true,
    });
  } else {
    const now = Date.now();
    const [histories, dueCounts] = await Promise.all([repo.skillHistories(), repo.dueReviewCounts(now)]);
    const snapshots: SkillSnapshot[] = availableSkills().map((id) => {
      const h = histories[id];
      return {
        skillId: id,
        band: h ? estimateSkillBand(id, h.correct, h.total) : null,
        lastPracticedAt: h?.lastPracticedAt ?? null,
        dueReviews: dueCounts[id] ?? 0,
      };
    });
    const skillCount = Math.min(snapshots.length, dailySkillCount(settings.dailyMinutes));
    for (const id of chooseDailySkills(snapshots, skillCount, now)) {
      const logic = getLogic(id);
      const count = dailyItemCount(logic, settings.dailyMinutes, skillCount);
      const reviews = await loadReviews(repo, id, Math.ceil(count / 2));
      blocks.push({ skillId: id, ...buildItems({ logic, count, level: levelOf(id), rng, reviews }), timing: null, immediateFeedback: true });
    }
  }

  const sessionId = await repo.startSession(mode, toDayString(new Date()));
  return { sessionId, mode, blocks, levels };
}

/** Saves an answer, updates the review queue and adapts the level of the skill. */
export async function saveAnswer(repo: Repository, session: PreparedSession, record: AnswerRecord): Promise<void> {
  const { skillId, item } = record;
  await repo.recordAttempt({
    sessionId: session.sessionId, skillId, level: item.level, mode: session.mode, item,
    answer: record.answer, correct: record.correct, errorTag: record.errorTag, isReview: record.isReview,
  });
  const existing = await repo.getReview(skillId, item.key);
  await repo.applyReviewUpdate(
    reviewOnAnswer(existing, {
      skillId, itemKey: item.key, itemJson: JSON.stringify(item), correct: record.correct, now: Date.now(),
    }),
  );
  if (session.mode === 'school') return;
  const current = session.levels[skillId] ?? 1;
  const recent = await repo.recentResultsAtLevel(skillId, current, ADAPT_WINDOW);
  const next = nextLevel(current, recent);
  if (next !== current) {
    session.levels[skillId] = next;
    await repo.setLevel(skillId, next);
  }
}

export interface SessionSummary {
  stars: number;
  correct: number;
  total: number;
}

export async function finishSession(
  repo: Repository,
  session: PreparedSession,
  records: AnswerRecord[],
): Promise<SessionSummary> {
  const correct = records.filter((r) => r.correct).length;
  let total = records.length;
  if (session.mode === 'school') {
    // Officially, unanswered items (time over) count as failed.
    const block = session.blocks[0];
    total = SKILLS[block.skillId].officialItems;
    const bySkill = summarizeBySkill(records);
    await repo.saveSchoolResult(block.skillId, bySkill[block.skillId]?.correct ?? 0, total);
  }
  const stars = sessionStars(records);
  await repo.finishSession(session.sessionId, correct, total, stars);
  return { stars, correct, total };
}
