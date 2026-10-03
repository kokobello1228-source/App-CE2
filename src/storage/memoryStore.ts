import type { SkillId } from '../../skills.config';
import type { Mode } from '../engine/session';
import type { ReviewEntry, ReviewUpdate } from '../engine/spacedRepetition';
import type { Level } from '../skills/types';
import { DEFAULT_SETTINGS, type Settings } from './settings';
import { HISTORY_WINDOW, type AttemptInput, type FluencyResult, type SkillHistory, type Store } from './store';

/** Where the JSON state is kept (browser storage on the web, nothing in tests). */
export interface Persistence {
  load(): string | null;
  save(data: string): void;
}

interface Attempt extends Omit<AttemptInput, 'item'> {
  id: number;
  itemKey: string;
  itemJson: string;
  createdAt: number;
}

interface Session {
  id: number;
  mode: Mode;
  startedAt: number;
  finishedAt: number | null;
  day: string;
  correct: number;
  total: number;
  stars: number;
}

interface State {
  version: 1;
  nextId: number;
  settings: Partial<Settings>;
  levels: Partial<Record<SkillId, { level: Level; updatedAt: number }>>;
  sessions: Session[];
  attempts: Attempt[];
  reviews: Record<string, ReviewEntry>;
  school: { skillId: SkillId; correct: number; total: number; createdAt: number }[];
  fluency: FluencyResult[];
}

/** Keeps storage small: older answers are dropped beyond this count. */
export const MAX_ATTEMPTS = 5000;
const MAX_SESSIONS = 2000;

const emptyState = (): State => ({
  version: 1, nextId: 1, settings: {}, levels: {}, sessions: [], attempts: [], reviews: {}, school: [], fluency: [],
});

const reviewId = (skillId: string, itemKey: string) => `${skillId}|${itemKey}`;

/**
 * Store kept as one JSON document. Same behaviour as the SQLite repository;
 * used by the web app, where SQLite is not available on a static host.
 */
export class MemoryStore implements Store {
  protected state: State;

  constructor(
    private readonly persistence: Persistence,
    private readonly now: () => number = Date.now,
  ) {
    this.state = emptyState();
    const raw = persistence.load();
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as State;
        if (parsed.version === 1) this.state = { ...emptyState(), ...parsed };
      } catch {
        // Unreadable data: start again rather than crash.
      }
    }
  }

  private persist(): void {
    if (this.state.attempts.length > MAX_ATTEMPTS) this.state.attempts = this.state.attempts.slice(-MAX_ATTEMPTS);
    if (this.state.sessions.length > MAX_SESSIONS) this.state.sessions = this.state.sessions.slice(-MAX_SESSIONS);
    this.persistence.save(JSON.stringify(this.state));
  }

  private id(): number {
    return this.state.nextId++;
  }

  async getSettings(): Promise<Settings> {
    return { ...DEFAULT_SETTINGS, ...this.state.settings };
  }

  async saveSettings(patch: Partial<Settings>): Promise<void> {
    this.state.settings = { ...this.state.settings, ...patch };
    this.persist();
  }

  async getLevels(): Promise<Partial<Record<SkillId, Level>>> {
    const result: Partial<Record<SkillId, Level>> = {};
    for (const [id, entry] of Object.entries(this.state.levels)) if (entry) result[id as SkillId] = entry.level;
    return result;
  }

  async setLevel(skillId: SkillId, level: Level): Promise<void> {
    this.state.levels[skillId] = { level, updatedAt: this.now() };
    this.persist();
  }

  async recentResultsAtLevel(skillId: SkillId, level: Level, limit: number): Promise<boolean[]> {
    const since = this.state.levels[skillId]?.updatedAt ?? 0;
    return this.state.attempts
      .filter((a) => a.skillId === skillId && a.level === level && a.mode !== 'school' && a.createdAt >= since)
      .slice(-limit)
      .map((a) => a.correct);
  }

  async startSession(mode: Mode, day: string): Promise<number> {
    const id = this.id();
    this.state.sessions.push({ id, mode, startedAt: this.now(), finishedAt: null, day, correct: 0, total: 0, stars: 0 });
    this.persist();
    return id;
  }

  async finishSession(id: number, correct: number, total: number, stars: number): Promise<void> {
    const session = this.state.sessions.find((s) => s.id === id);
    if (!session) return;
    Object.assign(session, { finishedAt: this.now(), correct, total, stars });
    this.persist();
  }

  async recordAttempt(a: AttemptInput): Promise<void> {
    const { item, ...rest } = a;
    this.state.attempts.push({ ...rest, id: this.id(), itemKey: item.key, itemJson: JSON.stringify(item), createdAt: this.now() });
    this.persist();
  }

  async skillHistories(): Promise<Partial<Record<SkillId, SkillHistory>>> {
    const result: Partial<Record<SkillId, SkillHistory>> = {};
    const counts: Partial<Record<SkillId, number>> = {};
    for (let i = this.state.attempts.length - 1; i >= 0; i--) {
      const a = this.state.attempts[i];
      const seen = counts[a.skillId] ?? 0;
      if (seen >= HISTORY_WINDOW) continue;
      counts[a.skillId] = seen + 1;
      const h = (result[a.skillId] ??= { correct: 0, total: 0, lastPracticedAt: a.createdAt });
      h.total += 1;
      if (a.correct) h.correct += 1;
    }
    return result;
  }

  async errorTagCounts(skillId: SkillId): Promise<{ tag: string; count: number }[]> {
    const recent = this.state.attempts.filter((a) => a.skillId === skillId).slice(-HISTORY_WINDOW);
    const counts = new Map<string, number>();
    for (const a of recent) if (a.errorTag) counts.set(a.errorTag, (counts.get(a.errorTag) ?? 0) + 1);
    return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((x, y) => y.count - x.count);
  }

  async activeDays(): Promise<string[]> {
    const days = new Set(this.state.sessions.filter((s) => s.finishedAt !== null).map((s) => s.day));
    return [...days].sort().reverse();
  }

  async totalStars(): Promise<number> {
    return this.state.sessions.reduce((acc, s) => acc + s.stars, 0);
  }

  async getReview(skillId: SkillId, itemKey: string): Promise<ReviewEntry | null> {
    return this.state.reviews[reviewId(skillId, itemKey)] ?? null;
  }

  async applyReviewUpdate(update: ReviewUpdate): Promise<void> {
    if (update.kind === 'upsert') this.state.reviews[reviewId(update.entry.skillId, update.entry.itemKey)] = update.entry;
    else if (update.kind === 'remove') delete this.state.reviews[reviewId(update.skillId, update.itemKey)];
    else return;
    this.persist();
  }

  async dueReviews(skillId: SkillId, now: number, limit: number): Promise<ReviewEntry[]> {
    return Object.values(this.state.reviews)
      .filter((r) => r.skillId === skillId && r.dueAt <= now)
      .sort((x, y) => x.dueAt - y.dueAt)
      .slice(0, limit);
  }

  async dueReviewCounts(now: number): Promise<Partial<Record<SkillId, number>>> {
    const result: Partial<Record<SkillId, number>> = {};
    for (const r of Object.values(this.state.reviews)) {
      if (r.dueAt <= now) result[r.skillId as SkillId] = (result[r.skillId as SkillId] ?? 0) + 1;
    }
    return result;
  }

  async saveSchoolResult(skillId: SkillId, correct: number, total: number): Promise<void> {
    this.state.school.push({ skillId, correct, total, createdAt: this.now() });
    this.persist();
  }

  async saveFluencyResult(r: Omit<FluencyResult, 'createdAt'>): Promise<void> {
    this.state.fluency.push({ ...r, createdAt: this.now() });
    this.persist();
  }

  async fluencyResults(): Promise<FluencyResult[]> {
    return [...this.state.fluency];
  }

  async resetAll(): Promise<void> {
    this.state = { ...emptyState(), settings: this.state.settings };
    this.persist();
  }
}
