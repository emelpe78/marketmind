import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getDb, resetDb } from "../../server/database/db";
import { initDatabase } from "../../server/database/db";
import { seedDatabase } from "../../server/database/seed";
import { getSetting, setSetting } from "../../server/database/settings";
import {
  getDatabaseInfo,
  resetDatabase,
} from "../../server/database/lifecycle";
import {
  getEnvDatabasePath,
  isDockerRuntime,
} from "../../server/database/paths";

let tempDir: string | null = null;

function setupDb(path: string) {
  delete process.env.MM_RUNTIME;
  process.env.MM_DATABASE_DEV = path;
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
  delete process.env.MM_DATABASE_DEV;
  delete process.env.MM_DATABASE_DOCKER;
  delete process.env.MM_RUNTIME;
});

describe("database admin", () => {
  it("returns current database info from MM_DATABASE_DEV", () => {
    const dbPath = join(tempDir!, "main.db");
    setupDb(dbPath);

    const info = getDatabaseInfo();
    expect(info.path).toBe(dbPath);
    expect(info.exists).toBe(true);
  });

  it("uses MM_DATABASE_DOCKER when MM_RUNTIME is docker", () => {
    const dockerPath = join(tempDir!, "docker.db");
    process.env.MM_RUNTIME = "docker";
    process.env.MM_DATABASE_DOCKER = dockerPath;
    resetDb();
    initDatabase(dockerPath);

    expect(isDockerRuntime()).toBe(true);
    expect(getEnvDatabasePath()).toBe(dockerPath);
    expect(getDatabaseInfo().path).toBe(dockerPath);
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
