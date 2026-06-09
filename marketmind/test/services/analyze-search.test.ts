import { describe, expect, it, vi, beforeEach } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import {
  platformsForSearch,
  analyzeSearchByPlatform,
} from "../../server/services/research/analyze-search";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn(),
}));

import { chatCompletion } from "../../server/services/openrouter/client";

const mockChatCompletion = vi.mocked(chatCompletion);

describe("analyze-search", () => {
  beforeEach(() => {
    mockChatCompletion.mockReset();
  });

  it("requests both platforms when search is both", () => {
    expect(platformsForSearch("both")).toEqual(["ebay", "kleinanzeigen"]);
  });

  it("requests single platform otherwise", () => {
    expect(platformsForSearch("ebay")).toEqual(["ebay"]);
    expect(platformsForSearch("kleinanzeigen")).toEqual(["kleinanzeigen"]);
  });

  it("analyzes search results per platform and logs history", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");
    const search = db
      .prepare("INSERT INTO searches (query, platform) VALUES (?, ?)")
      .run("RTX 3060", "both");
    const searchId = Number(search.lastInsertRowid);
    db.prepare(
      "INSERT INTO search_results (search_id, title, price, platform, url) VALUES (?, ?, ?, ?, ?)",
    ).run(searchId, "MSI RTX 3060", 250, "ebay", "https://ebay.de/item/1");
    db.prepare(
      "INSERT INTO search_results (search_id, title, price, platform, url) VALUES (?, ?, ?, ?, ?)",
    ).run(
      searchId,
      "RTX 3060 gebraucht",
      200,
      "kleinanzeigen",
      "https://kleinanzeigen.de/item/1",
    );

    mockChatCompletion.mockResolvedValue({
      content: "Preise stabil auf beiden Plattformen.",
      tokensUsed: 100,
      costUsd: 0.001,
      model: "test-model",
    });

    const { summaries, tokensUsed } = await analyzeSearchByPlatform(
      db,
      searchId,
      { query: "RTX 3060", platform: "both" },
    );

    expect(summaries).toHaveLength(2);
    expect(summaries[0]?.platform).toBe("ebay");
    expect(summaries[1]?.platform).toBe("kleinanzeigen");
    expect(tokensUsed).toBe(200);
    expect(mockChatCompletion).toHaveBeenCalledTimes(2);

    const firstCall = mockChatCompletion.mock.calls[0];
    expect(firstCall?.[2]?.[1]?.content).toContain("RTX 3060");
    expect(firstCall?.[2]?.[1]?.content).toContain("eBay.de");

    const history = db.prepare("SELECT * FROM agent_history").all();
    expect(history).toHaveLength(2);
  });
});
