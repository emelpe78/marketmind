import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getDb, resetDb } from "../../server/database/db";
import { initDatabase } from "../../server/database/db";
import {
  seedDatabase,
  getSetting,
  setSetting,
} from "../../server/database/seed";
import {
  getDatabaseInfo,
  relocateDatabase,
  resetDatabase,
} from "../../server/services/database/admin";

let tempDir: string | null = null;

function setupDb(path: string) {
  process.env.MM_DATABASE_PATH = path;
  resetDb();
  const db = initDatabase(path);
  seedDatabase(db);
  setSetting(db, "database-path", path);
}

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "marketmind-db-admin-"));
});

afterEach(() => {
  resetDb();
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
  delete process.env.MM_DATABASE_PATH;
});

describe("database admin", () => {
  it("returns current database info", () => {
    const dbPath = join(tempDir!, "main.db");
    setupDb(dbPath);

    const info = getDatabaseInfo();
    expect(info.path).toBe(dbPath);
    expect(info.exists).toBe(true);
  });

  it("copies an existing database to a new path", () => {
    const sourcePath = join(tempDir!, "source.db");
    const targetPath = join(tempDir!, "nested", "target.db");
    setupDb(sourcePath);

    const db = getDb();
    db.prepare("INSERT INTO watchlist (title, status) VALUES (?, ?)").run(
      "GPU",
      "aktiv",
    );

    const result = relocateDatabase(targetPath);

    expect(result.copied).toBe(true);
    expect(result.path).toBe(targetPath);
    expect(existsSync(targetPath)).toBe(true);

    resetDb();
    process.env.MM_DATABASE_PATH = targetPath;
    const copiedDb = getDb();
    const row = copiedDb
      .prepare("SELECT title FROM watchlist WHERE title = ?")
      .get("GPU") as { title: string } | undefined;
    expect(row?.title).toBe("GPU");
    expect(getSetting(copiedDb, "database-path")).toBe(targetPath);
  });

  it("resets the database at the current path", () => {
    const dbPath = join(tempDir!, "reset.db");
    setupDb(dbPath);

    const db = getDb();
    db.prepare("INSERT INTO watchlist (title, status) VALUES (?, ?)").run(
      "Alt",
      "aktiv",
    );
    setSetting(db, "openrouter-api-key", "secret");

    const result = resetDatabase();
    expect(result.path).toBe(dbPath);

    const freshDb = getDb();
    const rows = freshDb.prepare("SELECT * FROM watchlist").all();
    expect(rows).toHaveLength(0);
    expect(getSetting(freshDb, "openrouter-api-key")).toBe("");
    expect(getSetting(freshDb, "database-path")).toBe(dbPath);
    expect(
      freshDb.prepare("SELECT COUNT(*) as count FROM agents").get() as {
        count: number;
      },
    ).toMatchObject({ count: 4 });
  });
});
