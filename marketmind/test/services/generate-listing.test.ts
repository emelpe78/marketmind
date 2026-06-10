import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import { generateListing } from "../../server/services/listings/generate-listing";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn(),
}));

import { chatCompletion } from "../../server/services/openrouter/client";

const mockChatCompletion = vi.mocked(chatCompletion);

describe("generateListing", () => {
  beforeEach(() => {
    mockChatCompletion.mockReset();
    mockChatCompletion.mockResolvedValue({
      content: JSON.stringify({
        title: "GTX 1080 Ti",
        description: "Guter Zustand.",
        priceSuggestion: 200,
        category: "PC",
      }),
      tokensUsed: 50,
      costUsd: 0.001,
      model: "test",
    });
  });
  it("parses listing from agent response", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");

    const result = await generateListing(db, {
      query: "GTX 1080 Ti",
      platform: "kleinanzeigen",
      condition: "gut",
    });

    expect(result.platform).toBe("kleinanzeigen");
    expect(result.title).toBe("GTX 1080 Ti");
    expect(result.priceSuggestion).toBe(200);
  });

  it("includes market stats in prompt when searchId is provided", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");
    const search = db
      .prepare("INSERT INTO searches (query, platform) VALUES (?, ?)")
      .run("GTX 1080 Ti", "ebay");
    const searchId = Number(search.lastInsertRowid);
    db.prepare(
      "INSERT INTO search_results (search_id, title, price, platform, url) VALUES (?, ?, ?, ?, ?)",
    ).run(searchId, "GTX 1080 Ti OC", 220, "ebay", "https://ebay.de/1");

    await generateListing(db, {
      query: "GTX 1080 Ti",
      platform: "ebay",
      condition: "gut",
      searchId,
    });

    const userMessage = mockChatCompletion.mock.calls[0]?.[2]?.[1]
      ?.content as string;
    expect(userMessage).toContain("Marktdaten:");
    expect(userMessage).toContain("220");
  });

  it("includes market stats from saved research snapshot", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");
    const insert = db
      .prepare(
        `INSERT INTO saved_researches
          (title, query, platform, search_id, stats_json, results_json, analyses_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "RTX",
        "RTX 3060",
        "ebay",
        null,
        JSON.stringify({
          min: 100,
          max: 300,
          avg: 200,
          median: 195,
          count: 5,
        }),
        JSON.stringify([]),
        JSON.stringify([]),
      );
    const savedResearchId = Number(insert.lastInsertRowid);

    await generateListing(db, {
      query: "RTX 3060",
      platform: "ebay",
      condition: "gut",
      savedResearchId,
    });

    const userMessage = mockChatCompletion.mock.calls[0]?.[2]?.[1]
      ?.content as string;
    expect(userMessage).toContain("Marktdaten:");
    expect(userMessage).toContain("195");
  });

  it("includes market stats from saved flip analysis snapshot", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");
    const insert = db
      .prepare(
        `INSERT INTO saved_flip_analyses
          (title, listing_url, listing_platform, query, analysis, listing_json, market_stats_json, market_samples_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "Flip",
        "https://ebay.de/1",
        "ebay",
        "GTX 1080",
        "Analyse",
        JSON.stringify({
          platform: "ebay",
          url: "https://ebay.de/1",
          title: "GTX 1080",
          price: 150,
          description: null,
          condition: null,
          location: null,
          category: null,
        }),
        JSON.stringify({
          min: 120,
          max: 220,
          avg: 170,
          median: 165,
          count: 8,
        }),
        JSON.stringify([]),
      );
    const savedFlipAnalysisId = Number(insert.lastInsertRowid);

    await generateListing(db, {
      query: "GTX 1080",
      platform: "ebay",
      condition: "gut",
      savedFlipAnalysisId,
    });

    const userMessage = mockChatCompletion.mock.calls[0]?.[2]?.[1]
      ?.content as string;
    expect(userMessage).toContain("Marktdaten:");
    expect(userMessage).toContain("165");
  });
});
