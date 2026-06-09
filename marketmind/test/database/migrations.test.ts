import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";

describe("database migrations", () => {
  it("uses prompt_library without category column", () => {
    createTestDb();
    const db = getDb();
    const columns = db
      .prepare("PRAGMA table_info(prompt_library)")
      .all() as Array<{ name: string }>;

    expect(columns.some((column) => column.name === "agent_id")).toBe(true);
    expect(columns.some((column) => column.name === "category")).toBe(false);
  });

  it("adds category column to listings", () => {
    createTestDb();
    const db = getDb();
    const columns = db.prepare("PRAGMA table_info(listings)").all() as Array<{
      name: string;
    }>;

    expect(columns.some((column) => column.name === "category")).toBe(true);
  });
});
