import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import { runMigrations } from "../../server/database/migrations";
import { getAgentByType } from "../../server/services/agents/repository";

describe("agent renames migration", () => {
  it("renames analytics and strategy agents on existing databases", () => {
    createTestDb();
    const db = getDb();
    db.prepare("UPDATE agents SET name = ? WHERE type = ?").run(
      "Analytics Agent",
      "analytics",
    );
    db.prepare("UPDATE agents SET name = ? WHERE type = ?").run(
      "Strategy Agent",
      "strategy",
    );

    runMigrations(db);

    expect(getAgentByType(db, "analytics").name).toBe("Flipping Agent");
    expect(getAgentByType(db, "strategy").name).toBe("Prompt Agent");
  });
});
