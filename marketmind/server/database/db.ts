import Database from "better-sqlite3";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import { getActivePath } from "./paths";
import { runMigrations } from "./migrations";

const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveSchemaPath(): string {
  const candidates = [
    join(process.cwd(), "server/database/schema.sql"),
    join(__dirname, "schema.sql"),
    join(__dirname, "..", "database", "schema.sql"),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  throw new Error("schema.sql not found");
}

let dbInstance: Database.Database | null = null;
let currentPath: string | null = null;

export function getDbPath(): string {
  return getActivePath();
}

export function getDb(dbPath?: string): Database.Database {
  const path = dbPath ?? getDbPath();
  if (dbInstance && currentPath === path) {
    return dbInstance;
  }
  if (dbInstance) {
    dbInstance.close();
  }
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true });
  dbInstance = new Database(path);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.pragma("foreign_keys = ON");
  currentPath = path;
  return dbInstance;
}

export function resetDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    currentPath = null;
  }
}

export function getTableNames(db: Database.Database): string[] {
  const rows = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    .all() as { name: string }[];
  return rows.map((r) => r.name);
}

export function initDatabase(dbPath?: string): Database.Database {
  const db = getDb(dbPath);
  const schema = readFileSync(resolveSchemaPath(), "utf-8");
  db.exec(schema);
  runMigrations(db);
  return db;
}
