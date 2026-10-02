/**
 * Database migrations, applied in order. Never edit a released migration:
 * append a new one instead. The index + 1 is stored in PRAGMA user_version.
 */
export const MIGRATIONS: string[] = [
  // 1 – initial schema
  `
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS skill_state (
    skill_id TEXT PRIMARY KEY NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    finished_at INTEGER,
    day TEXT NOT NULL,
    correct INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    stars INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    skill_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    mode TEXT NOT NULL,
    item_key TEXT NOT NULL,
    item_json TEXT NOT NULL,
    answer TEXT NOT NULL,
    correct INTEGER NOT NULL,
    error_tag TEXT,
    is_review INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS attempts_skill ON attempts (skill_id, created_at);
  CREATE TABLE IF NOT EXISTS review_queue (
    skill_id TEXT NOT NULL,
    item_key TEXT NOT NULL,
    item_json TEXT NOT NULL,
    streak INTEGER NOT NULL DEFAULT 0,
    due_at INTEGER NOT NULL,
    PRIMARY KEY (skill_id, item_key)
  );
  CREATE TABLE IF NOT EXISTS school_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id TEXT NOT NULL,
    correct INTEGER NOT NULL,
    total INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS fluency_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text_id TEXT NOT NULL,
    words_read INTEGER NOT NULL,
    errors INTEGER NOT NULL,
    seconds INTEGER NOT NULL,
    wcpm INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  `,
];
