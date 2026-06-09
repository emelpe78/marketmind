import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";

describe("default agents seed", () => {
  it("seeds four default agents on init", () => {
    createTestDb();
    const db = getDb();
    const agents = db.prepare("SELECT * FROM agents ORDER BY id").all() as {
      name: string;
      type: string;
    }[];
    expect(agents).toHaveLength(4);
    expect(agents.map((a) => a.type)).toEqual([
      "research",
      "listing",
      "analytics",
      "strategy",
    ]);
    expect(agents.map((a) => a.name)).toEqual([
      "Research Agent",
      "Listing Agent",
      "Flipping Agent",
      "Prompt Agent",
    ]);
  });
});
