import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initDatabase, resetDb } from "../../server/database/db";
import {
  ensureDatabasePath,
  getActivePath,
  mapDockerDatabasePath,
  resolveDbPath,
} from "../../server/database/paths";

let tempDir: string | null = null;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "marketmind-paths-"));
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

describe("database paths", () => {
  it("maps host paths to the Docker data mount", () => {
    expect(
      mapDockerDatabasePath(
        "/Users/mlp/Nextcloud/Apps/MarketMind/marketmind.db",
      ),
    ).toBe("/app/data/marketmind.db");
    expect(mapDockerDatabasePath("/app/data/marketmind.db")).toBe(
      "/app/data/marketmind.db",
    );
  });

  it("resolves MM_DATABASE_DOCKER host path in Docker runtime", () => {
    process.env.MM_RUNTIME = "docker";
    process.env.MM_DATABASE_DOCKER =
      "/Users/mlp/Nextcloud/Apps/MarketMind/marketmind.db";

    expect(getActivePath()).toBe("/app/data/marketmind.db");
    expect(
      resolveDbPath("/Users/mlp/Nextcloud/Apps/MarketMind/marketmind.db"),
    ).toBe("/app/data/marketmind.db");
  });

  it("keeps host paths unchanged outside Docker", () => {
    const hostPath = join(tempDir!, "cloud", "marketmind.db");
    process.env.MM_DATABASE_DEV = hostPath;

    expect(getActivePath()).toBe(hostPath);
  });

  it("creates parent directory and database file when missing", () => {
    const dbPath = join(tempDir!, "nested", "dir", "marketmind.db");
    expect(existsSync(dbPath)).toBe(false);

    const prepared = ensureDatabasePath(dbPath);
    expect(prepared.path).toBe(dbPath);
    expect(prepared.created).toBe(true);

    initDatabase(dbPath);
    expect(existsSync(dbPath)).toBe(true);
  });
});
