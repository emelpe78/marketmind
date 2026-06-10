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
});
