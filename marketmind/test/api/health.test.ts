import { describe, it, expect } from "vitest";
import { createTestDb, expectAllTables } from "../helpers/test-db";
import { getTableNames, initDatabase } from "../../server/database/db";
import { getHealthStatus } from "../../server/services/health";

describe("database", () => {
  it("initializes all required tables", () => {
    const dbPath = createTestDb();
    expectAllTables(dbPath);
    const db = initDatabase(dbPath);
    expect(getTableNames(db).length).toBeGreaterThanOrEqual(10);
  });
});

describe("GET /api/health", () => {
  it("returns ok status with database ready", () => {
    createTestDb();
    const result = getHealthStatus();
    expect(result.status).toBe("ok");
    expect(result.db).toBe(true);
    expect(result.tables).toBeGreaterThanOrEqual(10);
  });
});
