import { describe, it, expect, vi } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import { runResearch } from "../../server/services/research/run-research";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn().mockResolvedValue({
    content: "Markt stabil.",
    tokensUsed: 50,
    costUsd: 0.001,
    model: "test",
  }),
}));

describe("runResearch", () => {
  it("analyzes an existing search", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");
    const search = db
      .prepare("INSERT INTO searches (query, platform) VALUES (?, ?)")
      .run("RTX 3060", "ebay");
    const searchId = Number(search.lastInsertRowid);
    db.prepare(
      "INSERT INTO search_results (search_id, title, price, platform, url) VALUES (?, ?, ?, ?, ?)",
    ).run(searchId, "MSI RTX 3060", 250, "ebay", "https://ebay.de/1");

    const result = await runResearch(db, { searchId, analyze: true });

    expect(result.searchId).toBe(searchId);
    expect(result.stats.count).toBe(1);
    expect(result.summaries).toHaveLength(1);
    expect(result.summaries?.[0]?.summary).toContain("Markt stabil");
  });

  it("saves research from existing search", async () => {
    const db = getDb();
    const search = db
      .prepare("INSERT INTO searches (query, platform) VALUES (?, ?)")
      .run("GTX 1080", "kleinanzeigen");
    const searchId = Number(search.lastInsertRowid);
    db.prepare(
      "INSERT INTO search_results (search_id, title, price, platform, url) VALUES (?, ?, ?, ?, ?)",
    ).run(
      searchId,
      "GTX 1080 Ti",
      200,
      "kleinanzeigen",
      "https://kleinanzeigen.de/1",
    );

    const result = await runResearch(db, {
      searchId,
      save: true,
      saveName: "GTX Test",
    });

    expect(result.savedResearchId).toBeDefined();
    const saved = db
      .prepare("SELECT title FROM saved_researches WHERE id = ?")
      .get(result.savedResearchId) as { title: string };
    expect(saved.title).toBe("GTX Test");
  });
});
