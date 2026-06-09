import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import { runResearch } from "../../server/services/research/run-research";

const fixturesDir = join(__dirname, "../fixtures");

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

  it("saves research with analyses from a prior analyze step", async () => {
    const db = getDb();
    const search = db
      .prepare("INSERT INTO searches (query, platform) VALUES (?, ?)")
      .run("RTX 3060", "ebay");
    const searchId = Number(search.lastInsertRowid);
    db.prepare(
      "INSERT INTO search_results (search_id, title, price, platform, url) VALUES (?, ?, ?, ?, ?)",
    ).run(searchId, "MSI RTX 3060", 250, "ebay", "https://ebay.de/1");

    const result = await runResearch(db, {
      searchId,
      save: true,
      saveName: "RTX mit Analyse",
      analyses: [
        {
          platform: "ebay",
          summary: "## Marktanalyse\nPreise stabil.",
        },
      ],
    });

    expect(result.savedResearchId).toBeDefined();
    const saved = db
      .prepare("SELECT analyses_json FROM saved_researches WHERE id = ?")
      .get(result.savedResearchId) as { analyses_json: string };
    const analyses = JSON.parse(saved.analyses_json) as Array<{
      platform: string;
      summary: string;
    }>;
    expect(analyses).toHaveLength(1);
    expect(analyses[0]?.summary).toContain("Marktanalyse");
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

  it("scrapes fresh results from query and platform", async () => {
    createTestDb();
    const db = getDb();
    const page1 = readFileSync(join(fixturesDir, "ebay/page1.html"), "utf-8");
    const page2 = readFileSync(join(fixturesDir, "ebay/page2.html"), "utf-8");
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      const html =
        callCount === 1
          ? page1
          : callCount === 2
            ? page2
            : '<html><ul class="srp-results"></ul></html>';
      return Promise.resolve({ ok: true, text: async () => html });
    });

    const result = await runResearch(db, {
      query: "rtx 3060",
      platform: "ebay",
      scraperDeps: {
        fetchFn: mockFetch as typeof fetch,
        sleepFn: async () => {},
        randomFn: () => 0,
        skipWarmUp: true,
      },
    });

    expect(result.searchId).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.stats.count).toBe(result.results.length);
  });
});
