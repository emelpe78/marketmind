import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
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
  tempDir = mkdtempSync(join(tmpdir(), "marketmind-sql-transfer-"));
});

afterEach(() => {
  resetDb();
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
  delete process.env.MM_RUNTIME;
  delete process.env.MM_DATABASE_DEV;
  delete process.env.MM_DATABASE_DOCKER;
});

describe("database sql transfer", () => {
  it("exports and restores a database roundtrip", () => {
    const dbPath = join(tempDir!, "roundtrip.db");
    process.env.MM_DATABASE_DEV = dbPath;
    initDatabase(dbPath);
    const db = getDb();
    db.prepare("INSERT INTO watchlist (title, status) VALUES (?, ?)").run(
      "Testartikel",
      "aktiv",
    );
    upsertSetting(db, "openrouter-api-key", "secret");

    const sql = backupDatabaseAsSql();
    expect(sql).toContain("CREATE TABLE");
    expect(sql).toContain("INSERT INTO");
    expect(sql).toContain("Testartikel");

    db.prepare("DELETE FROM watchlist").run();
    expect(
      db.prepare("SELECT COUNT(*) as count FROM watchlist").get() as {
        count: number;
      },
    ).toMatchObject({ count: 0 });

    restoreDatabaseFromSql(sql);

    const restored = getDb();
    const watchlist = restored.prepare("SELECT title FROM watchlist").all() as {
      title: string;
    }[];
    expect(watchlist).toEqual([{ title: "Testartikel" }]);
    expect(
      (
        restored
          .prepare("SELECT value FROM settings WHERE key = ?")
          .get("openrouter-api-key") as { value: string }
      ).value,
    ).toBe("secret");
    expect(existsSync(dbPath)).toBe(true);
  });

  it("rejects invalid sql backups", () => {
    expect(() => validateSqlBackup("")).toThrow("SQL-Datei ist leer");
    expect(() => validateSqlBackup("SELECT 1;")).toThrow(
      "Keine gültige MarketMind-SQL-Sicherung",
    );
  });

  it("recovers with a fresh database when restore fails", () => {
    const dbPath = join(tempDir!, "failed-restore.db");
    process.env.MM_DATABASE_DEV = dbPath;
    initDatabase(dbPath);
    const db = getDb();
    db.prepare("INSERT INTO watchlist (title, status) VALUES (?, ?)").run(
      "Bleibt nicht",
      "aktiv",
    );

    expect(() =>
      restoreDatabaseFromSql("CREATE TABLE broken syntax"),
    ).toThrow();

    const recovered = getDb();
    expect(
      recovered.prepare("SELECT COUNT(*) as count FROM agents").get() as {
        count: number;
      },
    ).toMatchObject({ count: 4 });
    expect(
      recovered.prepare("SELECT COUNT(*) as count FROM watchlist").get() as {
        count: number;
      },
    ).toMatchObject({ count: 0 });
  });
});

function upsertSetting(
  db: ReturnType<typeof getDb>,
  key: string,
  value: string,
): void {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(key, value);
}
