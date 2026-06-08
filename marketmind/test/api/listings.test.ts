import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";

describe("listings crud", () => {
  it("creates and reads saved listings", () => {
    createTestDb();
    const db = getDb();
    const result = db
      .prepare(
        "INSERT INTO listings (query, platform, title, description, price_suggestion) VALUES (?, ?, ?, ?, ?)",
      )
      .run(
        "GTX 1080 Ti",
        "kleinanzeigen",
        "GTX 1080 Ti",
        "Hallo zusammen, ich verkaufe meine GTX 1080 Ti.",
        200,
      );

    const row = db
      .prepare("SELECT * FROM listings WHERE id = ?")
      .get(result.lastInsertRowid) as {
      title: string;
      description: string;
    };

    expect(row.title).toBe("GTX 1080 Ti");
    expect(row.description).not.toContain("{");
  });
});
