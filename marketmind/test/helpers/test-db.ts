import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initDatabase, resetDb, getTableNames } from "../../server/database/db";
import { seedDatabase } from "../../server/database/seed";

let tempDir: string | null = null;

export function createTestDb(): string {
  if (tempDir) {
    resetDb();
    rmSync(tempDir, { recursive: true, force: true });
  }
  tempDir = mkdtempSync(join(tmpdir(), "marketmind-test-"));
  const dbPath = join(tempDir, "test.db");
  process.env.MM_DATABASE_PATH = dbPath;
  const db = initDatabase(dbPath);
  seedDatabase(db);
  return dbPath;
}

export function cleanupTestDb(): void {
  resetDb();
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
  delete process.env.MM_DATABASE_PATH;
}

export function expectAllTables(dbPath: string): void {
  const db = initDatabase(dbPath);
  const tables = getTableNames(db);
  const expected = [
    "agent_history",
    "agents",
    "inventory",
    "listings",
    "prompt_library",
    "saved_flip_analyses",
    "saved_researches",
    "scraper_cache",
    "search_results",
    "searches",
    "settings",
    "watchlist",
    "watchlist_history",
  ];
  for (const table of expected) {
    if (!tables.includes(table)) {
      throw new Error(`Missing table: ${table}`);
    }
  }
}
