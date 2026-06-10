import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getDb, initDatabase, resetDb } from "../../server/database/db";
import {
  backupDatabaseAsSql,
  restoreDatabaseFromSql,
} from "../../server/database/lifecycle";
import { validateSqlBackup } from "../../server/database/sql-transfer";

let tempDir: string | null = null;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "marketmind-db-backup-api-"));
  const dbPath = join(tempDir, "api.db");
  process.env.MM_DATABASE_DEV = dbPath;
  initDatabase(dbPath);
  getDb()
    .prepare("INSERT INTO watchlist (title, status) VALUES (?, ?)")
    .run("Backup-Test", "aktiv");
});

afterEach(() => {
  resetDb();
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
  delete process.env.MM_DATABASE_DEV;
});

describe("database backup/restore", () => {
  it("creates sql backup content", () => {
    const sql = backupDatabaseAsSql();
    expect(sql).toContain("CREATE TABLE");
    expect(sql).toContain("Backup-Test");
    expect(() => validateSqlBackup(sql)).not.toThrow();
  });

  it("restores sql backup content", () => {
    const sql = backupDatabaseAsSql();
    getDb().prepare("DELETE FROM watchlist").run();

    restoreDatabaseFromSql(sql);

    const titles = getDb().prepare("SELECT title FROM watchlist").all() as {
      title: string;
    }[];
    expect(titles).toEqual([{ title: "Backup-Test" }]);
  });
});
