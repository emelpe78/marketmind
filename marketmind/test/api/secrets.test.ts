import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getDb, resetDb } from "../../server/database/db";
import { initDatabase } from "../../server/database/db";
import {
  decodeSecret,
  encodeSecret,
} from "../../server/services/settings/secrets";
import { getSetting, setSetting } from "../../server/database/settings";

let tempDir: string | null = null;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "marketmind-secrets-"));
  process.env.MM_DATABASE_PATH = join(tempDir, "test.db");
  resetDb();
  initDatabase(process.env.MM_DATABASE_PATH);
});

afterEach(() => {
  resetDb();
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
  delete process.env.MM_DATABASE_PATH;
});

describe("settings secrets", () => {
  it("roundtrips encoded api keys", () => {
    const encoded = encodeSecret("sk-or-test-key");
    expect(encoded).toMatch(/^enc:v1:/);
    expect(decodeSecret(encoded)).toBe("sk-or-test-key");
  });

  it("stores api keys encoded in settings", () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-or-secret");
    const raw = db
      .prepare("SELECT value FROM settings WHERE key = ?")
      .get("openrouter-api-key") as { value: string };
    expect(raw.value).toMatch(/^enc:v1:/);
    expect(getSetting(db, "openrouter-api-key")).toBe("sk-or-secret");
  });
});
