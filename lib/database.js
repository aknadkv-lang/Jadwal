import { mkdirSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

const databaseDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(databaseDirectory, "ruang-kuliah.sqlite");
let database;

export function getDatabase() {
  if (database) return database;
  mkdirSync(databaseDirectory, { recursive: true });
  database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      course TEXT NOT NULL,
      place TEXT NOT NULL DEFAULT '',
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    ) STRICT;
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      course TEXT NOT NULL,
      deadline TEXT NOT NULL,
      priority TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    ) STRICT;
    CREATE INDEX IF NOT EXISTS idx_schedules_day_time ON schedules(day, time);
    CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
  `);
  return database;
}

export function taskFromRow(row) {
  return row ? { ...row, done: Boolean(row.done) } : null;
}
