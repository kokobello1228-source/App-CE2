import * as SQLite from 'expo-sqlite';
import type { SkillId } from '../../skills.config';
import type { Mode } from '../engine/session';
import type { ReviewEntry, ReviewUpdate } from '../engine/spacedRepetition';
import type { Level } from '../skills/types';
import { MIGRATIONS } from './migrations';
import { DEFAULT_SETTINGS, type Settings } from './settings';
import { HISTORY_WINDOW, type AttemptInput, type SkillHistory, type Store } from './store';

export type { AttemptInput, SkillHistory } from './store';

/** Local persistence (SQLite). Nothing ever leaves the device. */
export class Repository implements Store {
  private constructor(private readonly db: SQLite.SQLiteDatabase) {}

  static async open(name = 'reperes-ce2.db'): Promise<Repository> {
    const db = await SQLite.openDatabaseAsync(name);
    await db.execAsync('PRAGMA journal_mode = WAL;');
    const repo = new Repository(db);
    await repo.migrate();
    return repo;
  }

  private async migrate(): Promise<void> {
    const row = await this.db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const current = row?.user_version ?? 0;
    for (let version = current; version < MIGRATIONS.length; version++) {
      await this.db.withTransactionAsync(async () => {
        await this.db.execAsync(MIGRATIONS[version]);
        await this.db.execAsync(`PRAGMA user_version = ${version + 1}`);
      });
    }
  }

  // Settings

  async getSettings(): Promise<Settings> {
    const rows = await this.db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
    const stored = Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value) as unknown]));
    return { ...DEFAULT_SETTINGS, ...stored } as Settings;
  }

  async saveSettings(patch: Partial<Settings>): Promise<void> {
    for (const [key, value] of Object.entries(patch)) {
      await this.db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        key, JSON.stringify(value),
      );
    }
  }

  // Levels

  async getLevels(): Promise<Partial<Record<SkillId, Level>>> {
    const rows = await this.db.getAllAsync<{ skill_id: SkillId; level: Level }>('SELECT skill_id, level FROM skill_state');
    return Object.fromEntries(rows.map((r) => [r.skill_id, r.level]));
  }

  async setLevel(skillId: SkillId, level: Level): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO skill_state (skill_id, level, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(skill_id) DO UPDATE SET level = excluded.level, updated_at = excluded.updated_at`,
      skillId, level, Date.now(),
    );
  }

  /** Results of the last answers given at a level (oldest first), for the adaptive difficulty. */
  async recentResultsAtLevel(skillId: SkillId, level: Level, limit: number): Promise<boolean[]> {
    const rows = await this.db.getAllAsync<{ correct: number }>(
      `SELECT correct FROM attempts WHERE skill_id = ? AND level = ? AND mode != 'school'
       AND created_at >= COALESCE((SELECT updated_at FROM skill_state WHERE skill_id = ?), 0)
       ORDER BY id DESC LIMIT ?`,
      skillId, level, skillId, limit,
    );
    return rows.map((r) => r.correct === 1).reverse();
  }

  // Sessions and attempts

  async startSession(mode: Mode, day: string): Promise<number> {
    const result = await this.db.runAsync('INSERT INTO sessions (mode, started_at, day) VALUES (?, ?, ?)', mode, Date.now(), day);
    return result.lastInsertRowId;
  }

  async finishSession(id: number, correct: number, total: number, stars: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE sessions SET finished_at = ?, correct = ?, total = ?, stars = ? WHERE id = ?',
      Date.now(), correct, total, stars, id,
    );
  }

  async recordAttempt(a: AttemptInput): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO attempts (session_id, skill_id, level, mode, item_key, item_json, answer, correct, error_tag, is_review, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      a.sessionId, a.skillId, a.level, a.mode, a.item.key, JSON.stringify(a.item), a.answer,
      a.correct ? 1 : 0, a.errorTag, a.isReview ? 1 : 0, Date.now(),
    );
  }

  /** Success over the last HISTORY_WINDOW attempts of every skill. */
  async skillHistories(): Promise<Partial<Record<SkillId, SkillHistory>>> {
    const rows = await this.db.getAllAsync<{ skill_id: SkillId; correct: number; total: number; last: number }>(
      `SELECT skill_id, SUM(correct) AS correct, COUNT(*) AS total, MAX(created_at) AS last FROM (
         SELECT skill_id, correct, created_at,
                ROW_NUMBER() OVER (PARTITION BY skill_id ORDER BY id DESC) AS rn
         FROM attempts
       ) WHERE rn <= ? GROUP BY skill_id`,
      HISTORY_WINDOW,
    );
    return Object.fromEntries(
      rows.map((r) => [r.skill_id, { correct: r.correct, total: r.total, lastPracticedAt: r.last }]),
    );
  }

  /** Most frequent error tags of a skill over its recent attempts. */
  async errorTagCounts(skillId: SkillId): Promise<{ tag: string; count: number }[]> {
    return this.db.getAllAsync<{ tag: string; count: number }>(
      `SELECT error_tag AS tag, COUNT(*) AS count FROM (
         SELECT error_tag FROM attempts WHERE skill_id = ? ORDER BY id DESC LIMIT ?
       ) WHERE tag IS NOT NULL GROUP BY tag ORDER BY count DESC`,
      skillId, HISTORY_WINDOW,
    );
  }

  async activeDays(): Promise<string[]> {
    const rows = await this.db.getAllAsync<{ day: string }>(
      'SELECT DISTINCT day FROM sessions WHERE finished_at IS NOT NULL ORDER BY day DESC LIMIT 400',
    );
    return rows.map((r) => r.day);
  }

  async totalStars(): Promise<number> {
    const row = await this.db.getFirstAsync<{ stars: number | null }>('SELECT SUM(stars) AS stars FROM sessions');
    return row?.stars ?? 0;
  }

  // Spaced repetition

  async getReview(skillId: SkillId, itemKey: string): Promise<ReviewEntry | null> {
    const row = await this.db.getFirstAsync<{ skill_id: string; item_key: string; item_json: string; streak: number; due_at: number }>(
      'SELECT * FROM review_queue WHERE skill_id = ? AND item_key = ?', skillId, itemKey,
    );
    return row
      ? { skillId: row.skill_id, itemKey: row.item_key, itemJson: row.item_json, streak: row.streak, dueAt: row.due_at }
      : null;
  }

  async applyReviewUpdate(update: ReviewUpdate): Promise<void> {
    if (update.kind === 'upsert') {
      const e = update.entry;
      await this.db.runAsync(
        `INSERT INTO review_queue (skill_id, item_key, item_json, streak, due_at) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(skill_id, item_key) DO UPDATE SET item_json = excluded.item_json, streak = excluded.streak, due_at = excluded.due_at`,
        e.skillId, e.itemKey, e.itemJson, e.streak, e.dueAt,
      );
    } else if (update.kind === 'remove') {
      await this.db.runAsync('DELETE FROM review_queue WHERE skill_id = ? AND item_key = ?', update.skillId, update.itemKey);
    }
  }

  async dueReviews(skillId: SkillId, now: number, limit: number): Promise<ReviewEntry[]> {
    const rows = await this.db.getAllAsync<{ skill_id: string; item_key: string; item_json: string; streak: number; due_at: number }>(
      'SELECT * FROM review_queue WHERE skill_id = ? AND due_at <= ? ORDER BY due_at LIMIT ?', skillId, now, limit,
    );
    return rows.map((row) => ({
      skillId: row.skill_id, itemKey: row.item_key, itemJson: row.item_json, streak: row.streak, dueAt: row.due_at,
    }));
  }

  async dueReviewCounts(now: number): Promise<Partial<Record<SkillId, number>>> {
    const rows = await this.db.getAllAsync<{ skill_id: SkillId; n: number }>(
      'SELECT skill_id, COUNT(*) AS n FROM review_queue WHERE due_at <= ? GROUP BY skill_id', now,
    );
    return Object.fromEntries(rows.map((r) => [r.skill_id, r.n]));
  }

  // "Comme à l'école" results

  async saveSchoolResult(skillId: SkillId, correct: number, total: number): Promise<void> {
    await this.db.runAsync(
      'INSERT INTO school_results (skill_id, correct, total, created_at) VALUES (?, ?, ?, ?)',
      skillId, correct, total, Date.now(),
    );
  }

  async resetAll(): Promise<void> {
    await this.db.execAsync(`
      DELETE FROM attempts; DELETE FROM sessions; DELETE FROM review_queue;
      DELETE FROM skill_state; DELETE FROM school_results; DELETE FROM fluency_results;
    `);
  }
}
